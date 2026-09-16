# HOLOS 88 — Phase 03 / CONTENT ARCHITECTURE & CONNECTING

2026-09-16。ローカル実装完了、レビュー待ち。

## 1. 変更ファイル

- AGENTS.md：Phase 03の優先ルールを追加。
- README.md：記事データの編集場所、構造、URLを追加。
- package.json：`npm test`を追加。依存パッケージは追加なし。
- build.mjs：共通記事台帳の読み込み、HOMEの入口と逆引き、記事生成。
- home.template.html：末尾にArticle Windowsを追加し、追加用CSSを読み込む。
- lib/editorial.mjs：既存特集に共通署名・Source Window・関連導線を組み込み。
- dist/app.js：標本のプレビューに逆引き記事を追加。`?object=horse`等の直接リンクとフォーカス復帰。
- dist/editorial.js：既存の資料引出しから記事へ移動できるよう追加。
- dist/index.html、dist/objects/survivor-tree.html、dist/stories/archaeology-of-fear.html：生成結果。

## 2. 新規ファイル

- content/articles.json：共通記事台帳、著者、窓、関係。
- lib/articles.mjs：共通表示部品、記事生成、参照検証。
- dist/articles.css：追加部分だけのCSS。
- dist/articles/horse-time.html：LIFE NOTESのテンプレート。
- dist/articles/five-percent.html：MARKET WINDOWのテンプレート。
- tests/content-architecture.mjs：参照・逆引き・既存資産維持の統合チェック。
- outputs/PHASE03_REVIEW.md：この記録。

## 3. Article System

3種類とも共通台帳と署名、Source Window、Related Story、Collectionへのリンクを利用。通常記事は共通テンプレート。既存9.11特集は章ごとの編集レイアウトを保持するアダプターとして組み込んだ。全面的な作り直しはしていない。

## 4. Content Data

記事：id/window/title/subtitle/author_ids/date/status/route/body/images/sources/related_stories/related_collections/related_specimens/accent_color/revision。

本文：paragraph、heading、source、imageのブロック。画像captionと権利・作者・出典、資料名・URLを分離。関連先は安定IDと編集上の関係説明を持つ。

Museum Featureはbody_refから既存content/specimen-002.jsonを再利用。共通台帳のtitle/subtitle/dateを特集の日本語表示にも反映する。英語displayと章の本文・資料・画像は既存特集JSONが保持する。原稿のない2記事はbody/images/sourcesが空、日付未設定、本文準備中。文章や出典を創作していない。

## 5. 三つの窓

- LIFE NOTES：hachico。土や馬を連想する少量の茶色の罫線、日常の題名と副題。
- MARKET WINDOW：ECHO。黒い罫線と簡潔な見出し。5％の意味・対象を勝手に設定していない。
- MUSEUM FEATURE：同じ著者IDのECHO。既存の特集構成、資料・標本への深い接続。

AI属性ラベル、固定の派手なブランドカラー、生成画像は追加していない。

## 6. Internal Navigation

HOME下部 Article Windows → LIFE → RELATED STORYでMARKET → Waterの標本プレビュー → FROM THIS OBJECTでMuseum Feature、という一周を実ブラウザで確認。

Articleのrelated_collectionsから標本側の関連記事を自動生成する。HOMEのプレビュー、OBJECTページ、STORY内の資料引出しに適用。新規独立標本ページを増やさず、既存の展示を活用。MarketとWaterの関係は本文未入稿のため試作の接続と明示。

## 7. Future CMS

編集するJSON、HTMLを組み立てるモジュール、見た目のCSS、対話用JSを分離。将来の管理画面はデータ層へ接続できる。編集UI、保存API、公開・承認フローはまだない。

## 8. 意図的な未実装

CMS/Admin、会員、EC/決済、外部ブログ連携、ニュースレター、チャット、巨大グラフ、新検索、生成画像、全面的タイポグラフィ改訂、追加の標本ページ。公開配信もしていない。

## 9. 次Phase

LIFE/MARKETの実原稿と出典を入れ、実際の内容に基づく接続を編集する。画像の選定と個別の権利確認。原稿が入った長文で読書リズムを確認した後に、Display Typographyと編集UIの要件を検討する。

## DESIGN BASELINE 01 自己レビュー・検証

- Phase 02の安全なチェックポイント：43c1e30。
- dist/styles.css、dist/editorial.css、collection.json、content/specimen-002.jsonはチェックポイントと完全一致。
- HOMEテンプレートはCSS追加と末尾のArticle Windows差し込み以外、完全一致。
- 既存検索ロジック、グリッド、上部構成、Relationship/MICHIKUSAを保持。入口の追加によりページ全体の高さは増えている。
- build成功。JavaScript構文検査成功。HTML5ページ、内部参照116件、重複ID、関連先と逆引き検証に合格。
- ローカルHTTP：5ページとCSS/JSが200。
- ブラウザ：記事間移動、記事→Water→特集、Horse直接表示、閉じる・Enter・Escapeとフォーカス復帰を確認。
- HOME：PLANTS 3件、検索0件、全10件への復帰を確認。
- MICHIKUSA：開閉し、起点ボタンへ戻れることを確認。
- 新規2記事は390px幅で横溢れなし。LIFEの本文18px、本文幅354px。viewportは検証後に元へ戻した。
- 検証時のconsole error/warnは0件。

## 確認URL

- http://127.0.0.1:8088/#article-windows
- http://127.0.0.1:8088/articles/horse-time.html
- http://127.0.0.1:8088/articles/five-percent.html
- http://127.0.0.1:8088/stories/archaeology-of-fear.html

## 検証の再実行

通常のNode.js/Gitが使える環境では `npm run build` と `npm test`。
このMacのCodex同梱環境ではPATHのgitがXcodeを要求するため、チェック時はHOLOS_GITに同梱fallback/gitの絶対パスを渡した。追加パッケージのインストールは不要。
