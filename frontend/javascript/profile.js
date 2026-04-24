document.addEventListener('DOMContentLoaded', async function () {
    darkMode();
    if (window.location.pathname === '/profile') {
        if (await userSessionCheck())
        {
            await loadProfileData();
            setupProfileEventListeners();
        }
        else
        {
            showProfileAuthError();
        }
    }
});

function showNotification(message, type = 'success', duration = 3000) {
    const container = document.getElementById('notificationContainer');
    if (!container) return;

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    container.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('hide');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, duration);
}

function showProfileAuthError() {
    const errorContainer = document.querySelector('.auth-error-container');
    if (errorContainer) {
        errorContainer.classList.add('show');
    }

    const loginBtn = document.getElementById('authErrorLoginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const loginModalEl = document.getElementById('loginModal');
            const modal = new bootstrap.Modal(loginModalEl);
            modal.show();
            loginModal();
            registerModal();
        });
    }
}

async function loadProfileData() {
    try {
        const response = await fetch('/api/profile', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.error('Hiba a profil lekérésekor');
            return;
        }

        const userData = await response.json();

        // Display profile content
        document.getElementById('profileContent').style.display = 'block';

        // Display user data
        document.getElementById('displayUsername').textContent = userData.username;
        document.getElementById('displayFullName').textContent = userData.full_name;
        document.getElementById('displayEmail').textContent = userData.email;
        console.log(userData.created_at);
        // Display created date if available
        if (userData.created_at) {
            const createdDate = new Date(userData.created_at);
            const formattedDate = createdDate.toLocaleDateString('hu-HU', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
            document.getElementById('displayCreatedAt').textContent = formattedDate;
        }

        // Fill form fields
        document.getElementById('editUsername').value = userData.username;
        document.getElementById('editFullName').value = userData.full_name;

        // Store current user data for comparison
        window.currentUserData = userData;

    } catch (error) {
        console.error('Hiba a profil betöltésekor:', error);
    }
}

function setupProfileEventListeners() {
    // Username Edit
    const editUsernameBtn = document.getElementById('editUsernameBtn');
    const usernameDisplay = document.getElementById('usernameDisplay');
    const usernameEditForm = document.getElementById('usernameEditForm');
    const cancelUsernameBtn = document.getElementById('cancelUsernameBtn');

    editUsernameBtn.addEventListener('click', () => {
        usernameDisplay.style.display = 'none';
        usernameEditForm.style.display = 'block';
        document.getElementById('editUsername').focus();
    });

    cancelUsernameBtn.addEventListener('click', () => {
        usernameDisplay.style.display = 'block';
        usernameEditForm.style.display = 'none';
    });

    usernameEditForm.addEventListener('submit', handleUsernameSubmit);

    // Full Name Edit
    const editFullNameBtn = document.getElementById('editFullNameBtn');
    const fullNameDisplay = document.getElementById('fullNameDisplay');
    const fullNameEditForm = document.getElementById('fullNameEditForm');
    const cancelFullNameBtn = document.getElementById('cancelFullNameBtn');

    editFullNameBtn.addEventListener('click', () => {
        fullNameDisplay.style.display = 'none';
        fullNameEditForm.style.display = 'block';
        document.getElementById('editFullName').focus();
    });

    cancelFullNameBtn.addEventListener('click', () => {
        fullNameDisplay.style.display = 'block';
        fullNameEditForm.style.display = 'none';
    });

    fullNameEditForm.addEventListener('submit', handleFullNameSubmit);

    // Password Change Form
    document.getElementById('passwordChangeForm').addEventListener('submit', handlePasswordChange);

    // Password visibility toggles
    showPassword();

    // Delete Profile Button
    const deleteProfileBtn = document.getElementById('deleteProfileBtn');
    if (deleteProfileBtn) {
        deleteProfileBtn.addEventListener('click', handleDeleteProfile);
    }
}

async function handleUsernameSubmit(e) {
    e.preventDefault();

    const username = document.getElementById('editUsername').value;
    const errorDiv = document.getElementById('usernameEditError');

    if (!username || username.trim() === '') {
        errorDiv.classList.add('show');
        errorDiv.textContent = 'A felhasználónév nem lehet üres';
        return;
    }

    try {
        const response = await fetch('/api/usernameupdate', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                full_name: window.currentUserData.full_name,
                email: window.currentUserData.email
            })
        });

        const data = await response.json();

        if (!response.ok) {
            errorDiv.classList.add('show');
            errorDiv.textContent = data.message || 'Hiba a felhasználónév frissítésekor';
            return;
        }

        // Update display
        document.getElementById('displayUsername').textContent = username;
        window.currentUserData.username = username;

        // Hide form, show display
        document.getElementById('usernameDisplay').style.display = 'block';
        document.getElementById('usernameEditForm').style.display = 'none';

        // Clear messages
        errorDiv.classList.remove('show');
        errorDiv.textContent = '';

        // Show success message
        showNotification('Felhasználónév sikeresen frissítve!', 'success');

    } catch (error) {
        console.error('Hiba:', error);
        errorDiv.classList.add('show');
        errorDiv.textContent = 'Hálózati hiba történt';
    }
}

