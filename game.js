// game.js  shared state engine (ES module)
const QUESTIONS_API =
    'https://sheetdb.io/api/v1/d55vc27hfllg5';

const HISTORY_API =
    'https://sheetdb.io/api/v1/48hk4o6an0ceg';

const STATE_API = 'https://sheetdb.io/api/v1/rezga0crfj3h1D';

export const PHASES = {
    IDLE: 'IDLE',
    FACE_OFF: 'FACE_OFF',
    FACE_OFF_ANSWER: 'FACE_OFF_ANSWER',
    FACE_OFF_EXHAUSTED: 'FACE_OFF_EXHAUSTED',
    PLAY: 'PLAY',
    STEAL: 'STEAL',
    FAST_MONEY: 'FAST_MONEY',
    ROUND_COMPLETE: 'ROUND_COMPLETE',
    GAME_OVER: 'GAME_OVER',
};

export const sampleQuestions = [
    {
        id: 1,
        question: 'Name something people do every morning',
        answers: [
            { text: 'Brush teeth', points: 32 },
            { text: 'Shower', points: 27 },
            { text: 'Eat breakfast', points: 18 },
            { text: 'Exercise', points: 11 },
            { text: 'Check phone', points: 7 },
            { text: 'Make coffee', points: 5 },
        ],
    },
    {
        id: 2,
        question: 'Name a reason someone might be late for work',
        answers: [
            { text: 'Traffic', points: 35 },
            { text: "Alarm didn't go off", points: 25 },
            { text: 'Overslept', points: 20 },
            { text: 'Flat tire', points: 10 },
            { text: 'Kids', points: 7 },
            { text: 'Weather', points: 3 },
        ],
    },
    {
        id: 3,
        question: 'Name something you find in a kitchen',
        answers: [
            { text: 'Refrigerator', points: 40 },
            { text: 'Stove', points: 28 },
            { text: 'Microwave', points: 14 },
            { text: 'Sink', points: 10 },
            { text: 'Dishwasher', points: 5 },
            { text: 'Toaster', points: 3 },
        ],
    },
    {
        id: 4,
        question: 'Name a popular fast food chain',
        answers: [
            { text: "McDonald's", points: 38 },
            { text: 'Burger King', points: 22 },
            { text: "Wendy's", points: 18 },
            { text: 'Subway', points: 12 },
            { text: 'Taco Bell', points: 7 },
            { text: 'KFC', points: 3 },
        ],
    },
    {
        id: 5,
        question: 'Name something you take to the beach',
        answers: [
            { text: 'Sunscreen', points: 33 },
            { text: 'Towel', points: 29 },
            { text: 'Swimsuit', points: 19 },
            { text: 'Sunglasses', points: 11 },
            { text: 'Umbrella', points: 5 },
            { text: 'Cooler', points: 3 },
        ],
    },
    {
        id: 6,
        question: 'Name a sport kids play in school',
        answers: [
            { text: 'Soccer', points: 36 },
            { text: 'Basketball', points: 26 },
            { text: 'Baseball', points: 16 },
            { text: 'Football', points: 12 },
            { text: 'Tennis', points: 6 },
            { text: 'Swimming', points: 4 },
        ],
    },
    {
        id: 7,
        question: 'Name something associated with Christmas',
        answers: [
            { text: 'Santa Claus', points: 35 },
            { text: 'Christmas tree', points: 28 },
            { text: 'Presents', points: 21 },
            { text: 'Snow', points: 9 },
            { text: 'Cookies', points: 5 },
            { text: 'Stockings', points: 2 },
        ],
    },
    {
        id: 8,
        question: 'Name a reason people exercise',
        answers: [
            { text: 'Lose weight', points: 42 },
            { text: 'Stay healthy', points: 31 },
            { text: 'Build muscle', points: 14 },
            { text: 'Stress relief', points: 8 },
            { text: "Doctor's orders", points: 3 },
            { text: 'Social', points: 2 },
        ],
    },
    {
        id: 9,
        question: 'Name something in a hotel room',
        answers: [
            { text: 'Bed', points: 37 },
            { text: 'TV', points: 25 },
            { text: 'Bathroom', points: 20 },
            { text: 'Mini bar', points: 10 },
            { text: 'Phone', points: 5 },
            { text: 'Desk', points: 3 },
        ],
    },
    {
        id: 10,
        question: 'Name a popular TV show genre',
        answers: [
            { text: 'Drama', points: 32 },
            { text: 'Comedy', points: 28 },
            { text: 'Reality TV', points: 22 },
            { text: 'Crime/thriller', points: 11 },
            { text: 'News', points: 5 },
            { text: 'Sports', points: 2 },
        ],
    },
];

