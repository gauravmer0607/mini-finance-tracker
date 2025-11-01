// Main navigation and utility script for index.html

// Get references to elements
const authButtons = document.getElementById("authButtons");
const userMenuContainer = document.getElementById("userMenuContainer");
const userNameDisplay = document.getElementById("userNameDisplay");
const userDropdown = document.getElementById("userDropdown");
const dynamicContent = document.getElementById("dynamicContent");

// Toggle user dropdown menu
function toggleUserMenu() {
  userDropdown.classList.toggle("hidden");
}

// Show profile page
function showProfile() {
  userDropdown.classList.add("hidden");
  const user = JSON.parse(localStorage.getItem("khazanaUser"));

  const profileContent = `
    <div class="profile-page">
      <h2>Profile Details</h2>
      <div class="input-group">
        <label>Full Name:</label>
        <input id="profileName" type="text" value="${user.name || ''}">
      </div>
      <div class="input-group">
        <label>Email Address:</label>
        <input id="profileEmail" type="email" value="${user.email || ''}" readonly>
      </div>
      <div class="input-group">
        <label>Age:</label>
        <input id="profileAge" type="number" value="${user.age || ''}">
      </div>
      <div class="input-group">
        <label>State:</label>
        <input id="profileState" type="text" value="${user.state || ''}">
      </div>
      <div class="input-group">
        <label>City:</label>
        <input id="profileCity" type="text" value="${user.city || ''}">
      </div>
      <div class="profile-buttons">
        <button class="btn btn-save" onclick="saveProfile()">Save Changes</button>
        <button class="btn btn-back" onclick="showLandingPage()">Go Back</button>
      </div>
    </div>
  `;
  
  dynamicContent.innerHTML = profileContent;
}

// Save profile changes
function saveProfile() {
  const user = JSON.parse(localStorage.getItem("khazanaUser"));
  const email = user.email;

  user.name = document.getElementById("profileName").value;
  user.age = document.getElementById("profileAge").value;
  user.state = document.getElementById("profileState").value;
  user.city = document.getElementById("profileCity").value;

  localStorage.setItem("khazanaUser", JSON.stringify(user));
  
  // Update in users database
  const users = JSON.parse(localStorage.getItem('khazanaUsers') || '{}');
  if (users[email]) {
    users[email] = { ...users[email], ...user };
    localStorage.setItem('khazanaUsers', JSON.stringify(users));
  }
  
  userNameDisplay.textContent = user.name;
  alert("✅ Profile updated successfully!");
}

// Return to landing page
function showLandingPage() {
  location.reload();
}

// Logout function
function logout() {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.removeItem("khazanaUser");
    localStorage.removeItem("currentUser");
    checkAuthStatus();
  }
}

// Check authentication status
function checkAuthStatus() {
  const user = JSON.parse(localStorage.getItem("khazanaUser"));
  
  if (user && user.name) {
    authButtons.classList.add("hidden");
    userMenuContainer.classList.remove("hidden");
    userNameDisplay.textContent = user.name;
  } else {
    authButtons.classList.remove("hidden");
    userMenuContainer.classList.add("hidden");
  }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
  const userMenu = document.getElementById('userMenuContainer');
  const dropdown = document.getElementById('userDropdown');
  
  if (userMenu && !userMenu.contains(event.target)) {
    dropdown.classList.add('hidden');
  }
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Navbar background on scroll
window.addEventListener('scroll', function () {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 50) {
    navbar.style.background = 'linear-gradient(135deg, rgba(46, 125, 50, 0.95), rgba(56, 142, 60, 0.95))';
    navbar.style.backdropFilter = 'blur(15px)';
  } else {
    navbar.style.background = 'linear-gradient(135deg, #2E7D32, #388E3C)';
    navbar.style.backdropFilter = 'blur(10px)';
  }
});

// Initial page load
window.addEventListener("load", () => {
  checkAuthStatus();
});