// ========================================
// WEDDING INVITATION - DENO SERVER
// Main entry point for Deno Deploy
// ========================================

import { serveDir } from "@std/http/file-server";

// Import API handlers
import { handleMessagesAPI } from "./api/messages.ts";
import { handleGuestsAPI } from "./api/guests.ts";
import { handleAuthAPI } from "./api/auth.ts";
import { 
  applySecurityHeaders, 
  handleCORS, 
  rateLimit,
  validateTenant 
} from "./api/middleware.ts";

// Initialize Deno KV
const kv = await Deno.openKv();

// Server configuration
const PORT = Deno.env.get("PORT") || "8000";

// ========================================
// REQUEST HANDLER
// ========================================
async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname;

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return handleCORS(req);
  }

  // Rate limiting check
  const clientIP = req.headers.get("x-forwarded-for") || "unknown";
  const rateLimitResult = await rateLimit(kv, clientIP);
  if (!rateLimitResult.allowed) {
    return new Response(JSON.stringify({ error: "Too many requests" }), {
      status: 429,
      headers: { "Content-Type": "application/json", "Retry-After": "60" }
    });
  }

  // ========================================
  // API ROUTES
  // ========================================
  if (path.startsWith("/api/")) {
    const apiPath = path.slice(5); // Remove "/api/"
    const parts = apiPath.split("/").filter(p => p);
    
    // Validate tenant (groom/bride)
    const tenant = parts[0];
    if (!validateTenant(tenant)) {
      return new Response(JSON.stringify({ error: "Invalid tenant" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const resource = parts[1];
    const resourceId = parts[2];
    const action = parts[3];

    let response: Response;

    try {
      switch (resource) {
        case "messages":
          response = await handleMessagesAPI(req, kv, tenant, resourceId, action);
          break;
        case "guests":
          response = await handleGuestsAPI(req, kv, tenant, resourceId);
          break;
        case "auth":
          response = await handleAuthAPI(req, kv, tenant, resourceId);
          break;
        default:
          response = new Response(JSON.stringify({ error: "Not found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" }
          });
      }
    } catch (error) {
      console.error("API Error:", error);
      response = new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    return applySecurityHeaders(response);
  }

  // ========================================
  // STATIC FILES - BRIDE (undangan/)
  // ========================================
  if (path.startsWith("/undangan")) {
    try {
      return await serveDir(req, {
        fsRoot: "./static",
        urlRoot: "",
        showDirListing: false,
        quiet: true,
      });
    } catch {
      // Fallback to index.html for SPA routing
      const file = await Deno.readFile("./static/undangan/index.html");
      return new Response(file, {
        headers: { "Content-Type": "text/html" }
      });
    }
  }

  // ========================================
  // STATIC FILES - GROOM (root)
  // ========================================
  try {
    const response = await serveDir(req, {
      fsRoot: "./static",
      urlRoot: "",
      showDirListing: false,
      quiet: true,
    });
    return applySecurityHeaders(response);
  } catch {
    // Fallback to index.html for SPA routing
    try {
      const file = await Deno.readFile("./static/index.html");
      return applySecurityHeaders(new Response(file, {
        headers: { "Content-Type": "text/html" }
      }));
    } catch {
      return new Response("Not Found", { status: 404 });
    }
  }
}

// ========================================
// START SERVER
// ========================================
console.log(`🚀 Wedding Invitation Server running on http://localhost:${PORT}`);
console.log(`📍 Groom's invitation: http://localhost:${PORT}/`);
console.log(`📍 Bride's invitation: http://localhost:${PORT}/undangan/`);

Deno.serve({ port: Number(PORT) }, handler);
