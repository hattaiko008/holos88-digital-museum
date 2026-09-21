# HOLOS 88｜DESIGN RECONSTRUCTION RESEARCH 01

Date: 2026-09-21  
Status: design direction / implementation not started  
Decision: the current site is held. This brief starts a new design system while preserving the editorial, archive, source, rights, relationship and monetization architecture.

## 0｜ECHO REVIEW用・提案要約

今回の再構築では、既存サイトを上書きしない。別の試作として、まずHOMEと2本の記事だけを作る。

中心となる変更は次の通り。

- 5枚スライドをHOMEの主入口から外し、最初の画面で記事を一つ選べる「一枚の生きた表紙」にする。
- HOMEは `いま読む / 最新 / Museumへ` の3方向をすぐ見せる。
- HOLOS ORBITは5枚目の演出ではなく、Museumや関係地図の奥へ入る独立した展示にする。
- ナビゲーションは `READ / MUSEUM / ATLAS / LETTER / SEARCH` に整理する。
- 記事をジャンルで固定せず、まず `日記 / 暦 / エッセイ / 解説 / 市場 / 標本 / 展示 / ガイド / 映像` という読み方で分ける。その上に自然、動物、科学、哲学、政治、経済、美術、音楽、工芸など複数の主題を重ねる。
- 公開上の「3つの窓」という固定表記は廃止する。記事はカテゴリーから探せるようにし、増え続けるカテゴリーを少数の大分類、詳細カテゴリー、横断タグ、ATLASで受け止める。
- 大きな見出しや構図をつくる文字には英語を使い、その近くに小さな日本語訳を置く。本文と意味の中心は日本語のままにする。
- 本文は安定した一続きの読み物にする。ブロドビッチ的な大胆さは、表紙、章の変わり目、図版、引用、MICHIKUSA、出口で使う。
- 「恐怖の考古学」は一本の記事として通読できる形を基本にし、必要な場所だけ展示的な見開きを入れる。
- メルマガ、支援、商品、仕事依頼は、読者がHOLOSの価値を体験した後に現れる静かな出口にする。

この方針なら、静寂と読みやすさを土台にしながら、場所ごとに強いエネルギーと驚きをつくれる。

## 1｜What failed in the present site

The site contains the right ideas, but makes the reader work too hard before reading.

1. The five-scene cover delays the first useful choice. A reader sees a presentation before seeing a clear reading path.
2. Article, Collection, Relationship and MICHIKUSA are conceptually rich, but their relative priority is unclear on arrival.
3. The article typography gives too much visual importance to paragraph breaks. Short paragraphs begin to look like poetry, while long-form continuity weakens.
4. Experimental compositions are applied too close to the main reading surface. The result can look like several exhibits rather than one continuous article.
5. Category windows have names, but have not yet gained distinct editorial tempos.
6. Calls to subscribe, support, buy or commission are planned as services, but do not yet have a quiet place in the reading journey.

The reconstruction therefore begins with access and reading, then composition, then motion.

## 2｜The design source beneath the references

The references do not point to one visual style. They reveal five useful systems.

### A. Editorial hierarchy

The Atlantic and Knowable Magazine make the current lead, recent stories, subjects, archive and newsletter visibly different. The reader can enter by urgency, topic or date. HOLOS should borrow that legibility while using fewer modules and more silence.

### B. Museum authority

Gagosian and White Cube let the object or exhibition lead, then attach precise metadata, dates and routes. Their strength is confidence: one work can occupy space without being surrounded by explanation. HOLOS should use this grammar for Collection and Exhibition pages, while avoiding the distance of a commercial gallery.

### C. Archive as a usable index

The Creative Independent exposes a large archive immediately and gives filters, formats, dates and a random route. Gosteli Archiv states what the archive holds and makes research help, catalogue, finds and agenda distinct. HOLOS needs both: an inviting visual index and a serious research structure behind it.

### D. Subject-specific editorial modes

Psyche separates Ideas, Guides, Life Stories and Notes to Self. The subject may be similar, but the reader knows what kind of experience is offered. BBC Earth separates Animals, Nature, Science and Sustainability, then lets strong imagery carry each entry. HOLOS should define formats before multiplying categories.

### E. Motion as punctuation

MotionSites and 60fps.design are useful as motion dictionaries. They are not the visual foundation. HOLOS can use reveal, crop change, quiet parallax, orbital displacement and page transition when they clarify an editorial action. It should reject glossy 3D, particles, product-demo motion and movement that delays reading.

