# Urantia Ecosystem

Two Next.js applications that together provide a full-featured reading platform for the Urantia Book.

| App | URL | Port | Purpose |
|-----|-----|------|---------|
| **urantia-hub** | [urantiahub.com](https://urantiahub.com) | 3001 | User-facing reading, engagement, and discovery app |
| **urantia-api** | [urantia.dev](https://urantia.dev) | 3000 | Content delivery and search API |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      User Browser                       │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   urantia-hub (Next.js)                 │
│                   urantiahub.com :3001                   │
│                                                         │
│  Pages: reading, search, explore, progress, my-library  │
│  Auth: NextAuth (magic link + Google OAuth)             │
│  AI: Vercel AI SDK (OpenAI / xAI)                      │
│  Email: Resend + SendGrid                               │
│                                                         │
│  ┌─────────┐  ┌──────────┐  ┌────────────────────────┐ │
│  │ Prisma  │  │  Redis   │  │  Service Layer         │ │
│  │ (Users, │  │ (Cache)  │  │  BaseService → CRUD    │ │
│  │ Notes,  │  │          │  │  15 specialized svcs   │ │
│  │ etc.)   │  │          │  │                        │ │
│  └────┬────┘  └────┬─────┘  └────────────────────────┘ │
└───────┼─────────────┼──────────────────┬────────────────┘
        │             │                  │ HTTP fetch
        ▼             ▼                  ▼
   PostgreSQL      Redis     ┌──────────────────────────┐
                             │  urantia-api (Next.js)   │
                             │  urantia.dev :3000        │
                             │                          │
                             │  REST API: /api/v1/...   │
                             │  Content: 197 papers     │
                             │  Search: Algolia-backed  │
                             │  Progress: calculation   │
                             │                          │
                             │  ┌────────┐ ┌─────────┐ │
                             │  │Algolia │ │  Redis  │ │
                             │  │(Index) │ │ (Cache) │ │
                             │  └────────┘ └─────────┘ │
                             └──────────────────────────┘
                                         │
                                    CloudFront CDN
                                    (Audio MP3s)
```

### Tech Stack

| Layer | urantia-hub | urantia-api |
|-------|-------------|-------------|
| Framework | Next.js 14 (Pages Router) | Next.js 14 (Pages Router) |
| Language | TypeScript | TypeScript |
| Database | PostgreSQL via Prisma | PostgreSQL via Prisma (minimal) |
| Caching | Redis (ioredis) | Redis (ioredis) |
| Search | Proxied via urantia-api | Algolia |
| Auth | NextAuth.js | NextAuth.js (disabled) |
| AI | Vercel AI SDK, OpenAI, xAI | OpenAI (summary generation) |
| Email | Resend, SendGrid | -- |
| Monitoring | Sentry | Sentry |
| Styling | Tailwind CSS + once-ui | Tailwind CSS |
| Hosting | Vercel | Vercel |
| Audio CDN | CloudFront | S3 + CloudFront |

---

## urantia-api Deep Dive

### Purpose

REST API serving the full text of the Urantia Book with search, reading progress calculation, and content discovery. Content is stored as JSON files on disk and indexed in Algolia for search.

### API Endpoints

All endpoints return a standardized response: `{ data, error, message, success }`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/urantia-book/toc` | Table of contents — all papers and parts |
| GET | `/api/v1/urantia-book/read` | Read paragraphs with filters (paperId, sectionId, globalId) |
| GET | `/api/v1/urantia-book/paragraphs` | Retrieve multiple paragraphs by IDs |
| GET | `/api/v1/urantia-book/paragraphs/[globalId]` | Retrieve a single paragraph by globalId |
| GET | `/api/v1/urantia-book/paragraphs/random` | Random paragraph from the entire book |
| POST | `/api/v1/urantia-book/search` | Full-text search (Algolia-backed, Redis-cached with 3-day TTL) |
| POST | `/api/v1/urantia-book/progress` | Calculate reading progress across papers given read globalIds |
| POST | `/api/v1/urantia-book/search/similarity` | Similarity search (placeholder, not yet implemented) |

### Data Model

Content is **not** stored in PostgreSQL. The pipeline is:

```
HTML source files → convert-html-to-json.sh → JSON files → Algolia index
  public/data/html/eng/    process_json.py       public/data/json/eng/
                           (adds labels)          000.json – 196.json
```

Each JSON file contains an array of nodes with structure:
- `type`: `"paper"` | `"section"` | `"paragraph"`
- `globalId`: `"partId:paperId.sectionId.paragraphId"` (e.g., `"1:2.0.1"`)
- `text` / `htmlText`: plain and HTML content
- `paperId`, `paperSectionId`, `paperSectionParagraphId`: numeric identifiers
- `paperTitle`, `sectionTitle`: human-readable titles
- `labels`: topic tags (e.g., `["Theology", "Philosophy"]`)
- `language`: language code (e.g., `"eng"`)

The PostgreSQL database is minimal — only `User` and `UserApiKey` models for API key management.

### Scripts & Data Pipeline

| Script | Command | Purpose |
|--------|---------|---------|
| `convert-html-to-json.sh` | `yarn convert-html-to-json` | Convert HTML source → JSON |
| `process_json.py` | -- | Add topic labels to JSON files |
| `algolia_update_ub_node_index.ts` | `yarn update-algolia-ub-node-index` | Upload JSON to Algolia index |
| `algolia_update_ub_node_index_settings.ts` | `yarn update-algolia-ub-node-index_settings` | Configure Algolia index settings |
| `generate_paper_summaries.ts` | `yarn generate-summaries` | Generate AI summaries via OpenAI |
| `upload_mp3s_to_s3.sh` | `yarn upload-audio-s3` | Upload audio files to S3 |
| `create_elevenlabs_chapters.sh` | -- | Generate audiobook via ElevenLabs TTS |
| `sync_json_to_urantia_api.sh` | `yarn publish-open-source-data` | Sync JSON to API |

Full pipeline to update content: `yarn update-algolia:dev` (or `:prod`) runs convert → index → configure.

### Key Directories

```
urantia-api/
├── pages/api/v1/urantia-book/   # All API route handlers
├── public/data/
│   ├── html/eng/                 # Source HTML files
│   ├── json/eng/                 # Processed JSON (000.json–196.json)
│   ├── txt/eng/papers/           # Plain text per paper
│   ├── mp3/                      # Audio narration files
│   └── summaries/                # AI-generated paper summaries
├── scripts/                      # Data pipeline scripts (TS, Python, Shell)
├── utils/
│   ├── algolia.ts                # Algolia client + result formatting
│   ├── apiResponse.ts            # Standardized API response helper
│   ├── redis.ts                  # Redis singleton client
│   ├── typeUtils.ts              # Input validation (enforceGlobalId, etc.)
│   └── config.ts                 # Algolia/GitHub config from env vars
├── middleware.ts                  # CORS middleware for all /api/* routes
└── prisma/schema.prisma          # User + UserApiKey models
```

### Environment Variables (urantia-api)

| Variable | Purpose |
|----------|---------|
| `ALGOLIA_APP_ID`, `ALGOLIA_ADMIN_API_KEY` | Algolia search backend |
| `ALGOLIA_UB_NODE_INDEX_NAME` | Index name (`dev_UB_NODE` / `prod_UB_NODE`) |
| `DATABASE_URL` | PostgreSQL connection |
| `REDIS_URL` | Redis cache |
| `OPENAI_API_KEY` | AI summary generation |
| `PORT` | Server port (default 3000) |
| `ALLOWED_ORIGIN`, `ALLOWED_METHODS`, `ALLOWED_HEADERS` | CORS configuration |

---

## urantia-hub Deep Dive

### Purpose

User-facing web app for reading, studying, and engaging with the Urantia Book. Paper content is fetched from urantia-api — it is **not** stored in the hub's database.

### Features

| Feature | Description |
|---------|-------------|
| **Reading** | Full paper reader with section navigation and paragraph-level tracking |
| **Bookmarks** | Save paragraphs with optional categories |
| **Notes** | Attach personal notes to any paragraph (max 1000 chars) |
| **AI Chat** | AI-powered explanations of passages (Vercel AI SDK, cached in `AIExplanation`) |
| **Search** | Full-text search with suggestions, popular/recent queries |
| **Progress** | Per-paper reading completion percentages |
| **Audio** | Audio narration from CloudFront CDN with Spotify episode links |
| **Sharing** | Share passages via copy link/text, Facebook, Instagram, WhatsApp, X |
| **Explore** | Featured passages, most-read papers, topic-based discovery |
| **Email** | Magic link auth, daily quotes, continue reading reminders, changelog updates |
| **Admin** | Curated quotes management, changelog email broadcasting |

### Page Routes

**Core Reading:**
- `/` — Homepage with hero, features overview, featured passages
- `/papers` — All 197 papers organized by 4 parts, filterable by topic labels
- `/papers/[paperName]` — Full paper reader with bookmarks, notes, sharing, AI, audio

**Discovery & Library:**
- `/explore` — Featured passages, papers in progress, most-read, papers by topic
- `/search` — Full-text search with popular/recent suggestions
- `/progress` — Per-paper reading completion grid
- `/my-library` — User bookmarks and notes with filtering/sorting
- `/my-library/bookmarks` — Bookmarks with category management

**Account:**
- `/settings` — User preferences and notification settings
- `/settings/interests` — Topic interest management
- `/onboarding/interests` — First-time interest selection
- `/auth/sign-in` — Email magic link + Google OAuth login
- `/auth/verify-request` — Magic link confirmation
- `/auth/sign-out` — Logout
- `/auth/error` — Authentication error

**Content & Legal:**
- `/changelog` — Release notes
- `/community-resources` — Links to community resources
- `/blockchain-archive` — Blockchain archive information
- `/privacy-policy`, `/cookie-policy`, `/terms-of-service`
- `/more` — Additional navigation
- `/admin/curated-quotes` — Admin curated quotes management

### API Routes (Internal)

**User Management:**
- `GET/PUT/DELETE /api/user` — Profile, notification prefs, account deletion
- `GET /api/user/nodes/last-visited` — Resume reading position
- `POST/GET /api/user/nodes/read` — Track paragraphs read (5-min throttle)
- `GET /api/user/nodes/progress` — Reading progress for all papers
- `DELETE /api/user/nodes/progress` — Reset all reading progress

**Bookmarks & Notes:**
- `POST/GET/DELETE /api/user/nodes/bookmarks` — CRUD bookmarks by paper
- `GET/PATCH /api/user/nodes/bookmarks/[id]` — Update bookmark category
- `GET /api/user/bookmark-categories` — List categories
- `POST/GET /api/user/nodes/notes` — CRUD notes by paper

**Activity & Interests:**
- `GET /api/user/activity` — Combined bookmarks + notes feed
- `GET/POST /api/user/interests` — Topic interest preferences

**Search:**
- `POST /api/urantia-book/search` — Proxy to urantia.dev search
- `POST/GET /api/searches` — Track search queries
- `GET /api/searches/popular` — Popular searches
- `GET /api/searches/recent` — User's recent searches

**Explore:**
- `GET /api/explore/most-read` — Top 6 most-read papers (cached weekly)
- `GET /api/explore/papers-by-topic` — Papers by topic label
- `GET /api/explore/curated-quotes` — Featured quotes

**AI & Email:**
- `POST /api/chat` — AI paragraph explanations (streaming, cached)
- `POST /api/crons/sendDailyQuote` — Daily quote email cron
- `POST /api/crons/sendContinueReadingAfter24Hours` — Resume reading reminder cron
- `POST /api/admin/sendChangelogUpdate` — Broadcast changelog email
- `GET /api/user/unsubscribe` — Email unsubscribe

**Redirects:**
- `GET /api/redirect/user/read` — Redirect to last visited paper
- `GET /api/redirect/papers/by-standard-reference-id/[id]` — Redirect by reference ID

### Service Layer

All services extend `services/base/index.ts` (BaseService) providing: `create`, `find`, `findMany`, `get`, `update`, `upsert`, `delete`, `deleteMany`, `count`.

| Service | Model | Extra Methods |
|---------|-------|---------------|
| `UserService` | User | -- |
| `BookmarkService` | Bookmark | `getUserBookmarksWithDetails()` — enriches with paragraph content from API |
| `NoteService` | Note | `getUserNotesWithDetails()` — enriches with paragraph content from API |
| `ReadNodeService` | ReadNode | -- |
| `PaperService` | Paper | -- |
| `LabelService` | Label | -- |
| `PaperLabelService` | PaperLabel | -- |
| `ShareService` | Share | -- |
| `UserSearchService` | -- | Search history tracking |
| `UserInterestService` | UserInterest | -- |
| `AIExplanationService` | AIExplanation | AI response caching |
| `CuratedQuoteService` | CuratedQuote | -- |
| `SentQuoteService` | SentQuote | Per-user quote tracking |
| `AccountService` | Account | NextAuth account linking |
| `SessionService` | Session | Session management |

### Database Schema (Prisma)

**Core User Models:**
- `User` — email, name, image, admin flag, email preferences (4 toggles), last visited tracking
- `Account` — NextAuth OAuth accounts (Google)
- `Session` — NextAuth database sessions
- `VerificationToken` — Magic link tokens

**Content Interaction Models:**
- `Bookmark` — globalId, paperId, sectionId, paragraphId, optional category, userId
- `Note` — globalId, paperId, sectionId, paragraphId, text, userId
- `ReadNode` — tracks individual paragraph reads per user
- `Share` — paragraph shares with platform enum (COPY_LINK, COPY_TEXT, FACEBOOK, INSTAGRAM, WHATSAPP, X) and count
- `AIExplanation` — cached AI responses keyed by globalId

**Content Metadata Models:**
- `Paper` — id, title, globalId (seeded from SQL)
- `Label` — topic categories (Science, Theology, etc.)
- `PaperLabel` — many-to-many paper ↔ label
- `UserInterest` — many-to-many user ↔ label
- `CuratedQuote` — admin-selected quotes with sentAt tracking
- `SentQuote` — per-user quote delivery tracking

### Authentication Flow

NextAuth.js configured in `pages/api/auth/[...nextauth].ts`:

1. **Email Magic Link** — user enters email → Resend sends magic link → user clicks → session created
2. **Google OAuth** — standard OAuth flow via Google provider
3. **Session Storage** — database sessions via Prisma adapter
4. **Route Protection** — `utils/getSessionDetails.ts` extracts session in API routes
5. **Custom Pages** — `/auth/sign-in`, `/auth/verify-request`, `/auth/error`, `/auth/sign-out`

### AI Integration

- **SDK**: Vercel AI SDK for streaming responses
- **Models**: OpenAI (`o1-mini` default) or xAI (`grok-beta`), configurable via `AI_MODEL` env var
- **Caching**: Responses cached in `AIExplanation` model keyed by globalId — same paragraph never re-queried
- **Context**: Current paragraph text + paper context sent with each request
- **Endpoint**: `POST /api/chat` with streaming response

### Email System

**Providers**: Resend (magic link auth) + SendGrid (transactional emails)

**Templates** (`utils/email-templates/`):
- `magicLink.ts` — login magic link
- `dailyQuote.ts` — daily curated quote
- `continueReading24Hours.ts` — resume reading after 24h inactivity
- `changelogUpdate.ts` — product updates
- `baseEmailTemplate.ts` — shared styling

**Cron Jobs** (secured via `CRON_SECRET` header):
- `sendDailyQuote` — picks unsent curated quote, emails to subscribed users, tracks delivery via SentQuote
- `sendContinueReadingAfter24Hours` — finds users inactive 24h+, sends resume link

**User Preferences** (4 independent toggles):
- `emailNotificationsEnabled` — master toggle
- `emailDailyQuoteEnabled` — daily quote subscription
- `emailContinueReadingEnabled` — inactivity reminders
- `emailChangelogEnabled` — product updates

### Caching Strategy

Redis caching via `libs/redis/`:

| Key Pattern | TTL | Purpose |
|-------------|-----|---------|
| Most-read papers | 1 week | Explore page top papers |
| Search results (api) | 3 days | Algolia search response cache |
| Progress calculation (api) | 3 days | Paper progress percentages |

### Key Directories

```
urantia-hub/
├── pages/
│   ├── api/                      # 30+ API routes
│   │   ├── auth/[...nextauth].ts # NextAuth configuration
│   │   ├── chat/index.ts         # AI chat endpoint
│   │   ├── crons/                # Scheduled email jobs
│   │   ├── user/                 # User CRUD + interactions
│   │   ├── explore/              # Discovery endpoints
│   │   ├── searches/             # Search tracking
│   │   ├── admin/                # Admin endpoints
│   │   └── redirect/             # URL redirects
│   ├── papers/[paperName].tsx    # Paper reader page
│   ├── search/index.tsx          # Search page
│   ├── explore/index.tsx         # Explore page
│   ├── progress/index.tsx        # Progress tracker
│   ├── my-library/               # Bookmarks + notes
│   ├── settings/                 # User preferences
│   ├── auth/                     # Auth pages
│   └── ...                       # Other pages
├── components/
│   ├── Navbar.tsx                # Main navigation
│   ├── AskAI.tsx                 # AI chat interface
│   ├── Note.tsx                  # Note modal
│   ├── Share.tsx                 # Share modal
│   ├── BookmarkCategoryModal.tsx # Bookmark categories
│   ├── ParticleBackground.tsx    # Animated background
│   └── ...                       # 25+ components
├── services/                     # BaseService → 15 specialized services
├── libs/
│   ├── prisma/client.ts          # Singleton Prisma client
│   ├── redis/                    # Redis client + helpers
│   └── aws/                      # AWS SDK client
├── utils/
│   ├── config.ts                 # Audio config, reading speed, Spotify IDs
│   ├── paperFormatters.ts        # Paper ID ↔ URL conversions
│   ├── node.ts                   # Node/globalId utilities
│   ├── getSessionDetails.ts      # API route auth helper
│   ├── email-templates/          # HTML email templates
│   └── renderNode.tsx            # Paragraph rendering
├── once-ui/                      # Custom design system / tokens
├── types/                        # TypeScript definitions
├── data/resources.js             # Community resources list
├── scripts/
│   ├── seed.ts                   # Database seeding
│   └── generate-screenshots.js   # Puppeteer screenshot capture
└── prisma/schema.prisma          # 15 models
```

### Environment Variables (urantia-hub)

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection |
| `REDIS_URL` | Redis cache |
| `NEXT_PUBLIC_URANTIA_DEV_API_HOST` | urantia-api URL (`https://urantia.dev`) |
| `NEXT_PUBLIC_AUDIO_FILES_CDN` | CloudFront CDN for audio |
| `NEXT_PUBLIC_HOST` | Hub public URL |
| `NEXTAUTH_URL`, `NEXTAUTH_SECRET` | NextAuth config |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google OAuth |
| `RESEND_API_KEY`, `EMAIL_FROM` | Resend (magic link emails) |
| `SENDGRID_API_KEY`, `SENDGRID_FROM` | SendGrid (transactional emails) |
| `SENDGRID_SEND_DAILY_QUOTE_TEMPLATE_ID` | Daily quote email template |
| `SENDGRID_SEND_CONTINUE_READING_TEMPLATE_ID` | Continue reading template |
| `OPENAI_API_KEY` | OpenAI for AI explanations |
| `XAI_API_KEY` | xAI (Grok) alternative model |
| `AI_MODEL` | Model selection (default `o1-mini`) |
| `CRON_SECRET` | Secures cron job endpoints |
| `ADMIN_SECRET` | Secures admin endpoints |
| `SEED_EMAIL` | Email for database seeding |
| `SENTRY_AUTH_TOKEN` | Sentry error tracking |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Firebase integration |
| `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` | AWS services |

---

## Data Model & Node System

### Content Hierarchy

```
Part (4 parts)
 └── Paper (197 papers, 0–196)
      └── Section (variable per paper)
           └── Paragraph (the atomic unit / "node")
```

### globalId Format

Every paragraph has a unique `globalId`: `"partId:paperId.sectionId.paragraphId"`

Example: `"1:2.0.1"` = Part 1, Paper 2, Section 0, Paragraph 1

### User Interactions → Nodes

All user interactions reference paragraphs using four identifiers:
- `globalId` — unique across the entire book
- `paperId` — which paper (0–196)
- `paperSectionId` — which section within the paper
- `paperSectionParagraphId` — which paragraph within the section

Models that reference nodes: `Bookmark`, `Note`, `ReadNode`, `Share`, `AIExplanation`, `CuratedQuote`, `SentQuote`

### Content Source

Paper content lives in urantia-api (JSON files + Algolia index). The hub fetches content on demand via HTTP and caches with Redis. The hub's database stores only user data and interaction metadata — never the paper text itself.

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL
- Redis
- Yarn

### urantia-api Setup

```bash
cd urantia-api
cp .env.example .env          # Fill in Algolia, Redis, PostgreSQL credentials
yarn install
npx prisma migrate dev        # Run database migrations
npx prisma generate           # Generate Prisma client
yarn update-algolia:dev       # Convert HTML → JSON → Algolia index
yarn dev                      # Starts on http://localhost:3000
```

### urantia-hub Setup

```bash
cd urantia-hub
cp .env.example .env          # Fill in all credentials
yarn install
npx prisma migrate dev        # Run database migrations
npx prisma generate           # Generate Prisma client
npm run seed                  # Seed papers, labels, paper-labels
yarn dev                      # Starts on http://localhost:3001
```

Make sure `NEXT_PUBLIC_URANTIA_DEV_API_HOST` in hub's `.env` points to the running API (default `http://localhost:3000`).

---

## Deployment

Both apps deploy to **Vercel**.

**Cron Jobs** (Vercel Cron or external scheduler):
- `POST /api/crons/sendDailyQuote` — daily
- `POST /api/crons/sendContinueReadingAfter24Hours` — daily

Both require `CRON_SECRET` header for authorization.

**Error Tracking**: Sentry configured for client, server, and edge runtimes in both apps.

**Audio Hosting**: MP3 files stored in S3, served via CloudFront CDN at the URL set in `NEXT_PUBLIC_AUDIO_FILES_CDN`.

---

## Further Reading

See `CLAUDE.md` in this directory for development conventions, coding patterns, and guidance for working in the codebase.
