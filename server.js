const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// --- Directories ---
const PUBLIC_DIR = path.join(__dirname, 'public'); // For HTML, CSS, JS, GLB
const SNAP_DIR = path.join(__dirname, 'snapshots');

// Ensure snapshots folder exists
if (!fs.existsSync(SNAP_DIR)) {
  fs.mkdirSync(SNAP_DIR, { recursive: true });
  console.log(`📂 Created snapshots folder at ${SNAP_DIR}`);
}

// --- Middleware ---
app.use(cors()); // Allow cross-origin requests
app.use(express.json({ limit: '50mb' })); // Increase limit for large images
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files
app.use(express.static(PUBLIC_DIR));
app.use('/snapshots', express.static(SNAP_DIR));

// ✅ Serve .glb files with correct MIME type
app.get('/*.glb', (req, res) => {
  const filePath = path.join(PUBLIC_DIR, req.path);
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('GLB file not found');
  }
  res.setHeader('Content-Type', 'model/gltf-binary');
  res.sendFile(filePath);
});

// --- API Routes ---

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
    console.error('❌ Error uploading snapshot:', err);
    res.status(500).json({ error: 'Unexpected server error' });
  }
});

// Get all snapshots
app.get('/api/gallery', (req, res) => {
  try {
    const files = fs.readdirSync(SNAP_DIR)
      .filter(f => f.endsWith('.png'))
      .sort((a, b) => b.localeCompare(a))
      .map(f => `/snapshots/${f}`);
    res.json(files);
  } catch (err) {
    console.error('❌ Error reading gallery:', err);
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
    console.error('❌ Error clearing gallery:', err);
    res.status(500).json({ error: 'Failed to clear gallery' });
  }
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`🚀 Server running at: http://localhost:${PORT}`);
  console.log(`📂 Public files: ${PUBLIC_DIR}`);
  console.log(`📂 Snapshots folder: ${SNAP_DIR}`);
});