## 3｜Brodovitch translated into the web

Brodovitch is not a font, black-and-white styling or a vintage effect. The useful principles are:

- radical changes of scale;
- asymmetrical spreads;
- cropped images that continue beyond the frame;
- white space as an active shape;
- tension between image and type;
- surprise at a turn, followed by calm;
- repetition with deliberate breaks in rhythm.

For HOLOS, the digital translation is:

```text
stable reading column
        +
occasional editorial spread
        +
meaningful image crop
        +
quiet transition
```

The body text remains dependable. Brodovitch enters at the title, section threshold, image sequence, quotation, diagram, MICHIKUSA branch and ending. It does not rearrange every paragraph.

## 4｜New information architecture

### The three public floors

```text
MAGAZINE / READ
What is being published now

MUSEUM / COLLECTION
What has been collected and documented

ATLAS / RELATIONSHIPS
How an object, place, time and idea lead to another
```

MICHIKUSA is the movement between these floors. It is not a fourth pile of content.

### Global navigation

```text
READ  /  MUSEUM  /  ATLAS  /  LETTER          SEARCH
```

- `READ` opens the current issue and all articles.
- `MUSEUM` opens Objects, Collections and Exhibitions.
- `ATLAS` opens map, time and relationship routes.
- `LETTER` opens the free letter invitation.
- `SEARCH` is visible on every page and searches titles, text, objects, places, people, time and relationships.

`SUPPORT`, `SHOP`, `WORK WITH HOLOS`, About and Source Policy belong in a quiet utility area and footer. They should not compete with reading in the primary navigation.

### Language hierarchy

HOLOS is primarily read in Japanese. English creates display composition; it does not replace the content language.

```text
LARGE ENGLISH DISPLAY
小さな日本語の見出し・和訳

日本語の導入と本文
English metadata only where useful
```

- Hero titles, section names, issue names and exhibition-room titles may use large English display type.
- A concise Japanese title or translation sits close enough to be understood without searching.
- Standfirst, navigation help, article summaries, body copy, source explanation and calls to action remain natural Japanese.
- English is not added as decoration when it weakens meaning or creates a false bilingual identity.
- Japanese titles may still become large when the words themselves are the visual subject, but this is an editorial exception rather than the default template.
- Screen readers and page metadata receive the full Japanese title; visual hierarchy must not hide meaning.

This gives English the role of poster and Japanese the role of voice.

### Typography direction

The design needs three typographic voices, not one font forced to do every job.

1. **DISPLAY SERIF / English** — high contrast, editorial, capable of extreme scale and tight composition. Test a Bodoni/Didot lineage and a slightly softer contemporary editorial serif. Candidate trials: `Bodoni Moda`, `Cormorant Garamond`; compare with licensed contemporary options before selection.
2. **JAPANESE READING SERIF** — calm Mincho with clear punctuation and kana at 17–19px. Candidate trials: `Noto Serif JP`, `Shippori Mincho`. The final choice must be tested for long reading, weight, loading cost and licensing.
3. **UTILITY SANS / labels and data** — restrained grotesk for dates, categories, source status, captions, navigation and numbers. Candidate trial: a local/system sans or `Noto Sans JP` where Japanese labels are needed.

Type creates energy through scale, crop, tracking, alignment and contrast. It should not depend on novelty fonts. A large English word may run off the page edge; the Japanese translation remains intact and quiet. Body Japanese never inherits the compressed spacing used for display English.

Rules for trial pages:

- English display can be very large, tightly spaced and asymmetrical.
- Japanese translation is smaller but not faint; it must remain comfortably readable.
- Avoid full-width Japanese set in extremely large multi-line blocks as the default hero treatment.
- Avoid excessive all-caps in long English titles; use it for short category or section names.
- Use italics for source or editorial nuance only where the selected font has a real italic.
- Do not load many font families or weights. The prototype should prove the system with a small, deliberate set.

## 5｜A new HOME: one living cover

Retire the five-slide cover as the main entrance.

The new HOME uses one editorial cover at a time. The first viewport contains one dominant story and three visible ways forward. No waiting is required and no carousel controls are necessary.

