import {
  collection,
  getDocs,
  query,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { db } from "./firebase.js";

const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector("#navLinks");
const featuredProductGrid = document.querySelector("#featuredProductGrid");
const latestProductGrid = document.querySelector("#latestProductGrid");
const newsletterForm = document.querySelector(".newsletter-form");

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

if (newsletterForm) {
  newsletterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    newsletterForm.reset();
    alert("Thank you for subscribing to DS Decor updates.");
  });
}

async function loadHomeProducts() {
  if (!featuredProductGrid && !latestProductGrid) {
    return;
  }

  try {
    const products = await getAvailableProducts();
    const featuredProducts = products.filter((product) => product.featured).slice(0, 4);
    const latestProducts = sortByNewest(products).slice(0, 4);

    renderProductList(
      featuredProductGrid,
      featuredProducts.length ? featuredProducts : products.slice(0, 4),
      "No featured products found. Mark products with featured: true in Firestore."
    );

    renderProductList(
      latestProductGrid,
      latestProducts,
      "No products found. Add products in Firestore to show latest arrivals."
    );
  } catch (error) {
    console.error("Error loading home products:", error);
    showMessage(featuredProductGrid, "Could not load featured products. Check Firebase and Firestore rules.");
    showMessage(latestProductGrid, "Could not load latest products. Check Firebase and Firestore rules.");
  }
}

async function getAvailableProducts() {
  const productsQuery = query(collection(db, "products"));
  const querySnapshot = await getDocs(productsQuery);

  return querySnapshot.docs
    .map((documentSnapshot) => ({
      productId: documentSnapshot.id,
      ...documentSnapshot.data(),
    }))
    .filter((product) => product.available !== false);
}

function sortByNewest(products) {
  return [...products].sort((firstProduct, secondProduct) => {
    const firstDate = getDateValue(firstProduct.createdAt);
    const secondDate = getDateValue(secondProduct.createdAt);

    return secondDate - firstDate;
  });
}

function getDateValue(value) {
  if (!value) {
    return 0;
  }

  if (typeof value.toMillis === "function") {
    return value.toMillis();
  }

  return new Date(value).getTime() || 0;
}

function renderProductList(container, products, emptyMessage) {
  if (!container) {
    return;
  }

  if (!products.length) {
    showMessage(container, emptyMessage);
    return;
  }

  container.innerHTML = products.map(createProductCard).join("");
}

function createProductCard(product) {
  const productId = encodeURIComponent(product.productId || product.id || "");
  const productName = escapeHtml(product.name || "Untitled Gift");
  const productCategory = escapeHtml(product.category || "Customized Gift");
  const productDescription = escapeHtml(
    getShortDescription(product.description || "Beautifully customized gift from DS Decor.")
  );
  const productImage = escapeHtml(
    product.image || "https://placehold.co/900x700/f8f8f8/e91e63?text=DS+Decor"
  );
  const productPrice = Number(product.price || 0).toLocaleString("en-IN");

  return `
    <article class="product-card">
      <img
        class="product-image"
        src="${productImage}"
        alt="${productName}"
        loading="lazy"
      />
      <div class="product-card-body">
        <p class="product-category">${productCategory}</p>
        <h3 class="product-title">${productName}</h3>
        <p class="product-description">${productDescription}</p>
        <div class="product-footer">
          <span class="product-price">&#8377;${productPrice}</span>
          <div class="product-actions">
            <a class="btn btn-outline" href="product.html?id=${productId}">View Details</a>
            <a class="btn btn-primary" href="checkout.html?id=${productId}">Buy Now</a>
          </div>
        </div>
      </div>
    </article>
  `;
}

function getShortDescription(description) {
  if (description.length <= 95) {
    return description;
  }

  return `${description.slice(0, 92)}...`;
}

function showMessage(container, message) {
  if (!container) {
    return;
  }

  container.innerHTML = `<div class="message-box">${escapeHtml(message)}</div>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

loadHomeProducts();
