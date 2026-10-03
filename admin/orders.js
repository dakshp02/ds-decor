/* =====================================================
                DS DECOR ORDERS
===================================================== */

import {

    db

} from "../js/firebase.js";

import {

    collection,

    getDocs,

    doc,

    updateDoc,

    deleteDoc

} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

import {

    observeAdmin,

    adminLogout

} from "./auth.js";


/* =====================================================
                DOM ELEMENTS
===================================================== */

const ordersTableBody = document.getElementById(

    "ordersTableBody"

);

const searchInput = document.getElementById(

    "searchInput"

);

const statusFilter = document.getElementById(

    "statusFilter"

);

const refreshButton = document.getElementById(

    "refreshBtn"

);

const logoutButton = document.getElementById(

    "logoutBtn"

);

const modal = document.getElementById(

    "orderModal"

);

const closeModalButton = document.getElementById(

    "closeModal"

);

const orderDetails = document.getElementById(

    "orderDetails"

);

const updateStatus = document.getElementById(

    "updateStatus"

);

const updateOrderButton = document.getElementById(

    "updateOrderBtn"

);

const deleteOrderButton = document.getElementById(

    "deleteOrderBtn"

);

const emptyState = document.getElementById(

    "emptyState"

);


/* =====================================================
                GLOBAL VARIABLES
===================================================== */

let orders = [];

let selectedOrderId = null;

/* =====================================================
                LOAD ORDERS
===================================================== */

async function loadOrders(){

    try{

        ordersTableBody.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="loading-cell"
                >

                    <i class="fa-solid fa-spinner fa-spin"></i>

                    Loading Orders...

                </td>

            </tr>

        `;

        emptyState.classList.add("hidden");


        const snapshot = await getDocs(

            collection(

                db,

                "orders"

            )

        );


        orders = snapshot.docs.map(

            (document) => ({

                id: document.id,

                ...document.data()

            })

        );


        console.log(

            "Manage Orders - Firestore documents:",

            orders

        );


        console.log(

            "Manage Orders - Total:",

            orders.length

        );


        filterOrders();


    }

    catch(error){

        console.error(

            "Manage Orders - Firestore error:",

            error

        );


        orders = [];

        ordersTableBody.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="loading-cell"
                >

                    <i class="fa-solid fa-triangle-exclamation"></i>

                    Unable to load orders.

                </td>

            </tr>

        `;

    }

}


/* =====================================================
                    RENDER ORDERS
===================================================== */

function renderOrders(ordersList){

    ordersTableBody.innerHTML = "";

    if(!ordersList || ordersList.length === 0){

        emptyState.classList.remove("hidden");

        return;

    }

    emptyState.classList.add("hidden");


    ordersList.forEach((order) => {

        const row = document.createElement("tr");

        row.innerHTML = `

            <td>
                ${order.orderId || order.id}
            </td>

            <td>
                ${order.customer?.name || order.customerName || "-"}
            </td>

            <td>
            ${order.customer?.phone || order.phone || "-"}
            </td>

            <td>
                ₹${Number(
                    order.product?.price || order.totalAmount || 0
                ).toLocaleString("en-IN")}
            </td>

            <td>

                <span class="status-badge status-${(
                    order.orderStatus || "Pending"
                ).toLowerCase()}">

                    ${order.orderStatus || "Pending"}

                </span>

            </td>

            <td>
                ${order.deliveryDate || "-"}
            </td>

            <td>
                ${order.orderDate || "-"}
            </td>

            <td>

                <button
                    class="manage-btn"
                    data-id="${order.id}"
                >

                    <i class="fa-solid fa-eye"></i>

                    View Details

                </button>

            </td>

        `;

        ordersTableBody.appendChild(row);

    });

}

/* =====================================================
                FILTER ORDERS
===================================================== */

function filterOrders(){

    const searchTerm = searchInput.value
        .trim()
        .toLowerCase();

    const selectedStatus = statusFilter.value;

    const filteredOrders = orders.filter((order) => {

        const orderId = String(
            order.orderId || order.id || ""
        ).toLowerCase();

        const customerName = String(
            order.customerName || ""
        ).toLowerCase();

        const phone = String(
            order.phone || ""
        ).toLowerCase();

        const orderStatus = String(
            order.orderStatus || "Pending"
        );


        const matchesSearch =
            orderId.includes(searchTerm) ||
            customerName.includes(searchTerm) ||
            phone.includes(searchTerm);


        const matchesStatus =
            selectedStatus === "All" ||
            orderStatus === selectedStatus;


        return matchesSearch && matchesStatus;

    });


    renderOrders(filteredOrders);

}


