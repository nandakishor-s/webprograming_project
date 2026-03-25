<div align="center">

<img src="https://img.shields.io/badge/MindPulse-Mental%20Health%20Dashboard-7c6ef5?style=for-the-badge&labelColor=1a1a2e" />

<br><br>

<img src="https://readme-typing-svg.demolab.com?font=Poppins&weight=600&size=28&duration=3000&pause=1000&color=747DFF&center=true&vCenter=true&width=500&lines=Track+your+mental+wellness;Breathe.+Reflect.+Grow.;Your+mind+matters." alt="Typing SVG" />

<br>

<p>
<img src="https://img.shields.io/badge/HTML5-e34f26?style=flat-square&logo=html5&logoColor=white" />
<img src="https://img.shields.io/badge/CSS3-1572b6?style=flat-square&logo=css3&logoColor=white" />
<img src="https://img.shields.io/badge/JavaScript-f7df1e?style=flat-square&logo=javascript&logoColor=000" />
<img src="https://img.shields.io/badge/Firebase-ffca28?style=flat-square&logo=firebase&logoColor=000" />
<img src="https://img.shields.io/badge/Chart.js-ff6384?style=flat-square&logo=chartdotjs&logoColor=white" />
<img src="https://img.shields.io/badge/Web%20Audio%20API-8c94ff?style=flat-square" />
</p>

---

<table>
<tr>
<td>
A single-page mental health analytics dashboard built for people who want to <b>understand their emotional patterns</b>, build better daily habits, play brain-training games, and access calming tools — all in one place. Backed by <b>Firebase Authentication & Firestore</b>, every piece of data persists per-user across devices and sessions.
</td>
</tr>
</table>

</div>

<br>

## What it does

This isn't just another mood tracker. It's a full self-care companion that combines **data visualization**, **cognitive behavioral tools**, **brain-training games**, **ambient experiences**, and a **curated video feed** into a clean, responsive interface.

You log how you're feeling. The dashboard picks up your patterns. The charts tell a story — not a scary one, but an honest, encouraging one. Every metric is framed around **growth and progress**, not fear. Someone who's already going through a rough patch shouldn't open their report and feel worse. That's the core idea behind how we designed the analytics.

All user data — check-ins, journal entries, habit completions, mood calendar scores, game high scores, and profile settings — is stored in **Cloud Firestore** under per-user document trees (`users/{uid}/...`), so nothing is lost between sessions and data syncs across tabs with offline persistence enabled.

<br>

<div align="center">
<table>
<tr>
<td align="center" width="200"><b>Dashboard</b><br><sub>Mood trends, habit synergy radar, wellness score, mood calendar, weekly overview</sub></td>
<td align="center" width="200"><b>Analytics</b><br><sub>Pie charts, sleep trends, correlation scatter, weekly comparisons, heatmap</sub></td>
<td align="center" width="200"><b>Tools</b><br><sub>Focus timer, soundscapes, guided breathing, CBT journal, daily check-in</sub></td>
<td align="center" width="200"><b>Mind Games</b><br><sub>Focus Shot, Color Match, Memory Flip, Pattern Recall, Zen Puzzle</sub></td>
<td align="center" width="200"><b>Video Feed</b><br><sub>Relaxation visuals, wholesome clips, lazy-loaded YouTube embeds</sub></td>
</tr>
</table>
</div>

<br>

## Feature breakdown

<details>
<summary><b>Authentication & Onboarding</b></summary>
<br>

- **Firebase Authentication** — full email/password sign-up and login flow with real-time form validation, including password confirmation matching, minimum length enforcement, and descriptive error messages for every Firebase auth error code (`auth/email-already-in-use`, `auth/wrong-password`, `auth/too-many-requests`, etc.)
- **Google Sign-In** — one-click OAuth via `signInWithPopup()` using Firebase's Google provider; gracefully handles popup-closed-by-user cancellations without showing errors
- **Password visibility toggle** — eye icon on every password field that toggles between `type="password"` and `type="text"` for both login and sign-up forms
- **Loading overlay** — animated spinner with contextual messages ("Creating your account…", "Signing in…", "Loading your dashboard…") shown during every async operation so the user always knows what's happening
- **`onAuthStateChanged` listener** — replaces any localStorage session check; on page load Firebase automatically re-authenticates returning users and routes them straight to the dashboard, or to onboarding for first-time Google sign-in users
- **5-step onboarding questionnaire** — presented to every new user immediately after account creation:
  1. **Name** — free-text input; pre-filled with the Google display name if signing in via Google
  2. **Age group** — selectable options: Under 18, 18–24, 25–34, 35–44, 45+
  3. **Primary concern** — Anxiety / Stress, Low Mood / Depression, Sleep Issues, Focus / Productivity, or General Wellness
  4. **Current mood** — four emoji-labeled states from "😔 Struggling" to "😊 Feeling great"
  5. **Main goal** — Track my mental health, Improve daily habits, Understand my patterns, or Find coping tools
