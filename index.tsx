
import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { ASSETS } from "./assets";
import AdminDashboard from "./AdminDashboard";

// --- Firebase Configuration ---
// IMPORTANT: All credentials MUST be set via environment variables in production
// Set these in your .env file locally and in Render dashboard for production
const firebaseConfig = {
  apiKey: (import.meta as any).env?.VITE_FIREBASE_API_KEY,
  authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID,
  storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID
};

// Admin credentials from environment variables (REQUIRED)
const ADMIN_EMAIL = (import.meta as any).env?.VITE_ADMIN_EMAIL;
const ADMIN_PASSWORD = (import.meta as any).env?.VITE_ADMIN_PASSWORD;

// Initialize Firebase safely
let db = null;
try {
  if (firebaseConfig.apiKey) {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  } else {
    console.warn("Firebase config is empty. App running in simulation mode. Data will not be saved to DB.");
  }
} catch (error) {
  console.error("Error initializing Firebase:", error);
}

// Optional: Formspree form ID (set this in a Vite env var: VITE_FORMSPREE_FORM_ID)
const FORMSPREE_FORM_ID = (import.meta as any).env?.VITE_FORMSPREE_FORM_ID || '';

// --- Security Helpers ---
const sanitizeInput = (input: string): string => {
  // Remove potential XSS vectors
  return input
    .replace(/[<>"']/g, '') // Remove common XSS characters
    .trim()
    .slice(0, 500); // Limit length to prevent DoS
};

const isValidName = (name: string): boolean => {
  const sanitized = sanitizeInput(name);
  return sanitized.length >= 2 && sanitized.length <= 100 && /^[a-zA-Z\s'-]+$/.test(sanitized);
};

const isStrongPassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  return password.length >= 8 && 
         /[A-Z]/.test(password) && 
         /[a-z]/.test(password) && 
         /[0-9]/.test(password);
};

// --- Icons ---
const ChevronDown = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M6 9l6 6 6-6"/></svg>
);

const ArrowUp = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path d="M18 15l-6-6-6 6"/></svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path d="M18 6L6 18M6 6l12 12"/></svg>
);

const Spinner = () => (
  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const Zap = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
);

const Globe = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
);

const PaletteIcon = ({ className = "w-6 h-6" }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><path d="M12 21a9 9 0 100-18c4.97 0 9 2.03 9 5 0 2.97-4.03 5-9 5-.5 0-1-.03-1.5-.09l-2.02 2.02c-.39.39-.39 1.02 0 1.41l1.12 1.12c.38.38.35 1.03-.08 1.36-.72.56-1.73.56-2.52.18"/></svg>
);

const Lock = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
);

const Phone = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.12 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
);

const SendIcon = ({ className = "w-6 h-6" }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
);

