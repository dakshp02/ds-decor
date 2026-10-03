/* =====================================================
                DS DECOR PRODUCTS
===================================================== */

import {
    db
} from "../js/firebase.js";

import {
    supabase
} from "./supabase.js";

import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

import {
    observeAdmin,
    adminLogout
} from "./auth.js";


/* =====================================================
                DOM ELEMENTS
===================================================== */

const searchInput = document.getElementById(
    "searchInput"
);

const addProductButton = document.getElementById(
    "addProductBtn"
);

const logoutButton = document.getElementById(
    "logoutBtn"
);

const productModal = document.getElementById(
    "productModal"
);

const closeModalButton = document.getElementById(
    "closeModal"
);

const cancelButton = document.getElementById(
    "cancelBtn"
);

const productForm = document.getElementById(
    "productForm"
);

const modalTitle = document.getElementById(
    "modalTitle"
);

const saveProductButton = document.getElementById(
    "saveProductBtn"
);

const productsTableBody = document.getElementById(
    "productsTableBody"
);

const emptyState = document.getElementById(
    "emptyState"
);

const imagePreview = document.getElementById(
    "imagePreview"
);

const productImage = document.getElementById(
    "productImage"
);

const productName = document.getElementById(
    "productName"
);

const productCategory = document.getElementById(
    "productCategory"
);

const productPrice = document.getElementById(
    "productPrice"
);

const featuredProduct = document.getElementById(
    "featuredProduct"
);

const productDescription = document.getElementById(
    "productDescription"
);


/* =====================================================
                GLOBAL VARIABLES
===================================================== */

let products = [];

let selectedProductId = null;

let editMode = false;

let selectedImage = null;

/* =====================================================
                STORAGE HELPERS
===================================================== */

function getStoragePathFromUrl(imageUrl){

    if(!imageUrl){
        return null;
    }

    const marker = "/storage/v1/object/public/products/";

    const markerIndex = imageUrl.indexOf(marker);

    if(markerIndex === -1){
        return null;
    }

    return decodeURIComponent(
        imageUrl.substring(
            markerIndex + marker.length
        )
    );

}

/* =====================================================
                ADMIN AUTH
===================================================== */

observeAdmin(
    (user) => {

        if(!user){

            window.location.href = "login.html";

            return;

        }

        loadProducts();

    }
);


/* =====================================================
                LOGOUT
===================================================== */

logoutButton.addEventListener(
    "click",
    async () => {

        await adminLogout();

        window.location.href = "login.html";

    }
);


/* =====================================================
                LOAD PRODUCTS
===================================================== */

async function loadProducts(){

    try{

        const snapshot = await getDocs(
            collection(
                db,
                "products"
            )
        );

        products = [];

        snapshot.forEach(
            (document) => {

                products.push({

                    id: document.id,

                    ...document.data()

                });

            }
        );

        renderProducts(products);

    }
    catch(error){

        console.error(
            "Error loading products:",
            error
        );

    }

}


/* =====================================================
                RENDER PRODUCTS
===================================================== */

function renderProducts(productsList){

    productsTableBody.innerHTML = "";

    if(productsList.length === 0){

        emptyState.classList.remove(
            "hidden"
        );

        return;

    }

    emptyState.classList.add(
        "hidden"
    );

    productsList.forEach(
        (product) => {

            const row = document.createElement(
                "tr"
            );

            row.innerHTML = `

                <td>

                    <img
                        src="${product.image || '../assets/placeholder.png'}"
                        class="product-image"
                        alt="${product.name}"
                    >

                </td>

                <td>
                    ${product.name}
                </td>

                <td>
                    ${product.category}
                </td>

                <td>
                    ₹${Number(product.price).toLocaleString("en-IN")}
                </td>

                <td>

                    <span class="featured-badge ${product.featured ? "" : "not-featured"}">

                        ${product.featured ? "Yes" : "No"}

                    </span>

                </td>

                <td>

                    <div class="actions">

    <button
        class="edit-btn"
        data-id="${product.id}"
        type="button"
        aria-label="Edit product">

        <svg
            class="icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true">

            <path d="M12 20h9"></path>

            <path
                d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z">
            </path>

        </svg>

    </button>


    <button
        class="delete-btn"
        data-id="${product.id}"
        type="button"
        aria-label="Delete product">

        <svg
            class="icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true">

            <polyline points="3 6 5 6 21 6"></polyline>

            <path d="M19 6l-1 14H6L5 6"></path>

            <path d="M10 11v6"></path>

            <path d="M14 11v6"></path>

            <path d="M9 6V4h6v2"></path>

        </svg>

    </button>

</div>

                </td>

            `;

            productsTableBody.appendChild(row);

        }
    );

}


