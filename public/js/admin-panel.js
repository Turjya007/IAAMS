const token = localStorage.getItem('iaamsToken');

if (!token) {
  window.location.href = 'login.html';
}

// ============ Sidebar ট্যাব সুইচ করার Logic (dashboard.js থেকে হুবহু কপি) ============

const navButtons = document.querySelectorAll('.nav-btn');

navButtons.forEach(function (button) {
  button.addEventListener('click', function () {

    // এই লিংক বাটন গুলার (যেমন "Back to Dashboard") data-section নাই,
    // তাই সেগুলার জন্য এই ট্যাব-সুইচ লজিক স্কিপ করতে হবে, নাহলে error আসবে
    const sectionName = button.getAttribute('data-section');
    if (!sectionName) {
      return; // data-section না থাকলে এখানেই থেমে যাচ্ছি, নিচের কোড চলবে না
    }

    navButtons.forEach(function (btn) {
      btn.classList.remove('active');
    });

    button.classList.add('active');

    document.querySelectorAll('.content-section').forEach(function (section) {
      section.classList.add('hidden');
    });

    document.getElementById('section-' + sectionName).classList.remove('hidden');

    // কোন ট্যাবে ক্লিক হলো তার ওপর ভিত্তি করে ডেটা লোড করছি
    if (sectionName === 'pendingUsers') {
      loadPendingUsers();
    } else if (sectionName === 'pendingEvents') {
      loadPendingEvents();
    } else if (sectionName === 'payments') {
      loadPendingPayments();
    }
  });
});


function formatDate(dateString) {
  const dateObj = new Date(dateString);
  return dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
// ============ Pending Alumni লিস্ট Load করা ============
async function loadPendingUsers() {
  const container = document.getElementById('pendingUsersContainer');
  container.innerHTML = '<p>Loading...</p>';

  try {
    const response = await fetch('/api/admin/pending-users', {
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token }
    });

    const data = await response.json();

    if (!response.ok) {
      container.innerHTML = '<p>Could not load pending alumni.</p>';
      return;
    }

    displayPendingUsers(data);

  } catch (error) {
    container.innerHTML = '<p>Something went wrong.</p>';
  }
}

function displayPendingUsers(users) {
  const container = document.getElementById('pendingUsersContainer');

  if (users.length === 0) {
    container.innerHTML = '<p class="empty-message">No pending alumni right now.</p>';
    return;
  }

  container.innerHTML = '';

  for (let i = 0; i < users.length; i++) {
    const user = users[i];

    // user._id কে onclick এর ভেতরে পাঠাচ্ছি, যাতে approveUser/rejectUser
    // ফাংশন জানতে পারে ঠিক কোন user কে approve/reject করতে হবে
    const cardHTML = `
      <div class="admin-item-card">
        <h3 class="admin-item-title">${user.name}</h3>
        <p class="admin-item-info">Email: ${user.email}</p>
        <p class="admin-item-info">Batch: ${user.batch || 'Not provided'}</p>
        <p class="admin-item-info">Department: ${user.department || 'Not provided'}</p>
        <p class="admin-item-info">Graduation Year: ${user.graduationYear || 'Not provided'}</p>

        <div class="action-buttons">
          <button class="btn-approve" onclick="approveUser('${user._id}')">Approve</button>
          <button class="btn-reject" onclick="rejectUser('${user._id}')">Reject</button>
        </div>
      </div>
    `;

    container.innerHTML += cardHTML;
  }
}

// ============ Approve / Reject করার Logic ============

// এই দুইটা ফাংশন window এ (global scope এ) থাকতে হবে,
// কারণ HTML এর onclick থেকে এদের কল করা হচ্ছে
async function approveUser(userId) {
  try {
    const response = await fetch('/api/admin/approve/' + userId, {
      method: 'PATCH',
      headers: { 'Authorization': 'Bearer ' + token }
    });

    if (!response.ok) {
      alert('Approve করতে সমস্যা হয়েছে।');
      return;
    }

    // Approve সফল হলে লিস্টটা আবার লোড করছি,
    // তাহলে যাকে approve করা হলো সে আর pending লিস্টে দেখাবে না
    loadPendingUsers();

  } catch (error) {
    alert('Something went wrong.');
  }
}

async function rejectUser(userId) {
  try {
    const response = await fetch('/api/admin/reject/' + userId, {
      method: 'PATCH',
      headers: { 'Authorization': 'Bearer ' + token }
    });

    if (!response.ok) {
      alert('Reject করতে সমস্যা হয়েছে।');
      return;
    }

    loadPendingUsers();

  } catch (error) {
    alert('Something went wrong.');
  }
}

// ============ Logout ============
document.getElementById('logoutBtn').addEventListener('click', function () {
  localStorage.removeItem('iaamsToken');
  window.location.href = 'login.html';
});


