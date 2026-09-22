const token = localStorage.getItem("iaamsToken");

if (!token) {
  window.location.href = "login.html";
}

// ============ Sidebar tab switch korar Logic ============

// sob nav button khuje ber korchi
const navButtons = document.querySelectorAll(".nav-btn");

// protita button a listener boshacchi
navButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    // 1st a sib button a "active" class shoracchi
    navButtons.forEach(function (btn) {
      btn.classList.remove("active");
    });

    // jei button click holo take "active" banacchi
    button.classList.add("active");

    // ei button er data-section attribute theke bujhci keno section dekhate hobe
    const sectionName = button.getAttribute("data-section");

    // সব content section lukiye felchi prothom a
    document.querySelectorAll(".content-section").forEach(function (section) {
      section.classList.add("hidden");
    });

    // shudhu jeta dorkar seta banacchi
    document
      .getElementById("section-" + sectionName)
      .classList.remove("hidden");

    // jodi "My Events" tab a click kora hoi, tahole data load korchi
    if (sectionName === "myEvents") {
      loadMyEvents();
    }

    // jodi "Notifications" tab a click kora hoi, tahole load + read mark korchi
    if (sectionName === "notifications") {
      loadNotifications();
    }
  });
});

// ============ Profile Load kora ============
async function loadProfile() {
  try {
    const response = await fetch("/api/auth/me", {
      method: "GET",
      headers: { Authorization: "Bearer " + token },
    });

    const data = await response.json();

    if (!response.ok) {
      localStorage.removeItem("iaamsToken");
      window.location.href = "login.html";
      return;
    }

    displayProfile(data);
  } catch (error) {
    console.log("Error loading profile:", error);
  }
}

function displayProfile(user) {
  const firstLetter = user.name.charAt(0).toUpperCase();
  document.getElementById("avatarCircle").textContent = firstLetter;

  document.getElementById("profileName").textContent = user.name;
  document.getElementById("profileRole").textContent = user.role;
  document.getElementById("profileEmail").textContent = user.email;
  document.getElementById("profileBatch").textContent =
    user.batch || "Not provided";
  document.getElementById("profileDepartment").textContent =
    user.department || "Not provided";
  document.getElementById("profileGradYear").textContent =
    user.graduationYear || "Not provided";
  document.getElementById("profileMembership").textContent =
    user.membershipType;
  document.getElementById("profileStatus").textContent = user.status;
  // jodi user admin hoi, yahole "Admin Panel" link ti dekhacchi
  if (user.role === "admin") {
    document.getElementById("adminPanelLink").classList.remove("hidden");
  }
}

// ============ My Events (Registration list) Load kora ============
async function loadMyEvents() {
  const container = document.getElementById("myEventsContainer");
  container.innerHTML = "<p>Loading...</p>";

  try {
    const response = await fetch("/api/registrations/my", {
      method: "GET",
      headers: { Authorization: "Bearer " + token },
    });

    const data = await response.json();

    if (!response.ok) {
      container.innerHTML = "<p>Could not load your events.</p>";
      return;
    }

    displayMyEvents(data);
  } catch (error) {
    container.innerHTML = "<p>Something went wrong.</p>";
  }
}

