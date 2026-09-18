# PHASE 04 — CHATO review handoff

2026-09-17 / 実装・ローカル検証完了。CHATOレビュー待ち。公開・Phase 04 CLOSEは未実施。

## 保存場所と保護

`/Users/hachico/Documents/Codex/2026-09-15/holos88-digital-museum/HOLOS88-DIGITAL-MUSEUM`

Phase 03 checkpoint: `7cd0f53`。戻さず継続。既存ID・URL、collection.json、検索・フィルターのapp.js、既存styles.css/editorial.css、9.11本文データは維持。

## 実装

- HOME: COVER → READ → EXPLORE → CONNECT → WANDER。3つの記事入口を共通グリッド内の非均等な構図にした。
- 5つのCover。LIFE / MARKET / MUSEUM / 既存Moon / ORBIT。画像と見出しを含む面全体が入口。
- 約12秒で1→2→3→4→5、最後で停止。手動・focus・pointer・画面外・タブ非表示で停止し再開しない。
- 正式ロゴを原本と同じバイトで保存。造形・背景・色の変更なし。ORBITは6つの標本入口。
- 2本のPUBLICATION MASTERを記事データに格納。原稿順序、段落、見出し、強調、SOURCE WINDOW、FLOW MAPを維持。
- 共通本文組版、資料の小窓、関連する記事への画像付き入口。9.11の8章と「石ではなく、種だった。」を保持。
- 空のSATORI / audioはデータ構造のみで非表示。CMS・音源・新記事は追加していない。

## 変更ファイル

AGENTS.md、README.md、build.mjs、content/articles.json、home.template.html、lib/articles.mjs、lib/editorial.mjs、package.json、tests/content-architecture.mjs。

生成更新: dist/index.html、dist/articles/horse-time.html、dist/articles/five-percent.html、dist/objects/survivor-tree.html、dist/stories/archaeology-of-fear.html。

## 追加ファイル

content/home.json、content/masters/phase04-publication-master.txt、content/optional-fields.schema.json、lib/cover.mjs、dist/cover-state.js、dist/cover.js、dist/cover.css、dist/reading.css、dist/assets/holos-original.jpg、tests/reading-experience.mjs、本報告、outputs/phase04/内のスクリーンショット。

CONTENT / RENDERING / CSSの分離を維持。記事・出典・画像権利・関連ID・Cover選択・任意SATORI/audioをデータ側で管理する。

## 検証結果

|項目|結果|
|---|---|
|build|PASS: HOME10標本、OBJECT1、特集8章、記事3窓・実原稿2本|
|内部参照|PASS: 5ページ・157参照。リンク先・画像・アンカー・標本queryを確認|
|既存基盤|PASS: 基準CSS・標本データ・特集本文の差分保護検査|
|原稿|PASS: 保管原稿と本文の文字列・順序一致、強調・SOURCE・FLOW検査|
|ロゴ|PASS: 原本SHA-256一致|
|検索・フィルター|ブラウザでPLANTS3件、Pyrus1件、該当なし0件、リセット10件|
|回遊|MARKET→Petroleumプレビュー→MARKETの往復、Collection→Relationship→9.11→LIFEを実操作|
|MICHIKUSA|前回の同一Phase確認でRETURN TO NEW YORK後に元ボタンへfocus、scroll位置5826へ一致して復帰|
|Cover自動|前回の同一Phase実時間確認で50秒時に5、107秒時も5・停止。ループなし|
|Cover手動|キーボード選択後41秒経過しても自動再開なし。状態単体テストもPASS|
|キーボード|矢印/Home/Tabを確認。今回Tab移動先のoutlineがsolidで可視|
|reduced motion|模擬matchMedia環境で51秒後も1。ORBITアニメーションnone。OS設定の実機切替は未実施|
|JSなし|script除去の検証用HTMLで5場面と記事リンクを表示、LIFEへ遷移確認。検証用ファイルは撤去済み|
|responsive|1280px/390pxで確認。390pxでHOME・LIFE・MARKETに横溢れなし。ORBIT6入口とロゴの配置確認|
|console|最終確認用ブラウザの検索・回遊後、errorログ0件|

ブラウザはCodex内ブラウザ。全ブラウザ・実機・支援技術の網羅検証ではない。前回確認と今回の残項目確認を合わせた結果。表示確認後はviewport overrideを解除。

## ローカルURL

- HOME: http://127.0.0.1:8088/
- LIFE: http://127.0.0.1:8088/articles/horse-time.html
- MARKET: http://127.0.0.1:8088/articles/five-percent.html
- MUSEUM: http://127.0.0.1:8088/stories/archaeology-of-fear.html
- OBJECT: http://127.0.0.1:8088/objects/survivor-tree.html

## 未解決・公開前のTEAM HOLOS確認

1. ORBITの6点は図版準備中の文字入口。権利確認済みアーカイブ図版の選定が必要。生成画像で補完していない。
2. 新原稿のSOURCE WINDOWは3件とも出典確定待ち。URLはnull。特にMARKETの2026年9月16日の5％など、市況記述・日付・因果の最終FACT CHECKが必要。原稿を変更せず保持したもので、今回の実装検証は事実確認ではない。
3. LIFEのWater、MARKETのPetroleumは既存収蔵画像を使用。記事当日の雨・市場の現地写真ではない旨をキャプションで明示。
4. 既存Collectionの画像準備中標本は継続。既存画像の作者・出典・ライセンスを保持。新しい権利未確認画像は使用していない。
5. SATORI本文・音声は意図的に空。追加CMS・公開処理・次Phaseは未実施。

## スクリーンショット

outputs/phase04/にHOME、Cover05、LIFE、MARKET、MUSEUM、本文、モバイルを保存。HOMEは最終再撮影。その他は同一Phaseの確認時の撮影で、一部は最後の見出し折返し微調整前。

## 自己レビュー

白・黒・細い罫線・余白とMuseum基盤を保ち、承認された表紙と読書入口だけを拡張した。原稿・原本ロゴ・9.11本文の核を改変していない。Phase 04はCHATOの視覚・編集レビュー待ちとして停止する。
