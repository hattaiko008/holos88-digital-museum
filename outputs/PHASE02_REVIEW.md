# HOLOS 88 — STORY BASELINE 01 / Review

2026-09-15。Phase 02を実装し、レビュー待ちで停止。

## 確認URL

- HOME: http://127.0.0.1:8088/
- OBJECT: http://127.0.0.1:8088/objects/survivor-tree.html
- STORY: http://127.0.0.1:8088/stories/archaeology-of-fear.html

## 変更ファイル

以下はプロジェクトルート `HOLOS88-DIGITAL-MUSEUM` からの相対パス。

- `content/specimen-002.json`: 8章の日本語本文、標本、出典、メディア、道草、関係データ。
- `lib/editorial.mjs`: 再利用できるOBJECT/STORY生成部品。
- `dist/editorial.css`, `dist/editorial.js`: 新規ページ専用の表示、道草と資料引出し、読書位置・フォーカス復帰。
- `dist/objects/survivor-tree.html`, `dist/stories/archaeology-of-fear.html`: 生成された2ページ。
- `dist/assets/survivor-tree.jpg`: 使用条件を確認した実写。
- `build.mjs`, `dist/index.html`: 新規ページ生成とHOMEのSurvivor Treeリンク。
- `AGENTS.md`: 承認済みHOMEの維持、Phase 02、言語・出典・倫理の追加原則。
- `STORY_DESIGN_RESEARCH.md`: 参照サイト調査と採用原則、アクセス制約。
- `README.md`: 実行方法、データ更新場所、Phase 02範囲。
- `.gitignore`: 作業用ファイルを除外。

## 維持したもの

チェックポイント bad4810（DESIGN BASELINE 01）と比較し、`dist/styles.css`、`dist/app.js`、`home.template.html`、`collection.json`は完全一致。HOMEはSurvivor Treeカードの遷移先以外、HTMLも一致。

既存SeedがH88-0003のため、Dustは既存ID H88-0009を維持。

## 採用原則

V&Aの物から物語への入口、Smithsonianの資料と歴史的文脈、British Museumの収蔵記録の明確さをOBJECTに採用。National Geographicの読書の間、Harper’s BAZAARとBrodovitch研究から文字の大小・非対称・余白のリズムをSTORYに限定して採用。固有のデザイン・文章・画像はコピーしていない。詳細と参照URLはSTORY_DESIGN_RESEARCH.md。

## 内容・画像の状態

- 本文は出典を付けたオリジナルの編集試稿。公開稿としての最終編集は未実施。
- Survivor Tree写真はPumpkinSky、2012-07-16、CC BY-SA 3.0。原本のまま保存し作者・日付・出典・ライセンスを表示。2026年の写真ではない。
- 出典: https://commons.wikimedia.org/wiki/File:Survivor_Tree_at_the_National_September_11_Memorial.jpg
- 三春滝桜・粉塵などは文字による展示。未確認の写真は使用していない。今後実写を追加する際に個別確認が必要。
- 種の写真は既存のブロッコリー種子。Survivor Treeや三春滝桜の種子とは表示しない。
- 水の写真は素材の例示。Memorial現地写真ではない。
- VOIDの図は独自の概念図。実際の配置・方位・縮尺を表す地図ではない。
- 確認できた関係と編集上の接続を区別。SHAMANIC WINDOWは象徴・文化・哲学の視点と明示。

## 検証

- Node生成成功: HOME 10標本、OBJECT 1ページ、STORY 8章、道草1件、関係15件。
- 新規JavaScriptの構文検査成功。
- HTML 3ページ、内部参照77件、重複IDとリンク先・アンカー確認成功。
- 実ブラウザでHOME → OBJECT → STORYを確認。
- デスクトップ幅948px、モバイル幅390pxで新規ページの横溢れなし。
- 道草、三春滝桜の資料引出し、Escape、RETURN TO NEW YORKを確認。元のスクロール位置5297pxと起点ボタンへのフォーカス復帰を確認。
- HOMEのPLANTSは3件、検索0件表示と全件復帰を確認。
- 検証時のブラウザconsole error/warnは0件。

## 次のレビュー

OBJECTの収蔵記録らしさ、STORYの日英文字階層と長文の間、道草に入り戻る感覚を確認してください。

他標本の独立ページ、CMS、DB、ネットワーク図、Phase 03は未実装。公開・外部配信も未実施。
