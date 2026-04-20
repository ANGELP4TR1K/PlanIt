document.addEventListener('DOMContentLoaded', function () {
    navActive();
    darkMode();
    showPassword();
});


function navActive() {
    const navItems = document.querySelectorAll('.nav-item');
    const currentPath = window.location.pathname;

    navItems.forEach(item => {
        const link = item.querySelector('a');
        if (!link) return;

        const href = link.getAttribute('href');

        // Active beállítása URL alapján
        if (href === currentPath) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }

        // Csak navbar bezárás mobilon
        item.addEventListener('click', () => {
            const navbarCollapse = document.getElementById('planitNav');
            if (navbarCollapse.classList.contains('show')) {
                const bsCollapse = new bootstrap.Collapse(navbarCollapse);
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
            } else {
                localStorage.setItem('theme', 'light');
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