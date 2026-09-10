// ─── 1. サブナビ下のリアルタイム時計 ───
const miniClock = document.getElementById('miniClock');
if (miniClock) {
  function updateMiniClock() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    miniClock.textContent = `${h}:${m}:${s} JST`;
  }
  updateMiniClock();
  setInterval(updateMiniClock, 1000);
}

// ─── 2. タブ切り替え & アイコン復元 ───
const subLinks = document.querySelectorAll('.sub-link');
const customToolbar = document.getElementById('customToolbar');
const resetOrderBtn = document.getElementById('resetOrderBtn');
const categorySections = document.querySelectorAll('.category-section');
const flatViewContainer = document.getElementById('flatViewContainer');
const flatGrid = document.getElementById('flatGrid');

const toolItems = Array.from(document.querySelectorAll('.tool-item'));
const itemMap = {};
toolItems.forEach(item => itemMap[item.dataset.id] = item);

function getSavedCustomOrder() {
  const saved = localStorage.getItem('tools_custom_order');
  if (saved) {
    try { return JSON.parse(saved); } catch(e){}
  }
  return toolItems.map(item => item.dataset.id);
}

function restoreItemsToCategories() {
  toolItems.forEach(item => {
    const originCat = item.dataset.origin;
    const targetGrid = document.getElementById(`grid-${originCat}`);
    if (targetGrid) targetGrid.appendChild(item);
  });
}

function renderTab(tab) {
  subLinks.forEach(l => l.classList.toggle('active', l.dataset.tab === tab));

  if (tab === 'category') {
    if (customToolbar) customToolbar.classList.remove('show');
    if (flatViewContainer) flatViewContainer.style.display = 'none';
    restoreItemsToCategories();
    categorySections.forEach(sec => sec.style.display = 'block');
    disableDragAndDrop();
  } 
  else if (tab === 'all') {
    if (customToolbar) customToolbar.classList.remove('show');
    categorySections.forEach(sec => sec.style.display = 'none');
    if (flatViewContainer) flatViewContainer.style.display = 'block';
    if (flatGrid) {
      flatGrid.innerHTML = '';
      toolItems.forEach(item => flatGrid.appendChild(item));
    }
    disableDragAndDrop();
  } 
  else if (tab === 'custom') {
    if (customToolbar) customToolbar.classList.add('show');
    categorySections.forEach(sec => sec.style.display = 'none');
    if (flatViewContainer) flatViewContainer.style.display = 'block';
    if (flatGrid) {
      flatGrid.innerHTML = '';
      const order = getSavedCustomOrder();
      order.forEach(id => {
        if (itemMap[id]) flatGrid.appendChild(itemMap[id]);
      });
      toolItems.forEach(item => {
        if (!flatGrid.contains(item)) flatGrid.appendChild(item);
      });
    }
    enableDragAndDrop();
  }
}

subLinks.forEach(btn => {
  btn.addEventListener('click', () => renderTab(btn.dataset.tab));
});

// ─── 3. ドラッグ＆ドロップ ───
let draggedItem = null;

function handleDragStart(e) {
  draggedItem = this;
  this.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd() {
  this.classList.remove('dragging');
  toolItems.forEach(item => item.classList.remove('drag-over'));
  draggedItem = null;
  saveCustomOrder();
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  if (this !== draggedItem) this.classList.add('drag-over');
}

function handleDragLeave() {
  this.classList.remove('drag-over');
}

function handleDrop(e) {
  e.preventDefault();
  this.classList.remove('drag-over');
  if (this !== draggedItem && flatGrid) {
    const currentChildren = Array.from(flatGrid.children);
    const targetIndex = currentChildren.indexOf(this);
    const draggedIndex = currentChildren.indexOf(draggedItem);

    if (draggedIndex < targetIndex) {
      this.after(draggedItem);
    } else {
      this.before(draggedItem);
    }
    saveCustomOrder();
  }
}

function enableDragAndDrop() {
  toolItems.forEach(item => {
    item.setAttribute('draggable', 'true');
    item.addEventListener('dragstart', handleDragStart);
    item.addEventListener('dragend', handleDragEnd);
    item.addEventListener('dragover', handleDragOver);
    item.addEventListener('dragleave', handleDragLeave);
    item.addEventListener('drop', handleDrop);
  });
}

function disableDragAndDrop() {
  toolItems.forEach(item => {
    item.removeAttribute('draggable');
    item.removeEventListener('dragstart', handleDragStart);
    item.removeEventListener('dragend', handleDragEnd);
    item.removeEventListener('dragover', handleDragOver);
    item.removeEventListener('dragleave', handleDragLeave);
    item.removeEventListener('drop', handleDrop);
  });
}

function saveCustomOrder() {
  if (flatGrid) {
    const currentOrder = Array.from(flatGrid.children).map(el => el.dataset.id);
    localStorage.setItem('tools_custom_order', JSON.stringify(currentOrder));
  }
}

if (resetOrderBtn) {
  resetOrderBtn.addEventListener('click', () => {
    localStorage.removeItem('tools_custom_order');
    if (flatGrid) {
      flatGrid.innerHTML = '';
      toolItems.forEach(item => flatGrid.appendChild(item));
    }
    saveCustomOrder();
  });
}
