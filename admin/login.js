/* =====================================================
                DS DECOR ADMIN LOGIN
===================================================== */

import {

    adminLogin,

    observeAdmin

} from "./auth.js";


/* =====================================================
                DOM ELEMENTS
===================================================== */

const loginForm = document.querySelector("#loginForm");

const emailInput = document.querySelector("#email");

const passwordInput = document.querySelector("#password");

const loginButton = document.querySelector("#loginBtn");

const loginButtonText = document.querySelector("#loginBtnText");

const errorMessage = document.querySelector("#errorMessage");

const togglePasswordButton = document.querySelector("#togglePassword");

const togglePasswordIcon = document.querySelector("#toggleIcon");


/* =====================================================
                INITIALIZE
===================================================== */

initialize();


/* =====================================================
                INITIALIZER
===================================================== */

function initialize(){

    registerEventListeners();

}


/* =====================================================
                EVENT LISTENERS
===================================================== */

function registerEventListeners(){

    loginForm.addEventListener(

        "submit",

        handleLogin

    );

    togglePasswordButton.addEventListener(

        "click",

        togglePasswordVisibility

    );

}


/* =====================================================
                PLACEHOLDERS
                (Phase 2)
===================================================== */

/* =====================================================
                HANDLE LOGIN
===================================================== */

async function handleLogin(event){

    event.preventDefault();

    clearError();

    const email = emailInput.value.trim();

    const password = passwordInput.value;

    if(!email || !password){

        showError(

            "Please enter your email and password."

        );

        return;

    }

    try{

        setLoading(true);

        await adminLogin(

            email,

            password

        );

    }

    catch(error){

        console.error(error);

        switch(error.code){

            case "auth/invalid-credential":

            case "auth/wrong-password":

            case "auth/user-not-found":

                showError(

                    "Invalid email or password."

                );

                break;

            case "auth/too-many-requests":

                showError(

                    "Too many attempts. Please try again later."

                );

                break;

            default:

                showError(

                    "Unable to login. Please try again."

                );

        }

    }

    finally{

        setLoading(false);

    }

}


/* =====================================================
                LOADING STATE
===================================================== */

function setLoading(isLoading){

    loginButton.disabled = isLoading;

    loginButtonText.textContent =

        isLoading

        ? "Signing In..."

        : "Login";

}


/* =====================================================
                ERROR MESSAGE
===================================================== */

function showError(message){

    errorMessage.textContent = message;

}


function clearError(){

    errorMessage.textContent = "";

}


/* =====================================================
            PASSWORD TOGGLE
        (Phase 3)
===================================================== */

/* =====================================================
                PASSWORD TOGGLE
===================================================== */

function togglePasswordVisibility(){

    const isPassword =

        passwordInput.type === "password";

    passwordInput.type =

        isPassword

        ? "text"

        : "password";

    togglePasswordIcon.className =

        isPassword

        ? "fa-regular fa-eye-slash"

        : "fa-regular fa-eye";

}


/* =====================================================
                AUTH STATE
===================================================== */

observeAdmin(

    (user)=>{

        if(user){

            window.location.href =

                "dashboard.html";

        }

    }

);
console.log(

    "DS Decor Admin Login Ready"

);
/* =====================================================
                INPUT EVENTS
===================================================== */

emailInput.addEventListener(

    "input",

    clearError

);

passwordInput.addEventListener(

    "input",

    clearError

);


/* =====================================================
                ENTER KEY
===================================================== */

passwordInput.addEventListener(

    "keydown",

    (event)=>{

        if(event.key==="Enter"){

            loginForm.requestSubmit();

        }

    }

);


/* =====================================================
                WINDOW FOCUS
===================================================== */

window.addEventListener(

    "focus",

    ()=>{

        clearError();

    }

);

