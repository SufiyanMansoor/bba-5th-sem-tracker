# BBA All Semesters — KU Tracker

**Karachi University BS(BBA) — 8 semesters · 48 courses · exam prep & progress tracking**

[![Live Demo](https://img.shields.io/badge/Live%20Site-GitHub%20Pages-3b82f6?style=for-the-badge)](https://sufiyanmansoor.github.io/bba-all-semesters/)

## Live link

**https://sufiyanmansoor.github.io/bba-all-semesters/**

Mobile par bhi chalta hai — browser se open karein ya **Add to Home Screen** (PWA).

---

## Kya hai yeh?

BBA students ke liye **free, open-source** study tracker. Official KU BS(BBA) syllabus ke mutabiq poora **4-year program** ek jagah: topics tick karo, YouTube/PDF se parho, mock papers banao, exam practice karo — **confusion kam, paper clear zyada easy**.

Syllabus source: Karachi University Business School — BS(BBA) program (144 credit hours).

---

## Features

### Program & navigation

| Feature | Description |
|--------|-------------|
| **8 semesters** | Year 1 se Year 4 tak — har semester 6 courses |
| **48 courses** | Poori degree ek app mein |
| **262+ topics** | Checklist style — done/remaining clear |
| **Semester picker** | Sidebar se apna current semester choose karo |
| **Semester overview** | Subjects cards + har subject ka % progress |
| **Degree progress ring** | Poori BS(BBA) kitni complete — sidebar mein |
| **Paper clear roadmap** | 5-step guide har semester ke liye |
| **Back to overview** | Subject se wapas semester dashboard |
| **Sem 8 electives** | Marketing / Finance / HRM options list |

### Study per topic

- **YouTube** search links — har topic ke liye
- **PDF / notes** links — free books + topic notes
- **Topic checkbox** — progress save (browser mein)
- **Exam important** tags — ★ wale topics highlight
- **Past paper log** — kitni dafa paper mein aaya (📋 button)
- **Free textbooks** — OpenStax & open textbooks (Sem 5 core subjects)

### Exam preparation

- **Mock paper generator** — MCQ, short, long, numerical, writing sections
- **Print / copy mock paper** — Claude.ai ke liye ready format
- **AI paper prompts** — Claude par paste karke full paper + answers
- **Formula sheets** — FA, Math, Economics (quick revision)
- **Flashcards** — important topics ke hints
- **Guess paper 2026** — high-probability topics (Smart Hub)
- **Revision mode** — sirf pending + important topics

### Timers & practice

- **Exam timer** — default 90 min (mock exam feel)
- **Custom timer** — 60 / 90 / 120 / 180 min ya apni duration
- **Timer-only mode** — bina mock paper ke sirf timer
- **Section timer** — har section ka alag time track
- **Pomodoro** — 25 min study + 5 min break

### Smart Hub (⚡)

- **Weekly study plan** — auto-generated weak areas ke sath
- **Marks log** — apne test marks record karo
- **Export / import backup** — JSON — phone change par data safe
- **WhatsApp share** — progress friends ko bhejo
- **Compare link** — do students ka progress compare
- **Study streak** — 🔥 daily study days
- **Topic notes** — har topic par personal notes
- **Bookmarks / pin** — important topics mark karo
- **Mini quiz** — topic par quick MCQs
- **Text-to-speech** — topic title sun kar revise
- **Mock answer outline** — paper ke baad structure dekho
- **Exam date countdown** — date set karo, days left dikhein
- **Notifications** — exam reminders (browser permission)

### UI & comfort

- **Dark mode** 🌙
- **Urdu labels** (partial toggle)
- **Mobile responsive** — sidebar menu phone par
- **PWA** — offline basics + install on home screen
- **No login** — sab data aapke browser (LocalStorage) mein

### Semester 5 (detailed syllabus)

Sem 5 ke 6 subjects mein **full unit-wise topics** (52+ detailed items):

- Financial Accounting (FA)
- Business Mathematics (MATH)
- Micro Economics (ECON)
- Principles of Management (MGT)
- Principles of Marketing (MKT)
- Business Communication (COMM)

Baaki semesters: har course par **5 smart study steps** (syllabus, midterm, final, past papers, definitions) + study links.

---

## Kaise use karein

1. **Live site** kholo (link upar).
2. Sidebar → **semester grid (Y1 S1 … Y4 S2)** → apna semester tap karo.
3. **Semester overview** → subject card click karo.
4. Har topic: **YouTube + PDF** → parho → **checkbox** tick karo.
5. **Past** button se past paper practice log karo.
6. Tools: **Mock paper**, **Flashcards**, **Exam timer**, **Smart Hub**.
7. Exam se pehle: **Formula sheet**, **Revision mode**, **Guess paper**.

---

## Tech stack

- HTML, CSS, JavaScript (vanilla — no framework)
- `syllabus-data.js` — program data
- `smart.js` — Smart Hub & extra features
- **LocalStorage** — progress, notes, marks, settings
- **GitHub Pages** — hosting

---

## Local run

```bash
# Folder clone karo ya download karo, phir:
# Option 1: index.html browser mein double-click
# Option 2: simple server (recommended)
npx serve .
```

---

## Project files

| File | Purpose |
|------|---------|
| `index.html` | Main app UI & logic |
| `syllabus-data.js` | Full 8-semester KU program data |
| `smart.js` | Smart Hub, streak, quiz, backup, etc. |
| `manifest.webmanifest` | PWA manifest |
| `sw.js` | Service worker (offline cache) |
| `build-syllabus.py` | Regenerate `syllabus-data.js` |
| `patch-program.py` | Patch `index.html` for program mode |
| `deploy.ps1` | Git push helper (Windows) |

---

## Deploy (GitHub Pages)

Repo **Settings → Pages → Source: `main` branch / root**.

Push ke baad 1–2 minute wait — phir live link update ho jata hai.

---

## Disclaimer

Yeh **unofficial** student tool hai — Karachi University / KUBS se affiliated nahi. Syllabus official PDF se align kiya gaya hai; courses/topics university update kare to `build-syllabus.py` se data refresh ho sakta hai.

---

## License

Open source — study & share freely. Credit appreciated.

---

**Made for KU BBA students — papers clear karo, degree strong rakho.**
