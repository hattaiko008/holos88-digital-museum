# HOLOS 88 — DESIGN BASELINE 01 / STORY BASELINE 01

今後の編集・配信・会員・顧客対応を含む運営設計は [HOLOS_OPERATING_SYSTEM.md](HOLOS_OPERATING_SYSTEM.md) にまとめています。

## PHASE 02 の確認画面
- HOME: http://127.0.0.1:8088/
- OBJECT: http://127.0.0.1:8088/objects/survivor-tree.html
- STORY: http://127.0.0.1:8088/stories/archaeology-of-fear.html

HOMEのSurvivor TreeからOBJECTへ、READ THE STORYから8章の物語へ進めます。第4章の「道草の小部屋へ」でMICHIKUSAが開きます。小部屋の標本を選ぶと資料を閲覧でき、閉じる／Escape／RETURN TO NEW YORKで元の位置へ戻ります。

### PHASE 02 の更新する場所
- `content/specimen-002.json`: SPECIMEN、Storyのtyped blocks、Object参照、関係経路、出典、メディアの構造化データ。
- `lib/editorial.mjs`: 再利用可能な識別情報、章ブロック、関係経路、出典、資料引出しをHTMLへ生成。
- `dist/editorial.css`: 新しい2ページだけに効く`.phase-two`のスタイル。HOMEの`dist/styles.css`は変更しません。
- `dist/editorial.js`: 道草と資料の開閉、フォーカスと読書位置への復帰、章の現在位置。
- `STORY_DESIGN_RESEARCH.md`: 参照研究、採用した原則、調査できた範囲。

`build.mjs`はHOMEと新しい2ページを生成します。生成HTMLを直接編集しないでください。`collection.json`の既存IDを維持して参照するため、SeedはH88-0003、DustはH88-0009です。

### 内容・写真の状態
本文は出典付きの編集草稿です。現地取材や専門家による査読は未実施。SHAMANIC WINDOWは科学的事実ではなく、象徴・文化・哲学の視点として区切っています。
Survivor Treeは実際の樹木の2012年写真（PumpkinSky / CC BY-SA 3.0 / 原画像）。新規の無許諾画像や生成アーカイブ画像はありません。三春滝桜・粉塵の写真は追加せず、文字の標本ラベルを使っています。二つの空隙の図は配置・方位・縮尺を示さない独自の模式図です。

他のObjectの独立ページ、CMS、DB、多言語翻訳、Phase 03は未実装です。レビュー後にのみ拡張します。

## ローカルで見る
Node.js 22以降を使います。外部パッケージのインストールは不要です。

```sh
npm run build
npm start
```

http://127.0.0.1:8088 をブラウザで開きます。終了はCtrl+C。

## GitHub Pagesで公開する

`main`へ変更を送ると、`.github/workflows/pages.yml`がテスト、静的HTML生成、GitHub Pagesへの公開を順番に行います。プロジェクトサイトのURLに合わせ、`.pages-dist`に作る公開用コピーだけに`/holos88-digital-museum/`を付けます。ローカル用の`dist`と原稿データは変更しません。

手元で公開用生成物を確認する場合：

```sh
BASE_PATH=/holos88-digital-museum npm run build:pages
```

公開先：`https://hattaiko008.github.io/holos88-digital-museum/`

## 更新する場所
- `collection.json`: 標本、画像クレジット、関連ID、関係の試作データ。ここを編集してbuildするとHOMEへ反映します。
- `home.template.html`: ページの文章と構造。
- `dist/styles.css`: 色、文字、余白、画面幅ごとの表示。
- `dist/app.js`: 検索、分類、関係プレビュー、道草の開閉。
- `dist/assets/`: 出典確認済みのローカル画像。
- `AGENTS.md`: 今後のCodexが守る制作原則。

画像のtitle/dateは画像そのものの情報です。Objectのdateとは分けています。不明な値はnullです。種の写真はブロッコリーで、Survivor Treeの種の写真ではありません。収蔵IDは試作用の内部IDです。Relationshipは編集上の問いとして表示し、実証済みの関連や完成したStoryとは区別しています。

## Phase 01時点の範囲（保存記録）
HOMEだけ。標本を選ぶとHOME上の小さなプレビューが開きます。別のObjectページ、Story本文、CMS、DBは未実装です。MICHIKUSAはHOMEから種へ寄り道して元の位置へ戻る試作です。Story公開時には読書位置を保持するReturn to Storyへ拡張します。

