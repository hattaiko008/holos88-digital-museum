# HOLOS 88｜TEAM LOOP OPERATING SYSTEM 01

Date: 2026-09-22  
Status: ACTIVE WORKING DESIGN  
Owner: Echo / CHATO / TEAM HOLOS

## 0｜今回の決定

- Echoは、これまで通りCHATOへ話す。複数のAIへ指示を出し分けない。
- CHATOが総合受付、編集プロデューサー、進行管理、実装管理を担う。
- AIスタッフは当面、常駐する別人格ではなくCHATOが切り替えるDeskとして運用する。
- Claude、Gemini、NotebookLM、Gensparkなどは、必要性と接続条件が整った時だけ使う外部Adapterとする。
- 旧Webサイトは参照可能な状態で保存する。`prototype/reconstruction-01/`を今後のデザイン更新本線にする。
- 公開、外部送信、課金、契約、返金、重要な政治・医療・法律・金融表現はEchoの確認を通す。

## 1｜二つの記事から採用するもの

### 採用する

1. **役割ではなく成果物を明確にする**  
   誰が担当するかより、何を完成させ、どう合格とするかを先に決める。
2. **Discover → Plan → Execute → Verify → Iterate**  
   作る前に必要な情報を集め、検証し、失敗した時だけ修復する。
3. **完了条件を作業前に書く**  
   表示、事実、権利、リンク、声、公開状態のどこまでが今回の終了かを固定する。
4. **作る役割と確かめる役割を分ける**  
   コードはテストと画面、記事はSOURCE DESKと声、画像は権利と表示で確かめる。
5. **定型作業はSkill、手順、テンプレートへ戻す**  
   毎回の長い説明を減らし、判断が必要な部分へクレジットを使う。

### そのまま採用しない

1. **モデル名による永久的な担当固定**  
   モデルは更新される。HOLOSではタスクの形、利用可能な接続、実測した品質と総費用で選ぶ。
2. **全作業を3つのAIへ順送りすること**  
   読み直し、転記、意味の変質、重複費用が増える。独立校正や別視点が結果を変える時だけ渡す。
3. **同じAIの自己採点だけで完了すること**  
   機械検査、出典、権利台帳、差分、ブラウザ表示を証拠にする。高リスク時のみ独立レビューを追加する。
4. **無制限の自走**  
   ループには最大反復回数、費用・時間枠、停止条件、Echoへ返す条件を必ず持たせる。
5. **外部記事の性能値や無料条件を運用前提にすること**  
   製品名、ベンチマーク、料金条件は一次情報と実アカウントで確認できるまで未検証とする。

## 2｜TEAM HOLOSの構成

```text
ECHO
方向・声・公開・約束を決める
  ↓
CHATO — SINGLE FRONT DOOR
目的を整理し、Deskと道具を選び、成果物と検証を統合する
  ├─ EDITORIAL        企画、構成、本文、校正
  ├─ CURATORIAL       分類、収蔵、Relationship、MICHIKUSA
  ├─ SOURCE DESK      事実、反証、出典、画像権利
  ├─ DESIGN / BUILD   UI、コード、画像配置、表示確認
  ├─ DISTRIBUTION     Substack、note、SNS、YouTubeへの再編集
  ├─ OPERATIONS       台帳、公開予定、問い合わせ返信案
  └─ VERIFICATION     テスト、差分、リンク、意味保持、停止判断
        ↓
SATORI’S VIEW
完成記事の出口に、必要な時だけ別の小さな窓を開く
```

SATORIは要約係、品質検査係、HOLOS思想の説明係にしない。完成した記事をその記事として読み、記事ごとに原則1〜3個の短い問いを返す。問いが生まれない場合は無理に作らず、空であれば公開画面に出さない。

## 3｜ひとつの依頼が進む順番

### 1. INTAKE

Echoの会話、URL、メモ、写真、録音、修正希望をCHATOが受け取る。散らかったままでよい。

### 2. TRIAGE

CHATOが次を決める。

- 今やる / あとで / HOLOSネタ / 事業候補 / COMPOST
- 記事 / 標本 / 展示 / サイト / 配信 / 顧客対応
- 小さな可逆変更 / 公開前確認が必要 / 高リスク
- 閉じたループ / 編集的な開いたループ

### 3. DISCOVER

既存台帳、関連原稿、現在のサイト、必要な一次資料だけを読む。未確認情報、欠けた権利、意味上の争点を見つける。

### 4. PLAN

[Task Packet template](../task-packet-template.yml)を複製する。目的、入力、固定事項、対象外、完了条件、検証、反復上限、Echoの確認点を一枚にする。

### 5. EXECUTE

CHATOが最小のDesk構成で制作する。外部AIが必要ならTask Packetだけを渡し、受け取った成果をHOLOSの原本形式へ戻す。

### 6. VERIFY

- 記事：数字、固有名詞、日時、引用、反証、声、段落、権利
- Web：build、内部リンク、モバイル、キーボード、reduced motion、JSなしの入口
- 配信：リンク、表記、切り抜きによる意味の変化、公開先ごとの長さ
- 顧客対応：相手、個人情報、約束、返金・料金、送信先

### 7. REPAIR OR STOP

失敗が明確で修復可能なら最大2回まで直す。同じ原因が続く、追加判断が必要、費用枠を超える、外部状態が必要な場合は止め、Echoへ一つの判断として返す。

### 8. REVIEW PACK

