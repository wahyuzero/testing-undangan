// ========================================
// SECURITY MIDDLEWARE
// Rate limiting, CORS, headers, validation
// ========================================

// Valid tenants
const VALID_TENANTS = ["groom", "bride"];

// ========================================
// RATE LIMITING
// ========================================
interface RateLimitResult {
  allowed: boolean;
  remaining: number;
}

export async function rateLimit(
  kv: Deno.Kv, 
  clientIP: string, 
  limit = 60, 
  windowMs = 60000
): Promise<RateLimitResult> {
  const key = ["ratelimit", clientIP];
  const now = Date.now();
  
  const result = await kv.get<{ count: number; resetAt: number }>(key);
  
  if (!result.value || now > result.value.resetAt) {
    // New window
    await kv.set(key, { count: 1, resetAt: now + windowMs }, { expireIn: windowMs });
    return { allowed: true, remaining: limit - 1 };
  }
  
  if (result.value.count >= limit) {
    return { allowed: false, remaining: 0 };
  }
  
  // Increment count
  await kv.set(key, { 
    count: result.value.count + 1, 
    resetAt: result.value.resetAt 
  }, { expireIn: result.value.resetAt - now });
  
  return { allowed: true, remaining: limit - result.value.count - 1 };
}

// ========================================
// CORS HANDLER
// ========================================
export function handleCORS(_req: Request): Response {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}

// ========================================
// SECURITY HEADERS
// ========================================
export function applySecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  
  // Security headers
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("X-XSS-Protection", "1; mode=block");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  
  // CSP - Content Security Policy
  headers.set("Content-Security-Policy", [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://maps.googleapis.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com",
    "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com data:",
    "img-src 'self' data: https: blob: *",
    "connect-src 'self' https://maps.googleapis.com",
    "frame-src https://www.google.com https://maps.google.com https://*.google.com",
    "frame-ancestors 'none'",
  ].join("; "));
  
  // CORS for API
  headers.set("Access-Control-Allow-Origin", "*");
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

// ========================================
// TENANT VALIDATION
// ========================================
export function validateTenant(tenant: string): boolean {
  return VALID_TENANTS.includes(tenant);
}

// ========================================
// INPUT SANITIZATION
// ========================================
export function sanitizeInput(input: string): string {
  if (typeof input !== "string") return "";
  
  return input
    .replace(/[<>]/g, "") // Remove angle brackets
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers
    .trim()
    .slice(0, 1000); // Limit length
}

export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === "number") {
      sanitized[key] = value;
    } else if (typeof value === "boolean") {
      sanitized[key] = value;
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(v => 
        typeof v === "string" ? sanitizeInput(v) : v
      );
    } else if (value && typeof value === "object") {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    }
  }
  
  return sanitized as T;
}

// ========================================
// JWT UTILITIES
// ========================================
const JWT_SECRET = Deno.env.get("JWT_SECRET") || "wedding-invitation-secret-key-change-in-production";
const JWT_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export async function generateJWT(payload: Record<string, unknown>): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Date.now();
  
  const fullPayload = {
    ...payload,
    iat: now,
    exp: now + JWT_EXPIRY,
  };
  
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(fullPayload));
  
  const signature = await signJWT(`${encodedHeader}.${encodedPayload}`);
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export async function verifyJWT(token: string): Promise<Record<string, unknown> | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    
    const [header, payload, signature] = parts;
    
    // Verify signature
    const expectedSignature = await signJWT(`${header}.${payload}`);
    if (signature !== expectedSignature) return null;
    
    // Decode payload
    const decodedPayload = JSON.parse(atob(payload));
    
    // Check expiry
    if (decodedPayload.exp && Date.now() > decodedPayload.exp) {
      return null;
    }
    
    return decodedPayload;
  } catch {
    return null;
  }
}

async function signJWT(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(JWT_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(data)
  );
  
  return btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

// ========================================
// PASSWORD HASHING (Simple PBKDF2)
// ========================================
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  
  const hash = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    key,
    256
  );
  
  const hashArray = new Uint8Array(hash);
  const combined = new Uint8Array(salt.length + hashArray.length);
  combined.set(salt);
  combined.set(hashArray, salt.length);
  
  return btoa(String.fromCharCode(...combined));
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    const combined = Uint8Array.from(atob(storedHash), c => c.charCodeAt(0));
    const salt = combined.slice(0, 16);
    const storedHashBytes = combined.slice(16);
    
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      "PBKDF2",
      false,
      ["deriveBits"]
    );
    
    const hash = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      key,
      256
    );
    
    const hashArray = new Uint8Array(hash);
    
    // Constant-time comparison
    if (hashArray.length !== storedHashBytes.length) return false;
    let diff = 0;
    for (let i = 0; i < hashArray.length; i++) {
      diff |= hashArray[i] ^ storedHashBytes[i];
    }
    return diff === 0;
  } catch {
    return false;
  }
}

// ========================================
// AUTH MIDDLEWARE
// ========================================
export async function requireAuth(
  req: Request, 
  kv: Deno.Kv, 
  tenant: string
): Promise<{ authorized: boolean; admin?: Record<string, unknown> }> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { authorized: false };
  }
  
  const token = authHeader.slice(7);
  const payload = await verifyJWT(token);
  
  if (!payload || payload.tenant !== tenant) {
    return { authorized: false };
  }
  
  return { authorized: true, admin: payload };
}
