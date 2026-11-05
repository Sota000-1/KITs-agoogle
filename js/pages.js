(() => {
  const form = document.getElementById('contactDraft');
  if (!form) return;
  const status = document.getElementById('copyStatus');
  const message = document.getElementById('message');

  // No network request: prepare a draft for the separately hosted official form.
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const body = message.value.trim();
    if (!body) {
      status.textContent = 'お問い合わせ内容を入力してください。';
      message.focus();
      return;
    }

    try {
      await navigator.clipboard.writeText(`【${document.getElementById('topic').value}】\n\n${body}`);
      status.textContent = '内容をコピーしました。公式フォームを開いて貼り付けてください。';
    } catch {
      message.focus();
      message.select();
      status.textContent = '自動コピーできませんでした。選択した内容を手動でコピーしてください。';
    }
  });
  form.addEventListener('input', () => { status.textContent = ''; });
  form.querySelector('button').disabled = false;
})();