- **Profile persistence** — onboarding answers are saved to Firestore (`users/{uid}` with `profile` field and `onboarded: true` flag); the Firebase Auth `displayName` is also updated so it persists across providers
- **Personalized sidebar** — the sidebar greeting, avatar initial, username, and focus label (e.g., "Anxiety Focus", "Sleep Optimization", "Focus Mode") all adapt based on the stored onboarding profile
- **Secure logout** — calls `auth.signOut()`, shows a loading spinner, then reloads the page to fully reset app state

</details>

<details>
<summary><b>Dashboard & Tracking</b></summary>
<br>

- **Quick stats row** — four stat cards at the top of the dashboard, each calculated from Firestore check-in data:
  - **Avg Mood (7 days)** — average of the last 7 daily mood check-ins, scaled from the internal 1–4 range to a user-friendly 1–10 display
  - **Avg Sleep Score** — average sleep quality from the last 7 check-ins (1–4 scale)
  - **Calmness Level** — average body-tension/anxiety score from the last 7 check-ins (higher = calmer)
  - **Total Check-ins** — lifetime count stored in the user's Firestore root document, incremented on every new check-in submission
- **Mood slider (1–10)** — a range input that updates three things in real time:
  - The mood line chart's "today" data point
  - The calendar's "today" cell color tier (Growing → Okay → Great)
  - A Firestore mood score entry for the current date (scaled back to 1–4 before saving)
- **Mood trend line chart** — a Chart.js line graph showing 7 days of mood scores; pulls real data from Firestore check-ins when available, falls back to sample data for new users; smooth tension curves, filled area, and white point borders
- **Self-care habit grid** — five toggleable habit icons (Water 💧, Sleep 🛏️, Meds 💊, Outside ☀️, Diet 🍎); each toggle immediately:
  - Saves the full 5-boolean array to Firestore (`users/{uid}/habits/{date}`)
  - Updates the corresponding axis on the radar chart to 100% (active) or 20% (inactive)
- **Habit synergy radar chart** — a Chart.js radar with five axes (Water, Sleep, Meds, Outdoors, Diet) that visually shows which self-care areas are covered today; state is restored from Firestore on page load so habits persist across sessions
- **Streak counter** — calculates the current consecutive-day check-in streak by walking backwards from today through the Firestore checkins collection; displayed as a badge ("🔥 12 Day Streak") that adds a gold glow effect (`streak-active` class) when all 5 habits are checked for the day
- **Weekly wellness overview** — a Chart.js area (filled line) chart with three datasets — Mood, Energy (mapped from sleep score), and Calm Level (mapped from anxiety score) — plotted across Mon–Sun using the last 7 days of check-in data; each metric is scaled from its 1–4 internal range to 1–10 for display
- **Overall mental health gauge** — a half-doughnut (180° arc) acting as a semicircular score meter; the percentage is computed from the average of all four check-in dimensions (mood + sleep + anxiety + diet) ÷ 4 over the last 7 days; a custom Chart.js plugin renders the percentage and "Mental Wellness" label in the center
- **Color-coded mood calendar** — renders the current month's dates in a CSS grid; each past day is colored using a 5-tier palette mapped from the Firestore mood score for that date:
  - `color-1` (soft blue, `--mood-1`) → Growing
  - `color-3` (sage green, `--mood-3`) → Okay
  - `color-5` (bright green, `--mood-5`) → Great
  - Days with no data appear at 40% opacity; today is highlighted with a distinct border
  - The calendar header shows the current month and year (e.g., "March 2026")

</details>

<details>
<summary><b>Daily Check-In</b></summary>
<br>

