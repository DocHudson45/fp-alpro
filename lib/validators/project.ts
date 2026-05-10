import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(3, "Nama project minimal 3 karakter").max(80, "Nama project maksimal 80 karakter"),
  description: z.string().min(10, "Deskripsi projek minimal 10 karakter"),
  businessType: z.string().optional(),
  targetUser: z.string().optional(),
  appGoal: z.string().optional(),
  desiredComplexity: z.string().optional(),
  techStack: z.string().optional(),
  freelancerRate: z.coerce.number().optional(),
  references: z.array(z.string()).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
