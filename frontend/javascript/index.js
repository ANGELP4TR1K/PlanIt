document.addEventListener('DOMContentLoaded', function () {
    navActive();
    darkMode();
    showPassword();
    if (typeof initMap === "function") {
        initMap();
        fetchEvents();
        setupMapFilters();
    }

});


function navActive() {
    let navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', function () {
            navItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            let navbarCollapse = document.getElementById('planitNav');
            if (navbarCollapse.classList.contains('show')) {
                let bsCollapse = new bootstrap.Collapse(navbarCollapse);
                bsCollapse.hide();
            }
        });
    });
}

function darkMode() {
    let switchers = document.querySelectorAll('#theme-switcher');

    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }

    switchers.forEach(btn => {
        btn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');

            if (document.body.classList.contains('dark-mode')) {
                localStorage.setItem('theme', 'dark');
                if (window.mapFunctions && typeof window.mapFunctions.updateMapTheme === "function") {
                    window.mapFunctions.updateMapTheme();
                }
            } else {
                localStorage.setItem('theme', 'light');
                if (window.mapFunctions && typeof window.mapFunctions.updateMapTheme === "function") {
                    window.mapFunctions.updateMapTheme();
                }
            }
        });
    });
}

function showPassword() {
    document.querySelectorAll('.eye-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            let input = this.parentElement.querySelector('input');
            let eyeOpen = this.querySelector('.eye-open');
            let eyeClosed = this.querySelector('.eye-closed');

            let isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';

            eyeOpen.style.display = isPassword ? 'none' : 'block';
            eyeClosed.style.display = isPassword ? 'block' : 'none';
        });
    });
}