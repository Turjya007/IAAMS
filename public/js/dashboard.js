const token = localStorage.getItem('iaamsToken');

if (!token) {
  window.location.href = 'login.html';
}

// ============ Sidebar ট্যাব সুইচ করার Logic ============

// সব nav বাটন খুঁজে বের করছি
const navButtons = document.querySelectorAll('.nav-btn');

// প্রতিটা বাটনে ক্লিক listener বসাচ্ছি
navButtons.forEach(function (button) {
  button.addEventListener('click', function () {

    // প্রথমে সব বাটন থেকে "active" class সরিয়ে ফেলছি
    navButtons.forEach(function (btn) {
      btn.classList.remove('active');
    });

    // যেই বাটনে ক্লিক হলো, তাকে "active" বানাচ্ছি
    button.classList.add('active');

    // এই বাটনের data-section attribute থেকে বুঝছি কোন section দেখাতে হবে
    const sectionName = button.getAttribute('data-section');

    // সব content section লুকিয়ে ফেলছি প্রথমে
    document.querySelectorAll('.content-section').forEach(function (section) {
      section.classList.add('hidden');
    });

    // শুধু যেটা দরকার সেটা দেখাচ্ছি
    document.getElementById('section-' + sectionName).classList.remove('hidden');

    // যদি "My Events" ট্যাবে ক্লিক করা হয়, তাহলে ডেটা load করছি
    if (sectionName === 'myEvents') {
      loadMyEvents();
    }

    // যদি "Notifications" ট্যাবে ক্লিক করা হয়, তাহলে load + read মার্ক করছি
    if (sectionName === 'notifications') {
      loadNotifications();
    }
  });
});

// ============ Profile Load করা ============
async function loadProfile() {
  try {
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token }
    });

    const data = await response.json();

    if (!response.ok) {
      localStorage.removeItem('iaamsToken');
      window.location.href = 'login.html';
      return;
    }

    displayProfile(data);

  } catch (error) {
    console.log('Error loading profile:', error);
  }
}

function displayProfile(user) {
  const firstLetter = user.name.charAt(0).toUpperCase();
  document.getElementById('avatarCircle').textContent = firstLetter;

  document.getElementById('profileName').textContent = user.name;
  document.getElementById('profileRole').textContent = user.role;
  document.getElementById('profileEmail').textContent = user.email;
  document.getElementById('profileBatch').textContent = user.batch || 'Not provided';
  document.getElementById('profileDepartment').textContent = user.department || 'Not provided';
  document.getElementById('profileGradYear').textContent = user.graduationYear || 'Not provided';
  document.getElementById('profileMembership').textContent = user.membershipType;
  document.getElementById('profileStatus').textContent = user.status;
    // যদি user admin হয়, তাহলে "Admin Panel" লিংকটা দেখাচ্ছি
  if (user.role === 'admin') {
    document.getElementById('adminPanelLink').classList.remove('hidden');
  }
}

// ============ My Events (Registration লিস্ট) Load করা ============
async function loadMyEvents() {
  const container = document.getElementById('myEventsContainer');
  container.innerHTML = '<p>Loading...</p>';

  try {
    const response = await fetch('/api/registrations/my', {
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token }
    });

    const data = await response.json();

    if (!response.ok) {
      container.innerHTML = '<p>Could not load your events.</p>';
      return;
    }

    displayMyEvents(data);

  } catch (error) {
    container.innerHTML = '<p>Something went wrong.</p>';
  }
}

