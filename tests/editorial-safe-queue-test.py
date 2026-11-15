import json
import tempfile
from pathlib import Path
import importlib.util

root = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("qa", root / "scripts" / "editorial-safe-queue.py")
qa = importlib.util.module_from_spec(spec)
spec.loader.exec_module(qa)
with tempfile.TemporaryDirectory() as t:
    sandbox = Path(t)
    p = sandbox / "dist" / "prototype" / "articles"
    p.mkdir(parents=True)
    (p / "test.html").write_text('<link rel="canonical" href="https://holos88.com/prototype/articles/test.html">', encoding="utf-8")
    checks = dict.fromkeys(qa.REQUIRED_CHECKS, True)
    base = {"file": "test.html", "title": "A question", "series": "MICHIKUSA", "stage": "approved", "location": "/prototype/articles/test.html", "checks": checks}
    assert qa.inspect(base, sandbox)["decision"] == "review_candidate"
    assert qa.inspect({**base, "series": "LIFE NOTE"}, sandbox)["decision"] == "blocked"
    assert qa.inspect({**base, "stage": "final-review"}, sandbox)["decision"] == "blocked"
    assert qa.inspect({**base, "checks": {**checks, "sources": False}}, sandbox)["decision"] == "blocked"
    assert qa.inspect({**base, "location": "FEATURE"}, sandbox)["decision"] == "blocked"
    assert qa.inspect({**base, "file": "../test.html"}, sandbox)["decision"] == "blocked"
print("six editorial gate checks passed")