/* =====================================================
                EDIT PRODUCT
===================================================== */

productsTableBody.addEventListener(
    "click",
    (event) => {

        const editButton =
            event.target.closest(".edit-btn");

        if(!editButton){
            return;
        }

        const productId =
            editButton.dataset.id;

        const product =
            products.find(
                (item) => item.id === productId
            );

        if(!product){
            return;
        }

        editMode = true;

        selectedProductId = product.id;

        modalTitle.textContent = "Edit Product";

        saveProductButton.textContent =
            "Update Product";

        productName.value =
            product.name || "";

        productCategory.value =
            product.category || "";

        productPrice.value =
            product.price ?? "";

        featuredProduct.value =
            product.featured ? "true" : "false";

        productDescription.value =
            product.description || "";

        productImage.value = "";

        selectedImage = null;

        imagePreview.src =
            product.image ||
            "../assets/placeholder.png";

        productModal.classList.remove(
            "hidden"
        );

    }
);

/* =====================================================
                OPEN ADD PRODUCT MODAL
===================================================== */

addProductButton.addEventListener(
    "click",
    () => {

        editMode = false;

        selectedProductId = null;

        modalTitle.textContent = "Add Product";

        saveProductButton.textContent = "Save Product";

        productForm.reset();

        imagePreview.src =
            "../assets/placeholder.png";

        selectedImage = null;

        productModal.classList.remove(
            "hidden"
        );

    }
);

/* =====================================================
                DELETE PRODUCT
===================================================== */

