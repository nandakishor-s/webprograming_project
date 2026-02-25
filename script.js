// ========================================================
//  AUTH & ONBOARDING SYSTEM (localStorage-based)
// ========================================================

function switchAuthTab(tab) {
    document.getElementById('loginForm').style.display = tab === 'login' ? 'block' : 'none';
    document.getElementById('signupForm').style.display = tab === 'signup' ? 'block' : 'none';
    document.getElementById('tabLogin').classList.toggle('active', tab === 'login');
    document.getElementById('tabSignup').classList.toggle('active', tab === 'signup');
    document.getElementById('authError').style.display = 'none';
}

function togglePass(id, icon) {
    const inp = document.getElementById(id);
    if (inp.type === 'password') { inp.type = 'text'; icon.className = 'fas fa-eye-slash'; }
    else { inp.type = 'password'; icon.className = 'fas fa-eye'; }
}

function showAuthError(msg) {
    const el = document.getElementById('authError');
    el.textContent = msg; el.style.display = 'block';
}

function getUsers() {
    return JSON.parse(localStorage.getItem('mh_users') || '{}');
}
function saveUsers(users) {
    localStorage.setItem('mh_users', JSON.stringify(users));
}

function handleSignup(e) {
    e.preventDefault();
    const user = document.getElementById('signupUser').value.trim().toLowerCase();
    const email = document.getElementById('signupEmail').value.trim();
    const pass = document.getElementById('signupPass').value;
    const confirm = document.getElementById('signupConfirm').value;

    if (pass !== confirm) { showAuthError('Passwords do not match.'); return; }
    if (pass.length < 6) { showAuthError('Password must be at least 6 characters.'); return; }

    const users = getUsers();
    if (users[user]) { showAuthError('Username already exists. Try logging in.'); return; }

    users[user] = { email, password: pass, onboarded: false, profile: {}, data: {} };
    saveUsers(users);
    localStorage.setItem('mh_currentUser', user);

    // New user → show onboarding
    document.getElementById('authScreen').style.display = 'none';
    document.getElementById('onboardScreen').style.display = 'flex';
}

function handleLogin(e) {
    e.preventDefault();
    const user = document.getElementById('loginUser').value.trim().toLowerCase();
    const pass = document.getElementById('loginPass').value;
    const users = getUsers();

    if (!users[user]) { showAuthError('Account not found. Please sign up first.'); return; }
    if (users[user].password !== pass) { showAuthError('Incorrect password.'); return; }

    localStorage.setItem('mh_currentUser', user);

    if (!users[user].onboarded) {
        document.getElementById('authScreen').style.display = 'none';
        document.getElementById('onboardScreen').style.display = 'flex';
    } else {
        enterApp(user);
    }
}

function handleLogout() {
    localStorage.removeItem('mh_currentUser');
    location.reload();
}

// ---- Onboarding ----
let obStep = 0;
const obTotalSteps = 5;
let obData = {};

document.querySelectorAll('.onboard-options').forEach(group => {
    group.querySelectorAll('.onboard-opt').forEach(opt => {
        opt.addEventListener('click', function() {
            group.querySelectorAll('.onboard-opt').forEach(o => o.classList.remove('selected'));
            this.classList.add('selected');
            obData[group.dataset.field] = this.dataset.value;
        });
    });
});

function obNavigate(dir) {
    // Save name input
    if (obStep === 0 && dir === 1) {
        const name = document.getElementById('obName').value.trim();
        if (!name) { document.getElementById('obName').style.borderColor = '#ff5e5e'; return; }
        obData.displayName = name;
    }

    obStep += dir;
    if (obStep < 0) obStep = 0;

    if (obStep >= obTotalSteps) {
        // Save profile & enter app
        const user = localStorage.getItem('mh_currentUser');
        const users = getUsers();
        users[user].onboarded = true;
        users[user].profile = obData;
        saveUsers(users);
        enterApp(user);
        return;
    }

    document.querySelectorAll('.onboard-question').forEach(q => q.classList.remove('active-q'));
    document.querySelector(`.onboard-question[data-step="${obStep}"]`).classList.add('active-q');
    document.querySelectorAll('#obProgress .step').forEach((s, i) => s.classList.toggle('done', i <= obStep));
    document.getElementById('obBack').style.display = obStep > 0 ? 'block' : 'none';
    document.getElementById('obNext').innerHTML = obStep === obTotalSteps - 1 ? 'Finish <i class="fas fa-check"></i>' : 'Next <i class="fas fa-arrow-right"></i>';
}

