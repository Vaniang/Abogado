// js/main.js

// 1. IMPORT YOUR TOOLS
// We import the specific functions we need from the other files we created.
import { auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { login, register, logoutUser } from "./auth.js";
import { renderDashboard } from "./dashboard.js";
import { renderSubjects, renderConsolidatedSubjects } from "./subjects.js";
import { renderDigester, renderConsolidatedDigests } from "./digester.js";
import { renderMockReview } from "./mockReview.js";

// 2. AUTHENTICATION LISTENER
// This watches if the user is logged in or out and flips the screen accordingly.
onAuthStateChanged(auth, (user) => {
    const loginView = document.getElementById('login-view');
    const appView = document.getElementById('app-view');

    if (user) {
        // If logged in: Hide login, Show App, Load Dashboard
        console.log("User is logged in:", user.email);
        loginView.style.display = 'none';
        appView.style.display = 'flex';
        
        // Start at the dashboard by default
        router('dashboard');
    } else {
        // If logged out: Show login, Hide App
        loginView.style.display = 'flex';
        appView.style.display = 'none';
    }
});

// 3. GLOBAL LOGIN BUTTONS
// Since main.js is a "module", functions aren't global by default.
// We attach listeners to the Login/Register buttons in index.html here.
document.addEventListener('DOMContentLoaded', () => {
    
    // Check if elements exist to avoid errors
    const loginBtn = document.getElementById('btn-login');
    const regBtn = document.getElementById('btn-register');

    if(loginBtn) {
        loginBtn.addEventListener('click', () => {
            const email = document.getElementById('email').value;
            const pass = document.getElementById('password').value;
            login(email, pass);
        });
    }

    if(regBtn) {
        regBtn.addEventListener('click', () => {
            const email = document.getElementById('email').value;
            const pass = document.getElementById('password').value;
            register(email, pass);
        });
    }
});

// 4. THE ROUTER (Navigation Logic)
// This function decides what to put inside the <main id="main-content"> tag.
window.router = (route) => {
    const contentId = 'main-content'; // The ID of the container div in index.html
    
    // UI: Update the sidebar to show which tab is active
    const navItems = document.querySelectorAll('.sidebar li');
    navItems.forEach(item => item.classList.remove('active'));
    
    const activeNav = document.getElementById(`nav-${route}`);
    if(activeNav) activeNav.classList.add('active');

    // LOGIC: Switch content based on the 'route' name
    switch(route) {
        case 'dashboard': 
            renderDashboard(contentId); 
            break;
            
        case 'subjects': 
            renderSubjects(contentId); 
            break;
            
        case 'codals': 
            // Opens in a new tab, so we don't overwrite the main content
            window.open("https://ecodalplus.com", "_blank"); 
            break;
            
        case 'digester': 
            renderDigester(contentId); 
            break;
            
        case 'cons-digests': 
            renderConsolidatedDigests(contentId); 
            break;
            
        case 'cons-subjects': 
            renderConsolidatedSubjects(contentId); 
            break;
            
        case 'mock-review': 
            renderMockReview(contentId); 
            break;
            
        case 'logout': 
            logoutUser(); 
            break;
            
        default: 
            renderDashboard(contentId);
    }
};

// 5. EXPOSE ROUTER TO HTML
// Because modules are private, we must explicitly attach 'router' to 'window'
// so that onclick="router('dashboard')" in your HTML works.
window.router = router;
