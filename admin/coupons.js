import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

import { db } from "../js/firebase.js";

import {
    observeAdmin,
    adminLogout
} from "./auth.js";


/* =====================================================
                DOM ELEMENTS
===================================================== */

const couponsTableBody =
    document.querySelector("#couponsTableBody");

const emptyState =
    document.querySelector("#emptyState");

const couponSearch =
    document.querySelector("#couponSearch");

const addCouponBtn =
    document.querySelector("#addCouponBtn");

const couponModal =
    document.querySelector("#couponModal");

const closeCouponModal =
    document.querySelector("#closeCouponModal");

const cancelCouponBtn =
    document.querySelector("#cancelCouponBtn");

const couponForm =
    document.querySelector("#couponForm");

const couponModalTitle =
    document.querySelector("#couponModalTitle");

const saveCouponBtn =
    document.querySelector("#saveCouponBtn");

const couponCode =
    document.querySelector("#couponCode");

const discountType =
    document.querySelector("#discountType");

const discountValue =
    document.querySelector("#discountValue");

const minimumOrder =
    document.querySelector("#minimumOrder");

const maximumDiscount =
    document.querySelector("#maximumDiscount");

const maximumDiscountGroup =
    document.querySelector("#maximumDiscountGroup");

const startDate =
    document.querySelector("#startDate");

const expiryDate =
    document.querySelector("#expiryDate");

const usageLimit =
    document.querySelector("#usageLimit");

const couponActive =
    document.querySelector("#couponActive");

const logoutBtn =
    document.querySelector("#logoutBtn");


/* =====================================================
                STATE
===================================================== */

let coupons = [];

let editingCouponId = null;


/* =====================================================
                ADMIN AUTHENTICATION
===================================================== */

observeAdmin(
    (user) => {

        if(!user){

            window.location.href = "login.html";

            return;

        }

        loadCoupons();

    }
);

/* =====================================================
                LOGOUT
===================================================== */

logoutBtn.addEventListener(
    "click",
    async () => {

        await adminLogout();

    }
);


/* =====================================================
                LOAD COUPONS
===================================================== */

async function loadCoupons() {

    try {

        couponsTableBody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    style="text-align:center; padding:40px;">

                    Loading coupons...

                </td>

            </tr>

        `;


        const snapshot =
            await getDocs(
                collection(
                    db,
                    "coupons"
                )
            );


        coupons =
            snapshot.docs.map(
                (couponDoc) => ({

                    id: couponDoc.id,

                    ...couponDoc.data()

                })
            );


        sortCoupons();

        filterCoupons();


    } catch (error) {

        console.error(
            "Unable to load coupons:",
            error
        );


        couponsTableBody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    style="text-align:center; padding:40px;">

                    Unable to load coupons.

                </td>

            </tr>

        `;

    }

}


/* =====================================================
                SORT COUPONS
===================================================== */

function sortCoupons() {

    coupons.sort(
        (a, b) => {

            const first =
                String(
                    a.code || ""
                );

            const second =
                String(
                    b.code || ""
                );

            return first.localeCompare(
                second
            );

        }
    );

}


/* =====================================================
                FILTER COUPONS
===================================================== */

function filterCoupons() {

    const searchTerm =
        couponSearch.value
            .trim()
            .toLowerCase();


    const filteredCoupons =
        coupons.filter(
            (coupon) => {

                const code =
                    String(
                        coupon.code || ""
                    ).toLowerCase();


                return code.includes(
                    searchTerm
                );

            }
        );


    renderCoupons(
        filteredCoupons
    );

}


/* =====================================================
                RENDER COUPONS
===================================================== */

