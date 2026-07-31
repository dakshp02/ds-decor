import {
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { db } from "./firebase.js";
import {
  escapeHtml,
  formatPrice,
  getAvailableProducts,
  renderProductList,
  setupNavbar,
  showMessage,
} from "./catalog.js";

const productDetail = document.querySelector("#productDetail");
const relatedProductsGrid = document.querySelector("#relatedProductsGrid");

setupNavbar();
loadProductDetailsPage();

async function loadProductDetailsPage() {
  const productId = getProductIdFromUrl();

  if (!productId) {
    renderInvalidProductState("No product ID was provided. Please choose a product from the Products page.");
    return;
  }

  try {
    const product = await getProductById(productId);

    if (!product) {
      renderInvalidProductState("This product could not be found. It may have been removed.");
      return;
    }

    renderProductDetail(product);
    await renderRelatedProducts(product);
  } catch (error) {
    console.error("Error loading product details:", error);
    renderInvalidProductState("Could not load this product. Please check Firebase rules and try again.");
  }
}

function getProductIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

async function getProductById(productId) {
  const productReference = doc(db, "products", productId);
  const productSnapshot = await getDoc(productReference);

  if (!productSnapshot.exists()) {
    return null;
  }

  return {
    productId: productSnapshot.id,
    ...productSnapshot.data(),
  };
}

function renderProductDetail(product) {
  const productName = escapeHtml(product.name || "Untitled Gift");
  const productCategory = escapeHtml(product.category || "Customized Gift");
  const productDescription = escapeHtml(
    product.description || "Beautifully customized gift from DS Decor."
  );
  const productImage = escapeHtml(
    product.image || "https://placehold.co/1000x900/f8f8f8/e91e63?text=DS+Decor"
  );
  const availabilityText = product.available === false ? "Currently unavailable" : "Available";
  const availabilityClass = product.available === false ? "badge-muted" : "badge-success";
  const productId = encodeURIComponent(product.productId);

  document.title = `${product.name || "Product"} | DS Decor`;

  productDetail.innerHTML = `
    <article class="product-detail-grid">
      <div class="product-detail-image-wrap">
        <img
          class="product-detail-image"
          src="${productImage}"
          alt="${productName}"
          loading="lazy"
        />
      </div>
      <div class="product-detail-content">
        <p class="eyebrow">${productCategory}</p>
        <h1>${productName}</h1>
        <p class="detail-description">${productDescription}</p>
        <div class="detail-meta">
          <span class="detail-price">${formatPrice(product.price)}</span>
          <span class="status-badge ${availabilityClass}">${availabilityText}</span>
        </div>
        <div class="detail-actions">
          <a class="btn btn-primary" href="checkout.html?id=${productId}">Buy Now</a>
          <a class="btn btn-outline" href="products.html">Back to Products</a>
        </div>
        <div class="detail-note">
          <strong>Need customization?</strong>
          <p>Product notes, custom names, photos, and message fields will be handled during checkout in the next milestone.</p>
        </div>
      </div>
    </article>
  `;
}

async function renderRelatedProducts(currentProduct) {
  const products = await getAvailableProducts();
  const relatedProducts = products
    .filter((product) => {
      return (
        product.productId !== currentProduct.productId &&
        product.category === currentProduct.category
      );
    })
    .slice(0, 3);

  renderProductList(
    relatedProductsGrid,
    relatedProducts,
    "No related products found in this category yet."
  );
}

function renderInvalidProductState(message) {
  productDetail.innerHTML = `
    <div class="message-box detail-message">
      <h1>Product not available</h1>
      <p>${escapeHtml(message)}</p>
      <a class="btn btn-primary" href="products.html">Browse Products</a>
    </div>
  `;

  showMessage(relatedProductsGrid, "Choose a product to see related recommendations.");
}
