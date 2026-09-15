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
