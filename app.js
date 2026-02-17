// ------------------------------------------------------------------
// 1. FIREBASE IMPORTS (CDN for Browser)
// ------------------------------------------------------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    where, 
    orderBy,
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ------------------------------------------------------------------
// 2. YOUR CONFIGURATION
// ------------------------------------------------------------------
const firebaseConfig = {
    apiKey: "AIzaSyDxKEf2v5P2LN_a2BcR_ODYDGINZMmVPWk",
    authDomain: "abogado-ea708.firebaseapp.com",
    projectId: "abogado-ea708",
    storageBucket: "abogado-ea708.firebasestorage.app",
    messagingSenderId: "469135522184",
    appId: "1:469135522184:web:d7cf28de119011f282623d",
    measurementId: "G-CPJBKR7T59"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// ------------------------------------------------------------------
// 3. AUTHENTICATION LOGIC
// ------------------------------------------------------------------

// Login Function
window.authLogin = async () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    
    try {
        await signInWithEmailAndPassword(auth, email, pass);
        // UI updates automatically via onAuthStateChanged
    } catch (error) {
        alert("Login Failed: " + error.message);
    }
};

// Register Function
window.authRegister = async () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;

    try {
        await createUserWithEmailAndPassword(auth, email, pass);
        alert("Account created! You are now logged in.");
    } catch (error) {
        alert("Registration Failed: " + error.message);
    }
};

// Logout Function
window.logout = async () => {
    try {
        await signOut(auth);
        alert("Logged out successfully.");
    } catch (error) {
        console.error("Logout Error:", error);
    }
};

// Auth State Listener (Controls which screen is visible)
onAuthStateChanged(auth, (user) => {
    const loginView = document.getElementById('login-view');
    const appView = document.getElementById('app-view');
    const userDisplay = document.getElementById('user-email-display'); // Optional: Add this in HTML sidebar

    if (user) {
        // User is signed in
        console.log("User ID:", user.uid);
        loginView.style.display = 'none';
        appView.style.display = 'flex';
        renderDashboard(); // Load the dashboard immediately
    } else {
        // User is signed out
        loginView.style.display = 'flex';
        appView.style.display = 'none';
    }
});

// ------------------------------------------------------------------
// 4. CORE FEATURES & LOGIC
// ------------------------------------------------------------------

// --- DASHBOARD: Shows today's tasks ---
window.renderDashboard = async () => {
    const content = document.getElementById('main-content');
    content.innerHTML = `
        <div class="header">
            <h1>📅 Dashboard</h1>
            <p>Welcome to M-Abogado. Let's study smart.</p>
        </div>
        <div id="loading">Loading schedule...</div>
        <div id="dashboard-grid" class="card-grid"></div>
    `;

    // Example: Fetch "Tasks" collection
    // Note: You need to create a 'tasks' collection in Firestore console first!
    try {
        const q = query(
            collection(db, "tasks"), 
            where("userId", "==", auth.currentUser.uid), // Only show my tasks
            orderBy("dueDate", "asc")
        );
        const snapshot = await getDocs(q);
        
        const grid = document.getElementById('dashboard-grid');
        document.getElementById('loading').style.display = 'none';

        if (snapshot.empty) {
            grid.innerHTML = `<div class="card"><p>No pending tasks. Use "Add Task" to plan your study.</p></div>`;
            return;
        }

        let html = '';
        snapshot.forEach((doc) => {
            const data = doc.data();
            html += `
                <div class="card task-card">
                    <h3>${data.subject || "General"}</h3>
                    <p><strong>Type:</strong> ${data.type}</p>
                    <p>${data.description}</p>
                    <small>Due: ${data.dueDate}</small>
                </div>
            `;
        });
        grid.innerHTML = html;
    } catch (e) {
        console.log("Firestore not ready or empty:", e);
        document.getElementById('loading').innerText = "No data found or permission denied.";
    }
};

// --- SUBJECTS: List subjects by SY ---
window.renderSubjects = () => {
    const content = document.getElementById('main-content');
    content.innerHTML = `
        <h1>📚 Subjects</h1>
        <div class="form-group">
             <button onclick="alert('Feature: Add Subject Modal')">+ New Subject</button>
        </div>
        <div class="card-grid">
            <div class="card">
                <h3>Crim Law 1</h3>
                <p>S.Y. 2025-2026</p>
                <button onclick="renderConsolidatedDigest('Crim Law 1')">View Digests</button>
            </div>
            </div>
    `;
};

