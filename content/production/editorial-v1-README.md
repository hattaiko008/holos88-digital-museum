# HOLOS 88 自走型編集部 v1 — 実装状況

2026-10-18。非公開制作の実装。クラウド定期運用の完成宣言ではない。

## 正本と実行

記事の状態は `content/editorial-status.json`、分類は `content/article-taxonomy.json`、本文は既存 `content/drafts/` と `content/masters/`。MANUSCRIPT DESKのブラウザ保存を承認正本にしない。COMPOSTは既存 `scripts/editorial-line.mjs ingest` の受信・処理記録を使う。投稿の入口は既存POSTING DESK。新しい記事台帳は作らない。公開URLの実測は `node scripts/editorial-v1-publication-audit.mjs` で行う。結果は派生証跡 `work/editorial-line/v1/publication-audit.json` に保存し、台帳ハッシュ一致・24時間以内の公開確認を選定除外へ使う。HTTP 404を未公開の確証とは扱わない。

`node scripts/editorial-v1.mjs` は日本時間の翌日分を準備する。日付を固定する場合は `node scripts/editorial-v1.mjs 2026-10-19`。Node 22相当が必要。既存Macの実行ファイルは `/Users/hachico/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node`。

派生ジョブ・確認版・ログは `work/editorial-line/v1/`。`run-manifest.json` が最新実行の索引、各jobの `packet.json`、`handoff.json`、`review-pack.json`、`approval-request.json` が受け渡し。`events.jsonl` に実行結果と失敗を追記する。同じ対象日・入力・本文・ソースなら同じjobへ戻る。変更版は別ハッシュとなり、旧証跡や承認を継承しない。プロセス終了時のロックは自動解放するが、強制終了で残ったrun.lockは原因確認後に運用者が回収する。無条件再送はしない。

## 二つの制作ライン

固定ラインはALMANAC、C、T、次の週刊WATCH THE NOW、次の新月と満月のSHE CREATES。WATCH THE NOWの金曜は実装上の仮置き。新月満月は国立天文台の2026年暦要項を2026-10-18に照合した10〜12月分のみ。収録期間外は推測しない。月の時刻と占星術的な読みを混同しない。7枚暦は10月10日の保存デザインを保持した参照に留まり、日付だけ替えた当日版を作らない。マヤ暦は歴史的暦法と現代のDreamspellの区別、起点・相関・一次出典が未検証で保留。

C/Tは既存の誌面・原文を最初の候補として読み出す。別の日に同じ本文を再使用しない。在庫が尽きた後は、執筆担当が `work/editorial-line/v1/intake/YYYY-MM-DD-C.json` または `-T.json` へ `{"title":"…","subtitle":"…","paragraphs":["…"]}` の非公開草稿を保存して再実行できる。文字数はC150〜300字、T400〜700字。任意HTMLを差し込まず、既存タイポグラフィの本文スロットへ文字列として入れる。新規草稿は承認済み本文を上書きせず、事実・権利・文体審査を別途必要とする。書き手や調査サービスへの自動接続は実装していない。

在庫選定は公開済み・保留・既に制作中・マスター未発見を除き、ジャンルの直近偏り、状態、経過日、未完チェック数、仮の鮮度分類で順位を作る。公開履歴が不足する場合に更新日を真の公開日と断定しない。季節の地域・生育期・ニュースを機械判定で検証済みにしない。季節適合は未検証として残る。候補がなければジャンル枠を埋めない。候補選びは編集判断を代替しない。

## 品質と承認

CFOへ渡す前に、意味・文体、事実・出典、権利、PC/iPad/モバイル、改行・コントラスト、リンク、無料有料境界、SEO、最新保留の証跡が必要。`node scripts/editorial-v1-review.mjs JOB_DIRECTORY EVIDENCE_JSON` で原本・確認版のハッシュを再照合する。各証跡は `{passed,artifactSha256,evidenceRef,checkedAt}`。未記入、期限切れ、対象ハッシュ違いは `verification-pending`。一般的なlintの高得点だけでは合格にならない。

CFOとECHOの実承認は別。元チャットCFOの受領・審査を偽らない。ECHOには品質ゲート完了後の完成品だけを回す。対象記事・最終本文・素材・媒体・アカウント・日時を指定した明示承認が揃うまで公開不可。このrunnerには公開・予約・メール・決済機能を持たせていない。既存配信gateにも最新holdを追加し、WADOKEIは過去の承認があっても拒否する。

コハク、ライちゃん、デザちゃんは処理工程の名であり、別AIが実際に参加・受領した証拠ではない。Dotsへの自動送信ツールは未接続。共有ファイル保存のみを受領完了と呼ばない。元チャットへの自動転送も実施していない。

## 実行基盤の現実

既存ローカル定期タスク2件は非公開制作専用へ更新。朝8時と18時17分の既存時刻・通知設定を保持し、新規タスクは増やしていない。これらはMac停止中の稼働を証明しない。旧2件の停止中タスクは再開していない。

GitHubは公開リポジトリ。mainへのpushはPages公開につながる。mainのPOSTING DESK、保存暦、C/Tがローカルと不一致。クラウドworkflow案はPR検査と朝6時23分JSTのscheduleを持つが、scheduleはdefault branchだけで有効。公開GitHubへのコード・設定アップロードは自動承認レビューが開示未承認を理由に拒否したため未実施。空の作業ブランチだけ作成済み。クラウド実行URL・cron起動ログは存在しない。

workflow案はread-only token、5分timeout、サイトbuild/deployなし。本文・確認版はartifactへ上げず、集計・ハッシュ・ジョブ状態だけを7日保持する。したがって、その案だけでは非公開原稿のクラウド保存や高品質制作を完成できない。既存の非公開共有先へ正本を安全に同期・保存する接続が別途必要。設定だけで運用可能と報告しない。

## 検証

`node tests/editorial-v1.mjs`
`node tests/editorial-v1-integration.mjs`
`node tests/editorial-line.mjs`
`node tests/editorial-dispatch.mjs`

すべて隔離テスト。実投稿や実予約の成功証跡ではない。初回Tは572字の既存原文。初回MICHIKUSA候補は実URLで公開済みと判明し、選定から除外。94URL中38件は200と題名一致、54件は404、2件は200だが題名不一致だった。公開状態の正本と実URLに差があるため、未確認を未公開と断定しない。ALMANAC、週刊、新月満月号の完成本文は未作成。CFO/ECHO承認は未取得。

## 費用と残作業

新規有料契約、AI API、追加の常設agentは作っていない。今回の追加契約費は0円。既存ChatGPT利用枠・Followr買い切り権の残量は未確認。公開GitHubの標準runner費用条件は有効化前に再確認する。上限5分×1日1回を予定するが、実測費用ではない。

クラウド検証には、原稿なしの実装パッケージを既存公開GitHubの作業ブランチへ送る個別承認が必要。その後も、非公開正本のクラウド接続、Pages公開との分離、cron実測、モデルによる執筆・調査工程、失敗通知先の実到達、各記事品質を順に検証する。クライアント業務へ横展開する品質実証はまだ未達。