// --- Styles ---
const styles = `
  :root {
    --primary: #7C3AED;
    --primary-hover: #6D28D9;
    --bg: #000;
    --card-bg: #111;
    --text: #fff;
    --text-sec: #a1a1aa;
    --accent: #00f2ea;
    --error: #ef4444;
  }

  /* Utility Classes */
  .w-full { width: 100%; }
  .w-4 { width: 1rem; }
  .h-4 { height: 1rem; }
  .w-5 { width: 1.25rem; }
  .h-5 { height: 1.25rem; }
  .w-6 { width: 1.5rem; }
  .h-6 { height: 1.5rem; }
  .w-8 { width: 2rem; }
  .h-8 { height: 2rem; }
  .w-10 { width: 2.5rem; }
  .h-10 { height: 2.5rem; }
  .w-12 { width: 3rem; }
  .h-12 { height: 3rem; }
  .max-w-md { max-width: 28rem; }
  .relative { position: relative; }
  .fixed { position: fixed; }
  .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
  .z-50 { z-index: 50; }
  .cursor-pointer { cursor: pointer; }
  .bg-black-80 { background-color: rgba(0, 0, 0, 0.8); }
  .backdrop-blur-sm { backdrop-filter: blur(4px); }
  .bg-gray-300 { background-color: #d1d5db; }
  
  .flex { display: flex; }
  .items-center { align-items: center; }
  .justify-center { justify-content: center; }
  .justify-between { justify-content: space-between; }
  .flex-col { flex-direction: column; }
  .flex-row { flex-direction: row; }
  .gap-6 { gap: 1.5rem; }
  .gap-2 { gap: 0.5rem; }
  
  .rounded-lg { border-radius: 0.5rem; }
  .rounded-2xl { border-radius: 1rem; }
  .rounded-full { border-radius: 9999px; }
  .rounded-md { border-radius: 0.375rem; }
  
  .p-8 { padding: 2rem; }
  .py-20 { padding-top: 5rem; padding-bottom: 5rem; }
  .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
  
  .mb-4 { margin-bottom: 1rem; }
  .mb-6 { margin-bottom: 1.5rem; }
  .mb-12 { margin-bottom: 3rem; }
  .mt-4 { margin-top: 1rem; }
  .mt-12 { margin-top: 3rem; }
  
  .text-center { text-align: center; }
  .text-left { text-align: left; }
  .text-4xl { font-size: 2.25rem; line-height: 2.5rem; font-weight: 700; }
  .text-3xl { font-size: 1.875rem; line-height: 2.25rem; font-weight: 700; }
  .text-2xl { font-size: 1.5rem; line-height: 2rem; font-weight: 600; }
  .text-xl { font-size: 1.25rem; line-height: 1.75rem; font-weight: 600; }
  .font-bold { font-weight: 700; }
  .text-gray-400 { color: #9ca3af; }

  body {
    background-color: var(--bg);
    margin: 0;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: var(--text);
    overflow-x: hidden;
  }
  
  .text-gradient {
    background: linear-gradient(to right, var(--accent), var(--primary));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  .bg-primary { background-color: var(--primary); }
  .text-primary { color: var(--primary); }
  .bg-gray-100 { background-color: #f3f4f6; }

  /* Scroll Progress Bar */
  .scroll-progress-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    z-index: 200;
    background: transparent;
  }
  
  .scroll-progress-bar {
    height: 100%;
    background: linear-gradient(to right, var(--accent), var(--primary));
    width: 0%;
    transition: width 0.1s ease-out;
  }

  /* Landing Page Styles */
  .landing-container {
    width: 100%;
    min-height: 100vh;
    background: var(--bg);
    display: flex;
    flex-direction: column;
  }
  
  .landing-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 48px;
    max-width: 1200px;
    margin: 0 auto;
    position: sticky;
    top: 0;
    background: rgba(0,0,0,0.8);
    backdrop-filter: blur(10px);
    z-index: 100;
    width: 100%;
    box-sizing: border-box;
  }
  
  .nav-links {
    display: flex;
    gap: 32px;
    align-items: center;
  }
  
  .nav-link {
    color: var(--text-sec);
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
    cursor: pointer;
  }
  .nav-link:hover { color: var(--text); }
  
  .btn-nav {
    background: white;
    color: black;
    padding: 10px 24px;
    border-radius: 99px;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: transform 0.2s;
  }
  .btn-nav:hover { transform: scale(1.05); }

  .hero-section {
    min-height: 80vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 0 20px;
    position: relative;
    overflow: hidden;
  }

  .hero-video-bg {
    position: absolute;
    top: -30%;
    left: 0;
    width: 100%;
    height: 150%;
    z-index: 0;
    pointer-events: none;
    will-change: transform;
    background: #000; /* Fallback */
  }

  .hero-video-bg video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.6;
    transition: opacity 1s ease-in;
  }
  
  .hero-loader {
    position: absolute;
    inset: 0;
    background: #000;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
    transition: opacity 0.5s ease-out;
  }

  .hero-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.95));
    z-index: 1;
  }
  
  .hero-slider-content {
    max-width: 800px;
    z-index: 2;
  }

  /* Text Animations */
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-enter {
    opacity: 0;
    animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  }

  .delay-100 { animation-delay: 0.1s; }
  .delay-200 { animation-delay: 0.3s; }
  .delay-300 { animation-delay: 0.5s; }
  
  .hero-title {
    font-size: 64px;
    font-weight: 800;
    line-height: 1.1;
    margin-bottom: 24px;
    letter-spacing: -0.02em;
    text-shadow: 0 4px 12px rgba(0,0,0,0.5);
  }
  
  .hero-desc {
    font-size: 20px;
    color: #ddd;
    margin-bottom: 40px;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
    text-shadow: 0 2px 4px rgba(0,0,0,0.5);
  }
  
  .hero-buttons {
    display: flex;
    gap: 16px;
    justify-content: center;
  }
  
  .btn-hero-primary {
    background: var(--primary);
    color: white;
    padding: 16px 40px;
    border-radius: 99px;
    font-size: 18px;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: background 0.2s;
    box-shadow: 0 4px 15px rgba(124, 58, 237, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 180px;
  }
  .btn-hero-primary:hover { background: var(--primary-hover); }
  .btn-hero-primary:disabled { opacity: 0.8; cursor: wait; }
  
  .btn-hero-sec {
    background: rgba(255,255,255,0.1);
    border: 2px solid rgba(255,255,255,0.4);
    color: white;
    padding: 16px 40px;
    border-radius: 99px;
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
    backdrop-filter: blur(4px);
    transition: all 0.2s;
  }
  .btn-hero-sec:hover { 
    border-color: white; 
    background: rgba(255,255,255,0.2);
  }

  /* Stats Grid */
  .section {
    padding: 100px 24px;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .bg-light-section {
    background-color: rgba(0,0,0,0.8);
    width: 100%;
    color: #fff;
  }
  
  .bg-light-section h2, 
  .bg-light-section h3 {
    color: #fff;
  }

  .bg-light-section p {
    color: #d4d4d8;
  }
  
  .grid-4 {
    display: flex;
    flex-direction: row;
    justify-content: center;
    gap: 24px;
    flex-wrap: wrap;
    align-items: stretch;
  }
  
  .stat-card {
    background: var(--card-bg);
    padding: 32px;
    border-radius: 24px;
    border: 1px solid #222;
    text-align: center;
    transition: transform 0.2s;
    flex: 1 1 200px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .stat-card:hover { transform: translateY(-5px); border-color: #333; }
  
  .stat-number {
    font-size: 48px;
    font-weight: 800;
    margin-bottom: 8px;
    color: var(--primary);
  }
  
  .stat-label {
    color: var(--text-sec);
    font-size: 16px;
    line-height: 1.5;
  }

  /* Why Onetalk */
  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 40px;
    margin-top: 60px;
  }
  
  .feature-item h3 {
    font-size: 24px;
    margin-bottom: 12px;
  }
  .feature-item p {
    color: var(--text-sec);
    line-height: 1.6;
  }

  /* Modal */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0,0,0,0.8);
    backdrop-filter: blur(5px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    animation: fadeIn 0.2s ease-out;
  }
  
  .modal-content {
    background: #111;
    border: 1px solid #333;
    padding: 32px;
    border-radius: 24px;
    max-width: 480px;
    width: 90%;
    position: relative;
    box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }
  
  .close-btn {
    position: absolute;
    top: 16px;
    right: 16px;
    color: var(--text-sec);
    cursor: pointer;
    background: transparent;
    border: none;
    padding: 8px;
  }
  .close-btn:hover { color: white; }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* Email Input in Modal */
  .email-input-group {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: 24px;
  }
  
  .email-input, .text-input, .textarea-input {
    width: 100%;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    padding: 16px 24px;
    border-radius: 12px;
    color: white;
    font-size: 16px;
    outline: none;
    transition: all 0.2s;
    box-sizing: border-box;
    font-family: inherit;
  }
  .email-input:focus, .text-input:focus, .textarea-input:focus { border-color: var(--primary); background: rgba(255,255,255,0.1); }
  .email-input.error, .text-input.error, .textarea-input.error { 
    border-color: var(--error);
    background: rgba(239, 68, 68, 0.1);
  }
  
  .textarea-input {
    min-height: 120px;
    resize: vertical;
  }
  
  .error-message {
    color: var(--error);
    font-size: 14px;
    margin-top: 8px;
    padding-left: 4px;
    animation: fadeIn 0.2s ease-out;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-5px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .animate-spin {
    animation: spin 1s linear infinite;
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: .5; }
  }
  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  /* FAQ */
  .faq-item {
    border-bottom: 1px solid #222;
    padding: 24px 0;
  }
  .faq-question {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 20px;
    font-weight: 600;
    cursor: pointer;
  }
  .faq-icon {
    transition: transform 0.4s cubic-bezier(0.645, 0.045, 0.355, 1);
  }
  .faq-icon.rotate {
    transform: rotate(180deg);
  }
  
  .faq-answer {
    max-height: 0;
    overflow: hidden;
    opacity: 0;
    transition: max-height 0.5s cubic-bezier(0.645, 0.045, 0.355, 1), 
                opacity 0.5s cubic-bezier(0.645, 0.045, 0.355, 1), 
                padding 0.5s cubic-bezier(0.645, 0.045, 0.355, 1);
    color: var(--text-sec);
    line-height: 1.6;
    padding-top: 0;
  }
  .faq-answer.open { 
    max-height: 300px; 
    opacity: 1; 
    padding-top: 16px;
  }

  /* Sponsors */
  .sponsors-track {
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    align-items: center;
    gap: 40px;
    flex-wrap: wrap;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
  }
  
  .sponsor-logo {
    height: 100px;
    width: auto;
    max-width: 160px;
    object-fit: contain;
    opacity: 0.6;
    transition: all 0.3s ease;
    filter: grayscale(100%);
    cursor: pointer;
  }
  .sponsor-logo:hover {
    opacity: 1;
    filter: grayscale(0%);
    transform: scale(1.1);
  }
  
  /* Back to Top Button */
  .back-to-top {
    position: fixed;
    bottom: 32px;
    right: 32px;
    background: var(--primary);
    color: white;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 150;
    opacity: 0;
    transform: translateY(20px);
    pointer-events: none;
  }
  
  .back-to-top.visible {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }
  .back-to-top:hover {
    background: var(--primary-hover);
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0,0,0,0.6);
  }
  
  .footer-links {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
    margin-top: 1rem;
  }

  /* Page Content Styles */
  .page-container {
    max-width: 900px;
    margin: 0 auto;
    padding: 40px 24px;
    min-height: 60vh;
  }
  
  .prose h1 { margin-bottom: 1.5rem; color: var(--primary); }
  .prose h2 { margin-top: 2.5rem; margin-bottom: 1rem; font-size: 1.5rem; font-weight: 700; color: white; }
  .prose p { margin-bottom: 1rem; line-height: 1.8; color: var(--text-sec); }
  .prose ul { margin-bottom: 1rem; padding-left: 1.5rem; color: var(--text-sec); }
  .prose li { margin-bottom: 0.5rem; list-style-type: disc; }
  
  @media (max-width: 768px) {
    .hero-title { font-size: 40px; }
    .landing-nav { padding: 20px; }
    .nav-links { display: none; }
    .grid-4 { grid-template-columns: 1fr; }
    .sponsors-track { gap: 24px; }
    .sponsor-logo { height: 36px; max-width: 120px; }
    .back-to-top { bottom: 20px; right: 20px; }
    
    .footer-links {
      flex-direction: column;
      gap: 1rem;
    }
  }
`;

