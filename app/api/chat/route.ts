import { z } from "zod";
import { streamText, createTextStreamResponse } from "ai";
import { createGoogle } from "@ai-sdk/google";
import { SYSTEM_PROMPT } from "@/lib/ai/system-prompt";
import { checkRateLimit } from "@/lib/ai/rate-limit";

export const maxDuration = 30;

// Strict validation: max 20 messages, max 1000 chars per message, roles: user / assistant
const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z
    .string()
    .trim()
    .min(1, "Message content cannot be empty.")
    .max(1000, "Message content cannot exceed 1000 characters."),
});

const ChatRequestSchema = z.object({
  messages: z
    .array(ChatMessageSchema)
    .min(1, "At least one message is required.")
    .max(20, "Conversation exceeds maximum history of 20 messages."),
});

const FALLBACK_ERROR_MESSAGE =
  "We are experiencing technical difficulties connecting to our assistant. Please try again shortly or contact our office directly at +1 (786) 907-0814.";

const GEMINI_RATE_LIMIT_MESSAGE =
  "We're busy right now. Please try again shortly or call our office at +1 (786) 907-0814.";

function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const firstIp = forwarded.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}

function isRateLimitError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const anyErr = err as {
    statusCode?: number;
    status?: number;
    message?: string;
    lastError?: { statusCode?: number };
    errors?: Array<{ statusCode?: number }>;
  };
  if (anyErr.statusCode === 429 || anyErr.status === 429) return true;
  if (anyErr.lastError?.statusCode === 429) return true;
  if (anyErr.errors?.some((e) => e?.statusCode === 429)) return true;
  if (
    typeof anyErr.message === "string" &&
    (anyErr.message.includes("429") ||
      anyErr.message.toLowerCase().includes("rate limit") ||
      anyErr.message.toLowerCase().includes("resource exhausted") ||
      anyErr.message.toLowerCase().includes("quota"))
  ) {
    return true;
  }
  return false;
}

export async function POST(req: Request) {
  // 1. Rate limiting by IP
  const clientIp = getClientIp(req);
  const rateLimit = checkRateLimit(clientIp);

  if (!rateLimit.allowed) {
    return Response.json(
      {
        error:
          "Too many messages sent. Please wait a moment before sending another message, or call our office directly at +1 (786) 907-0814.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds),
        },
      }
    );
  }

  // 2. Validate request body with Zod
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json(
      { error: "Invalid JSON in request body." },
      { status: 400 }
    );
  }

  const parseResult = ChatRequestSchema.safeParse(body);
  if (!parseResult.success) {
    const issueMessage =
      parseResult.error.issues[0]?.message ?? "Invalid request format.";
    return Response.json({ error: issueMessage }, { status: 400 });
  }

  const { messages } = parseResult.data;

  // 3. Provider validation: Google Generative AI API Key
  const apiKey =
    process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json(
      {
        error:
          "Our AI support service is currently unavailable. Please contact our office directly at +1 (786) 907-0814 or email info@luxamapremiumgroup.com.",
      },
      { status: 503 }
    );
  }

  const google = createGoogle({ apiKey });

  const rawModel = process.env.AI_MODEL || "gemini-3.5-flash";
  const modelName = rawModel
    .replace(/['"]/g, "")
    .replace(/^models\//, "")
    .trim();

  let capturedError: unknown = null;

  try {
    // 4. Stream response using Vercel AI SDK with Google Gemini provider
    const result = streamText({
      model: google(modelName),
      system: SYSTEM_PROMPT,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      maxOutputTokens: 500,
      abortSignal: AbortSignal.timeout(25000),
      onError({ error }) {
        // Never log message content or personal data
        capturedError = error;
      },
    });

    // 5. Inspect initial stream output to handle provider 429 and prevent blank bubbles
    const reader = result.textStream.getReader();
    let firstChunk: ReadableStreamReadResult<string>;

    try {
      firstChunk = await reader.read();
    } catch (readErr) {
      capturedError = readErr;
      firstChunk = { done: true, value: undefined };
    }

    if (capturedError) {
      if (isRateLimitError(capturedError)) {
        return Response.json(
          { error: GEMINI_RATE_LIMIT_MESSAGE },
          { status: 429 }
        );
      }
      return Response.json(
        { error: FALLBACK_ERROR_MESSAGE },
        { status: 500 }
      );
    }

    // Handle empty response (e.g. blocked answer or 0-token output) -> show fallback, no blank bubble
    if (firstChunk.done && !firstChunk.value) {
      return Response.json(
        { error: FALLBACK_ERROR_MESSAGE },
        { status: 500 }
      );
    }

    // 6. Return plain text stream response (compatible with toTextStreamResponse())
    const plainTextStream = new ReadableStream<string>({
      async start(controller) {
        if (firstChunk.value) {
          controller.enqueue(firstChunk.value);
        }
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value) {
              controller.enqueue(value);
            }
          }
          controller.close();
        } catch {
          // If error occurs mid-stream, error the controller to notify client
          controller.error(new Error(FALLBACK_ERROR_MESSAGE));
        }
      },
    });

    return createTextStreamResponse({
      stream: plainTextStream,
      headers: {
        "Cache-Control": "no-cache, no-transform",
      },
    });
  } catch (syncError) {
    if (isRateLimitError(syncError)) {
      return Response.json(
        { error: GEMINI_RATE_LIMIT_MESSAGE },
        { status: 429 }
      );
    }
    return Response.json(
      { error: FALLBACK_ERROR_MESSAGE },
      { status: 500 }
    );
  }
}