- **Four-dimension assessment** — each scored on a 1–4 scale with descriptive labels:
  1. **Internal Weather (Mood)** — "Stormy & Overwhelming" (1) → "Cloudy & Heavy" (2) → "Partly Cloudy / Neutral" (3) → "Sunny & Clear" (4)
  2. **Body Tension (Anxiety/Panic)** — "Tight chest, near panic today" (1) → "Restless and uneasy" (2) → "A normal amount of stress" (3) → "Grounded and completely relaxed" (4)
  3. **Sleep Quality** — "Exhausted / Barely slept" (1) → "Broken, tossed & turned" (2) → "Decent, woke up mostly fine" (3) → "Deep and restorative" (4)
  4. **Nourishment** — "Skipped meals / Only junk" (1) → "Mixed (some good, some bad)" (3) → "Balanced & nourishing meals" (4)
- **Auto-cascade to dashboard** — on submission the check-in computes the average of all 4 values, scales it to 1–10, and pushes it to the mood slider (which in turn updates the line chart and calendar)
- **Firestore persistence** — each check-in is saved to `users/{uid}/checkins/{YYYY-MM-DD}` with mood, anxiety, sleep, diet values plus a server timestamp; the user's root document `totalCheckins` counter is atomically incremented
- **Mood score saved separately** — the mood value is also written to `users/{uid}/mood/{YYYY-MM-DD}` so the calendar can query mood scores independently by month
- **Visual feedback** — the submit button shows a spinning icon during save, then turns green with "✓ Logged Successfully!" for 2 seconds before resetting
- **Historical tracking chart** — a grouped bar chart below the form with three datasets (Inner Peace, Sleep, Diet) plotted over the last 7 days; uses real Firestore data when available, with axis labels "Poor / Fair / Good / Great"

</details>

<details>
<summary><b>Analytics — the calm deep dive</b></summary>
<br>

All analytics charts pull from **up to 30 days of Firestore check-in data** when available (`DataService.getCheckins30()`), falling back to sample data for new users with fewer than 5 check-ins.

**Summary stat cards** at the top:
- **Wellness Score** (purple 📊) — overall percentage calculated from the average of all four check-in dimensions across 30 days
- **Resilience Building Days** (lavender 🌱) — count of days where the anxiety/tension score was ≤ 2 (intentionally reframed from "High Anxiety Days" — the label encourages growth rather than fear)
- **Good Mood Days** (green 😌) — count of days where the mood score was ≥ 3
- **Monthly Trend** (blue 📈) — percentage change comparing the average mood of the first half vs. second half of the 30-day window (e.g., "+14%" means improvement)

**Charts (8 total):**

1. **Mood Distribution Pie** — segments labeled Thriving, Good, Neutral, Building, Growing (deliberately avoids "Very Low" or "Bad" labels); colors: bright green → sage → soft teal → soft blue
2. **Relaxation Balance Doughnut** — four segments: Relaxed (anxiety 4), Mostly Calm (3), Finding Balance (2), Room to Grow (1); 55% cutout for a ring appearance
3. **Sleep Quality Trend (30 Days)** — filled line chart with one data point per day; each point is the raw sleep score (1–4) from the corresponding Firestore check-in; null values for missing days are spanned with `spanGaps: true`
4. **Calmness Journey (30 Days)** — same structure as the sleep chart but plots the anxiety/tension dimension; the title intentionally says "Calmness Journey" not "Anxiety Trend" — framed as progress
5. **Weekly Comparison Bars** — grouped bar chart with 4 week buckets (Week 1–4); each week shows Mood Avg, Sleep Avg, and Calm Level averages computed from the check-ins that fall in that week
6. **Habit Completion Rates** — horizontal bar chart showing each habit's completion percentage over the last 30 days; reads from `DataService.getHabitsRange(30)` and calculates how many days each of the 5 habits was toggled on
7. **Sleep vs. Mood Correlation Scatter** — each point represents one day with x = sleep score (1–5 axis) and y = mood score (scaled to 1–10); includes a subtitle: "Each point represents a day. Better sleep generally correlates with better mood."
8. **Monthly Mood Heatmap** — stacked bar chart with 7 day-of-week columns and 4 week layers; the opacity of each week's dataset increases from Week 1 (30%) to Week 4 (90%) to visually emphasize recent data