// --- Mock Data ---
const FAQS = [
  { q: "What is Onetalk?", a: "Onetalk is a short-form video sharing platform designed to connect voices across the continent and diaspora." },
  { q: "How do I create a video?", a: "You can upload videos directly or use our AI-powered creation tool featuring Veo to generate videos from text prompts." },
  { q: "Is Onetalk free?", a: "Yes! Onetalk is free to use for all users. We believe in democratizing access to global storytelling." },
  { q: "Can I monetize my content?", a: "We are working on a partner program to help creators earn from their creativity. Stay tuned!" }
];

const HERO_SLIDES = [
    { title: "Connect with the World", subtitle: "Join the fastest growing video community." },
    { title: "1.5 Billion Voices", subtitle: "Smartphone users ready to share their stories." },
    { title: "Built for Speed", subtitle: "Optimized for all networks, everywhere." }
];

const FEATURES = [
    { title: "Blazing Fast", desc: "Our infrastructure is optimized for variable network conditions, ensuring your videos play smoothly anywhere.", Icon: Zap },
    { title: "Community First", desc: "Built to bridge the gap between continents. Discover stories that matter to you from people like you.", Icon: Globe },
    { title: "Create with AI", desc: "Generate stunning videos instantly using Veo, our integrated AI tool. Turn simple text prompts into high-quality short-form content.", Icon: PaletteIcon },
    { title: "Secure Messaging", desc: "Encrypted end-to-end message system.", Icon: Lock },
    { title: "Private Calls", desc: "Encrypted end-to-end call system.", Icon: Phone },
];

