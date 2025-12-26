// ========================================
// GUESTS API
// Guest list management (invited guests)
// ========================================

import { sanitizeObject, requireAuth } from "./middleware.ts";

// Guest interfaces
interface InvitedGuest {
  id: number;
  name: string;
  slug: string;
  category: string;
  phone?: string;
  createdAt: string;
}

interface SpecialGuest {
  id: number;
  name: string;
  slug: string;
  role?: string;
  avatar?: string;
  instagram?: string;
  twitter?: string;
  invitationLink?: string;
  createdAt: string;
}

// ========================================
// GUESTS HANDLER
// ========================================
export async function handleGuestsAPI(
  req: Request,
  kv: Deno.Kv,
  tenant: string,
  guestId?: string
): Promise<Response> {
  const method = req.method;
  const url = new URL(req.url);
  const type = url.searchParams.get("type") || "invited"; // invited or special

  switch (method) {
    case "GET":
      return await getGuests(kv, tenant, type);
    case "POST":
      return await createGuest(req, kv, tenant, type);
    case "PUT":
      if (guestId) return await updateGuest(req, kv, tenant, type, guestId);
      break;
    case "DELETE":
      if (guestId) return await deleteGuest(req, kv, tenant, type, guestId);
      break;
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json" },
  });
}

// ========================================
// GET ALL GUESTS
// ========================================
async function getGuests(
  kv: Deno.Kv,
  tenant: string,
  type: string
): Promise<Response> {
  try {
    const guests: (InvitedGuest | SpecialGuest)[] = [];
    const prefix = [tenant, "guests", type];
    
    for await (const entry of kv.list<InvitedGuest | SpecialGuest>({ prefix })) {
      guests.push(entry.value);
    }

    // Sort by createdAt descending
    guests.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const responseKey = type === "special" ? "specialGuests" : "invitedGuests";
    
    return new Response(JSON.stringify({ 
      success: true,
      [responseKey]: guests,
      invitedGuests: type === "invited" ? guests : [],
      specialGuests: type === "special" ? guests : [],
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Get guests error:", error);
    return new Response(JSON.stringify({ error: "Failed to get guests" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// ========================================
// CREATE GUEST (Auth required)
// ========================================
async function createGuest(
  req: Request,
  kv: Deno.Kv,
  tenant: string,
  type: string
): Promise<Response> {
  // Require authentication
  const auth = await requireAuth(req, kv, tenant);
  if (!auth.authorized) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const sanitized = sanitizeObject(body);
    
    if (!sanitized.name) {
      return new Response(JSON.stringify({ error: "Name required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const id = (sanitized.id as number) || Date.now();
    const slug = generateSlug(sanitized.name as string);

    let guest: InvitedGuest | SpecialGuest;
    
    if (type === "special") {
      // Save all special guest fields including avatar
      guest = {
        id,
        name: sanitized.name as string,
        slug,
        role: (sanitized.role as string) || "VIP",
        avatar: (sanitized.avatar as string) || "",
        instagram: (sanitized.instagram as string) || "",
        twitter: (sanitized.twitter as string) || "",
        invitationLink: (sanitized.invitationLink as string) || "",
        createdAt: (sanitized.createdAt as string) || new Date().toISOString(),
      };
    } else {
      // Invited guest
      guest = {
        id,
        name: sanitized.name as string,
        slug,
        category: (sanitized.category as string) || "Tamu Undangan",
        phone: (sanitized.phone as string) || "",
        createdAt: (sanitized.createdAt as string) || new Date().toISOString(),
      };
    }

    await kv.set([tenant, "guests", type, id], guest);

    return new Response(JSON.stringify({ 
      success: true,
      data: guest 
    }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Create guest error:", error);
    return new Response(JSON.stringify({ error: "Failed to create guest" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// ========================================
// UPDATE GUEST (Auth required)
// ========================================
async function updateGuest(
  req: Request,
  kv: Deno.Kv,
  tenant: string,
  type: string,
  guestId: string
): Promise<Response> {
  // Require authentication
  const auth = await requireAuth(req, kv, tenant);
  if (!auth.authorized) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const id = parseInt(guestId);
    if (isNaN(id)) {
      return new Response(JSON.stringify({ error: "Invalid guest ID" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const key = [tenant, "guests", type, id];
    const existing = await kv.get<InvitedGuest | SpecialGuest>(key);
    
    if (!existing.value) {
      return new Response(JSON.stringify({ error: "Guest not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const sanitized = sanitizeObject(body);

    const updated = {
      ...existing.value,
      ...sanitized,
      id, // Keep original ID
      createdAt: existing.value.createdAt, // Keep original createdAt
    };

    // Update slug if name changed
    if (sanitized.name) {
      updated.slug = generateSlug(sanitized.name as string);
    }

    await kv.set(key, updated);

    return new Response(JSON.stringify({ 
      success: true,
      data: updated 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Update guest error:", error);
    return new Response(JSON.stringify({ error: "Failed to update guest" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// ========================================
// DELETE GUEST (Auth required)
// ========================================
async function deleteGuest(
  req: Request,
  kv: Deno.Kv,
  tenant: string,
  type: string,
  guestId: string
): Promise<Response> {
  // Require authentication
  const auth = await requireAuth(req, kv, tenant);
  if (!auth.authorized) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const id = parseInt(guestId);
    if (isNaN(id)) {
      return new Response(JSON.stringify({ error: "Invalid guest ID" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const key = [tenant, "guests", type, id];
    const existing = await kv.get(key);
    
    if (!existing.value) {
      return new Response(JSON.stringify({ error: "Guest not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    await kv.delete(key);

    return new Response(JSON.stringify({ 
      success: true,
      message: "Guest deleted" 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Delete guest error:", error);
    return new Response(JSON.stringify({ error: "Failed to delete guest" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// ========================================
// UTILITIES
// ========================================
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}