function renderCoupons(
    couponList
) {

    couponsTableBody.innerHTML = "";


    if (!couponList.length) {

        emptyState.classList.remove(
            "hidden"
        );

        return;

    }


    emptyState.classList.add(
        "hidden"
    );


    couponList.forEach(
        (coupon) => {

            const row =
                document.createElement(
                    "tr"
                );


            const status =
                getCouponStatus(
                    coupon
                );


            const discount =
                formatDiscount(
                    coupon
                );


            const minimum =
                Number(
                    coupon.minimumOrder || 0
                );


            const usage =
                formatUsage(
                    coupon
                );


            row.innerHTML = `

                <td>

                    <span class="coupon-code">

                        ${escapeHtml(
                            coupon.code || "-"
                        )}

                    </span>

                </td>


                <td>

                    ${discount}

                </td>


                <td>

                    ₹${minimum.toLocaleString(
                        "en-IN"
                    )}

                </td>


                <td>

                    ${formatDate(
                        coupon.startDate
                    )}

                    &nbsp;–&nbsp;

                    ${formatDate(
                        coupon.expiryDate
                    )}

                </td>


                <td>

                    ${usage}

                </td>


                <td>

                    <span
                        class="coupon-status ${status.className}">

                        ${status.label}

                    </span>

                </td>


                <td>

                    <div class="coupon-actions">

                        <button
                            class="edit-coupon-btn"
                            type="button"
                            data-id="${coupon.id}"
                            aria-label="Edit coupon">

                            <svg
                                class="icon"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                aria-hidden="true">

                                <path
                                    d="M12 20h9">
                                </path>

                                <path
                                    d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z">
                                </path>

                            </svg>

                        </button>


                        <button
                            class="delete-coupon-btn"
                            type="button"
                            data-id="${coupon.id}"
                            aria-label="Delete coupon">

                            <svg
                                class="icon"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                aria-hidden="true">

                                <polyline
                                    points="3 6 5 6 21 6">
                                </polyline>

                                <path
                                    d="M19 6l-1 14H6L5 6">
                                </path>

                                <path
                                    d="M10 11v6">
                                </path>

                                <path
                                    d="M14 11v6">
                                </path>

                                <path
                                    d="M9 6V4h6v2">
                                </path>

                            </svg>

                        </button>

                    </div>

                </td>

            `;


            couponsTableBody.appendChild(
                row
            );

        }
    );

}


/* =====================================================
                COUPON STATUS
===================================================== */

function getCouponStatus(
    coupon
) {

    const today =
        getTodayDate();


    if (
        coupon.active === false
    ) {

        return {

            label: "Inactive",

            className: "inactive"

        };

    }


    if (
        coupon.expiryDate &&
        coupon.expiryDate < today
    ) {

        return {

            label: "Expired",

            className: "expired"

        };

    }


    if (
        coupon.startDate &&
        coupon.startDate > today
    ) {

        return {

            label: "Scheduled",

            className: "inactive"

        };

    }


    const limit =
        Number(
            coupon.usageLimit || 0
        );


    const used =
        Number(
            coupon.usageCount || 0
        );


    if (
        limit > 0 &&
        used >= limit
    ) {

        return {

            label: "Used Up",

            className: "expired"

        };

    }


    return {

        label: "Active",

        className: "active"

    };

}


/* =====================================================
                FORMAT DISCOUNT
===================================================== */

function formatDiscount(
    coupon
) {

    const value =
        Number(
            coupon.discountValue || 0
        );


    if (
        coupon.discountType ===
        "fixed"
    ) {

        return `₹${value.toLocaleString(
            "en-IN"
        )}`;

    }


    const maximum =
        Number(
            coupon.maximumDiscount || 0
        );


    if (maximum > 0) {

        return `${value}% <small>(Max ₹${maximum.toLocaleString(
            "en-IN"
        )})</small>`;

    }


    return `${value}%`;

}


/* =====================================================
                FORMAT USAGE
===================================================== */

function formatUsage(
    coupon
) {

    const used =
        Number(
            coupon.usageCount || 0
        );


    const limit =
        Number(
            coupon.usageLimit || 0
        );


    if (limit <= 0) {

        return `${used} / Unlimited`;

    }


    return `${used} / ${limit}`;

}


/* =====================================================
                FORMAT DATE
===================================================== */

