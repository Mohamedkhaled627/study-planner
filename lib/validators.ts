import { z } from "zod";

export const subjectSchema = z.object({
  name: z.string().min(1).max(80),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#3b82f6"),
  examDate: z.coerce.date().optional(),
});

export const taskSchema = z.object({
  subjectId: z.string().min(1),
  title: z.string().min(1).max(200),
  deadline: z.coerce.date().optional().nullable(),
  priority: z.enum(["LOW", "MED", "HIGH"]).default("MED"),
  estimatedMin: z.number().int().min(15).max(480),
});

export const taskPatchSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  deadline: z.coerce.date().optional().nullable(),
  priority: z.enum(["LOW", "MED", "HIGH"]).optional(),
  estimatedMin: z.number().int().min(15).max(480).optional(),
  status: z.enum(["TODO", "DOING", "DONE", "SKIPPED"]).optional(),
});

export const resourceSchema = z.object({
  subjectId: z.string().min(1),
  title: z.string().min(1).max(200),
  url: z.string().url().refine((u) => u.startsWith("http://") || u.startsWith("https://"), "must be http(s)"),
  type: z.enum(["VIDEO", "DOC", "COURSE", "REPO", "OTHER"]).default("OTHER"),
});

export const availabilitySchema = z.object({
  slots: z.array(
    z.object({
      weekday: z.number().int().min(0).max(6),
      startMin: z.number().int().min(0).max(1439),
      endMin: z.number().int().min(1).max(1440),
    }).refine((s) => s.startMin < s.endMin, "startMin < endMin required")
  ),
});
