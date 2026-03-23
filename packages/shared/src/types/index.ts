// Profile types
export interface Profile {
  id: string
  userId: string
  name: string
  bio: string | null
  avatarUrl: string | null
  githubUrl: string | null
  city: string | null
  locationLat: number | null
  locationLng: number | null
  radiusKm: number
  visibility: boolean
  onboardingComplete: boolean
  updatedAt: string
}

export interface SkillEntry {
  skillId: string
  name: string
  level: 'beginner' | 'mid' | 'senior' | null
}

export interface PromptEntry {
  promptId: string
  question: string
  answer: string
}

// Discovery
export interface DiscoverProfile {
  id: string
  name: string
  bio: string | null
  avatarUrl: string | null
  githubUrl: string | null
  city: string | null
  distanceKm: number | null
  skills: SkillEntry[]
  prompts: PromptEntry[]
}

// Match
export interface Match {
  id: string
  createdAt: string
  otherProfile: {
    id: string | undefined
    name: string
    avatarUrl: string | null | undefined
  }
  lastMessage: string | null
}

// Message
export interface Message {
  id: string
  matchId: string
  senderId: string
  content: string
  sentAt: string
  readAt: string | null
}
