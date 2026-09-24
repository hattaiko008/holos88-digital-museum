# SECOND SEASON｜APP ROADMAP 01

更新日：2026-09-24  
状態：PRIVATE WEB PROTOTYPE 実装中

## 結論

アプリ化できる。

しかも、単にPDFへ文字を入力するアプリではなく、**自分のLifeを観察し、収蔵し、関係を見つけるPersonal Museum**として設計できる。

最初はApp Store向けのネイティブアプリを作らない。スマートフォンとパソコンの両方で使えるWeb Appから始め、利用が定着した段階でPWAまたはネイティブアプリを検討する。

## APP CONCEPT

# LIFE SPECIMEN

## 暮らしの標本から、次の季節を考える

利用者が記録するものは、日記の長文だけではない。

- 今日ひっかかった言葉
- 身体の天気
- 使った時間
- 持っている役割
- 誰かに頼まれたこと
- やめたいこと
- 実験したこと
- 一季節後に見直したい問い

一つひとつを`SPECIMEN｜標本`として保存し、あとから関係線で結ぶ。

## 基本の利用体験

```text
OBSERVE
今日の状態を短く記録する
    ↓
COLLECT
言葉、出来事、身体、時間を標本として保存する
    ↓
CONNECT
標本同士の関係を地図で見る
    ↓
SHIFT
THIRD QUESTIONで視点をずらす
    ↓
TEST
72時間または12週間の実験を設定する
    ↓
RETURN
一季節後に地図を描き直す
```

## 最小機能

### 1｜FIELD NOTE

一回3分以内の記録。

- 日付
- 季節
- 場所
- 心身の天気
- 一言
- 関連する領域

### 2｜LIFE AREAS

- WORK
- BODY
- RELATIONSHIPS
- HOME
- MONEY
- TIME

記録を一つ以上の領域へ分類できる。固定カテゴリーは入口として使い、利用者独自の分類も追加できる。

### 3｜RELATIONSHIP MAP

標本同士を線で結ぶ。

- 原因かもしれない
- 支えている
- 奪っている
- 同時に起きる
- まだ分からない

AIが関係候補を提示しても、線を確定するのは利用者本人とする。

### 4｜THREE VOICES

- 自分の声
- 外側の声
- 第三の問い

AIは答えを作るのではなく、本人の記録からまだ使っていない問いを数個提示する。

### 5｜SEASON EXPERIMENT

- 72時間の一歩
- 12週間の実験
- 観察する指標
- 4週目、8週目、12週目の確認
- CONTINUE / CHANGE / CLOSE

### 6｜LETTER SUPPORT

利用者が選んだ記録だけをStudioへ送る。

CHATOが整理案と関係図を作り、Echoが確認した返信をアプリ内の手紙として届ける。すべての記録が自動で運営者へ見える構造にはしない。

## データの基本単位

```yaml
specimen_id: unique-id
created_at: date-time
season: string
place: optional
life_areas: []
observation: string
body_weather: optional
fact: optional
story: optional
possibility: optional
relationships: []
private: true
shared_with_studio: false
```

PDFの各ワークにも同じIDを持たせる。これにより、紙、PDF、Web Appの内容を別々に作らずに済む。

## AIの役割

### AIに任せる

- 過去の記録から繰り返す言葉を探す
- 複数領域にまたがる関係候補を示す
- 長い記録を本人の言葉を保って整理する
- FACTと解釈が混ざっている可能性を指摘する
- 第三の問いを数個提案する
- 季節ごとの振り返りを下書きする

### AIに任せない

- 人生の決定
- 医療・心理の診断
- 危機状態への自動対応
- 占い結果として未来を断定すること
- 本人の許可なく記録を外部へ共有すること
- 利用者になりすまして人へ連絡すること

## プライバシー原則

このアプリには、健康、家族、仕事、お金など非常に私的な記録が入る。

- 初期状態はすべて非公開
- Studioへ送る項目を本人が選択
- AI処理の有無を明示
- データの書き出しと削除を本人が実行できる
- 広告目的の追跡を入れない
- 個人記録をモデル学習へ使用しない構成を選ぶ
- 保存期間と削除方法を分かる言葉で説明する