## 参照研究
- V&A https://www.vam.ac.uk/collections — object一覧とテーマ別探索を併置し、画像の近くに名前・作者・年代などをまとめる。HOLOSでは写真と短い標本ラベルを優先する。
- Smithsonian https://www.si.edu/explore — 分野を横断するBrowse Topicsと検索の二つの入口。HOLOSでは検索とExplore byを近接配置する。
- Smithsonian Open Access https://www.si.edu/openaccess / https://www.si.edu/openaccess/faq — CC0の対象を個別に識別する。Open Accessの名称だけで全画像を再利用可としない。
- British Museum https://www.britishmuseum.org/collection / https://www.britishmuseum.org/collection/collection-online/guide — keyword/person/place/museum numberの検索、Objectの詳細とテーマの入口。HOLOSでは名前・和名・ID・場所・種名を横断検索する。

British Museumは実ブラウザのCollection画面で確認。V&Aはページ内容、Smithsonianは公式ページの検索索引と公式FAQを確認。自動取得に一部制限があり、全サイトの全画面・全操作を比較検証したものではありません。固有レイアウトや資産はコピーしていません。

## 技術の判断
依存パッケージなしの静的サイトを採用。サーバー利用料のかかるDBやCMSを持たず、静的HTMLとして検索エンジンが標本の内容を読めます。データと表示を分け、将来のページ生成へ流用できます。収蔵数が大きくなった時点で検索やCMSを検討します。

## PHASE 03 — Article Windows

- LIFE NOTES: http://127.0.0.1:8088/articles/horse-time.html
- MARKET WINDOW: http://127.0.0.1:8088/articles/five-percent.html
- MUSEUM FEATURE: 既存の `/stories/archaeology-of-fear.html`
- HOME下部のARTICLE WINDOWSから各記事へ移動。記事末尾のRELATED STORY、INTO THE COLLECTION、標本プレビューのFROM THIS OBJECTで往復できます。

### 内容と表示の分離

`content/articles.json` が共通記事台帳です。`authors`、`windows`はIDで参照し、ECHOはひとつの著者です。各記事はtitle/subtitle/date/status/author_ids/body/images/sources/related_stories/related_collections/related_specimens/accent_color/revisionを持ちます。`body_ref`は既存特集データへの参照で、9.11の本文を複製しません。変更したらbuildしてください。

`lib/articles.mjs`が共通の署名、Source Window、関連導線、通常記事を生成します。既存特集は`lib/editorial.mjs`が章構成を維持したまま共通部品を利用します。`dist/articles.css`は追加部分専用。HOME検索のロジックは維持しています。

本文ブロックは`paragraph`（text）、`heading`（text）、`source`（source_id）、`image`（media_id）。sourcesの項目はid/nameまたはinstitution/title/url/任意summary。imagesはid/src/creator/title/date/institution/source_url/rights/license/credit_line/alt_text/captionを想定し、ローカルassetと権利情報が必要です。revisionは任意のdate/note。現状の2つの新規記事は本文未入稿のためbody/images/sourcesが空で、日付も未設定です。

将来のCMSはこのデータ層を編集する形で追加できます。現段階では編集UIも公開・承認フローもありません。

## PHASE 04 — Reading Experience

Phase 03 checkpoint: `7cd0f53`。

- HOMEはCover → READ（Article Windows）→ Collection → Relationships → MICHIKUSA。
- `content/home.json`: 5場面のCover、既存Moon入口、6標本のORBIT、原本ロゴのハッシュ、将来の環境音設定。
- `lib/cover.mjs`: Coverの静的HTML生成。`dist/cover.js`と`cover-state.js`が自動切替・停止・手動操作を追加。
- `dist/cover.css`, `dist/reading.css`: Coverと読書の追加スタイル。既存Museumの共通CSSは保持。
- `content/articles.json`: 受領したLIFE/MARKET実原稿。`content/masters/phase04-publication-master.txt`は受領時の原文保管。改訂する場合は原本を上書きせず、新しいmasterとrevisionを記録してください。
- SOURCE WINDOWは指定された本文を維持。3件の新規SourceのURLはnull、最終SOURCE DESK待ち。日付付きの市場記述を検証済みとみなさないでください。公開配信はしていません。
- `content/optional-fields.schema.json`: SATORI’S VIEW、記事のsound specimen、ORBITのambient soundの将来用契約。空なら非表示。音声はデータの器のみで、プレーヤー未実装。
- ロゴは受領原本をそのままコピー。圧縮・crop・透明化も行っていません。画像が変わるとbuildで検出します。
- Cover写真は既存の使用条件確認済み資料。Waterは本文当日の雨、Petroleumは市場当日の取材写真ではありません。キャプションで区別。ORBITのarchive図版は未収集。

Coverは12秒ごとに1→5、最後で停止。手動操作後は自動再開しません。reduced motion、focus、pointer、画面外、非表示タブでも停止。ORBITの小さな漂いは別途停止できます。JavaScriptを無効にすると5場面が静的に並びます。

`npm run build` / `npm test`。後者は内部リンク・既存展示維持に加え、原稿の文字と段落順、強調、FLOW MAP、原本ロゴ、Cover状態遷移を検証します。
