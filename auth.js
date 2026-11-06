// ===================================================
// auth.js - Client-side Authentication & Validation
// ===================================================

// --- Helper Functions ---

/**
 * 1. Calculates exact age from date string
 * Demonstrates: numbers, Date object, operators, logic
 */
function calculateAge(birthDateString) {
    if (!birthDateString) return 0;
    const today = new Date();
    const birthDate = new Date(birthDateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

/**
 * 2. Validates email format using Regular Expression
 * Demonstrates: strings, RegExp, Booleans
 */
function isValidEmail(email) {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email.trim());
}

/**
 * 3. Checks password complexity requirements:
 * At least 8 characters, 1 uppercase, 1 lowercase, and 1 numeric digit
 */
function isStrongPassword(password) {
    const hasMinLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasDigit = /[0-9]/.test(password);

    return hasMinLength && hasUpper && hasLower && hasDigit;
}

/**
 * 4. Helper to display or clear field-level errors
 * Demonstrates: DOM manipulation
 */
function setFieldError(fieldId, errorId, message) {
    const field = document.getElementById(fieldId);
    const errorEl = document.getElementById(errorId);
    if (!field || !errorEl) return;

    if (message) {
        errorEl.textContent = message;
        field.classList.add("input-error");
    } else {
        errorEl.textContent = "";
        field.classList.remove("input-error");
    }
}

/**
 * 5. Safe localStorage reader with try/catch
 */
function getRegisteredUsers() {
    try {
        const rawData = localStorage.getItem("dyslexia_registered_users");
        return rawData ? JSON.parse(rawData) : [];
    } catch (err) {
        console.error("Failed to parse users from localStorage:", err);
        return [];
    }
}

// --- Registration Form Handler ---
const registerForm = document.getElementById("registerForm");

if (registerForm) {
    // Real-time input cleaning on change
    const fieldsToWatch = ["fullName", "email", "birthday", "password", "confirmPassword", "consent"];
    for (let i = 0; i < fieldsToWatch.length; i++) { // Requirement: At least one loop
        const el = document.getElementById(fieldsToWatch[i]);
        if (el) {
            el.addEventListener("input", function () {
                setFieldError(fieldsToWatch[i], fieldsToWatch[i] + "Error", "");
            });
        }
    }

    registerForm.addEventListener("submit", function (event) {
        event.preventDefault(); // Stop submission for validation

        const fullName = document.getElementById("fullName").value.trim();
        const email = document.getElementById("email").value.trim();
        const birthday = document.getElementById("birthday").value;
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const assistPreference = document.getElementById("assistPreference").value;
        const consent = document.getElementById("consent").checked;
        const statusBox = document.getElementById("formStatusMessage");

        let isValid = true;

        // 1. Full name validation
        if (fullName.length < 3) {
            setFieldError("fullName", "fullNameError", "Please enter your full name (minimum 3 characters).");
            isValid = false;
        } else {
            setFieldError("fullName", "fullNameError", "");
        }

        // 2. Email validation
        if (!isValidEmail(email)) {
            setFieldError("email", "emailError", "Please provide a valid email address (e.g., student@domain.com).");
            isValid = false;
        } else {
            setFieldError("email", "emailError", "");
        }

        // 3. Birthday / Age validation (Must be at least 12 years old)
        const age = calculateAge(birthday);
        if (!birthday) {
            setFieldError("birthday", "birthdayError", "Birthday is required.");
            isValid = false;
        } else if (age < 12) {
            setFieldError("birthday", "birthdayError", `You must be at least 12 years old (Current detected age: ${age}).`);
            isValid = false;
        } else {
            setFieldError("birthday", "birthdayError", "");
        }

        // 4. Password strength validation
        if (!isStrongPassword(password)) {
            setFieldError(
                "password",
                "passwordError",
                "Must be 8+ chars and contain uppercase, lowercase, and a number."
            );
            isValid = false;
        } else {
            setFieldError("password", "passwordError", "");
        }

        // 5. Password confirmation matching
        if (password !== confirmPassword) {
            setFieldError("confirmPassword", "confirmPasswordError", "Passwords do not match.");
            isValid = false;
        } else {
            setFieldError("confirmPassword", "confirmPasswordError", "");
        }

        // 6. Consent checkbox
        if (!consent) {
            setFieldError("consent", "consentError", "You must consent to data processing for study personalization.");
            isValid = false;
        } else {
            setFieldError("consent", "consentError", "");
        }

        if (!isValid) {
            statusBox.className = "status-box error";
            statusBox.textContent = "Please resolve the highlighted errors before submitting.";
            return;
        }

        // Safe Storage: DO NOT store plain-text password!
        const users = getRegisteredUsers();
        const userExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());

        if (userExists) {
            setFieldError("email", "emailError", "An account with this email is already registered.");
            statusBox.className = "status-box error";
            statusBox.textContent = "Account registration failed.";
            return;
        }

        const newUserProfile = {
            id: Date.now(),
            fullName: fullName,
            email: email.toLowerCase(),
            birthday: birthday,
            assistPreference: assistPreference,
            registeredAt: new Date().toISOString()
        };

        try {
            users.push(newUserProfile);
            localStorage.setItem("dyslexia_registered_users", JSON.stringify(users));
            statusBox.className = "status-box success";
            statusBox.textContent = "Registration successful! Redirecting to login...";
            registerForm.reset();

            setTimeout(() => {
                window.location.href = "login.html";
            }, 1500);
        } catch (err) {
            console.error("Storage error during registration:", err);
            statusBox.className = "status-box error";
            statusBox.textContent = "Browser storage quota exceeded. Could not save profile.";
        }
    });
}

// --- Login Form Handler ---
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;
        const statusBox = document.getElementById("loginStatusMessage");

        let isValid = true;

        if (!isValidEmail(email)) {
            setFieldError("loginEmail", "loginEmailError", "Enter a valid email format.");
            isValid = false;
        } else {
            setFieldError("loginEmail", "loginEmailError", "");
        }

        if (password.length < 8) {
            setFieldError("loginPassword", "loginPasswordError", "Password must be at least 8 characters.");
            isValid = false;
        } else {
            setFieldError("loginPassword", "loginPasswordError", "");
        }

        if (!isValid) return;

        // Simulated authentication check against saved demo profiles
        const users = getRegisteredUsers();
        const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (foundUser) {
            statusBox.className = "status-box success";
            statusBox.textContent = `Welcome back, ${foundUser.fullName}! Simulated login successful.`;
            // Save active session token (dummy)
            sessionStorage.setItem("active_user_name", foundUser.fullName);
            setTimeout(() => {
                window.location.href = "materials.html";
            }, 1200);
        } else {
            statusBox.className = "status-box error";
            statusBox.textContent = "Simulated Login Failure: Email not found in local mock registry.";
        }
    });
}