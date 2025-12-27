// MAHSULOTLAR RO'YXATI
const products = {
    pubg: [
        { id: 1, name: "60 UC", price: 13000, icon: "fas fa-gamepad" },
        { id: 2, name: "120 UC", price: 25000, icon: "fas fa-gamepad" },
        { id: 3, name: "180 UC", price: 37000, icon: "fas fa-gamepad" },
        { id: 4, name: "325 UC", price: 59000, icon: "fas fa-gamepad" },
        { id: 5, name: "385 UC", price: 71000, icon: "fas fa-gamepad" },
        { id: 6, name: "445 UC", price: 83000, icon: "fas fa-gamepad" },
        { id: 7, name: "660 UC", price: 116000, icon: "fas fa-gamepad" },
        { id: 8, name: "720 UC", price: 127000, icon: "fas fa-gamepad" },
        { id: 9, name: "985 UC", price: 172000, icon: "fas fa-gamepad" },
        { id: 10, name: "1800 UC", price: 286000, icon: "fas fa-gamepad" }
    ]
};

const telegramProducts = {
    premium: [
        { id: 11, name: "Premium 1oy", price: 44000, icon: "fab fa-telegram" },
        { id: 12, name: "Premium 3oy", price: 160000, icon: "fab fa-telegram" },
        { id: 13, name: "Premium 6oy", price: 215000, icon: "fab fa-telegram" },
        { id: 14, name: "Premium 1yil", price: 395000, icon: "fab fa-telegram" }
    ],
    
    stars: [
        { id: 15, name: "50 Stars", price: 11000, icon: "fas fa-star" },
        { id: 16, name: "100 Stars", price: 22000, icon: "fas fa-star" },
        { id: 17, name: "150 Stars", price: 33000, icon: "fas fa-star" },
        { id: 18, name: "200 Stars", price: 43000, icon: "fas fa-star" },
        { id: 19, name: "300 Stars", price: 65000, icon: "fas fa-star" },
        { id: 20, name: "500 Stars", price: 105000, icon: "fas fa-star" },
        { id: 21, name: "1000 Stars", price: 210000, icon: "fas fa-star" }
    ]
};

// GLOBAL O'ZGARUVCHILAR
let cart = JSON.parse(localStorage.getItem('salee_cart')) || [];
let currentStep = 1;

// BUYURTMA ID FUNKSIYASI
function generateOrderId() {
    let lastCounter = parseInt(localStorage.getItem('salee_last_order_counter')) || 0;
    lastCounter++;
    const orderNumber = lastCounter.toString().padStart(3, '0');
    const orderId = `SALE-${orderNumber}`;
    localStorage.setItem('salee_last_order_counter', lastCounter);
    return orderId;
}

// MOBILE MENU
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.getElementById('navMenu');
    
    if (!mobileMenuBtn || !navMenu) return;
    
    mobileMenuBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        navMenu.classList.toggle('active');
        this.innerHTML = navMenu.classList.contains('active') 
            ? '<i class="fas fa-times"></i>' 
            : '<i class="fas fa-bars"></i>';
    });
    
    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                navMenu.classList.remove('active');
                mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    });
}

// TABS FUNKSIYALARI
function initTabs() {
    // Telegram Tabs
    const telegramTabs = document.getElementById('telegramTabs');
    if (telegramTabs) {
        const tabButtons = telegramTabs.querySelectorAll('.tab-btn');
        
        tabButtons.forEach(tab => {
            tab.addEventListener('click', function() {
                tabButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                const category = this.dataset.category;
                showTelegramProducts(category);
            });
        });
    }
}

// MAHSULOTLARNI KO'RSATISH
function createProductCard(product, category) {
    return `
        <div class="product-card">
            <div class="product-header">
                <i class="${product.icon}"></i>
                <h3 class="product-title">${product.name}</h3>
            </div>
            <div class="product-body">
                <div class="product-price">${product.price.toLocaleString('uz-UZ')} UZS</div>
                <button class="btn-buy" onclick="addToCart({
                    id: ${product.id},
                    name: '${product.name.replace(/'/g, "\\'")}',
                    price: ${product.price},
                    category: '${category}'
                })">
                    <i class="fas fa-cart-plus"></i> Savatga Qo'shish
                </button>
            </div>
        </div>
    `;
}

function showProducts(category, containerId = 'gameProducts') {
    const container = document.getElementById(containerId);
    const productsList = products[category] || [];
    
    if (container && productsList.length > 0) {
        container.innerHTML = productsList
            .map(product => createProductCard(product, category))
            .join('');
    }
}

function showTelegramProducts(category) {
    const container = document.getElementById('telegramProducts');
    const productsList = telegramProducts[category] || [];
    
    if (container && productsList.length > 0) {
        container.innerHTML = productsList
            .map(product => createProductCard(product, 'telegram'))
            .join('');
    }
}

