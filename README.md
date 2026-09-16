# HOLOS 88 — DESIGN BASELINE 01 / STORY BASELINE 01

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
