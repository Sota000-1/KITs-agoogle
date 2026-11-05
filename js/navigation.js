(() => {
  const button = document.querySelector('.header .menu-btn');
  if (!button || typeof HTMLDialogElement === 'undefined' ||
      typeof HTMLDialogElement.prototype.showModal !== 'function') return;

  const links = [
    ['index.html', 'Tools', '学びのツール'],
    ['about.html', 'About', 'KITsについて'],
    ['news.html', 'News', 'お知らせ'],
    ['links.html', 'Link', 'リンク集'],
    ['contact.html', 'Contact', 'お問い合わせ']
  ];
  const shortcuts = [
    ['time.html', '時計'],
    ['timer.html', 'タイマー'],
    ['pomodoro.html', 'ポモドーロ'],
    ['stopwatch.html', 'ストップウォッチ'],
    ['apa.html', 'APA Style Editor']
  ];
  const current = location.pathname.split('/').pop() || 'index.html';
  const dialog = document.createElement('dialog');
  dialog.className = 'kits-menu';
  dialog.id = 'kits-menu';
  dialog.setAttribute('aria-labelledby', 'kits-menu-title');
  dialog.innerHTML = `
    <div class="kits-menu-head"><h2 id="kits-menu-title">KITs<span>.</span></h2>
    <button type="button" class="kits-menu-close" aria-label="メニューを閉じる">×</button></div>
    <nav aria-label="サイトメニュー"><h3 class="kits-menu-label">ページ一覧</h3>
    ${links.map(([href, label, description]) =>
      `<a href="${href}"${href === current ? ' aria-current="page"' : ''}><span>${label}<small>${description}</small></span><span aria-hidden="true">→</span></a>`
    ).join('')}</nav>
    <div class="kits-shortcuts"><h3 class="kits-menu-label">よく使うツール</h3>
    <div>${shortcuts.map(([href, label]) => `<a href="${href}">${label}</a>`).join('')}</div></div>`;
  document.body.append(dialog);

  button.closest('.header').classList.add('kits-menu-ready');
  document.querySelector('.header .nav-link.active')?.setAttribute('aria-current', 'page');
  button.setAttribute('aria-label', 'メニューを開く');
  button.setAttribute('aria-haspopup', 'dialog');
  button.setAttribute('aria-controls', dialog.id);
  button.setAttribute('aria-expanded', 'false');
  button.addEventListener('click', () => {
    dialog.showModal();
    button.setAttribute('aria-expanded', 'true');
  });
  dialog.querySelector('.kits-menu-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const { left, top, right, bottom } = dialog.getBoundingClientRect();
    if (event.clientX < left || event.clientX >= right ||
        event.clientY < top || event.clientY >= bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    button.setAttribute('aria-expanded', 'false');
    button.focus();
  });
})();
