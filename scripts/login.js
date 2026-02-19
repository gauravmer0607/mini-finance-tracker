// Login functionality with localStorage/Firebase support

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const submitBtn = this.querySelector('.btn-login');
    
    // Show loading state
    submitBtn.classList.add('loading');
    submitBtn.innerHTML = '<div class="spinner"></div>';
    
    try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Get users from localStorage
        const users = JSON.parse(localStorage.getItem('khazanaUsers') || '{}');
        
        // Check if user exists
        if (!users[email]) {
            showMessage('User not found! Please sign up first.', 'error');
            resetButton(submitBtn);
            return;
        }
        
        // Verify password
        if (users[email].password !== password) {
            showMessage('Incorrect password!', 'error');
            resetButton(submitBtn);
            return;
        }
        
        // Create session
        const userData = users[email];
        localStorage.setItem('khazanaUser', JSON.stringify({
            name: userData.name,
            email: userData.email,
            age: userData.age,
            state: userData.state,
            city: userData.city,
            dob: userData.dob
        }));
        
        localStorage.setItem('currentUser', email);
        
        // Set default PIN if not exists
        if (!localStorage.getItem(`pin_${email}`)) {
            localStorage.setItem(`pin_${email}`, '123456');
        }
        
        // Success!
        showMessage('Login successful! Redirecting...', 'success');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
        
    } catch (error) {
        console.error('Login error:', error);
        showMessage('An error occurred. Please try again.', 'error');
        resetButton(submitBtn);
    }
});

function showMessage(text, type) {
    // Create or update message element
    let messageBox = document.querySelector('.message');
    if (!messageBox) {
        messageBox = document.createElement('div');
        messageBox.className = 'message';
        document.querySelector('.login-card form').prepend(messageBox);
    }
    
    messageBox.textContent = text;
    messageBox.className = `message ${type} show`;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        messageBox.classList.remove('show');
    }, 5000);
}

function resetButton(btn) {
    btn.classList.remove('loading');
    btn.innerHTML = 'Login';
}

function loginWithGoogle() {
    // Placeholder for Google OAuth
    // In real implementation, use Firebase Auth
    alert('Google login will be integrated with Firebase Auth');
}

// Auto-fill if remembered
window.addEventListener('load', () => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
        document.getElementById('email').value = rememberedEmail;
        document.getElementById('rememberMe').checked = true;
    }
});

//Remember me functionality
document.getElementById('rememberMe')?.addEventListener('change', function() {
    if (this.checked) {
        const email = document.getElementById('email').value;
        if (email) {
            localStorage.setItem('rememberedEmail', email);
        }
    } else {
        localStorage.removeItem('rememberedEmail');
    }
});