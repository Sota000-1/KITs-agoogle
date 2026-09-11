document.addEventListener('DOMContentLoaded', () => {
  // ─── DOM要素の取得 ───
  const mediaTabs = document.querySelectorAll('.media-tab');
  
  const authorInput = document.getElementById('authorInput');
  const authorMissing = document.getElementById('authorMissing');
  const yearInput = document.getElementById('yearInput');
  const monthSelect = document.getElementById('monthSelect');
  const dayInput = document.getElementById('dayInput');
  const dateUnknown = document.getElementById('dateUnknown');

  const titleInput = document.getElementById('titleInput');
  const titleLabelText = document.getElementById('titleLabelText');

  const sourceSection = document.getElementById('sourceSection');
  const sourceLabel1 = document.getElementById('sourceLabel1');
  const sourceInput1 = document.getElementById('sourceInput1');
  const sourceCol2 = document.getElementById('sourceCol2');
  const sourceLabel2 = document.getElementById('sourceLabel2');
  const sourceInput2 = document.getElementById('sourceInput2');
  const authorSameSiteLabel = document.getElementById('authorSameSiteLabel');
  const authorSameSite = document.getElementById('authorSameSite');

  const urlInput = document.getElementById('urlInput');
  const retrievedSection = document.getElementById('retrievedSection');
  const retrievedMonth = document.getElementById('retrievedMonth');
  const retrievedDay = document.getElementById('retrievedDay');
  const retrievedYear = document.getElementById('retrievedYear');
  const btnTodayRetrieved = document.getElementById('btnTodayRetrieved');

  const citationPreview = document.getElementById('citationPreview');
  const narrativePreview = document.getElementById('narrativePreview');
  const parentheticalPreview = document.getElementById('parentheticalPreview');

  const copyRichBtn = document.getElementById('copyRichBtn');
  const copyPlainBtn = document.getElementById('copyPlainBtn');
  const copyNarrativeBtn = document.getElementById('copyNarrativeBtn');
  const copyParentheticalBtn = document.getElementById('copyParentheticalBtn');

  let currentMedia = 'web'; // 'web', 'book', 'journal', 'ai'

  // ─── 今日の日付を閲覧日に設定 ───
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  function setTodayRetrieved() {
    const now = new Date();
    retrievedMonth.value = monthNames[now.getMonth()];
    retrievedDay.value = now.getDate();
    retrievedYear.value = now.getFullYear();
    generateCitation();
  }
  setTodayRetrieved();
  btnTodayRetrieved.addEventListener('click', setTodayRetrieved);

  // ─── メディア切り替え ───
  mediaTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      mediaTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentMedia = tab.dataset.media;
      updateFormLayout();
      generateCitation();
    });
  });

  function updateFormLayout() {
    // リセット＆表示制御
    sourceSection.style.display = 'grid';
    sourceCol2.style.display = 'flex';
    authorSameSiteLabel.style.display = 'none';
    retrievedSection.style.display = 'none';

    if (currentMedia === 'web') {
      titleLabelText.textContent = 'Webページタイトル（記事名）';
      sourceLabel1.textContent = 'Webサイトのタイトル';
      sourceInput1.placeholder = '例: 東洋経済 ONLINE';
      sourceCol2.style.display = 'none';
      authorSameSiteLabel.style.display = 'inline-flex';
      retrievedSection.style.display = 'flex';
    } 
    else if (currentMedia === 'book') {
      titleLabelText.textContent = '書籍タイトル';
      sourceLabel1.textContent = '出版社名';
      sourceInput1.placeholder = '例: ミネルヴァ書房';
      sourceLabel2.textContent = '版（あれば）';
      sourceInput2.placeholder = '例: 2nd ed. または 第2版';
    } 
    else if (currentMedia === 'journal') {
      titleLabelText.textContent = '論文タイトル';
      sourceLabel1.textContent = '学術誌名（ジャーナル名）';
      sourceInput1.placeholder = '例: 北星学園大学文学部北星論集';
      sourceLabel2.textContent = '巻数, ページ数';
      sourceInput2.placeholder = '例: 51, 31-43';
    } 
    else if (currentMedia === 'ai') {
      // 公式APA 7th edition AI引用モード
      authorInput.value = authorInput.value || 'OpenAI';
      titleLabelText.textContent = 'AIツール名 & バージョン';
      titleInput.placeholder = '例: ChatGPT (2024年3月版)';
      sourceLabel1.textContent = 'モデル種別説明 [角カッコ]';
      sourceInput1.value = sourceInput1.value || 'Large language model';
      sourceCol2.style.display = 'none';
      urlInput.value = urlInput.value || 'https://chat.openai.com';
    }
  }
  updateFormLayout();

  // ─── 引用生成コアロジック ───
  function generateCitation() {
    const author = authorInput.value.trim();
    const isMissingAuthor = authorMissing.checked;
    const year = yearInput.value.trim();
    const month = monthSelect.value;
    const day = dayInput.value.trim();
    const isNd = dateUnknown.checked;
    const title = titleInput.value.trim();
    const s1 = sourceInput1.value.trim();
    const s2 = sourceInput2.value.trim();
    const isSameSite = authorSameSite.checked;
    const rawUrl = urlInput.value.trim();
    // 末尾のピリオド・カンマを除去（ガイドp.19徹底ルール）
    const cleanUrl = rawUrl.replace(/[.,/]+$/, '');

    // 1. 日付文字列の構築 (例: (2019, June, 14) または (n.d.))
    let dateStr = '';
    let inTextYear = '';
    if (isNd) {
      dateStr = '(n.d.).';
      inTextYear = 'n.d.';
    } else if (year) {
      inTextYear = year;
      if ((currentMedia === 'web') && month) {
        if (day) {
          dateStr = `(${year}, ${month}, ${day}).`;
          inTextYear = `${year}, ${month}, ${day}`;
        } else {
          dateStr = `(${year}, ${month}).`;
          inTextYear = `${year}, ${month}`;
        }
      } else {
        dateStr = `(${year}).`;
      }
    }

    // 2. 本文中引用（ナラティブ / カッコ）
    let authorDisplay = isMissingAuthor ? (title ? title.substring(0, 15) + '…' : 'タイトル') : (author || '著者');
    // 日本語著者の姓の抽出（簡易）
    if (authorDisplay.includes('・')) {
      // 連名
    }
    narrativePreview.textContent = `${authorDisplay}(${inTextYear || '年'})`;
    parentheticalPreview.textContent = `(${authorDisplay}, ${inTextYear || '年'})`;

    // 3. 引用文献リスト用HTML（斜体タグ em 含む）
    let htmlParts = [];
    let plainParts = [];

    // 著者
    if (!isMissingAuthor && author) {
      htmlParts.push(`${author} `);
      plainParts.push(`${author} `);
    }

    // 日付
    if (dateStr) {
      htmlParts.push(`${dateStr} `);
      plainParts.push(`${dateStr} `);
    }

    // タイトル＆出典（メディア別ルール）
    if (currentMedia === 'web') {
      // Web: 記事タイトルが斜体、サイト名は通常
      if (title) {
        htmlParts.push(`<em>${title}</em>. `);
        plainParts.push(`${title}. `);
      }
      if (s1 && !isSameSite) {
        htmlParts.push(`${s1}. `);
        plainParts.push(`${s1}. `);
      }
      // Retrieved 日付
      if (retrievedMonth.value && retrievedDay.value && retrievedYear.value) {
        const retStr = `Retrieved ${retrievedMonth.value}, ${retrievedDay.value}, ${retrievedYear.value}, from `;
        htmlParts.push(retStr);
        plainParts.push(retStr);
      }
      if (cleanUrl) {
        htmlParts.push(cleanUrl);
        plainParts.push(cleanUrl);
      }
    } 
    else if (currentMedia === 'book') {
      // 書籍: 書籍タイトルが斜体、出版社は通常
      if (title) {
        const edStr = s2 ? ` (${s2})` : '';
        htmlParts.push(`<em>${title}</em>${edStr}. `);
        plainParts.push(`${title}${edStr}. `);
      }
      if (s1) {
        htmlParts.push(`${s1}.`);
        plainParts.push(`${s1}.`);
      }
      if (cleanUrl) {
        htmlParts.push(` ${cleanUrl}`);
        plainParts.push(` ${cleanUrl}`);
      }
    } 
    else if (currentMedia === 'journal') {
      // 論文: 論文タイトルは立体、学術誌名と巻数は斜体（ガイドp.29準拠）
      if (title) {
        htmlParts.push(`${title}. `);
        plainParts.push(`${title}. `);
      }
      if (s1) {
        // 学術誌名（斜体）
        htmlParts.push(`<em>${s1}</em>`);
        plainParts.push(s1);
      }
      if (s2) {
        // s2 を "巻数, ページ" に分割
        const parts = s2.split(',');
        if (parts.length > 1) {
          const vol = parts[0].trim();
          const pages = parts.slice(1).join(',').trim();
          htmlParts.push(`, <em>${vol}</em>, ${pages}.`);
          plainParts.push(`, ${vol}, ${pages}.`);
        } else {
          htmlParts.push(`, <em>${s2}</em>.`);
          plainParts.push(`, ${s2}.`);
        }
      } else {
        htmlParts.push('.');
        plainParts.push('.');
      }
      if (cleanUrl) {
        htmlParts.push(` ${cleanUrl}`);
        plainParts.push(` ${cleanUrl}`);
      }
    } 
    else if (currentMedia === 'ai') {
      // AI引用（公式APA仕様）: Title [Large language model]. URL
      if (title) {
        const modelDesc = s1 ? ` [${s1}]` : ' [Large language model]';
        htmlParts.push(`<em>${title}</em>${modelDesc}. `);
        plainParts.push(`${title}${modelDesc}. `);
      }
      if (cleanUrl) {
        htmlParts.push(cleanUrl);
        plainParts.push(cleanUrl);
      }
    }

    const finalHtml = htmlParts.join('').trim() || '（入力するとここに正しいAPAフォーマットが生成されます）';
    const finalPlain = plainParts.join('').trim();

    citationPreview.innerHTML = finalHtml;
    citationPreview.dataset.plain = finalPlain;
  }

  // 入力イベント監視
  document.getElementById('citationForm').addEventListener('input', generateCitation);

  // ─── コピー機能（Word/Docs対応リッチコピー） ───
  function setCopySuccess(btn) {
    const originalText = btn.textContent;
    btn.textContent = '✓ コピー完了';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = originalText;
      btn.classList.remove('copied');
    }, 1500);
  }

  // リッチコピー（HTML形式でクリップボードへ：Wordに貼ると斜体がそのまま残る！）
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
      // フォールバック
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
