# WATCH THE NOW — Production Blueprint

Status: APPROVED BASE STRUCTURE  
Approved: 2026-09-26  
Reference issue: ISSUE 001

## Editorial principle

**権力には、鋭く。暮らす人には、温かく。**  
FACTS FOR THE PUBLIC · QUESTIONS FOR POWER

事実を確認し、権力を持つ側へより重い説明責任を求める。断定できないことは断定しない。生活者を無知として嘲笑せず、知るための入口と問いを手渡す。

## Publication rhythm

週末発行を基本とする。一週間の速報を並べるのではなく、金曜日までの政治・経済・地域・気候・文化を関係として読み直し、翌週の観察点を示す。

## Two separately saved editions

### FREE EDITION

- 今週を結ぶ中心の問い
- 世界・経済・地政学
- 日本政治・暮らし
- 地球・気候・生態系
- 文化・兆候・小さなニュース
- FROM THE GROUND / LOCAL JAPAN
- DEEPER THREADSへの入口
- 購読版への導線

File: `prototype/reconstruction-01/watch-the-now-YYYY-MM-DD.html`

### SUBSCRIBER EDITION

無料版とは別ファイルで保存する。説明や目次だけではなく、無料版に掲載した**各ニュース記事そのものの続編・深掘り本文**を収録する。

各記事の基本構造:

1. WHAT HAPPENED — 何が起きたか
2. WHO PAYS — 誰が代価を払うか
3. WHAT CONNECTS — 制度・歴史・思想・土地・暮らしとの関係
4. WHAT CAN WE SEE — HOLOSの視点で何が見えるようになるか
5. QUESTION TO LIFE — 読者が日常へ持ち帰る問い

File: `prototype/reconstruction-01/watch-the-now-YYYY-MM-DD-subscriber.html`

## Fixed sections

1. Editorial strap / 編集綱領
2. Masthead
3. Four-window deck
4. Lead question + seven days ahead
5. Real-photo editorial collage
6. Free news columns
7. FROM THE GROUND / LOCAL JAPAN
8. THE NEWS HAS ROOTS
9. FREE版: Subscriber導線 / 購読版: 実際の深掘り記事
10. A LETTER FROM THE WEEK
11. Source Desk

## Photography policy

- 大きな生成AIイラストは使用しない。
- 実写、一次資料、古写真、地図、統計図を優先する。
- Public Domain、CC0、利用条件を確認したCC素材を使用する。
- 撮影者、出典、ライセンスを誌面に明記する。
- 別の日時・場所の資料写真は、その違いをキャプションで明示する。
- 写真はAI加工せず、トリミング、濃淡、モノクロ、文字組みで編集する。
- 空白が「未完成」に見える箇所は、記事に関連した写真・資料・小さなデータ欄で整える。装飾だけで埋めない。

## Visual character

Economic newspaper × natural-history magazine × Brodovitch-inspired typography.

- 英語見出しを大きく、日本語を意味の補助として置く。
- 写真は大小を大胆に組み、均等なカード列にしない。
- 紙、罫線、段組み、実資料の質感を使う。
- 色は深緑、赤褐色、新聞紙色を基本にする。
- 無料版と購読版は同じ世界観を持ち、SUBSCRIBER EDITION表記で明確に区別する。

## Local reporting rule

災害は発災時だけで終わらせず、被害確定、生活再建、保険・支援、復旧時間、自治体予算、次の災害への改善をFOLLOW-UP LEDGERで継続する。

政治を演壇の言葉だけでなく、濡れた床が乾くまでの時間、失われた営業日、通れない道路、届くまでの支援で測る。

## Reference implementation

- FREE: `dist/prototype/watch-the-now-2026-09-26.html`
- SUBSCRIBER: `dist/prototype/watch-the-now-2026-09-26-subscriber.html`
- AI collage asset `dist/assets/watch-the-now-issue-001.png` is deprecated and must not be used in future issues.

## Subscriber completeness rule

