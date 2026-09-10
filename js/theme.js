// テーマの切り替えと永続化（LocalStorage）
document.addEventListener('DOMContentLoaded', () => {
  const themeBtn = document.getElementById('themeBtn');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const isLight = document.documentElement.classList.toggle('light');
      localStorage.setItem('tools_theme', isLight ? 'light' : 'dark');
    });
  }
});
