import { z } from 'zod'

export const swipeSchema = z.object({
  swipedId: z.string().uuid(),
  direction: z.enum(['like', 'pass']),
})

export type SwipeInput = z.infer<typeof swipeSchema>
