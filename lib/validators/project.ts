import { z } from "zod";

export const createProjectSchema = z.object({
  clientRequest: z.string().min(10, "Permintaan klien minimal 10 karakter"),
  businessType: z.string().optional(),
  targetUser: z.string().optional(),
  websiteGoal: z.string().optional(),
  budget: z.string().optional(),
  desiredComplexity: z.string().optional(),
  techStack: z.string().optional(),
  freelancerRate: z.coerce.number().optional(),
  references: z.array(z.string()).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