export function defaultState() {
    return {
        phase: PHASES.IDLE,
        round: 1,
        currentTeam: null,
        buzzerWinner: null,
        buzzerEnabled: false,
        answerEnabled: false,
        strikes: 0,
        roundPoints: 0,
        pointMultiplier: 1,
        scores: { team1: 0, team2: 0 },
        teamNames: { team1: 'Team 1', team2: 'Team 2' },
        currentQuestion: null,
        questions: [],
        revealedAnswers: [],
        faceOffAnswers: { team1: null, team2: null },
        faceOffWinner: null,
        faceOffFirstTeam: null,
        faceOffCycles: 0,
        playersPerTeam: 4,
        usedQuestions: [],
        fastMoney: {
            active: false,
            player1: { answers: [], score: 0 },
            player2: { answers: [], score: 0 },
            currentPlayer: 1,
            totalScore: 0,
            timerSeconds: 20,
            timerRunning: false,
        },
        gameHistory: [],
        winner: null,
    };
}

// const DB_NAME = 'familyFeudDB';
// const DB_VERSION = 1;
// const QUESTIONS_STORE = 'questions';
// const HISTORY_STORE = 'gameHistory';

let db = null;

// export function initDB() {
//     return new Promise((resolve, reject) => {
//         const request = indexedDB.open(DB_NAME, DB_VERSION);

//         request.onupgradeneeded = (event) => {
//             const database = event.target.result;
//             if (!database.objectStoreNames.contains(QUESTIONS_STORE)) {
//                 database.createObjectStore(QUESTIONS_STORE, { keyPath: 'id' });
//             }
//             if (!database.objectStoreNames.contains(HISTORY_STORE)) {
//                 database.createObjectStore(HISTORY_STORE, {
//                     keyPath: 'id',
//                     autoIncrement: true,
//                 });
//             }
//         };

//         request.onsuccess = async (event) => {
//             db = event.target.result;
//             // Seed sample questions if store is empty
//             const count = await countStore(QUESTIONS_STORE);
//             if (count === 0) {
//                 await seedQuestions(sampleQuestions);
//             }
//             resolve(db);
//         };

//         request.onerror = (event) => {
//             reject(event.target.error);
//         };
//     });
// }

export async function initDB() {
    try {
        const questions = await getAllQuestions();

        // Seed only if sheet is empty
        if (questions.length === 0) {
            await seedQuestions(sampleQuestions);
        }

        return true;
    } catch (error) {
        console.error('Failed to initialize SheetDB:', error);
        throw error;
    }
}

// function countStore(storeName) {
//     return new Promise((resolve, reject) => {
//         const tx = db.transaction(storeName, 'readonly');
//         const store = tx.objectStore(storeName);
//         const req = store.count();
//         req.onsuccess = () => resolve(req.result);
//         req.onerror = () => reject(req.error);
//     });
// }

// function seedQuestions(questions) {
//     return new Promise((resolve, reject) => {
//         const tx = db.transaction(QUESTIONS_STORE, 'readwrite');
//         const store = tx.objectStore(QUESTIONS_STORE);
//         questions.forEach((q) => {
//             // Add revealed: false to each answer
//             const question = {
//                 ...q,
//                 answers: q.answers.map((a) => ({ ...a, revealed: false })),
//             };
//             store.put(question);
//         });
//         tx.oncomplete = () => resolve();
//         tx.onerror = () => reject(tx.error);
//     });
// }

