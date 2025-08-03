// Hostel Event Payment App JavaScript

// Application state
let currentUser = null;
let currentUserType = null;
let appData = {
    users: [
        {id: 1, name: "Rajesh Kumar", phone: "9876543210", email: "rajesh@example.com", hostelRoom: "A-101", paymentStatus: "paid", amount: 500, timestamp: "2025-01-15T10:30:00"},
        {id: 2, name: "Priya Sharma", phone: "9876543211", email: "priya@example.com", hostelRoom: "B-205", paymentStatus: "pending", amount: 0, timestamp: null},
        {id: 3, name: "Amit Singh", phone: "9876543212", email: "amit@example.com", hostelRoom: "C-304", paymentStatus: "paid", amount: 500, timestamp: "2025-01-16T14:20:00"}
    ],
    eventDetails: {
        eventName: "Annual Hostel Cultural Fest",
        description: "Join us for an amazing cultural festival with performances, food stalls, and games",
        amount: 500,
        deadline: "2025-02-01",
        totalCollected: 1000,
        totalRequired: 25000
    },
    adminCredentials: {
        username: "admin",
        password: "admin123"
    },
    payments: [
        {id: 1, userId: 1, amount: 500, paymentMethod: "UPI", status: "completed", timestamp: "2025-01-15T10:30:00", transactionId: "TXN001"},
        {id: 2, userId: 3, amount: 500, paymentMethod: "Credit Card", status: "completed", timestamp: "2025-01-16T14:20:00", transactionId: "TXN002"}
    ],
    notifications: []
};

// Navigation functions
function showPage(pageId) {
    try {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
        }
    } catch (error) {
        console.error('Error showing page:', error);
    }
}

function showLanding() {
    showPage('landing-page');
    currentUser = null;
    currentUserType = null;
}

function showLogin(userType) {
    try {
        currentUserType = userType;
        showPage('login-page');
        
        const loginTitle = document.getElementById('login-title');
        const userRegisterLink = document.getElementById('user-register-link');
        
        if (loginTitle) {
            if (userType === 'admin') {
                loginTitle.textContent = 'Admin Login';
                if (userRegisterLink) {
                    userRegisterLink.classList.add('hidden');
                }
            } else {
                loginTitle.textContent = 'Student Login';
                if (userRegisterLink) {
                    userRegisterLink.classList.remove('hidden');
                }
            }
        }
        
        // Clear form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.reset();
        }
    } catch (error) {
        console.error('Error in showLogin:', error);
    }
}

function showRegister() {
    try {
        showPage('register-page');
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.reset();
        }
    } catch (error) {
        console.error('Error in showRegister:', error);
    }
}

function showDashboard() {
    try {
        if (currentUserType === 'admin') {
            showPage('admin-dashboard');
            loadAdminDashboard();
        } else {
            showPage('user-dashboard');
            loadUserDashboard();
        }
    } catch (error) {
        console.error('Error showing dashboard:', error);
    }
}

function logout() {
    currentUser = null;
    currentUserType = null;
    showLanding();
    showToast('Logged out successfully', 'info');
}

// Authentication functions
function handleLogin(e) {
    e.preventDefault();
    
    try {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (currentUserType === 'admin') {
            if (username === appData.adminCredentials.username && password === appData.adminCredentials.password) {
                currentUser = {username: username, type: 'admin'};
                showDashboard();
                showToast('Admin login successful', 'success');
            } else {
                showToast('Invalid admin credentials', 'error');
            }
        } else {
            const user = appData.users.find(u => u.email === username || u.phone === username);
            if (user) {
                currentUser = user;
                showDashboard();
                showToast(`Welcome back, ${user.name}!`, 'success');
            } else {
                showToast('User not found. Please register first.', 'error');
            }
        }
    } catch (error) {
        console.error('Login error:', error);
        showToast('Login failed. Please try again.', 'error');
    }
}

function handleRegister(e) {
    e.preventDefault();
    
    try {
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const phone = document.getElementById('reg-phone').value;
        const room = document.getElementById('reg-room').value;
        
        // Check if user already exists
        const existingUser = appData.users.find(u => u.email === email || u.phone === phone);
        if (existingUser) {
            showToast('User with this email or phone already exists', 'error');
            return;
        }
        
        // Create new user
        const newUser = {
            id: Date.now(),
            name: name,
            email: email,
            phone: phone,
            hostelRoom: room,
            paymentStatus: 'pending',
            amount: 0,
            timestamp: null
        };
        
        appData.users.push(newUser);
        saveData();
        
        currentUser = newUser;
        currentUserType = 'user';
        showDashboard();
        showToast('Registration successful!', 'success');
    } catch (error) {
        console.error('Registration error:', error);
        showToast('Registration failed. Please try again.', 'error');
    }
}

