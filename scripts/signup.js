// State-City mapping for India
const stateCityMap = {
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Tirupati"],
  "Arunachal Pradesh": ["Itanagar", "Naharlagun"],
  "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat"],
  "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur"],
  "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba"],
  "Goa": ["Panaji", "Margao", "Vasco da Gama"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar"],
  "Haryana": ["Gurgaon", "Faridabad", "Panipat", "Ambala", "Karnal"],
  "Himachal Pradesh": ["Shimla", "Manali", "Dharamshala", "Kullu"],
  "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro"],
  "Karnataka": ["Bengaluru", "Mysuru", "Mangaluru", "Hubli", "Belagavi"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad"],
  "Manipur": ["Imphal"],
  "Meghalaya": ["Shillong"],
  "Mizoram": ["Aizawl"],
  "Nagaland": ["Kohima", "Dimapur"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Puri"],
  "Punjab": ["Amritsar", "Ludhiana", "Jalandhar", "Patiala"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer"],
  "Sikkim": ["Gangtok"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad"],
  "Tripura": ["Agartala"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi", "Noida", "Agra"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Rishikesh"],
  "West Bengal": ["Kolkata", "Siliguri", "Durgapur", "Asansol"],
  "Delhi": ["New Delhi"],
  "Jammu and Kashmir": ["Srinagar", "Jammu"],
  "Ladakh": ["Leh", "Kargil"]
};

// Populate state datalist
const stateInput = document.getElementById("state");
const stateList = document.getElementById("stateList");
const citySelect = document.getElementById("city");

Object.keys(stateCityMap).forEach((state) => {
  let option = document.createElement("option");
  option.value = state;
  stateList.appendChild(option);
});

// Update cities when state changes
stateInput.addEventListener("input", function () {
  const selectedState = this.value;
  citySelect.innerHTML = "<option value=''>Select city</option>";

  if (stateCityMap[selectedState]) {
    stateCityMap[selectedState].forEach((city) => {
      let option = document.createElement("option");
      option.value = city;
      option.textContent = city;
      citySelect.appendChild(option);
    });
  }
});

// Password strength checker
document.getElementById("password").addEventListener("input", function() {
    const password = this.value;
    const strengthIndicator = document.getElementById("passwordStrength");
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    
    strengthIndicator.className = 'password-strength';
    if (strength === 1 || strength === 2) {
        strengthIndicator.classList.add('weak');
    } else if (strength === 3) {
        strengthIndicator.classList.add('medium');
    } else if (strength >= 4) {
        strengthIndicator.classList.add('strong');
    }
});

// Form submission
document.getElementById("signupForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  
  const messageBox = document.getElementById("messageBox");
  const submitBtn = this.querySelector('.btn-signup');
  
  // Get form data
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const dob = document.getElementById("dob").value;
  const state = document.getElementById("state").value;
  const city = document.getElementById("city").value;
  const termsAccepted = document.getElementById("terms").checked;
  
  // Validation
  if (password !== confirmPassword) {
    showMessage("Passwords do not match!", "error");
    return;
  }
  
  if (!termsAccepted) {
    showMessage("Please accept the terms and conditions.", "error");
    return;
  }
  
  // Calculate age
  const dobDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - dobDate.getFullYear();
  const m = today.getMonth() - dobDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
    age--;
  }

  if (age < 13) {
    showMessage("You must be at least 13 years old to sign up.", "error");
    return;
  }
  
  // Show loading
  submitBtn.classList.add('loading');
  
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('khazanaUsers') || '{}');
    
    if (users[email]) {
      showMessage('User already exists! Please login.', 'error');
      submitBtn.classList.remove('loading');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);
      return;
    }

    // Save user data
    users[email] = {
      name: name,
      email: email,
      password: password, // In production, hash this!
      dob: dob,
      age: age,
      state: state,
      city: city,
      createdAt: new Date().toISOString()
    };

    localStorage.setItem('khazanaUsers', JSON.stringify(users));

    // Set default PIN
    localStorage.setItem(`pin_${email}`, '123456');
    
    // Initialize empty transactions
    localStorage.setItem(`transactions_${email}`, JSON.stringify([]));
    localStorage.setItem(`balance_${email}`, '0');

    // Success!
    showMessage('Account created successfully! Redirecting to login...', 'success');
    
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 2000);
    
  } catch (error) {
    console.error('Signup error:', error);
    showMessage('An error occurred. Please try again.', 'error');
    submitBtn.classList.remove('loading');
  }
});

function showMessage(text, type) {
  const messageBox = document.getElementById("messageBox");
  messageBox.textContent = text;
  messageBox.className = `message ${type} show`;
  
  setTimeout(() => {
    messageBox.classList.remove('show');
  }, 5000);
}

function signupWithGoogle() {
  alert('Google signup will be integrated with Firebase Auth');
}