import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const SHOW_COMMENTS = true;

export const list = query({
  args: { chatId: v.id("chats"), type: v.union(v.literal("normal"), v.literal("pdf"))},
  handler: async (ctx, args) => {
    // const identity = await ctx.auth.getUserIdentity();
    // if (!identity) {
    //   throw new Error("Not authenticated");
    // }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat_type", q => q.eq("chatId", args.chatId).eq("type",args.type))
      .order("asc")
      .collect();

    if (SHOW_COMMENTS) {
      console.log("📜 Retrieved messages:", {
        chatId: args.chatId,
        count: messages.length,
      });
    }

    return messages;
  },
});

export const send = mutation({
  args: {
    chatId: v.id("chats"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    if (SHOW_COMMENTS) {
      console.log("📤 Sending message:", {
        chatId: args.chatId,
        content: args.content,
      });
    }

    // const identity = await ctx.auth.getUserIdentity();
    // if (!identity) {
    //   throw new Error("Not authenticated");
    // }

    // const chat = await ctx.db.get(args.chatId);
    // if (!chat || chat.userId !== identity.subject) {
    //   throw new Error("Unauthorized");
    // }

    // Save the user message with preserved newlines
    const messageId = await ctx.db.insert("messages", {
      chatId: args.chatId,
      content: args.content.replace(/\n/g, "\\n"),
      role: "user",
      type:"normal",
      createdAt: Date.now(),
    });

    if (SHOW_COMMENTS) {
      console.log("✅ Saved user message:", {
        messageId,
        chatId: args.chatId,
      });
    }

    return messageId;
  },
});

export const sendforpdf = mutation({
  args: {
    chatId: v.id("chats"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    if (SHOW_COMMENTS) {
      console.log("📤 Sending message:", {
        chatId: args.chatId,
        content: args.content,
      });
    }

    // const identity = await ctx.auth.getUserIdentity();
    // if (!identity) {
    //   throw new Error("Not authenticated");
    // }

    // const chat = await ctx.db.get(args.chatId);
    // if (!chat || chat.userId !== identity.subject) {
    //   throw new Error("Unauthorized");
    // }

    // Save the user message with preserved newlines
    const messageId = await ctx.db.insert("messages", {
      chatId: args.chatId,
      content: args.content.replace(/\n/g, "\\n"),
      role: "user",
      type:"pdf",
      createdAt: Date.now(),
    });

    if (SHOW_COMMENTS) {
      console.log("✅ Saved user message:", {
        messageId,
        chatId: args.chatId,
      });
    }

    return messageId;
  },
});


export const response = mutation({
  args: {
    chatId: v.id("chats"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    if (SHOW_COMMENTS) {
      console.log("🤖 Responding as agent:", {
        chatId: args.chatId,
        content: args.content,
      });
    }

    // Optional: Uncomment to secure access to user's own chats
    // const identity = await ctx.auth.getUserIdentity();
    // if (!identity) {
    //   throw new Error("Not authenticated");
    // }

    // const chat = await ctx.db.get(args.chatId);
    // if (!chat || chat.userId !== identity.subject) {
    //   throw new Error("Unauthorized");
    // }

    const messageId = await ctx.db.insert("messages", {
      chatId: args.chatId,
      content: args.content.replace(/\n/g, "\\n"),
      role: "assistant",
      type:"normal",
      createdAt: Date.now(),
    });

    if (SHOW_COMMENTS) {
      console.log("✅ Agent response saved:", {
        messageId,
        chatId: args.chatId,
      });
    }

    return messageId;
  },
});

export const responseforpdf = mutation({
  args: {
    chatId: v.id("chats"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    if (SHOW_COMMENTS) {
      console.log("🤖 Responding as agent:", {
        chatId: args.chatId,
        content: args.content,
      });
    }

    // Optional: Uncomment to secure access to user's own chats
    // const identity = await ctx.auth.getUserIdentity();
    // if (!identity) {
    //   throw new Error("Not authenticated");
    // }

    // const chat = await ctx.db.get(args.chatId);
    // if (!chat || chat.userId !== identity.subject) {
    //   throw new Error("Unauthorized");
    // }

    const messageId = await ctx.db.insert("messages", {
      chatId: args.chatId,
      content: args.content.replace(/\n/g, "\\n"),
      role: "assistant",
      type:"pdf",
      createdAt: Date.now(),
    });

    if (SHOW_COMMENTS) {
      console.log("✅ Agent response saved:", {
        messageId,
        chatId: args.chatId,
      });
    }

    return messageId;
  },
});

// export const getLastMessage = query({
//   args: { chatId: v.id("chats") },
//   handler: async (ctx, args) => {
//     const identity = await ctx.auth.getUserIdentity();
//     if (!identity) {
//       throw new Error("Not authenticated");
//     }

//     const chat = await ctx.db.get(args.chatId);
//     if (!chat || chat.userId !== identity.subject) {
//       throw new Error("Unauthorized");
//     }

//     const messages = await ctx.db
//       .query("messages")
//       .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
//       .order("desc")
//       .first();

//     return messages;
//   },
// });