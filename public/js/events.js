const token = localStorage.getItem('iaamsToken');

if (!token) {
  window.location.href = 'login.html';
}

const eventsContainer = document.getElementById('eventsContainer');

// ============ Admin hole Sidebar a Admin Panel link dekhano ============
let isAdmin = false;
async function checkAdminAndShowLink() {
  try {
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token }
    });

    const data = await response.json();

    if (!response.ok) {
      return; // kono somossa hole ekhane e shesh, link lukano e thakbe
    }

    if (data.role === 'admin') {
      document.getElementById('adminPanelLink').classList.remove('hidden');
      isAdmin = true;
    }

  } catch (error) {
    console.log('Error checking role:', error);
  }
}

// ei array te jei event gulo te ami age thekei register korechi, tader ID joma thakbe
let registeredEventIds = [];

// ============ আমি যেই event গুলোতে register করেছি, তাদের ID গুলো আনছি ============
async function loadRegisteredEventIds() {
  try {
    const response = await fetch('/api/registrations/my', {
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token }
    });

    const data = await response.json();

    if (!response.ok) {
      return; // fail korle empty array e thakbe
    }

    // data হলো registration এর একটা array, প্রতিটার ভিতরে populate করা event আছে
    for (let i = 0; i < data.length; i++) {
      registeredEventIds.push(data[i].event._id);
    }

  } catch (error) {
    console.log('Error loading registered events:', error);
  }
}

// ============ সব (approved) event নিয়ে আসা ============
async function loadEvents() {
  try {
    const response = await fetch('/api/events', {
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token }
    });

    const data = await response.json();

    if (!response.ok) {
      eventsContainer.innerHTML = '<p>Could not load events. Please try again.</p>';
      return;
    }

    displayEvents(data);

  } catch (error) {
    eventsContainer.innerHTML = '<p>Something went wrong. Please check your connection.</p>';
  }
}

function formatDate(dateString) {
  const dateObj = new Date(dateString);
  return dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ============ একটা event এর ID আগে থেকে registeredEventIds এ আছে কিনা চেক করা ============
function isAlreadyRegistered(eventId) {
  for (let i = 0; i < registeredEventIds.length; i++) {
    if (registeredEventIds[i] === eventId) {
      return true;
    }
  }
  return false;
}

// ============ সব event কে row বানিয়ে পেজে বসানো ============
function displayEvents(events) {

  if (events.length === 0) {
    eventsContainer.innerHTML = '<p style="padding: 20px 0;">No events posted yet.</p>';
    return;
  }

  eventsContainer.innerHTML = '';

  for (let i = 0; i < events.length; i++) {

    const event = events[i];
    const alreadyRegistered = isAlreadyRegistered(event._id);

    // যদি আগে থেকেই register করা থাকে, বাটনের বদলে badge দেখাবো
    // নাহলে "Register" বাটন dekhabe
    let actionHTML = '';

    if (alreadyRegistered) {
      actionHTML = '<span class="registered-badge">Registered ✓</span>';
    } else {
      actionHTML = `<button class="register-btn" onclick="toggleRegisterForm(${i})">Register</button>`;
    }

    // admin hole QR button o dekhabo
    let qrButtonHTML = '';
    
    if (isAdmin) {
      qrButtonHTML = `<button class="show-qr-btn" onclick="showQRCode('${event._id}', '${event.title}')">QR Code</button>
        <button class="show-qr-btn" onclick="showAttendanceList('${event._id}', '${event.title}')">Attendance</button>`;
    }

    const rowHTML = `
      <div class="event-row">
        <div class="event-row-top">
          <div>
            <h2 class="event-title">${event.title}</h2>
            <p class="event-deadline">Registration Deadline: <span>${formatDate(event.registrationDeadline)}</span></p>
          </div>

          <div class="event-actions">
            <button class="show-more-btn" onclick="toggleDetails(${i})">Show More</button>
            ${actionHTML}
            ${qrButtonHTML}
          </div>
        </div>

        <div class="event-details hidden" id="details-${i}">
          <p class="detail-line"><strong>Description:</strong> ${event.description}</p>
          <p class="detail-line"><strong>Place:</strong> ${event.place}</p>
          <p class="detail-line"><strong>Event Date:</strong> ${formatDate(event.eventDate)}</p>
          <p class="detail-line"><strong>Registration Fee:</strong> ৳${event.registrationFee}</p>
           <p class="detail-line"><strong>bKash Number:</strong> ${event.bkashNumber}</p>
          <p class="detail-line"><strong>Posted By:</strong> ${event.postedBy.name}</p>
          <p class="detail-line"><strong>Approved By:</strong> ${event.approvedBy.name}</p>
        </div>

        <!-- Transaction ID ফর্ম, শুরুতে লুকানো -->
        <div class="register-form-box hidden" id="regForm-${i}">
          <input type="text" id="txnInput-${i}" placeholder="Enter bKash Transaction ID" />
          <button class="submit-txn-btn" onclick="submitRegistration(${i}, '${event._id}')">Submit</button>
        </div>
        <p class="reg-message" id="regMessage-${i}"></p>
      </div>
    `;

    eventsContainer.innerHTML += rowHTML;
  }
}

// ============ "Show More" টগল করা ============
function toggleDetails(index) {
  const detailsBox = document.getElementById('details-' + index);
  detailsBox.classList.toggle('hidden');
}

// ============ "Register" ক্লিক করলে Transaction ID ফর্ম টগল করা ============
function toggleRegisterForm(index) {
  const formBox = document.getElementById('regForm-' + index);
  formBox.classList.toggle('hidden');
}

// ============ Transaction ID Submit করা ============
async function submitRegistration(index, eventId) {

  const txnInput = document.getElementById('txnInput-' + index);
  const messageBox = document.getElementById('regMessage-' + index);

  const transactionId = txnInput.value;

  // খালি রেখে submit করলে আটকাচ্ছি
  if (transactionId.trim() === '') {
    messageBox.textContent = 'Please enter your Transaction ID.';
    messageBox.className = 'reg-message error';
    return;
  }

  try {
    const response = await fetch('/api/registrations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        eventId: eventId,
        transactionId: transactionId
      })
    });

    const data = await response.json();

    if (!response.ok) {
      messageBox.textContent = data.message || 'Registration failed.';
      messageBox.className = 'reg-message error';
      return;
    }

    // সফল হলে registeredEventIds এ যোগ করছি, আর পুরো event লিস্টটা আবার লোড করছি
    // যাতে বাটনের জায়গায় "Registered ✓" badge দেখা যায়
    registeredEventIds.push(eventId);
    loadEvents();

  } catch (error) {
    messageBox.textContent = 'Something went wrong. Please try again.';
    messageBox.className = 'reg-message error';
  }
}

