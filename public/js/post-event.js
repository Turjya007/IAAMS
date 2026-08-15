const token = localStorage.getItem('iaamsToken');

if (!token) {
  window.location.href = 'login.html';
}

const postEventForm = document.getElementById('postEventForm');
const errorMsg = document.getElementById('errorMsg');
const successMsg = document.getElementById('successMsg');

// ======== Admin hole Sidebar a Admin Panel link dekhano ========
async function checkAdminAndShowLink() {
  try {
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token }
    });

    const data = await response.json();

    if (!response.ok) {
      return;
    }

    if (data.role === 'admin') {
      document.getElementById('adminPanelLink').classList.remove('hidden');
    }

  } catch (error) {
    console.log('Error checking role:', error);
  }
}

postEventForm.addEventListener('submit', async function (event) {

  event.preventDefault();

  errorMsg.classList.add('hidden');
  successMsg.classList.add('hidden');

  const title = document.getElementById('title').value;
  const description = document.getElementById('description').value;
  const place = document.getElementById('place').value;
  const eventDate = document.getElementById('eventDate').value;
  const registrationDeadline = document.getElementById('registrationDeadline').value;
  const registrationFee = document.getElementById('registrationFee').value;
  const bkashNumber = document.getElementById('bkashNumber').value;

  try {

    const response = await fetch('/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        title: title,
        description: description,
        place: place,
        eventDate: eventDate,
        registrationDeadline: registrationDeadline,
        registrationFee: registrationFee,
        bkashNumber: bkashNumber 
      })
    });

    const data = await response.json();

    if (!response.ok) {
      errorMsg.textContent = data.message || 'Something went wrong. Please try again.';
      errorMsg.classList.remove('hidden');
      return;
    }

    successMsg.textContent = data.message; // Backend theke asha msg dekhano hocche
    successMsg.classList.remove('hidden');

    postEventForm.reset(); // Form khali kore dowa hocche

  } catch (error) {
    errorMsg.textContent = 'Something went wrong. Please check your connection.';
    errorMsg.classList.remove('hidden');
  }

});

// ============ Logout ============
document.getElementById('logoutBtn').addEventListener('click', function () {
  localStorage.removeItem('iaamsToken');
  window.location.href = 'login.html';
});

// page load howar sathe sathe role check korchi
checkAdminAndShowLink();