# 🌟 Housework Hero (Kid Chores & Rewards iPad App)

**Housework Hero** is a kid-centric, gamified iPad PWA (Progressive Web App) application designed to help 9-year-olds independently complete household chores, submit photo check-ins, receive instant **AI Vision auto-approval**, and earn stars towards customizable rewards—all without parents constantly hovering!

---

## 🚀 Quick Setup Guide for Dads (3-Minute Setup)

### Step 1: Run or Deploy the App
To run locally on your home Wi-Fi network:
```bash
# 1. Install dependencies
npm install

# 2. Start dev server (accessible on local network)
npm run dev
```
*(Or deploy to Vercel, Netlify, or GitHub Pages for free instant web access!)*

---

### Step 2: Install on iPad Home Screen (1-Tap App Access)
Give your kid a 1-tap app experience directly from her iPad screen with **zero browser address bars**:
1. Open the web app link in **Safari on iPad**.
2. Tap Safari's **Share icon** (square with upward arrow).
3. Scroll down and tap **"Add to Home Screen"**.
4. Tap **Add**. 

*The **Housework Hero** app icon will appear on her iPad Home Screen right alongside her game apps!*

---

### Step 3: (Optional) Connect Free Google Gemini AI Key
By default, **Housework Hero** works **100% offline out-of-the-box** using smart local AI verification. 

If you want online multimodal AI vision verification using Google's `gemini-3.6-flash`:
1. Enter **Dad Mode** (Tap 🔒 icon on top right, enter default PIN: `1234`).
2. Go to **App & AI Settings**.
3. Tap **"💡 How to Get a Free Key (1-Min Guide)"** (or visit [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)).
4. Copy your API Key, paste it into settings, and tap **"TEST & CONNECT"**.
5. Status turns 🟢 **CONNECTED (Gemini 3.6 Flash Online)**!

---

## ✨ Features Overview

### 👧 Kid Mode (Normal View - 95% of Usage)
- **Visual Chore Dashboard**: Touch-friendly cards (Dishwasher, Bed Making, Folding Laundry, Plant Watering, Pet Feeding, Reading).
- **1-Tap Photo Check-In**: iPad camera opens directly -> Snap photo proof.
- **Instant Gamification**: Confetti explosions, sound effects, level progress meter, and star payouts when AI confidence is ≥ 95%.
- **Reward Marketplace**: Claim customizable rewards (Gaming time, Ice Cream, Lego sets, Bedtime extensions).
- **Work-Done History Stream**: Shows all past check-ins, status updates, and Dad's notes.

### 👨 Parent Admin Mode (PIN-Protected)
- **4-Digit Security PIN**: Default PIN `1234` (customizable in settings).
- **Photo Submission Queue**: Click any photo thumbnail to inspect in full-screen modal with AI confidence score and analysis reasons. 1-tap **Approve** or **Ask to Retry**.
- **Chore & Reward Management (CRUD)**: Easily add/edit chores, star rewards, and expected AI visual targets.
- **Star Balance Adjuster**: Manually add or subtract stars with a mandatory **Reason note** that logs directly into your kid's work-done history log.
- **1-Click Share & Presets**: Export or import `.json` configuration presets to share chore lists with other dads!

---

## 🛠️ Tech Stack & Security
- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 + Lucide Icons
- **AI Verification**: Google GenAI SDK (`gemini-3.6-flash`) + Smart Local Offline Fallback
- **Animations & Sound**: Canvas Confetti + Web Audio API Synthesizer (Zero MP3 asset dependency!)
- **PWA Capabilities**: Fullscreen Apple mobile web app manifest & standalone support.
- **Security**: Zero hardcoded credentials or API keys. 100% local browser storage persistence.

---

## 📜 License
MIT License - Open source & free for all families!
