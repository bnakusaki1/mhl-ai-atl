#**BioTune**- The next innovation in entertainment analysis
**==================================================================================================================================**

## Introduction: 
**---------------------------------------------------------------------------------------------------------------------------------**
### Our tool, BioTune, allows users to watch different forms of media and track their beats per minute live. This is possible with a heart rate tracker. Additionally, with the use of the Gemini API we are able to compute different emotions based on bpm variations and spikes. A built in dashboard will present the emotion data afterwards. How can you see what you watched before? A history feature that allows you to relive those emotions. In short, we've helped viewers (and studios) pinpoit what sparks the best reactions!

## Built With:
**---------------------------------------------------------------------------------------------------------------------------------**
<p>
  <a href="https://nextjs.org/">
    <img alt="Next.js" src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white">
  </a>
  <a href="https://react.dev/">
    <img alt="React" src="https://img.shields.io/badge/React-20232a?style=for-the-badge&logo=react&logoColor=61DAFB">
  </a>
  <a href="https://www.typescriptlang.org/">
    <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white">
  </a>
  <a href="https://tailwindcss.com/">
    <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind-0EA5E9?style=for-the-badge&logo=tailwindcss&logoColor=white">
  </a>
  <a href="https://www.chartjs.org/">
    <img alt="Chart.js" src="https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white">
  </a>
  <a href="https://sheetjs.com/">
    <img alt="SheetJS" src="https://img.shields.io/badge/SheetJS-0A6?style=for-the-badge&logo=readme&logoColor=white">
  </a>
  <a href="https://firebase.google.com/">
    <img alt="Firebase" src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black">
  </a>
  <a href="https://vercel.com/">
    <img alt="Vercel" src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white">
  </a>
  <a href="https://openai.com/">
    <img alt="OpenAI" src="https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white">
  </a>
  <a href="https://aistudio.google.com/">
    <img alt="Gemini" src="https://img.shields.io/badge/Gemini-1F6FEB?style=for-the-badge&logo=google&logoColor=white">
  </a>
</p>

## Features:
**---------------------------------------------------------------------------------------------------------------------------------**
### Login Page
![Login Page](screenshots/LoginPage.png)

### Home Page
![Home Page](screenshots/HomePage.png)

### Video Page
![Video Page](screenshots/VideoPage.png)

## How to Build This Yourself
**---------------------------------------------------------------------------------------------------------------------------------**

### Before you start:
- **Node.js** 18+ and npm installed
- **Firebase** account (free tier works!)
- **Google Gemini API** key ([Get it free](https://aistudio.google.com/app/apikey))
- **Heart rate sensor** (optional - can simulate data)
- Basic knowledge of React and Next.js

### Installation:
```bash
git clone https://github.com/bnakusaki1/mhl-ai-atl.git
cd mhl-ai-atl
npm install
```

## Configure

Create `.env.local`:
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
GEMINI_API_KEY=your_gemini_key
```

Get keys: [Firebase](https://console.firebase.google.com) | [Gemini](https://aistudio.google.com/app/apikey)

## Run
```bash
npm run dev
# Open http://localhost:3000
```

## How It Works
```
BPM → AI Analysis (every 10s) → Emotion → Firebase
```

## Stack

Next.js • Firebase • Gemini AI • Framer Motion

---

**Build time: 2 hours** | [Full Docs](#)

## Top Contributors

<a href="https://github.com/bnakusaki1/mhl-ai-atl/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=bnakusaki1/mhl-ai-atl" />
</a>

## Full Team - Benjamin Nakusaki, Jaeyoung Choi, Jalani Bandele, Jason Nguyen
