import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, initializeFirestore, doc, collection, query, where, getDoc, getDocs, setDoc, updateDoc, onSnapshot, runTransaction } from 'firebase/firestore';
import qrcode from 'qrcode-generator';
window.FB = { initializeApp, getAuth, signInAnonymously, signInWithEmailAndPassword, onAuthStateChanged, signOut, getFirestore, initializeFirestore, doc, collection, query, where, getDoc, getDocs, setDoc, updateDoc, onSnapshot, runTransaction };
window.qrcode = qrcode;
