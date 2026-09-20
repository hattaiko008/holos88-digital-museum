# HOLOS 88｜SERVICE & BACKEND ARCHITECTURE 01

Date: 2026-09-20  
Status: working architecture / implementation staged

## Purpose

読者には一つの静かなMuseumとして見えながら、水面下では記事、資料、メール、SNS、購入、問い合わせ、分析が同じ台帳から動くようにする。人間関係を維持するためのコミュニティ運営を増やさず、コンテンツを作れば複数の入口と収益棚へ展開できる構造を優先する。

## Service layers

### 1｜OPEN MUSEUM

無料公開。HOLOS 88の記事、標本、博物辞書、Relationship、SOURCE WINDOW。検索流入と信頼の中心であり、全文の正本を置く。

### 2｜FREE LETTER

Substackで受け取る無料メール。更新通知だけでなく、一つの観察、一つの図版、一つのMICHIKUSAを届ける。読者のメールアドレスを得る入口だが、読者名簿の扱い、退会、配信同意を尊重する。

### 3｜QUIET SUPPORT

Ko-fiでの任意支援。無料記事を読んだ人が、見返りを複雑にせず活動を支えられる場所。頻繁な交流や個別返信を約束しない。

### 4｜PAID SHELF

Ko-fi ShopまたはMembershipで提供する、図版入りPDF、季節の小冊子、月ごとの編集号、SCREEN ESSAY、資料棚。無料記事の切り売りではなく、複数記事を新しい関係で編み直した保存版にする。

### 5｜COMMISSION WINDOW

HOLOSの仕事から自然につながる編集、リサーチ、世界観設計、コンテンツ設計、文化的キュレーション、マーケティング・コンサルティング。料金表を大きく掲げず、実績と方法が伝わる静かな問い合わせ窓口を置く。

## Frontend

読者が触れる面：

- HOME / COVER — 今回の入口。
- READ — LIFE NOTES、ECHO ARTICLES、SEASONAL WINDOWS、MUSEUM FEATURES。
- COLLECTION — 標本と資料。
- RELATIONSHIPS — 記事と標本の間の道。
- MICHIKUSA — 次の好奇心。
- LETTER — Substack登録への静かな入口。
- SUPPORT / SHOP — Ko-fiへの入口。HOLOSのデザインを崩さない小さな案内。
- WORK WITH HOLOS — 仕事依頼の説明と問い合わせ。
- ACCOUNT / COMMUNITY — 当面つくらない。外部サービス側の購入管理を利用する。

## Backend

### Editorial source

- GitHub：サイトコード、記事データ、変更履歴。
- Google Drive：下書き、調査資料、権利資料、契約書、顧客資料。
- 記事台帳：状態、著者、公開日、出典、図版権利、関連標本、配信パック、商品候補。

### Publishing

- HOLOS build：正本記事と恒久URLを生成。
- Distribution pack：note、Substack、Instagram、X、Pinterest、Ko-fi、YouTube用の別原稿を生成。
- Approval queue：Echoが公開前に一か所で確認する。
- Scheduler：承認済みの投稿だけを日時指定する。

### Email

- Substack：無料読者登録、配信停止、無料レター。
- Google Workspace：`hello@`、`editorial@`、`support@`等の受信と業務連絡。
- メール台帳：問い合わせ種別、返信期限、返信案、承認、対応済み。本文や個人情報を公開コンテンツ台帳へ混ぜない。

### Commerce

- Ko-fi：PayPal決済、支援、商品、メンバーシップ、購入者向け配布。
- PayPal：決済記録と返金。秘密鍵や個人情報をGitHubへ置かない。
- 商品台帳：商品ID、内容、価格、版、公開日、権利、購入後案内、更新方針、返金条件。
- 当面、HOLOS独自の会員ログインや決済DBは作らない。

### Customer care

- FAQ：配信、購入、ダウンロード、解約、返金、訂正、取材・仕事依頼。
- AIが分類、要約、返信案を作る。
- 送信は人間確認を基本とし、実績が蓄積した低リスクの定型案内だけ将来自動化する。
- コミュニティの常時モデレーション、DM相談、個別の人生相談はサービスに含めない。

### Measurement

- 見る数字：記事の完読、再訪、メール登録、リンク遷移、保存、購入、解約、問い合わせ、対応時間。
- 追わない数字：フォロワー数だけ、投稿量だけ、短期の表示回数だけ。
- 月次で「どの入口がLifeへ戻ったか」を一枚にまとめる。

## Minimal data flow

```text
IDEA / FIELD NOTE
       ↓
ARTICLE MASTER + SOURCE DESK + RIGHTS
       ↓
HOLOS PREVIEW → ECHO APPROVAL → PUBLISH
       ↓
DISTRIBUTION PACK
       ├── note / SEO
       ├── Substack / free email
       ├── Instagram / X / Pinterest
       ├── YouTube / screen essay
       └── Ko-fi / support or paid collection
                         ↓
                 PURCHASE / INQUIRY
                         ↓
              AUTOMATED ACKNOWLEDGEMENT
                         ↓
                HUMAN REVIEW IF NEEDED
                         ↓
                 INSIGHT → COMPOST
```

## Product candidates

### Low maintenance

- 季節の小冊子：七十二候の記事と図版を季節ごとに再編集。
- MONTHLY CONSTELLATION：一か月の記事をRelationshipで編み直すPDF。
- SCREEN ESSAY collection：映像または音声付きの小展示。
- ARCHIVE PACK：図版、出典案内、読書リスト、記事をまとめた資料棚。
- SUPPORTER LETTER：月1回まで。制作途中と次の窓。返信や交流を特典にしない。

### Limited capacity

- 編集・企画レビュー。
- リサーチとSOURCE DESK設計。
- Webやブランドの世界観・Relationship設計。
- コンテンツからSNS・レター・商品までの展開設計。

受付数を制限し、日常の執筆を圧迫しない。予約、ヒアリング、納品、請求を定型化できる仕事だけを商品化する。

## Automation stages

### Stage 1｜Now

- 記事マスターにSOURCE DESKとDISTRIBUTION PACKを付ける。
- サービス／商品候補を記事台帳へ記録する。
- 外部送信はしない。下書きとプレビューまで自動化する。

### Stage 2｜Accounts ready

- Google Workspace、Substack、Ko-fiを接続する。
- 無料登録、問い合わせ、購入後案内をテストする。
- 送信前承認キューを作る。

### Stage 3｜Publishing rhythm established

- 承認済みSNS投稿の予約。
- 新記事から無料レターと投稿案を自動生成。
- 購入後の定型案内、ダウンロード、FAQ返信を自動化。

### Stage 4｜Evidence based

- よく使う定型返信だけ自動送信。
- 月次レポートから、次の編集・商品候補を提案。
- 有料棚の更新通知を自動化。

## Human decision points

Echoが決める：公開、送信、価格、返金、商品内容、仕事の受注、政治・医療・金融等の高リスク表現、hachicoとECHOの声。

CHATOが準備する：調査、構成、下書き、校正、出典、図版候補、配信変換、FAQ、返信案、公開前検証、月次分析。

## Immediate build order

1. 記事台帳へサービス層、配信パック、商品候補の項目を追加する。
2. Webに `LETTER`、`SUPPORT`、`WORK WITH HOLOS` の控えめな入口を置けるデータ型を作る。
3. 秋分を最初の一件として、note・Substack・Instagram・X・Pinterest用の実原稿を作る。
4. 季節記事が4〜6本そろった時点で、最初の小冊子を設計する。
5. Workspace再開後にメールと問い合わせの実運用を接続する。

