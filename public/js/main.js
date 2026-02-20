document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Toggle mobile navigation menu
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburger.querySelector('i').classList.toggle('fa-bars');
            hamburger.querySelector('i').classList.toggle('fa-times');
        });
    }

    // Close mobile menu when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                hamburger.querySelector('i').classList.remove('fa-times');
                hamburger.querySelector('i').classList.add('fa-bars');
            }
        });
    });

    // Highlight current page in navigation
    const currentPage = window.location.pathname.split('/').pop().split('.')[0]; // e.g., "index", "dashboard"
    const isAppPage = window.location.pathname.includes('/app/');
    
    // For app pages, the path needs special handling due to `../public`
    let dataPageName;
    if (isAppPage) {
        if (currentPage === 'dashboard') dataPageName = 'dashboard';
        else if (currentPage === 'profile') dataPageName = 'profile';
        else if (currentPage === 'settings') dataPageName = 'settings';
        else dataPageName = 'index'; // Fallback if somehow on an app page not matching
    } else {
        dataPageName = currentPage; // For public pages like index, login, signup
        if (dataPageName === 'login' || dataPageName === 'signup') {
            // Auth pages should not highlight home as current page, but auth links
            // The HTML already handles the current-page class for login/signup btns
            return;
        }
    }

    navLinks.forEach(link => {
        link.classList.remove('current-page'); // Remove from all first
        if (link.dataset.page === dataPageName) {
            link.classList.add('current-page');
        }
    });

    // Handle authentication links visibility
    const token = localStorage.getItem('token');
    const authLinks = document.querySelector('.auth-links');
    const navLoginBtn = document.querySelector('.nav-login');
    const navSignupBtn = document.querySelector('.nav-signup');

    if (authLinks && navLoginBtn && navSignupBtn) {
        if (token) {
            // User is logged in, hide Login/Signup
            authLinks.style.display = 'none';
            // Optionally, show a logout button in the header if desired,
            // but for now, the logout is in the dashboard.
        } else {
            // User is not logged in, show Login/Signup
            authLinks.style.display = 'flex'; // Or 'block' depending on layout
        }
    }
});

// Smooth scrolling for anchor links (if any)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});