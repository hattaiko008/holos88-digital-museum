# STORY BASELINE 01 — research / design note

調査日: 2026-09-15。既存HOMEはDESIGN BASELINE 01として固定。保存commit: bad4810。

## 現状
依存パッケージのないNode生成処理 + 静的HTML/CSS/JavaScript。`collection.json`に10標本、画像の権利メタデータ、試作経路がある。HOMEの文字・余白・画像一覧・検索は維持。ヘッダー、footer、ラベルと既存画像を再利用する。OBJECTとSTORYにだけ別CSSを読み込ませる。

## 参照と採用原則
| 参照 | 確認した公開体験 | HOLOSへの適用 | コピーしないもの |
| --- | --- | --- | --- |
| [V&A Explore guide](https://www.vam.ac.uk/info/explore-the-collections) / [Collections](https://www.vam.ac.uk/collections) | Object Pageにrecord、curatorial knowledge、editorial storytellingを集約。画像別の権利。 | 識別情報のdl、写真、説明、Story、関連標本を一つの記録から辿る。 | ロゴ、専用フォント、画像、コード、固有の画面配置 |
| [Smithsonian](https://www.si.edu/) / [NMAH September 11](https://americanhistory.si.edu/explore/topics/september-11) | 資料群を出来事の記録として束ね、objectとstoryを結ぶ。指定の旧object-groups URLは取得失敗。現行topicの公式検索索引を確認。ブラウザはverification画面で停止。 | Object IDとSource IDを持ち、個別資料から大きな歴史へ開く。 | 蔵品をHOLOSの所有物と装うこと、館の権威や画像の借用 |
| [British Museum collection](https://www.britishmuseum.org/collection) / [Scarf record](https://www.britishmuseum.org/collection/object/H_2012-8012-1) | Object Type、Museum number、Acquisition等の記録項目。取得制限のある詳細は公式索引で確認。前段Phase 01でCollection実画面を確認済み。 | 固有ID、種、場所、関連出来事、Source、Rightsを分ける。既存IDを保持。 | 所蔵・来歴の捏造、固有レイアウト |
| [National Geographic](https://www.nationalgeographic.com/) / [Tribute in Light feature](https://www.nationalgeographic.com/photography/article/tribute-in-light-911-memorial) | 公開冒頭を実ブラウザで確認。写真、見出し、短い導入が同じ主題を向く。 | 観察→資料→余白→問いのリズム。写真は文章の意味を担う箇所だけ。 | 黄色のブランド色、写真上の見出し配置の再現、会員限定部分、災害のスペクタクル |
| [Harper’s BAZAAR](https://www.harpersbazaar.com/) | 公開トップとAlessandro Michele特集の写真導入を実ブラウザで確認。大きな写真、displayと小さな編集情報の階層。 | STORY冒頭と章転換のみ大胆なスケール差・非対称。日本語本文は一定の読み幅。 | ブランド書体、masthead、写真、広告、推薦記事のpill UI |
| [Brodovitch / AIGA](https://eyeondesign.aiga.org/design-history-101-alexey-brodovitch-astonishes-with-fashion-is-spinach/) | 編集デザインの参照。今回の具体的スケール・余白・非対称原則はユーザーの指定を設計判断に変換。 | 冒頭の英字、8:46、VOIDの空白、FEARの問いで変化をつけ、その後は静かな本文へ戻る。 | 歴史的見開きの複製、認識可能な構図、全章への実験的文字組み |

調査範囲は公開ページと公式ガイド。全画面・有料記事・未取得の操作を調査済みとは扱わない。

## この試作の設計
- OBJECT: 写真とIdentificationの2列。下部にDescription、Story、Related Objects、2つのRelationship経路、Source、Rights。
- STORY: 英字display + 日本語導入、8章。本文は約34字の読み幅、18px以上、ゆったりした行間。英語は重複翻訳でなく章の標識。
- MICHIKUSA: 主文を残した小部屋。種→記憶→三春→福島の資料を内部で開ける。RETURN TO NEW YORKで同じ読書位置へ。通常の広告ボックスにしない。
- 新規routeは2つだけ。他の概念は再利用する資料dialogに表示。公開済みページであるかのような空リンクを作らない。

## 出典と編集倫理
本文の歴史・健康・政治に関する事実は、9/11 Memorial、CDC/NIOSH、9/11 Commission、DHS、PCLOB、FBI、福島県、三春町、US Forest Serviceの資料IDへ接続。段落に出典リンクを付ける。医療助言は書かない。
政府資料は政府の説明を示す出典にもなるが、それだけで全評価が確定するとは扱わない。Iraqと9.11実行の責任を同一視しない。SHAMANIC WINDOWは明示的に象徴・哲学。

Survivor Tree写真はPumpkinSky、2012-07-16、CC BY-SA 3.0。出典・ライセンス・作者・加工有無を表示し、画像ファイルのライセンスを保持する。樹木の写真の日付を2026年と誤認させない。三春滝桜と粉塵の実写は今回未使用。水面の既存CC0写真を使う場合は現地記録と誤認させず素材イメージと明示。

## ID整合性
今回依頼のDUST H88-0003は既存Seedと衝突するため、既存Dust H88-0009を維持。新しいPLACE/IDEA/EVENTの内部IDは名前空間を分ける。HOMEの10標本と並び順は変更しない。