productsTableBody.addEventListener(
    "click",
    async (event) => {

        const deleteButton =
            event.target.closest(".delete-btn");

        if(!deleteButton){
            return;
        }

        const productId =
            deleteButton.dataset.id;

        const product =
            products.find(
                (item) => item.id === productId
            );

        if(!product){
            return;
        }

        const confirmed =
            confirm(
                `Are you sure you want to delete "${product.name}"?`
            );

        if(!confirmed){
            return;
        }

        try{

            deleteButton.disabled = true;

            /* =====================================================
                        DELETE PRODUCT IMAGE
            ===================================================== */

            if(product.image){

                const imagePath =
                    getStoragePathFromUrl(
                        product.image
                    );

                if(imagePath){

                    const {
                        error: deleteImageError
                    } = await supabase.storage
                        .from("products")
                        .remove([
                            imagePath
                        ]);

                    if(deleteImageError){
                        console.warn(
                            "Product image could not be deleted:",
                            deleteImageError
                        );
                    }

                }

            }

            /* =====================================================
                        DELETE FIRESTORE PRODUCT
            ===================================================== */

            await deleteDoc(
                doc(
                    db,
                    "products",
                    productId
                )
            );

            alert(
                "Product deleted successfully."
            );

            /* =====================================================
                        RELOAD PRODUCTS
            ===================================================== */

            await loadProducts();

        }

        catch(error){

            console.error(
                "Error deleting product:",
                error
            );

            alert(
                "Unable to delete product. Please try again."
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

        productModal.classList.add(
            "hidden"
        );

    }
);


/* =====================================================
                CANCEL BUTTON
===================================================== */

cancelButton.addEventListener(
    "click",
    () => {

        productModal.classList.add(
            "hidden"
        );

    }
);


/* =====================================================
                CLOSE MODAL ON OUTSIDE CLICK
===================================================== */

window.addEventListener(
    "click",
    (event) => {

        if(event.target === productModal){

            productModal.classList.add(
                "hidden"
            );

        }

    }
);


/* =====================================================
                IMAGE PREVIEW
===================================================== */

productImage.addEventListener(
    "change",
    (event) => {

        const file = event.target.files[0];

        if(!file){

            return;

        }

        selectedImage = file;

        const reader = new FileReader();

        reader.onload = function(event){

            imagePreview.src =
                event.target.result;

        };

        reader.readAsDataURL(file);

    }
);


/* =====================================================
                SAVE PRODUCT
===================================================== */

productForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        const name =
            productName.value.trim();

        const category =
            productCategory.value.trim();

        const price =
            Number(productPrice.value);

        const featured =
            featuredProduct.value === "true";

        const description =
            productDescription.value.trim();

        if(!name || !category){
            alert(
                "Please enter product name and category."
            );
            return;
        }

        if(!Number.isFinite(price) || price < 0){
            alert(
                "Please enter a valid product price."
            );
            return;
        }

        try{

            saveProductButton.disabled = true;

            saveProductButton.textContent =
                editMode
                    ? "Updating..."
                    : "Saving...";

            /* =====================================================
                        FIND CURRENT PRODUCT
            ===================================================== */

            let currentProduct = null;

            if(editMode){

                currentProduct =
                    products.find(
                        (product) =>
                            product.id === selectedProductId
                    );

                if(!currentProduct){
                    throw new Error(
                        "Product not found."
                    );
                }

            }

            /* =====================================================
                        HANDLE PRODUCT IMAGE
            ===================================================== */

            let imageUrl =
                editMode
                    ? currentProduct.image || ""
                    : "";

            if(selectedImage){

                const fileExtension =
                    selectedImage.name
                        .split(".")
                        .pop()
                        .toLowerCase();

                const fileName =
                    `${crypto.randomUUID()}.${fileExtension}`;

                const filePath =
                    `products/${fileName}`;

                const {
                    error: uploadError
                } = await supabase.storage
                    .from("products")
                    .upload(
                        filePath,
                        selectedImage,
                        {
                            cacheControl: "3600",
                            upsert: false,
                            contentType:
                                selectedImage.type
                        }
                    );

                if(uploadError){
                    throw uploadError;
                }

                const {
                    data: publicUrlData
                } = supabase.storage
                    .from("products")
                    .getPublicUrl(
                        filePath
                    );

                imageUrl =
                    publicUrlData.publicUrl;

                /* =====================================================
                            DELETE OLD IMAGE
                ===================================================== */

                if(
                    editMode &&
                    currentProduct.image
                ){

                    const oldImagePath =
                        getStoragePathFromUrl(
                            currentProduct.image
                        );

                    if(oldImagePath){

                        const {
                            error: deleteError
                        } = await supabase.storage
                            .from("products")
                            .remove([
                                oldImagePath
                            ]);

                        if(deleteError){
                            console.warn(
                                "Old image could not be deleted:",
                                deleteError
                            );
                        }

                    }

                }

            }

            /* =====================================================
                        PRODUCT DATA
            ===================================================== */

            const productData = {

                name,

                category,

                price,

                featured,

                description,

                image: imageUrl,

                updatedAt:
                    serverTimestamp()

            };

            /* =====================================================
                        UPDATE PRODUCT
            ===================================================== */

            if(editMode){

                await updateDoc(
                    doc(
                        db,
                        "products",
                        selectedProductId
                    ),
                    productData
                );

                alert(
                    "Product updated successfully."
                );

            }

            /* =====================================================
                        ADD PRODUCT
            ===================================================== */

            else{

                productData.createdAt =
                    serverTimestamp();

                await addDoc(
                    collection(
                        db,
                        "products"
                    ),
                    productData
                );

                alert(
                    "Product added successfully."
                );

            }

            /* =====================================================
                        RESET FORM
            ===================================================== */

            productModal.classList.add(
                "hidden"
            );

            productForm.reset();

            imagePreview.src =
                "../assets/placeholder.png";

            selectedImage = null;

            selectedProductId = null;

            editMode = false;

            saveProductButton.textContent =
                "Save Product";

            /* =====================================================
                        RELOAD PRODUCTS
            ===================================================== */

            await loadProducts();

        }

        catch(error){

            console.error(
                "Error saving product:",
                error
            );

            alert(
                "Unable to save product. Please try again."
            );

        }

        finally{

            saveProductButton.disabled =
                false;

            saveProductButton.textContent =
                "Save Product";

        }

    }
);