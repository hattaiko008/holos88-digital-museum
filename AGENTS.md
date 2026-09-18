# HOLOS 88 — 継続制作の原則

## Identity / scope
- HOLOS 88 / A NATURAL HISTORY OF NOW. / いま、という時代の博物誌。
- 世界は、やおよろず。小さな窓から、世界を見る。世界から、Lifeへ帰ってくる。
- 新聞は読む、博物館は見る、アーカイブは調べる。HOLOS 88は関係を辿る。
- ユーザーは非エンジニア。重要な判断は日本語で簡潔に説明し、実装は主体的に進める。
- Prototype 01はHOMEのみ。レビュー後の明示的な指示までCollection/Object/Story等の別ページを大量に作らない。今回はローカル確認まで。

## UX / visual principles
- OBJECTが主役。白またはニュートラルな背景、大きな画像、明確な文字階層、余白、整った展示グリッド。
- V&A Collections、Smithsonian Explore/Open Access、British Museum Collectionの実際のUIを研究する。ロゴ・文章・画像・コード・固有デザインはコピーしない。
- 検索とExplore byを主要な入口にする。分類は記事カテゴリーではなく、世界の存在・素材・場所・概念などの探索軸。
- 最新記事、人気記事、巨大な宣伝ヒーロー、SaaS風UI、過剰なカード枠・角丸・グラデーション・装飾アニメーション・偽のヴィンテージ表現を避ける。
- 独自性はRelationship / MICHIKUSA / NOW / LIFEから生む。装飾で表現しない。
- Relationshipは方向・関係ラベル・根拠を持つデータとし、単なる同一カテゴリ記事の一覧にしない。編集上の仮説と検証された関係を区別する。
- MICHIKUSAは文脈を保った寄り道。将来Storyから入る場合はReturn to Storyで読んでいた位置とフォーカスへ戻す。HOME試作ではHOMEへ戻すと正確に表示する。

## Content / rights
- 初回Story候補: SPECIMEN 002 / 9.11 — THE ARCHAEOLOGY OF FEAR / 恐怖の考古学——25年後、一本の樹木から世界を見る。
- 中心Object: Survivor Tree、Pyrus calleryana、New York / World Trade Center（ユーザー提供の試作データ）。
- 関係候補: Survivor Tree → Seed → Memory → Ground Zero → Dust → Body → Fear → War on Terror → Fukushima → Miharu Takizakura → Earth → Life。公開前に編集・検証する。
- Prototype画像は明示したplaceholder、Public Domain、CC0、個別に使用条件を確認したOpen Accessに限定。Web上にあるだけで転載しない。一般的な樹木の写真を実在する特定の樹木として表示しない。
- 全画像にcreator/title/date/institution/sourceUrl/rights/licenseUrl/altを持たせる。不明値はnull。出典や権利を捏造しない。
- 全Objectは安定したIDとtype/date/place/species/material/creatorMaker/associatedEvents/sources/rights/relatedObjectIds/relatedStoryIdsを持てる構造にする。
- 仮データ・準備中の画像・未検証の関係を本物の収蔵実績や完成記事と誤認させない。

## Implementation
- 当面は依存パッケージなしのHTML/CSS/JavaScript + JSON。CMS、DB、アカウント等を先回りして追加しない。
- `collection.json`を唯一の標本データとし、`build.mjs`でHOMEの静的HTMLと埋込データを生成する。生成した`dist/index.html`は直接編集せず`home.template.html`を編集する。
- 外部フォント・画像ホットリンク・追跡処理は不要。画像は適切なサイズでローカル配信。
- セマンティックHTML、キーボード操作、見えるフォーカス、十分なコントラスト、フォームラベル、検索0件状態、モバイル表示を保つ。
- 検索・フィルター・関係プレビューを実際に動かす。ダミーリンクで未実装ページへ誘導しない。
- 変更後は生成処理、JS構文、ローカルHTTP、アセット、主要操作、狭い幅を確認。HOME完成時点で止めてレビューを求める。

