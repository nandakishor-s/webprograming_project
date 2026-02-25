<div align="center">

<img src="https://img.shields.io/badge/MindPulse-Mental%20Health%20Dashboard-7c6ef5?style=for-the-badge&labelColor=1a1a2e" />

<br><br>

<img src="https://readme-typing-svg.demolab.com?font=Poppins&weight=600&size=28&duration=3000&pause=1000&color=747DFF&center=true&vCenter=true&width=500&lines=Track+your+mental+wellness;Breathe.+Reflect.+Grow.;Your+mind+matters." alt="Typing SVG" />

<br>

<p>
<img src="https://img.shields.io/badge/HTML5-e34f26?style=flat-square&logo=html5&logoColor=white" />
<img src="https://img.shields.io/badge/CSS3-1572b6?style=flat-square&logo=css3&logoColor=white" />
<img src="https://img.shields.io/badge/JavaScript-f7df1e?style=flat-square&logo=javascript&logoColor=000" />
<img src="https://img.shields.io/badge/Chart.js-ff6384?style=flat-square&logo=chartdotjs&logoColor=white" />
<img src="https://img.shields.io/badge/Web%20Audio%20API-8c94ff?style=flat-square" />
</p>

---

<table>
<tr>
<td>
A single-page mental health analytics dashboard built for people who want to <b>understand their emotional patterns</b>, build better daily habits, and access calming tools — all in one place. No backend, no tracking, everything stays in your browser.
</td>
</tr>
</table>

</div>

<br>

## What it does

This isn't just another mood tracker. It's a full self-care companion that combines **data visualization**, **cognitive behavioral tools**, and **ambient experiences** into a clean, responsive interface.

You log how you're feeling. The dashboard picks up your patterns. The charts tell a story — not a scary one, but an honest, encouraging one. Every metric is framed around **growth and progress**, not fear. Someone who's already going through a rough patch shouldn't open their report and feel worse. That's the core idea behind how we designed the analytics.

<br>

<div align="center">
<table>
<tr>
<td align="center" width="250"><b>Dashboard</b><br><sub>Mood trends, habit synergy radar, wellness score, mood calendar</sub></td>
<td align="center" width="250"><b>Analytics</b><br><sub>Pie charts, sleep trends, correlation scatter, weekly comparisons</sub></td>
<td align="center" width="250"><b>Tools</b><br><sub>Focus timer, soundscapes, guided breathing, journaling</sub></td>
</tr>
</table>
</div>

<br>

## Feature breakdown

<details>
<summary><b>Dashboard & Tracking</b></summary>
<br>

- Real-time mood slider (1–10) that updates the mood line chart and calendar color in sync
- Self-care habit grid — water, sleep, meds, outdoors, diet — each toggles a radar chart axis
- Streak counter that glows gold when all 5 habits are checked for the day
- Weekly wellness area chart tracking mood, energy, and calm levels across the week
- Overall mental health gauge (doughnut acting as a semicircle score meter)
- Color-coded mood calendar for the current month — soft blues for tough days, greens for good ones

</details>

<details>
<summary><b>Analytics — the calm deep dive</b></summary>
<br>

- Mood distribution pie — Thriving, Good, Neutral, Building, Growing (no "Very Low" or "Bad" labels)
- Relaxation balance doughnut — Relaxed, Mostly Calm, Finding Balance, Room to Grow
- 30-day sleep quality trend line
- 30-day calmness journey line (not "anxiety level" — intentionally reframed)
- Week-over-week comparison bars for mood, sleep, and calm averages
- Habit completion rates as horizontal bars
- Sleep vs. mood correlation scatter plot
- Monthly mood heatmap (stacked bars by week)

Summary stat cards at the top:
- Wellness Score (purple)
- Resilience Building Days (lavender — not "High Anxiety Days")
- Good Mood Days (green)
- Monthly Trend (blue)

All chart colors use a **calming palette** — soft blues `#7facd6`, teals `#8ec6c0`, sage greens `#b8d4a3`, and lavenders `#b8a9d4`. No reds, no oranges. The idea is that even the data should feel supportive.

</details>

<details>
<summary><b>Wellness Tools</b></summary>
<br>

- **Daily Check-in** — 4 dimensions: internal weather (mood), body tension, sleep quality, nourishment. Scored 1–4, automatically cascades to the dashboard mood slider and tracking chart.
- **Cognitive Reframing Journal** — write down a negative automatic thought, then challenge it and anchor a healthier reframe. Based on CBT techniques.
- **Pomodoro Focus Timer** — 25-minute countdown with start/pause/reset controls.
- **Ambient Soundscapes** — 4 options:
  - Rain (external audio, looped)
  - Forest Stream (external audio, looped)
  - Ocean Waves (external audio, looped)
  - Wind (generated in-browser using Web Audio API — brown noise + low-pass filter + LFO gusting)
- **4-7-8 Guided Breathing** — animated breathing circle. Tap to start. Inhale 4s, hold 7s, exhale 8s.
- **Daily Inspiration** — rotating motivational quotes from mental health advocates.

</details>

<details>
<summary><b>Auth & Personalization</b></summary>
<br>

- Login / Sign-up with localStorage (no backend, no server dependency)
- 5-step onboarding: name, age group, primary concern, current mood, main goal
- Dashboard greeting and sidebar label adapt to user profile (e.g., "Anxiety Focus", "Sleep Optimization")
- Dark mode toggle that updates all charts globally
- SOS floating button with emergency crisis helpline numbers (112, 14416)

</details>

<br>

## Design philosophy

| Principle | How it's applied |
|:--|:--|
| **No scary metrics** | "Anxiety Level" becomes "Calmness Level". "High Anxiety Days" becomes "Resilience Building Days". |
| **Warm color palette** | Soft blues, teals, sage greens, lavenders. No red anywhere in the analytics or reports. |
| **Progress framing** | Stats say "15% calmer this week" not "anxiety down 15%". Every number tells a growth story. |
| **Privacy first** | All data lives in `localStorage`. Nothing leaves the browser. No cookies, no analytics, no server calls. |
| **Zero dependencies** | One HTML file. No npm, no build tools, no frameworks. Open it and it works. |

<br>

## Tech stack

```
Frontend        HTML5, CSS3 (custom properties, grid, flexbox), Vanilla JS
Charts          Chart.js 4.4.2 (line, bar, radar, pie, doughnut, scatter)
Audio           Web Audio API (procedural wind generation), HTML5 Audio (rain, forest, ocean)
Icons           Font Awesome 6
Fonts           Google Fonts — Poppins (300–700)
Storage         localStorage (auth, user profiles, preferences)
```

<br>

## Getting started

Clone and open. No build step, no packages to install.

```bash
git clone https://github.com/your-username/mindpulse.git
cd mindpulse
```

Serve it any way you like:

```bash
# python
python3 -m http.server 8080

# node
npx serve .

# or just double-click index_v2.html
```

Then visit `http://localhost:8080/index_v2.html`

<br>

## Project structure

```
project/
├── index_v2.html       # the main application file
└── README.md
```

Everything — HTML, CSS, and JavaScript — lives inside `index_v2.html`. Single file, fully self-contained.

<br>

---

<div align="center">

<img src="https://img.shields.io/badge/built%20with-care-b8a9d4?style=for-the-badge&labelColor=1a1a2e" />

<br><br>

<sub>Made as part of a Web Programming course project at VIT.</sub>

</div>
