// js/auth.js

// Import Firebase functions directly from the web URL (CDN)
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Import the 'auth' instance we created in firebase-config.js
// (Make sure you have firebase-config.js created too!)
import { auth } from "./firebase-config.js";

// --- LOGIN FUNCTION ---
export async function login(email, password) {
    try {
        await signInWithEmailAndPassword(auth, email, password);
        // We don't need to do anything else here. 
        // The onAuthStateChanged listener in main.js will detect the login and switch screens.
    } catch (error) {
        alert("Login Failed: " + error.message);
    }
}

// --- REGISTER FUNCTION ---
export async function register(email, password) {
    try {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("Account created successfully! You are now logged in.");
    } catch (error) {
        alert("Registration Failed: " + error.message);
    }
}

// --- LOGOUT FUNCTION ---
export async function logoutUser() {
    try {
        await signOut(auth);
        // Reloading the page clears any old data from memory
        window.location.reload(); 
    } catch (error) {
        console.error("Logout Error:", error);
    }
}