購入版では、無料版に掲載した**全記事**に深掘りを用意する。主要記事だけを深掘りして、残りを無料版の再掲で済ませない。短報には短い追加解説でもよいが、必ず「背景・代価・関係・持ち帰る問い」のいずれかを加える。

## Recurring subscriber departments

毎号、直近の出来事とは別に、次の定点観測を置く。

- LONG VIEW — 国際市場、金利、為替、資源、人口、債務を長期で見る
- LIFE ECONOMY — 税、社会保険料、賃金、物価、家賃、食、介護と暮らし
- WAR & PEACE — 戦争を可能にする経路と、平和を維持する実務
- CLIMATE LEDGER — 気候、災害、復旧、適応、生態系
- CULTURE & ARTS — 芸術・映画・音楽・文学から時代の兆候を読む

## Museum growth loop

各号末尾に `WINDOWS BORN FROM NOW` を置く。今週の記事から生まれ、まだMuseumにない問いを次の記事候補として登録する。現在のニュースを入口にして歴史・哲学・科学を理解しやすくし、完成後は元のニュース記事と相互リンクする。

## Opening declaration

マストヘッド直下に `WHAT THIS PAPER IS / AND IS NOT` を毎号置く。

WATCH THE NOWはニュースの速報・網羅・一般的解説を代替しない。報道機関が伝えた出来事を入口に、「そこから何が見えるか」「誰の暮らしが隠れるか」「何とつながるか」「自分の判断はどう揺れるか」を扱う。

**NEWS TELLS US WHAT HAPPENED. WE ASK WHAT IT REVEALS.**  
**THINKING ABOUT THINKING. / 私たちは、考えることを考える。**

## TEAM HOLOS COLUMN / 複数カテゴリー収蔵

WATCH THE NOWから生まれた解説・考察記事は、著者個人の連載だけに閉じず、`TEAM HOLOS COLUMN`として扱う。記事は一つの主分類を持ちつつ、水面下の複数タグによって関連する各入口へ同時に現れる。

例：

- `WHAT DOES 100 TRILLION BUILD?`
  - 主分類：ECONOMY / 経済
  - 関連：POLITICS、INFRASTRUCTURE、ODA、LOCAL LIFE、CORRUPTION
- `THE RED CARPET IS A MAP`
  - 主分類：WORLD / 国際
  - 関連：DIPLOMACY、HISTORY、AI、SECURITY、JAPAN
- `PEACE IS NOT SILENCE`
  - 主分類：WAR & PEACE / 戦争と平和
  - 関連：LAW、UN、MEDIA、DAILY LIFE、HUMAN RIGHTS

読者には分類システムを意識させすぎず、「この記事は別の窓にもつながっている」と自然に見えるようにする。

## MICHIKUSA DISPLAY RULE / 道草を増やしすぎない

MICHIKUSAは関連記事一覧ではなく、読後に開く小さな横道である。すべてを同じカードとして並べない。

### 記事末で常時見せるもの

- 最大3枚
- `NEAR / 近くへ`：本文と直接つながる記事
- `SIDEWAYS / 横へ`：意外な分野へ移る記事
- `RETURN / Lifeへ`：日常、暦、hachico、実践へ戻る記事

### 「さらに道草する」を開いたとき

- 小型カードまたは索引形式で6〜12件
- TIME、PLACE、PERSON、OBJECT、QUESTIONの切り口を混ぜる
- 同じ記事を何度も見せず、閲覧履歴や現在の記事に応じて入れ替える

### 膨大になった後

- 全件を記事下へ並べない
- MICHIKUSA専用ページへ集約する
- 天体軌道、博物画の道、地図、年表など、内容に合う閲覧方法を選べる
- 表面ではカード、裏側ではタグと関連度で管理する

MICHIKUSAの目的は回遊数を増やすことだけではない。読み終えた記事を別の知識やLifeへ結び直し、HOLOS固有の「知恵の連鎖」を体験させることである。
