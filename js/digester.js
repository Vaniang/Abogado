// js/digester.js
import { db, auth } from "./firebase-config.js";
import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// --- VIEW: DIGESTER (Input Form) ---
export function renderDigester(containerId) {
    document.getElementById(containerId).innerHTML = `
        <h1>⚖️ Case Digester</h1>
        <div class="card">
            <div class="form-group"><label>Subject</label><input type="text" id="d-subject" placeholder="e.g. Crim Law 1"></div>
            <div class="form-group"><label>Case Title</label><input type="text" id="d-title" placeholder="e.g. People v. Adlawan"></div>
            <div class="form-group"><label>Facts</label><textarea id="d-facts" style="height:100px"></textarea></div>
            <div class="form-group"><label>Issue</label><input type="text" id="d-issue"></div>
            <div class="form-group"><label>Ruling</label><textarea id="d-ruling" style="height:100px"></textarea></div>
            <button id="btn-save" class="btn-primary">Save Digest</button>
        </div>
    `;
    
    document.getElementById('btn-save').onclick = async () => {
        // ... (Save logic same as before) ...
        alert("Saved! View it in Cons. Digests.");
    };
}

// --- VIEW: CONS. DIGESTS (Per Subject) ---
export async function renderConsolidatedDigests(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = `
        <h1>📂 Consolidated Digests</h1>
        <div style="display:flex; gap:10px; margin-bottom:20px;">
            <select id="subject-filter" style="padding:10px; border-radius:5px;"><option>Loading subjects...</option></select>
            <button id="btn-filter" class="btn-primary" style="width:auto; margin:0;">Filter</button>
        </div>
        <div id="digest-results" class="card-grid">Select a subject to view digests.</div>
    `;

    // 1. Populate Dropdown with available subjects from DB
    // (Logic omitted for brevity, but you'd query 'subjects' collection here)
    
    // 2. Show all for now (sorted by subject)
    const q = query(collection(db, "digests"), where("userId", "==", auth.currentUser.uid), orderBy("subject"));
    const snap = await getDocs(q);
    
    const results = document.getElementById('digest-results');
    results.innerHTML = "";
    
    let currentSubject = "";
    snap.forEach(doc => {
        const d = doc.data();
        if(d.subject !== currentSubject) {
            currentSubject = d.subject;
            results.innerHTML += `<h2 style="grid-column:1/-1; margin-top:20px;">${currentSubject}</h2>`;
        }
        results.innerHTML += `
            <div class="card">
                <h3>${d.caseTitle}</h3>
                <p><strong>Issue:</strong> ${d.issue}</p>
                <details><summary>Read Ruling</summary><p>${d.ruling}</p></details>
            </div>
        `;
    });
}
