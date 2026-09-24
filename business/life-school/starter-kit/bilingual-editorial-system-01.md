# SECOND SEASON｜BILINGUAL EDITORIAL SYSTEM 01

更新日：2026-09-24  
状態：制作基準

## 基本原則

英語を大きく、日本語を必ず添える。

英語は意味を隠す装飾ではなく、ページの構造、速度、視線をつくる。日本語は翻訳注ではなく、読者が自分の生活へ意味を持ち帰る本文として扱う。

```text
LARGE ENGLISH
日本語の意味
```

上下だけに固定しない。日本語は下、横、余白、図の内部など、英語との関係がもっとも美しく読める位置へ置く。

## 表記の階層

### LEVEL 1｜BOOK / PART TITLE

英語を誌面の主役にする。

```text
SECOND SEASON
これからの時間を編み直す
```

- 英語：大きい。改行、断ち切り、余白を使える
- 日本語：英語の20〜35%程度の大きさ
- 日本語は必ず同じ視野内に置く
- 日本語を縦組みにする場合も、読み順を迷わせない

### LEVEL 2｜METHOD / WORK NAME

方法の名前は英語で統一し、日本語で用途を示す。

```text
CURRENT LIFE MAP
現在の暮らしを、関係の地図として見る
```

### LEVEL 3｜ACTION WORD

ワークの動詞は短い英語を大きく、日本語を一語または一文で添える。

```text
KEEP
次の季節にも持っていく
```

### LEVEL 4｜QUESTION / BODY

問いと本文は日本語を主にする。英訳は日本語初版には常時併記しない。

理由：すべてを二言語併記すると、書き込み面積と呼吸が失われるため。

将来の英語版では、同じIDの本文を英語へ差し替える。

## 日本語初版の言語比率

- 表紙・章扉：英語70 / 日本語30
- 読み物ページ：英語30 / 日本語70
- ワークページ：英語20 / 日本語80
- 図・地図：英語50 / 日本語50
- 注意事項：日本語100。誤解を避けるため英語装飾を使わない

## しないこと

- 意味の分からない英単語を雰囲気だけで置く
- 日本語を小さくしすぎて読めなくする
- 同じ意味の英語と日本語を何度も繰り返す
- 英語の長文を背景模様として使う
- 不自然な直訳語をブランド用語にする
- 大きな日本語見出しだけで誌面を埋める
- 英語と日本語の両方を同じ大きさ、同じ太さで並べる

## 書体の役割

### DISPLAY ENGLISH

- 高いコントラストのセリフ体
- 大きな字間、極端な改行、断ち切りに耐えるもの
- 古典的だが、ウェディングや美容広告の印象へ寄せない

### INFORMATION ENGLISH

- 小さなラベル、ページ番号、分類用
- 端正なサンセリフまたはニュートラルなセリフ

### JAPANESE BODY

- 長文で疲れにくい
- 細すぎず、小さなサイズでも輪郭が消えない
- 本文とワークの問いでウェイトを分ける

### JAPANESE ACCENT

- 一ページに一箇所以内
- 本文書体のサイズ、字間、配置で差をつけ、書体を増やしすぎない

## 英日タイトル辞書

| ID | English | 日本語 |
|---|---|---|
| BOOK-01 | SECOND SEASON | これからの時間を編み直す |
| BOOK-02 | A LIFE BRANDING WORKBOOK | 40代からの仕事と暮らしのノート |
| PART-01 | CURRENT LIFE MAP | 現在の暮らしを、関係の地図として見る |
| PART-02 | LIFE ARCHIVE | これまでの経験と知恵を収蔵する |
| PART-03 | THREE VOICES | 三つの声から、いつもの見方をずらす |
| PART-04 | ONE SEASON EXPERIMENT | 次の一季節を、小さく試す |
| WORK-01 | LIFE AREAS | 仕事、身体、関係、暮らし、お金、時間 |
| WORK-02 | ENERGY WEATHER | 心身の天気を観察する |
| WORK-03 | ROLE INVENTORY | いま持っている役割を棚卸しする |
| WORK-04 | TIME LANDSCAPE | 一週間の時間を地形として見る |
| WORK-05 | FACT / STORY / POSSIBILITY | 事実、物語、まだ確かめていないこと |
| WORK-06 | THE THIRD QUESTION | まだ利害を持たない問い |
| WORK-07 | REALITY CHECK | お金、時間、身体、関係を確認する |
| WORK-08 | 72-HOUR STEP | 72時間以内に、現実へ触れる |
| WORK-09 | SEASONAL OBSERVATION | 一季節の変化を観察する |
| WORK-10 | LETTER TO THE NEXT SEASON | 一季節後の自分への手紙 |
| ACTION-01 | KEEP | 持っていく |
| ACTION-02 | RENAME | 別の名前を与える |
| ACTION-03 | SHARE | 誰かへ手渡す |
| ACTION-04 | LEAVE | ここへ置いていく |
| ACTION-05 | STOP | やめる |
| ACTION-06 | LESS | 減らす |
| ACTION-07 | MORE | 増やす |
| ACTION-08 | START | 始める |
| ACTION-09 | CONTINUE | 続ける |
| ACTION-10 | CHANGE | 変える |
| ACTION-11 | CLOSE | 終える |

## 英語版を見据えた原稿管理

各ページに固定IDを持たせる。

```yaml
page_id: PART1-READ-01
type: editorial
title_en: THE LANDSCAPE IS NOT A SCORE
title_ja: 現在は、結果ではなく地形
body_ja: ...
body_en: null
source_note: null
```

日本語初版では`body_ja`を使用する。英語版では同じレイアウトの翻訳ではなく、`body_en`の文字量を見て再組版する。

## 翻訳時の原則

- 日本語版を逐語訳しない
- 比喩の働きと読後の動きを保つ
- 日本固有の季節、家族、働き方には短い文脈を加える
- `Life Branding`など独自語は、最初に意味を定義する
- 医療、心理、法律、金銭に関わる表現は英語圏向けに再確認する
- 英語ネイティブ編集を公開前工程に入れる

## 将来の商品展開

1. 日本語版PDF
2. 日本語ペーパーバック
3. 英語版PDF
4. 英語ペーパーバック
5. 日英併記の展示版／贈答版

日英併記版はワーク用途ではなく、HOLOSの思想と図版を見せる別商品として設計する。