```text
HOLOS 88                                       SEARCH

                 [DOMINANT IMAGE]
        LARGE TITLE / CURRENT STORY
              one-line standfirst

READ THE STORY       LATEST       ENTER THE MUSEUM

─────────────────────────────────────────────────
TODAY / NEW          THREE SECONDARY WINDOWS
```

The dominant image can be a photograph, painting, woodcut, map, manuscript or scientific illustration. Type may be black, white or a sampled restrained tone according to the image. The credit is always reachable.

Below the cover:

1. **NOW** — three to five recent reading entries, immediately legible.
2. **CURRENT CONSTELLATION** — one curated relationship: for example Seed → Time → Soil → Prayer.
3. **FROM THE MUSEUM** — objects and collections with precise labels.
4. **FROM THE ATLAS** — one place, one time route and one unexpected relation.
5. **LETTER** — after the reader has seen the value of the publication.

### HOLOS ORBIT

HOLOS ORBIT becomes a destination inside ATLAS or MUSEUM rather than the fifth cover scene. The original logo remains untouched at its centre. Rights-cleared woodcuts and natural-history line drawings move slowly along flat paths. The orbit becomes a way to enter objects and relationships, not a decorative finale.

## 6｜Category system and editorial formats

The former public label of “three windows” is retired. LIFE NOTES, MARKET WINDOW and MUSEUM FEATURE may survive as series names when editorially useful, but they no longer define the whole publication.

### Categories can grow without growing the navigation

The site uses four levels:

```text
REALM          broad shelf
CATEGORY       named subject
TAG            precise recurring term
RELATIONSHIP   an explained path between entries
```

Initial Realms:

| Realm | Japanese guide | Example categories |
|---|---|---|
| LIFE | 暮らしと生命 | Daily Life, Season, Food, Wellbeing, Animals |
| EARTH | 地球と自然 | Climate, Ecology, Land, Water, Plants, Evolution |
| HUMAN | 人間と社会 | Body, Mind, Education, Politics, Economy, Work |
| TIME | 時間と記憶 | History, Archaeology, Calendar, Future, Archive |
| IMAGINATION | 思想と表現 | Philosophy, Art, Literature, Music, Film, Belief |
| MAKING | 手と技術 | Craft, Tools, Agriculture, Design, Technology |
| COSMOS | 天体と未知 | Moon, Stars, Space, Physics, Time |

These are shelves, not walls. One article may belong to several Realms. `Seed`, for example, may connect LIFE, EARTH, TIME and MAKING. No fixed colour is assigned to a Realm.

Only a small changing selection of categories appears on HOME. The complete category index belongs inside READ and SEARCH. Popularity alone does not decide visibility; editorial relevance and the current constellation also matter.

### Formats describe how the piece is read

HOLOS can grow to many subjects without turning the navigation into a department store. Every work receives one **format**, then many **subjects and relations**.

| Format | Public voice and purpose | Typical subjects |
|---|---|---|
| LIFE NOTE | hachico, daily life and field observation | rain, Kohaku, horse, food, work |
| ALMANAC | hachico, seasonal fixed-point observation | solar terms, moon, stars, customs, care |
| ESSAY | ECHO, an idea explored through the world | philosophy, history, politics, culture |
| EXPLAINER | TEAM HOLOS / ECHO, evidence-led understanding | science, ecology, economy, systems |
| MARKET WINDOW | ECHO, timestamped observation | rates, currency, oil, policy, household life |
| OBJECT | museum record centred on one thing | seed, horse, clock, tree, tool, painting |
| EXHIBITION | several objects composed as one journey | fear, prayer, land, evolution, time |
| GUIDE | practical, finite and useful | how to observe, read, care, visit, research |
| SCREEN ESSAY | writing given duration, image and sound | selected essays and exhibitions |

Subjects remain plural: Nature, Animals, Climate, Science, Body, Philosophy, Art, Music, Books, Craft, Economy, Politics, History, Spirituality and more. One article can inhabit several subjects without being duplicated. The visible category name tells the reader what world they are entering; the format tells them what kind of reading experience awaits.

### Category page composition

Every category page uses the shared HOLOS system but receives an editorial composition based on its material.

```text
ANIMALS
動物

one leading story
current articles
objects and species
places on the Atlas
related categories
```

The large English category name provides visual force. The small Japanese name provides immediate orientation. Below it, Japanese introductions explain why these pieces have been gathered together now.