// ============ QR Code দেখানো ============
function showQRCode(eventId, eventTitle) {
  // ei URL tai QR code er vitore thakbe
  // alumni er phone diye scan korle ei link ta khulbe
  const attendanceUrl = window.location.origin + '/attendance.html?eventId=' + eventId;

  document.getElementById('qrModalTitle').innerText = eventTitle;

  const canvas = document.getElementById('qrCanvas');

  // QRCode.toCanvas library theke asche (CDN script theke)
  // eta canvas er vitore QR code er chobi eke dey
  QRCode.toCanvas(canvas, attendanceUrl, function (error) {
    if (error) {
      console.log('QR generate error:', error);
    }
  });

  document.getElementById('qrModalOverlay').classList.remove('hidden');
}

function closeQRModal() {
  document.getElementById('qrModalOverlay').classList.add('hidden');
}

// ============ Logout ============
document.getElementById('logoutBtn').addEventListener('click', function () {
  localStorage.removeItem('iaamsToken');
  window.location.href = 'login.html';
});

// ============ Attendance List দেখানো ============
async function showAttendanceList(eventId, eventTitle) {
  document.getElementById('attendanceModalTitle').innerText = eventTitle;

  const listContainer = document.getElementById('attendanceListContainer');
  listContainer.innerHTML = '<p>Loading...</p>';

  document.getElementById('attendanceModalOverlay').classList.remove('hidden');

  try {
    const response = await fetch('/api/registrations/attendance-list/' + eventId, {
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token }
    });

    const data = await response.json();

    if (!response.ok) {
      listContainer.innerHTML = '<p>Could not load attendance list.</p>';
      return;
    }

    if (data.length === 0) {
      listContainer.innerHTML = '<p>No one has marked attendance yet.</p>';
      return;
    }

    listContainer.innerHTML = '';

    for (let i = 0; i < data.length; i++) {
      const registration = data[i];
      listContainer.innerHTML += `
        <p class="detail-line">${i + 1}. ${registration.user.name} (${registration.user.email})</p>
      `;
    }

  } catch (error) {
    listContainer.innerHTML = '<p>Something went wrong.</p>';
  }
}

function closeAttendanceModal() {
  document.getElementById('attendanceModalOverlay').classList.add('hidden');
}

// ============ পেজ লোড হওয়ার সাথে সাথে দুটো কাজ ============
// প্রথমে registered event ID গুলো আনছি, তারপর event লিস্ট আনছি
// (যেন button/badge প্রথমবারই সঠিকভাবে দেখানো যায়)
async function init() {
  await checkAdminAndShowLink();   // ei line a await jog kora holo
  await loadRegisteredEventIds();
  loadEvents();
}

init();