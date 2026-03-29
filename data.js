// ================================================================
//  DATA SERVICE — Firestore CRUD for MindPulse
//  All user data stored under: users/{uid}/...
// ================================================================

const DataService = {

    // ── Helpers ──────────────────────────────────────────────
    _uid() {
        const user = auth.currentUser;
        if (!user) throw new Error('Not authenticated');
        return user.uid;
    },

    _userDoc() {
        return db.collection('users').doc(this._uid());
    },

    _todayKey() {
        return new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
    },

    // ── Profile ─────────────────────────────────────────────
    async saveProfile(profile) {
        await this._userDoc().set({
            profile,
            onboarded: true,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
    },

    async getProfile() {
        const doc = await this._userDoc().get();
        return doc.exists ? doc.data() : null;
    },

    async isOnboarded() {
        const data = await this.getProfile();
        return data?.onboarded === true;
    },

    // ── Check-ins ───────────────────────────────────────────
    async saveCheckin(checkinData) {
        const key = this._todayKey();
        await this._userDoc().collection('checkins').doc(key).set({
            ...checkinData,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            date: key
        });
        // Increment total check-ins count
        await this._userDoc().set({
            totalCheckins: firebase.firestore.FieldValue.increment(1),
            lastCheckin: key
        }, { merge: true });
    },

    async getCheckins(days = 7) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const startKey = startDate.toISOString().split('T')[0];

        const snap = await this._userDoc().collection('checkins')
            .where('date', '>=', startKey)
            .orderBy('date', 'asc')
            .limit(days)
            .get();

        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },

    async getCheckins30() {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        const startKey = startDate.toISOString().split('T')[0];

        const snap = await this._userDoc().collection('checkins')
            .where('date', '>=', startKey)
            .orderBy('date', 'asc')
            .get();

        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },

    async getAllCheckins() {
        const snap = await this._userDoc().collection('checkins')
            .orderBy('date', 'desc')
            .get();
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },

    // ── Journal Entries ─────────────────────────────────────
    async saveJournalEntry(entry) {
        await this._userDoc().collection('journal').add({
            ...entry,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            date: this._todayKey()
        });
    },

    async getJournalEntries(limit = 10) {
        const snap = await this._userDoc().collection('journal')
            .orderBy('timestamp', 'desc')
            .limit(limit)
            .get();
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },

    // ── Habits (per day) ────────────────────────────────────
    async saveHabits(habits) {
        const key = this._todayKey();
        await this._userDoc().collection('habits').doc(key).set({
            habits, // [bool, bool, bool, bool, bool] → water, sleep, meds, outside, diet
            date: key,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
    },

    async getHabits(date) {
        const key = date || this._todayKey();
        const doc = await this._userDoc().collection('habits').doc(key).get();
        return doc.exists ? doc.data().habits : [false, false, false, false, false];
    },

    async getHabitsRange(days = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const startKey = startDate.toISOString().split('T')[0];

        const snap = await this._userDoc().collection('habits')
            .where('date', '>=', startKey)
            .orderBy('date', 'desc')
            .get();

        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },

    // ── Mood Calendar ───────────────────────────────────────
    async saveMoodScore(score) {
        const key = this._todayKey();
        await this._userDoc().collection('mood').doc(key).set({
            score,
            date: key,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
    },

    async getMoodScores(year, month) {
        const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
        const endMonth = month + 2 > 12 ? 1 : month + 2;
        const endYear = month + 2 > 12 ? year + 1 : year;
        const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`;

        const snap = await this._userDoc().collection('mood')
            .where('date', '>=', startDate)
            .where('date', '<', endDate)
            .get();

        const scores = {};
        snap.docs.forEach(d => {
            const data = d.data();
            scores[data.date] = data.score;
        });
        return scores;
    },

    // ── Game Scores ─────────────────────────────────────────
    async saveGameScore(game, score) {
        // Save individual game play
        await this._userDoc().collection('gameScores').add({
            game,
            score,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            date: this._todayKey()
        });
        // Update high score if beaten
        const highDoc = await this._userDoc().collection('highScores').doc(game).get();
        if (!highDoc.exists || highDoc.data().score < score) {
            await this._userDoc().collection('highScores').doc(game).set({
                score,
                date: this._todayKey()
            });
        }
    },

    async getHighScore(game) {
        const doc = await this._userDoc().collection('highScores').doc(game).get();
        return doc.exists ? doc.data().score : 0;
    },

    async getAllHighScores() {
        const snap = await this._userDoc().collection('highScores').get();
        const scores = {};
        snap.docs.forEach(d => { scores[d.id] = d.data().score; });
        return scores;
    },

    // ── Streak Calculation ──────────────────────────────────
    async calculateStreak() {
        const checkins = await this.getAllCheckins(); // ordered desc
        if (checkins.length === 0) return 0;

        const dates = new Set(checkins.map(c => c.date));
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayKey = this._todayKey();

        let streak = 0;
        let checkDate = new Date(today);

        // If today doesn't have a check-in, start counting from yesterday
        if (!dates.has(todayKey)) {
            checkDate.setDate(checkDate.getDate() - 1);
        }

        while (dates.has(checkDate.toISOString().split('T')[0])) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        }

        return streak;
    },

    // ── Aggregate Stats ─────────────────────────────────────
    async getStats() {
        const doc = await this._userDoc().get();
        if (!doc.exists) return { totalCheckins: 0 };
        return {
            totalCheckins: doc.data().totalCheckins || 0,
            lastCheckin: doc.data().lastCheckin || null
        };
    },

    // ── Settings (theme, preferences) ───────────────────────
    async saveSettings(settings) {
        await this._userDoc().set({ settings }, { merge: true });
    },

    async getSettings() {
        const doc = await this._userDoc().get();
        return doc.exists ? (doc.data()?.settings || {}) : {};
    }
};
