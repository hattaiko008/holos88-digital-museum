# HOLOS 88｜OPERATING SYSTEM 01

Status: WORKING DESIGN  
Date: 2026-09-19  
Owner: ECHO / TEAM HOLOS

## 1｜CENTER

HOLOS 88 DIGITAL MUSEUMを、すべての活動の中心に置く。

```text
                    SOCIAL / DISCOVERY
                           ↓
FREE LETTER → DIGITAL MUSEUM ← SEARCH / ARCHIVE
                           ↓
             MAGAZINE / CIRCLE / EVENTS
                           ↓
                          LIFE
```

SNS、メール、メルマガ、会員サービスは入口・案内路・小部屋であり、収蔵物の原本と恒久的な導線はWeb Museumに残す。

## 2｜PUBLICATION FAMILIES

### LIFE NOTES｜hachico

- 暮らしから世界を見る短いエッセイ。
- 原則として可能な範囲で毎日更新する。
- 雨、馬、猫、食べ物、植物、仕事、身体、季節など、Lifeから始める。
- 完璧な長文を毎日要求しない。短いObservationも正式な一篇として扱う。
- Public credit: `WORDS BY hachico`

### ECHO ARTICLES

- 世界からLifeを見る編集記事。
- 科学、社会、市場、歴史、文化、技術、自然をRelationshipとして読む。
- 速報競争をせず、観察・背景・影響・選択へ進む。
- Public credit: `WRITTEN BY ECHO`

### HOLOS ENCYCLOPEDIA｜博物辞書

- 「なるほど」「へえ」を入口にする、小さな収蔵記事。
- ジャンル別の百科事典ではなく、ObjectとRelationshipから読む辞書。
- 基本単位は `OBJECT → RELATIONSHIP → CONSEQUENCE → CHOICE → LIFE`。
- 各項目は短い定義、観察、関係、出典、関連標本、関連Storyを持てる。
- 科学・歴史上の事実、編集上の仮説、象徴的な見方を明確に分ける。

### MUSEUM FEATURES

- 一つの対象を深く辿る長編展示。
- ECHO記事や博物辞書の複数項目をつなぐ。
- SOURCE DESKと権利確認を完了してから公開する。

### MONTHLY MAGAZINE / CIRCLE

- Museumで公開された記事を単に再掲せず、一か月のRelationshipを編み直す。
- 編集後記、制作途中、限定音声、読書会、小さな実験を収録できる。
- 将来の有料領域。開始時は一つの会員階層に絞る。

## 3｜PLATFORM ROLES

| 場所 | 役割 | 原本を置くか |
|---|---|---|
| HOLOS 88 website | Museum、記事、標本、Relationship、恒久URL | Yes |
| Substack | 無料レター、更新通知、読者メールの入口 | No |
| Ko-fi | PayPalによる会員・支援・限定投稿の入口 | No |
| Instagram / Threads | 画像、短い観察、制作風景 | No |
| X | 更新、資料、短いRelationship | No |
| Facebook | 長めの案内、イベント、既存のつながり | No |
| YouTube | 展示解説、Field Note、音と映像 | No |
| Google Workspace | 運営メール、資料、カレンダー、顧客対応 | Internal source |
| GitHub | サイトのコードと公開履歴 | Technical source |

Substackの有料購読はStripe接続が必要なため、現時点では無料購読専用とする。Ko-fiはPayPalを接続し、会員・支援・限定コンテンツに使う仮決定。契約前に日本での本人確認、通貨、税、返金、公開される氏名・住所をEchoが確認する。

## 4｜ACCOUNT FOUNDATION

ChatGPTの個人ログインは現在の個人Gmailのまま維持する。

`holos-holon.com`とGoogle Workspaceを再開した後、HOLOSの外部窓口と運営資料を分離する。

初期アドレス案：

- `hello@holos-holon.com` — 一般窓口
- `editorial@holos-holon.com` — 原稿、取材、資料
- `support@holos-holon.com` — 会員・購入者対応
- `newsletter@holos-holon.com` — 配信元
- `admin@holos-holon.com` — サービス登録と管理。公開しない

最初から有料ユーザーを五つ作る必要はない。ひとつの管理ユーザーにaliasまたはGoogle Groupを付け、受信箱を用途別に整理する。契約内容とalias数はWorkspace再開時に確認する。

## 5｜EDITORIAL PIPELINE

