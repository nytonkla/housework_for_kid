# 🌟 Housework Hero (Kid Chores & Rewards iPad App)

**Housework Hero** is a kid-centric, gamified iPad PWA (Progressive Web App) application designed to help 9-year-olds independently complete household chores, submit photo check-ins, receive instant **AI Vision auto-approval**, and earn stars towards customizable rewards—all without parents constantly hovering!

---

## ⚡ 3 Ways for Dads to Get Started (From Easiest to Advanced)

### 🥇 Option 1: Direct 1-Tap iPad Setup (Zero Code / Zero Install!)
> **Best for 99% of Dads!** No computer, terminal, or Node.js required.

1. Open this live app link in **Safari on your iPad**:
   👉 **`https://nytonkla.github.io/housework_for_kid/`**
2. Tap Safari's **Share icon** (square with upward arrow).
3. Scroll down and tap **"Add to Home Screen"**.
4. Tap **Add**. 

*The **Housework Hero** app icon is now live on her iPad Home Screen! Your kid can tap it anytime to launch directly in full screen.*

---

### 🥈 Option 2: 1-Click Free Hosting on Vercel (Your Own Private Link)
> **Best if you want your own private web link with 1 click!**

Click the button below to deploy your own private copy for free on Vercel in 30 seconds:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fnytonkla%2Fhousework_for_kid)

1. Log in with your GitHub account.
2. Click **Deploy**.
3. Open your generated Vercel link on your iPad and tap **"Add to Home Screen"**!

---

### 🥉 Option 3: Local Developer Setup (For Tech-Savvy Dads)
> **For dads who want to run locally on home Wi-Fi or customize the code.**

```bash
# 1. Clone repository
git clone https://github.com/nytonkla/housework_for_kid.git
cd housework_for_kid

# 2. Install dependencies & start server
npm install
npm run dev
```

---

## 🔑 1-Minute Gemini AI Key Setup & Testing (For Dads)
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
- **100-Level Growth Curve**: Non-linear 100-level progression system (Tidy Sprout 🌱, Helper-in-Training 🧽, Chore Scout 🧭, Task Ranger 🏹, Home Guardian 🛡️, Chore Knight ⚔️, House Captain ⚓, Domestic Strategist 🧠, Household Sage 📜, Home Champion 🏆).
- **43 Age-Sequenced Chores**: Age-appropriate chores that unlock automatically as level increases.
- **1-Tap Photo Check-In**: iPad camera opens directly -> Snap photo proof.
- **Instant Gamification**: Confetti explosions, sound effects, level progress meter, and star payouts when AI confidence is ≥ 95%.
- **Reward Marketplace**: Claim customizable rewards without reducing Level!

### 👨 Parent Admin Mode (PIN-Protected)
- **4-Digit Security PIN**: Default PIN `1234` (customizable in settings).
- **Editable Kid Profile**: Update kid's name anytime.
- **Photo Submission Queue**: Inspect submitted photos in full-screen modal with AI confidence score and analysis reasons. 1-tap **Approve** or **Ask to Retry**.
- **Star Balance Adjuster & Data Resets**: Add/subtract stars with required notes, reset score to 0, or clear history log.
- **Level Curve Progression Tuning**: Adjust `Base` and `Power` with live preview & 1-click recalculation.
- **1-Click Share & Presets**: Export or import `.json` configuration presets to share chore lists with other dads!

---

## 📜 License
MIT License - Open source & free for all families!
