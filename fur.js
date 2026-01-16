// ====== PWA Install Prompt ======
let deferredPrompt;
const installBtn = document.getElementById('installBtn');
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = 'inline-block';
});
installBtn?.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  installBtn.style.display = 'none';
});

// ====== Theme Toggle ======
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light');
  themeToggle.textContent = document.body.classList.contains('light') ? '🌞' : '🌙';
});

// ====== Viewer & Toast ======
const viewer = document.getElementById('viewer');
const toast = (msg) => {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  setTimeout(() => t.classList.add('hidden'), 1400);
};

// ====== Model Switching (works for all buttons) ======
document.querySelectorAll('.model').forEach(b => {
  b.addEventListener('click', () => {
    let src = b.getAttribute('data-model'); // already includes "models/filename.glb"
    viewer.setAttribute('src', src);
    localStorage.setItem('selectedModel', src);
    toast(`Loaded: ${src.split('/').pop()}`);
  });
});

// Restore last loaded model
const saved = localStorage.getItem('selectedModel');
if (saved) {
  viewer.setAttribute('src', saved);
}

// ====== GLB Load Error Listener ======
viewer.addEventListener('error', (e) => {
  console.error('Model failed to load:', e);
  alert(`Could not load model. Check if the file exists at: ${viewer.getAttribute('src')}`);
});

// ====== Rotation Toggle ======
document.getElementById('rotateBtn').addEventListener('click', () => {
  if (viewer.hasAttribute('auto-rotate')) {
    viewer.removeAttribute('auto-rotate');
    toast('Rotation off');
  } else {
    viewer.setAttribute('auto-rotate', '');
    toast('Rotation on');
  }
});

// ====== Scale ======
let s = 1;
document.getElementById('biggerBtn').addEventListener('click', () => {
  s = Math.min(1.8, s + 0.1);
  viewer.style.transform = `scale(${s})`;
});
document.getElementById('smallerBtn').addEventListener('click', () => {
  s = Math.max(0.6, s - 0.1);
  viewer.style.transform = `scale(${s})`;
});

// ====== Snapshot ======
document.getElementById('snapshotBtn').addEventListener('click', async () => {
  try {
    const canvas = viewer.shadowRoot?.querySelector('canvas');
    if (!canvas) {
      alert('Snapshot works only in 3D mode. Exit AR and try again.');
      return;
    }

    const dataUrl = canvas.toDataURL('image/png');
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: dataUrl })
    });

    const out = await res.json();
    if (out.ok) {
      toast('Snapshot saved!');
      loadGallery();
    } else {
      throw new Error(out.error || 'Upload failed');
    }
  } catch (e) {
    console.error(e);
    alert('Failed to save snapshot.');
  }
});

// ====== Gallery ======
const modal = document.getElementById('modal');
const grid = document.getElementById('grid');
const galleryBtn = document.getElementById('galleryBtn');
const closeModal = document.getElementById('closeModal');
const clearGallery = document.getElementById('clearGallery');

async function loadGallery() {
  grid.innerHTML = '<div style="opacity:.7">Loading…</div>';
  try {
    const res = await fetch('/api/gallery');
    const imgs = await res.json();
    if (!imgs.length) {
      grid.innerHTML = '<div style="opacity:.7">No snapshots yet.</div>';
      return;
    }
    grid.innerHTML = '';
    imgs.forEach(src => {
      const a = document.createElement('a');
      a.href = src;
      a.download = src.split('/').pop();
      a.title = 'Tap to download';
      const img = document.createElement('img');
      img.src = src;
      img.loading = 'lazy';
      a.appendChild(img);
      grid.appendChild(a);
    });
  } catch {
    grid.innerHTML = '<div style="opacity:.7">Error loading gallery.</div>';
  }
}

galleryBtn.addEventListener('click', () => {
  modal.classList.remove('hidden');
  loadGallery();
});

closeModal.addEventListener('click', () => modal.classList.add('hidden'));

clearGallery.addEventListener('click', async () => {
  if (!confirm('Clear all snapshots?')) return;
  await fetch('/api/gallery', { method: 'DELETE' });
  grid.innerHTML = '<div style="opacity:.7">Cleared.</div>';
});

// ====== Service Worker ======
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(console.warn);
}