Category pages are curated landings, not automatic tag dumps. They may combine articles, objects, images, maps, timelines, books and MICHIKUSA routes. The underlying metadata remains reusable so the same work can appear in another relevant category without creating a duplicate article.

## 7｜Page modes by content family

All pages share one grid, type system, metadata system and navigation. Their tempo changes.

### hachico / LIFE NOTES

- Immediate chronological entry; date, title and two-line opening visible.
- Warmer paper tone may appear locally, never as a fixed category colour.
- Small field images, marginal notes and domestic details can interrupt the grid.
- Archive can switch between `latest`, `season`, `place`, `animal`, `food` and `random`.
- The article body is continuous and conversational. Design does not force every sentence into an isolated beat.

### ALMANAC / SEASONAL WINDOWS

- Current solar term, moon phase and observed local signs at the top.
- Calendar rail for the year; archive material and scientific diagrams placed with source labels.
- Distinguish astronomical fact, traditional calendar, regional custom and hachico's observation.
- Routes into food, body, star lore, folk practice and ecology.

### ECHO / ESSAYS AND EXPLAINERS

- Strong title, short standfirst and a clear reading estimate or section map.
- A stable reading column, with one wide visual spread at meaningful thresholds.
- SOURCE WINDOW remains near the claim it supports, then a full source desk at the end.
- Explain context and specialist terms without becoming an encyclopedia.

### MARKET / CIVIC WINDOW

- Timestamp, market or political context and verification status are prominent.
- Slightly denser newspaper rhythm; charts and numbers use a plain factual style.
- Separate observation, reported fact, interpretation and open question.
- Archive by date and subject; corrections remain visible.

### MUSEUM / OBJECT AND EXHIBITION

- One object or image leads; label, date, maker, institution, rights and source remain exact.
- Object pages stay quiet and factual.
- Exhibition pages can be bold and Brodovitch-like: large crops, alternating scale and sectional “rooms.”
- Every exhibition still provides a continuous `READ AS ONE ESSAY` route. This resolves the current problem where an experimental page stops feeling like one article.

### NATURE / ANIMALS / CLIMATE

- Image-led openings where the image is specific and rights-cleared.
- Species, place, time and ecological relation are searchable metadata.
- Systems diagrams can show consequence without turning the page into an infographic dashboard.
- Avoid generic planetary grandeur and anonymous wildlife spectacle.

### CULTURE / ART / MUSIC / BOOKS

- Faster scale changes and more energetic crops.
- Media-specific actions: listen, view work, open bibliography, see exhibition, find edition.
- Reviews and recommendations disclose the basis of selection and affiliate status.

### CRAFT MAP / FUTURE SHOP

- Place × material × technique × maker × tool × season × life.
- Read the place and practice before seeing a product.
- Product, digital guide and commission routes appear as consequences of the story.

## 8｜Article reading system

### Entry

Each article begins with:

```text
FORMAT / SUBJECT / DATE
TITLE
STANDFIRST
BYLINE
HERO OR FIRST IMAGE
```

The first screen must say what the article is, why it may matter and where reading begins.

### Body

- Japanese desktop line length: approximately 34–40 full-width characters.
- Body size target: 17–19px, verified on actual Japanese fonts and devices.
- Line height target: approximately 1.75–1.9; paragraph spacing approximately 0.9–1.25em.
- Paragraphs follow thought units. CSS creates rhythm; the manuscript is not broken into poetic single lines to create air.
- Section gaps are visibly larger than paragraph gaps.
- Desktop may offer a quiet section index. Mobile remains a single column.
- Pull quotes are rare. They mark an actual turn in the argument.

### Continuity and play

The default view is `READ`. Experimental material sits inside deliberate spreads or can open as `VIEW AS EXHIBITION`. The reader never loses the article merely because the layout becomes adventurous.

### Ending

```text
SATORI'S VIEW — only when present
SOURCE DESK
MICHIKUSA — 3 meaningful branches with relationship labels
LETTER — receive the next window
SUPPORT / RELATED EDITION — only when relevant
```

MICHIKUSA entries explain the relation: `same object`, `another time`, `opposing view`, `from idea to body`, `from market to life`. “Related articles” by category alone are insufficient.

## 9｜Motion and interaction rules

Motion is allowed when it describes an action:

- a cropped image reveals its full plate;
- a label opens beside an object;
- a relationship line connects two known points;
- a page changes from essay to exhibition view;
- an orbital object slowly changes position;
- a saved reading or search filter confirms its state.

