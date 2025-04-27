# Drift - AI Image Generation

Drift is a modern, beautiful, and fast AI image generation app built with Next.js, React, and Tailwind CSS. It provides a seamless experience for generating, managing, and organizing AI-generated images with advanced features and delightful UI/UX.

---

## ✨ Features

- **Multi-Model Support:**
  - Generate images using multiple AI models (e.g., Stable Diffusion, DALL·E, GPT Image, and more).
  - Model selection with smart size/quality adaptation.

- **Image Management:**
  - Gallery grid with smooth animations and responsive design.
  - Zoom/expand images in a dialog by clicking the image.
  - Download, copy, favorite, and delete images easily.
  - LocalStorage-based storage (last 20 images, with quota handling).

- **Favorites System:**
  - Heart icon in the header opens a dedicated Favorites page (`/favorites`).
  - Favorite/unfavorite images from anywhere (gallery or dialog).
  - Keyboard shortcut: **Shift + F** to open Favorites instantly.

- **API Key Management:**
  - Add, remove, and rotate multiple API keys.
  - Usage tracking and auto-rotation to avoid rate limits.

- **Settings & Customization:**
  - Pill-style selectors for image quality (dark/light mode friendly).
  - Quantity selector, advanced prompt options, and model-aware size selection.

- **Keyboard Shortcuts:**
  - Submit/generate: `Ctrl + Enter` (or `⌘ + Enter` on Mac)
  - Open shortcuts dialog: `Shift + ?`
  - Open Favorites: `Shift + F`
  - In image dialog: `F` (favorite), `D` (download), `C` (copy)
  - More: tab navigation, model picker, etc. (see in-app dialog)
  - Mac users see native symbols (⌘, ⌥, ⇧, etc.)

- **Modern UI/UX:**
  - Glassy, blurred action buttons with strong contrast on any background.
  - Fully responsive, accessible, and theme-aware (dark/light mode).
  - Toast notifications for actions (download, copy, errors, etc.)

---

## 🚀 Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   # or yarn, pnpm, bun
   ```
2. **Run the dev server:**
   ```bash
   npm run dev
   ```
3. **Open [http://localhost:3000](http://localhost:3000) in your browser.**

---

## 🛠️ Tech Stack
- Next.js (App Router)
- React
- Tailwind CSS
- Lucide Icons
- LocalStorage (with option for IndexedDB)

---

## 📄 License
MIT

---

## 🙏 Credits
- [Next.js](https://nextjs.org)
- [Lucide Icons](https://lucide.dev)
- [Sonner](https://sonner.emilkowal.ski/) for toasts

---

Enjoy generating and managing your AI images with Drift!