## 段階的な開発

### PHASE 1｜PDF

ワークの順序、言葉、完了率を確認する。

### PHASE 2｜PRIVATE WEB PROTOTYPE

ログインなし、端末内保存の小さな試作。

- FIELD NOTE
- LIFE AREAS
- COLLECTION
- RELATIONSHIP MAP
- THREE VOICES
- 72-HOUR STEP

2026-09-24時点で上記の最小機能を実装。記録と関係線は端末内だけに保存し、外部送信しない。

RELATIONSHIP MAPは、一つの標本へ複数の関係線を結べる。家族、パートナー、仕事、身体、時間などが別々の問題ではなく、一つのLifeの中でどう配置されているかを見る。もっとも多くの線が集まる標本を中心に置き、全体を小さなネットワークとして表示する。

カテゴリー地図では、WORK / BODY / RELATIONSHIPS / HOME / MONEY / TIMEを円で表示する。円の大きさはATTENTION（記録への登場回数）とCONNECTION（関係線への登場回数）を切り替えられる。大きさを重要度と自動解釈せず、KEEP / RELEASEは本人が選ぶ次段階のレンズとして扱う。

DIRECTION LENSでは、各領域をOBSERVE / KEEP / LESS / MORE / RELEASEへ本人が配置する。今季動かす領域を一つ選ぶと、その意図を72-HOUR STEPへ渡す。可視化を評価で終わらせず、本人が選んだ小さな実験へ戻す。

HOW / METHOD CARDSは、選んだ領域と方向に対して三つの方法を提示する。各方法にWHY / HOW / OBSERVE / IF NOTを付け、行動、観察、縮小案まで具体化する。方法カードからHOLOS Museumの関連展示へMICHIKUSAできる窓を置き、知識を得たあと再び72時間の実験とLifeへ戻れる循環にする。

72-HOUR STEPの終了時には、WHAT HAPPENED / BODY WEATHER / NEXT（CONTINUE・CHANGE・CLOSE）を記録する。結果を新しい標本としてCOLLECTIONへ戻し、次の関係線とカテゴリー地図へ反映する。予想と現実の差を本人の観察履歴として残す。

COLLECTIONには、28日間使い続けた状態を体験できる非保存のサンプル展示を置く。BODY WEATHERの変化、領域ごとの比重、複数の関係線、浮かび上がった反復、直近の標本を一続きで見せる。利用者本人の記録とは明確に区別し、見本を開いても端末内データへ追加しない。

### PHASE 3｜MEMBER WEB APP

Ko-fiまたは独自会員と接続する。

- アカウント
- 同期
- RELATIONSHIP MAP
- 季節ごとの振り返り

### PHASE 4｜GUIDED LETTERS

手紙サポートと安全な共有機能を追加する。

### PHASE 5｜PWA / NATIVE APP

利用頻度、継続率、必要な通知が確認できた場合だけ進む。

## 収益構造

- 無料：FIELD NOTE、月5件まで
- 買い切り：SECOND SEASON KITと基本機能
- Membership：記録数、季節のワーク、関係地図
- Guided：月2回の手紙サポート
- Personal Atlas：個別編集された一季節の冊子

アプリの目的を継続課金そのものにしない。無料でも自分の記録を書き出せるようにし、支払う価値は保存量ではなく、関係を見つける機能と編集された伴走に置く。

## いま行う準備

1. PDF各ページへ`page_id`を付ける
2. ワークの回答項目をデータ単位に分ける
3. 必須入力を極力減らす
4. 12週間使わなくても価値が残るようにする
5. 利用者が書いた内容をどこまでAIへ渡すか選べる設計にする
6. PDF購入者が将来Web版へ移行しやすい識別方法を検討する

## 今は作らない理由

アプリを先に作ると、使われない入力欄と通知が増える。

まずPDFで、人が本当に書く問い、飛ばす問い、戻ってくるページを観察する。その結果だけをアプリへ持ち込む。

**紙で意味のあるワークだけを、デジタルで動かす。**