// SAVAT FUNKSIYALARI
function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            category: product.category || 'general'
        });
    }
    
    updateCart();
    saveCart();
    showNotification(`${product.name} savatga qo'shildi!`);
}

function updateCart() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        cartCount.textContent = totalItems;
    }
    
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (!cartItems || !cartTotal) return;
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Savat bo\'sh</p>';
        cartTotal.textContent = '0';
        updateOrderSummary();
        return;
    }
    
    let total = 0;
    
    cartItems.innerHTML = cart.map(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        return `
            <div class="cart-item">
                <div>
                    <h4>${item.name}</h4>
                    <p>${item.price.toLocaleString()} UZS × ${item.quantity}</p>
                </div>
                <div>
                    <p style="font-weight: 600; color: var(--accent);">${itemTotal.toLocaleString()} UZS</p>
                    <button onclick="removeFromCart(${item.id})" 
                            style="background: #f72585; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; margin-left: 10px;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    cartTotal.textContent = total.toLocaleString();
    updateOrderSummary();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCart();
    showNotification('Mahsulot savatdan ochirildi!');
}

function saveCart() {
    localStorage.setItem('salee_cart', JSON.stringify(cart));
}

// SAVAT MODALI
function initCartModal() {
    const cartIcon = document.getElementById('cartIcon');
    const cartModal = document.getElementById('cartModal');
    const closeCart = document.querySelector('.close-cart');
    
    if (!cartIcon || !cartModal) return;
    
    cartIcon.addEventListener('click', function() {
        cartModal.style.display = 'flex';
        updateCart();
    });
    
    if (closeCart) {
        closeCart.addEventListener('click', function() {
            cartModal.style.display = 'none';
        });
    }
    
    window.addEventListener('click', function(e) {
        if (e.target === cartModal) {
            cartModal.style.display = 'none';
        }
    });
}

// BUYURTMA FORMASI FUNKSIYALARI
function setupOrderForm() {
    const nextBtn = document.getElementById('nextBtn');
    const backBtn = document.getElementById('backBtn');
    const sendTelegramBtn = document.getElementById('sendTelegramBtn');
    
    if (!nextBtn || !backBtn || !sendTelegramBtn) return;
    
    nextBtn.addEventListener('click', function() {
        if (!validateStep(currentStep)) {
            return;
        }
        
        if (currentStep < 2) {
            currentStep++;
            showStep(currentStep);
        }
    });
    
    backBtn.addEventListener('click', function() {
        if (currentStep > 1) {
            currentStep--;
            showStep(currentStep);
        }
    });
    
    sendTelegramBtn.addEventListener('click', sendOrderToTelegram);
}

function showStep(step) {
    const customerStep = document.getElementById('customerStep');
    const productTypeStep = document.getElementById('productTypeStep');
    const nextBtn = document.getElementById('nextBtn');
    const backBtn = document.getElementById('backBtn');
    const sendTelegramBtn = document.getElementById('sendTelegramBtn');
    
    if (step === 1) {
        customerStep.style.display = 'block';
        productTypeStep.style.display = 'none';
        nextBtn.style.display = 'flex';
        backBtn.style.display = 'none';
        sendTelegramBtn.style.display = 'none';
    } else if (step === 2) {
        customerStep.style.display = 'none';
        productTypeStep.style.display = 'block';
        nextBtn.style.display = 'none';
        backBtn.style.display = 'flex';
        sendTelegramBtn.style.display = 'flex';
    }
}

function validateStep(step) {
    if (step === 1) {
        const customerName = document.getElementById('customerName').value.trim();
        const telegramUsername = document.getElementById('telegramUsername').value.trim();
        const gameId = document.getElementById('gameId').value.trim();
        
        if (!customerName) {
            showNotification('Iltimos, ismingizni kiriting!', 'error');
            return false;
        }
        
        if (!telegramUsername) {
            showNotification('Iltimos, Telegram username yoki telefon raqamingizni kiriting!', 'error');
            return false;
        }
        
        if (!gameId) {
            showNotification('Iltimos, PUBG ID yoki username kiriting!', 'error');
            return false;
        }
        
        return true;
    }
    
    if (step === 2) {
        const productType = document.getElementById('productType').value;
        
        if (!productType) {
            showNotification('Iltimos, mahsulot turini tanlang!', 'error');
            return false;
        }
        
        return true;
    }
    
    return true;
}

function updateOrderSummary() {
    const productCount = document.getElementById('productCount');
    const orderTotal = document.getElementById('orderTotal');
    
    if (!productCount || !orderTotal) return;
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    productCount.textContent = `${totalItems} ta`;
    orderTotal.textContent = totalAmount.toLocaleString();
}

function sendOrderToTelegram() {
    const customerName = document.getElementById('customerName').value.trim();
    const telegramUsername = document.getElementById('telegramUsername').value.trim();
    const gameId = document.getElementById('gameId').value.trim();
    const productType = document.getElementById('productType').value;
    const orderNotes = document.getElementById('orderNotes').value.trim();
    
    if (cart.length === 0) {
        showNotification('Savat bo\'sh!', 'error');
        return;
    }
    
    const orderId = generateOrderId();
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const orderData = {
        id: orderId,
        customerName: customerName,
        telegramUsername: telegramUsername.startsWith('@') ? telegramUsername : '@' + telegramUsername,
        gameId: gameId,
        productType: productType === 'pubg' ? 'PUBG UC' : 'Telegram Premium/Stars',
        items: [...cart],
        totalAmount: totalAmount,
        notes: orderNotes,
        date: new Date().toISOString()
    };
    
    console.log('📦 Buyurtma tayyor:', orderData);
    
    // ========== ASOSIY LOGIKA ==========
    
    // 1. AVVAL BOT ORQALI KANALGA YUBORISH
    if (window.saleeBot) {
        console.log('🤖 Bot orqali kanalga yuborilmoqda...');
        
        // Botni ishga tushirish (async, lekin kutmaymiz)
        window.saleeBot.sendToChannelOnly(orderData)
            .then(success => {
                if (success) {
                    console.log('✅ Bot: Kanalga yuborildi');
                } else {
                    console.log('⚠️ Bot: Kanalga yuborilmadi');
                }
            })
            .catch(err => {
                console.error('❌ Bot catch:', err);
            });
    }
    
    // 2. MIJOZNI ADMIN GA YUBORISH (ASOSIY)
    const adminMessage = formatOrderMessage(orderData);
    const adminUrl = `https://t.me/salee_uz?text=${encodeURIComponent(adminMessage)}`;
    
    showNotification('Telegram admin ga yuborilmoqda...');
    
    // 3. TELEGRAM OCHISH
    setTimeout(() => {
        window.open(adminUrl, '_blank');
        
        // 4. TOZALASH ISHLARI
        completeOrder(orderId);
        
    }, 500);
}

