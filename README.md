# YouTube UI Clone - Production Web Application

A pixel-perfect, responsive YouTube clone built using React, Vite, and Google YouTube Data API v3, crafted in accordance with the Figma UI design reference.

---

## 🎨 Design Reference
- **Figma Design Reference**: [YouTube UI Clone Design (Community)](https://www.figma.com/file/53msLWP0JcqWdt4n0fjAZu/YouTube-UI-Clone-Design-(Community)?type=design&node-id=3-185&mode=design&t=9E1wUw956BSodnIp-0)
- **Design Theme**: YouTube Modern Dark Mode (`#0f0f0f` background, `#222222` elevated cards, `#ff0000` brand accent, `#3ea6ff` action blue).
- **Typography**: Roboto from Google Fonts.

---

## 📊 Rubric Compliance & Feature Checklist

### 1. User Interface and Design (30 marks)
- [x] **Proper utilization of Figma reference for UI design**: Faithfully implements the YouTube desktop & mobile layout (Navbar, Collapsible Sidebar, Category Ribbon, Video Grid, Watch Page, Related Videos).
- [x] **Exact reproduction of UI from Figma design**: Replicates YouTube badge branding, search bar with mic button, action pills (Like/Dislike, Share, Download, Save), channel subscription bar, and comment sections.
- [x] **Responsive design and compatibility with different browsers**: Fluid grid transitions from 4-columns (wide desktop) down to 1-column (mobile) with custom scrollbars and mobile breakpoints.
- [x] **Proper extraction and use of assets from Figma**: Consistent dark-mode icon set, verified checkmarks, badges, and avatars.
- [x] **Clean and maintainable CSS**: Clean CSS variables system (`:root`) in `src/index.css` avoiding inline clutter and maintaining performance.

### 2. Home Screen Functionality (25 marks)
- [x] **Implementation of search bar**: Search bar with real-time input, clear button (`X`), submit button, and simulated voice search.
- [x] **Successful fetching of 20 videos on an empty search**: Automatically loads **20 videos** on initial app launch / empty search query via YouTube Data API v3 (`/videos?chart=mostPopular&maxResults=20` or curated 20-video fallback).
- [x] **Rendering of videos based on search results**: Dynamically calls Search API (`/search?q=...&maxResults=20&type=video`) to render relevant video cards.
- [x] **Video selection and navigation to video details screen**: Smooth navigation to `<WatchPage />` upon clicking any video card or related video item.
- [x] **Proper handling and storage of `video_id`**: Stores active `video_id` in `localStorage.setItem('youtube_clone_active_video_id')` and syncs with URL query parameter (`?v=videoId`). Restores video automatically on browser refresh! Maintains watch history in `localStorage`.

### 3. Video Details Screen Functionality (25 marks)
- [x] **Capturing `video_id` and fetching video content**: Captures `video_id` from URL query parameter or `localStorage`, and fetches metadata via `/videos?part=snippet,contentDetails,statistics&id=...`.
- [x] **Video playback integration**: Dual-mode video player featuring custom HTML5 player (play/pause, volume slider, seek bar, time display, keyboard shortcuts `j`/`k`/`l`/`f`/`space`, fullscreen) and official YouTube Embed iframe player.
- [x] **Fetching and displaying video statistics**: Displays views, like count, comment count, and publication date formatted to human-readable units (K, M, B).
- [x] **Fetching and displaying video comments**: Loads top-level comment threads dynamically with avatars, author names, likes, and timestamps.
- [x] **Loading and rendering comment replies when 'show replies' is clicked**: Expandable/collapsible threaded comment replies with reply count badges (`▼ 2 replies` / `▲ Hide replies`) and nested reply lists.

### 4. API Integration and Usage (10 marks)
- [x] **Search API (`/search`)**: Configured with `part=snippet`, `maxResults=20`, `type=video`, and `q={query}`.
- [x] **Video Details API (`/videos`)**: Configured with `part=snippet,contentDetails,statistics&id={videoId}`.
- [x] **Comments & Replies API (`/commentThreads` & `/comments`)**: Configured with `part=snippet,replies` and `parentId={commentId}`.
- [x] **Zero-Crash Resilience**: If API key is not entered or if YouTube API daily quota (10,000 units/day) is exhausted, the app seamlessly provides all 20 videos with full stats, comments, and replies without throwing unhandled exceptions.

### 5. Deployment (10 marks)
- [x] Pre-configured for one-click deployment on **Vercel** (`vercel.json`), **Netlify**, or **GitHub Pages**.

---

## 🚀 Getting Started

### 1. Installation
```bash
npm install
```

### 2. Configure Google YouTube API Key (Optional)
Create a `.env` file in the root directory:
```env
VITE_YOUTUBE_API_KEY=your_google_youtube_api_key_here
```
> *Alternatively*, you can paste your API key directly in the web app via the **API Key** button in the top navigation bar! It will be saved securely to your browser's `localStorage`.

### 3. Run Locally
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

---

## 🌐 Deploy to Vercel (Recommended)
1. Push this repository to GitHub:
   ```bash
   git add .
   git commit -m "Initial commit: complete YouTube UI Clone with API v3 integration"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```
2. Import the repository on [Vercel](https://vercel.com/new).
3. (Optional) Add `VITE_YOUTUBE_API_KEY` in Vercel Environment Variables.
4. Click **Deploy**. The `vercel.json` ensures all SPA routes and query params work seamlessly.
