document.addEventListener('DOMContentLoaded', function () {
    navActive();
    darkMode();
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
    switchers.forEach(btn => {
        btn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
        });
    });
}