// Admin Dashboard functions
function loadAdminDashboard() {
    try {
        updateAdminStats();
        loadPaymentsList();
        loadUsersList();
        
        // Set default active tab
        const defaultTab = document.querySelector('[data-tab="payments"]');
        if (defaultTab) {
            switchTab(defaultTab);
        }
    } catch (error) {
        console.error('Error loading admin dashboard:', error);
    }
}

function updateAdminStats() {
    try {
        const totalUsers = appData.users.length;
        const paidUsers = appData.users.filter(u => u.paymentStatus === 'paid').length;
        const pendingUsers = totalUsers - paidUsers;
        const totalCollected = appData.users
            .filter(u => u.paymentStatus === 'paid')
            .reduce((sum, u) => sum + u.amount, 0);
        
        const elements = {
            'total-collected': `₹${totalCollected.toLocaleString()}`,
            'total-users': totalUsers,
            'paid-users': paidUsers,
            'pending-users': pendingUsers
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
        
        // Update app data
        appData.eventDetails.totalCollected = totalCollected;
        saveData();
    } catch (error) {
        console.error('Error updating admin stats:', error);
    }
}

function loadPaymentsList() {
    try {
        const paymentsContainer = document.getElementById('payments-list');
        if (!paymentsContainer) return;
        
        const paidUsers = appData.users.filter(u => u.paymentStatus === 'paid');
        
        if (paidUsers.length === 0) {
            paymentsContainer.innerHTML = `
                <div class="empty-state">
                    <span class="material-icons">payment</span>
                    <p>No payments received yet</p>
                </div>
            `;
            return;
        }
        
        paymentsContainer.innerHTML = paidUsers.map(user => `
            <div class="payment-item">
                <div class="payment-info">
                    <h4>${user.name}</h4>
                    <p>Room: ${user.hostelRoom} • ${formatDate(user.timestamp)}</p>
                </div>
                <div class="payment-amount">₹${user.amount}</div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading payments list:', error);
    }
}

function loadUsersList() {
    try {
        const usersContainer = document.getElementById('users-list');
        if (!usersContainer) return;
        
        usersContainer.innerHTML = appData.users.map(user => `
            <div class="user-item">
                <div class="user-info">
                    <h4>${user.name}</h4>
                    <p>Room: ${user.hostelRoom} • ${user.phone}</p>
                </div>
                <div class="status status--${user.paymentStatus === 'paid' ? 'success' : 'warning'}">
                    <span class="material-icons">${user.paymentStatus === 'paid' ? 'check_circle' : 'pending'}</span>
                    ${user.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading users list:', error);
    }
}

function sendReminders() {
    try {
        const pendingUsers = appData.users.filter(u => u.paymentStatus === 'pending');
        
        if (pendingUsers.length === 0) {
            showToast('No pending payments to remind', 'info');
            return;
        }
        
        const notificationLog = document.getElementById('notification-log');
        const timestamp = new Date().toLocaleString();
        
        pendingUsers.forEach(user => {
            const message = `Dear ${user.name}, reminder: Please pay Rs.500 for Annual Hostel Cultural Fest by February 1, 2025. Pay now to secure your participation.`;
            
            appData.notifications.push({
                id: Date.now() + Math.random(),
                userId: user.id,
                message: message,
                timestamp: timestamp,
                type: 'reminder'
            });
        });
        
        // Update notification log
        if (notificationLog) {
            notificationLog.innerHTML = `
                <div class="notification-item">
                    <strong>${timestamp}:</strong> Sent payment reminders to ${pendingUsers.length} students
                </div>
                ${notificationLog.innerHTML}
            `;
        }
        
        saveData();
        showToast(`Reminders sent to ${pendingUsers.length} students`, 'success');
    } catch (error) {
        console.error('Error sending reminders:', error);
        showToast('Failed to send reminders', 'error');
    }
}

// User Dashboard functions
function loadUserDashboard() {
    try {
        const welcomeEl = document.getElementById('user-welcome');
        if (welcomeEl && currentUser) {
            welcomeEl.textContent = `Welcome, ${currentUser.name}`;
        }
        
        updatePaymentStatus();
        loadUserPaymentHistory();
        
        // Set default active tab
        const defaultTab = document.querySelector('.user-tabs [data-tab="payment"]');
        if (defaultTab) {
            switchTab(defaultTab);
        }
    } catch (error) {
        console.error('Error loading user dashboard:', error);
    }
}

function updatePaymentStatus() {
    try {
        const statusContainer = document.getElementById('payment-status-content');
        if (!statusContainer || !currentUser) return;
        
        if (currentUser.paymentStatus === 'paid') {
            statusContainer.innerHTML = `
                <div class="status-paid">
                    <span class="material-icons">check_circle</span>
                    <div>
                        <h3>Payment Completed</h3>
                        <p>You have successfully paid ₹${currentUser.amount} on ${formatDate(currentUser.timestamp)}</p>
                    </div>
                </div>
            `;
            
            // Hide payment form if already paid
            const paymentFormContainer = document.getElementById('payment-form-container');
            if (paymentFormContainer) {
                paymentFormContainer.innerHTML = `
                    <div class="empty-state">
                        <span class="material-icons">check_circle</span>
                        <h3>Payment Already Completed</h3>
                        <p>Thank you for your payment!</p>
                    </div>
                `;
            }
        } else {
            statusContainer.innerHTML = `
                <div class="status-pending">
                    <span class="material-icons">pending</span>
                    <div>
                        <h3>Payment Pending</h3>
                        <p>Please complete your payment of ₹500 by February 1, 2025</p>
                    </div>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error updating payment status:', error);
    }
}

function loadUserPaymentHistory() {
    try {
        const historyContainer = document.getElementById('user-payment-history');
        if (!historyContainer || !currentUser) return;
        
        const userPayments = appData.payments.filter(p => p.userId === currentUser.id);
        
        if (userPayments.length === 0) {
            historyContainer.innerHTML = `
                <div class="empty-state">
                    <span class="material-icons">history</span>
                    <p>No payment history available</p>
                </div>
            `;
            return;
        }
        
        historyContainer.innerHTML = userPayments.map(payment => `
            <div class="payment-item">
                <div class="payment-info">
                    <h4>Payment for ${appData.eventDetails.eventName}</h4>
                    <p>${payment.paymentMethod} • ${formatDate(payment.timestamp)}</p>
                    <p>Transaction ID: ${payment.transactionId}</p>
                </div>
                <div class="payment-amount">₹${payment.amount}</div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading user payment history:', error);
    }
}

// Payment processing
function handlePayment(e) {
    e.preventDefault();
    
    try {
        if (currentUser && currentUser.paymentStatus === 'paid') {
            showToast('Payment already completed', 'info');
            return;
        }
        
        const paymentMethodEl = document.getElementById('payment-method');
        const paymentMethod = paymentMethodEl ? paymentMethodEl.value : '';
        
        if (!paymentMethod) {
            showToast('Please select a payment method', 'error');
            return;
        }
        
        // Show payment processing modal
        showModal('payment-modal');
        
        // Simulate payment processing
        setTimeout(() => {
            processPayment(paymentMethod);
        }, 3000);
    } catch (error) {
        console.error('Payment error:', error);
        showToast('Payment failed. Please try again.', 'error');
    }
}

function processPayment(paymentMethod) {
    try {
        const transactionId = 'TXN' + Date.now();
        const timestamp = new Date().toISOString();
        
        // Update user payment status
        if (currentUser) {
            currentUser.paymentStatus = 'paid';
            currentUser.amount = 500;
            currentUser.timestamp = timestamp;
            
            // Update user in appData
            const userIndex = appData.users.findIndex(u => u.id === currentUser.id);
            if (userIndex !== -1) {
                appData.users[userIndex] = currentUser;
            }
        }
        
        // Add payment record
        const payment = {
            id: Date.now(),
            userId: currentUser ? currentUser.id : 0,
            amount: 500,
            paymentMethod: paymentMethod,
            status: 'completed',
            timestamp: timestamp,
            transactionId: transactionId
        };
        
        appData.payments.push(payment);
        
        // Create SMS notification
        const smsMessage = `Dear ${currentUser ? currentUser.name : 'User'}, your payment of Rs.500 for Annual Hostel Cultural Fest has been received successfully. Transaction ID: ${transactionId}`;
        
        appData.notifications.push({
            id: Date.now() + Math.random(),
            userId: currentUser ? currentUser.id : 0,
            message: smsMessage,
            timestamp: new Date().toLocaleString(),
            type: 'payment_success'
        });
        
        saveData();
        
        // Hide payment processing modal
        hideModal('payment-modal');
        
        // Show SMS notification modal
        const smsTextEl = document.getElementById('sms-text');
        if (smsTextEl) {
            smsTextEl.textContent = smsMessage;
        }
        showModal('sms-modal');
        
        // Update dashboard
        updatePaymentStatus();
        loadUserPaymentHistory();
    } catch (error) {
        console.error('Error processing payment:', error);
        hideModal('payment-modal');
        showToast('Payment processing failed. Please try again.', 'error');
    }
}

// Modal functions
function showModal(modalId) {
    try {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error showing modal:', error);
    }
}

function hideModal(modalId) {
    try {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
        }
    } catch (error) {
        console.error('Error hiding modal:', error);
    }
}

function closeSMSModal() {
    hideModal('sms-modal');
    showToast('Payment completed successfully!', 'success');
}

// Tab switching
function switchTab(tabBtn) {
    if (!tabBtn) return;
    
    try {
        const tabContainer = tabBtn.closest('.admin-tabs, .user-tabs');
        const tabId = tabBtn.dataset.tab;
        
        if (!tabContainer || !tabId) return;
        
        // Update tab buttons
        tabContainer.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        tabBtn.classList.add('active');
        
        // Update tab content
        const contentContainer = tabContainer.nextElementSibling.parentNode;
        contentContainer.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        const targetContent = contentContainer.querySelector(`#${tabId}-tab`);
        if (targetContent) {
            targetContent.classList.add('active');
        }
    } catch (error) {
        console.error('Error switching tab:', error);
    }
}

// Toast notifications
function showToast(message, type = 'info') {
    try {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? 'check_circle' : 
                    type === 'error' ? 'error' : 
                    type === 'warning' ? 'warning' : 'info';
        
        toast.innerHTML = `
            <span class="material-icons">${icon}</span>
            <span>${message}</span>
        `;
        
        const container = document.getElementById('toast-container');
        if (container) {
            container.appendChild(toast);
            
            // Auto remove after 4 seconds
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 4000);
        }
    } catch (error) {
        console.error('Error showing toast:', error);
    }
}

// Utility functions
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return 'Invalid Date';
    }
}

