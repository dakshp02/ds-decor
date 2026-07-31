/* =====================================================
                DS DECOR ADMIN AUTH
===================================================== */

import { auth } from "../js/firebase.js";

import {

    setPersistence,

    browserSessionPersistence,

    signInWithEmailAndPassword,

    signOut,

    onAuthStateChanged

} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";


/* =====================================================
                SESSION PERSISTENCE
===================================================== */

await setPersistence(

    auth,

    browserSessionPersistence

);


/* =====================================================
                LOGIN
===================================================== */

export function adminLogin(

    email,

    password

){

    return signInWithEmailAndPassword(

        auth,

        email,

        password

    );

}


/* =====================================================
                LOGOUT
===================================================== */

export function adminLogout(){

    return signOut(auth);

}


/* =====================================================
                AUTH OBSERVER
===================================================== */

export function observeAdmin(callback){

    return onAuthStateChanged(

        auth,

        callback

    );

}