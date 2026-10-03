import {
    doc,
    getDoc,
    collection,
    getDocs,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

import { db } from "./firebase.js";


/* =====================================================
                DOM ELEMENTS
===================================================== */

const checkoutItems =
    document.querySelector("#checkoutItems");

const subtotalElement =
    document.querySelector("#subtotal");

const totalElement =
    document.querySelector("#grandTotal");

const deliveryChargeElement =
    document.querySelector("#deliveryCharge");

const discountRow =
    document.querySelector("#discountRow");

const discountAmountElement =
    document.querySelector("#discountAmount");

const couponCodeInput =
    document.querySelector("#couponCode");

const applyCouponButton =
    document.querySelector("#applyCouponBtn");

const couponMessage =
    document.querySelector("#couponMessage");

const checkoutForm =
    document.querySelector("#checkoutForm");

const placeOrderButton =
    document.querySelector("#placeOrderBtn");

const termsAccepted =
    document.querySelector("#termsAccepted");


/* =====================================================
                STATE
===================================================== */

let currentProduct = null;

let subtotal = 0;

let appliedCoupon = null;

let discountAmount = 0;


/* =====================================================
                INITIALIZE CHECKOUT
===================================================== */

initializeCheckout();


async function initializeCheckout() {

    const productId =
        getProductIdFromUrl();


    if (!productId) {

        renderEmptyState(
            "No product selected.",
            "Please go back and choose a product."
        );

        return;

    }


    try {

        currentProduct =
            await getProduct(
                productId
            );


        if (!currentProduct) {

            renderEmptyState(
                "Product not found.",
                "The requested product does not exist."
            );

            return;

        }


        renderCheckoutProduct(
            currentProduct
        );


    } catch (error) {

        console.error(
            "Unable to initialize checkout:",
            error
        );


        renderEmptyState(
            "Something went wrong.",
            "Unable to load product."
        );

    }

}


/* =====================================================
                GET PRODUCT ID
===================================================== */

function getProductIdFromUrl() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    return params.get(
        "id"
    );

}


/* =====================================================
                GET PRODUCT
===================================================== */

async function getProduct(
    productId
) {

    const reference =
        doc(
            db,
            "products",
            productId
        );


    const snapshot =
        await getDoc(
            reference
        );


    if (!snapshot.exists()) {

        return null;

    }


    return {

        productId:
            snapshot.id,

        ...snapshot.data()

    };

}


/* =====================================================
                RENDER PRODUCT
===================================================== */

function renderCheckoutProduct(
    product
) {

    const price =
        Number(
            product.price || 0
        );


    subtotal =
        price;


    checkoutItems.innerHTML = `

        <div class="checkout-item">

            <img
                src="${escapeHtml(product.image || "")}"
                alt="${escapeHtml(product.name)}">

            <div class="checkout-item-info">

                <h3>
                    ${escapeHtml(product.name)}
                </h3>

                <p>
                    ${escapeHtml(
                        product.category || "Gift"
                    )}
                </p>

            </div>

            <div class="checkout-price">

                ₹${price.toLocaleString(
                    "en-IN"
                )}

            </div>

        </div>

    `;


    updateOrderSummary();

}


/* =====================================================
                UPDATE ORDER SUMMARY
===================================================== */

function updateOrderSummary() {

    const finalTotal =
        Math.max(
            0,
            subtotal - discountAmount
        );


    subtotalElement.textContent =
        formatCurrency(
            subtotal
        );


    discountAmountElement.textContent =
        `-${formatCurrency(
            discountAmount
        )}`;


    totalElement.textContent =
        formatCurrency(
            finalTotal
        );


    deliveryChargeElement.textContent =
        "FREE";


    if (discountAmount > 0) {

        discountRow.style.display =
            "flex";

    } else {

        discountRow.style.display =
            "none";

    }

}


/* =====================================================
                COUPON APPLY
===================================================== */

