// مفتاح العبور السري للوحة الأدمن (تقدر تغيره لأي باسورد يعجبك)
const ADMIN_PASSWORD = "1234";

// عند تحميل الصفحة، نشغل الفانكشن المناسبة حسب الصفحة الحالية
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("properties-grid")) {
        // نحن في الصفحة الرئيسية للعملاء
        displayPropertiesForClients();
    }
    if (document.getElementById("admin-dashboard")) {
        // نحن في لوحة التحكم، نتأكد من حالة تسجيل الدخول
        checkLoginStatus();
    }
});

/* ==========================================
   1. نظام صلاحيات ودخول الأدمن
   ========================================== */
function checkAdminPassword() {
    const passwordInput = document.getElementById("admin-password").value;
    const errorMsg = document.getElementById("login-error");

    if (passwordInput === ADMIN_PASSWORD) {
        sessionStorage.setItem("isAdminLoggedIn", "true");
        errorMsg.innerText = "";
        showDashboard();
    } else {
        errorMsg.innerText = "مفتاح العبور غير صحيح! حاول مجدداً.";
    }
}

function checkLoginStatus() {
    if (sessionStorage.getItem("isAdminLoggedIn") === "true") {
        showDashboard();
    } else {
        hideDashboard();
    }
}

function showDashboard() {
    document.getElementById("admin-login-overlay").classList.add("hidden");
    document.getElementById("admin-dashboard").classList.remove("hidden");
    displayPropertiesInAdmin();
}

function logoutAdmin() {
    sessionStorage.removeItem("isAdminLoggedIn");
    window.location.reload();
}

function hideDashboard() {
    document.getElementById("admin-login-overlay").classList.remove("hidden");
    document.getElementById("admin-dashboard").classList.add("hidden");
}


/* ==========================================
   2. معالجة ورفع الصور يدوياً (Base64)
   ========================================== */
let uploadedImageBase64 = "";

function previewImage(event) {
    const file = event.target.files[0];
    const preview = document.getElementById("image-preview");
    const statusText = document.getElementById("upload-status");

    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            uploadedImageBase64 = e.target.result; // تحويل الصورة لكود نصي للحفظ
            preview.src = uploadedImageBase64;
            preview.classList.remove("hidden");
            statusText.innerText = `تم اختيار: ${file.name}`;
        }
        reader.readAsDataURL(file);
    }
}


/* ==========================================
   3. إدارة البيانات والحفظ (CRUD Operations)
   ========================================== */

// جلب العقارات المخزنة أو مصفوفة فارغة
function getProperties() {
    const props = localStorage.getItem("spider_properties");
    return props ? JSON.parse(props) : [];
}

// حفظ العقار الجديد
function handleFormSubmit(event) {
    event.preventDefault();

    const title = document.getElementById("prop-title").value;
    const price = document.getElementById("prop-price").value;
    const location = document.getElementById("prop-location").value;
    const desc = document.getElementById("prop-desc").value;

    if (!uploadedImageBase64) {
        alert("برجاء رفع صورة للعقار أولاً!");
        return;
    }

    const newProperty = {
        id: Date.now(), // ID فريد لكل عقار
        title: title,
        price: price,
        location: location,
        desc: desc,
        image: uploadedImageBase64
    };

    const currentProperties = getProperties();
    currentProperties.push(newProperty);
    localStorage.setItem("spider_properties", JSON.stringify(currentProperties));

    // إعادة تهيئة الفورم بعد النشر الناجح
    document.getElementById("add-property-form").reset();
    document.getElementById("image-preview").classList.add("hidden");
    document.getElementById("upload-status").innerText = "اضغط هنا لرفع الصورة من جهازك";
    uploadedImageBase64 = "";

    alert("تم نشر الصفقة الحصرية بنجاح في المنصة الرئيسية! 🔥");
    displayPropertiesInAdmin();
}

// حذف عقار
function deleteProperty(id) {
    if (confirm("هل أنت متأكد من حذف هذه الصفقة نهائياً من السيستم؟")) {
        let currentProperties = getProperties();
        currentProperties = currentProperties.filter(prop => prop.id !== id);
        localStorage.setItem("spider_properties", JSON.stringify(currentProperties));
        displayPropertiesInAdmin();
    }
}


/* ==========================================
   4. عرض البيانات ديناميكياً في الصفحات
   ========================================== */

// العرض في صفحة العميل (index.html)
function displayPropertiesForClients() {
    const grid = document.getElementById("properties-grid");
    const properties = getProperties();

    if (properties.length === 0) {
        grid.innerHTML = `
            <div class="no-properties">
                <i class="fa-solid fa-folder-open"></i>
                <p>لا توجد محافظ عقارية معروضة حالياً. انتظروا تحديثات الأدمن فوراً.</p>
            </div>`;
        return;
    }

    grid.innerHTML = properties.map(prop => `
        <div class="property-card fade-in">
            <div class="property-img-wrapper">
                <img src="${prop.image}" alt="${prop.title}">
                <span class="exclusive-badge">حصري VIP</span>
            </div>
            <div class="property-details">
                <h3 class="property-title">${prop.title}</h3>
                <p class="property-location"><i class="fa-solid fa-location-dot gold-text"></i> ${prop.location}</p>
                <p class="property-desc">${prop.desc}</p>
                <div class="property-footer">
                    <span class="property-price">${prop.price} <small>ج.م</small></span>
                    <a href="https://t.me/your_bot_username" target="_blank" class="btn-contact">
                        <i class="fa-brands fa-telegram"></i> تفاوض الآن
                    </a>
                </div>
            </div>
        </div>
    `).join("");
}

// العرض في لوحة التحكم (admin.html) لغرض الحذف والمتابعة
function displayPropertiesInAdmin() {
    const listContainer = document.getElementById("admin-properties-list");
    const properties = getProperties();

    if (properties.length === 0) {
        listContainer.innerHTML = '<p class="empty-list-msg">لا توجد عقارات مرفوعة حالياً في السيستم.</p>';
        return;
    }

    listContainer.innerHTML = properties.map(prop => `
        <div class="admin-prop-item">
            <img src="${prop.image}" alt="">
            <div class="admin-prop-info">
                <h4>${prop.title}</h4>
                <p>${prop.price} ج.م | ${prop.location}</p>
            </div>
            <button onclick="deleteProperty(${prop.id})" class="btn-delete" title="حذف">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        </div>
    `).join("");
}
