document.addEventListener('DOMContentLoaded', () => {
  const mediaTabs = document.querySelectorAll('.media-tab');
  const forms = {
    web: document.getElementById('formWeb'),
    book: document.getElementById('formBook'),
    journal: document.getElementById('formJournal'),
    ai: document.getElementById('formAi')
  };

  const btnGenerate = document.getElementById('btnGenerate');
  const resultSection = document.getElementById('resultSection');

  const citationPreview = document.getElementById('citationPreview');
  const narrativePreview = document.getElementById('narrativePreview');
  const parentheticalPreview = document.getElementById('parentheticalPreview');

  const copyRichBtn = document.getElementById('copyRichBtn');
  const copyPlainBtn = document.getElementById('copyPlainBtn');
  const copyNarrativeBtn = document.getElementById('copyNarrativeBtn');
  const copyParentheticalBtn = document.getElementById('copyParentheticalBtn');

  // URL自動取得要素
  const webUrl = document.getElementById('webUrl');
  const btnAutoFetch = document.getElementById('btnAutoFetch');
  const fetchStatus = document.getElementById('fetchStatus');

  let currentMedia = 'web';

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // ─── 1. メディアフォームの完全切り替え ───
  mediaTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      mediaTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentMedia = tab.dataset.media;

      // すべてのフォームグループを隠し、選択されたものだけを表示
      Object.keys(forms).forEach(key => {
        if (forms[key]) forms[key].style.display = (key === currentMedia) ? 'flex' : 'none';
      });

      generateCitation();
    });
  });

  // ─── 2. 今日の閲覧日初期設定 ───
  const retrievedMonth = document.getElementById('retrievedMonth');
  const retrievedDay = document.getElementById('retrievedDay');
  const retrievedYear = document.getElementById('retrievedYear');
  const btnTodayRetrieved = document.getElementById('btnTodayRetrieved');

  if (retrievedMonth) {
    retrievedMonth.innerHTML = monthNames.map(m => `<option value="${m}">${m}</option>`).join('');
    function setTodayRetrieved() {
      const now = new Date();
      retrievedMonth.value = monthNames[now.getMonth()];
      retrievedDay.value = now.getDate();
      retrievedYear.value = now.getFullYear();
    }
    setTodayRetrieved();
    if (btnTodayRetrieved) btnTodayRetrieved.addEventListener('click', setTodayRetrieved);
  }

  // ─── 3. ✨ URLから自動取得（Microlink API使用） ───
  if (btnAutoFetch && webUrl) {
    btnAutoFetch.addEventListener('click', async () => {
      const url = webUrl.value.trim();
      if (!url) {
        alert('URLを入力してください');
        return;
      }

      btnAutoFetch.disabled = true;
      fetchStatus.textContent = '⏳ ページのメタ情報を取得中...';

      try {
        const apiUrl = `https://api.microlink.io?url=${encodeURIComponent(url)}`;
        const res = await fetch(apiUrl);
        const json = await res.json();

        if (json.status === 'success' && json.data) {
          const d = json.data;

          // ① 記事タイトル（ページタイトル）
          if (d.title) document.getElementById('webTitle').value = d.title;

          // ② サイト名（メディア名）
          if (d.publisher) document.getElementById('webSiteName').value = d.publisher;

          // 著者名
          if (d.author) document.getElementById('webAuthor').value = d.author;

          // 更新日（ISO日付から年月日に分解）
          if (d.date) {
            const pubDate = new Date(d.date);
            if (!isNaN(pubDate.getTime())) {
              document.getElementById('webYear').value = pubDate.getFullYear();
              document.getElementById('webMonth').value = monthNames[pubDate.getMonth()];
              document.getElementById('webDay').value = pubDate.getDate();
            }
          }

          fetchStatus.textContent = '✓ 情報を自動取得しました！内容を確認・調整してください。';
          generateCitation();
        } else {
          fetchStatus.textContent = '⚠️ 自動取得できませんでした。手動で入力してください。';
        }
      } catch (err) {
        fetchStatus.textContent = '⚠️ 通信エラーが発生しました。手動でご入力ください。';
      } finally {
        btnAutoFetch.disabled = false;
      }
    });
  }

  // ─── 4. APA引用生成ロジック ───
  function generateCitation() {
    let htmlParts = [];
    let plainParts = [];
    let inTextAuthor = '';
    let inTextYear = '';

    if (currentMedia === 'web') {
      const url = (document.getElementById('webUrl').value.trim()).replace(/[.,/]+$/, '');
      const title = document.getElementById('webTitle').value.trim();
      const siteName = document.getElementById('webSiteName').value.trim();
      const isSameSite = document.getElementById('webAuthorSameSite').checked;
      const author = document.getElementById('webAuthor').value.trim();
      const isMissingAuthor = document.getElementById('webAuthorMissing').checked;

      const year = document.getElementById('webYear').value.trim();
      const month = document.getElementById('webMonth').value;
      const day = document.getElementById('webDay').value.trim();
      const isNd = document.getElementById('webDateUnknown').checked;

      // 著者
      if (!isMissingAuthor && author) {
        htmlParts.push(`${author} `);
        plainParts.push(`${author} `);
        inTextAuthor = author;
      } else {
        inTextAuthor = title ? title.substring(0, 15) + '…' : 'タイトル';
      }

      // 日付 (例: (2019, July, 14) または (n.d.))
      if (isNd) {
        htmlParts.push(`(n.d.). `);
        plainParts.push(`(n.d.). `);
        inTextYear = 'n.d.';
      } else if (year) {
        inTextYear = year;
        if (month) {
          if (day) {
            htmlParts.push(`(${year}, ${month}, ${day}). `);
            plainParts.push(`(${year}, ${month}, ${day}). `);
            inTextYear = `${year}, ${month}, ${day}`;
          } else {
            htmlParts.push(`(${year}, ${month}). `);
            plainParts.push(`(${year}, ${month}). `);
            inTextYear = `${year}, ${month}`;
          }
        } else {
          htmlParts.push(`(${year}). `);
          plainParts.push(`(${year}). `);
        }
      }

      // 記事タイトル（斜体）
      if (title) {
        htmlParts.push(`<em>${title}</em>. `);
        plainParts.push(`${title}. `);
      }

      // Webサイト名（著者と同じなら省略）
      if (siteName && !isSameSite) {
        htmlParts.push(`${siteName}. `);
        plainParts.push(`${siteName}. `);
      }

      // Retrieved 日付
      if (retrievedMonth.value && retrievedDay.value && retrievedYear.value) {
        const ret = `Retrieved ${retrievedMonth.value}, ${retrievedDay.value}, ${retrievedYear.value}, from `;
        htmlParts.push(ret);
        plainParts.push(ret);
      }

      // URL（末尾ピリオドなし）
      if (url) {
        htmlParts.push(url);
        plainParts.push(url);
      }
    } 
    else if (currentMedia === 'book') {
      const title = document.getElementById('bookTitle').value.trim();
      const author = document.getElementById('bookAuthor').value.trim();
      const year = document.getElementById('bookYear').value.trim();
      const publisher = document.getElementById('bookPublisher').value.trim();
      const edition = document.getElementById('bookEdition').value.trim();
      const url = (document.getElementById('bookUrl').value.trim()).replace(/[.,/]+$/, '');

      inTextAuthor = author || '著者';
      inTextYear = year || '年';

      if (author) {
        htmlParts.push(`${author} `);
        plainParts.push(`${author} `);
      }
      if (year) {
        htmlParts.push(`(${year}). `);
        plainParts.push(`(${year}). `);
      }
      if (title) {
        const ed = edition ? ` (${edition})` : '';
        htmlParts.push(`<em>${title}</em>${ed}. `);
        plainParts.push(`${title}${ed}. `);
      }
      if (publisher) {
        htmlParts.push(`${publisher}.`);
        plainParts.push(`${publisher}.`);
      }
      if (url) {
        htmlParts.push(` ${url}`);
        plainParts.push(` ${url}`);
      }
    } 
    else if (currentMedia === 'journal') {
      const title = document.getElementById('journalArticleTitle').value.trim();
      const author = document.getElementById('journalAuthor').value.trim();
      const year = document.getElementById('journalYear').value.trim();
      const jName = document.getElementById('journalName').value.trim();
      const vol = document.getElementById('journalVolume').value.trim();
      const pages = document.getElementById('journalPages').value.trim();
      const doi = (document.getElementById('journalDoi').value.trim()).replace(/[.,/]+$/, '');

      inTextAuthor = author || '著者';
      inTextYear = year || '年';

      if (author) {
        htmlParts.push(`${author} `);
        plainParts.push(`${author} `);
      }
      if (year) {
        htmlParts.push(`(${year}). `);
        plainParts.push(`(${year}). `);
      }
      // 論文タイトルは「立体」
      if (title) {
        htmlParts.push(`${title}. `);
        plainParts.push(`${title}. `);
      }
      // 学術誌名と巻数は「斜体」（ガイドp.29準拠）
      if (jName) {
        htmlParts.push(`<em>${jName}</em>`);
        plainParts.push(jName);
      }
      if (vol) {
        htmlParts.push(`, <em>${vol}</em>`);
        plainParts.push(`, ${vol}`);
      }
      if (pages) {
        htmlParts.push(`, ${pages}.`);
        plainParts.push(`, ${pages}.`);
      } else {
        htmlParts.push('.');
        plainParts.push('.');
      }
      if (doi) {
        htmlParts.push(` ${doi}`);
        plainParts.push(` ${doi}`);
      }
    } 
    else if (currentMedia === 'ai') {
      const author = document.getElementById('aiAuthor').value.trim();
      const year = document.getElementById('aiYear').value.trim();
      const model = document.getElementById('aiModel').value.trim();
      const desc = document.getElementById('aiDesc').value.trim();
      const url = (document.getElementById('aiUrl').value.trim()).replace(/[.,/]+$/, '');

      inTextAuthor = author || 'OpenAI';
      inTextYear = year || '2024';

      if (author) {
        htmlParts.push(`${author}. `);
        plainParts.push(`${author}. `);
      }
      if (year) {
        htmlParts.push(`(${year}). `);
        plainParts.push(`(${year}). `);
      }
      if (model) {
        const descTag = desc ? ` [${desc}]` : '';
        htmlParts.push(`<em>${model}</em>${descTag}. `);
        plainParts.push(`${model}${descTag}. `);
      }
      if (url) {
        htmlParts.push(url);
        plainParts.push(url);
      }
    }

    const finalHtml = htmlParts.join('').trim() || '（入力して「作成」を押すと、ここにガイド通りの書式が生成されます）';
    const finalPlain = plainParts.join('').trim();

    citationPreview.innerHTML = finalHtml;
    citationPreview.dataset.plain = finalPlain;

    narrativePreview.textContent = `${inTextAuthor}(${inTextYear})`;
    parentheticalPreview.textContent = `(${inTextAuthor}, ${inTextYear})`;
  }

  // フォーム全体のinput監視（リアルタイム反映）
  document.querySelector('.form-panel').addEventListener('input', generateCitation);

  // ✦ 「作成する」ボタンを押したときの挙動
  if (btnGenerate) {
    btnGenerate.addEventListener('click', () => {
      generateCitation();
      resultSection.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // ─── コピー機能（Word / Google Docs 貼り付け対応） ───
  function setCopySuccess(btn) {
    const originalText = btn.textContent;
    btn.textContent = '✓ コピー完了';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = originalText;
      btn.classList.remove('copied');
    }, 1500);
  }

  copyRichBtn.addEventListener('click', async () => {
    const htmlData = citationPreview.innerHTML;
    const plainData = citationPreview.dataset.plain || citationPreview.innerText;
    try {
      const blobHtml = new Blob([htmlData], { type: 'text/html' });
      const blobText = new Blob([plainData], { type: 'text/plain' });
      const data = [new ClipboardItem({ 'text/html': blobHtml, 'text/plain': blobText })];
      await navigator.clipboard.write(data);
      setCopySuccess(copyRichBtn);
    } catch (e) {
      navigator.clipboard.writeText(plainData);
      setCopySuccess(copyRichBtn);
    }
  });

  copyPlainBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(citationPreview.dataset.plain || citationPreview.innerText);
    setCopySuccess(copyPlainBtn);
  });

  copyNarrativeBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(narrativePreview.textContent);
    setCopySuccess(copyNarrativeBtn);
  });

  copyParentheticalBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(parentheticalPreview.textContent);
    setCopySuccess(copyParentheticalBtn);
  });
});
