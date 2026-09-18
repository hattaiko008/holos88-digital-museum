# PHASE 04 FINAL REPORT

2026-09-17。承認済みデザインを維持したTOP/COVERの最終調整完了。ここで停止。

## 今回の変更

- Cover 01：日本語タイトルと水面の左右配分・位置を調整。
- Cover 02：8:45 WINDOWを大きくし、原油画像との大小差を明確化。
- Cover 03：THE ARCHAEOLOGY OF FEAR / 恐怖の考古学を表示。英語題と写真の構図を調整。
- Cover 04：既存Moonを使い、タイトルと画像の大小差を調整。
- Cover→READの間隔を整えた。「三つの窓から、世界へ。」は維持。
- Cover05の中央ロゴ、6つの配置、文字、図版placeholderは変更なし。
- 記事本文・記事CSS・PUBLICATION MASTERは今回変更なし。

変更ファイル：content/home.json、lib/cover.mjs、dist/cover.css、生成結果dist/index.html、tests/reading-experience.mjs。
追加：本報告、outputs/phase04/final-home.png、final-orbit.png、final-mobile-cover03.png。

## 最終検証

- build PASS。5ページ、157内部参照 PASS。
- 原稿文字列・段落順序・強調・SOURCE WINDOW・FLOW MAP・原本ロゴハッシュ PASS。
- Cover01から05まで実時間で自動進行し、05停止を再確認。
- 手動操作・矢印キーで03→02へ移動。自動停止、見えるfocus線を確認。
- 390pxでCover02/03ともdocument幅390px、横overflowなし。
- Cover→READリンクで#article-windowsへ移動し、見出しが表示領域へ入ることを確認。
- PLANTSフィルター＋Pyrus検索1件、Survivor Tree収蔵記録→物語への移動を再確認。
- MICHIKUSAを開きRETURN TO NEW YORKで閉じ、open-michikusaへfocus復帰を再確認。
- Article↔Specimen・Collection・Relationshipsの参照整合性と基準保持検査PASS。実際の往復操作は直前のPhase04レビュー報告にも記録。
- reduced motionの停止状態とJSなし静的主要入口は自動検査を再実行。ブラウザ模擬reduced-motion・script除去環境の動作確認は前回結果を継承（今回動作JSは変更なし）。OS設定切替の実機検証は未実施。
- 最終確認用ブラウザerrorログ0件。viewport override解除済み。

## 維持したもの

Phase03構造、既存ID/URL、検索・フィルターcore、Collection/Relationship構造、MICHIKUSA、記事と標本の逆引き、9.11本文、著者表記、原本ロゴ、source/rights構造、PUBLICATION MASTER。

## 後のVISUAL CURATION / 公開前確認

- ORBIT図版6点はtypographic placeholderを維持。Phase04完了を妨げる項目ではない。
- Water / Petroleum等は現状維持し、将来のVISUAL CURATION PASSへ。
- TEAM HOLOSによる原稿のFACT CHECK・SOURCE URL確定は公開前に必要。今回推測追加なし。
- SATORI / audioは意図的に空。CMS・新記事・新Phaseは開始していない。

## 確認URL

HOME: http://127.0.0.1:8088/

LIFE: http://127.0.0.1:8088/articles/horse-time.html

MARKET: http://127.0.0.1:8088/articles/five-percent.html

MUSEUM: http://127.0.0.1:8088/stories/archaeology-of-fear.html

以上をPHASE04 FINAL PASSの提出状態とする。追加変更は行わない。
