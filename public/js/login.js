// ei file ta login.html er form submit korar jonno

const loginForm = document.getElementById('loginForm');
const errorMsg = document.getElementById('errorMsg');
const successMsg = document.getElementById('successMsg');

loginForm.addEventListener('submit', async function (event) {

  event.preventDefault(); // browser er auto-refresh stop kora hocche

  // ager kono message thakle hide korchi
  errorMsg.classList.add('hidden');
  successMsg.classList.add('hidden');

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {

    // backend er existing /api/auth/login endpoint a POST request sned kora hocche
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: email, password: password })
    });

    const data = await response.json();

    // response.ok false means login fail hoyeche
    // (such like wrong password, or alumni er status still "pending"/"rejected")
    if (!response.ok) {
      errorMsg.textContent = data.message || 'Login failed. Please try again.';
      errorMsg.classList.remove('hidden');
      return;
    }

    // Login shofol hole server amader ekta "token" (JWT) send kore
    // ei token localStorage a save hoi
    //
    // localStorage কী: এটা browser এর নিজের একটা ছোট storage জায়গা,
    // যেখানে key-value আকারে ডেটা সেভ থাকে, আর পেজ reload/close করলেও
    // ডেটা মুছে যায় না (যতক্ষণ না নিজে মুছে ফেলা হয়)।
    // পরে যখন আমরা admin/alumni dashboard বানাবো, তখন এই token টা
    // প্রতিটা protected API call এর সাথে পাঠাতে হবে, যাতে সার্ভার বুঝতে
    // পারে কে login করা আছে।
    localStorage.setItem('iaamsToken', data.token);

    successMsg.textContent = 'Login successful!';
    successMsg.classList.remove('hidden');

    alert('Login successful!');

    // আপাতত role যাই হোক, সবাইকে dashboard.html এ পাঠাচ্ছি
    // পরে admin-dashboard.html বানানোর পর এখানে role অনুযায়ী ভাগ করে দিব:
    // if (data.user.role === 'admin') { window.location.href = 'admin-dashboard.html'; }
    // else { window.location.href = 'dashboard.html'; }
    window.location.href = 'dashboard.html';

  } catch (error) {
    errorMsg.textContent = 'Something went wrong. Please check your connection and try again.';
    errorMsg.classList.remove('hidden');
  }

});
