# Reader feedback inbox

`server.mjs` appends local preview submissions to `inbox.jsonl`. The inbox is ignored by Git because comments are reader data, not publication source.

The public host must provide the same `POST /api/feedback` contract before launch:

```json
{
  "article": "article-file.html",
  "title": "Article title",
  "rating": 5,
  "comment": "Optional comment, up to 800 characters",
  "request": "Optional topic request, up to 300 characters",
  "email": "Optional receipt address",
  "replyRequested": true
}
```

Email is accepted only when the reader explicitly requests a receipt. Keep it out of the editorial inbox; write it to the private reply queue and delete it after delivery and the retention window. Never subscribe it to a newsletter. Do not add names, IP addresses or advertising identifiers. Rate-limit and spam-filter at the edge. Keep responses private to the editorial team and define a retention period before production launch.

`auto-reply-templates.json` contains the reviewed receipt texts. Local preview only queues a selected template in ignored `reply-queue.jsonl`; it does not send mail. Production must connect that queue to the chosen transactional email provider and record delivery/failure separately.
