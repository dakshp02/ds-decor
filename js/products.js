import {
  escapeHtml,
  getAvailableProducts,
  renderProductList,
  setupNavbar,
  showMessage,
} from "./catalog.js";

const productsGrid = document.querySelector("#productsGrid");
const categoryFilter = document.querySelector("#categoryFilter");
const productSearch = document.querySelector("#productSearch");
const productCount = document.querySelector("#productCount");
const clearFiltersButton = document.querySelector("#clearFiltersButton");

let allProducts = [];

setupNavbar();
loadProductsPage();

async function loadProductsPage() {
  try {
    allProducts = await getAvailableProducts();
    populateCategoryFilter(allProducts);
    applyInitialCategoryFromUrl();
    renderFilteredProducts();
    attachFilterEvents();
  } catch (error) {
    console.error("Error loading products:", error);
    updateProductCount("Unable to load products");
    showMessage(productsGrid, "Could not load products. Please check Firebase rules and try again.");
  }
}

function attachFilterEvents() {
  productSearch.addEventListener("input", renderFilteredProducts);
  categoryFilter.addEventListener("change", renderFilteredProducts);

  clearFiltersButton.addEventListener("click", () => {
    productSearch.value = "";
    categoryFilter.value = "all";
    renderFilteredProducts();
  });
}

function populateCategoryFilter(products) {
  const categories = [...new Set(products.map((product) => product.category).filter(Boolean))].sort();

  categoryFilter.innerHTML = `
    <option value="all">All Categories</option>
    ${categories
      .map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`)
      .join("")}
  `;
}

function applyInitialCategoryFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const category = params.get("category");

  if (!category) {
    return;
  }

  const matchingOption = [...categoryFilter.options].find((option) => option.value === category);

  if (matchingOption) {
    categoryFilter.value = category;
  }
}

function renderFilteredProducts() {
  const searchTerm = productSearch.value.trim().toLowerCase();
  const selectedCategory = categoryFilter.value;

  const filteredProducts = allProducts.filter((product) => {
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    const searchableText = [
      product.name,
      product.category,
      product.description,
    ]
      .join(" ")
      .toLowerCase();
    const matchesSearch = !searchTerm || searchableText.includes(searchTerm);

    return matchesCategory && matchesSearch;
  });

  updateProductCount(`${filteredProducts.length} product${filteredProducts.length === 1 ? "" : "s"} found`);
  renderProductList(
    productsGrid,
    filteredProducts,
    "No products match your search or category. Try clearing filters."
  );
}

function updateProductCount(message) {
  productCount.textContent = message;
}
