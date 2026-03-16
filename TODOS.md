# UrantiaHub — TODOs

Prioritized improvement plan for UrantiaHub. Organized by priority level (P0 = critical/blocking, P1 = high, P2 = medium, P3 = nice-to-have).

---

## P0 — Critical

### API Migration (urantiahub-api → api.urantia.dev) — DONE

All API calls now go through `libs/urantiaApi/client.ts` with response mapping in `libs/urantiaApi/mapper.ts`.

- [x] **Create centralized API client** — `libs/urantiaApi/client.ts` with `fetchToc()`, `fetchPaper()`, `fetchParagraph()`, `fetchParagraphs()`, `searchParagraphs()`
- [x] **Migrate TOC endpoint** — `GET /toc` (hierarchical response mapped to flat TOCNode[])
- [x] **Migrate paper read endpoint** — `GET /papers/{id}` (mapped to `{ data: { results: UBNode[] } }`)
- [x] **Migrate search endpoint** — `POST /search` (uses `highlightedHtmlText` from API)
- [x] **Migrate single paragraph endpoint** — `GET /paragraphs/{ref}`
- [x] **Migrate batch paragraph endpoint** — `Promise.all` with individual fetches via `fetchParagraphs()`
- [x] **Migrate progress endpoint** — Computed locally using `libs/urantiaApi/paperCounts.ts` + Redis cache
- [x] **Standardize HTTP client** — All calls use native fetch; axios imports removed

- [x] **Uninstall axios** — removed from package.json
- [x] **Deploy urantia-dev-api** with search highlighting via `ts_headline()` enriching `htmlText`
- [x] **Update Vercel env var** — `NEXT_PUBLIC_URANTIA_DEV_API_HOST` set to `https://api.urantia.dev`
- [x] **Add `.urantia-dev-highlighted` CSS** — search result highlighting styles in `globals.css`

### Security

- [ ] **Add rate limiting** on auth endpoints (`pages/api/auth/`) and public API routes (search, explore). NextAuth has no built-in rate limiting — consider `next-rate-limit` or similar.

- [ ] **Strengthen admin auth** — Replace simple `ADMIN_SECRET` header check with role-based session validation.

---

## P1 — High Priority

### Code Quality

- [x] **Reduce `any` types** — Reduced in services/base, utils/typeUtils, utils/getSessionDetails, SentryErrorBoundary, and API routes. Replaced with `unknown`, `Record<string, unknown>`, and proper Prisma/React types.

- [x] **Refactor paper reader page** — Extracted 6 hooks (`useAudioPlayer`, `useBookmarks`, `useNotes`, `useReadProgress`, `useModals`, `useFontSize`). File reduced from 1692 to 963 lines.

- [x] **Replace full lodash import** — Replaced `lodash/throttle` with native throttle implementation in `useReadProgress.ts`. Uninstalled `lodash` and `@types/lodash`.

- [x] **Replace console.log debugging** — Created `utils/logger.ts` structured logging utility. Replaced console.log/error across all API routes, cron jobs, and services with `createLogger()`.

- [x] **Remove dead code** — Deleted `pages/sentry-example-page.tsx` and `pages/api/sentry-example-api.ts`.

- [x] **Clean up globals.css** — Removed empty `.modal .content-outer` rule, unused `.todo` class, duplicate `.urantia-dev-pb-4`, duplicate `@keyframes pulse`, deprecated `-webkit-`/`-moz-` vendor prefixes, and `@-webkit-keyframes bounce`.

### Testing

- [x] **Set up testing framework** — Vitest + React Testing Library configured. 25 tests passing across 6 hook test files.

- [x] **Add service layer tests** — Unit tests for UserService, BookmarkService, NoteService, ReadNodeService.

- [x] **Add API route tests** — Tests for search proxy, progress, bookmarks, notes API routes.

- [x] **Add component tests** — Tests for Modal, Share, Note, BookmarkCategoryModal components.

### Error Handling

- [x] **Add React Error Boundaries** — Improved `SentryErrorBoundary` with user-friendly fallback UI (retry + go home buttons) instead of auto-redirect. Already wraps all pages via `_app.tsx`.

- [x] **Improve API error responses** — Applied `withSentry` wrapper to all API route exports. Standardized `catch (error: unknown)` and added `Sentry.captureException()` in critical routes.

---

## P2 — Medium Priority

### Accessibility

- [ ] **Add ARIA labels to icon-only buttons** — Navbar, paper reader toolbar, share/bookmark/note/AI buttons throughout `components/Navbar.tsx`, `components/PaperNavbar.tsx`, `components/Share.tsx`.

- [ ] **Add modal ARIA attributes** — `role="dialog"`, `aria-modal="true"`, `aria-labelledby` on `components/Modal.tsx`, `components/BookmarkCategoryModal.tsx`, `components/Note.tsx`, `components/Share.tsx`, `components/AskAI.tsx`.

- [ ] **Add aria-live regions** — For toast notifications (sonner) and async content loading.

- [ ] **Add aria-hidden to decorative elements** — `components/ParticleBackground.tsx`.

- [ ] **Add skip-to-content link** — For keyboard navigation past the navbar.

### SEO

- [ ] **Add per-paper meta descriptions** — Use paper title + first paragraph summary in `pages/papers/[paperName].tsx`.

- [ ] **Add Schema.org JSON-LD** — Structured data for Book/Chapter on paper pages.

- [ ] **Generate unique OG images per paper** — Or at minimum render paper title into the OG image.

