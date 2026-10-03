# 🎨 Picto Buzz — Vibrant Multiplayer Pictionary Web Game

A complete, full-stack real-time drawing and guessing party web application inspired by the classic Pictionary. Built with **Next.js, React, TypeScript, Tailwind CSS, Socket.IO, and a custom server-authoritative game engine**.

---

## 🌟 Key Features

* **Authentic Sketchbook & Painty Design System**: Hand-drawn doodle borders, pencil graphics, brush cards, paint-splatter borders, and custom sound effects (0% purple strictly enforced).
* **Multiplayer Real-Time Games**: Host private rooms with shareable links, customize rounds and difficulty, or match with public online doodlers.
* **Private Three-Word Selection**: The server dispatches exactly 3 secret word choices exclusively to the drawer's private socket with zero guesser leakage.
* **Interactive Whiteboard**: Pencil, paint brush, eraser, stroke width control, 12 vibrant colors, touch/stylus/mouse support, and real-time stroke synchronization.
* **Dynamic Golden Crown 👑**: Floats above the avatar of the current highest-scoring leader in real-time.
* **AI Solo Mode (AI Always Draws, User Always Guesses)**: AI progressively sketches drawings stroke-by-stroke with time-based guessing and streak counters.
* **Persistent User Accounts**: Persistent user profiles, customizable avatars, match history, and lifetime statistics.

---

## 🛠️ Tech Stack

* **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti
* **Real-time Backend**: Node.js, Express, Socket.IO
* **Audio**: Web Audio API Sound Synthesizer
* **Persistence**: File-backed JSON Database (`data/picto_buzz_db.json`)
* **Security**: JWT Authentication, bcryptjs password hashing

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production
```bash
npm run build
npm start
```

---

## 🎮 Authentication
* Users can sign up with their unique username and email, or click "Play Instantly as Guest".

---

## 📜 License
MIT License