function formatDate(
    value
) {

    if (!value) {

        return "-";

    }


    const date =
        new Date(
            `${value}T00:00:00`
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "-";

    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


/* =====================================================
                GET TODAY DATE
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
                ADD COUPON
===================================================== */

addCouponBtn.addEventListener(
    "click",
    () => {

        openAddCouponModal();

    }
);


function openAddCouponModal() {

    editingCouponId = null;


    couponModalTitle.textContent =
        "Add Coupon";


    saveCouponBtn.textContent =
        "Save Coupon";


    couponForm.reset();


    discountType.value =
        "percentage";


    minimumOrder.value =
        "0";


    maximumDiscount.value =
        "0";


    usageLimit.value =
        "0";


    couponActive.checked =
        true;


    updateMaximumDiscountVisibility();


    couponModal.classList.remove(
        "hidden"
    );


    couponModal.setAttribute(
        "aria-hidden",
        "false"
    );


    couponCode.focus();

}


/* =====================================================
                EDIT COUPON
===================================================== */

couponsTableBody.addEventListener(
    "click",
    (event) => {

        const editButton =
            event.target.closest(
                ".edit-coupon-btn"
            );


        if (!editButton) {

            return;

        }


        const couponId =
            editButton.dataset.id;


        openEditCouponModal(
            couponId
        );

    }
);


function openEditCouponModal(
    couponId
) {

    const coupon =
        coupons.find(
            (item) =>
                item.id === couponId
        );


    if (!coupon) {

        alert(
            "Coupon not found."
        );

        return;

    }


    editingCouponId =
        couponId;


    couponModalTitle.textContent =
        "Edit Coupon";


    saveCouponBtn.textContent =
        "Update Coupon";


    couponCode.value =
        coupon.code || "";


    discountType.value =
        coupon.discountType ||
        "percentage";


    discountValue.value =
        Number(
            coupon.discountValue || 0
        );


    minimumOrder.value =
        Number(
            coupon.minimumOrder || 0
        );


    maximumDiscount.value =
        Number(
            coupon.maximumDiscount || 0
        );


    startDate.value =
        coupon.startDate || "";


    expiryDate.value =
        coupon.expiryDate || "";


    usageLimit.value =
        Number(
            coupon.usageLimit || 0
        );


    couponActive.checked =
        coupon.active !== false;


    updateMaximumDiscountVisibility();


    couponModal.classList.remove(
        "hidden"
    );


    couponModal.setAttribute(
        "aria-hidden",
        "false"
    );


    couponCode.focus();

}


/* =====================================================
                DISCOUNT TYPE CHANGE
===================================================== */

discountType.addEventListener(
    "change",
    updateMaximumDiscountVisibility
);


function updateMaximumDiscountVisibility() {

    const isPercentage =
        discountType.value ===
        "percentage";


    if (isPercentage) {

        maximumDiscountGroup.style.display =
            "";


        maximumDiscount.disabled =
            false;

        return;

    }


    maximumDiscountGroup.style.display =
        "none";


    maximumDiscount.disabled =
        true;


    maximumDiscount.value =
        "0";

}


/* =====================================================
                SAVE COUPON
===================================================== */

couponForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const code =
            couponCode.value
                .trim()
                .toUpperCase();


        const type =
            discountType.value;


        const value =
            Number(
                discountValue.value
            );


        const minimum =
            Number(
                minimumOrder.value || 0
            );


        const maximum =
            Number(
                maximumDiscount.value || 0
            );


        const start =
            startDate.value;


        const expiry =
            expiryDate.value;


        const limit =
            Number(
                usageLimit.value || 0
            );


        const active =
            couponActive.checked;


        /* =====================================================
                        VALIDATE CODE
        ===================================================== */

        if (
            !/^[A-Z0-9]+$/.test(
                code
            )
        ) {

            alert(
                "Coupon code can contain only letters and numbers."
            );

            couponCode.focus();

            return;

        }


        /* =====================================================
                        VALIDATE DISCOUNT
        ===================================================== */

        if (
            !Number.isFinite(value) ||
            value <= 0
        ) {

            alert(
                "Please enter a valid discount value."
            );

            discountValue.focus();

            return;

        }


        if (
            type === "percentage" &&
            value > 100
        ) {

            alert(
                "Percentage discount cannot exceed 100%."
            );

            discountValue.focus();

            return;

        }


        if (
            minimum < 0 ||
            maximum < 0 ||
            limit < 0
        ) {

            alert(
                "Values cannot be negative."
            );

            return;

        }


        /* =====================================================
                        VALIDATE DATES
        ===================================================== */

        if (!start || !expiry) {

            alert(
                "Please select both start and expiry dates."
            );

            return;

        }


        if (expiry < start) {

            alert(
                "Expiry date cannot be before the start date."
            );

            expiryDate.focus();

            return;

        }


        /* =====================================================
                        CHECK DUPLICATE CODE
        ===================================================== */

        const duplicate =
            coupons.find(
                (coupon) => {

                    const sameCode =
                        String(
                            coupon.code || ""
                        ).toUpperCase() ===
                        code;


                    return (
                        sameCode &&
                        coupon.id !==
                            editingCouponId
                    );

                }
            );


        if (duplicate) {

            alert(
                "A coupon with this code already exists."
            );

            couponCode.focus();

            return;

        }


        /* =====================================================
                        SAVE DATA
        ===================================================== */

        const couponData = {

            code,

            discountType:
                type,

            discountValue:
                value,

            minimumOrder:
                minimum,

            maximumDiscount:
                type === "percentage"
                    ? maximum
                    : 0,

            startDate:
                start,

            expiryDate:
                expiry,

            usageLimit:
                limit,

            active,

            updatedAt:
                serverTimestamp()

        };


        try {

            saveCouponBtn.disabled =
                true;


            saveCouponBtn.textContent =
                editingCouponId
                    ? "Updating..."
                    : "Saving...";


            if (editingCouponId) {

                await updateDoc(

                    doc(
                        db,
                        "coupons",
                        editingCouponId
                    ),

                    couponData

                );

            } else {

                couponData.usageCount =
                    0;


                couponData.createdAt =
                    serverTimestamp();


                await addDoc(

                    collection(
                        db,
                        "coupons"
                    ),

                    couponData

                );

            }


            closeModal();


            await loadCoupons();


        } catch (error) {

            console.error(
                "Unable to save coupon:",
                error
            );


            alert(
                "Unable to save coupon. Please try again."
            );

        } finally {

            saveCouponBtn.disabled =
                false;

            saveCouponBtn.textContent =
                editingCouponId
                    ? "Update Coupon"
                    : "Save Coupon";

        }

    }
);