/* =====================================================
                SEARCH ORDERS
===================================================== */

searchInput.addEventListener(

    "input",

    filterOrders

);


/* =====================================================
                STATUS FILTER
===================================================== */

statusFilter.addEventListener(

    "change",

    filterOrders

);


/* =====================================================
                REFRESH ORDERS
===================================================== */

refreshButton.addEventListener(

    "click",

    async () => {

        refreshButton.disabled = true;

        refreshButton.classList.add("loading");

        try {

            await loadOrders();

        }

        finally {

            refreshButton.disabled = false;

            refreshButton.classList.remove("loading");

        }

    }

);
/* =====================================================
                OPEN ORDER MODAL
===================================================== */

function openOrderModal(orderId) {

    const order = orders.find(

        (item) => item.id === orderId

    );

    if (!order) {

        return;

    }

    selectedOrderId = order.id;

    updateStatus.value = order.orderStatus || "Pending";

    orderDetails.innerHTML = `

        <div class="order-detail">

            <label>Order ID</label>

            <span>${order.orderId || order.id}</span>

        </div>

        <div class="order-detail">

            <label>Customer</label>

            <span>${order.customer?.name || order.customerName || "-"}</span>

        </div>

        <div class="order-detail">

            <label>Phone</label>

            <span>${order.customer?.phone || order.phone || "-"}</span>

        </div>

        <div class="order-detail">

            <label>Email</label>

            <span>${order.customer?.email || order.email || "-"}</span>

        </div>

        <div class="order-detail">

    <label>Address</label>

    <span>

        ${order.address?.line1 || ""}

        ${order.address?.line2 ? `<br>${order.address.line2}` : ""}

        <br>

        ${order.address?.city || ""},

        ${order.address?.state || ""}

        -

        ${order.address?.pincode || ""}

        ${order.address?.instructions
            ? `<br><strong>Instructions:</strong> ${order.address.instructions}`
            : ""
        }

    </span>

</div>

        <div class="order-detail">

            <label>Product</label>

            <span>${order.product?.name || "-"}</span>

        </div>

        <div class="order-detail">

            <label>Price</label>

            <span>₹${Number(order.product?.price || 0).toLocaleString("en-IN")}</span>

        </div>

        <div class="order-detail">

            <label>Delivery Date</label>

            <span>${order.deliveryDate || "-"}</span>

        </div>

    `;

    modal.classList.remove(

        "hidden"

    );

}
/* =====================================================
                UPDATE ORDER STATUS
===================================================== */

updateOrderButton.addEventListener(

    "click",

    async () => {

        if (!selectedOrderId) {

            return;

        }

        try {

            await updateDoc(

                doc(

                    db,

                    "orders",

                    selectedOrderId

                ),

                {

                    orderStatus: updateStatus.value

                }

            );

            const order = orders.find(

                item => item.id === selectedOrderId

            );

            if (order) {

                order.orderStatus = updateStatus.value;

            }

            renderOrders(orders);

            modal.classList.add(

                "hidden"

            );

            alert(

                "Order updated successfully."

            );

        }

        catch (error) {

            console.error(error);

            alert(

                "Failed to update order."

            );

        }

    }

);

/* =====================================================
                DELETE ORDER
===================================================== */

deleteOrderButton.addEventListener(

    "click",

    async () => {

        if (!selectedOrderId) {

            return;

        }

        const confirmed = confirm(

            "Are you sure you want to permanently delete this order?\n\nThis action cannot be undone."

        );

        if (!confirmed) {

            return;

        }

        try {

            await deleteDoc(

                doc(

                    db,

                    "orders",

                    selectedOrderId

                )

            );

            orders = orders.filter(

                order => order.id !== selectedOrderId

            );

            renderOrders(orders);

            modal.classList.add(

                "hidden"

            );

            selectedOrderId = null;

            alert(

                "Order deleted successfully."

            );

        }

        catch (error) {

            console.error(error);

            alert(

                "Failed to delete order."

            );

        }

    }

);
/* =====================================================
                CLOSE MODAL
===================================================== */

closeModalButton.addEventListener(

    "click",

    () => {

        modal.classList.add("hidden");

    }

);


/* =====================================================
                VIEW DETAILS
===================================================== */

ordersTableBody.addEventListener(

    "click",

    (event) => {

        const button = event.target.closest(".manage-btn");

        if (!button) return;

        openOrderModal(button.dataset.id);

    }

);


/* =====================================================
                AUTH CHECK
===================================================== */

observeAdmin((user) => {

    if (!user) {

        window.location.href = "login.html";

        return;

    }

    loadOrders();

});