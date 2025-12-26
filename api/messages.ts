// ========================================
// MESSAGES API
// RSVP messages, reactions, replies
// ========================================

import { sanitizeObject, requireAuth } from "./middleware.ts";

// Message interface
interface Message {
  id: number;
  name: string;
  message: string;
  attendance: "hadir" | "tidak" | "ragu";
  guestCount: number;
  timestamp: string;
  reactions: {
    love: number;
    aamiin: number;
    congrats: number;
  };
  replies: Array<{
    id: number;
    name: string;
    message: string;
    role: string;
    photo: string;
    timestamp: string;
  }>;
}

// ========================================
// MESSAGES HANDLER
// ========================================
export async function handleMessagesAPI(
  req: Request,
  kv: Deno.Kv,
  tenant: string,
  messageId?: string,
  action?: string
): Promise<Response> {
  const method = req.method;

  // Handle specific actions
  if (messageId && action) {
    switch (action) {
      case "reaction":
        if (method === "POST") return await addReaction(req, kv, tenant, messageId);
        break;
      case "reply":
        if (method === "POST") return await addReply(req, kv, tenant, messageId);
        break;
    }
  }

  // Handle CRUD
  switch (method) {
    case "GET":
      return await getMessages(kv, tenant);
    case "POST":
      return await createMessage(req, kv, tenant);
    case "DELETE":
      if (messageId) return await deleteMessage(req, kv, tenant, messageId);
      break;
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json" },
  });
}

// ========================================
// GET ALL MESSAGES
// ========================================
async function getMessages(kv: Deno.Kv, tenant: string): Promise<Response> {
  try {
    const messages: Message[] = [];
    const prefix = [tenant, "messages"];
    
    for await (const entry of kv.list<Message>({ prefix })) {
      messages.push(entry.value);
    }

    // Sort by timestamp descending (newest first)
    messages.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return new Response(JSON.stringify({ 
      success: true,
      guests: messages 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Get messages error:", error);
    return new Response(JSON.stringify({ error: "Failed to get messages" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// ========================================
// CREATE MESSAGE (Anti-spam included)
// ========================================
async function createMessage(
  req: Request,
  kv: Deno.Kv,
  tenant: string
): Promise<Response> {
  try {
    const body = await req.json();
    
    // Sanitize input
    const sanitized = sanitizeObject(body);
    
    // Validate required fields
    if (!sanitized.name || !sanitized.attendance) {
      return new Response(JSON.stringify({ error: "Name and attendance required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Anti-spam check (same name within 1 minute)
    const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
    const prefix = [tenant, "messages"];
    
    for await (const entry of kv.list<Message>({ prefix })) {
      if (
        entry.value.name.toLowerCase() === sanitized.name.toLowerCase() &&
        entry.value.timestamp > oneMinuteAgo
      ) {
        return new Response(JSON.stringify({ 
          error: "Spam detected",
          message: "Please wait before submitting again" 
        }), {
          status: 429,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // Create message
    const id = Date.now();
    const message: Message = {
      id,
      name: sanitized.name as string,
      message: (sanitized.message as string) || "",
      attendance: sanitized.attendance as "hadir" | "tidak" | "ragu",
      guestCount: Math.min(Math.max(1, Number(sanitized.guestCount) || 1), 10),
      timestamp: new Date().toISOString(),
      reactions: { love: 0, aamiin: 0, congrats: 0 },
      replies: [],
    };

    // Save to KV
    await kv.set([tenant, "messages", id], message);

    return new Response(JSON.stringify({ 
      success: true,
      data: message 
    }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Create message error:", error);
    return new Response(JSON.stringify({ error: "Failed to create message" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// ========================================
// DELETE MESSAGE (Auth required)
// ========================================
async function deleteMessage(
  req: Request,
  kv: Deno.Kv,
  tenant: string,
  messageId: string
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
    const id = parseInt(messageId);
    if (isNaN(id)) {
      return new Response(JSON.stringify({ error: "Invalid message ID" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if exists
    const key = [tenant, "messages", id];
    const existing = await kv.get(key);
    
    if (!existing.value) {
      return new Response(JSON.stringify({ error: "Message not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Delete
    await kv.delete(key);

    return new Response(JSON.stringify({ 
      success: true,
      message: "Message deleted" 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Delete message error:", error);
    return new Response(JSON.stringify({ error: "Failed to delete message" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// ========================================
// ADD REACTION
// ========================================
async function addReaction(
  req: Request,
  kv: Deno.Kv,
  tenant: string,
  messageId: string
): Promise<Response> {
  try {
    const body = await req.json();
    const type = body.type as "love" | "aamiin" | "congrats";
    
    if (!["love", "aamiin", "congrats"].includes(type)) {
      return new Response(JSON.stringify({ error: "Invalid reaction type" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const id = parseInt(messageId);
    const key = [tenant, "messages", id];
    const existing = await kv.get<Message>(key);
    
    if (!existing.value) {
      return new Response(JSON.stringify({ error: "Message not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Update reactions
    const message = existing.value;
    if (!message.reactions) {
      message.reactions = { love: 0, aamiin: 0, congrats: 0 };
    }
    message.reactions[type]++;

    await kv.set(key, message);

    return new Response(JSON.stringify({ 
      success: true,
      reactions: message.reactions 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Add reaction error:", error);
    return new Response(JSON.stringify({ error: "Failed to add reaction" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// ========================================
// ADD REPLY (Auth required for admin reply)
// ========================================
async function addReply(
  req: Request,
  kv: Deno.Kv,
  tenant: string,
  messageId: string
): Promise<Response> {
  try {
    const body = await req.json();
    const sanitized = sanitizeObject(body);

    if (!sanitized.name || !sanitized.message) {
      return new Response(JSON.stringify({ error: "Name and message required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const id = parseInt(messageId);
    const key = [tenant, "messages", id];
    const existing = await kv.get<Message>(key);
    
    if (!existing.value) {
      return new Response(JSON.stringify({ error: "Message not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Add reply
    const message = existing.value;
    if (!message.replies) {
      message.replies = [];
    }

    message.replies.push({
      id: Date.now(),
      name: sanitized.name as string,
      message: sanitized.message as string,
      role: (sanitized.role as string) || "guest",
      photo: (sanitized.photo as string) || "",
      timestamp: new Date().toISOString(),
    });

    await kv.set(key, message);

    return new Response(JSON.stringify({ 
      success: true,
      replies: message.replies 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Add reply error:", error);
    return new Response(JSON.stringify({ error: "Failed to add reply" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
