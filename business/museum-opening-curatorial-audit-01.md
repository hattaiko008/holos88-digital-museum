# HOLOS 88 MUSEUM｜OPENING CURATORIAL AUDIT 01

更新日：2026-09-24  
対象：`prototype/reconstruction-01/`  
状態：開館前仕分け

## 結論

原稿が足りないのではない。新しいデザイン本線へ、実在記事とMuseumの関係を通す作業が必要。

現在のHOMEは、視覚と言葉の方向は合っている。ただし、HOME内の入口と記事ページの世代が混在し、ひとつのMuseumを巡っている感覚が途中で切れる。

最初の開館では、新デザインへ6本を載せ、BETWEEN THE WINDOWSと共通のMICHIKUSAを加える。カテゴリーを埋め切ることは公開条件にしない。

## 直す｜開館前

### 1｜記事を新しい読書面へ統一する

HOMEの3入口のうち、`最近、雨ばっかり。`だけが新しい試作記事。MARKETと恐怖の考古学は旧デザインへ移動する。6本すべてに共通のヘッダー、本文幅、SOURCE WINDOW、関連導線、クレジットを用意する。

### 2｜最初の6本

| 役割 | 記事 | 現在地 | 開館前の作業 |
|---|---|---|---|
| LIFE | 最近、雨ばっかり。 | 新読書面は一部のみ | 全文、段落、SOURCE DESK、画像を確定 |
| MARKET | 5％という数字の、その向こう | 旧読書面 | 時点を明記し、政治経済の事実を再確認 |
| MUSEUM | THE ARCHAEOLOGY OF FEAR | 旧展示面 | 一つの読み物として通る入口と本文導線へ整理 |
| OBJECT / LANGUAGE | SEED | 編集草稿 | SOURCE DESK、図版、関連標本を確定 |
| TIME / PHILOSOPHY | DURATION | 編集草稿 | ベルクソンの書誌と引用範囲を確認 |
| AI / PHILOSOPHY | WHO HOLDS THE LAST QUESTION? | 最終原稿（仮） | AIリスクの最新資料を確認し公開稿へ |

この6本で、LIFE / MARKET / HISTORY / NATURE / TIME / AIを横断できる。記事数ではなく、1本から別の世界へ渡れることを優先する。

### 3｜BETWEEN THE WINDOWS

草案を公開稿へ整え、HOME、ナビゲーション、記事末尾、ATLASから入れるようにする。一般的なABOUTではなく「なぜ、これらがつながっているのか」を体験する案内にする。

### 4｜MICHIKUSAを実在リンクにする

試作中のリンクやアンカーを、公開する6本、Object、Collectionへ接続する。本文を読んだ位置から次へ移り、戻れることを確認する。

### 5｜表記と声

英語の大見出しと、近くの読みやすい日本語を維持する。説明文はECHOとhachicoの間の温度へ揃え、学芸員の内部用語を来館者へそのまま見せない。数字は`content/editorial/japanese-number-style.md`に従う。

### 6｜公開に必要な裏側

- 各画像の作者、作品名、年代、所蔵先、権利、リンク、alt
- 事実、数字、日付、引用のSOURCE DESK
- 問い合わせ、Privacy、Termsの短いページ
- Substack登録先が未接続なら、無効フォームではなく「準備中」の静かなリンク表示
- Ko-fiは記事本文を遮らない位置へ一つだけ置く

## 公開後｜育てる

- 7カテゴリーすべての記事数を揃える
- 地球儀と地域別ATLAS
- HOLOS ORBITの完全版
- 動画エッセイ
- 音の標本
- LIFE SPECIMENの会員機能
- 英語版
- 工芸地図とShop

## 触らない｜開館前に壊さない

- Original HOLOS Logoの画像データ
- hachicoとECHOをpublicで同一人物と説明しない方針
- 既存URLと収蔵ID
- JavaScriptがなくても主要入口へ進める構造
- reduced motion、キーボード、読書位置へ戻る動き
- 固定カテゴリー色を作らない方針
- SATORI'S VIEWとSOUNDは、空なら表示しない

## 実装順

1. 新読書面の共通テンプレート
2. `最近、雨ばっかり。`の全文を通して行間を決める
3. 残る5本を同じ器へ入れる
4. BETWEEN THE WINDOWS
5. MICHIKUSAとATLASの実リンク
6. SOURCE DESKと画像権利
7. モバイル、キーボード、reduced motion、リンク検証
8. 開館用HOMEの最終編集

## 開館時の来館体験

```text
一枚の強い表紙を見る
    ↓
読みたい記事へ迷わず入る
    ↓
一つの読み物として最後まで読める
    ↓
MICHIKUSAで別の窓を見つける
    ↓
BETWEEN THE WINDOWSで、このMuseumの関係に気づく
    ↓
自分のLifeへ戻る
```