function formatDate(dateString) {
  const dateObj = new Date(dateString);
  return dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function displayMyEvents(registrations) {
  const container = document.getElementById('myEventsContainer');

  if (registrations.length === 0) {
    container.innerHTML = '<p>You haven\'t registered for any events yet.</p>';
    return;
  }

  container.innerHTML = '';

  for (let i = 0; i < registrations.length; i++) {
    const reg = registrations[i];
    const event = reg.event;

    // paid hole ekta button dekhabo, na hole kichu dekhabo na
    let cardButton = '';
    if (reg.paymentStatus === 'paid') {
      cardButton = '<a href="invitation-card.html?id=' + reg._id + '" class="view-card-btn">View Invitation Card</a>';
    }

    const cardHTML = `
      <div class="my-event-card">
        <h3 class="my-event-title">${event.title}</h3>
        <p class="my-event-info">Event Date: ${formatDate(event.eventDate)}</p>
        <p class="my-event-info">Place: ${event.place}</p>
        <p class="my-event-info">Transaction ID: ${reg.transactionId}</p>
        <span class="payment-badge ${reg.paymentStatus}">${reg.paymentStatus.toUpperCase()}</span>
        ${cardButton}
      </div>
    `;

    container.innerHTML += cardHTML;
  }
}

// ============ Logout ============
document.getElementById('logoutBtn').addEventListener('click', function () {
  localStorage.removeItem('iaamsToken');
  window.location.href = 'login.html';
});

// ============ Notification Load করা ============
async function loadNotifications() {
  const container = document.getElementById('notificationsContainer');
  container.innerHTML = '<p>Loading...</p>';

  try {
    const response = await fetch('/api/notifications/my', {
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token }
    });

    const data = await response.json();

    if (!response.ok) {
      container.innerHTML = '<p>Could not load notifications.</p>';
      return;
    }

    displayNotifications(data);

    // dekha shesh, tai ekhon shob "read" mark kore dicchi
    await markNotificationsAsRead();

    // dot ta lukiye felchi, karon ekhon r kono unread nai
    document.getElementById('notifDot').classList.add('hidden');

  } catch (error) {
    container.innerHTML = '<p>Something went wrong.</p>';
  }
}

function formatNotificationTime(dateString) {
  const dateObj = new Date(dateString);
  return dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function displayNotifications(notifications) {
  const container = document.getElementById('notificationsContainer');

  if (notifications.length === 0) {
    container.innerHTML = '<p>You have no notifications yet.</p>';
    return;
  }

  container.innerHTML = '';

  for (let i = 0; i < notifications.length; i++) {
    const notif = notifications[i];

    // unread hole ekta extra class jog kortesi, jeta die CSS te alada style dekhabe
    let unreadClass = '';
    if (notif.isRead === false) {
      unreadClass = 'unread';
    }

    const cardHTML = `
      <div class="notification-card ${unreadClass}">
        <p class="notification-message">${notif.message}</p>
        <p class="notification-time">${formatNotificationTime(notif.createdAt)}</p>
      </div>
    `;

    container.innerHTML += cardHTML;
  }
}

// ============ সব Notification "read" মার্ক করা ============
async function markNotificationsAsRead() {
  try {
    await fetch('/api/notifications/mark-read', {
      method: 'PATCH',
      headers: { 'Authorization': 'Bearer ' + token }
    });
  } catch (error) {
    console.log('Error marking notifications as read:', error);
  }
}

// ============ প্রথমবার পেজ লোড হলে, unread notification আছে কিনা check করা ============
async function checkUnreadNotifications() {
  try {
    const response = await fetch('/api/notifications/my', {
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token }
    });

    const data = await response.json();

    if (!response.ok) {
      return;
    }

    // koyta unread notification ache seita gunte hocche
    let unreadCount = 0;
    for (let i = 0; i < data.length; i++) {
      if (data[i].isRead === false) {
        unreadCount = unreadCount + 1;
      }
    }

    // unread thakle dot ta dekhacchi
    if (unreadCount > 0) {
      document.getElementById('notifDot').classList.remove('hidden');
    }

  } catch (error) {
    console.log('Error checking notifications:', error);
  }
}

// পেজ লোড হওয়ার সাথে সাথে প্রথমে Profile দেখাচ্ছি
loadProfile();

// পেজ লোড হওয়ার সাথে সাথে unread notification আছে কিনা চেক করছি (dot দেখানোর জন্য)
checkUnreadNotifications();