Baseline durations should feel immediate for controls and slow only for ambient movement. All essential content works without motion. Reduced-motion removes ambient motion and transforms reveal effects into direct state changes.

Reject:

- continuous home carousel;
- text that waits for animation before becoming readable;
- cursor tricks;
- generic 3D, glow, particles and liquid gradients;
- scroll hijacking;
- identical hover animation on every card;
- motion copied from template galleries without editorial meaning.

## 10｜Quiet monetization routes

The commercial architecture remains unchanged, but its placement becomes precise.

| Reader moment | Offer | Placement |
|---|---|---|
| First useful visit | Continue reading | cover and article index |
| After one article or constellation | Free Letter | article end and HOME after content |
| After repeated value | Quiet Support | footer, About, selected article endings |
| Wants to keep or revisit a body of work | Paid edition / PDF / screen essay | related collection and shop shelf |
| Sees HOLOS as capable work | Commission | method page and footer |
| Reads craft/place research | Digital guide or physical object | after maker, place and material context |

No email takeover on arrival. No paid wall across the first encounter. No product block inserted into the middle of a serious article. The strongest call to action is the next meaningful piece of content.

CTA language belongs to HOLOS:

```text
この窓を読む
収蔵棚へ
関係を辿る
次の便りを受け取る
この仕事を支える
一緒に窓をつくる
```

## 11｜What to borrow / what to leave

| Reference family | Borrow | Leave |
|---|---|---|
| Atlantic / NYT / BBC | hierarchy, latest/archive distinction, legibility | density, breaking-news pressure, ad rhythm |
| Knowable | clear subject doors, strong standfirst, science accessibility | many repeated card modules, intrusive donation interruption |
| Gagosian / White Cube | image authority, exact exhibition metadata, space | commercial-gallery distance and sales-first account flows |
| Creative Independent | archive immediacy, formats, filters, random discovery | uniform grid as the main visual language |
| Psyche | format distinction, guide/idea/life-story clarity | save/comment/account features at launch |
| BBC Earth | specific imagery and subject confidence | generic spectacle, promotional carousel and advertising rhythm |
| Gosteli Archiv | research help, catalogue seriousness, archive finds | institutional navigation depth on the public front page |
| Motion galleries | microinteraction vocabulary | template identity, decorative motion and SaaS finish |

## 12｜Prototype sequence

Build a separate reconstruction prototype. Do not overwrite the held site until the direction is approved.

### Prototype 01 — HOME + one reading path

- new one-cover HOME;
- immediate latest/read entries;
- one hachico article card;
- one ECHO article card;
- one Museum exhibition entry;
- one HOLOS ORBIT/ATLAS entry;
- search visible but may use the existing dataset;
- desktop and 390px mobile.

### Prototype 02 — two article modes

- `最近、雨ばっかり。` as LIFE NOTE;
- `THE ARCHAEOLOGY OF FEAR` as continuous ESSAY with optional exhibition spreads;
- typography, source window, MICHIKUSA and SATORI'S VIEW.

### Prototype 03 — archive and services

- READ index with format and subject filters;
- MUSEUM index;
- LETTER, SUPPORT and WORK WITH HOLOS placements;
- verify that monetization never blocks discovery or reading.

Only after these three surfaces feel right should the full site migrate.

## 13｜Acceptance questions

```text
Can a first-time visitor open a real article within one clear action?
Can the visitor understand whether a page is a diary, essay, explainer, object or exhibition?
Can a long article be read without interpreting the design?
Does one deliberate spread still feel part of the same article?
Can an image be traced to its creator, institution, source and rights?
Does MICHIKUSA explain why the next path exists?
Does the site feel quiet before it moves?
Does movement carry meaning?
Can a reader support, subscribe or commission only after understanding the work?
Does every route eventually return to Life?
```

## Research references reviewed

- https://gagosian.com/
- https://www.whitecube.com/
- https://www.theatlantic.com/
- https://knowablemagazine.org/
- https://thecreativeindependent.com/
- https://www.gosteli-archiv.ch/
- https://www.bbcearth.com/
- https://psyche.co/
- https://motionsites.ai/
- https://60fps.design/
- https://cta.gallery/
- https://navbar.gallery/

The remaining supplied references stay in the research queue for visual comparison during Prototype 01. Their specific layouts, assets and code are not copied.