function formatDate(dateString) {
  const dateObj = new Date(dateString);
  return dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function displayMyEvents(registrations) {
  const container = document.getElementById("myEventsContainer");

  if (registrations.length === 0) {
    container.innerHTML = "<p>You haven't registered for any events yet.</p>";
    return;
  }

  container.innerHTML = "";

  for (let i = 0; i < registrations.length; i++) {
    const reg = registrations[i];
    const event = reg.event;

    // paid hole ekta button dekhabo, na hole kichu dekhabo na
    let cardButton = "";
    if (reg.paymentStatus === "paid") {
      cardButton =
        '<a href="invitation-card.html?id=' +
        reg._id +
        '" class="view-card-btn">View Invitation Card</a>';
    }

    const cardHTML = `
      <div class="my-event-card">
        <h3 class="my-event-title">${event.title}</h3>
        <p class="my-event-info">Event Date: ${formatDate(event.eventDate)}</p>
        <p class="my-event-info">Place: ${event.place}</p>
        <span class="payment-badge ${reg.paymentStatus}">${reg.paymentStatus.toUpperCase()}</span>
        ${cardButton}
      </div>
    `;

    container.innerHTML += cardHTML;
  }
}

// ============ Logout ============
document.getElementById("logoutBtn").addEventListener("click", function () {
  localStorage.removeItem("iaamsToken");
  window.location.href = "login.html";
});

// ============ Notification Load kora ============
async function loadNotifications() {
  const container = document.getElementById("notificationsContainer");
  container.innerHTML = "<p>Loading...</p>";

  try {
    const response = await fetch("/api/notifications/my", {
      method: "GET",
      headers: { Authorization: "Bearer " + token },
    });

    const data = await response.json();

    if (!response.ok) {
      container.innerHTML = "<p>Could not load notifications.</p>";
      return;
    }

    displayNotifications(data);

    // dekha shesh, tai ekhon shob "read" mark kore dicchi
    await markNotificationsAsRead();

    // dot ta lukiye felchi, karon ekhon r kono unread nai
    document.getElementById("notifDot").classList.add("hidden");
  } catch (error) {
    container.innerHTML = "<p>Something went wrong.</p>";
  }
}

function formatNotificationTime(dateString) {
  const dateObj = new Date(dateString);
  return dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function displayNotifications(notifications) {
  const container = document.getElementById("notificationsContainer");

  if (notifications.length === 0) {
    container.innerHTML = "<p>You have no notifications yet.</p>";
    return;
  }

  container.innerHTML = "";

  for (let i = 0; i < notifications.length; i++) {
    const notif = notifications[i];

    // unread hole ekta extra class jog kortesi, jeta die CSS te alada style dekhabe
    let unreadClass = "";
    if (notif.isRead === false) {
      unreadClass = "unread";
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

// ============ sob Notification "read" mark kora ============
async function markNotificationsAsRead() {
  try {
    await fetch("/api/notifications/mark-read", {
      method: "PATCH",
      headers: { Authorization: "Bearer " + token },
    });
  } catch (error) {
    console.log("Error marking notifications as read:", error);
  }
}

// ============ prothombar dekhle, unread notification ache kina check ============
async function checkUnreadNotifications() {
  try {
    const response = await fetch("/api/notifications/my", {
      method: "GET",
      headers: { Authorization: "Bearer " + token },
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
      document.getElementById("notifDot").classList.remove("hidden");
    }
  } catch (error) {
    console.log("Error checking notifications:", error);
  }
}

// page load howar sathe sathe Profile dekhacchi
loadProfile();

// page load howar sathe sathe unread notification ache kina check korchi (dot dekhanor jonno)
checkUnreadNotifications();

// ============ Payment theke ferar por status check kora ============
function checkPaymentStatus() {
  const params = new URLSearchParams(window.location.search);
  const paymentStatus = params.get("payment");

  if (!paymentStatus) {
    return; // URL e payment param nai, tai kisu korar dorkar nai
  }

  let message = "";
  let messageClass = "";

    if (paymentStatus === 'success') {
    message = 'Payment successful! Your registration is now confirmed.';
    messageClass = 'success';
  } else if (paymentStatus === 'risk') {
    message = 'Your payment is under review by the admin. You will be notified once confirmed.';
    messageClass = 'error';
  } else if (paymentStatus === 'failed') {
    message = 'Payment failed. Please try registering again.';
    messageClass = 'error';
  } else if (paymentStatus === 'cancelled') {
    message = 'Payment was cancelled.';
    messageClass = 'error';
  } else {
    return;
  }

  // ekta message banner banacchi, upore boshiye dicchi
  const banner = document.createElement("p");
  banner.textContent = message;
  banner.className = "payment-status-banner " + messageClass;

  const mainContent = document.querySelector(".main-content");
  mainContent.insertBefore(banner, mainContent.firstChild);

  // "My Events" tab e switch kore dicchi, jate result soja dekhte pai
  const myEventsButton = document.querySelector(
    '.nav-btn[data-section="myEvents"]',
  );
  if (myEventsButton) {
    myEventsButton.click();
  }

  // URL theke ?payment=... mucche dicchi, jate refresh korle abar message na dekhay
  window.history.replaceState({}, document.title, window.location.pathname);
}

// page load howar sathe sathe payment status check korchi
checkPaymentStatus();