Echoには、完成した確認画面または原稿、変更点、未確認点、公開時の注意だけを渡す。長い作業ログを読ませない。

Review Packが完成した時点で、CHATOは[SATORI QUESTION PASS](../room-prompts/satori-question-pass.md)を自動で一度実行する。本文、Source Desk、図版クレジットが揃う前には実行しない。返された問いは本文へ混ぜず、`satori_view`へ保存してEchoの最終確認に含める。

### 9. PUBLISH / DISTRIBUTE

承認後に原本をWebへ公開し、Substack、note、SNS、YouTubeなどへ媒体別に再編集する。各媒体を原本置き場にはしない。

### 10. LISTEN / RETURN

反応、検索語、質問、訂正、問い合わせを次の記事、MICHIKUSA、FAQ、COMPOSTへ戻す。

## 4｜二種類のループ

### CLOSED LOOP｜自動化しやすい

- buildとテスト
- 内部リンク検査
- 必須メタデータと画像権利欄の欠落検査
- 公開済み記事からSNS・無料レター案を作る
- 問い合わせを分類し、承認前の返信案を作る
- 定型バックアップと公開状態の確認

結果が合格・不合格で判定できる。最大2回修復し、それでも通らなければ止める。

### OPEN LOOP｜編集判断を残す

- 記事の切り口
- hachico / ECHOの声
- デザインの美しさと驚き
- 何と何をRelationshipとして結ぶか
- 政治、思想、文化の解釈
- 価格、会員体験、HOLOSの約束

探索時間と案数を先に限定する。最終判断を数値化せず、Echoへ一つの推奨案と必要な比較だけを返す。

## 5｜外部AI Adapterの基準

外部AIはチームの上司や原本置き場にしない。CHATOがTask Packetを渡し、返却物を検査する。

| Adapter | 使える場面 | 必須の戻し方 |
|---|---|---|
| Claude / Claude Code | 大きな設計の第二案、独立レビュー、接続環境内の実装 | 決定事項、成果物、未解決点をTask Packetへ返す |
| Gemini | 日本語の限定校正、別表現の比較 | 意味・数字・固有名詞を固定し、変更一覧を付ける |
| NotebookLM | 登録資料に根ざした要約、質問、資料間比較 | 引用元と該当箇所を残し、SOURCE DESKで一次資料を確認する |
| Genspark等 | 発見、探索、候補収集 | 候補URLだけで確定せず、一次情報へ遡る |

採用条件は「有名だから」ではなく、同じ種類の実作業で次が改善した時とする。

- Echoの修正量
- 事実・意味・声の保持
- 再試行回数
- 総利用量と所要時間
- そのAdapterがなければ得られなかった価値

## 6｜人間に残す決定

- 何を今、公開するか
- hachico / ECHOの声とPublic identity
- HOLOSが誰に何を約束するか
- 価格、支援、会員特典、返金、契約、提携
- 外部メール、SNS、メルマガ、顧客返信の送信
- 政治・医療・法律・金融・歴史上の重大な主張
- 収蔵する価値、画像の最終選択、大きなデザイン変更

調査、下書き、比較、修正、プレビュー、検査、送信前パッケージまではCHATOが進める。

## 7｜現在のWeb資産

| 系統 | 役割 | 方針 |
|---|---|---|
| 旧サイト `/` | PHASE 04までの記録と比較資料 | 保存。必要な内容・機能だけ参照する |
| 新プロトタイプ `/prototype/index.html` | 今後のデザイン更新本線 | HOME、分類、記事、Museum導線をここから磨く |
| `content/` | 原稿、台帳、構造化データ | 長期的な原本。画面へ直書きしない |
| `content/briefs/` | 設計判断と運用契約 | 実装前の基準。会話履歴の代替にする |

当面は新プロトタイプの骨格を固定し、記事が増えてから本文リズム、図版、カテゴリー頁、記事ごとの表情を詰める。旧サイトは削除しない。

## 8｜次に実装する順番

1. 新プロトタイプをactive lineとしてREADMEと台帳へ固定する。
2. Task Packetと記事状態を使い、サンプル記事を3本通して運用する。
3. SOURCE DESKと画像権利の不足を一覧化する。
4. 記事ページ、カテゴリー入口、MICHIKUSAの順に磨く。
5. Web原本からSubstack、note、Instagram、X、Pinterest用パッケージを生成する。
6. Google Workspace再開後、承認キューと顧客返信案へ接続する。
7. 反復量が確認できた作業だけ、Skillまたは定期処理へ移す。

## 9｜一次資料として確認したCodexの仕組み

- [Codex best practices](https://developers.openai.com/guides/best-practices) — 永続指示、外部接続、Skill、安定した処理の自動化という順序。
- [Custom instructions with AGENTS.md](https://developers.openai.com/docs/agent-configuration/agents-md) — プロジェクト単位で持続する指示の読み込み。
- [Subagents](https://developers.openai.com/docs/agent-configuration/subagents) — 並列化できる複雑な仕事で専門Subagentを使う仕組み。
- [Scheduled tasks](https://developers.openai.com/docs/automations) — 安定した手順を時刻・イベントで繰り返す仕組み。

これらは機能の存在を示す資料であり、HOLOSが常にSubagentや定期処理を使う理由にはしない。反復量と効果を確認した仕事だけに適用する。

最後の確認：そのループは、Echoの判断を奪わず、Lifeへ戻っているか？