async function handleFullNameSubmit(e) {
    e.preventDefault();

    const full_name = document.getElementById('editFullName').value;
    const errorDiv = document.getElementById('fullNameEditError');

    if (!full_name || full_name.trim() === '') {
        errorDiv.classList.add('show');
        errorDiv.textContent = 'A teljes név nem lehet üres';
        return;
    }

    try {
        const response = await fetch('/api/fullnameupdate', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: window.currentUserData.username,
                full_name,
                email: window.currentUserData.email
            })
        });

        const data = await response.json();

        if (!response.ok) {
            errorDiv.classList.add('show');
            errorDiv.textContent = data.message || 'Hiba a teljes név frissítésekor';
            return;
        }

        // Update display
        document.getElementById('displayFullName').textContent = full_name;
        window.currentUserData.full_name = full_name;

        // Hide form, show display
        document.getElementById('fullNameDisplay').style.display = 'block';
        document.getElementById('fullNameEditForm').style.display = 'none';

        // Clear messages
        errorDiv.classList.remove('show');
        errorDiv.textContent = '';

        // Show success message
        showNotification('Teljes név sikeresen frissítve!', 'success');

    } catch (error) {
        console.error('Hiba:', error);
        errorDiv.classList.add('show');
        errorDiv.textContent = 'Hálózati hiba történt';
    }
}

async function handlePasswordChange(e) {
    e.preventDefault();

    const current_password = document.getElementById('currentPassword').value;
    const new_password = document.getElementById('newPassword').value;
    const confirm_password = document.getElementById('confirmPassword').value;
    const errorDiv = document.getElementById('passwordChangeError');

    errorDiv.classList.remove('show');
    errorDiv.textContent = '';

    if (new_password !== confirm_password) {
        errorDiv.classList.add('show');
        errorDiv.textContent = 'Az új jelszavak nem egyeznek';
        return;
    }

    try {
        const response = await fetch('/api/passwordupdate', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ current_password, new_password })
        });

        const data = await response.json();

        if (!response.ok) {
            errorDiv.classList.add('show');
            errorDiv.textContent = data.message || 'Hiba a jelszó frissítésekor';
            return;
        }

        // Clear form and show success
        document.getElementById('passwordChangeForm').reset();
        showNotification('Jelszó sikeresen frissítve!', 'success');

    } catch (error) {
        console.error('Hiba:', error);
        errorDiv.classList.add('show');
        errorDiv.textContent = 'Hálózati hiba történt';
    }
}


function handleDeleteProfile() {
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteProfileModal'));
    deleteModal.show();

    const confirmBtn = document.getElementById('confirmDeleteBtn');
    confirmBtn.onclick = async () => {
        await performDeleteProfile(deleteModal);
    };
}

async function performDeleteProfile(modal) {
    const errorDiv = document.getElementById('deleteProfileError');
    errorDiv.classList.remove('show');

    try {
        const response = await fetch('/api/profile', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!response.ok) {
            modal.hide();
            errorDiv.classList.add('show');
            errorDiv.textContent = data.message || 'Hiba a profil törléskor';
            return;
        }

        // Profil sikeresen törölve - átirányítás
        showNotification('Profilod sikeresen törölve. Átirányítunk...', 'success', 2000);
        setTimeout(() => {
            window.location.href = '/';
        }, 2000);

    } catch (error) {
        console.error('Hiba:', error);
        modal.hide();
        errorDiv.classList.add('show');
        errorDiv.textContent = 'Hálózati hiba történt';
    }
}