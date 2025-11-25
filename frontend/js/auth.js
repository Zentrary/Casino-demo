// Authentication System JavaScript

// Password strength checker
function checkPasswordStrength(password) {
    let strength = 0;
    let strengthText = '';

    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    const strengthFill = document.getElementById('strengthFill');
    const strengthTextElement = document.getElementById('strengthText');

    if (strengthFill && strengthTextElement) {
        strengthFill.className = 'strength-fill';
        strengthTextElement.className = 'strength-text';

        if (strength <= 2) {
            strengthFill.classList.add('weak');
            strengthTextElement.classList.add('weak');
            strengthText = 'รหัสผ่านอ่อน';
        } else if (strength === 3) {
            strengthFill.classList.add('fair');
            strengthTextElement.classList.add('fair');
            strengthText = 'รหัสผ่านปานกลาง';
        } else if (strength === 4) {
            strengthFill.classList.add('good');
            strengthTextElement.classList.add('good');
            strengthText = 'รหัสผ่านดี';
        } else {
            strengthFill.classList.add('strong');
            strengthTextElement.classList.add('strong');
            strengthText = 'รหัสผ่านแข็งแกร่ง';
        }

        strengthTextElement.textContent = strengthText;
    }
}

// Toggle password visibility
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const toggle = input.parentElement.querySelector('.password-toggle i');

    if (input.type === 'password') {
        input.type = 'text';
        toggle.classList.remove('fa-eye');
        toggle.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        toggle.classList.remove('fa-eye-slash');
        toggle.classList.add('fa-eye');
    }
}

// Form validation
function validateForm(formData) {
    const errors = {};

    // Email validation
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = 'กรุณากรอกอีเมลที่ถูกต้อง';
    }

    // Password validation
    if (!formData.password || formData.password.length < 8) {
        errors.password = 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร';
    }

    // Confirm password validation (for register)
    if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'รหัสผ่านไม่ตรงกัน';
    }

    // Phone validation
    if (formData.phone && !/^0[0-9]{8,9}$/.test(formData.phone)) {
        errors.phone = 'กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้อง';
    }

    // Name validation
    if (formData.firstName && formData.firstName.length < 2) {
        errors.firstName = 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร';
    }

    if (formData.lastName && formData.lastName.length < 2) {
        errors.lastName = 'นามสกุลต้องมีอย่างน้อย 2 ตัวอักษร';
    }

    // Birth date validation
    if (formData.birthDate) {
        const birthDate = new Date(formData.birthDate);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();

        if (age < 18) {
            errors.birthDate = 'คุณต้องมีอายุอย่างน้อย 18 ปี';
        }
    }

    return errors;
}

// Show form errors
function showFormErrors(errors) {
    // Clear previous errors
    document.querySelectorAll('.error-message').forEach(error => error.remove());
    document.querySelectorAll('.form-group').forEach(group => {
        group.classList.remove('error', 'success');
    });

    // Show new errors
    Object.keys(errors).forEach(field => {
        const input = document.getElementById(field);
        if (input) {
            const formGroup = input.closest('.form-group');
            formGroup.classList.add('error');

            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.textContent = errors[field];
            formGroup.appendChild(errorMessage);
        }
    });
}

// Show success message
function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.style.cssText = `
        background: #2ed573;
        color: white;
        padding: 1rem;
        border-radius: 10px;
        margin-bottom: 1rem;
        text-align: center;
        font-weight: 500;
    `;
    successDiv.textContent = message;

    const form = document.querySelector('.auth-form');
    form.insertBefore(successDiv, form.firstChild);

    setTimeout(() => {
        successDiv.remove();
    }, 5000);
}

// Show error message
function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message-global';
    errorDiv.style.cssText = `
        background: #ff4757;
        color: white;
        padding: 1rem;
        border-radius: 10px;
        margin-bottom: 1rem;
        text-align: center;
        font-weight: 500;
    `;
    errorDiv.textContent = message;

    const form = document.querySelector('.auth-form');
    form.insertBefore(errorDiv, form.firstChild);

    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Real API call function
