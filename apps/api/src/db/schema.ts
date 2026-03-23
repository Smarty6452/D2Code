import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  numeric,
  integer,
  timestamp,
  pgEnum,
  index,
  unique,
} from 'drizzle-orm/pg-core'

// ─── Enums ───────────────────────────────────────────────────────────────────

export const skillLevelEnum = pgEnum('skill_level', ['beginner', 'mid', 'senior'])
export const swipeDirectionEnum = pgEnum('swipe_direction', ['like', 'pass'])
export const matchStatusEnum = pgEnum('match_status', ['active', 'unmatched'])
export const codeDateStatusEnum = pgEnum('code_date_status', ['pending', 'accepted', 'declined'])
export const skillCategoryEnum = pgEnum('skill_category', ['language', 'framework', 'tool', 'other'])

// ─── Users ────────────────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash'),
  githubId: varchar('github_id', { length: 100 }).unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// ─── Profiles ─────────────────────────────────────────────────────────────────

export const profiles = pgTable(
  'profiles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 100 }).notNull(),
    bio: text('bio'),
    avatarUrl: text('avatar_url'),
    githubUrl: text('github_url'),
    locationLat: numeric('location_lat', { precision: 8, scale: 6 }),
    locationLng: numeric('location_lng', { precision: 9, scale: 6 }),
    city: varchar('city', { length: 100 }),
    radiusKm: integer('radius_km').default(25),
    visibility: boolean('visibility').default(true),
    onboardingComplete: boolean('onboarding_complete').default(false),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [
    index('profiles_location_idx').on(t.locationLat, t.locationLng),
    index('profiles_visibility_idx').on(t.visibility),
  ]
)

// ─── Skills ───────────────────────────────────────────────────────────────────

export const skills = pgTable('skills', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  category: skillCategoryEnum('category').default('other'),
})

export const profileSkills = pgTable(
  'profile_skills',
  {
    profileId: uuid('profile_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    skillId: uuid('skill_id')
      .notNull()
      .references(() => skills.id, { onDelete: 'cascade' }),
    level: skillLevelEnum('level').default('mid'),
  },
  (t) => [unique('profile_skill_unique').on(t.profileId, t.skillId)]
)

// ─── Prompts ──────────────────────────────────────────────────────────────────

export const prompts = pgTable('prompts', {
  id: uuid('id').primaryKey().defaultRandom(),
  questionText: varchar('question_text', { length: 200 }).notNull().unique(),
})

export const profilePrompts = pgTable(
  'profile_prompts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    profileId: uuid('profile_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    promptId: uuid('prompt_id')
      .notNull()
      .references(() => prompts.id, { onDelete: 'cascade' }),
    answer: text('answer').notNull(),
  },
  (t) => [unique('profile_prompt_unique').on(t.profileId, t.promptId)]
)

// ─── Swipes ───────────────────────────────────────────────────────────────────

export const swipes = pgTable(
  'swipes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    swiperId: uuid('swiper_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    swipedId: uuid('swiped_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    direction: swipeDirectionEnum('direction').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [
    unique('swipe_pair_unique').on(t.swiperId, t.swipedId),
    index('swipes_swiper_idx').on(t.swiperId),
  ]
)

// ─── Matches ──────────────────────────────────────────────────────────────────

export const matches = pgTable(
  'matches',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userAId: uuid('user_a_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    userBId: uuid('user_b_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    status: matchStatusEnum('status').default('active'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [
    unique('match_pair_unique').on(t.userAId, t.userBId),
    index('matches_user_a_idx').on(t.userAId),
    index('matches_user_b_idx').on(t.userBId),
  ]
)

// ─── Messages ─────────────────────────────────────────────────────────────────

export const messages = pgTable(
  'messages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    matchId: uuid('match_id')
      .notNull()
      .references(() => matches.id, { onDelete: 'cascade' }),
    senderId: uuid('sender_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    sentAt: timestamp('sent_at').notNull().defaultNow(),
    readAt: timestamp('read_at'),
  },
  (t) => [index('messages_match_idx').on(t.matchId)]
)

// ─── Code Dates ───────────────────────────────────────────────────────────────

export const codeDates = pgTable('code_dates', {
  id: uuid('id').primaryKey().defaultRandom(),
  matchId: uuid('match_id')
    .notNull()
    .references(() => matches.id, { onDelete: 'cascade' }),
  proposedBy: uuid('proposed_by')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  datetime: timestamp('datetime').notNull(),
  locationText: text('location_text'),
  virtualLink: text('virtual_link'),
  status: codeDateStatusEnum('status').default('pending'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// ─── Blocks & Reports ─────────────────────────────────────────────────────────

export const blocks = pgTable(
  'blocks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    blockerId: uuid('blocker_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    blockedId: uuid('blocked_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [unique('block_pair_unique').on(t.blockerId, t.blockedId)]
)

export const reports = pgTable('reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  reporterId: uuid('reporter_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  reportedId: uuid('reported_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  reason: text('reason').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
