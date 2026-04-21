document.addEventListener('DOMContentLoaded', async function () {
    navActive();
    darkMode();
    if(await userSessionCheck())
    {
        profilButton();
    }
    else
    {
        loginModal();
        registerModal();
        showPassword();
    }
    if (typeof initMap === "function") {
        initMap();
        fetchEvents();
        setupMapFilters();
    }

    

});

async function userSessionCheck()
{
    const res = await fetch('/api/userSession', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
    const data = await res.json();
    return data.session;
}

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

function loginModal()
{
    const form = document.getElementById('loginForm');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: form.email.value , password: form.password.value })
            });

            const data = await res.json();
            if (res.ok) {
                // modal bezárása
                const modalEl = document.getElementById('loginModal');
                const modal = bootstrap.Modal.getInstance(modalEl);
                modal.hide();
                form.reset();
                const loginErrorDiv = document.getElementById('loginError');
                loginErrorDiv.classList.remove('show');
                loginErrorDiv.textContent = '';
                location.reload();
                // opcionális redirect
                // window.location.href = '/dashboard';

            } else {
                const loginErrorDiv = document.getElementById('loginError');
                loginErrorDiv.classList.add('show');
                loginErrorDiv.textContent = data.message || 'Hiba történt a bejelentkezés során';
            }

        } catch (err) {
            console.error(err);
            alert('Hálózati hiba');
        }
    });
}


function registerModal()
{
    const form = document.getElementById('registerForm');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username : form.userName.value, email: form.regEmail.value, password: form.regPassword.value, full_name: form.regName.value })
            });

            const data = await res.json();
            if (res.ok) {
                // modal bezárása
                const modalEl = document.getElementById('registerModal');
                const modal = bootstrap.Modal.getInstance(modalEl);
                modal.hide();
                form.reset();
                const registerErrorDiv = document.getElementById('registerError');
                registerErrorDiv.classList.remove('show');
                registerErrorDiv.textContent = '';
                location.reload();
                // opcionális redirect
                // window.location.href = '/dashboard';

            } else {
                const registerErrorDiv = document.getElementById('registerError');
                registerErrorDiv.classList.add('show');
                registerErrorDiv.textContent = data.message || 'Hiba történt a regisztráció során';
            }

        } catch (err) {
            console.error(err);
            alert('Hálózati hiba');
        }
    });
}

function profilButton(){
    const loggedIn = document.getElementById('loggedIn');
    const loggedOut = document.getElementById('loggedOut');
    loggedOut.style.display = 'none';
    loggedIn.style.display = 'block';

    const ulItem = document.createElement('li');
    const dropdownItem = document.createElement('button');
    dropdownItem.classList.add('dropdown-item');
    dropdownItem.textContent = 'Profilom';
    dropdownItem.addEventListener('click', () => {
        window.location.href = '/profile';
    });

    const ulItem2 = document.createElement('li');
    const dropdownItem2 = document.createElement('button');
    dropdownItem2.classList.add('dropdown-item');
    dropdownItem2.textContent = 'Kijelentkezés';
    dropdownItem2.style.marginTop = '10px';
    dropdownItem2.addEventListener('click', async () => {
        try {
            const res = await fetch('/api/logout', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const data = await res.json();
            if (res.ok) {
                window.location.href = '/';
            } else {
                alert('Hiba történt a kijelentkezés során');
            }
        } catch (err) {
            console.error(err);
            alert('Hálózati hiba');
        }
    });

    ulItem2.appendChild(dropdownItem2);
    ulItem.appendChild(dropdownItem);
    loggedIn.appendChild(ulItem);
    loggedIn.appendChild(ulItem2);

}