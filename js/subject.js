// js/subjects.js
import { db, auth } from "./firebase-config.js";
import { collection, addDoc, getDocs, query, where, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// --- VIEW: SUBJECTS (List) ---
export async function renderSubjects(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = `
        <h1>📚 My Subjects</h1>
        <div class="card">
            <input type="text" id="new-subject" placeholder="Subject Name (e.g. Remedial Law)">
            <input type="text" id="new-sy" placeholder="School Year (e.g. 2025-2026)">
            <button id="btn-add-subject">Add Subject</button>
        </div>
        <div id="subject-list" class="card-grid" style="margin-top:20px;">Loading...</div>
    `;

    document.getElementById('btn-add-subject').onclick = async () => {
        const name = document.getElementById('new-subject').value;
        const sy = document.getElementById('new-sy').value;
        if(name && sy) {
            await addDoc(collection(db, "subjects"), { userId: auth.currentUser.uid, name, sy });
            renderSubjects(containerId); // Refresh
        }
    };

    // Load Subjects
    const q = query(collection(db, "subjects"), where("userId", "==", auth.currentUser.uid));
    const snap = await getDocs(q);
    const list = document.getElementById('subject-list');
    
    if(snap.empty) { list.innerHTML = "<p>No subjects added.</p>"; return; }
    
    list.innerHTML = "";
    snap.forEach(doc => {
        const s = doc.data();
        list.innerHTML += `
            <div class="card">
                <h3>${s.name}</h3>
                <span class="tag">${s.sy}</span>
            </div>
        `;
    });
}

// --- VIEW: CONSOLIDATED SUBJECTS (Per Year) ---
export async function renderConsolidatedSubjects(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = `<h1>📂 Consolidated Subjects (By Year)</h1><div id="sy-list">Loading...</div>`;

    // Fetch all subjects
    const q = query(collection(db, "subjects"), where("userId", "==", auth.currentUser.uid), orderBy("sy", "desc"));
    const snap = await getDocs(q);

    if(snap.empty) { container.innerHTML += "<p>No data found.</p>"; return; }

    const list = document.getElementById('sy-list');
    list.innerHTML = "";
    
    // Group by School Year manually
    let currentSY = "";
    snap.forEach(doc => {
        const s = doc.data();
        if(s.sy !== currentSY) {
            currentSY = s.sy;
            list.innerHTML += `<h2 style="margin-top:30px; border-bottom:2px solid var(--primary); color:var(--bg-dark)">S.Y. ${currentSY}</h2>`;
        }
        list.innerHTML += `
            <div class="card" style="margin-bottom:10px; cursor:pointer;" onclick="alert('Open notes for ${s.name}')">
                <div style="display:flex; justify-content:space-between;">
                    <h3>${s.name}</h3>
                    <i class="fas fa-chevron-right"></i>
                </div>
                <p>Click to view consolidated notes & digests.</p>
            </div>
        `;
    });
}
