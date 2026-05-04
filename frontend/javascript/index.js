let _notifTimeout = null;

function showNotification(message, type = 'success', duration = 3000) {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    if (_notifTimeout) clearTimeout(_notifTimeout);

    const el = document.createElement('div');
    el.className = `notification notification-${type}`;
    el.textContent = message;
    document.body.appendChild(el);

    _notifTimeout = setTimeout(() => {
        el.style.animation = 'notifSlideOut 0.3s ease forwards';
        setTimeout(() => el.remove(), 300);
    }, duration);
}

document.addEventListener('DOMContentLoaded', async function () {
    navActive();
    darkMode();

    if(await userSessionCheck())
    {
        await profilButton();
    }
    else
    {
        loginModal();
        registerModal();
        forgotPasswordModal();
        resetPasswordModal();
        showPassword();
    }
    if (typeof initMap === "function") {
        initMap();
        fetchEvents();
        setupMapFilters();
    }

    // Invite link handling: if URL path is /invite/<token>
    const path = window.location.pathname;
    const inviteMatch = path.match(/^\/invite\/([a-zA-Z0-9_-]+)/);
    if (inviteMatch) {
        const token = inviteMatch[1];
        handleInviteToken(token);
    }
});

async function handleInviteToken(token) {
    try {
        const res = await fetch(`/api/invite/${token}`);
        const data = await res.json();
        if (!res.ok) {
           showNotification(data.message || 'Meghívó nem található', 'error');
            return;
        }

        const invite = data.invite;
        const titleEl = document.getElementById('inviteEventTitle');
        const detailsEl = document.getElementById('inviteEventDetails');
        const joinBtn = document.getElementById('inviteJoinBtn');
        const loginBtn = document.getElementById('inviteLoginBtn');
        const errorDiv = document.getElementById('inviteError');

        titleEl.textContent = invite.name || invite.event_title || 'Esemény';
        detailsEl.textContent = `Helyszín: ${invite.location} · Dátum: ${new Date(invite.date).toLocaleString('hu-HU')}`;
        errorDiv.textContent = '';

        // show/hide login button depending on session
        const session = await userSessionCheck();
        if (!session) {
            joinBtn.style.display = 'none';
            loginBtn.textContent = 'Bejelentkezés';
            loginBtn.onclick = () => {
                const modal = new bootstrap.Modal(document.getElementById('loginModal'));
                modal.show();
            };
        } else {
            joinBtn.style.display = 'inline-block';
            loginBtn.style.display = 'none';
            joinBtn.onclick = async () => {
                // call join API
                try {
                    const r = await fetch('/api/invite/join', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ token })
                    });
                    const jd = await r.json();
                    if (r.ok) {
                        const modalEl = document.getElementById('inviteModal');
                        const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
                        modal.hide();
                        showNotification('Sikeresen csatlakoztál az eseményhez', 'success');
                        // redirect to profile or reload to show My events
                        setTimeout(() => { window.location.href = '/profile'; }, 800);
                    } else {
                        errorDiv.textContent = jd.message || 'Csatlakozás sikertelen';
                    }
                } catch (err) {
                    console.error(err);
                    errorDiv.textContent = 'Hálózati hiba';
                }
            };
        }

        const modal = new bootstrap.Modal(document.getElementById('inviteModal'));
        modal.show();
    } catch (err) {
        console.error(err);
        showNotification('Hiba történt a meghívó betöltésekor', 'error');
    }
}

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
            showNotification('Hálózati hiba', 'error');
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
            showNotification('Hálózati hiba', 'error');
        }
    });
}

async function profilButton(){
    const loggedIn = document.getElementById('loggedIn');
    const loggedOut = document.getElementById('loggedOut');
    loggedOut.style.display = 'none';
    loggedIn.style.display = 'block';

    let userRole = null;
    try {
        const response = await fetch('/api/userRole', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        if (data.session) {
            userRole = data.role;
        }
    } catch (error) {
        console.error('Error fetching user role:', error);
    }

    const ulItem = document.createElement('li');
    const dropdownItem = document.createElement('button');
    dropdownItem.classList.add('dropdown-item');
    dropdownItem.textContent = 'Profilom';
    dropdownItem.addEventListener('click', () => {
        window.location.href = '/profile';
    });

    ulItem.appendChild(dropdownItem);
    loggedIn.appendChild(ulItem);

    if (userRole === 'szervezo' || userRole === 'admin') {
        const ulItem3 = document.createElement('li');
        const dropdownItem3 = document.createElement('button');
        dropdownItem3.classList.add('dropdown-item');
        dropdownItem3.textContent = 'Szervezés';
        dropdownItem3.style.marginTop = '10px';
        dropdownItem3.addEventListener('click', () => {
            window.location.href = '/szervezo';
        });
        ulItem3.appendChild(dropdownItem3);
        loggedIn.appendChild(ulItem3);
    }

    if (userRole === 'admin') {
        const ulItemAdmin = document.createElement('li');
        const dropdownItemAdmin = document.createElement('button');
        dropdownItemAdmin.classList.add('dropdown-item');
        dropdownItemAdmin.textContent = 'Admin panel';
        dropdownItemAdmin.style.marginTop = '10px';
        dropdownItemAdmin.addEventListener('click', () => {
            window.location.href = '/admin';
        });
        ulItemAdmin.appendChild(dropdownItemAdmin);
        loggedIn.appendChild(ulItemAdmin);
    }

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
                showNotification(data.message || 'Hiba történt a kijelentkezés során', 'error');
            }
        } catch (err) {
            console.error(err);
            showNotification('Hálózati hiba', 'error');
        }
    });

    ulItem2.appendChild(dropdownItem2);
    loggedIn.appendChild(ulItem2);

}

