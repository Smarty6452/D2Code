// Schemas
export { loginSchema, signupSchema } from './schemas/auth'
export type { LoginInput, SignupInput } from './schemas/auth'

export { updateProfileSchema, skillLevelSchema } from './schemas/profile'
export type { UpdateProfileInput } from './schemas/profile'

export { swipeSchema } from './schemas/swipe'
export type { SwipeInput } from './schemas/swipe'

export { sendMessageSchema } from './schemas/chat'
export type { SendMessageInput } from './schemas/chat'

// Types
export type {
  Profile,
  SkillEntry,
  PromptEntry,
  DiscoverProfile,
  Match,
  Message,
} from './types/index'