- [ ] **Replace hardcoded URLs** — `pages/sitemap.xml.tsx` and `components/HeadTag.tsx` have hardcoded `https://www.urantiahub.com`. Use `process.env.NEXT_PUBLIC_HOST`.

### Performance

- [ ] **Add React Query (TanStack Query)** — For client-side data fetching, caching, revalidation, and loading/error states.

- [ ] **Code-split paper reader** — Lazy-load AskAI, Share, Note, and Audio components (they're modal-based, only needed on interaction).

- [ ] **Use Next.js Image component** — For community resource screenshots and any other images.

### AI Enhancements

- [ ] **Integrate semantic search** — Use `POST /search/semantic` from api.urantia.dev as an alternative search mode on the search page.

- [ ] **Leverage entity extraction** — Use `GET /entities` from api.urantia.dev for enhanced topic-based discovery on the explore page.

- [ ] **Use paragraph context endpoint** — `GET /paragraphs/{ref}/context` provides surrounding paragraphs for richer AI chat context in AskAI.

---

## P3 — Ecosystem Builds

### Guided Reading Plans (Build #1)

Highest-impact feature for new reader retention. YouVersion found 3-21 day plans produce the best completion rates.

- [ ] **Reading plan UI** — Plan browser, daily plan view with progress tracking, streak visualization. Leverage existing progress tracking + bookmark infrastructure. Depends on `GET /plans` API endpoints from urantia-dev-api.

- [ ] **"Where Should I Start?" quiz** — Interactive onboarding quiz assessing reader background and interests → personalized plan recommendation. Addresses the #1 newcomer pain point (overwhelmed by 2,097 pages). Depends on `POST /plans/recommend` API.

- [ ] **Passage of the Day** — Daily featured passage with shareable image cards, push notifications, and email digest integration. Ties into existing daily quote cron job infrastructure. Depends on `GET /daily-passage` API.

- [ ] **Reading streaks & milestones** — Gentle progress visualization with badges (papers completed, streak days, Parts finished). Borrowing from Quran.com's planner UX. Uses existing ReadNode data.

- [ ] **Plans with Friends** — Social accountability layer: invite a friend to a plan, see each other's progress. Biggest retention driver per YouVersion research.

### Interconnected Knowledge System (Build #2)

Turn the reading experience into a knowledge network — Sefaria-style cross-referencing.

- [ ] **Inline cross-references** — When reading a paragraph, show related passages in a sidebar/popover. One-click navigation to connected content across Papers. Depends on `GET /paragraphs/{ref}/cross-references` API.

- [ ] **Topic & concept pages** — 200+ browse-able topic pages (Thought Adjusters, Morontia, Paradise, etc.) aggregating every relevant passage. New `/topics` and `/topics/{slug}` pages. Depends on `GET /topics` API.

- [ ] **Knowledge graph visualization** — Interactive visual map of entity relationships and concept connections. Could be a standout explore page feature.

### Study Group Toolkit (Build #3)

Purpose-built tools for the 463+ study groups operating with Zoom + email + physical books.

- [ ] **Public Notes / passage-level discussions** — Community-visible annotations and reflections on paragraphs. Experienced readers post insights that newcomers discover in-context. Fills the void left by TruthBook forum closing (Oct 2024). Modeled on SuttaCentral's per-sutta discussion threads.

- [ ] **Source sheet builder** — Allow study group leaders to curate collections of related passages with their own commentary for each session. Inspired by Sefaria's most popular feature. Depends on `/source-sheets` API.

- [ ] **AI discussion question generator** — Study group leaders get AI-generated discussion questions for selected passages, with human review/editing. Depends on `POST /study/questions` API.

- [ ] **Shared reading sessions** — Synchronized reading view where group members see the facilitator's highlights and annotations in real-time. WebSocket-based.

### AI Study Companion (Build #5)

Evolve AskAI from a basic chatbot into a RAG-grounded study companion.

- [ ] **RAG-grounded responses** — Every AI response cites actual Urantia Papers text with clickable paragraph links. Uses paragraph-level vector embeddings for retrieval. Eliminates hallucination (e.g., AI incorrectly stating the virgin birth).

- [ ] **Multiple AI modes** — "Explain this passage simply" for newcomers, "Show me related passages" using cross-references, "What should I read next?" based on reading history and interests. Mode selector in the AskAI panel.

- [ ] **Difficulty indicators** — Per-paper and per-section difficulty ratings (Beginner-Friendly / Intermediate / Advanced Cosmology). Inspired by SuttaCentral's difficulty ratings. Helps newcomers navigate without external advice.

- [ ] **Multimedia introductions** — Short audio/video introductions for each Part and major section. AI-generated audio summaries at easy/intermediate/advanced levels. Integrated into the reading flow before each Part/Paper.

---

## P4 — Nice to Have / Future

### Architecture

- [ ] **Pages Router → App Router migration** — Next.js 14+ App Router offers server components, streaming, better layouts. Major effort but improves performance and DX.

- [ ] **Offline reading** — Leverage existing `next-pwa` setup for service worker caching of paper content.

- [ ] **i18n support** — Multi-language reading (the Urantia Book has translations).

### Developer Experience

- [ ] **Env validation script** — Check all required env vars from `.env.example` are set on startup.

- [ ] **Pre-commit hooks** — Husky + lint-staged for automated linting/formatting on commit.

- [ ] **CI pipeline** — GitHub Actions workflow: lint, typecheck, test on PRs.

- [ ] **Upgrade ESLint** — Move from ESLint 8 to ESLint 9 flat config.
