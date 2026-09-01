const token = localStorage.getItem('iaamsToken');

if (!token) {
  window.location.href = 'login.html';
}

// ============ Sidebar tab switch korar Logic (dashboard.js theke hubuhu copy) ============

const navButtons = document.querySelectorAll('.nav-btn');

navButtons.forEach(function (button) {
  button.addEventListener('click', function () {

    // Ei link button gular (jemon "Back to Dashboard") data-section nai,
    // Tai segular jonno ei tab switch logic skip korte hobe, nahole error ashbe
    const sectionName = button.getAttribute('data-section');
    if (!sectionName) {
      return; // data-section na thakle ekhane e theme jacche, nicher code cholbe na
    }

    navButtons.forEach(function (btn) {
      btn.classList.remove('active');
    });

    button.classList.add('active');

    document.querySelectorAll('.content-section').forEach(function (section) {
      section.classList.add('hidden');
    });

    document.getElementById('section-' + sectionName).classList.remove('hidden');

    // Kon tab a click holo tar opor vitti kore data load kora hocche

      if (sectionName === 'pendingUsers') {
      loadPendingUsers();
    } else if (sectionName === 'pendingEvents') {
      loadPendingEvents();
    } else if (sectionName === 'payments') {
      loadPendingPayments();
    } else if (sectionName === 'fund') {
      loadFundData();
    }
  });
});


function formatDate(dateString) {
  const dateObj = new Date(dateString);
  return dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
// ============ Pending Alumni list Load kora ============
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

    // user._id ke onclick er vitore pathacchi, jate approveUser/rejectUser
    // function jante pare thik kon user ke approve/reject korte hobe
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

// ============ Approve / Reject korar Logic ============

// Ei duita function window a (global scope a) thakte hobe,
// karon HTML er onclick theke eder call kora hocche
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

    // Approve shofol hole list ta abar load korchi,
    // tahole jake approve kora holo se ar pending list a dekhabe na
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
        <p class="admin-item-info">Registration Fee: TK${registration.event.registrationFee}</p>

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

// ============ Fund Management ============

// type (income/expense) অনুযায়ী category dropdown পূরণ করা
const incomeCategories = ['Event Registration Fee', 'Sponsorship', 'Others'];
const expenseCategories = ['Decoration', 'Food', 'Printing', 'Prizes', 'Others'];

function populateCategoryDropdown() {
  const typeSelect = document.getElementById('fundTypeSelect');
  const categorySelect = document.getElementById('fundCategorySelect');

  let categoryList = [];
  if (typeSelect.value === 'income') {
    categoryList = incomeCategories;
  } else {
    categoryList = expenseCategories;
  }

  categorySelect.innerHTML = '';
  for (let i = 0; i < categoryList.length; i++) {
    const option = document.createElement('option');
    option.value = categoryList[i];
    option.textContent = categoryList[i];
    categorySelect.appendChild(option);
  }

  // dropdown notun kore banano hoyeche, tai "Others" input abar check kore lukiye rakhi
  toggleOtherCategoryInput();
}

// "Others" select korle extra text box dekhano, na hole lukano
function toggleOtherCategoryInput() {
  const categorySelect = document.getElementById('fundCategorySelect');
  const otherInput = document.getElementById('fundOtherCategoryInput');

  if (categorySelect.value === 'Others') {
    otherInput.classList.remove('hidden');
  } else {
    otherInput.classList.add('hidden');
  }
}

// type dropdown change hole category dropdown abar bananor jonno
document.getElementById('fundTypeSelect').addEventListener('change', populateCategoryDropdown);
document.getElementById('fundCategorySelect').addEventListener('change', toggleOtherCategoryInput);

// page load howar shathe shathe ekbar category dropdown purno kore rakhi
populateCategoryDropdown();

// ============ নতুন Entry Add করা ============
document.getElementById('addFundEntryBtn').addEventListener('click', async function () {
  const type = document.getElementById('fundTypeSelect').value;
  const categorySelectValue = document.getElementById('fundCategorySelect').value;
  const otherCategoryValue = document.getElementById('fundOtherCategoryInput').value;
  const amount = document.getElementById('fundAmountInput').value;
  const description = document.getElementById('fundDescriptionInput').value;
  const messageBox = document.getElementById('fundFormMessage');

  // jodi "Others" select kora thake, tahole free-text ta e asol category hobe
  let finalCategory = categorySelectValue;
  if (categorySelectValue === 'Others') {
    finalCategory = otherCategoryValue;
  }

  if (finalCategory.trim() === '' || amount.trim() === '') {
    messageBox.textContent = 'Please fill category and amount.';
    return;
  }

  try {
    const response = await fetch('/api/fund', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        type: type,
        category: finalCategory,
        amount: amount,
        description: description
      })
    });

    const data = await response.json();

    if (!response.ok) {
      messageBox.textContent = data.message || 'Failed to add entry.';
      return;
    }

    // form khali kore dicchi
    document.getElementById('fundAmountInput').value = '';
    document.getElementById('fundDescriptionInput').value = '';
    document.getElementById('fundOtherCategoryInput').value = '';
    messageBox.textContent = 'Entry added successfully!';

    // list ar summary abar load kortesi
    loadFundData();

  } catch (error) {
    messageBox.textContent = 'Something went wrong.';
  }
});

// ============ Fund ডেটা (Entry List + Summary) Load করা ============
async function loadFundData() {
  const container = document.getElementById('fundEntriesContainer');
  container.innerHTML = '<p>Loading...</p>';

  try {
    const response = await fetch('/api/fund', {
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token }
    });

    const data = await response.json();

    if (!response.ok) {
      container.innerHTML = '<p>Could not load fund data.</p>';
      return;
    }

    // Summary card গুলো আপডেট করছি
    document.getElementById('totalIncomeText').textContent = data.totalIncome + " TK";
    document.getElementById('totalExpenseText').textContent = data.totalExpense + " TK";
    document.getElementById('balanceText').textContent = data.balance + " TK";

    displayFundEntries(data.entries);

  } catch (error) {
    container.innerHTML = '<p>Something went wrong.</p>';
  }
}

function displayFundEntries(entries) {
  const container = document.getElementById('fundEntriesContainer');

  if (entries.length === 0) {
    container.innerHTML = '<p class="empty-message">No fund entries yet.</p>';
    return;
  }

  container.innerHTML = '';

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];

    // type onujayi css class ('entry-income' ba 'entry-expense')
    let entryClass = 'entry-income';
    let sign = '+';
    if (entry.type === 'expense') {
      entryClass = 'entry-expense';
      sign = '-';
    }

    const cardHTML = `
      <div class="admin-item-card ${entryClass}">
        <h3 class="admin-item-title">${entry.category} (${sign}TK ${entry.amount})</h3>
        <p class="admin-item-info">Description: ${entry.description || 'N/A'}</p>
        <p class="admin-item-info">Added By: ${entry.addedBy.name}</p>
        <p class="admin-item-info">Date: ${formatDate(entry.createdAt)}</p>
      </div>
    `;

    container.innerHTML += cardHTML;
  }
}