export async function seedQuestions(questions) {
    for (const q of questions) {
        await fetch(QUESTIONS_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                data: {
                    id: q.id,
                    question: q.question,
                    answers: JSON.stringify(
                        q.answers.map(a => ({
                            ...a,
                            revealed: false
                        }))
                    )
                }
            })
        });
    }
}

// export function getAllQuestions() {
//     return new Promise((resolve, reject) => {
//         if (!db) {
//             reject(new Error('DB not initialized'));
//             return;
//         }
//         const tx = db.transaction(QUESTIONS_STORE, 'readonly');
//         const store = tx.objectStore(QUESTIONS_STORE);
//         const req = store.getAll();
//         req.onsuccess = () => resolve(req.result);
//         req.onerror = () => reject(req.error);
//     });
// }

export async function getAllQuestions() {
    const response = await fetch(QUESTIONS_API);

    const rows = await response.json();

    return rows.map(row => ({
        id: Number(row.id),
        question: row.question,
        answers: JSON.parse(row.answers)
    }));
}

// export function saveGameHistory(entry) {
//     return new Promise((resolve, reject) => {
//         if (!db) {
//             reject(new Error('DB not initialized'));
//             return;
//         }
//         const tx = db.transaction(HISTORY_STORE, 'readwrite');
//         const store = tx.objectStore(HISTORY_STORE);
//         const req = store.add({ ...entry, timestamp: Date.now() });
//         req.onsuccess = () => resolve(req.result);
//         req.onerror = () => reject(req.error);
//     });
// }

export async function saveGameHistory(entry) {
    await fetch(HISTORY_API, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            data: {
                winner: entry.winner,
                team1Score: entry.team1Score,
                team2Score: entry.team2Score,
                round: entry.round,
                timestamp: Date.now()
            }
        })
    });
}

const STATE_KEY = 'familyFeudState';

// export function loadState() {
//     try {
//         const raw = localStorage.getItem(STATE_KEY);
//         if (!raw) return defaultState();
//         const parsed = JSON.parse(raw);
//         // Merge with defaultState to ensure all keys exist
//         return { ...defaultState(), ...parsed };
//     } catch {
//         return defaultState();
//     }
// }

export function loadState() {
    try {
        const raw = localStorage.getItem(STATE_KEY);
        if (!raw) return defaultState();

        const parsed = JSON.parse(raw);

        return {
            ...defaultState(),
            ...parsed
        };
    } catch {
        return defaultState();
    }
}

// export function saveState(state) {
//     try {
//         localStorage.setItem(STATE_KEY, JSON.stringify(state));
//     } catch (e) {
//         console.error('Failed to save state:', e);
//     }
// }

export async function saveState(state) {
    // local backup
    localStorage.setItem(STATE_KEY, JSON.stringify(state));

    // cloud backup
    await fetch(`${STATE_API}/id/current`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            data: {
                state: JSON.stringify(state)
            }
        })
    });
}

let channel = null;

function getChannel() {
    if (!channel) {
        channel = new BroadcastChannel('family-feud');
    }
    return channel;
}

export function broadcast(state) {
    getChannel().postMessage({ type: 'STATE_UPDATE', state });
}

export function subscribe(callback) {
    const ch = getChannel();
    const handler = (event) => {
        if (event.data && event.data.type === 'STATE_UPDATE') {
            callback(event.data.state);
        }
    };
    ch.addEventListener('message', handler);
    return () => ch.removeEventListener('message', handler);
}

export function broadcastAction(action) {
    getChannel().postMessage({ type: 'ACTION', action });
}

export function subscribeActions(callback) {
    const ch = getChannel();
    const handler = (event) => {
        if (event.data && event.data.type === 'ACTION') {
            callback(event.data.action);
        }
    };
    ch.addEventListener('message', handler);
    return () => ch.removeEventListener('message', handler);
}