```text
CAPTURE
  ↓
COMPOST / 今やる / あとで / HOLOSネタ / 事業候補
  ↓
EDITORIAL CHOICE — ECHOが「どの矢印を見るか」を決める
  ↓
DRAFT — CHATOが構成、調査、原稿補助、制作準備
  ↓
SOURCE DESK — 事実、URL、日付、権利、反証、表現精度
  ↓
ECHO REVIEW — 声、方向、公開可否
  ↓
BUILD / PREVIEW — サイトへ実装、リンク・表示を検証
  ↓
PUBLISH — ECHOの承認後に公開
  ↓
DISTRIBUTE — Letter / SNS / Circle向けに再編集
  ↓
LISTEN — 反応、質問、訂正、次のRelationshipを回収
```

## 6｜WORKING RHYTHM

### Daily / possible

- hachicoがLife Noteの種を話す、書く、録音する。
- CHATOが原稿整理、表記確認、画像候補、関連標本を準備する。
- Echoが本文と公開を確認する。
- 公開後、各SNS用の短い案内を作る。

### Weekly

- LIFE NOTESの棚卸し。
- ECHO記事または博物辞書の候補を3件以内に絞る。
- SOURCE DESKの未確認事項を処理する。
- 翌週のSNS・無料レター案をまとめて確認する。

### Monthly

- 一か月に現れたRelationshipを選び直す。
- Monthly Magazine / Circle向けの編集物を作る。
- 読者の質問、問い合わせ、反応を次の収蔵候補へ戻す。
- 費用、会員数、解約、対応時間を小さく確認する。

## 7｜AI DESKS

当面はCHATOが編集長室として各Deskを切り替える。仕事量が増えた時だけ専用AIや別タスクに分ける。

| Desk | 主な仕事 | 人間の確認 |
|---|---|---|
| EDITORIAL | 企画整理、構成、文章の磨き、更新計画 | 声と公開判断 |
| SOURCE DESK | 出典、日付、事実、画像権利、訂正候補 | 高リスク主張 |
| COLLECTION | 標本ID、分類、Relationship、収蔵記録 | 収蔵する意味 |
| DISTRIBUTION | SNS、無料レター、告知文、公開日程 | 外部送信前 |
| COMMUNITY | 問い合わせ分類、返信案、FAQ | 送信前。定型のみ将来自動化 |
| MEMBERSHIP | 会員記事、特典、解約理由、月次状況 | 価格、返金、約束 |
| OPERATIONS | GitHub、サイト公開、バックアップ、障害確認 | 大きな変更 |

## 8｜APPROVAL POLICY

CHATOが自動で進めてよいもの：

- 調査、分類、下書き、校正案、出典候補、画像候補
- サイトのプレビュー、テスト、リンク確認
- SNS・メール・メルマガの送信前原稿
- 問い合わせの分類と返信案
- 小さく戻せるサイト改善

Echoの確認後に行うもの：

- 記事、SNS、メルマガ、メールの外部公開・送信
- 価格、特典、返金、契約、広告、提携
- 政治・医療・法律・金融・歴史上の重大な主張
- 個人情報を含む顧客対応
- HOLOSの方向やPublic identityを変える判断

運用実績が十分に溜まった定型返信だけ、対象と条件を限定して自動送信へ移す。

## 9｜AUTOMATION ORDER

1. Google Workspaceと`holos-holon.com`を再開する。
2. HOLOS用Drive、メール、Calendarを作る。
3. 記事台帳、SOURCE DESK、公開カレンダーを一つにする。
4. LIFE NOTESの簡単な投稿フォームまたは編集画面を作る。
5. Substackを無料レターとして整える。
6. Ko-fiとPayPalの本人情報・公開情報・テスト決済を確認する。
7. SNSの投稿案生成と承認キューを作る。
8. Gmail問い合わせの分類と返信案作成を自動化する。
9. 会員運営を開始し、実際の仕事だけ自動化する。

Genspark、NotebookLM、Claude、Claude Codeは、必要な仕事が明確になった時点で補助道具として接続を検討する。複数AIを先に常時連携させず、成果物はGoogle Drive、GitHub、HOLOSのデータ形式のいずれかへ戻す。

## 10｜NEXT BUILD

次の実装単位はPOST PHASE 04の大改造ではなく、以下の小さな基盤とする。

1. 記事の状態を `idea / research / draft / source-check / review / scheduled / published / revised` で管理する。
2. LIFE NOTESを毎回JSONへ直接書かなくても更新できる安全な編集手順を作る。
3. 博物辞書の最小データ型を定義し、最初の3項目だけ試作する。
4. 公開済み記事からSubstack・SNS向け原稿を生成するテンプレートを作る。
5. 顧客対応を始める前に、問い合わせ分類・返信承認・個人情報の扱いを決める。

最後の確認：その道は、ちゃんとLifeへ戻っているか？