// --- Types ---
type View = 'home' | 'privacy' | 'terms' | 'admin' | 'thankyou';

// --- Sub-Components ---

const HomeView = ({ 
    scrollY, 
    videoLoaded, 
    setVideoLoaded, 
    currentSlide, 
    featuresLoaded, 
    openFaq, 
    setOpenFaq,
    setShowRegisterModal,
    scrollToSection
}) => {
    return (
        <>
            <header className="hero-section">
                <div 
                    className="hero-video-bg"
                    style={{ transform: `translateY(${scrollY * 0.3}px)` }}
                >
                    <div className="hero-loader" style={{ opacity: videoLoaded ? 0 : 1, pointerEvents: 'none' }}>
                        <Spinner />
                    </div>
                    <video 
                        autoPlay 
                        muted 
                        loop 
                        playsInline 
                        src={ASSETS.video.heroBackground}
                        onLoadedData={() => setVideoLoaded(true)}
                        style={{ opacity: videoLoaded ? 0.6 : 0 }}
                    />
                </div>
                
                <div className="hero-overlay"></div>
                
                <div className="hero-slider-content" key={currentSlide}>
                   <h1 className="hero-title text-gradient animate-enter delay-100">{HERO_SLIDES[currentSlide].title}</h1>
                   <p className="hero-desc animate-enter delay-200">{HERO_SLIDES[currentSlide].subtitle}</p>
                   <div className="hero-buttons animate-enter delay-300">
                       <button className="btn-hero-primary" onClick={() => setShowRegisterModal(true)}>Pre-register Now</button>
                       <button className="btn-hero-sec" onClick={() => scrollToSection('features')}>Learn More</button>
                   </div>
                </div>
                
                <div className="flex gap-2 mt-12 z-10">
                    {HERO_SLIDES.map((_, i) => (
                        <div key={i} className={`w-3 h-3 rounded-full transition-all duration-300 ${i === currentSlide ? 'bg-primary w-8' : 'bg-gray-600'}`} />
                    ))}
                </div>
            </header>

            <section className="section">
                <div className="grid-4">
                    <div className="stat-card">
                        <div className="stat-number">500M+</div><div className="stat-label">Projected Reach</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">1.5B</div><div className="stat-label">Smartphone Users in Target Markets</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">10x</div><div className="stat-label">Voices to Connect Across Continent & Diaspora</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">🚀</div><div className="stat-label">Speed and Scale Built for Our Networks</div>
                    </div>
                </div>
            </section>

            <section id="features" className="bg-light-section">
                <div className="section">
                    <h2 className="text-4xl font-bold text-center mb-12">Why choose Onetalk?</h2>
                    <div className="features-grid">
                        {FEATURES.map((feature, idx) => (
                            <div className="feature-item" key={idx}>
                                 <div className={`w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-4 text-2xl text-primary ${!featuresLoaded ? 'animate-pulse' : ''}`}>
                                    {featuresLoaded ? <feature.Icon className="w-5 h-5" /> : <div className="w-5 h-5 bg-gray-300 rounded-md" />}
                                 </div>
                                 <h3>{feature.title}</h3>
                                 <p>{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="faq" className="section">
                <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
                <div className="max-w-2xl mx-auto">
                    {FAQS.map((faq, i) => (
                        <div key={i} className="faq-item">
                            <div className="faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                                {faq.q}
                                <span className={`faq-icon ${openFaq === i ? 'rotate' : ''}`}>
                                    <ChevronDown />
                                </span>
                            </div>
                            <div className={`faq-answer ${openFaq === i ? 'open' : ''}`}>{faq.a}</div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="section text-center pb-20">
                <p className="text-gray-500 uppercase tracking-widest text-sm font-bold mb-8">Trusted by</p>
                <div className="sponsors-track">
                    <img src={ASSETS.sponsors.sunNewspaper} alt="Sun Newspaper" className="sponsor-logo" />
                    <img src={ASSETS.sponsors.telegraph} alt="The Telegraph" className="sponsor-logo" />
                    <img src={ASSETS.sponsors.sunFm} alt="Sun FM" className="sponsor-logo" />
                    <img src={ASSETS.sponsors.oukDynasty} alt="OUK Dynasty" className="sponsor-logo" />
                    <img src={ASSETS.sponsors.sportingSun} alt="Sporting Sun" className="sponsor-logo" />
                </div>
            </section>
        </>
    );
};

const PrivacyPolicy = () => (
    <div className="page-container prose">
        <h1 className="text-4xl font-bold">Privacy Policy</h1>
        <p>Last updated: October 26, 2025</p>
        
        <h2>1. Introduction</h2>
        <p>Welcome to Onetalk. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website or use our app and tell you about your privacy rights and how the law protects you.</p>
        
        <h2>2. Data We Collect</h2>
        <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:</p>
        <ul>
            <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier, and date of birth.</li>
            <li><strong>Contact Data</strong> includes email address and telephone number.</li>
            <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, and other technology on the devices you use to access this website.</li>
            <li><strong>Usage Data</strong> includes information about how you use our website, products and services.</li>
        </ul>

        <h2>3. How We Use Your Data</h2>
        <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
        <ul>
            <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
            <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
            <li>Where we need to comply with a legal or regulatory obligation.</li>
        </ul>

        <h2>4. Data Security</h2>
        <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed.</p>
        
        <h2>5. Contact Details</h2>
        <p>If you have any questions about this privacy policy or our privacy practices, please contact us via the contact page.</p>
    </div>
);

const TermsOfService = () => (
    <div className="page-container prose">
        <h1 className="text-4xl font-bold">Terms of Service</h1>
        <p>Last updated: October 26, 2025</p>

        <h2>1. Agreement to Terms</h2>
        <p>By accessing or using the Onetalk application and website, you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not access or use the Service.</p>

        <h2>2. Content Rights</h2>
        <p>You retain your rights to any content you submit, post or display on or through the Services. By submitting, posting or displaying Content on or through the Services, you grant us a worldwide, non-exclusive, royalty-free license to use, copy, reproduce, process, adapt, modify, publish, transmit, display and distribute such Content.</p>

        <h2>3. User Guidelines</h2>
        <p>You agree not to engage in any of the following prohibited activities:</p>
        <ul>
            <li>Copying, distributing, or disclosing any part of the Service in any medium.</li>
            <li>Using any automated system, including without limitation "robots," "spiders," "offline readers," etc., to access the Service.</li>
            <li>Attempting to interfere with, compromise the system integrity or security or decipher any transmissions to or from the servers running the Service.</li>
            <li>Uploading invalid data, viruses, worms, or other software agents through the Service.</li>
        </ul>

        <h2>4. Termination</h2>
        <p>We may terminate or suspend your access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>

        <h2>5. Changes to Terms</h2>
        <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.</p>
    </div>
);

const ThankYouPage = ({ userName, onNavigateHome }: { userName: string; onNavigateHome: () => void }) => (
    <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
    }}>
        <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '24px',
            padding: '60px 40px',
            maxWidth: '600px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
        }}>
            <div style={{
                width: '80px',
                height: '80px',
                background: '#10b981',
                borderRadius: '50%',
                margin: '0 auto 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            </div>
            <h1 style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                marginBottom: '16px',
                color: '#111'
            }}>Welcome to Onetalk{userName ? `, ${userName}` : ''}! 🎉</h1>
            <p style={{
                fontSize: '1.2rem',
                color: '#555',
                lineHeight: '1.8',
                marginBottom: '32px'
            }}>
                You've successfully joined our waitlist! We're excited to have you as part of our community.
                You'll be among the first to know when we launch.
            </p>
            <div style={{
                background: '#f3f4f6',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '32px',
                textAlign: 'left'
            }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '12px', color: '#111' }}>What's Next?</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    <li style={{ padding: '8px 0', color: '#555', display: 'flex', alignItems: 'start' }}>
                        <span style={{ marginRight: '8px' }}>✉️</span>
                        <span>Check your email for a confirmation message</span>
                    </li>
                    <li style={{ padding: '8px 0', color: '#555', display: 'flex', alignItems: 'start' }}>
                        <span style={{ marginRight: '8px' }}>🔔</span>
                        <span>We'll notify you when Onetalk launches</span>
                    </li>
                    <li style={{ padding: '8px 0', color: '#555', display: 'flex', alignItems: 'start' }}>
                        <span style={{ marginRight: '8px' }}>🚀</span>
                        <span>Get early access to exclusive features</span>
                    </li>
                </ul>
            </div>
            <button
                onClick={onNavigateHome}
                style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#fff',
                    border: 'none',
                    padding: '14px 32px',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
                Return to Home
            </button>
        </div>
    </div>
);

// --- Main App Component ---

function OnetalkApp() {
    const [view, setView] = useState<View>('home');
    const [currentSlide, setCurrentSlide] = useState(0);
    const [scrollY, setScrollY] = useState(0);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [openFaq, setOpenFaq] = useState<number|null>(null);
    const [showBackToTop, setShowBackToTop] = useState(false);
    
    // Modal & Registration State
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [registerForm, setRegisterForm] = useState({ fullName: "", email: "", password: "" });
    const [formErrors, setFormErrors] = useState({ fullName: "", email: "", password: "" });
    const [isRegistering, setIsRegistering] = useState(false);
    const [registrationAttempts, setRegistrationAttempts] = useState(0);
    const [lastAttemptTime, setLastAttemptTime] = useState(0);
    
    // Admin Authentication State
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
    const [adminLoginForm, setAdminLoginForm] = useState({ email: "", password: "" });
    const [adminError, setAdminError] = useState("");
    const [adminLoggingIn, setAdminLoggingIn] = useState(false);
    
    // Loading States
    const [videoLoaded, setVideoLoaded] = useState(false);
    const [featuresLoaded, setFeaturesLoaded] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length), 5000);
        return () => clearInterval(timer);
    }, []);

    // Check authentication state
    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user && view === 'admin') {
                setIsAdminAuthenticated(true);
            } else if (view === 'admin') {
                setIsAdminAuthenticated(false);
            }
        });
        return () => unsubscribe();
    }, [view]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setFeaturesLoaded(true);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            
            if (currentScrollY > 500) {
                setShowBackToTop(true);
            } else {
                setShowBackToTop(false);
            }
            
            if (currentScrollY < 1200) {
                setScrollY(currentScrollY);
            }
            
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (docHeight > 0) {
                const scrolled = (currentScrollY / docHeight) * 100;
                setScrollProgress(Math.min(scrolled, 100));
            }
        };
        
        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
        
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Navigation Helper
    const navigate = (newView: View) => {
        setView(newView);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Check URL on mount for admin route
    useEffect(() => {
        const path = window.location.pathname;
        if (path === '/admin') {
            setView('admin');
        }
    }, []);

    const scrollToSection = (id: string) => {
        if (view !== 'home') {
            navigate('home');
            // Allow render cycle to complete before scrolling
            setTimeout(() => {
                const element = document.getElementById(id);
                if (element) {
                    const headerOffset = 100;
                    const elementPosition = element.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.scrollY - headerOffset;
                    window.scrollTo({ top: offsetPosition, behavior: "smooth" });
                }
            }, 100);
            return;
        }

        const element = document.getElementById(id);
        if (element) {
            const headerOffset = 100;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.scrollY - headerOffset;
            window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        }
    };
    
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const validateEmail = (email) => {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (isRegistering) return;
        
        // Rate limiting: Max 5 attempts per 5 minutes
        const now = Date.now();
        if (registrationAttempts >= 5 && now - lastAttemptTime < 300000) {
            alert("Too many registration attempts. Please try again in a few minutes.");
            return;
        }
        
        if (now - lastAttemptTime > 300000) {
            setRegistrationAttempts(0);
        }
        
        // Validate and sanitize all fields
        const errors = { fullName: "", email: "", password: "" };
        let hasError = false;
        
        const sanitizedName = sanitizeInput(registerForm.fullName);
        const sanitizedEmail = sanitizeInput(registerForm.email);

        if (!sanitizedName || !isValidName(sanitizedName)) {
            errors.fullName = "Please enter a valid name (2-100 characters, letters only)";
            hasError = true;
        }

        if (!validateEmail(sanitizedEmail)) {
            errors.email = "Please enter a valid email address";
            hasError = true;
        }

        if (!isStrongPassword(registerForm.password)) {
            errors.password = "Password must be 8+ characters with uppercase, lowercase, and numbers";
            hasError = true;
        }

        setFormErrors(errors);
        if (hasError) return;
        
        setRegistrationAttempts(prev => prev + 1);
        setLastAttemptTime(now);

        setIsRegistering(true);

        try {
            const auth = getAuth();
            const sanitizedName = sanitizeInput(registerForm.fullName);
            const sanitizedEmail = sanitizeInput(registerForm.email).toLowerCase();
            
            // Create user with Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                sanitizedEmail,
                registerForm.password
            );

            // Update user profile with full name
            await updateProfile(userCredential.user, {
                displayName: sanitizedName
            });

            // Also save to waitlist collection for admin tracking
            if (db) {
                await addDoc(collection(db, "waitlist"), {
                    fullName: sanitizedName,
                    email: sanitizedEmail,
                    userId: userCredential.user.uid,
                    timestamp: serverTimestamp(),
                    createdAt: new Date().toISOString()
                });
                console.log("User registered and added to waitlist");
            }
            
            // Reset rate limiting on success
            setRegistrationAttempts(0);

            setIsRegistering(false);
            setRegisterForm({ fullName: "", email: "", password: "" });
            setShowRegisterModal(false);
            // Navigate to thank you page instead of showing alert
            navigate('thankyou');

        } catch (error: any) {
            console.error("Error registering:", error);
            setIsRegistering(false);
            
            // Handle Firebase Auth errors
            if (error.code === 'auth/email-already-in-use') {
                setFormErrors(prev => ({ ...prev, email: "This email is already registered" }));
                alert("This email is already registered. Please use a different email or try logging in.");
            } else if (error.code === 'auth/weak-password') {
                setFormErrors(prev => ({ ...prev, password: "Password is too weak" }));
            } else if (error.code === 'auth/invalid-email') {
                setFormErrors(prev => ({ ...prev, email: "Invalid email format" }));
            } else if (error.message?.includes('Missing or insufficient permissions')) {
                // Firestore permissions error - Auth succeeded but waitlist save failed
                // This is acceptable - user account is created
                setRegisterForm({ fullName: "", email: "", password: "" });
                setShowRegisterModal(false);
                alert(`Welcome ${registerForm.fullName}! Your account has been created successfully.`);
            } else {
                alert("Registration failed: " + (error.message || "Please try again"));
            }
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setRegisterForm(prev => ({ ...prev, [name]: value }));
        // Clear error for this field when user types
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const handleAdminLogin = async (e) => {
        e.preventDefault();
        if (adminLoggingIn) return;
        
        setAdminLoggingIn(true);
        setAdminError("");

        // Check if entered credentials match the admin credentials (from env vars)
        const sanitizedEmail = sanitizeInput(adminLoginForm.email).toLowerCase();
        if (sanitizedEmail !== ADMIN_EMAIL.toLowerCase() || adminLoginForm.password !== ADMIN_PASSWORD) {
            setAdminError("Invalid email or password");
            setAdminLoggingIn(false);
            return;
        }

        try {
            const auth = getAuth();
            await signInWithEmailAndPassword(
                auth,
                adminLoginForm.email,
                adminLoginForm.password
            );
            setIsAdminAuthenticated(true);
            setAdminLoginForm({ email: "", password: "" });
        } catch (error: any) {
            console.error("Admin login error:", error);
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                setAdminError("Invalid admin credentials");
            } else if (error.code === 'auth/invalid-email') {
                setAdminError("Invalid email format");
            } else {
                setAdminError("Login failed. Please try again.");
            }
        } finally {
            setAdminLoggingIn(false);
        }
    };

    const handleAdminLogout = async () => {
        try {
            const auth = getAuth();
            await signOut(auth);
            setIsAdminAuthenticated(false);
            setAdminLoginForm({ email: "", password: "" });
            navigate('home');
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    return (
        <div className="landing-container">
            <div className="scroll-progress-container">
                <div className="scroll-progress-bar" style={{ width: `${scrollProgress}%` }} />
            </div>

            <nav className="landing-nav">
                <div className="flex items-center cursor-pointer" onClick={() => navigate('home')}>
                     <img src={ASSETS.logo.landscape} alt="Onetalk" className="h-12 w-auto" />
                </div>
                <div className="nav-links">
                    <a onClick={() => scrollToSection('features')} className="nav-link">Why Onetalk</a>
                    <a onClick={() => scrollToSection('faq')} className="nav-link">FAQ</a>
                    <button className="btn-nav" onClick={() => setShowRegisterModal(true)}>Join Waitlist</button>
                </div>
            </nav>

            {/* View Routing */}
            {view === 'home' && (
                <HomeView 
                    scrollY={scrollY}
                    videoLoaded={videoLoaded}
                    setVideoLoaded={setVideoLoaded}
                    currentSlide={currentSlide}
                    featuresLoaded={featuresLoaded}
                    openFaq={openFaq}
                    setOpenFaq={setOpenFaq}
                    setShowRegisterModal={setShowRegisterModal}
                    scrollToSection={scrollToSection}
                />
            )}
            
            {view === 'privacy' && <PrivacyPolicy />}
            {view === 'terms' && <TermsOfService />}
            {view === 'thankyou' && (
                <ThankYouPage 
                    userName={registerForm.fullName.split(' ')[0]} 
                    onNavigateHome={() => navigate('home')} 
                />
            )}
            {view === 'admin' && (
                isAdminAuthenticated ? (
                    <AdminDashboard db={db} onLogout={handleAdminLogout} />
                ) : (
                    <div style={{ 
                        minHeight: "80vh", 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center",
                        background: "#000" 
                    }}>
                        <div style={{
                            background: "#111",
                            border: "1px solid #333",
                            borderRadius: "16px",
                            padding: "40px",
                            maxWidth: "400px",
                            width: "90%"
                        }}>
                            <h2 style={{ 
                                fontSize: "24px", 
                                fontWeight: "bold", 
                                marginBottom: "8px",
                                color: "#fff" 
                            }}>
                                Admin Login
                            </h2>
                            <p style={{ color: "#888", marginBottom: "24px" }}>
                                Sign in with your admin account to access the dashboard
                            </p>
                            <form onSubmit={handleAdminLogin}>
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={adminLoginForm.email}
                                    onChange={(e) => setAdminLoginForm(prev => ({ ...prev, email: e.target.value }))}
                                    style={{
                                        width: "100%",
                                        background: "rgba(255,255,255,0.05)",
                                        border: "1px solid rgba(255,255,255,0.1)",
                                        padding: "16px",
                                        borderRadius: "8px",
                                        color: "#fff",
                                        fontSize: "16px",
                                        marginBottom: "16px",
                                        boxSizing: "border-box"
                                    }}
                                />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={adminLoginForm.password}
                                    onChange={(e) => setAdminLoginForm(prev => ({ ...prev, password: e.target.value }))}
                                    style={{
                                        width: "100%",
                                        background: "rgba(255,255,255,0.05)",
                                        border: adminError ? "1px solid #ef4444" : "1px solid rgba(255,255,255,0.1)",
                                        padding: "16px",
                                        borderRadius: "8px",
                                        color: "#fff",
                                        fontSize: "16px",
                                        marginBottom: "16px",
                                        boxSizing: "border-box"
                                    }}
                                />
                                {adminError && (
                                    <p style={{ 
                                        color: "#ef4444", 
                                        fontSize: "14px", 
                                        marginBottom: "16px" 
                                    }}>
                                        {adminError}
                                    </p>
                                )}
                                <button
                                    type="submit"
                                    disabled={adminLoggingIn}
                                    style={{
                                        width: "100%",
                                        background: "#7C3AED",
                                        color: "#fff",
                                        padding: "16px",
                                        borderRadius: "8px",
                                        border: "none",
                                        cursor: adminLoggingIn ? "wait" : "pointer",
                                        fontWeight: "600",
                                        fontSize: "16px",
                                        opacity: adminLoggingIn ? 0.7 : 1
                                    }}
                                >
                                    {adminLoggingIn ? "Signing in..." : "Login"}
                                </button>
                            </form>
                            <button
                                onClick={() => navigate('home')}
                                style={{
                                    width: "100%",
                                    background: "transparent",
                                    color: "#888",
                                    padding: "12px",
                                    borderRadius: "8px",
                                    border: "none",
                                    cursor: "pointer",
                                    marginTop: "12px",
                                    fontSize: "14px"
                                }}
                            >
                                ← Back to Home
                            </button>
                        </div>
                    </div>
                )
            )}

            {view !== 'admin' && (
                <footer className="border-t border-gray-900 py-12 text-gray-500 mt-auto">
                    <div className="max-w-screen-xl mx-auto px-4 flex flex-col items-center justify-center text-center">
                        <p>© 2025 Onetalk Inc. All rights reserved.</p>
                        <div className="footer-links">
                            <a onClick={() => navigate('privacy')} className={`hover:text-white cursor-pointer ${view === 'privacy' ? 'text-white' : ''}`}>Privacy Policy</a>
                            <a onClick={() => navigate('terms')} className={`hover:text-white cursor-pointer ${view === 'terms' ? 'text-white' : ''}`}>Terms of Service</a>
                        </div>
                    </div>
                </footer>
            )}
            
            <button 
                className={`back-to-top ${showBackToTop ? 'visible' : ''}`} 
                onClick={scrollToTop}
                aria-label="Back to top"
            >
                <ArrowUp />
            </button>

            {/* Registration Modal */}
            {showRegisterModal && (
                <div className="modal-overlay" onClick={() => setShowRegisterModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <button className="close-btn" onClick={() => setShowRegisterModal(false)}>
                            <XIcon />
                        </button>
                        <h2 className="text-2xl font-bold mb-2 text-center">Create Your Account</h2>
                        <p className="text-gray-400 text-center mb-6">Be the first to experience Onetalk. Sign up for early access and exclusive creator rewards.</p>
                        
                        <form onSubmit={handleRegister} className="email-input-group">
                             <div>
                                 <input 
                                    type="text"
                                    name="fullName"
                                    placeholder="Full Name" 
                                    className={`email-input ${formErrors.fullName ? 'error' : ''}`}
                                    value={registerForm.fullName}
                                    onChange={handleFormChange}
                                    disabled={isRegistering}
                                 />
                                 {formErrors.fullName && <div className="error-message">{formErrors.fullName}</div>}
                             </div>
                             <div>
                                 <input 
                                    type="email"
                                    name="email"
                                    placeholder="Email Address" 
                                    className={`email-input ${formErrors.email ? 'error' : ''}`}
                                    value={registerForm.email}
                                    onChange={handleFormChange}
                                    disabled={isRegistering}
                                 />
                                 {formErrors.email && <div className="error-message">{formErrors.email}</div>}
                             </div>
                             <div>
                                 <input 
                                    type="password"
                                    name="password"
                                    placeholder="Password (min 6 characters)" 
                                    className={`email-input ${formErrors.password ? 'error' : ''}`}
                                    value={registerForm.password}
                                    onChange={handleFormChange}
                                    disabled={isRegistering}
                                 />
                                 {formErrors.password && <div className="error-message">{formErrors.password}</div>}
                             </div>
                             <button 
                                type="submit"
                                className="btn-hero-primary w-full" 
                                disabled={isRegistering}
                             >
                                 {isRegistering ? <Spinner /> : "Create Account"}
                             </button>
                         </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function App() {
    return (
        <>
            <style>{styles}</style>
            <OnetalkApp />
        </>
    );
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
