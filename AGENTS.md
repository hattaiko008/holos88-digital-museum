# HOLOS 88 — current working contract

## Scope and identity
- Current user directions override historical phase rules. Preserve the previous site as a reference. `prototype/reconstruction-01/` is the active design line to refine from now on; do not merge the legacy design back into it by default. Direction: `content/briefs/design-reconstruction-research-01.md`.
- Museum of Relationships: magazine, collection, relationships. English display with readable nearby Japanese; Japanese reading. Growing categories, no fixed three-window taxonomy or category colours.
- Keep hachico/ECHO publicly unlinked. WORDS BY hachico / WRITTEN BY ECHO. Empty SATORI’S VIEW and sound containers stay hidden.

## Preserve
- Original logo dist/assets/holos-original.jpg: exact bytes and SHA-256 in content/home.json. No redraw, generation, vectorization or cleanup.
- Stable IDs/URLs, article/object backlinks, search, keyboard access, mobile reading, reduced-motion, primary links without JS. MICHIKUSA returns to reading position and focus; no autoplay sound.
- Publication masters and paragraph meaning; rewrite only in authorized scope. Distinguish fact, interpretation, hypothesis and uncertainty; verify current/high-stakes claims before publication.
- Image rights and creator/title/date/institution/source/license/credit/alt metadata; unknown stays null. No invented historical images/sources. Pending-source-desk is not verified.

## Read only relevant sources
- Build: home.template.html and build.mjs; never directly edit generated HTML. HTML/CSS/JS + JSON; no speculative CMS/database/dependencies.
- Articles: content/articles.json; feature: content/specimen-002.json; objects: collection.json; cover/logo: content/home.json; originals: content/masters/.
- Editorial: HOLOS_OPERATING_SYSTEM.md; ideas: HOLOS_ARCHIVE_BACKLOG.md.
- Services: content/briefs/service-backend-architecture-01.md; distribution: content/briefs/monetization-distribution-01.md. Free Substack, note discovery, PayPal/Ko-fi candidate, low-touch content. External sending/payment/publication requires actual authorization.
- Team workflow: `content/briefs/holos-team-loop-operating-system-01.md`. CHATO is the single intake and orchestrator. Treat desks as modes before creating persistent agents. Route work by task shape and measured benefit, not vendor claims.
- Historical details: docs/history/agents-before-efficiency-2026-09-21.md. Consult relevant sections for existing cover behavior, Survivor Tree/Fukushima, SHAMANIC WINDOW or legacy phase constraints. Old freezes do not override the current user.

## Efficiency without reducing capability
- Preserve selected model/reasoning settings. No reasoning cap or reduction of evidence, safety or validation.
- Search filenames/headings first; read relevant ranges. Avoid whole histories/all briefs or rereading unchanged files.
- Long Markdown: `python3 scripts/read-section.py FILE` lists headings; add an exact heading to read its complete section.
- Filter tool results to needed fields and errors before returning them. Begin with short search output and bounded shell output; expand when needed. Never discard failures or infer unseen evidence.
- Inspect actual browser visuals where needed, with focused snapshots instead of whole multi-page trees when supported. Image/base64 bytes are not text-token counts.
- Save reusable deliverables; summarize outcome/evidence/limits and link them in chat. Do not repeat the whole document. Requested article manuscripts retain full length.
- Run appropriate checks once, rerun affected checks after fixes. Docs-only: diff and links. Site changes: build, affected tests, mobile/visual checks.
- Local commit is not GitHub upload; report a remote update only after verified push.
