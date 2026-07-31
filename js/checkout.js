import {
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

import { db } from "./firebase.js";

const checkoutItems = document.querySelector("#checkoutItems");
const subtotalElement = document.querySelector("#subtotal");
const totalElement = document.querySelector("#grandTotal");

let currentProduct = null;

initializeCheckout();

async function initializeCheckout() {

  const productId = getProductIdFromUrl();

  if (!productId) {

    renderEmptyState(
      "No product selected.",
      "Please go back and choose a product."
    );

    return;

  }

  try {

    currentProduct = await getProduct(productId);
    console.log(productId);
    console.log(currentProduct);

    if (!currentProduct) {

      renderEmptyState(
        "Product not found.",
        "The requested product does not exist."
      );

      return;

    }

    renderCheckoutProduct(currentProduct);
    

  } catch (error) {

    console.error(error);

    renderEmptyState(
      "Something went wrong.",
      "Unable to load product."
    );

  }

}

function getProductIdFromUrl() {

  const params = new URLSearchParams(window.location.search);

  return params.get("id");

}

async function getProduct(productId) {

  const reference = doc(db, "products", productId);

  const snapshot = await getDoc(reference);

  if (!snapshot.exists()) {

    return null;

  }
console.log(snapshot.data());
  return {

    productId: snapshot.id,

    ...snapshot.data()

  };

}

function renderCheckoutProduct(product) {
   console.log("Rendering:", product);

  console.log(product);

console.log(product.price);

const price = Number(product.price || 0);

console.log(price);

  checkoutItems.innerHTML = `

    <div class="checkout-item">

      <img
        src="${product.image}"
        alt="${escapeHtml(product.name)}">

      <div class="checkout-item-info">

        <h3>${escapeHtml(product.name)}</h3>

        <p>${escapeHtml(product.category || "Gift")}</p>

      </div>

      <div class="checkout-price">

        ₹${price.toLocaleString("en-IN")}

      </div>

    </div>

  `;

  subtotalElement.textContent = `₹${price.toLocaleString("en-IN")}`;

  totalElement.textContent = `₹${price.toLocaleString("en-IN")}`;

}

function renderEmptyState(title, message) {

  checkoutItems.innerHTML = `

    <div class="empty-cart">

      <i class="fa-solid fa-bag-shopping"></i>

      <h2>${escapeHtml(title)}</h2>

      <p>${escapeHtml(message)}</p>

      <a
        href="products.html"
        class="btn btn-primary">

        Browse Products

      </a>

    </div>

  `;

}

function escapeHtml(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}

const checkoutForm = document.querySelector("#checkoutForm");

checkoutForm.addEventListener("submit", submitOrder);

async function submitOrder(event) {

  event.preventDefault();

  if (!currentProduct) {

    alert("Product information is missing.");

    return;

  }

  const customer = {

    name: document.querySelector("#customerName").value.trim(),

    phone: document.querySelector("#customerPhone").value.trim(),

    email: document.querySelector("#customerEmail").value.trim()

  };

  const address = {

    line1: document.querySelector("#addressLine1").value.trim(),

    line2: document.querySelector("#addressLine2").value.trim(),

    city: document.querySelector("#city").value.trim(),

    state: document.querySelector("#state").value.trim(),

    pincode: document.querySelector("#pincode").value.trim(),

    instructions: document.querySelector("#instructions").value.trim()

  };

  const notes = document.querySelector("#orderNotes").value.trim();

  const deliveryDate = document.querySelector("#deliveryDate").value;

  if (

    !customer.name ||

    !customer.phone ||

    !address.line1 ||

    !address.city ||

    !address.state ||

    !address.pincode

  ) {

    alert("Please fill all required fields.");

    return;

  }

  const orderData = {

    customer,

    address,

    notes,

    deliveryDate,

    product: {

      id: currentProduct.productId,

      name: currentProduct.name,

      category: currentProduct.category,

      image: currentProduct.image,

      price: Number(currentProduct.price || 0)

    },

    orderStatus: "Pending",

    paymentStatus: "Pending",

    createdAt: serverTimestamp()

  };

  try {

    document.querySelector("#placeOrderBtn").disabled = true;

    document.querySelector("#placeOrderBtn").textContent = "Placing Order...";

    await saveOrder(orderData);

  } catch (error) {

    console.error(error);

    alert("Unable to place order. Please try again.");

    document.querySelector("#placeOrderBtn").disabled = false;

    document.querySelector("#placeOrderBtn").textContent = "Place Order";

  }

}
async function saveOrder(orderData) {

  const orderId = `DS-${Date.now()}`;

  orderData.orderId = orderId;

  await addDoc(

    collection(db, "orders"),

    orderData

  );

  checkoutForm.reset();

  window.location.href =
    `success.html?order=${encodeURIComponent(orderId)}`;

}

window.addEventListener("DOMContentLoaded", () => {

  const button = document.querySelector("#placeOrderBtn");

  if (button) {

    button.disabled = false;

  }

});

document.querySelectorAll("input, textarea").forEach((field) => {

  field.addEventListener("input", () => {

    field.classList.remove("input-error");

  });

});

function validatePhone(phone) {

  return /^[6-9]\d{9}$/.test(phone);

}

function validateEmail(email) {

  if (!email) {

    return true;

  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

}

checkoutForm.addEventListener("submit", (event) => {

  const phone = document.querySelector("#customerPhone").value.trim();

  const email = document.querySelector("#customerEmail").value.trim();

  if (!validatePhone(phone)) {

    event.preventDefault();

    alert("Please enter a valid 10-digit mobile number.");

    return;

  }

  if (!validateEmail(email)) {

    event.preventDefault();

    alert("Please enter a valid email address.");

    return;

  }

});

console.log("DS Decor Checkout Loaded");