# HOLOS 88 BILINGUAL SITE STRUCTURE 01

Status: structural direction, 2026-09-29

## One museum, two language editions

Japanese and English use the same article ID, collection ID, relationships, media record, rights data and editorial status. Each language keeps its own title, subtitle, body, captions, alt text, metadata and source notes so that translation can be edited as writing rather than displayed as an automatic overlay.

## Publication rule

- Japanese remains the opening editorial edition.
- Add English per article after translation, cultural editing and source review.
- A language switch appears only when both editions exist; it must never open an unfinished or machine-only draft.
- Switching language keeps the reader at the same article, collection card or thematic shelf.
- Search and category shelves may show both languages but must not duplicate the underlying object.

## Suggested routes

- Japanese: `/ja/articles/{slug}`
- English: `/en/articles/{slug}`
- Collection identity: the same `H88-` ID in both editions.
- Existing article URLs remain valid and may resolve to the Japanese opening edition.

## Editorial fields

Each edition requires: title, subtitle, body, captions, alt text, meta description, social excerpt, language-specific sources where relevant, translator/editor credit and review status.