function enterApp(username) {
    document.getElementById('authScreen').style.display = 'none';
    document.getElementById('onboardScreen').style.display = 'none';
    document.getElementById('appWrapper').classList.remove('hidden');

    const users = getUsers();
    const profile = users[username]?.profile || {};
    const displayName = profile.displayName || username;

    // Set user info in sidebar
    document.getElementById('sidebarAvatar').textContent = displayName.charAt(0).toUpperCase();
    document.getElementById('sidebarUsername').textContent = displayName;
    document.getElementById('dashGreetName').textContent = displayName;

    if (profile.concern) {
        const labels = { anxiety: 'Anxiety Focus', depression: 'Mood Recovery', sleep: 'Sleep Optimization', focus: 'Focus Mode', general: 'General Wellness' };
        document.getElementById('sidebarLabel').textContent = labels[profile.concern] || 'Wellness Tracker';
    }

    initApp();
}

// Auto-login if session exists
(function checkSession() {
    const user = localStorage.getItem('mh_currentUser');
    if (user) {
        const users = getUsers();
        if (users[user]) {
            if (!users[user].onboarded) {
                document.getElementById('authScreen').style.display = 'none';
                document.getElementById('onboardScreen').style.display = 'flex';
            } else {
                enterApp(user);
            }
        }
    }
})();

// ========================================================
//  MAIN APP INITIALIZATION
// ========================================================