**Color palette** — all chart colors use a calming spectrum: soft blues `#7facd6`, teals `#8ec6c0`, sage greens `#b8d4a3`, lavenders `#b8a9d4`, and the primary purple `#747dff`. No reds, no oranges anywhere in the analytics. The idea is that even the data should feel supportive.

</details>

<details>
<summary><b>Wellness Tools</b></summary>
<br>

- **Cognitive Reframing Journal** — a two-step CBT (Cognitive Behavioral Therapy) exercise:
  1. **Identify the Thought** — a textarea where you write down a negative automatic thought (e.g., "I messed up that presentation, I'm terrible at my job.")
  2. **Challenge & Reframe** — a second textarea where you write a healthier perspective (e.g., "I stumbled on one slide, but the rest went well. I am still learning.")
  - Clicking "Anchor New Thought" saves both entries to Firestore (`users/{uid}/journal/{auto-id}`) with a server timestamp, then clears the fields with a green confirmation flash
  - The button shows a spinner during the Firestore write and displays "✓ Reframed & Saved!" on success

- **Pomodoro Focus Timer** — a 25-minute (1500 second) countdown displayed inside a styled circle:
  - **Start/Pause toggle** — single button that alternates between ▶ Start and ⏸ Pause
  - **Reset** — dedicated reset button that stops the interval, resets to 25:00, and restores the Start label
  - Display format: `MM:SS` with zero-padded minutes and seconds

- **Ambient Soundscapes** — four toggleable background audio options in a 2×2 grid:
  - **Rain** — external audio from Google's sound library, set to `loop: true`
  - **Forest Stream** — external audio, looped
  - **Ocean Waves** — external audio, looped
  - **Wind** — procedurally generated in-browser using the **Web Audio API**:
    - Creates a brown noise buffer (white noise passed through a leaky integrator: `output[i] = (lastOut + 0.02 * white) / 1.02`)
    - Runs the buffer through a low-pass BiquadFilter at 400 Hz for warmth
    - Modulates the gain with an LFO oscillator (0.15 Hz, amplitude 0.25) to create a natural wind-gusting effect
    - Base gain set to 0.5 for comfortable volume
  - Only one soundscape can play at a time — clicking a new one stops the previous; active cards get a `.playing` visual state

- **4-7-8 Guided Breathing** — an animated circle that guides you through the clinically-backed breathing technique:
  - **Tap to start** — the circle begins the cycle
  - **Inhale (4 seconds)** — circle scales up to 1.2×, background turns primary purple `#747dff`, text reads "Inhale (4s)"
  - **Hold (7 seconds)** — circle stays expanded, background shifts to lighter purple `#8c94ff`, text reads "Hold (7s)"
  - **Exhale (8 seconds)** — circle scales down to 0.8×, background deepens to `#5c65ff`, text reads "Exhale (8s)"
  - The cycle repeats indefinitely until tapped again to stop; all transitions use CSS `transition` for smooth animation
  - Tap again at any point to stop — the circle resets to default size and shows "Tap to Begin"

- **Daily Inspiration** — a rotating quote display with 6 curated quotes from mental health advocates:
  - Authors include Dan Millman, John Green, Lauren Fogel Mersy, Lalah Delia, Steve Dollar, and Nido Qubein
  - Clicking "New Quote" fades the current text out (opacity → 0), swaps the content, then fades it back in with a `0.4s` CSS opacity transition
  - Styled with a large Font Awesome quote icon and a clean card layout

</details>

<details>
<summary><b>Mind Games Hub — 5 Brain-Training Games</b></summary>
<br>

A full-screen game overlay system with per-game high score tracking via Firestore (`users/{uid}/highScores/{gameName}` and `users/{uid}/gameScores/{auto-id}` for every play).

1. **Focus Shot (Aim Trainer / Gridshot)**
   - **Mechanic:** Click/tap targets as fast as possible within 60 seconds; up to 3 targets are on screen at once, and a new one spawns instantly when you hit one
   - **Scoring:** +1 point per target hit; final score saved to Firestore
   - **Audio feedback:** A button click sound plays on every successful hit
   - **Controls:** Tap the arena to start; targets spawn at random positions within the container with a 40px margin

