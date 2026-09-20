# HOLOS 88｜RESEARCH TOOLS AUDIT

Date: 2026-09-20  
Status: audit only / no new tool installed

## Decision

今すぐ追加導入はしない。現在のHOLOS制作では、CodexのWeb検索、既存のGitHubリポジトリ、必要なときのブラウザ確認で調査が成立している。新しいスクレイピング基盤を先に入れると、依存関係・ログイン状態・規約確認・保守のコストが増え、短期的にはクレジット節約にならない。

## Reviewed

### Agent-Reach

GitHub上の公開プロジェクト。X、YouTube、Reddit、GitHub等を複数のバックエンドで読むためのCLI／エージェント用スキルを束ねる設計。MIT表記が確認できる一方、プラットフォームごとにログイン状態、上流CLIの停止、反Bot対策、規約の確認が必要。公開情報の調査補助には将来有用だが、HOLOSの通常運用へ常設する段階ではない。

### Scrapling

適応型のWebスクレイピングライブラリ。動的ページやブラウザ依存の取得を扱えるが、Python・ブラウザ依存関係の導入、サイト規約、個人情報、robots、取得頻度の管理が必要。博物館資料の出典確認を自動化する基盤としては、まず小さな許可済みサイトの検証から始める。

### Patchright Enhanced

共有されたX投稿からは概要を確認できたが、公式仕様・保守状態・ライセンスをこの監査で十分確認できなかった。現時点では導入候補にしない。

## OpenAI公式記事から取り込む原則

OpenAI公式のGPT-6 Astra向け記事は、スキルの説明を短くし、必要な資料だけを段階的に読むこと、古いAGENTS.mdやプロンプトを定期的に見直すことを勧めている。HOLOSでは次の形にする。

- 毎回、プロジェクト全体の資料を読み直さない。作業対象に必要なファイルだけ読む。
- AGENTS.mdには長い手順を追加せず、変わらない設計不変量だけを残す。
- 調査は「発見 → 出典確認 → 原稿反映」の3段階に分ける。
- SNS・YouTube・動的サイトの収集は、必要な記事のSOURCE DESKで具体的なURLが出たときだけ行う。
- 自動収集した内容を、そのまま事実・引用・画像権利として公開しない。

## Future trigger

次のいずれかが起きたら、Agent-Reach等を小さく再評価する。

1. YouTube、X、Reddit等から同じ種類の公開情報を定期的に複数件集める必要が出た。
2. 手作業の出典確認が、記事制作の主要なボトルネックになった。
3. 利用するサイトの規約・ログイン・保存方法を個別に確認できる運用台帳ができた。

導入する場合も、最初は読み取り専用の隔離環境で1媒体・1用途だけを試す。SNS投稿、顧客対応、公開サイト更新の自動送信とは分離する。

## Sources

- [OpenAI Developers: Rethinking skills and prompts for GPT-6 Astra](https://developers.openai.com/blog/rethinking-skills-and-prompts-for-gpt-6-astra)
- [Panniantong/Agent-Reach](https://github.com/Panniantong/Agent-Reach)
- [D4Vinci/Scrapling](https://github.com/D4Vinci/Scrapling)

