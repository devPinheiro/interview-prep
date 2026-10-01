import { z } from "zod";

const messageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string().min(1).max(12000),
});

const bodySchema = z.object({
  apiKey: z.string().max(500).optional().default(""),
  model: z.string().trim().min(1).max(80),
  baseUrl: z.string().max(300).optional().default(""),
  messages: z.array(messageSchema).min(1).max(40),
});

function chatEndpoint(baseUrl: string) {
  const base = (baseUrl.trim() || "https://api.openai.com/v1").replace(/\/$/, "");
  const url = new URL(`${base}/chat/completions`);
  const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  if (url.protocol !== "https:" && !local) {
    throw new Error("Use an https model endpoint, or http://127.0.0.1 for a model on this machine.");
  }
  if (url.hostname === "169.254.169.254" || url.hostname.endsWith(".metadata.google.internal")) {
    throw new Error("That endpoint is not allowed.");
  }
  return { url: url.toString(), local };
}

function completionText(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "";
  const choices = (payload as { choices?: unknown }).choices;
  if (!Array.isArray(choices) || !choices[0] || typeof choices[0] !== "object") return "";
  const message = (choices[0] as { message?: { content?: unknown } }).message;
  const content = message?.content;
  if (typeof content === "string") return content.trim();
  if (Array.isArray(content)) {
    return content
      .map((part) => (part && typeof part === "object" && "text" in part ? String(part.text) : ""))
      .join("")
      .trim();
  }
  return "";
}

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: "Check the model name and try a shorter reply." }, { status: 400 });
  }

  let endpoint: { url: string; local: boolean };
  try {
    endpoint = chatEndpoint(parsed.data.baseUrl);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid model endpoint.";
    return Response.json({ error: message }, { status: 400 });
  }

  if (!endpoint.local && !parsed.data.apiKey.trim()) {
    return Response.json({ error: "Add an API key on the Data page." }, { status: 400 });
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (parsed.data.apiKey.trim()) headers.Authorization = `Bearer ${parsed.data.apiKey.trim()}`;

  let upstream: Response;
  try {
    upstream = await fetch(endpoint.url, {
      method: "POST",
      headers,
      signal: AbortSignal.timeout(45_000),
      body: JSON.stringify({
        model: parsed.data.model,
        temperature: 0.4,
        messages: parsed.data.messages,
      }),
    });
  } catch {
    return Response.json(
      { error: "The model endpoint did not respond. Check the base URL and that the model is running." },
      { status: 502 },
    );
  }

  const raw = await upstream.text();
  let payload: unknown = null;
  try {
    payload = raw ? JSON.parse(raw) : null;
  } catch {
    payload = null;
  }

  if (!upstream.ok) {
    const upstreamError =
      payload && typeof payload === "object" && "error" in payload
        ? (payload as { error?: { message?: string } | string }).error
        : undefined;
    const detail =
      typeof upstreamError === "string"
        ? upstreamError
        : upstreamError?.message;
    const message =
      upstream.status === 401
        ? "The API key was rejected."
        : detail || `The model returned ${upstream.status}.`;
    return Response.json({ error: message }, { status: 502 });
  }

  const text = completionText(payload);
  if (!text) {
    return Response.json({ error: "The model returned an empty reply." }, { status: 502 });
  }
  return Response.json({ content: text });
}