applyCouponButton.addEventListener(
    "click",
    applyCoupon
);


async function applyCoupon() {

    const code =
        couponCodeInput.value
            .trim()
            .toUpperCase();


    if (!code) {

        showCouponMessage(
            "Please enter a coupon code.",
            "error"
        );

        return;

    }


    if (!currentProduct) {

        showCouponMessage(
            "Product information is not available.",
            "error"
        );

        return;

    }


    try {

        applyCouponButton.disabled =
            true;

        applyCouponButton.textContent =
            "Checking...";


        const couponsSnapshot =
            await getDocs(
                collection(
                    db,
                    "coupons"
                )
            );


        let matchedCoupon = null;


        couponsSnapshot.forEach(
            (couponDocument) => {

                const coupon =
                    couponDocument.data();


                if (
                    String(
                        coupon.code || ""
                    ).toUpperCase() ===
                    code
                ) {

                    matchedCoupon = {

                        id:
                            couponDocument.id,

                        ...coupon

                    };

                }

            }
        );


        if (!matchedCoupon) {

            removeAppliedCoupon();

            showCouponMessage(
                "Invalid coupon code.",
                "error"
            );

            return;

        }


        const validation =
            validateCoupon(
                matchedCoupon
            );


        if (!validation.valid) {

            removeAppliedCoupon();

            showCouponMessage(
                validation.message,
                "error"
            );

            return;

        }


        const calculatedDiscount =
            calculateDiscount(
                matchedCoupon
            );


        if (
            calculatedDiscount <= 0
        ) {

            removeAppliedCoupon();

            showCouponMessage(
                "This coupon does not provide a discount for this order.",
                "error"
            );

            return;

        }


        appliedCoupon = {

            id:
                matchedCoupon.id,

            code:
                matchedCoupon.code,

            discountType:
                matchedCoupon.discountType,

            discountValue:
                Number(
                    matchedCoupon.discountValue || 0
                ),

            minimumOrder:
                Number(
                    matchedCoupon.minimumOrder || 0
                ),

            maximumDiscount:
                Number(
                    matchedCoupon.maximumDiscount || 0
                )

        };


        discountAmount =
            calculatedDiscount;


        updateOrderSummary();


        showCouponMessage(
            `${matchedCoupon.code} applied successfully. You saved ${formatCurrency(
                discountAmount
            )}.`,
            "success"
        );


        couponCodeInput.value =
            matchedCoupon.code;


    } catch (error) {

        console.error(
            "Unable to apply coupon:",
            error
        );


        showCouponMessage(
            "Unable to verify coupon. Please try again.",
            "error"
        );

    } finally {

        applyCouponButton.disabled =
            false;

        applyCouponButton.textContent =
            "Apply";

    }

}


/* =====================================================
                VALIDATE COUPON
===================================================== */

function validateCoupon(
    coupon
) {

    const today =
        getTodayDate();


    if (
        coupon.active === false
    ) {

        return {

            valid: false,

            message:
                "This coupon is currently inactive."

        };

    }


    if (
        coupon.startDate &&
        today < coupon.startDate
    ) {

        return {

            valid: false,

            message:
                "This coupon is not active yet."

        };

    }


    if (
        coupon.expiryDate &&
        today > coupon.expiryDate
    ) {

        return {

            valid: false,

            message:
                "This coupon has expired."

        };

    }


    const usageLimit =
        Number(
            coupon.usageLimit || 0
        );


    const usageCount =
        Number(
            coupon.usageCount || 0
        );


    if (
        usageLimit > 0 &&
        usageCount >= usageLimit
    ) {

        return {

            valid: false,

            message:
                "This coupon has reached its usage limit."

        };

    }


    const minimumOrder =
        Number(
            coupon.minimumOrder || 0
        );


    if (
        subtotal < minimumOrder
    ) {

        return {

            valid: false,

            message:
                `Minimum order value for this coupon is ${formatCurrency(
                    minimumOrder
                )}.`

        };

    }


    return {

        valid: true

    };

}


