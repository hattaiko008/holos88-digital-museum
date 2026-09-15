# HOLOS 88 — HOME Prototype 01

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

## 範囲
HOMEだけ。標本を選ぶとHOME上の小さなプレビューが開きます。別のObjectページ、Story本文、CMS、DBは未実装です。MICHIKUSAはHOMEから種へ寄り道して元の位置へ戻る試作です。Story公開時には読書位置を保持するReturn to Storyへ拡張します。

## 参照研究
- V&A https://www.vam.ac.uk/collections — object一覧とテーマ別探索を併置し、画像の近くに名前・作者・年代などをまとめる。HOLOSでは写真と短い標本ラベルを優先する。
- Smithsonian https://www.si.edu/explore — 分野を横断するBrowse Topicsと検索の二つの入口。HOLOSでは検索とExplore byを近接配置する。
- Smithsonian Open Access https://www.si.edu/openaccess / https://www.si.edu/openaccess/faq — CC0の対象を個別に識別する。Open Accessの名称だけで全画像を再利用可としない。
- British Museum https://www.britishmuseum.org/collection / https://www.britishmuseum.org/collection/collection-online/guide — keyword/person/place/museum numberの検索、Objectの詳細とテーマの入口。HOLOSでは名前・和名・ID・場所・種名を横断検索する。

British Museumは実ブラウザのCollection画面で確認。V&Aはページ内容、Smithsonianは公式ページの検索索引と公式FAQを確認。自動取得に一部制限があり、全サイトの全画面・全操作を比較検証したものではありません。固有レイアウトや資産はコピーしていません。

## 技術の判断
依存パッケージなしの静的サイトを採用。サーバー利用料のかかるDBやCMSを持たず、静的HTMLとして検索エンジンが標本の内容を読めます。データと表示を分け、将来のページ生成へ流用できます。収蔵数が大きくなった時点で検索やCMSを検討します。
