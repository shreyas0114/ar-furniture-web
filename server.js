const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// --- Directories ---
// Serve files from ROOT directory
const PUBLIC_DIR = __dirname;
const SNAP_DIR = path.join(__dirname, 'snapshots');

// Ensure snapshots folder exists
if (!fs.existsSync(SNAP_DIR)) {
  fs.mkdirSync(SNAP_DIR, { recursive: true });
  console.log(`📂 Created snapshots folder at ${SNAP_DIR}`);
}

// --- Middleware ---
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// --- Serve static files (HTML, CSS, JS, models) ---
app.use(express.static(PUBLIC_DIR));
app.use('/snapshots', express.static(SNAP_DIR));

// --- Root route (extra safety, optional but recommended) ---
app.get('/', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// --- Serve .glb files with correct MIME type ---
app.get('/*.glb', (req, res) => {
  const filePath = path.join(PUBLIC_DIR, req.path);
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('GLB file not found');
  }
  res.setHeader('Content-Type', 'model/gltf-binary');
  res.sendFile(filePath);
});

// ================= API ROUTES =================

// Upload snapshot
app.post('/api/upload', (req, res) => {
  try {
    const { image } = req.body;
    if (!image || !image.startsWith('data:image/png;base64,')) {
      return res.status(400).json({ error: 'Invalid image data' });
    }

    const base64Data = image.replace(/^data:image\/png;base64,/, '');
    const filename = `snap_${Date.now()}.png`;
    const filePath = path.join(SNAP_DIR, filename);

    fs.writeFile(filePath, base64Data, 'base64', (err) => {
      if (err) {
        console.error('❌ Error saving snapshot:', err);
        return res.status(500).json({ error: 'Failed to save image' });
      }
      console.log(`✅ Snapshot saved: ${filename}`);
      res.json({ ok: true, file: `/snapshots/${filename}` });
    });
  } catch (err) {
    console.error('❌ Upload error:', err);
    res.status(500).json({ error: 'Unexpected server error' });
  }
});

// Get gallery
app.get('/api/gallery', (req, res) => {
  try {
    const files = fs.readdirSync(SNAP_DIR)
      .filter(f => f.endsWith('.png'))
      .sort((a, b) => b.localeCompare(a))
      .map(f => `/snapshots/${f}`);
    res.json(files);
  } catch (err) {
    console.error('❌ Gallery read error:', err);
    res.status(500).json({ error: 'Failed to load gallery' });
  }
});

// Clear gallery
app.delete('/api/gallery', (req, res) => {
  try {
    fs.readdirSync(SNAP_DIR)
      .filter(f => f.endsWith('.png'))
      .forEach(f => fs.unlinkSync(path.join(SNAP_DIR, f)));
    res.json({ ok: true });
  } catch (err) {
    console.error('❌ Clear gallery error:', err);
    res.status(500).json({ error: 'Failed to clear gallery' });
  }
});

// --- Start server ---
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📂 Serving files from ${PUBLIC_DIR}`);
  console.log(`📂 Snapshots folder: ${SNAP_DIR}`);
});