// ============ Pending Events লিস্ট Load করা ============
async function loadPendingEvents() {
  const container = document.getElementById('pendingEventsContainer');
  container.innerHTML = '<p>Loading...</p>';

  try {
    const response = await fetch('/api/events/pending', {
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token }
    });

    const data = await response.json();

    if (!response.ok) {
      container.innerHTML = '<p>Could not load pending events.</p>';
      return;
    }

    displayPendingEvents(data);

  } catch (error) {
    container.innerHTML = '<p>Something went wrong.</p>';
  }
}

function displayPendingEvents(events) {
  const container = document.getElementById('pendingEventsContainer');

  if (events.length === 0) {
    container.innerHTML = '<p class="empty-message">No pending events right now.</p>';
    return;
  }

  container.innerHTML = '';

  for (let i = 0; i < events.length; i++) {
    const event = events[i];

    const cardHTML = `
      <div class="admin-item-card">
        <h3 class="admin-item-title">${event.title}</h3>
        <p class="admin-item-info">Description: ${event.description}</p>
        <p class="admin-item-info">Place: ${event.place}</p>
        <p class="admin-item-info">Event Date: ${formatDate(event.eventDate)}</p>
        <p class="admin-item-info">Registration Deadline: ${formatDate(event.registrationDeadline)}</p>
        <p class="admin-item-info">Fee: ${event.registrationFee}</p>
        <p class="admin-item-info">Posted By: ${event.postedBy.name}</p>

        <div class="action-buttons">
          <button class="btn-approve" onclick="approveEvent('${event._id}')">Approve</button>
          <button class="btn-reject" onclick="rejectEvent('${event._id}')">Reject</button>
        </div>
      </div>
    `;

    container.innerHTML += cardHTML;
  }
}

// ============ Approve / Reject Event করার Logic ============
async function approveEvent(eventId) {
  try {
    const response = await fetch('/api/events/approve/' + eventId, {
      method: 'PATCH',
      headers: { 'Authorization': 'Bearer ' + token }
    });

    if (!response.ok) {
      alert('Approve করতে সমস্যা হয়েছে।');
      return;
    }

    loadPendingEvents();

  } catch (error) {
    alert('Something went wrong.');
  }
}

async function rejectEvent(eventId) {
  try {
    const response = await fetch('/api/events/reject/' + eventId, {
      method: 'PATCH',
      headers: { 'Authorization': 'Bearer ' + token }
    });

    if (!response.ok) {
      alert('Reject করতে সমস্যা হয়েছে।');
      return;
    }

    loadPendingEvents();

  } catch (error) {
    alert('Something went wrong.');
  }
}
// পেজ লোড হওয়ার সাথে সাথে প্রথমে Pending Alumni লিস্ট দেখাচ্ছি
loadPendingUsers();

// ============ Pending Payments লিস্ট Load করা ============
async function loadPendingPayments() {
  const container = document.getElementById('paymentsContainer');
  container.innerHTML = '<p>Loading...</p>';

  try {
    const response = await fetch('/api/registrations/pending', {
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token }
    });

    const data = await response.json();

    if (!response.ok) {
      container.innerHTML = '<p>Could not load pending payments.</p>';
      return;
    }

    displayPendingPayments(data);

  } catch (error) {
    container.innerHTML = '<p>Something went wrong.</p>';
  }
}

function displayPendingPayments(registrations) {
  const container = document.getElementById('paymentsContainer');

  if (registrations.length === 0) {
    container.innerHTML = '<p class="empty-message">No pending payments right now.</p>';
    return;
  }

  container.innerHTML = '';

  for (let i = 0; i < registrations.length; i++) {
    const registration = registrations[i];

    const cardHTML = `
      <div class="admin-item-card">
        <h3 class="admin-item-title">${registration.event.title}</h3>
        <p class="admin-item-info">Alumni Name: ${registration.user.name}</p>
        <p class="admin-item-info">Email: ${registration.user.email}</p>
        <p class="admin-item-info">Transaction ID: ${registration.transactionId}</p>

        <div class="action-buttons">
          <button class="btn-approve" onclick="markAsPaid('${registration._id}')">Mark as Paid</button>
        </div>
      </div>
    `;

    container.innerHTML += cardHTML;
  }
}

// ============ Mark as Paid করার Logic ============
async function markAsPaid(registrationId) {
  try {
    const response = await fetch('/api/registrations/' + registrationId + '/mark-paid', {
      method: 'PATCH',
      headers: { 'Authorization': 'Bearer ' + token }
    });

    if (!response.ok) {
      alert('Mark as Paid করতে সমস্যা হয়েছে।');
      return;
    }

    // Mark করার পর লিস্ট আবার লোড করছি,
    // তাহলে যাকে paid করা হলো সে আর pending লিস্টে দেখাবে না
    loadPendingPayments();

  } catch (error) {
    alert('Something went wrong.');
  }
}