2. **Color Match (Stroop Effect)**
   - **Mechanic:** A color word (RED, BLUE, GREEN, YELLOW) is displayed in a *different* ink color; you must tap the button matching the **display color**, not the word — exploiting the Stroop cognitive interference effect
   - **Timing:** 30 seconds per round
   - **Difficulty twist:** 25% of rounds intentionally match the word to its display color to keep players on their toes
   - **Visual cues:** Correct answers briefly flash green (`.correct-flash`), wrong answers flash red (`.wrong-flash`)

3. **Memory Flip (Card Matching)**
   - **Mechanic:** A 4×4 grid of 16 face-down cards (8 pairs) with nature-themed emoji icons (🌿, ☀️, 🌙, 🌊, ❤️, ⭐, ☁️, 🌸); flip two at a time — if they match, they stay revealed; if not, they flip back after 700ms
   - **Scoring:** Total moves counted (lower is better); time is tracked from the first card flip
   - **Shuffle:** Fisher-Yates algorithm ensures a fair random layout every game
   - **Lock mechanism:** Input is locked while two unmatched cards are face-up, preventing exploits

4. **Pattern Recall (Simon Says)**
   - **Mechanic:** Four colored quadrants (red, blue, green, yellow) flash in a growing sequence; after watching, the player must repeat the exact sequence by clicking the quadrants in order
   - **Progression:** Each successful round adds one more step to the sequence; level counter tracks how far you've gotten
   - **Visual:** Each quadrant has a "lit" state (lighter shade) that flashes for 350ms during playback, with 400ms delays between flashes
   - **Failure:** One wrong tap ends the game immediately and shows the level reached

5. **Zen Puzzle (3×3 Sliding Tiles)**
   - **Mechanic:** A classic 15-puzzle variant on a 3×3 grid (tiles 1–8 + one empty space); slide tiles by clicking adjacent tiles to arrange them in numerical order
   - **Solvability:** Guaranteed solvable by shuffling from the solved state using 200 random legal moves (rather than randomizing tile positions, which can produce unsolvable configurations)
   - **Visual:** Each numbered tile has a unique gradient background (e.g., tile 1 = purple gradient, tile 3 = green gradient)
   - **Scoring:** Moves counted (lower is better); time tracked from first tile move

**Common game features:**
- Full-screen overlay with a header showing the game title, and live-updating stat counters (time/score/moves/level)
- "Play Again" and "Back to Games" buttons on the result screen
- High scores are persisted to Firestore — the game card on the hub page shows "Best: {score}" loaded from `users/{uid}/highScores/{game}`
- Every individual play is also saved with a timestamp in `users/{uid}/gameScores/` for future analytics

</details>

<details>
<summary><b>Relaxation & Wholesome Video Feed</b></summary>
<br>

A tabbed video section with two categories:

- **Relaxation tab** (🧘) — 8 curated long-form videos for ambient background viewing:
  - Tropical Ocean Ambience — Maldives (3+ hours)
  - Gentle Rain Sounds for Sleep (3 hours)
  - Peaceful Forest Walk — 4K Nature (2.5 hours)
  - Lo-Fi Beats to Relax & Study (live stream)
  - Ocean Waves — Calming Beach Sounds (3 hours)
  - Relaxing Piano Music & Water Sounds (3 hours)
  - Amazing Nature Scenery & Relaxing Music (3 hours)
  - Cozy Fireplace with Crackling Sounds (8 hours)

- **Wholesome tab** (❤️) — 7 short feel-good clips:
  - Classic viral wholesome videos (talking dogs, baby laughs, surprised kittens, twin babies, cute compilations)

**Technical implementation:**
- **Lazy-loaded thumbnails** — each video card shows an `<img>` thumbnail from `img.youtube.com` with `loading="lazy"`, plus a duration badge and category tag
- **Click-to-play** — no iframes are loaded until the user clicks a card, at which point a YouTube embed iframe with `autoplay=1` is injected into the DOM; this keeps the page lightweight even with 15 video cards
- **Tab switching** — clicking a tab re-renders the entire video grid for the selected category; active tab is visually highlighted

</details>

<details>
<summary><b>SOS Emergency Support</b></summary>
<br>

- **Floating SOS button** — a persistent red circular button (📞) fixed to the bottom-right corner of the app, always accessible from any page
- **Emergency modal** — clicking the button opens a centered modal overlay with:
  - **Emergency number: 112** — direct `tel:` link for one-tap dialing
  - **Crisis Lifeline: 14416** — direct `tel:` link for one-tap dialing
  - A calming message: "If you or someone else is in immediate danger, please reach out for professional help immediately."