function saveData() {
    try {
        localStorage.setItem('hostelPaymentData', JSON.stringify(appData));
    } catch (e) {
        console.error('Error saving data:', e);
    }
}

function initializeApp() {
    try {
        // Load data from localStorage if available
        const savedData = localStorage.getItem('hostelPaymentData');
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                appData = {...appData, ...parsed};
            } catch (e) {
                console.log('Error loading saved data, using defaults');
            }
        }
        
        // Show landing page by default
        showLanding();
    } catch (error) {
        console.error('Error initializing app:', error);
    }
}

function setupEventListeners() {
    try {
        // Landing page navigation
        const adminOption = document.getElementById('admin-option');
        const userOption = document.getElementById('user-option');
        
        if (adminOption) {
            adminOption.addEventListener('click', () => showLogin('admin'));
        }
        
        if (userOption) {
            userOption.addEventListener('click', () => showLogin('user'));
        }
        
        // Back buttons
        const backToLanding = document.getElementById('back-to-landing');
        const backToLogin = document.getElementById('back-to-login');
        
        if (backToLanding) {
            backToLanding.addEventListener('click', showLanding);
        }
        
        if (backToLogin) {
            backToLogin.addEventListener('click', () => showLogin(currentUserType));
        }
        
        // Register link
        const registerLink = document.getElementById('register-link');
        if (registerLink) {
            registerLink.addEventListener('click', (e) => {
                e.preventDefault();
                showRegister();
            });
        }
        
        // Logout buttons
        const adminLogout = document.getElementById('admin-logout');
        const userLogout = document.getElementById('user-logout');
        
        if (adminLogout) {
            adminLogout.addEventListener('click', logout);
        }
        
        if (userLogout) {
            userLogout.addEventListener('click', logout);
        }
        
        // Forms
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
        }
        
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', handleRegister);
        }
        
        const paymentForm = document.getElementById('payment-form');
        if (paymentForm) {
            paymentForm.addEventListener('submit', handlePayment);
        }
        
        // Other buttons
        const sendRemindersBtn = document.getElementById('send-reminders');
        if (sendRemindersBtn) {
            sendRemindersBtn.addEventListener('click', sendReminders);
        }
        
        const closeSMSBtn = document.getElementById('close-sms-modal');
        if (closeSMSBtn) {
            closeSMSBtn.addEventListener('click', closeSMSModal);
        }
        
        // Tab switching
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('tab-btn')) {
                switchTab(e.target);
            }
        });
        
    } catch (error) {
        console.error('Error setting up event listeners:', error);
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
});