/* =====================================================
                CALCULATE DISCOUNT
===================================================== */

function calculateDiscount(
    coupon
) {

    const value =
        Number(
            coupon.discountValue || 0
        );


    let discount = 0;


    if (
        coupon.discountType ===
        "percentage"
    ) {

        discount =
            subtotal *
            (value / 100);


        const maximumDiscount =
            Number(
                coupon.maximumDiscount || 0
            );


        if (
            maximumDiscount > 0 &&
            discount > maximumDiscount
        ) {

            discount =
                maximumDiscount;

        }

    } else if (
        coupon.discountType ===
        "fixed"
    ) {

        discount =
            value;

    }


    return Math.min(
        Math.max(
            0,
            discount
        ),
        subtotal
    );

}


/* =====================================================
                REMOVE COUPON
===================================================== */

function removeAppliedCoupon() {

    appliedCoupon =
        null;


    discountAmount =
        0;


    updateOrderSummary();

}


/* =====================================================
                COUPON MESSAGE
===================================================== */

function showCouponMessage(
    message,
    type
) {

    couponMessage.textContent =
        message;


    couponMessage.className =
        `coupon-message ${type}`;

}


/* =====================================================
                CHECKOUT SUBMIT
===================================================== */

checkoutForm.addEventListener(
    "submit",
    submitOrder
);


async function submitOrder(
    event
) {

    event.preventDefault();


    /* =====================================================
                    TERMS CHECK
    ===================================================== */

    if (
        !termsAccepted.checked
    ) {

        alert(
            "Please accept the Terms & Conditions before placing your order."
        );


        termsAccepted.focus();

        return;

    }


    if (!currentProduct) {

        alert(
            "Product information is missing."
        );

        return;

    }


    /* =====================================================
                    CUSTOMER DATA
    ===================================================== */

    const customer = {

        name:
            document
                .querySelector("#customerName")
                .value
                .trim(),

        phone:
            document
                .querySelector("#customerPhone")
                .value
                .trim(),

        email:
            document
                .querySelector("#customerEmail")
                .value
                .trim()

    };


    /* =====================================================
                    ADDRESS DATA
    ===================================================== */

    const address = {

        line1:
            document
                .querySelector("#addressLine1")
                .value
                .trim(),

        line2:
            document
                .querySelector("#addressLine2")
                .value
                .trim(),

        city:
            document
                .querySelector("#city")
                .value
                .trim(),

        state:
            document
                .querySelector("#state")
                .value
                .trim(),

        pincode:
            document
                .querySelector("#pincode")
                .value
                .trim(),

        instructions:
            document
                .querySelector("#instructions")
                .value
                .trim()

    };


    const notes =
        document
            .querySelector("#orderNotes")
            .value
            .trim();


    const deliveryDate =
        document
            .querySelector("#deliveryDate")
            .value;


    /* =====================================================
                    VALIDATE CUSTOMER
    ===================================================== */

    if (
        !customer.name ||
        !customer.phone ||
        !address.line1 ||
        !address.city ||
        !address.state ||
        !address.pincode
    ) {

        alert(
            "Please fill all required fields."
        );

        return;

    }


    if (
        !validatePhone(
            customer.phone
        )
    ) {

        alert(
            "Please enter a valid 10-digit mobile number."
        );

        return;

    }


    if (
        !validateEmail(
            customer.email
        )
    ) {

        alert(
            "Please enter a valid email address."
        );

        return;

    }


    if (
        !/^\d{6}$/.test(
            address.pincode
        )
    ) {

        alert(
            "Please enter a valid 6-digit pincode."
        );

        return;

    }


    /* =====================================================
                    FINAL TOTAL
    ===================================================== */

    const finalTotal =
        Math.max(
            0,
            subtotal - discountAmount
        );


    /* =====================================================
                    ORDER DATA
    ===================================================== */

    const orderData = {

        customer,

        address,

        notes,

        deliveryDate,

        product: {

            id:
                currentProduct.productId,

            name:
                currentProduct.name,

            category:
                currentProduct.category,

            image:
                currentProduct.image,

            price:
                Number(
                    currentProduct.price || 0
                )

        },

        pricing: {

            subtotal:
                subtotal,

            discount:
                discountAmount,

            delivery:
                0,

            total:
                finalTotal

        },

        coupon:
            appliedCoupon
                ? {

                    id:
                        appliedCoupon.id,

                    code:
                        appliedCoupon.code,

                    discountType:
                        appliedCoupon.discountType,

                    discountValue:
                        appliedCoupon.discountValue,

                    discountAmount:
                        discountAmount

                }
                : null,

        orderStatus:
            "Pending",

        paymentStatus:
            "Pending",

        createdAt:
            serverTimestamp()

    };


    try {

        placeOrderButton.disabled =
            true;


        placeOrderButton.innerHTML =
            `<i class="fa-solid fa-spinner fa-spin"></i> Placing Order...`;


        await saveOrder(
            orderData
        );


    } catch (error) {

        console.error(
            "Unable to place order:",
            error
        );


        alert(
            "Unable to place order. Please try again."
        );


        placeOrderButton.disabled =
            false;


        placeOrderButton.innerHTML =
            `<i class="fa-solid fa-lock"></i> Place Order`;

    }

}


