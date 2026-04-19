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
                loginErrorDiv.innerHTML = '';
                loginErrorDiv.style = '';
                location.reload();
                // opcionális redirect
                // window.location.href = '/dashboard';

            } else {
                const errorElement = document.createElement('p');
                errorElement.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#EA3323"><path d="M508.5-291.5Q520-303 520-320t-11.5-28.5Q497-360 480-360t-28.5 11.5Q440-337 440-320t11.5 28.5Q463-280 480-280t28.5-11.5ZM440-440h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z"/></svg> ' + data.message ||  '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#EA3323"><path d="M508.5-291.5Q520-303 520-320t-11.5-28.5Q497-360 480-360t-28.5 11.5Q440-337 440-320t11.5 28.5Q463-280 480-280t28.5-11.5ZM440-440h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z"/></svg> Hiba történt a bejelentkezés során';
                const loginErrorDiv = document.getElementById('loginError');
                loginErrorDiv.innerHTML = '';
                loginErrorDiv.style.color = 'red';
                loginErrorDiv.style.backgroundColor = '#f8d7da';
                loginErrorDiv.style.paddingTop = '10px';
                loginErrorDiv.style.paddingLeft = '20px';
                loginErrorDiv.style.borderRadius = '15px';
                loginErrorDiv.style.border = '3px solid red';
                loginErrorDiv.appendChild(errorElement);

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
                registerErrorDiv.innerHTML = '';
                registerErrorDiv.style = '';
                location.reload();
                // opcionális redirect
                // window.location.href = '/dashboard';

            } else {
                const errorElement = document.createElement('p');
                errorElement.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#EA3323"><path d="M508.5-291.5Q520-303 520-320t-11.5-28.5Q497-360 480-360t-28.5 11.5Q440-337 440-320t11.5 28.5Q463-280 480-280t28.5-11.5ZM440-440h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z"/></svg> ' + data.message ||  '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#EA3323"><path d="M508.5-291.5Q520-303 520-320t-11.5-28.5Q497-360 480-360t-28.5 11.5Q440-337 440-320t11.5 28.5Q463-280 480-280t28.5-11.5ZM440-440h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z"/></svg> Hiba történt a regisztráció során';
                const registerErrorDiv = document.getElementById('registerError');
                registerErrorDiv.innerHTML = '';
                registerErrorDiv.style.color = 'red';
                registerErrorDiv.style.backgroundColor = '#f8d7da';
                registerErrorDiv.style.paddingTop = '10px';
                registerErrorDiv.style.paddingLeft = '20px';
                registerErrorDiv.style.borderRadius = '15px';
                registerErrorDiv.style.border = '3px solid red';
                registerErrorDiv.appendChild(errorElement);
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