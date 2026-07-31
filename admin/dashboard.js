/* =====================================================
                DS DECOR ADMIN DASHBOARD
===================================================== */

import {

    observeAdmin,

    adminLogout

} from "./auth.js";
import {

    collection,

    getDocs

} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

import {

    db

} from "../js/firebase.js";


/* =====================================================
                DOM ELEMENTS
===================================================== */

const logoutButton = document.querySelector("#logoutBtn");
const totalOrdersElement = document.querySelector("#totalOrders");

const pendingOrdersElement = document.querySelector("#pendingOrders");

const completedOrdersElement = document.querySelector("#completedOrders");

const revenueElement = document.querySelector("#totalRevenue");


/* =====================================================
                INITIALIZE
===================================================== */

initialize();


/* =====================================================
                INITIALIZER
===================================================== */

async function initialize(){

    protectDashboard();

    registerEventListeners();

    await loadDashboardStats();

}

/* =====================================================
                EVENT LISTENERS
===================================================== */

function registerEventListeners(){

    logoutButton.addEventListener(

        "click",

        handleLogout

    );

}


/* =====================================================
                AUTH PROTECTION
===================================================== */

function protectDashboard(){

    observeAdmin(

        (user)=>{

            if(!user){

                window.location.replace(

                    "login.html"

                );

            }

        }

    );

}


/* =====================================================
                LOGOUT
===================================================== */

async function handleLogout(){

    try{

        await adminLogout();

        window.location.replace(

            "login.html"

        );

    }

    catch(error){

        console.error(error);

        alert(

            "Unable to logout."

        );

    }

}

/* =====================================================
                DASHBOARD STATISTICS
===================================================== */

async function loadDashboardStats(){

    try{

        const snapshot = await getDocs(

            collection(

                db,

                "orders"

            )

        );

        let totalOrders = 0;

        let pendingOrders = 0;

        let completedOrders = 0;

        let revenue = 0;

        snapshot.forEach(

            (document)=>{

                totalOrders++;

                const order = document.data();

                if(order.orderStatus==="Pending"){

                    pendingOrders++;

                }

                if(order.orderStatus==="Completed"){

                    completedOrders++;

                }

                revenue += Number(

                    order.product?.price || 0

                );

            }

        );

        totalOrdersElement.textContent = totalOrders;

        pendingOrdersElement.textContent = pendingOrders;

        completedOrdersElement.textContent = completedOrders;

        revenueElement.textContent =

            `₹${revenue.toLocaleString("en-IN")}`;

    }

    catch(error){

        console.error(error);

    }

}


console.log(

    "Dashboard Ready"

);