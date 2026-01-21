import { login, getCurrentSession } from './services/authService.js';

const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const togglePasswordBtn = document.querySelector('.toggle-password');
const errorMessage = document.getElementById('errorMessage');
const forgotPasswordLink = document.querySelector('.forgot-password-link');
const signupLink = document.querySelector('.signup-link');

togglePasswordBtn.addEventListener('click', () => {
  const isPassword = passwordInput.type === 'password';
  passwordInput.type = isPassword ? 'text' : 'password';
  const icon = togglePasswordBtn.querySelector('i');
  icon.classList.toggle('bi-eye');
  icon.classList.toggle('bi-eye-slash');
});

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorMessage.classList.add('d-none');

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    showError('Please enter both email and password');
    return;
  }

  try {
    const loginBtn = loginForm.querySelector('button[type="submit"]');
    const originalText = loginBtn.textContent;
    loginBtn.disabled = true;
    loginBtn.textContent = 'Logging in...';

    await login(email, password);

    window.location.href = '/index.html';
  } catch (error) {
    showError(error.message || 'Login failed. Please check your credentials.');
    loginForm.querySelector('button[type="submit"]').disabled = false;
    loginForm.querySelector('button[type="submit"]').textContent = originalText;
  }
});

forgotPasswordLink.addEventListener('click', (e) => {
  e.preventDefault();
  alert('Password reset functionality coming soon!');
});

signupLink.addEventListener('click', (e) => {
  e.preventDefault();
  alert('ERP Onboarding coming soon!');
});

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove('d-none');
}

async function checkSession() {
  try {
    const session = await getCurrentSession();
    if (session) {
      window.location.href = '/index.html';
    }
  } catch (error) {
    console.log('No active session');
  }
}

checkSession();