/* =====================================================
                SAVE ORDER
===================================================== */

async function saveOrder(
    orderData
) {

    const orderId =
        `DS-${Date.now()}`;


    orderData.orderId =
        orderId;


    await addDoc(

        collection(
            db,
            "orders"
        ),

        orderData

    );


    checkoutForm.reset();


    window.location.href =
        `success.html?order=${encodeURIComponent(
            orderId
        )}`;

}


/* =====================================================
                EMPTY STATE
===================================================== */

function renderEmptyState(
    title,
    message
) {

    checkoutItems.innerHTML = `

        <div class="empty-cart">

            <i class="fa-solid fa-bag-shopping"></i>

            <h2>
                ${escapeHtml(title)}
            </h2>

            <p>
                ${escapeHtml(message)}
            </p>

            <a
                href="products.html"
                class="btn btn-primary">

                Browse Products

            </a>

        </div>

    `;

}


/* =====================================================
                PHONE VALIDATION
===================================================== */

function validatePhone(
    phone
) {

    return /^[6-9]\d{9}$/.test(
        phone
    );

}


/* =====================================================
                EMAIL VALIDATION
===================================================== */

function validateEmail(
    email
) {

    if (!email) {

        return true;

    }


    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
    );

}


/* =====================================================
                TODAY DATE
===================================================== */

function getTodayDate() {

    const now =
        new Date();


    const year =
        now.getFullYear();


    const month =
        String(
            now.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            now.getDate()
        ).padStart(
            2,
            "0"
        );


    return `${year}-${month}-${day}`;

}


/* =====================================================
                CURRENCY FORMAT
===================================================== */

function formatCurrency(
    amount
) {

    return `₹${Number(
        amount
    ).toLocaleString(
        "en-IN"
    )}`;

}


/* =====================================================
                HTML ESCAPE
===================================================== */

function escapeHtml(
    value
) {

    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


/* =====================================================
                INPUT ERROR CLEANUP
===================================================== */

document
    .querySelectorAll(
        "input, textarea"
    )
    .forEach(
        (field) => {

            field.addEventListener(
                "input",
                () => {

                    field.classList.remove(
                        "input-error"
                    );

                }
            );

        }
    );


/* =====================================================
                ENABLE PLACE ORDER
===================================================== */

window.addEventListener(
    "DOMContentLoaded",
    () => {

        if (placeOrderButton) {

            placeOrderButton.disabled =
                false;

        }

    }
);


console.log(
    "DS Decor Checkout Loaded"
);