# HOLOS 88｜VOICE・FACT・VISUAL RELEASE GATE
Status: adopted editorial rules / implementation review required
Decision owner: ECHO
Scope: HOLOS 88 articles, exhibits, newsletter and SNS adaptations
Updated: 2026-11-15

## 1. Non-negotiable
- Never invent historical facts, quotes, dates, people, documents, or source URLs.
- Check that each cited source actually supports the adjacent claim. A source link alone is not verification.
- Clearly separate DOCUMENTED FACT / RESEARCH / INTERPRETATION / SYMBOL / PERSONAL EXPERIENCE / OPEN QUESTION.
- Unknown provenance, permission or rights => hold the image and its post. Absence of verified imagery is preferable to a fabricated illustration.
- **Do not use AI-generated images in HOLOS 88 articles, exhibits or SNS.** No faux-antique plates, fake archival photography, reconstructed scenes or generated 'museum' illustrations.
- Keep public/commercial identity and ECHO/hachico identity boundaries distinct. Personal essays require separate release authorization.

## 2. Voice must remain authored, not formulaic
**TEAM HOLOS** — plain, precise, measured. Example: 「家でゆっくり過ごす」
**ECHO** — quiet and intellectual, considered pace and spacing. Example: 「お家でのんびりとした時間を過ごす」
**hachico** — warm, unguarded, playful with natural leaps and self-interruption. Example: 「お家でゆっくりのんびり、ほっこりとした時間をすごす」

These are *directional examples*, not mandatory phrases or automatic substitutions.

Review punctuation, pauses, kanji/kana balance, paragraph length, rhetoric, voice, and ending. Preserve author-specific humor and the sometimes awkward but genuine live sentence. Do not smooth it into generic inspiration or abstract AI prose. See `content/voice/hachico-editorial-dna-01.md` for finer hachico guidance.

Never revise an approved master merely to harmonize with these examples; propose a review diff first.

## 3. Preferred authentic visual sources
Priority: contemporary-to-event documentary photography; original scientific and botanical plates; original woodblock/wood engraving/copper engraving; letterpress, period books, maps and catalogues; museum/library collection photography.

Selection must be grounded in *the depicted subject and historical moment*, not merely an antique aesthetic. Later illustrations are identified as later illustrations, never disguised as contemporaneous evidence.

Required before use: creator (if known), object title, approximate date, institution/collection, source URL, license/rights terms, attribution, alt text and evidence that the asset depicts what the article says. Unknown values stay unknown; no invented credits.

No rights or context? Block use. Never substitute an AI image.

## 4. Automated gate: narrow and fail closed
The current `scripts/editorial-safe-queue.py` provides **only** a read-only mechanical candidate inventory based on existing approved statuses, checks and built HTML. Its results are **not** publication permissions.

Required second review before transport:
1. Verify current live URL and released article ID; check duplicates in the existing private posting desk.
2. Verify cited facts and rights records, especially for time-sensitive texts.
3. Human/editorial voice pass for rhythm, punctuation and idiom.
4. Confirm no private ECHO/hachico essays in the batch.
5. Confirm newsletter recipient, SNS account, medium-specific text and image rights.
6. Record post URL or failure; do not label draft preparation as publication.

No standalone permanent 'AI editor' is presumed to be running. Scheduled tasks depend on actual tool connection, budget limits and verified run logs.

## 5. Footer exact copy
世界は∞
急いで通り過ぎるには、面白すぎる

Keep the approved exact copy, including the infinity sign. Revisions to staging/production code must not bring back retired HOME sections.
