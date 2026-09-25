# GEMINI EDITORIAL AUDIT 01

## ACCESS FOR WHOM? リライト試験

**DATE / 2026-09-25**  
**ROLE TESTED / Japanese line editor + longform collaborator**

## VERDICT

条件付き採用。

GeminiはECHOの意味、温度、段落構造を大きく壊さず保持した。短いノウハウ記事へ縮めず、倫理的な断定の強さも保った。この能力は日本語のリライト係として有用。

一方、FACT CHECK係としては不合格。変更量に対する新しい編集価値も小さく、完成稿の共同執筆者としては追加テストが必要。

## SCORE

- 声と意味の保持：8 / 10
- 日本語の自然さ：7 / 10
- 構成改善：6 / 10
- 新しい具体・読み応え：3 / 10
- 事実確認：3 / 10
- 変更説明の正確さ：4 / 10

## WHAT WORKED

- 6000字前後の長さを要約しなかった。
- ECHOの21℃の温度を大きく変えなかった。
- 自立、依存、尊厳に関する意味を保持した。
- 見出しを英語・日本語の二層へ整理した。
- 記事を箇条書き型ノウハウへ変えなかった。

## MATERIAL PROBLEMS

### 1｜誤った書誌情報

SOURCE DESKに `Whole Earth Catalog (1868-1971)` と記載。1868は明白な誤り。Whole Earth Catalogの初号は1968年。主要な刊行期は1968–1972年で、後年にも追加号があるため、単純な1968–1971という閉じ方も不正確。

### 2｜著者名の誤り

`Blackwell, May. The Curb Cut Effect` と記載したが、Stanford Social Innovation Reviewの2017年の記事はAngela Glover Blackwellによる “The Curb-Cut Effect”。

### 3｜確認済みという過剰申告

FACT CHECK DESKで「確認した事実」としたが、出典URL、該当箇所、確認日がない。Tool Library / Library of Thingsの「世界的な展開」も、範囲を定義せず確認済みとしている。

### 4｜診断と本文が一致しない

診断では具体例として斧、HP電卓、バークレーの運動を提案したが、完成稿へ反映していない。反映しなかった理由もない。

### 5｜変更説明と実出力が矛盾

CHANGE NOTESで `連連れて` を修正したと記述したが、完成稿には `全員を同じ読み方へ連連れていく` が残っている。

### 6｜SOURCE DESKを弱くした

元稿にあったWhole Earth Index、Computer History Museum、Fred Turner等の確認先を削り、誤記を含む三項目へ縮小した。

## APPROVED ROLE

Geminiは次の範囲で採用候補：

- 不自然な日本語の検出
- 文末の単調さと重複の指摘
- 長すぎる一文の分割案
- 段落接続の提案
- 原稿の声を保った代替表現

Geminiへ単独で任せないもの：

- FACT CHECKの最終判定
- SOURCE DESKの書き換え
- 数字、年代、人物名、書誌情報の追加
- 原稿への自動反映

## PROPOSED PIPELINE

1. ECHO + CHATO：問い、調査、構成、基準原稿
2. Gemini：日本語編集案と変更理由を提示
3. CHATO：原文差分、意味、事実、削除箇所を監査
4. 合格した変更だけを本文へ反映
5. Echo：公開前の最終確認

Geminiの出力を完成稿として自動上書きしない。差分提案として受け取り、CHATOの監査を必須ゲートにする。

## VERIFIED SOURCES FOR THIS AUDIT

- Whole Earth Index, Fall 1968：初号と “evaluation and access device” の説明
- Whole Earth Index：1968–1972年の主要刊行と、その後1998年までの追加刊行
- Whole Earth, Summer 1997：標語を “access to tools, ideas, and practices” へ更新
- Stanford Social Innovation Review, Angela Glover Blackwell, “The Curb-Cut Effect,” Winter 2017
