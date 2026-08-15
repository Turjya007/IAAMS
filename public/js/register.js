// ei file ta register.html er form submit handle korar jonno

// 1st a form element ta khuje ber kora hocche
const registerForm = document.getElementById('registerForm');

// error er success message dekhanor jonno <p> tag duita dhore rakhchi
const errorMsg = document.getElementById('errorMsg');
const successMsg = document.getElementById('successMsg');

// form submit hole ei function ta cholbe
registerForm.addEventListener('submit', async function (event) {

  // eta na dile auto-refresh kore felbe,
  event.preventDefault();

  // ager kono error/success message thakle lukiye fela hocche
  errorMsg.classList.add('hidden');
  successMsg.classList.add('hidden');

  // form er protita input theke value niye ashchi
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const batch = document.getElementById('batch').value;
  const department = document.getElementById('department').value;
  const graduationYear = document.getElementById('graduationYear').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  // password ar confirmPassword milche ki na check korchi, server a send korar age
  if (password !== confirmPassword) {
    errorMsg.textContent = 'Password and Confirm Password did not match';
    errorMsg.classList.remove('hidden');
    return; // ekhanei theme jacche, server a request send korbe na
  }

  // try...catch diye rakhchi, coz fetch call sometimes fail korte pare (exmpl : server bondho thakte pare)
  try {

    // আমাদের আগে থেকে বানানো backend endpoint এ POST request পাঠাচ্ছি
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: name,
        email: email,
        password: password,
        batch: batch,
        department: department,
        graduationYear: graduationYear
      })
    });

    // সার্ভার যা পাঠিয়েছে সেটা JSON আকারে বের করছি
    const data = await response.json();

    // response.ok false হলে মানে সার্ভার কোনো error পাঠিয়েছে (যেমন email আগে থেকেই আছে)
    if (!response.ok) {
      errorMsg.textContent = data.message || 'Registration failed. Please try again.';
      errorMsg.classList.remove('hidden');
      return;
    }

    // সব ঠিক থাকলে success message দেখাচ্ছি
    successMsg.textContent = 'Registration successful! Please wait for admin approval before logging in.';
    successMsg.classList.remove('hidden');
    alert('Account created!');

    // ফর্মের সব field খালি করে দিচ্ছি
    registerForm.reset();

  } catch (error) {
    // fetch নিজেই fail করলে (যেমন সার্ভার বন্ধ, বা internet নেই) এই অংশ চলবে
    errorMsg.textContent = 'Something went wrong. Please check your connection and try again.';
    errorMsg.classList.remove('hidden');
  }

});
