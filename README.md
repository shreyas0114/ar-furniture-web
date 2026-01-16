🪑 AR Furniture Web Application

An Augmented Reality (AR) furniture visualization web app that allows users to view 3D furniture models in real space using WebAR, interact with them (rotate, scale), take snapshots, and install the app as a Progressive Web App (PWA).

Built using Node.js, Express, and Google model-viewer, and deployed live on Render (Free Tier).

🌐 Live Demo

👉 https://ar-furniture-web.onrender.com/

⚠️ Hosted on Render free tier.
The first load may take 30–50 seconds due to cold start.

🚀 Features

📱 Web-based AR furniture visualization (no app required)

🛋 View multiple 3D furniture models (.glb)

🔄 Rotate furniture models

➕➖ Scale models (zoom in / out)

📸 Take snapshots of AR/3D view

🖼 Gallery to view & download snapshots

🗑 Clear snapshot gallery

🌙 Light / Dark mode toggle

📲 PWA install support

⚡ Service Worker caching for faster reloads

🛠 Tech Stack

Node.js

Express.js

HTML, CSS, JavaScript

Google <model-viewer>

WebAR (Scene Viewer / WebXR / Quick Look)

Progressive Web App (PWA)

Render (Free Deployment)

📂 Project Structure
ar-furniture-web/
│
├── index.html
├── fur.css
├── fur.js
├── sw.js
├── server.js
├── package.json
├── models/
│   ├── couch_large.glb
│   ├── couch_medium.glb
│   └── wooden_bed.glb
├── snapshots/        # Auto-created on server
└── README.md

▶️ Run Locally
git clone https://github.com/shreyas0114/ar-furniture-web.git
cd ar-furniture-web
npm install
npm start


Open in browser:

http://localhost:5000

🎯 Use Cases

AR-based furniture & interior design previews

E-commerce product visualization

WebAR experimentation

Hackathons / Datathons

Portfolio & demo projects

🚀 Deployment

This project is deployed on Render (Free Tier) using:

npm install as build command

npm start as start command

Render automatically redeploys on every GitHub push.

👨‍💻 Author

Shreyash Bagrao
GitHub: https://github.com/shreyas0114
