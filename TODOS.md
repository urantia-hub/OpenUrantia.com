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

- [ ] **Reduce `any` types** — 571 instances of TypeScript `any` across the codebase. Start with service layer and API routes where types are well-defined.

- [ ] **Refactor paper reader page** — `pages/papers/[paperName].tsx` has 20+ useState calls. Extract into custom hooks: `usePaperReader`, `useAudioPlayer`, `useBookmarks`, `useNotes`, etc.

- [ ] **Replace moment.js** — 300kb+ and deprecated. Use `date-fns` or native `Intl.DateTimeFormat`.

- [ ] **Replace full lodash import** — Only used for `throttle`. Use `lodash.throttle` standalone package or native implementation.

- [ ] **Replace console.log debugging** — Use structured logging utility (`utils/logger.ts`) that can be silenced in production and integrates with Sentry.

- [ ] **Remove dead code** — `pages/sentry-example-page.tsx`, `pages/api/sentry-example-api.ts` (Sentry example/demo files, not linked anywhere).

- [ ] **Clean up globals.css** — Remove commented-out `.todo` class, fix duplicate CSS rules (`.urantia-dev-pb-4`, `@keyframes pulse`), remove deprecated vendor prefixes.

### Testing

- [ ] **Set up testing framework** — Vitest + React Testing Library. Add `vitest.config.ts` and test scripts to `package.json`.

- [ ] **Add service layer tests** — Unit tests for BaseService, BookmarkService, NoteService, ReadNodeService, UserService.

- [ ] **Add API route tests** — Integration tests for critical routes: search proxy, progress, bookmarks, notes, auth.

- [ ] **Add component tests** — Paper reader core functionality, search page, modals (AskAI, Share, Note, BookmarkCategory).

### Error Handling

- [ ] **Add React Error Boundaries** — Wrap paper reader, search, explore, and my-library pages with error boundary components that show user-friendly fallback UI.

- [ ] **Improve API error responses** — Replace generic 500s with console.error with structured error responses leveraging Sentry's `captureException`.

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

## P3 — Nice to Have / Future

### Architecture

- [ ] **Pages Router → App Router migration** — Next.js 14+ App Router offers server components, streaming, better layouts. Major effort but improves performance and DX.

- [ ] **Offline reading** — Leverage existing `next-pwa` setup for service worker caching of paper content.

- [ ] **i18n support** — Multi-language reading (the Urantia Book has translations).

### Developer Experience

- [ ] **Env validation script** — Check all required env vars from `.env.example` are set on startup.

- [ ] **Pre-commit hooks** — Husky + lint-staged for automated linting/formatting on commit.

- [ ] **CI pipeline** — GitHub Actions workflow: lint, typecheck, test on PRs.

- [ ] **Upgrade ESLint** — Move from ESLint 8 to ESLint 9 flat config.
