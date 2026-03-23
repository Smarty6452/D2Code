import { z } from 'zod'

export const skillLevelSchema = z.enum(['beginner', 'mid', 'senior'])

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  bio: z.string().max(300).optional(),
  avatarUrl: z.string().url().optional().nullable(),
  githubUrl: z.string().url().optional().nullable(),
  city: z.string().max(100).optional(),
  locationLat: z.number().min(-90).max(90).optional().nullable(),
  locationLng: z.number().min(-180).max(180).optional().nullable(),
  radiusKm: z.number().int().min(1).max(500).optional(),
  visibility: z.boolean().optional(),
  onboardingComplete: z.boolean().optional(),
  skills: z.array(z.string().min(1).max(100)).optional(),
  prompts: z
    .array(
      z.object({
        question: z.string().min(1).max(200),
        answer: z.string().min(1).max(150),
      })
    )
    .optional(),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