function forgotPasswordModal() {
    const form = document.getElementById('forgotPasswordForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('forgotEmail').value;

        try {
            const res = await fetch('/api/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await res.json();
            const errorDiv = document.getElementById('forgotPasswordError');
            const successDiv = document.getElementById('forgotPasswordSuccess');

            if (res.ok) {
                successDiv.classList.add('show');
                successDiv.textContent = data.message;
                errorDiv.classList.remove('show');
                errorDiv.textContent = '';
                form.reset();
                setTimeout(() => {
                    const modal = bootstrap.Modal.getInstance(document.getElementById('forgotPasswordModal'));
                    modal.hide();
                }, 2000);
            } else {
                errorDiv.classList.add('show');
                errorDiv.textContent = data.message || 'Hiba történt a jelszó újítás során';
                successDiv.classList.remove('show');
                successDiv.textContent = '';
            }
        } catch (err) {
            console.error(err);
            showNotification('Hálózati hiba', 'error');
        }
    });
}

function resetPasswordModal() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
        document.getElementById('resetToken').value = token;
        const modal = new bootstrap.Modal(document.getElementById('resetPasswordModal'));
        modal.show();
    }

    const form = document.getElementById('resetPasswordForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const token = document.getElementById('resetToken').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        if (newPassword !== confirmPassword) {
            const errorDiv = document.getElementById('resetPasswordError');
            errorDiv.classList.add('show');
            errorDiv.textContent = 'A jelszavak nem egyeznek!';
            return;
        }

        try {
            const res = await fetch('/api/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token, newPassword })
            });

            const data = await res.json();
            const errorDiv = document.getElementById('resetPasswordError');
            const successDiv = document.getElementById('resetPasswordSuccess');

            if (res.ok) {
                successDiv.classList.add('show');
                successDiv.textContent = data.message;
                errorDiv.classList.remove('show');
                errorDiv.textContent = '';
                form.reset();
                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);
            } else {
                errorDiv.classList.add('show');
                errorDiv.textContent = data.message || 'Hiba történt a jelszó újítás során';
                successDiv.classList.remove('show');
                successDiv.textContent = '';
            }
        } catch (err) {
            console.error(err);
            showNotification('Hálózati hiba', 'error');
        }
    });
}

function redirectToLogin(contentContainer, text = 'Az oldal megtekintéséhez be kell jelentkezned.') {
    if (contentContainer) {
        contentContainer.innerHTML = '';
    }

    const screen = document.createElement('div');
    screen.className = 'access-denied-screen';

    const card = document.createElement('div');
    card.className = 'access-denied-card';

    card.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" height="64px" viewBox="0 -960 960 960" width="64px" fill="currentColor">
            <path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q54 0 104-17.5t92-50.5L228-676q-33 42-50.5 92T160-480q0 134 93 227t227 93Zm252-140q33-42 50.5-92T800-480q0-134-93-227t-227-93q-54 0-104 17.5T284-732l448 432Z"/>
        </svg>
        <h2>Bejelentkezés szükséges</h2>
        <p>${text}</p>
    `;

    const button = document.createElement('button');
    button.className = 'btn-back-home';
    button.textContent = 'Bejelentkezés';
    button.addEventListener('click', () => {
        const modal = new bootstrap.Modal(document.getElementById('loginModal'));
        modal.show();
    });

    card.appendChild(button);
    screen.appendChild(card);

    if (contentContainer) {
        contentContainer.appendChild(screen);
    } else {
        document.body.appendChild(screen);
    }
}

function formatDate(dateStr) {
    const [datePart, timePart] = dateStr.split('T');
    const date = datePart.replace('-', '. ').replace('-', '. ') + '.';
    const time = timePart ? timePart.substring(0, 5) : null;
    return time && time !== '00:00' ? `${date} ${time}` : date;
}
