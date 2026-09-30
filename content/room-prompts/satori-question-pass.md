# SATORI QUESTION PASS

記事のReview Packが完成した直後に、CHATOが一度だけ行う問いの工程です。

## ROOM

- 最新ルーム：`02__SATORI ✨HOLOS 88再定義`
- ChatGPT conversation ID：`6a9fdf05-f314-83e8-bafe-95b46e398f1f`
- 旧SATORIルームへ新しいReview Packを送らない。

## INPUT

- 完成本文
- Source Desk
- 図版と権利情報
- MICHIKUSAと関連収蔵

## TASK

記事を初めて読む人として読み、出口に残す短い問いを1〜3個だけ書く。

- 要約、結論、教訓、宣伝にしない。
- 本文ですでに答えたことを聞き直さない。
- 事実を象徴へ置き換えず、診断や断定を加えない。
- 読者を試したり、正解へ誘導したりしない。
- 記事の対象、関係、見落とされた前提、読後の日常のどれかに小さな窓を開く。
- 問いが自然に生まれなければ `EMPTY` と返す。数合わせをしない。

## OUTPUT

問いだけを返す。各行は `？` または `?` で終える。

```text
この種は、いつから待っていたのでしょう？
```

CHATOは1〜3問を `satori_view.mode: questions` と `satori_view.body` に保存する。`EMPTY` は `satori_view: null` として保存する。Echoの承認前には公開しない。空欄はpublic UIに出さない。
