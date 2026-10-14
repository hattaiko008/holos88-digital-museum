import {readdir, readFile, writeFile} from 'node:fs/promises';

// Added at build time so standalone editions carry the same publication credit.
// Third-party images keep their own credits and rights notices.
export async function buildPublicationCopyright(root) {
  let added = 0;
  async function visit(directory) {
    for (const entry of await readdir(directory, {withFileTypes: true})) {
      const file = new URL(entry.name + (entry.isDirectory() ? '/' : ''), directory);
      if (entry.isDirectory()) { await visit(file); continue; }
      if (!entry.name.endsWith('.html') || entry.name.startsWith('editor-desk')) continue;
      const original = await readFile(file, 'utf8');
      if (/©\s*\d{4}\s*HOLOS\s*88|&copy;\s*\d{4}\s*HOLOS\s*88/i.test(original)) continue;
      const closing = original.lastIndexOf('</footer>');
      const credit = '<small data-publication-copyright style="display:block;font:11px/1.7 sans-serif;letter-spacing:0;color:inherit">© 2026 HOLOS88<br>図版・引用等の権利は各出典に従います。</small>';
      if (closing < 0) {
        // Some letter editions have no footer; give those a quiet, readable strip.
        if (!/<article\b/i.test(original) && !entry.name.startsWith('she-creates-')) continue;
        if (!original.includes('</body>')) continue;
        await writeFile(file, original.replace('</body>', '<footer data-publication-footer style="padding:20px 24px;background:#f6f3eb;color:#353832">' + credit + '</footer></body>'));
      } else {
        await writeFile(file, original.slice(0, closing) + credit + original.slice(closing));
      }
      added++;
    }
  }
  await visit(root);
  return added;
}