// --- CASE DIGESTER: The core tool ---
window.renderDigester = () => {
    const content = document.getElementById('main-content');
    content.innerHTML = `
        <h1>⚖️ Case Digester</h1>
        <div class="card">
            <div class="form-group">
                <label>Subject Matter</label>
                <input type="text" id="digest-subject" placeholder="e.g. Crim Law 1">
            </div>
            <div class="form-group">
                <label>Case Title</label>
                <input type="text" id="digest-title" placeholder="e.g. People vs. Adlawan">
            </div>
            <div class="form-group">
                <label>Facts</label>
                <textarea id="digest-facts" placeholder="Brief statement of facts..."></textarea>
            </div>
            <div class="form-group">
                <label>Issue</label>
                <input type="text" id="digest-issue" placeholder="The legal question...">
            </div>
            <div class="form-group">
                <label>Ruling (Held)</label>
                <textarea id="digest-ruling" placeholder="The court's decision..."></textarea>
            </div>
            <button onclick="saveDigest()">Save to Cloud</button>
        </div>
    `;
};

// Function to Save Digest to Firestore
window.saveDigest = async () => {
    const user = auth.currentUser;
    if (!user) return alert("Please login first.");

    const subject = document.getElementById('digest-subject').value;
    const title = document.getElementById('digest-title').value;
    const facts = document.getElementById('digest-facts').value;
    const issue = document.getElementById('digest-issue').value;
    const ruling = document.getElementById('digest-ruling').value;

    if(!title || !subject) return alert("Subject and Title are required!");

    try {
        await addDoc(collection(db, "digests"), {
            userId: user.uid,
            subject: subject,
            caseTitle: title,
            facts: facts,
            issue: issue,
            ruling: ruling,
            createdAt: serverTimestamp()
        });
        alert("Digest Saved Successfully!");
        renderDashboard(); // Go back to home
    } catch (e) {
        console.error("Error adding digest: ", e);
        alert("Error saving: " + e.message);
    }
};

// --- CONSOLIDATED DIGESTS ---
// Fetches all digests for a specific subject
window.renderConsolidatedDigest = async (subjectName) => {
    const content = document.getElementById('main-content');
    content.innerHTML = `<h1>📂 Consolidated Digests: ${subjectName}</h1><div id="digest-list">Loading...</div>`;

    const q = query(
        collection(db, "digests"), 
        where("userId", "==", auth.currentUser.uid),
        where("subject", "==", subjectName)
    );

    const snapshot = await getDocs(q);
    const list = document.getElementById('digest-list');
    
    if (snapshot.empty) {
        list.innerHTML = "<p>No digests found for this subject.</p>";
        return;
    }

    let html = '';
    snapshot.forEach(doc => {
        const d = doc.data();
        html += `
            <div class="card" style="margin-bottom: 20px;">
                <h3>${d.caseTitle}</h3>
                <p><strong>Facts:</strong> ${d.facts}</p>
                <p><strong>Issue:</strong> ${d.issue}</p>
                <p><strong>Ruling:</strong> ${d.ruling}</p>
            </div>
        `;
    });
    list.innerHTML = html;
};

// --- E-CODAL+ LINK ---
window.openCodal = () => {
    window.open("https://ecodalplus.com", "_blank");
};

// --- MOCK REVIEW ---
window.renderMockReview = () => {
    const content = document.getElementById('main-content');
    content.innerHTML = `
        <h1>📝 Mock Bar Exam</h1>
        <p>Select a subject to start a random quiz.</p>
        <div class="card-grid">
            <button class="card" onclick="startQuiz('Civil Law')">Civil Law</button>
            <button class="card" onclick="startQuiz('Remedial Law')">Remedial Law</button>
            <button class="card" onclick="startQuiz('Criminal Law')">Criminal Law</button>
        </div>
        <div id="quiz-area" style="margin-top:20px;"></div>
    `;
};

window.startQuiz = (subject) => {
    // Hardcoded sample for demo. In production, fetch this from a "questions" collection in Firestore
    const quizArea = document.getElementById('quiz-area');
    quizArea.innerHTML = `
        <div class="card">
            <h3>${subject} Question:</h3>
            <p>Is a person criminally liable if they commit a felony different from what they intended?</p>
            <button onclick="alert('Correct! (Art. 4, RPC)')">Yes (Praeter Intentionem)</button>
            <button onclick="alert('Incorrect.')">No</button>
        </div>
    `;
};
