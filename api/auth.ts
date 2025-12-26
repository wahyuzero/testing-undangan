// ========================================
// AUTHENTICATION API
// Login, logout, and admin management
// ========================================

import { 
  hashPassword, 
  verifyPassword, 
  generateJWT,
  sanitizeInput 
} from "./middleware.ts";

// Default admin passwords (will be hashed on first use)
const DEFAULT_PASSWORDS: Record<string, string> = {
  groom: "@KukuhAdmin2026",
  bride: "@FitrianiAdmin2026",
};

// ========================================
// AUTH HANDLER
// ========================================
export async function handleAuthAPI(
  req: Request,
  kv: Deno.Kv,
  tenant: string,
  action?: string
): Promise<Response> {
  const method = req.method;

  switch (action) {
    case "login":
      if (method === "POST") return await handleLogin(req, kv, tenant);
      break;
    case "logout":
      if (method === "POST") return handleLogout();
      break;
    case "change-password":
      if (method === "POST") return await handleChangePassword(req, kv, tenant);
      break;
    case "check":
      if (method === "GET") return await handleCheckAuth(req, kv, tenant);
      break;
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json" },
  });
}

// ========================================
// LOGIN
// ========================================
async function handleLogin(
  req: Request,
  kv: Deno.Kv,
  tenant: string
): Promise<Response> {
  try {
    const body = await req.json();
    const password = sanitizeInput(body.password || "");

    if (!password) {
      return new Response(JSON.stringify({ error: "Password required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get stored password hash or create default
    const adminKey = [tenant, "admin", "password"];
    const storedHash = await kv.get<string>(adminKey);

    let isValid = false;

    if (!storedHash.value) {
      // First login - check against default and store hash
      const defaultPassword = DEFAULT_PASSWORDS[tenant];
      if (password === defaultPassword) {
        const hash = await hashPassword(password);
        await kv.set(adminKey, hash);
        isValid = true;
      }
    } else {
      // Verify against stored hash
      isValid = await verifyPassword(password, storedHash.value);
    }

    if (!isValid) {
      // Log failed attempt
      const failKey = [tenant, "admin", "failed_attempts"];
      const attempts = await kv.get<number>(failKey);
      await kv.set(failKey, (attempts.value || 0) + 1, { expireIn: 3600000 }); // 1 hour

      return new Response(JSON.stringify({ error: "Invalid password" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Generate JWT token
    const token = await generateJWT({
      tenant,
      role: "admin",
      loginAt: Date.now(),
    });

    // Clear failed attempts
    await kv.delete([tenant, "admin", "failed_attempts"]);

    return new Response(JSON.stringify({ 
      success: true, 
      token,
      tenant,
      message: "Login successful" 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Login error:", error);
    return new Response(JSON.stringify({ error: "Login failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// ========================================
// LOGOUT
// ========================================
function handleLogout(): Response {
  return new Response(JSON.stringify({ 
    success: true, 
    message: "Logged out successfully" 
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

// ========================================
// CHANGE PASSWORD
// ========================================
async function handleChangePassword(
  req: Request,
  kv: Deno.Kv,
  tenant: string
): Promise<Response> {
  try {
    // Verify current auth (from Authorization header)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const currentPassword = sanitizeInput(body.currentPassword || "");
    const newPassword = sanitizeInput(body.newPassword || "");

    if (!currentPassword || !newPassword) {
      return new Response(JSON.stringify({ error: "Both passwords required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (newPassword.length < 8) {
      return new Response(JSON.stringify({ error: "Password must be at least 8 characters" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Verify current password
    const adminKey = [tenant, "admin", "password"];
    const storedHash = await kv.get<string>(adminKey);

    if (!storedHash.value) {
      // Check against default
      const defaultPassword = DEFAULT_PASSWORDS[tenant];
      if (currentPassword !== defaultPassword) {
        return new Response(JSON.stringify({ error: "Current password incorrect" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
    } else {
      const isValid = await verifyPassword(currentPassword, storedHash.value);
      if (!isValid) {
        return new Response(JSON.stringify({ error: "Current password incorrect" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // Hash and store new password
    const newHash = await hashPassword(newPassword);
    await kv.set(adminKey, newHash);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Password changed successfully" 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Change password error:", error);
    return new Response(JSON.stringify({ error: "Failed to change password" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// ========================================
// CHECK AUTH STATUS
// ========================================
async function handleCheckAuth(
  req: Request,
  _kv: Deno.Kv,
  tenant: string
): Promise<Response> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ authenticated: false }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Import verifyJWT dynamically to avoid circular dependency
  const { verifyJWT } = await import("./middleware.ts");
  const token = authHeader.slice(7);
  const payload = await verifyJWT(token);

  if (!payload || payload.tenant !== tenant) {
    return new Response(JSON.stringify({ authenticated: false }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ 
    authenticated: true,
    tenant: payload.tenant,
    role: payload.role 
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
