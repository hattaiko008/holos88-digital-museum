(() => {
  const folderButton = document.querySelector('#open-folder');
  const articleTools = document.querySelector('.article-tools');
  const articleSelect = document.querySelector('#article-select');
  const articleFilter = document.querySelector('#article-filter');
  const saveButton = document.querySelector('#save');
  const backupButton = document.querySelector('#backup');
  const previewButton = document.querySelector('#preview');
  const editor = document.querySelector('#editor');
  const status = document.querySelector('#status');
  const meta = document.querySelector('.file-meta');
  const fileName = document.querySelector('#file-name');
  const titleField = document.querySelector('#document-title');
  const descriptionField = document.querySelector('#meta-description');
  const dirtyState = document.querySelector('#dirty-state');

  let sourceDirectory = null;
  let publicDirectory = null;
  let sourceHandle = null;
  let publicHandle = null;
  let source = '';
  let doc = null;
  let bindings = [];
  let articles = [];
  let currentName = '';
  let dirty = false;
  let serverMode = false;
  const requestedArticle = new URLSearchParams(location.search).get('article');

  const setStatus = (message, error = false) => {
    status.textContent = message;
    status.classList.toggle('error', error);
  };

  const setDirty = value => {
    dirty = value;
    dirtyState.textContent = value ? '未保存の変更あり' : '保存済み';
    dirtyState.classList.toggle('is-dirty', value);
  };

  const getDirectory = async (root, parts) => {
    let directory = root;
    for (const part of parts) directory = await directory.getDirectoryHandle(part);
    return directory;
  };

  const labelFor = node => ({
    H1: 'MAIN TITLE', H2: 'SECTION TITLE', H3: 'SMALL HEADING',
    P: 'PARAGRAPH', LI: 'LIST ITEM', BLOCKQUOTE: 'QUOTATION'
  })[node.tagName] || node.tagName;

  const setBlockVisibility = (row, button, isPrivate) => {
    row.classList.toggle('is-private', isPrivate);
    row.dataset.private = isPrivate ? 'true' : 'false';
    button.setAttribute('aria-pressed', String(isPrivate));
    button.textContent = isPrivate ? '非公開メモ（Webには出ません）' : '公開する文章';
  };

  const render = () => {
    editor.innerHTML = '';
    bindings = [];
    const nodes = [...doc.querySelectorAll(
      '.article-hero>h1,.article-title-ja p,.byline,.team-explains,.article-body h1,.article-body h2,.article-body h3,.article-body p,.article-body li,.article-body blockquote'
    )];

    nodes.forEach((node, index) => {
      if (node.closest('figure') || node.closest('.reading-trail')) return;
      const row = document.createElement('article');
      row.className = 'edit-block';
      row.dataset.tag = node.tagName;
      const label = document.createElement('p');
      label.className = 'block-label';
      label.textContent = `${String(index + 1).padStart(2, '0')} / ${labelFor(node)}`;
      const visibility = document.createElement('button');
      visibility.type = 'button';
      visibility.className = 'visibility-toggle';
      visibility.title = '原稿に残したまま、Webで公開するかを切り替えます';
      setBlockVisibility(row, visibility, node.classList.contains('holos-private-note'));
      visibility.addEventListener('click', () => {
        setBlockVisibility(row, visibility, row.dataset.private !== 'true');
        setDirty(true);
      });
      const copy = document.createElement('div');
      copy.className = 'edit-copy';
      copy.contentEditable = 'true';
      copy.spellcheck = true;
      copy.innerHTML = node.innerHTML;
      copy.addEventListener('input', () => setDirty(true));
      copy.addEventListener('paste', event => {
        event.preventDefault();
        document.execCommand('insertText', false, event.clipboardData.getData('text/plain'));
      });
      const blockHead = document.createElement('div');
      blockHead.className = 'block-head';
      blockHead.append(label, visibility);
      row.append(blockHead, copy);
      editor.append(row);
      bindings.push({ node, copy, row });
    });

    if (!bindings.length) {
      editor.innerHTML = '<div class="empty"><span>ARTICLE BODY NOT FOUND</span><p>本文を読み取れない記事です。CHATOさんにお知らせください。</p></div>';
    }
  };

  const loadArticle = async name => {
    if (!name || (!sourceDirectory && !serverMode)) return;
    if (dirty && name !== currentName && !window.confirm('まだ保存していない変更があります。保存せずに別の記事を開きますか？')) {
      articleSelect.value = currentName;
      return;
    }
    try {
      if (serverMode) {
        const response = await fetch(`/__editor/article?name=${encodeURIComponent(name)}`, {cache:'no-store'});
        if (!response.ok) throw new Error('記事データを読み込めません');
        source = (await response.json()).html;
        sourceHandle = null;
        publicHandle = null;
      } else {
        sourceHandle = await sourceDirectory.getFileHandle(name);
        publicHandle = await publicDirectory.getFileHandle(name, { create: true });
        const file = await sourceHandle.getFile();
        source = await file.text();
      }
      doc = new DOMParser().parseFromString(source, 'text/html');
      fileName.textContent = name;
      titleField.value = doc.title || '';
      descriptionField.value = doc.querySelector('meta[name="description"]')?.content || '';
      meta.hidden = false;
      saveButton.disabled = false;
      backupButton.disabled = false;
      previewButton.disabled = false;
      currentName = name;
      render();
      setDirty(false);
      setStatus('記事を開きました。言葉を直したら「原稿とWebへ保存」を押してください。');
    } catch (error) {
      setStatus(`記事を開けませんでした：${error.message}`, true);
    }
  };

  const showArticles = async names => {
    articles = names;
    articleSelect.innerHTML = '<option value="">記事を選んでください</option>' +
      articles.map(name => `<option value="${name}">${name.replace(/\.html$/, '').replaceAll('-', ' ')}</option>`).join('');
    articleTools.hidden = false;
    if (requestedArticle && articles.includes(requestedArticle)) {
      articleSelect.value = requestedArticle;
      await loadArticle(requestedArticle);
      setStatus('いま見ていた記事を開きました。そのまま文章を修正できます。');
    } else {
      setStatus(`${articles.length}本の記事を見つけました。編集する記事を選んでください。`);
    }
  };

  const connectLocalServer = async () => {
    try {
      const response = await fetch('/__editor/articles', {cache:'no-store'});
      if (!response.ok) return false;
      serverMode = true;
      const data = await response.json();
      await showArticles(data.articles || []);
      folderButton.textContent = '記事一覧を更新';
      return true;
    } catch { return false; }
  };

  const openFolder = async () => {
    if (!window.showDirectoryPicker) {
      setStatus('この編集机はChromeで使用してください。', true);
      return;
    }

    try {
      const root = await showDirectoryPicker({ mode: 'readwrite' });
      sourceDirectory = await getDirectory(root, ['prototype', 'reconstruction-01', 'articles']);
      publicDirectory = await getDirectory(root, ['dist', 'prototype', 'articles']);
      articles = [];
      for await (const [name, handle] of sourceDirectory.entries()) {
        if (handle.kind === 'file' && name.endsWith('.html')) articles.push(name);
      }
      articles.sort((a, b) => a.localeCompare(b, 'ja'));
      serverMode = false;
      folderButton.textContent = 'HOLOSフォルダを選び直す';
      await showArticles(articles);
    } catch (error) {
      if (error.name !== 'AbortError') {
        setStatus('「HOLOS88-DIGITAL-MUSEUM」フォルダを選んでください。', true);
      }
    }
  };

  const filterArticles = () => {
    const query = articleFilter.value.trim().toLocaleLowerCase('ja');
    [...articleSelect.options].forEach((option, index) => {
      if (!index) return;
      option.hidden = Boolean(query) && !`${option.value} ${option.textContent}`.toLocaleLowerCase('ja').includes(query);
    });
  };

  const build = () => {
    bindings.forEach(({ node, copy, row }) => {
      node.innerHTML = copy.innerHTML;
      node.classList.toggle('holos-private-note', row.dataset.private === 'true');
    });
    let visibilityStyle = doc.querySelector('#holos-private-visibility');
    if (!visibilityStyle) {
      visibilityStyle = doc.createElement('style');
      visibilityStyle.id = 'holos-private-visibility';
      doc.head.append(visibilityStyle);
    }
    visibilityStyle.textContent = '.holos-private-note{display:none!important}';
    doc.title = titleField.value.trim();
    let description = doc.querySelector('meta[name="description"]');
    if (!description) {
      description = doc.createElement('meta');
      description.name = 'description';
      doc.head.append(description);
    }
    description.content = descriptionField.value.trim();
    return '<!doctype html>\n' + doc.documentElement.outerHTML;
  };

  const download = (text, name) => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([text], { type: 'text/html;charset=utf-8' }));
    link.download = name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  };

  const backup = () => {
    if (!currentName) return;
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    download(source, `${currentName.replace(/\.html$/, '')}-backup-${stamp}.html`);
    setStatus('変更前のバックアップをダウンロードしました。');
  };

  const writeFile = async (handle, html) => {
    const writable = await handle.createWritable();
    await writable.write(html);
    await writable.close();
  };

  const save = async () => {
    if (!currentName || (!serverMode && (!sourceHandle || !publicHandle))) return;
    try {
      const html = build();
      if (serverMode) {
        const response = await fetch(`/__editor/article?name=${encodeURIComponent(currentName)}`, {
          method:'PUT', headers:{'Content-Type':'text/html; charset=utf-8'}, body:html
        });
        if (!response.ok) throw new Error('ローカルサーバーへ保存できません');
      } else {
        await writeFile(sourceHandle, html);
        await writeFile(publicHandle, html);
      }
      source = html;
      setDirty(false);
      setStatus('保存しました。原稿とWeb表示の両方に同じ変更が反映されています。');
    } catch (error) {
      setStatus(`保存できませんでした：${error.message}`, true);
    }
  };

  const preview = () => {
    if (!currentName) return;
    const href=currentName.startsWith('pages/')
      ? `/prototype/${encodeURIComponent(currentName.slice(6))}`
      : `/prototype/articles/${encodeURIComponent(currentName)}`;
    window.open(`${href}?editor-preview=${Date.now()}`, '_blank', 'noopener');
  };

  folderButton.addEventListener('click', async () => { if (!(await connectLocalServer())) openFolder(); });
  articleSelect.addEventListener('change', event => loadArticle(event.target.value));
  articleFilter.addEventListener('input', filterArticles);
  titleField.addEventListener('input', () => setDirty(true));
  descriptionField.addEventListener('input', () => setDirty(true));
  backupButton.addEventListener('click', backup);
  previewButton.addEventListener('click', preview);
  saveButton.addEventListener('click', save);
  addEventListener('keydown', event => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's' && !saveButton.disabled) {
      event.preventDefault();
      save();
    }
  });
  addEventListener('beforeunload', event => {
    if (!dirty) return;
    event.preventDefault();
    event.returnValue = '';
  });
  connectLocalServer();
})();
