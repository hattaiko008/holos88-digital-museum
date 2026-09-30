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
  const pipelineList = document.querySelector('#pipeline-list');
  const pipelineCounts = document.querySelector('#pipeline-counts');
  const stageFilter = document.querySelector('#stage-filter');
  const pipelineSearch = document.querySelector('#pipeline-search');
  const publicationStage = document.querySelector('#publication-stage');
  const publicationLocation = document.querySelector('#publication-location');
  const publicationNote = document.querySelector('#publication-note');
  const publicationSummary = document.querySelector('#publication-summary');
  const savePublication = document.querySelector('#save-publication');
  const publicationChecks = [...document.querySelectorAll('[data-check]')];

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
  let editorialState = {stages:[], articles:[]};
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

  const currentEditorial = () => editorialState.articles.find(item => item.file === currentName);
  const completedChecks = item => Object.values(item?.checks || {}).filter(Boolean).length;
  const stageLabel = id => editorialState.stages.find(item => item.id === id)?.label || id || '未設定';

  const renderPipeline = () => {
    if (!editorialState.articles.length) return;
    const query = pipelineSearch.value.trim().toLocaleLowerCase('ja');
    const stage = stageFilter.value;
    const filtered = editorialState.articles.filter(item => (!stage || item.stage === stage) && (!query || `${item.title} ${item.series} ${item.file}`.toLocaleLowerCase('ja').includes(query)));
    pipelineCounts.innerHTML = editorialState.stages.map(item => `<button type="button" data-stage-count="${item.id}"><b>${editorialState.articles.filter(article => article.stage === item.id).length}</b><span>${item.label}</span></button>`).join('');
    pipelineList.innerHTML = filtered.length ? filtered.map(item => `<article class="pipeline-item" data-stage="${item.stage}"><div><span class="stage-mark">${stageLabel(item.stage)}</span><small>${item.series || 'HOLOS 88'}</small></div><h3>${item.title}</h3><p>${completedChecks(item)} / 5 CHECKED${item.location ? ` · ${item.location}` : ''}</p><button type="button" data-open-article="${item.file}">確認・編集する →</button></article>`).join('') : '<p class="pipeline-empty">この条件の記事はありません。</p>';
  };

  const loadEditorialState = async () => {
    try {
      let response = await fetch('/__editor/status', {cache:'no-store'});
      if (!response.ok) response = await fetch('/prototype/editorial-status.json', {cache:'no-store'});
      if (!response.ok) return;
      editorialState = await response.json();
      const local = localStorage.getItem('holos-editorial-status');
      if (local) {
        const localState = JSON.parse(local);
        const sourceByFile = new Map(editorialState.articles.map(item => [item.file,item]));
        editorialState.articles = localState.articles.map(item => {
          const sourceItem=sourceByFile.get(item.file);
          return sourceItem && Date.parse(sourceItem.updated||0)>Date.parse(item.updated||0) ? sourceItem : item;
        });
        localStorage.setItem('holos-editorial-status', JSON.stringify(editorialState));
      }
      publicationStage.innerHTML = editorialState.stages.map(item => `<option value="${item.id}">${item.label}</option>`).join('');
      stageFilter.innerHTML = '<option value="">すべての状態</option>' + editorialState.stages.map(item => `<option value="${item.id}">${item.label}</option>`).join('');
      renderPipeline();
    } catch {}
  };

  const fillPublicationCard = () => {
    const item = currentEditorial();
    if (!item) { publicationSummary.textContent = 'この記事の進行記録はまだありません。'; return; }
    publicationStage.value = item.stage;
    publicationLocation.value = item.location || '';
    publicationNote.value = item.note || '';
    publicationChecks.forEach(input => { input.checked = Boolean(item.checks?.[input.dataset.check]); });
    publicationSummary.textContent = `${completedChecks(item)} / 5項目確認済み · ${stageLabel(item.stage)}`;
  };

  const saveEditorialState = async () => {
    const item = currentEditorial();
    if (!item) return;
    item.stage = publicationStage.value;
    item.location = publicationLocation.value.trim();
    item.note = publicationNote.value.trim();
    item.checks = Object.fromEntries(publicationChecks.map(input => [input.dataset.check, input.checked]));
    item.updated = new Date().toISOString();
    localStorage.setItem('holos-editorial-status', JSON.stringify(editorialState));
    let savedToFile=false;
    try {
      const response = await fetch('/__editor/status', {method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(editorialState)});
      savedToFile=response.ok;
    } catch {}
    publicationSummary.textContent = `${completedChecks(item)} / 5項目確認済み · ${stageLabel(item.stage)}`;
    renderPipeline();
    setStatus(savedToFile ? '記事の進行状況を管理ファイルへ保存しました。' : '記事の進行状況を、このブラウザへ保存しました。');
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
    let nodes = [...doc.querySelectorAll(
      '.article-hero>h1,.article-title-ja p,.byline,.team-explains,.article-body h1,.article-body h2,.article-body h3,.article-body p,.article-body li,.article-body blockquote'
    )];

    // SHE CREATES and other magazine pages use their own layout vocabulary
    // instead of the standard .article-hero / .article-body structure.
    if (!nodes.length) nodes = [...doc.querySelectorAll(
      'main h1,main h2,main h3,main p,main li,main blockquote'
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
      fillPublicationCard();
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
    const width=Math.max(680,Math.round(screen.availWidth*.52));
    const height=Math.max(700,screen.availHeight-80);
    const left=Math.max(0,screen.availWidth-width);
    const comparison=window.open(`${href}?editor-preview=${Date.now()}`, 'holos-article-comparison', `popup=yes,width=${width},height=${height},left=${left},top=20,scrollbars=yes,resizable=yes`);
    if (comparison) {
      comparison.focus();
      setStatus('WEB版を別ウィンドウで開きました。編集机と並べて確認できます。');
    } else {
      window.open(`${href}?editor-preview=${Date.now()}`, '_blank', 'noopener');
      setStatus('WEB版を別タブで開きました。ブラウザが別ウィンドウを止めた場合は、ポップアップを許可してください。');
    }
  };

  folderButton.addEventListener('click', async () => { if (!(await connectLocalServer())) openFolder(); });
  articleSelect.addEventListener('change', event => loadArticle(event.target.value));
  articleFilter.addEventListener('input', filterArticles);
  titleField.addEventListener('input', () => setDirty(true));
  descriptionField.addEventListener('input', () => setDirty(true));
  backupButton.addEventListener('click', backup);
  previewButton.addEventListener('click', preview);
  savePublication.addEventListener('click', saveEditorialState);
  stageFilter.addEventListener('change', renderPipeline);
  pipelineSearch.addEventListener('input', renderPipeline);
  pipelineCounts.addEventListener('click', event => { const button=event.target.closest('[data-stage-count]'); if(!button)return; stageFilter.value=button.dataset.stageCount; renderPipeline(); });
  pipelineList.addEventListener('click', async event => { const button=event.target.closest('[data-open-article]'); if(!button)return; articleSelect.value=button.dataset.openArticle; await loadArticle(button.dataset.openArticle); document.querySelector('.controls').scrollIntoView({behavior:'smooth'}); });
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
  loadEditorialState();
  connectLocalServer();
})();