## PHASE 02 — 優先する追加ルール（2026-09-15）
- HOMEはユーザー承認済みのDESIGN BASELINE 01。グローバルCSS、HOMEの構造・余白・分類・検索挙動を再設計しない。HOMEのSurvivor TreeからOBJECTへの接続だけを追加する。
- Phase 02で認められた追加はSurvivor Tree OBJECT、SPECIMEN 002 STORY、MICHIKUSAの小部屋、関係経路だけ。Phase 03はレビュー承認後。
- 既存`collection.json`の標本IDを保持。SeedはH88-0003、DustはH88-0009。新しい物語データは`content/specimen-002.json`から既存IDを参照し、HOMEの試作データを書き換えない。
- 英語はdisplay/taxonomy、日本語は物語の主要言語。日英見出しをすべて同じ重みで二重化しない。学名は自然なラテン語表記。
- COLLECTIONは静かに、OBJECTは正確に、STORYは表現豊かに。新規ページのCSSは`.phase-two`に限定し、HOMEへ流出させない。
- 9.11の大量死、病気、戦争、継続する悲嘆を見世物にしない。炎上するビル、破壊の演出、偽アーカイブ、偽引用を使わない。
- 新規画像は今回ユーザーが認めた「明確に再利用可能な素材」も対象。CC BY/CC BY-SAは個別の出典・作者・ライセンスリンク・加工有無を表示し、その条件を守る。権利不明素材はplaceholder。
- MEDIAはcreator/title/date/institution/source_url/rights/license/credit_line/alt_textを持つ。既存のcamelCase画像データは変換して利用し、破壊的に移行しない。
- MICHIKUSAは主文を残したdialogとして開き、閉じる・Escape・RETURN TO NEW YORKで元の読書位置とフォーカスへ戻る。別Objectは小部屋内の資料引出しで辿れる。
- 三春滝桜自体が3.11の瓦礫から救出されたとは書かない。苗木贈呈の確認済みの記録と、ニューヨークとの編集上の比較を区別する。
- 事実・証拠・仮説・争点・反証された主張・不明を区別。政府、メディア、SNS、自分の好む説明にも同じ基準を適用する。
- SHAMANIC WINDOWは象徴・文化・哲学の編集モードと明示し、歴史や科学の事実として扱わない。
- 本文は再利用可能なtyped blocks、資料・画像・関係はID参照。CMS/DBは作らない。出典は段落近くと末尾で辿れるようにする。

## PHASE 03 — CONTENT ARCHITECTURE（2026-09-16）
- Phase 03はユーザー承認済み。3つのArticle Windowと既存Museumを接続する。HOMEは下部のArticle Windows入口だけを追加し、既存の余白・文字・グリッド・検索を維持。
- LIFE NOTES / hachico、MARKET WINDOW / ECHO、MUSEUM FEATURE / ECHO・TEAM HOLOSは同一サイトの窓。ECHOの著者IDを窓ごとに分けない。
- 記事共通データはcontent/articles.json、標本はcollection.json、既存特集本文はcontent/specimen-002.json。既存本文を重複保存しない。
- 原稿のない記事の本文・日付・引用・出典を創作しない。placeholder状態と本文準備中を明示する。
- BODY = SYSTEM / DISPLAY = COMPOSITION。本文の可読性を優先し、大規模なdisplayやタイポグラフィの改訂は別Phase。
- SOURCE WINDOWは小さな罫線と資料名・リンク。本文の声と外部資料を区別する。出典未登録は準備中と表示。
- 関連記事と標本は安定IDで参照。標本から記事への逆引きを生成する。関係の説明は編集上の導線であり、未入稿の内容について事実を推定しない。
- accent_colorは任意、少量の装飾線に限る。AIを表の意匠や属性ラベルにしない。
- CMS/Admin、課金、会員、ニュースレター、チャット、巨大グラフ、新検索、生成画像は追加しない。

## PHASE 04 — READING EXPERIENCE（承認済み）
- Phase 03 checkpointは7cd0f53。既存ID/URL、検索、標本と記事の逆引きを維持。HOMEの流れはCOVER → READ → EXPLORE → CONNECT → WANDER。
- 原本ロゴはdist/assets/holos-original.jpg（受領名IMG_1438.jpg）。content/home.jsonのSHA-256で同一性を確認。再生成・描き直し・ベクター化・造形修正は禁止。現在は原本のバイトをそのまま保存。
- content/home.jsonが5場面とORBITの設定。12秒間隔、1→2→3→4→5で停止。手動操作・focus・pointer・画面外・タブ非表示で停止し、自動再開しない。reduced motionでは自動切替も漂いも無効。
- COVER 04は既存Moon。ORBITは6標本、図版未確認部分は文字placeholder。画像や歴史写真を生成して埋めない。
- LIFE/MARKETのPUBLICATION MASTERはcontent/masters/phase04-publication-master.txtに保管。本文はcontent/articles.jsonへ転記。原稿の段落・順序・強調・見出し・SOURCE WINDOW・FLOW MAPを維持し、生成・要約・リライト・未記載文章の補完をしない。
- 完成原稿にも元から短い独立段落がある。それを勝手に結合せず、複数文の段落も分割しない。呼吸はCSSで調整。
- SOURCE WINDOWの未確定URLはnull、verification_statusはpending-source-desk。推測で出典を追加しない。ユーザーの最終SOURCE DESK確認前に公開済み・検証済みと扱わない。
- 表示署名はWORDS BY hachico / WRITTEN BY ECHO。属性や人物間の関係を説明しない。
- SATORI’S VIEWと音声は任意。空ならUIを出さない。音の制作・取得・再生UIは今回は実装しない。将来も自動再生禁止。
- 共通本文は18px・約660px幅・約2.05行高を基本にする。displayは局所的な構図として扱い、カテゴリー固定色は付けない。
- JSがなくても記事のリンクと静的Coverにアクセスできること。生成HTMLは直接編集しない。