/* =====================================================
                DELETE COUPON
===================================================== */

couponsTableBody.addEventListener(
    "click",
    async (event) => {

        const deleteButton =
            event.target.closest(
                ".delete-coupon-btn"
            );


        if (!deleteButton) {

            return;

        }


        const couponId =
            deleteButton.dataset.id;


        const coupon =
            coupons.find(
                (item) =>
                    item.id === couponId
            );


        if (!coupon) {

            return;

        }


        const confirmed =
            confirm(
                `Delete coupon "${coupon.code}"?`
            );


        if (!confirmed) {

            return;

        }


        try {

            deleteButton.disabled =
                true;


            await deleteDoc(

                doc(
                    db,
                    "coupons",
                    couponId
                )

            );


            await loadCoupons();


        } catch (error) {

            console.error(
                "Unable to delete coupon:",
                error
            );


            alert(
                "Unable to delete coupon. Please try again."
            );


            deleteButton.disabled =
                false;

        }

    }
);


/* =====================================================
                CLOSE MODAL
===================================================== */

closeCouponModal.addEventListener(
    "click",
    closeModal
);


cancelCouponBtn.addEventListener(
    "click",
    closeModal
);


function closeModal() {

    couponModal.classList.add(
        "hidden"
    );


    couponModal.setAttribute(
        "aria-hidden",
        "true"
    );


    editingCouponId =
        null;

}


/* =====================================================
                CLOSE ON OUTSIDE CLICK
===================================================== */

window.addEventListener(
    "click",
    (event) => {

        if (
            event.target ===
            couponModal
        ) {

            closeModal();

        }

    }
);


/* =====================================================
                ESCAPE KEY
===================================================== */

window.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Escape" &&
            !couponModal.classList.contains(
                "hidden"
            )
        ) {

            closeModal();

        }

    }
);


/* =====================================================
                SEARCH
===================================================== */

couponSearch.addEventListener(
    "input",
    filterCoupons
);


/* =====================================================
                HTML ESCAPE
===================================================== */

function escapeHtml(value) {

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
                LOAD PAGE
===================================================== */

console.log(
    "DS Decor Coupons Loaded"
);