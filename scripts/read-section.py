"""Print Markdown heading index, or an exact heading and its complete section."""
import pathlib
import re
import sys

path = pathlib.Path(sys.argv[1])
lines = path.read_text().splitlines(keepends=True)
headings = []
fence = False
for index, line in enumerate(lines):
    if line.lstrip().startswith(('```', '~~~')):
        fence = not fence
    match = re.match(r'^(#{1,6}) (.+?)\s*$', line) if not fence else None
    if match:
        headings.append((index, len(match[1]), match[2]))
if len(sys.argv) == 2:
    for index, level, name in headings:
        print(f'{index+1}: {"#"*level} {name}')
else:
    found = [(i, level) for i, level, name in headings if name == sys.argv[2]]
    if len(found) != 1:
        raise SystemExit('Expected one exact heading; use the heading index first.')
    start, level = found[0]
    end = next((i for i, depth, _ in headings if i > start and depth <= level), len(lines))
    print(''.join(lines[start:end]), end='')