- **Dismissal** — the modal can be closed by clicking "I'm Safe Now" or clicking outside the modal content area

</details>

<details>
<summary><b>Theming & Responsive Design</b></summary>
<br>

- **Dark mode toggle** — a sidebar button that switches between `.light-theme` and `.dark-theme` CSS classes on the body; the preference is saved to Firestore (`users/{uid}/settings.theme`) so it persists across sessions and devices
- **CSS custom properties** — the entire color system is driven by CSS variables (`--bg-color`, `--card-bg`, `--text-main`, `--primary`, `--border`, `--hover`, etc.) that swap cleanly between themes:
  - Light: white backgrounds, `#2c3e50` text, `#747dff` primary
  - Dark: `#121212` background, `#e0e0e0` text, `#8c94ff` primary
- **Mood spectrum colors** — a 5-tier calming palette with separate light and dark theme variants:
  - `--mood-1` through `--mood-5` spanning soft blue → teal → sage → green → bright green
- **Chart theme updates** — toggling dark mode calls `Chart.defaults.color` update and refreshes all Chart.js instances so labels, grid lines, and legends match the theme
- **Responsive layout** — CSS Grid + Flexbox for the dashboard grid, analytics grid, game cards, and video feed; sidebar collapses on mobile with a bottom navigation bar that mirrors the sidebar's navigation items
- **Glass-card design** — content cards use a `.glass-card` class with rounded corners, subtle shadows, and theme-aware backgrounds

</details>

<br>

## Design philosophy

| Principle | How it's applied |
|:--|:--|
| **No scary metrics** | "Anxiety Level" becomes "Calmness Level". "High Anxiety Days" becomes "Resilience Building Days". Body tension is scored as peace, not panic. |
| **Warm color palette** | Soft blues (`#7facd6`), teals (`#8ec6c0`), sage greens (`#b8d4a3`), lavenders (`#b8a9d4`). No red anywhere in analytics or reports. |
| **Progress framing** | Stats say "15% calmer this week" not "anxiety down 15%". Mood labels use Thriving / Good / Building / Growing — never "Bad" or "Very Low". |
| **Privacy by design** | All data lives in Firestore under the authenticated user's UID. Firestore security rules enforce that each user can only read/write their own data. No third-party analytics, no cookies, no tracking pixels. |
| **Offline resilience** | Firestore offline persistence (`enablePersistence({ synchronizeTabs: true })`) is enabled — the app works without internet and syncs when reconnected. |
| **Zero build tools** | No npm, no Webpack, no framework. Open `index.html` and it works. All dependencies loaded via CDN. |

<br>

## Tech stack

```
Frontend        HTML5, CSS3 (custom properties, grid, flexbox), Vanilla JavaScript (ES2017+)
Auth            Firebase Authentication (Email/Password + Google OAuth)
Database        Cloud Firestore (real-time NoSQL, offline persistence enabled)
Charts          Chart.js 4.4.2 (line, bar, radar, pie, doughnut, scatter — 14 charts total)
Audio           Web Audio API (procedural brown-noise wind with LFO gusting), HTML5 Audio (rain, forest, ocean)
Video           YouTube oEmbed thumbnails + lazy-loaded iframe embeds
Icons           Font Awesome 6.0.0-beta3
Fonts           Google Fonts — Poppins (weights 300, 400, 500, 600, 700)
Firebase SDK    v10.12.2 (compat build via CDN — firebase-app, firebase-auth, firebase-firestore)
```

<br>

## Firestore data model

All user data is scoped under `users/{uid}/`:

```
users/{uid}/
├── profile              # Onboarding answers (name, age group, concern, mood, goal)
├── onboarded            # Boolean flag
├── totalCheckins        # Atomic counter
├── lastCheckin          # Date string of last check-in
├── settings             # { theme: "dark" | "light" }
│
├── checkins/            # One doc per day
│   └── {YYYY-MM-DD}    # { mood, anxiety, sleep, diet, date, timestamp }
│
├── journal/             # Auto-ID docs
│   └── {auto-id}       # { negativeThought, reframe, date, timestamp }
│
├── habits/              # One doc per day
│   └── {YYYY-MM-DD}    # { habits: [bool×5], date, timestamp }
│
├── mood/                # One doc per day (calendar scores)
│   └── {YYYY-MM-DD}    # { score, date, timestamp }
│
├── gameScores/          # Auto-ID docs (every play)
│   └── {auto-id}       # { game, score, date, timestamp }
│
└── highScores/          # One doc per game type
    └── {gameName}       # { score, date }
```

