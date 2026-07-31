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

async function loadOrders() {

    try {

        const snapshot = await getDocs(

            collection(

                db,

                "orders"

            )

        );

        orders = [];

        snapshot.forEach((document) => {

            orders.push({

                id: document.id,

                ...document.data()

            });

        });
        console.log("Orders:", orders);
        console.log("Total Orders:", orders.length);

        renderOrders(orders);

    }

    catch (error) {

        console.error(

            "Error loading orders:",

            error

        );

    }

}

/* =====================================================
                RENDER ORDERS
===================================================== */

function renderOrders(ordersList) {

    ordersTableBody.innerHTML = "";

    if (ordersList.length === 0) {

        emptyState.classList.remove("hidden");

        return;

    }

    emptyState.classList.add("hidden");

    ordersList.forEach((order) => {

        const row = document.createElement("tr");

        row.innerHTML = `

            <td>${order.orderId || order.id}</td>

            <td>${order.customerName || "-"}</td>

            <td>${order.phone || "-"}</td>

            <td>₹${Number(order.product?.price || 0).toLocaleString("en-IN")}</td>

            <td>

                <span class="status-badge status-${(order.orderStatus || "Pending").toLowerCase()}">

                    ${order.orderStatus || "Pending"}

                </span>

            </td>

            <td>${order.deliveryDate || "-"}</td>

            <td>${order.orderDate || "-"}</td>

            <td>

                <button
                    class="manage-btn"
                    data-id="${order.id}">

                    <i class="fa-solid fa-eye"></i>

                    View Details

                </button>

            </td>

        `;

        ordersTableBody.appendChild(row);

    });

}
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

            <span>${order.customerName || "-"}</span>

        </div>

        <div class="order-detail">

            <label>Phone</label>

            <span>${order.phone || "-"}</span>

        </div>

        <div class="order-detail">

            <label>Email</label>

            <span>${order.email || "-"}</span>

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