// Qolgan funksiyalar o'zgarmasdan:
function completeOrder(orderId) {
    // Savatni tozalash
    cart = [];
    localStorage.setItem('salee_cart', JSON.stringify([]));
    updateCart();
    
    // Formani tozalash
    document.getElementById('customerName').value = '';
    document.getElementById('telegramUsername').value = '';
    document.getElementById('gameId').value = '';
    document.getElementById('productType').value = '';
    document.getElementById('orderNotes').value = '';
    
    // Qadamni qaytarish
    currentStep = 1;
    showStep(currentStep);
    
    // Modalni yopish
    document.getElementById('cartModal').style.display = 'none';
    
    showNotification(`✅ Buyurtma #${orderId} yuborildi!`);
}

function formatOrderMessage(orderData) {
    let message = `🆕 *YANGI BUYURTMA* #${orderData.id}\n\n`;
    message += `👤 *Mijoz:* ${orderData.customerName}\n`;
    message += `📱 *Telegram:* ${orderData.telegramUsername}\n`;
    message += `🎮 *PUBG ID:* ${orderData.gameId}\n`;
    message += `🏷 *Mahsulot turi:* ${orderData.productType}\n`;
    message += `💰 *Jami summa:* ${orderData.totalAmount.toLocaleString()} UZS\n\n`;
    message += `📦 *Mahsulotlar:*\n`;
    
    orderData.items.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        message += `${index + 1}. ${item.name} - ${item.quantity} dona (${itemTotal.toLocaleString()} UZS)\n`;
    });
    
    if (orderData.notes && orderData.notes.trim() !== '') {
        message += `\n📝 *Mijoz izohi:* ${orderData.notes}\n`;
    }
    
    message += `\n📅 *Sana:* ${new Date().toLocaleString('uz-UZ')}\n`;
    message += `⚡ *Xizmat:* SALEE SERVIS`;
    
    return message;
}

// XABARNOMA
function showNotification(message, type = 'success') {
    const oldNotif = document.querySelector('.notification');
    if (oldNotif) oldNotif.remove();
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#4cc9f0' : '#f72585'};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 3000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// DOM READY
document.addEventListener('DOMContentLoaded', function() {
    console.log('SALEE SERVIS yuklanmoqda...');
    
    initMobileMenu();
    initCartModal();
    initTabs();
    setupOrderForm();
    
    showProducts('pubg', 'gameProducts');
    showTelegramProducts('premium');
    updateCart();
    
    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Screen size check
    function checkScreenSize() {
        const navMenu = document.getElementById('navMenu');
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        
        if (!navMenu || !mobileMenuBtn) return;
        
        if (window.innerWidth > 768) {
            navMenu.classList.add('active');
            mobileMenuBtn.style.display = 'none';
        } else {
            navMenu.classList.remove('active');
            mobileMenuBtn.style.display = 'block';
        }
    }
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    console.log('SALEE SERVIS toliq yuklandi!');
});