function initApp() {

    // --- Navigation Logic ---
    const pages = document.querySelectorAll('.page');
    const navItems = document.querySelectorAll('.nav-item[data-page]');

    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.dataset.page;
            pages.forEach(p => p.classList.remove('active-page'));
            document.getElementById(target).classList.add('active-page');
            navItems.forEach(nav => nav.classList.remove('active'));
            document.querySelectorAll(`[data-page="${target}"]`).forEach(el => el.classList.add('active'));
        });
    });

    // --- Theme Toggle ---
    const body = document.body;
    document.getElementById('themeToggleSide').addEventListener('click', () => {
        body.classList.toggle('light-theme');
        body.classList.toggle('dark-theme');
        const isDark = body.classList.contains('dark-theme');
        document.getElementById('themeToggleSide').innerHTML = isDark ? '<i class="fas fa-sun"></i> Light Mode' : '<i class="fas fa-moon"></i> Dark Mode';

        if (window.moodChart && window.radarChart && window.trackingChart) {
            Chart.defaults.color = isDark ? '#a0a0a0' : '#7f8c8d';
            window.moodChart.update();
            window.radarChart.update();
            window.trackingChart.update();
        }
        // Update all analytics charts too
        Object.values(Chart.instances).forEach(c => c.update());
    });

    // --- SOS Modal Logic ---
    const sosBtn = document.getElementById('sosBtn');
    const sosModal = document.getElementById('sosModal');
    const closeSos = document.getElementById('closeSos');

    sosBtn.addEventListener('click', () => sosModal.classList.add('active'));
    closeSos.addEventListener('click', () => sosModal.classList.remove('active'));
    sosModal.addEventListener('click', (e) => {
        if(e.target === sosModal) sosModal.classList.remove('active');
    });

    // ========================================================
    //  CHARTS SETUP
    // ========================================================
    Chart.defaults.font.family = "'Poppins', sans-serif";
    Chart.defaults.color = '#7f8c8d';

    // === DASHBOARD CHARTS ===

    // Mood Chart (Line, scale 1-10)
    const ctxLine = document.getElementById('moodChart').getContext('2d');
    window.moodChart = new Chart(ctxLine, {
        type: 'line',
        data: {
            labels: ['M', 'T', 'W', 'T', 'F', 'S', 'Today'],
            datasets: [{
                label: 'Mood Score', data: [5, 6, 4, 7, 8, 7, 7],
                borderColor: '#747dff', backgroundColor: 'rgba(116, 125, 255, 0.1)',
                borderWidth: 3, fill: true, tension: 0.4,
                pointBackgroundColor: '#ffffff', pointBorderColor: '#747dff', pointRadius: 4
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { display: false, min: 1, max: 10 }, x: { grid: { display: false } } } }
    });

    // Radar Chart
    window.radarChart = new Chart(document.getElementById('radarChart').getContext('2d'), {
        type: 'radar',
        data: {
            labels: ['Water', 'Sleep', 'Meds', 'Outdoors', 'Diet'],
            datasets: [{
                data: [20, 80, 100, 40, 60], backgroundColor: 'rgba(116, 125, 255, 0.2)', borderColor: '#747dff', pointBackgroundColor: '#747dff', borderWidth: 2
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { r: { beginAtZero: true, max: 100, ticks: { display: false } } }, plugins: { legend: { display: false } } }
    });

    // Tracking Chart (Check-In)
    const ctxTrack = document.getElementById('trackingChart').getContext('2d');
    window.trackingChart = new Chart(ctxTrack, {
        type: 'bar',
        data: {
            labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Today'],
            datasets: [
                { label: 'Inner Peace', data: [1, 2, 2, 3, 4, 3, null], backgroundColor: '#7facd6', borderRadius: 4 },
                { label: 'Sleep', data: [2, 1, 3, 3, 4, 4, null], backgroundColor: '#747dff', borderRadius: 4 },
                { label: 'Diet', data: [1, 1, 4, 3, 4, 4, null], backgroundColor: '#2ecc71', borderRadius: 4 }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: {
                y: { min: 0, max: 4, ticks: { stepSize: 1, callback: function(val) { if(val===1) return 'Poor'; if(val===2) return 'Fair'; if(val===3) return 'Good'; if(val===4) return 'Great'; return ''; } } },
                x: { grid: { display: false } }
            },
            plugins: { tooltip: { mode: 'index', intersect: false } }
        }
    });

    // Weekly Wellness Area Chart (Dashboard)
    new Chart(document.getElementById('wellnessAreaChart').getContext('2d'), {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [
                { label: 'Mood', data: [6, 7, 5, 8, 7, 9, 7], borderColor: '#747dff', backgroundColor: 'rgba(116,125,255,0.08)', fill: true, tension: 0.4, borderWidth: 2 },
                { label: 'Energy', data: [5, 6, 4, 7, 8, 7, 6], borderColor: '#2ecc71', backgroundColor: 'rgba(46,204,113,0.08)', fill: true, tension: 0.4, borderWidth: 2 },
                { label: 'Calm Level', data: [7, 5, 8, 4, 3, 2, 4], borderColor: '#b8a9d4', backgroundColor: 'rgba(184,169,212,0.08)', fill: true, tension: 0.4, borderWidth: 2 }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', labels: { boxWidth: 12, usePointStyle: true } } }, scales: { y: { min: 0, max: 10, grid: { color: 'rgba(0,0,0,0.04)' } }, x: { grid: { display: false } } } }
    });

    // Overall Mental Health Gauge (Doughnut acting as gauge)
    const gaugeVal = 72;
    new Chart(document.getElementById('gaugeChart').getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['Score', 'Remaining'],
            datasets: [{ data: [gaugeVal, 100 - gaugeVal], backgroundColor: ['#747dff', '#eef2f7'], borderWidth: 0 }]
        },
        options: {
            responsive: true, maintainAspectRatio: false, cutout: '75%',
            rotation: -90, circumference: 180,
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false },
            }
        },
        plugins: [{
            id: 'gaugeText',
            afterDraw(chart) {
                const { ctx, chartArea } = chart;
                const cx = (chartArea.left + chartArea.right) / 2;
                const cy = chartArea.bottom - 20;
                ctx.save();
                ctx.textAlign = 'center';
                ctx.fillStyle = chart.options.color || '#2c3e50';
                ctx.font = 'bold 36px Poppins'; ctx.fillText(gaugeVal + '%', cx, cy - 10);
                ctx.font = '500 13px Poppins'; ctx.fillStyle = '#7f8c8d'; ctx.fillText('Mental Wellness', cx, cy + 14);
                ctx.restore();
            }
        }]
    });

    // === ANALYTICS PAGE CHARTS ===

    // Mood Distribution Pie
    new Chart(document.getElementById('moodPieChart').getContext('2d'), {
        type: 'pie',
        data: {
            labels: ['Thriving', 'Good', 'Neutral', 'Building', 'Growing'],
            datasets: [{ data: [25, 35, 20, 12, 8], backgroundColor: ['#20bf6b', '#2ecc71', '#b8d4a3', '#8ec6c0', '#7facd6'], borderWidth: 2, borderColor: '#fff' }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { boxWidth: 12, usePointStyle: true, padding: 12 } } } }
    });

    // Stress vs Relaxation Doughnut
    new Chart(document.getElementById('stressDoughnut').getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['Relaxed', 'Mostly Calm', 'Finding Balance', 'Room to Grow'],
            datasets: [{ data: [40, 30, 20, 10], backgroundColor: ['#20bf6b', '#8ec6c0', '#b8a9d4', '#7facd6'], borderWidth: 2, borderColor: '#fff' }]
        },
        options: { responsive: true, maintainAspectRatio: false, cutout: '55%', plugins: { legend: { position: 'right', labels: { boxWidth: 12, usePointStyle: true, padding: 12 } } } }
    });

    // Sleep Quality Area (30 days simulated)
    const sleepDays = Array.from({length: 30}, (_, i) => `Day ${i+1}`);
    const sleepData = Array.from({length: 30}, () => +(Math.random() * 3 + 1).toFixed(1));
    new Chart(document.getElementById('sleepAreaChart').getContext('2d'), {
        type: 'line',
        data: {
            labels: sleepDays,
            datasets: [{ label: 'Sleep Quality', data: sleepData, borderColor: '#747dff', backgroundColor: 'rgba(116,125,255,0.12)', fill: true, tension: 0.3, borderWidth: 2, pointRadius: 2 }]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { min: 0, max: 5, ticks: { stepSize: 1 } }, x: { display: false } }, plugins: { legend: { display: false } } }
    });

    // Anxiety Line (30 days simulated)
    const anxData = Array.from({length: 30}, () => +(Math.random() * 3 + 1).toFixed(1));
    new Chart(document.getElementById('anxietyLineChart').getContext('2d'), {
        type: 'line',
        data: {
            labels: sleepDays,
            datasets: [{ label: 'Calmness Progress', data: anxData, borderColor: '#b8a9d4', backgroundColor: 'rgba(184,169,212,0.1)', fill: true, tension: 0.3, borderWidth: 2, pointRadius: 2 }]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { min: 0, max: 5, ticks: { stepSize: 1 } }, x: { display: false } }, plugins: { legend: { display: false } } }
    });

    // Weekly Comparison Bar
    new Chart(document.getElementById('weeklyCompareChart').getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [
                { label: 'Mood Avg', data: [5.5, 6.2, 6.8, 7.2], backgroundColor: '#747dff', borderRadius: 6 },
                { label: 'Sleep Avg', data: [2.5, 3.0, 3.2, 3.1], backgroundColor: '#2ecc71', borderRadius: 6 },
                { label: 'Calm Level', data: [3.5, 3.0, 2.5, 2.4], backgroundColor: '#b8a9d4', borderRadius: 6 }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true }, x: { grid: { display: false } } }, plugins: { legend: { position: 'top', labels: { boxWidth: 12, usePointStyle: true } } } }
    });

    // Habit Completion Rates (Horizontal bar)
    new Chart(document.getElementById('habitBarChart').getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['Water', 'Sleep', 'Medication', 'Outdoors', 'Diet'],
            datasets: [{ label: 'Completion %', data: [85, 72, 90, 45, 68], backgroundColor: ['#747dff', '#8c94ff', '#2ecc71', '#8ec6c0', '#e8a87c'], borderRadius: 6 }]
        },
        options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, scales: { x: { min: 0, max: 100, ticks: { callback: v => v + '%' } }, y: { grid: { display: false } } }, plugins: { legend: { display: false } } }
    });

    // Sleep vs Mood Correlation Scatter
    const scatterData = Array.from({length: 30}, () => ({ x: +(Math.random() * 4 + 1).toFixed(1), y: +(Math.random() * 9 + 1).toFixed(1) }));
    new Chart(document.getElementById('correlationScatter').getContext('2d'), {
        type: 'scatter',
        data: {
            datasets: [{ label: 'Sleep vs Mood', data: scatterData, backgroundColor: 'rgba(116,125,255,0.6)', borderColor: '#747dff', pointRadius: 6, pointHoverRadius: 8 }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: {
                x: { title: { display: true, text: 'Sleep Score (1-5)', font: { weight: '600' } }, min: 0, max: 5 },
                y: { title: { display: true, text: 'Mood Score (1-10)', font: { weight: '600' } }, min: 0, max: 10 }
            },
            plugins: { legend: { display: false } }
        }
    });

    // Monthly Mood Heatmap (Stacked bars as heatmap substitute)
    const heatWeeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    new Chart(document.getElementById('heatmapChart').getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: heatWeeks.map((w, i) => ({
                label: w,
                data: Array.from({length: 7}, () => Math.floor(Math.random() * 5) + 1),
                backgroundColor: ['rgba(116,125,255,0.3)', 'rgba(116,125,255,0.5)', 'rgba(116,125,255,0.7)', 'rgba(116,125,255,0.9)'][i],
                borderRadius: 4
            }))
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: { y: { stacked: true, min: 0, ticks: { stepSize: 2 } }, x: { stacked: true, grid: { display: false } } },
            plugins: { legend: { position: 'top', labels: { boxWidth: 12, usePointStyle: true } } }
        }
    });

    // --- Habit Synergy & Streak Logic ---
    let baseStreak = 12;
    let streakClaimed = false;
    const streakBadge = document.getElementById('streakBadge');
    const streakCountText = document.getElementById('streakCount');

    document.querySelectorAll('.habit-icon').forEach(icon => {
        icon.addEventListener('click', function() {
            this.classList.toggle('active');

            if (window.radarChart) {
                const index = parseInt(this.dataset.index);
                window.radarChart.data.datasets[0].data[index] = this.classList.contains('active') ? 100 : 20;
                window.radarChart.update();
            }

            const activeCount = document.querySelectorAll('.habit-icon.active').length;
            if (activeCount === 5 && !streakClaimed) {
                streakCountText.innerText = baseStreak + 1;
                streakBadge.classList.add('streak-active');
                streakClaimed = true;
            } else if (activeCount < 5 && streakClaimed) {
                streakCountText.innerText = baseStreak;
                streakBadge.classList.remove('streak-active');
                streakClaimed = false;
            }
        });
    });

    // --- Calendar Logic ---
    function generateCalendar() {
        const grid = document.getElementById('calGrid');
        const now = new Date();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const today = now.getDate();

        document.getElementById('calMonth').innerText = now.toLocaleString('default', { month: 'long', year: 'numeric' });
        ['S', 'M', 'T', 'W', 'T', 'F', 'S'].forEach(d => {
            const el = document.createElement('div'); el.className = 'cal-header-day'; el.innerText = d; grid.appendChild(el);
        });

        for(let i = 1; i <= daysInMonth; i++) {
            const el = document.createElement('div'); el.className = 'cal-day'; el.innerText = i;

            if (i === today) {
                el.id = "todayDateNode";
                el.classList.add('today', 'color-4');
            } else if (i < today) {
                const randomMood = Math.floor(Math.random() * 5) + 1;
                el.classList.add(`color-${randomMood}`);
            }
            grid.appendChild(el);
        }
    }
    generateCalendar();

    // --- Core Unified Math: Mood Slider & Check-in ---
    document.getElementById('moodSlider').addEventListener('input', function() {
        const val = parseInt(this.value);
        document.getElementById('moodValue').innerText = val;

        if (window.moodChart) {
            window.moodChart.data.datasets[0].data[6] = val;
            window.moodChart.update();
        }

        const todayNode = document.getElementById('todayDateNode');
        if(todayNode) {
            todayNode.classList.remove('color-1', 'color-2', 'color-3', 'color-4', 'color-5');
            let colorTier = Math.round(((val - 1) / 9) * 4 + 1);
            todayNode.classList.add(`color-${colorTier}`);
        }
    });

    // Check-in → Slider cascade
    document.getElementById('checkinForm').addEventListener('submit', function(e) {
        e.preventDefault();

        const moodVal = parseInt(document.querySelector('input[name="mood"]:checked').value);
        const anxVal = parseInt(document.querySelector('input[name="anx"]:checked').value);
        const sleepVal = parseInt(document.querySelector('input[name="sleep"]:checked').value);
        const dietVal = parseInt(document.querySelector('input[name="diet"]:checked').value);

        if (window.trackingChart) {
            window.trackingChart.data.datasets[0].data[6] = anxVal;
            window.trackingChart.data.datasets[1].data[6] = sleepVal;
            window.trackingChart.data.datasets[2].data[6] = dietVal;
            window.trackingChart.update();
        }

        const avg = (moodVal + anxVal + sleepVal + dietVal) / 4;
        const scaledTo10 = Math.round(((avg - 1) / 3) * 9 + 1);

        const slider = document.getElementById('moodSlider');
        slider.value = scaledTo10;
        slider.dispatchEvent(new Event('input'));

        const btn = this.querySelector('button');
        const origText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Logged Successfully!';
        btn.style.background = '#2ecc71';
        setTimeout(() => { btn.innerHTML = origText; btn.style.background = 'var(--primary)'; }, 2000);
    });

    // --- Journal CBT Reframing Logic ---
    document.getElementById('reframeBtn').addEventListener('click', function() {
        const originalText = this.innerHTML;
        this.innerHTML = '<i class="fas fa-check"></i> Reframed!';
        this.style.background = '#2ecc71';
        setTimeout(() => {
            this.innerHTML = originalText;
            this.style.background = 'var(--primary)';
            document.getElementById('negativeThought').value = '';
            document.getElementById('reframeThought').value = '';
        }, 2000);
    });

    // --- Focus Timer Logic ---
    let timeRemaining = 1500;
    let timerInterval;
    let isRunning = false;
    const display = document.getElementById('timerDisplay');

    function updateDisplay() {
        const m = Math.floor(timeRemaining / 60).toString().padStart(2, '0');
        const s = (timeRemaining % 60).toString().padStart(2, '0');
        display.innerText = `${m}:${s}`;
    }

    document.getElementById('startTimer').addEventListener('click', function() {
        if (isRunning) {
            clearInterval(timerInterval);
            this.innerHTML = '<i class="fas fa-play"></i> Start';
        } else {
            timerInterval = setInterval(() => {
                timeRemaining--; updateDisplay();
                if(timeRemaining <= 0) { clearInterval(timerInterval); isRunning = false; }
            }, 1000);
            this.innerHTML = '<i class="fas fa-pause"></i> Pause';
        }
        isRunning = !isRunning;
    });

    document.getElementById('resetTimer').addEventListener('click', () => {
        clearInterval(timerInterval); isRunning = false; timeRemaining = 1500; updateDisplay();
        document.getElementById('startTimer').innerHTML = '<i class="fas fa-play"></i> Start';
    });

    // --- Audio Soundscapes Logic ---
    // Wind: generate via Web Audio API (reliable, no external URL needed)
    let windAudioCtx = null, windSource = null, windGain = null, windRunning = false;
    function createWindAudio() {
        return {
            _paused: true,
            get paused() { return this._paused; },
            play() {
                if (!windAudioCtx) windAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
                if (windAudioCtx.state === 'suspended') windAudioCtx.resume();
                // Create brown noise (wind-like)
                const bufferSize = 2 * windAudioCtx.sampleRate;
                const noiseBuffer = windAudioCtx.createBuffer(1, bufferSize, windAudioCtx.sampleRate);
                const output = noiseBuffer.getChannelData(0);
                let lastOut = 0.0;
                for (let i = 0; i < bufferSize; i++) {
                    const white = Math.random() * 2 - 1;
                    output[i] = (lastOut + (0.02 * white)) / 1.02;
                    lastOut = output[i];
                    output[i] *= 3.5;
                }
                windSource = windAudioCtx.createBufferSource();
                windSource.buffer = noiseBuffer;
                windSource.loop = true;
                // Low-pass filter for deep wind effect
                const filter = windAudioCtx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.value = 400;
                // LFO for gusting effect
                windGain = windAudioCtx.createGain();
                windGain.gain.value = 0.5;
                const lfo = windAudioCtx.createOscillator();
                const lfoGain = windAudioCtx.createGain();
                lfo.frequency.value = 0.15;
                lfoGain.gain.value = 0.25;
                lfo.connect(lfoGain);
                lfoGain.connect(windGain.gain);
                lfo.start();
                windSource.connect(filter);
                filter.connect(windGain);
                windGain.connect(windAudioCtx.destination);
                windSource.start();
                this._paused = false;
                windRunning = true;
            },
            pause() {
                if (windSource) { try { windSource.stop(); } catch(e){} windSource = null; }
                this._paused = true;
                windRunning = false;
            }
        };
    }

    const audioMap = {
        rain: new Audio('https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg'),
        forest: new Audio('https://actions.google.com/sounds/v1/water/small_stream_flowing.ogg'),
        ocean: new Audio('https://actions.google.com/sounds/v1/water/waves_crashing_on_rock_beach.ogg'),
        wind: createWindAudio()
    };
    // Set loop for HTML Audio elements only
    ['rain', 'forest', 'ocean'].forEach(k => { audioMap[k].loop = true; });
    let currentAudio = null, currentCard = null;

    document.querySelectorAll('.sound-card').forEach(card => {
        card.addEventListener('click', function() {
            const sound = audioMap[this.dataset.sound];
            if (currentAudio && currentAudio !== sound) {
                currentAudio.pause(); currentCard.classList.remove('playing');
            }
            if (sound.paused) {
                const playResult = sound.play();
                if (playResult && playResult.catch) playResult.catch(()=>{});
                this.classList.add('playing'); currentAudio = sound; currentCard = this;
            } else {
                sound.pause(); this.classList.remove('playing'); currentAudio = null;
            }
        });
    });

    // --- Guided Breathing Animation ---
    let breatheActive = false, bTimeout;
    const bCircle = document.getElementById('breatheCircle');

    function runCycle() {
        if (!breatheActive) return;
        bCircle.innerHTML = 'Inhale<br>(4s)';
        bCircle.style.transform = 'scale(1.2)';
        bCircle.style.background = '#747dff';

        bTimeout = setTimeout(() => {
            if (!breatheActive) return;
            bCircle.innerHTML = 'Hold<br>(7s)';
            bCircle.style.transform = 'scale(1.2)';
            bCircle.style.background = '#8c94ff';

            bTimeout = setTimeout(() => {
                if (!breatheActive) return;
                bCircle.innerHTML = 'Exhale<br>(8s)';
                bCircle.style.transform = 'scale(0.8)';
                bCircle.style.background = '#5c65ff';

                bTimeout = setTimeout(() => { if (breatheActive) runCycle(); }, 8000);
            }, 7000);
        }, 4000);
    }

    bCircle.addEventListener('click', () => {
        if (breatheActive) {
            breatheActive = false; clearTimeout(bTimeout);
            bCircle.innerHTML = 'Tap to<br>Begin';
            bCircle.style.transform = 'scale(1)';
            bCircle.style.background = 'var(--primary)';
        } else {
            breatheActive = true; runCycle();
        }
    });

    // --- Inspiration Quotes Logic ---
    const quotes = [
        { text: "You don't have to control your thoughts. You just have to stop letting them control you.", author: "Dan Millman" },
        { text: "There is hope, even when your brain tells you there isn't.", author: "John Green" },
        { text: "Deep breathing is our nervous system's love language.", author: "Lauren Fogel Mersy" },
        { text: "Self-care is how you take your power back.", author: "Lalah Delia" },
        { text: "Recovery is not one and done. It is a lifelong journey that takes place one day, one step at a time.", author: "Steve Dollar" },
        { text: "Your present circumstances don't determine where you can go; they merely determine where you start.", author: "Nido Qubein" }
    ];

    document.getElementById('newQuoteBtn').addEventListener('click', () => {
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

        const qText = document.getElementById('quoteText');
        const qAuth = document.getElementById('quoteAuthor');
        qText.style.opacity = 0; qAuth.style.opacity = 0;

        setTimeout(() => {
            qText.innerText = `"${randomQuote.text}"`;
            qAuth.innerText = `— ${randomQuote.author}`;
            qText.style.opacity = 1; qAuth.style.opacity = 1;
            qText.style.transition = 'opacity 0.4s'; qAuth.style.transition = 'opacity 0.4s';
        }, 300);
    });

} // end initApp