**Security rules** (recommended for production):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null
                         && request.auth.uid == userId;
    }
  }
}
```

<br>

## Getting started

### Prerequisites

1. A [Firebase project](https://console.firebase.google.com) with:
   - **Authentication** enabled (Email/Password + Google sign-in providers)
   - **Cloud Firestore** database created (start in test mode, then apply security rules above for production)
2. Your Firebase web app config values

### Setup

```bash
git clone https://github.com/your-username/mindpulse.git
cd mindpulse
```

Update `firebase-config.js` with your own Firebase project credentials:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

Then serve it any way you like — no build step required:

```bash
# Python
python3 -m http.server 8080

# Node
npx serve .

# Or just open index.html directly in a browser
```

Visit `http://localhost:8080/index.html` and create an account to start.

<br>

## Project structure

```
project/
├── index.html          # Complete HTML structure — auth screen, onboarding,
│                       #   sidebar, 9 pages (dashboard, analytics, check-in,
│                       #   journal, focus, breathe, mind games, video feed,
│                       #   inspiration), SOS modal, bottom nav
│
├── style.css           # All styles — CSS custom properties, light/dark themes,
│                       #   auth & onboarding screens, glass-card components,
│                       #   chart containers, game overlays, responsive breakpoints,
│                       #   animations (fadeIn, breathing circle, streak glow)
│
├── script.js           # Core application logic — Firebase auth handlers,
│                       #   onboarding flow, app initialization, 14 Chart.js charts,
│                       #   mood slider ↔ calendar ↔ check-in cascade, habit tracking,
│                       #   streak calculation, timer, soundscapes (Web Audio API),
│                       #   breathing animation, quotes, video feed renderer,
│                       #   dark mode toggle, SOS modal, navigation routing
│
├── data.js             # Firestore CRUD service (DataService) — profile, check-ins,
│                       #   journal entries, habits, mood calendar scores, game scores,
│                       #   high scores, streak calculation, settings, stats
│
├── games.js            # Mind Games engine (MindGames object) — Focus Shot,
│                       #   Color Match, Memory Flip, Pattern Recall, Zen Puzzle;
│                       #   overlay management, score saving, result screens
│
├── firebase-config.js  # Firebase SDK initialization — project config, auth instance,
│                       #   Firestore instance, offline persistence setup
│
└── README.md           # This file
```

<br>

## Navigation pages

The app has **9 navigable pages** accessible from the sidebar (desktop) and bottom nav bar (mobile):

| Page | Icon | Description |
|:--|:--|:--|
| **Dashboard** | 🏠 | Mood slider, stat cards, mood line chart, habit grid + radar, wellness area chart, health gauge, mood calendar |
| **Analytics** | 📊 | 4 stat cards + 8 charts — pie, doughnut, two 30-day trend lines, weekly bars, habit rates, scatter plot, heatmap |
| **Check-In** | 📋 | 4-question daily assessment (mood, tension, sleep, diet) + historical tracking bar chart |
| **Journal** | 📖 | CBT cognitive reframing tool — identify negative thoughts, challenge & anchor reframes |
| **Focus Hub** | ⏱️ | Pomodoro timer (25 min) + ambient soundscapes (rain, forest, ocean, procedural wind) |
| **Breathe** | 🌬️ | Animated 4-7-8 guided breathing circle |
| **Mind Games** | 🎮 | 5 brain-training games with high score tracking |
| **Wholesome Feed** | 🎬 | Tabbed video section — relaxation ambience + wholesome clips (lazy-loaded YouTube) |
| **Inspiration** | 💬 | Rotating motivational quotes from mental health advocates |

<br>

---

<div align="center">

<img src="https://img.shields.io/badge/built%20with-care-b8a9d4?style=for-the-badge&labelColor=1a1a2e" />

<br><br>

<sub>Made as part of a Web Programming course project at VIT.</sub>

</div>
