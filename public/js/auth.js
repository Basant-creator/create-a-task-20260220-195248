const API_BASE = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    // Helper to display error messages for specific fields
    const displayError = (elementId, message) => {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = message ? 'block' : 'none';
        }
    };

    // Helper to clear all error messages
    const clearErrors = (form) => {
        form.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
            el.style.display = 'none';
        });
    };

    // Helper to set loading state on button
    const setLoadingState = (buttonId, isLoading) => {
        const button = document.getElementById(buttonId);
        const buttonText = button.querySelector('#buttonText');
        const loadingSpinner = button.querySelector('#loadingSpinner');

        if (isLoading) {
            buttonText.style.display = 'none';
            loadingSpinner.style.display = 'inline-block';
            button.disabled = true;
        } else {
            buttonText.style.display = 'inline-block';
            loadingSpinner.style.display = 'none';
            button.disabled = false;
        }
    };

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearErrors(loginForm);
            setLoadingState('loginButton', true);
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const generalError = document.getElementById('generalError');

            let isValid = true;
            if (!email) {
                displayError('emailError', 'Email is required.');
                isValid = false;
            } else if (!/\S+@\S+\.\S+/.test(email)) {
                displayError('emailError', 'Email is not valid.');
                isValid = false;
            }
            if (!password) {
                displayError('passwordError', 'Password is required.');
                isValid = false;
            }

            if (!isValid) {
                setLoadingState('loginButton', false);
                return;
            }

            try {
                const response = await fetch(`${API_BASE}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem('token', data.data.token);
                    // Optionally store user info
                    // localStorage.setItem('user', JSON.stringify(data.data.user));
                    window.location.href = '../app/dashboard.html'; // Redirect to dashboard
                } else {
                    displayError('generalError', data.message || 'Login failed. Please try again.');
                }
            } catch (error) {
                console.error('Login error:', error);
                displayError('generalError', 'An unexpected error occurred. Please try again later.');
            } finally {
                setLoadingState('loginButton', false);
            }
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearErrors(signupForm);
            setLoadingState('signupButton', true);
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const termsAccepted = document.getElementById('terms').checked;
            const generalError = document.getElementById('generalError');

            let isValid = true;
            if (!name) {
                displayError('nameError', 'Full Name is required.');
                isValid = false;
            }
            if (!email) {
                displayError('emailError', 'Email is required.');
                isValid = false;
            } else if (!/\S+@\S+\.\S+/.test(email)) {
                displayError('emailError', 'Email is not valid.');
                isValid = false;
            }
            if (!password) {
                displayError('passwordError', 'Password is required.');
                isValid = false;
            } else if (password.length < 6) {
                displayError('passwordError', 'Password must be at least 6 characters.');
                isValid = false;
            }
            if (password !== confirmPassword) {
                displayError('confirmPasswordError', 'Passwords do not match.');
                isValid = false;
            }
            if (!termsAccepted) {
                displayError('termsError', 'You must agree to the Terms of Service.');
                isValid = false;
            }

            if (!isValid) {
                setLoadingState('signupButton', false);
                return;
            }

            try {
                const response = await fetch(`${API_BASE}/auth/signup`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem('token', data.data.token);
                    // localStorage.setItem('user', JSON.stringify(data.data.user));
                    window.location.href = '../app/dashboard.html'; // Redirect to dashboard
                } else {
                    displayError('generalError', data.message || 'Signup failed. Please try again.');
                }
            } catch (error) {
                console.error('Signup error:', error);
                displayError('generalError', 'An unexpected error occurred. Please try again later.');
            } finally {
                setLoadingState('signupButton', false);
            }
        });
    }
});