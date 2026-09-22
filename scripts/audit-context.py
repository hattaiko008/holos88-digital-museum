"""Local, read-only session audit. No API calls; never exports conversation text."""
import collections
import datetime
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]


def text_size(value):
    if isinstance(value, str):
        return len(value)
    if isinstance(value, list):
        return sum(len(x.get('text', '')) for x in value if isinstance(x, dict))
    return 0


def audit_session(path):
    models = collections.Counter()
    usage = collections.defaultdict(collections.Counter)
    previous = None
    model = 'unknown'
    events = 0
    calls = 0
    sizes = []
    malformed = 0
    for line in path.open():
        try:
            item = json.loads(line)
        except json.JSONDecodeError:
            malformed += 1
            continue
        p = item.get('payload', {})
        if item.get('type') == 'turn_context':
            model = p.get('model', 'unknown')
            models[model] += 1
        if item.get('type') == 'event_msg' and p.get('type') == 'token_count' and p.get('info'):
            info = p['info']
            total = info.get('total_token_usage')
            if total is not None and total != previous:
                usage[model].update(info.get('last_token_usage') or {})
                events += 1
                previous = total
        if item.get('type') == 'response_item':
            if p.get('type') in ('function_call', 'custom_tool_call'):
                calls += 1
            if p.get('type') in ('function_call_output', 'custom_tool_call_output'):
                sizes.append(text_size(p.get('output')))
    return dict(session=path.stem, models=models, usage_by_recorded_model=dict(usage),
                deduplicated_usage_events=events, tool_calls=calls,
                largest_tool_text_chars=sorted(sizes, reverse=True)[:5], malformed_lines=malformed)


def measure():
    old = ROOT / 'docs/history/agents-before-efficiency-2026-09-21.md'
    new = ROOT / 'AGENTS.md'
    parent = ROOT.parent / 'AGENTS.md'
    before = len(old.read_text())
    after = len(new.read_text()) + len(parent.read_text())
    # Deterministic replay: task only needs an exact known section of an existing brief.
    brief = (ROOT / 'content/briefs/design-reconstruction-research-01.md').read_text()
    start = brief.index('### Language hierarchy')
    end = brief.index('## 5｜', start)
    focused = brief[start:end]
    second_start = brief.index('## 6｜')
    second_end = brief.index('## 7｜', second_start)
    focused += brief[second_start:second_end]
    return dict(unit='Unicode characters, not tokens or billed credits',
                instruction_before=before, instruction_after_including_parent=after,
                instruction_reduction_percent=round(100*(1-after/before), 1),
                replay_full_brief_chars=len(brief), replay_relevant_sections_chars=len(focused),
                replay_reduction_percent=round(100*(1-len(focused)/len(brief)), 1),
                replay_scope='language/typography/category lookup only; not a whole-design task',
                replay_evidence='Exact unmodified sections retained, not summaries')


if __name__ == '__main__':
    paths = sorted((pathlib.Path.home()/'.codex/sessions').rglob('*.jsonl'))
    print(json.dumps(dict(measured_at=datetime.datetime.now(datetime.timezone.utc).isoformat(),
        scope='Available active local session files; excludes archived/cloud sessions',
        caveats=['Usage is sum of last_token_usage after adjacent total-usage deduplication.',
                 'Recorded model context is attribution evidence, not billing confirmation.',
                 'Reasoning tokens are a subset of output; cached input is a subset of input.',
                 'No per-task credit conversion, image token counts or quality A/B are available.'],
        measurements=measure(), sessions=[audit_session(p) for p in paths]), ensure_ascii=False, indent=2))
