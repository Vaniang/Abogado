// js/mockReview.js
import { db } from "./firebase-config.js";

export function renderMockReview(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = `
        <h1>🧠 Mock Review</h1>
        
        <div class="tabs" style="display:flex; gap:10px; margin-bottom:20px;">
            <button onclick="switchMockMode('exam')" class="btn-secondary">✍️ Exam (Essay)</button>
            <button onclick="switchMockMode('quiz')" class="btn-secondary">📝 Quiz (MCQ)</button>
            <button onclick="switchMockMode('recit')" class="btn-secondary">🗣️ Recit (Flashcards)</button>
        </div>

        <div class="upload-area" id="upload-box">
            <i class="fas fa-cloud-upload-alt"></i>
            <h3>Upload PDF Material</h3>
            <p>Your Exam/Quiz/Recit will be generated from this file.</p>
            <input type="file" id="pdf-upload" accept="application/pdf" hidden>
        </div>

        <div id="mock-content-area" style="margin-top:20px;"></div>
    `;

    // Initialize Upload Logic
    document.getElementById('upload-box').onclick = () => document.getElementById('pdf-upload').click();
    document.getElementById('pdf-upload').onchange = (e) => handlePDF(e);
}

// Global function for the tabs
window.switchMockMode = (mode) => {
    const area = document.getElementById('mock-content-area');
    if(!window.uploadedText) {
        area.innerHTML = "<p style='color:red;'>⚠️ Please upload a PDF first.</p>";
        return;
    }

    if(mode === 'exam') {
        area.innerHTML = `
            <div class="card essay-box">
                <h3>Bar Essay Exam</h3>
                <p><strong>Instructions:</strong> Analyze the facts below and decide with legal basis.</p>
                <div class="source-text">"${window.uploadedText.substring(0, 400)}..."</div>
                <textarea placeholder="Write your answer (ALAC)..."></textarea>
                <button class="btn-primary">Submit Answer</button>
            </div>`;
    } 
    else if (mode === 'quiz') {
        area.innerHTML = `
            <div class="card">
                <h3>Multiple Choice Quiz</h3>
                <p>1. Based on the text, what is the primary requisite mentioned?</p>
                <div style="display:flex; flex-direction:column; gap:10px;">
                    <button class="btn-secondary" style="text-align:left;">A. Intent to kill</button>
                    <button class="btn-secondary" style="text-align:left;">B. Taking of property</button>
                    <button class="btn-secondary" style="text-align:left;">C. Lack of consent</button>
                </div>
            </div>`;
    } 
    else if (mode === 'recit') {
        area.innerHTML = `
            <div class="flashcard" onclick="this.style.transform = this.style.transform === 'rotateY(180deg)' ? 'rotateY(0deg)' : 'rotateY(180deg)'">
                <div style="text-align:center;">
                    <h3>RECIT QUESTION:</h3>
                    <p>Explain the doctrine found in this paragraph...</p>
                    <small>(Click to flip for answer)</small>
                </div>
            </div>`;
    }
};

// PDF Handler (Simplified)
async function handlePDF(e) {
    // ... use pdf.js logic here ...
    // window.uploadedText = "Extracted text...";
    alert("PDF Ready! Select a mode above.");
    window.uploadedText = "Sample extracted legal text for testing..."; // Mock data for now
}