async function callAuthAPI(endpoint, data) {
    try {
        const base = (window.API_BASE_URL || '').replace(/\/+$/, '');
        const url = `${base}/api/v1/auth/${endpoint}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
            // Handle validation errors
            if (result.errors && Array.isArray(result.errors)) {
                const errorMessages = result.errors.map(err => err.msg || err.message).join(', ');
                throw new Error(errorMessages || result.message || 'เกิดข้อผิดพลาด');
            }
            throw new Error(result.message || 'เกิดข้อผิดพลาด');
        }

        if (!result.success) {
            throw new Error(result.message || 'เกิดข้อผิดพลาด');
        }

        // Format response to match expected structure
        return {
            success: true,
            message: endpoint === 'login' ? 'เข้าสู่ระบบสำเร็จ' : 'สมัครสมาชิกสำเร็จ',
            user: result.data?.user || result.data,
            token: result.data?.token,
            refreshToken: result.data?.refreshToken
        };
    } catch (error) {
        // Handle network errors
        if (error.name === 'TypeError' || error.message.includes('fetch')) {
            throw new Error('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต');
        }
        throw error;
    }
}

// Login form handler
function handleLogin(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Validate form
    const errors = validateForm(data);
    if (Object.keys(errors).length > 0) {
        showFormErrors(errors);
        return;
    }

    // Show loading state
    const submitBtn = form.querySelector('.btn-auth');
    const originalText = submitBtn.innerHTML;
    submitBtn.classList.add('loading');
    submitBtn.innerHTML = '';

    // Call real API
    callAuthAPI('login', data)
        .then(response => {
            showSuccessMessage(response.message);

            // Store user data and token in localStorage
            localStorage.setItem('user', JSON.stringify(response.user));
            localStorage.setItem('token', response.token);
            localStorage.setItem('refreshToken', response.refreshToken);
            localStorage.setItem('isLoggedIn', 'true');

            // Redirect to home page
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 1500);
        })
        .catch(error => {
            showErrorMessage(error.message);
        })
        .finally(() => {
            // Reset button state
            submitBtn.classList.remove('loading');
            submitBtn.innerHTML = originalText;
        });
}

// Register form handler
function handleRegister(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Validate form
    const errors = validateForm(data);
    if (Object.keys(errors).length > 0) {
        showFormErrors(errors);
        return;
    }

    // Show loading state
    const submitBtn = form.querySelector('.btn-auth');
    const originalText = submitBtn.innerHTML;
    submitBtn.classList.add('loading');
    submitBtn.innerHTML = '';

    // Call real API
    callAuthAPI('register', data)
        .then(response => {
            showSuccessMessage(response.message);

            // Store user data and token in localStorage
            localStorage.setItem('user', JSON.stringify(response.user));
            localStorage.setItem('token', response.token);
            localStorage.setItem('refreshToken', response.refreshToken);
            localStorage.setItem('isLoggedIn', 'true');

            // Redirect to home page
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 1500);
        })
        .catch(error => {
            showErrorMessage(error.message);
        })
        .finally(() => {
            // Reset button state
            submitBtn.classList.remove('loading');
            submitBtn.innerHTML = originalText;
        });
}

// Social login handlers
function handleGoogleLogin() {
    showErrorMessage('การเข้าสู่ระบบด้วย Google กำลังพัฒนา');
}

function handleFacebookLogin() {
    showErrorMessage('การเข้าสู่ระบบด้วย Facebook กำลังพัฒนา');
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);

        // Password strength checker
        const passwordInput = document.getElementById('password');
        if (passwordInput) {
            passwordInput.addEventListener('input', function() {
                checkPasswordStrength(this.value);
            });
        }
    }

    // Social login buttons
    const googleBtn = document.querySelector('.btn-google');
    if (googleBtn) {
        googleBtn.addEventListener('click', handleGoogleLogin);
    }

    const facebookBtn = document.querySelector('.btn-facebook');
    if (facebookBtn) {
        facebookBtn.addEventListener('click', handleFacebookLogin);
    }

    // Phone number formatting
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            let value = this.value.replace(/\D/g, '');
            if (value.startsWith('0')) {
                value = value.substring(1);
            }
            if (value.length > 9) {
                value = value.substring(0, 9);
            }
            this.value = value ? '0' + value : '';
        });
    }

    // Check if user is already logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
        // Redirect to home page if already logged in
        if (window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html')) {
            window.location.href = '../index.html';
        }
    }
});

// Utility functions
function formatPhoneNumber(phone) {
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
        return '(' + match[1] + ') ' + match[2] + '-' + match[3];
    }
    return phone;
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^0[0-9]{8,9}$/;
    return re.test(phone);
}

// Export functions for global use
window.togglePassword = togglePassword;
window.checkPasswordStrength = checkPasswordStrength;
