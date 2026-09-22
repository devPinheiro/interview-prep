import { z } from "zod";

const revealLevel = z.enum(["none", "hint", "approach", "solution"]);
const track = z.enum(["quiz", "dsa", "system-design", "behaviour", "negotiation"]);
const level = z.enum(["beginner", "mid", "senior", "staff", "principal"]);

export const exportPayloadSchema = z.object({
  version: z.literal(1),
  exportedAt: z.string(),
  progress: z
    .array(
      z.object({
        key: z.string(),
        track,
        id: z.string(),
        completed: z.boolean(),
        reveal: revealLevel,
        lastSeen: z.number(),
        attempts: z.number(),
        due: z.number(),
        stability: z.number(),
        difficulty: z.number(),
        reps: z.number(),
        lapses: z.number(),
      }),
    )
    .default([]),
  star: z
    .array(
      z.object({
        key: z.string(),
        situation: z.string(),
        task: z.string(),
        action: z.string(),
        result: z.string(),
        reflection: z.string(),
        updatedAt: z.number(),
      }),
    )
    .default([]),
  radio: z
    .array(
      z.object({
        key: z.string(),
        checked: z.record(z.string(), z.boolean()),
        notes: z.string(),
        updatedAt: z.number(),
      }),
    )
    .default([]),
  negotiation: z
    .array(
      z.object({
        key: z.string(),
        fields: z.record(z.string(), z.string()),
        updatedAt: z.number(),
      }),
    )
    .default([]),
  meta: z
    .object({
      preferredLevel: z.union([level, z.literal("all")]),
      lastTrack: track.optional(),
      lastQuestionKey: z.string().optional(),
    })
    .default({ preferredLevel: "all" }),
});

export type ValidatedExportPayload = z.infer<typeof exportPayloadSchema>;

export function parseExportPayload(raw: unknown):
  | { ok: true; data: ValidatedExportPayload }
  | { ok: false; error: string } {
  const result = exportPayloadSchema.safeParse(raw);
  if (!result.success) {
    const msg = result.error.issues.map((i) => i.message).slice(0, 3).join("; ");
    return { ok: false, error: msg || "Invalid backup file shape" };
  }
  return { ok: true, data: result.data };
}
