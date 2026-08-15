const token = localStorage.getItem('iaamsToken');

if (!token) {
  window.location.href = 'login.html';
}

// URL theke registration id ta ber kortesi
// jemon: invitation-card.html?id=abc123 hole, "abc123" ta pabo
const urlParams = new URLSearchParams(window.location.search);
const registrationId = urlParams.get('id');

function formatDate(dateString) {
  const dateObj = new Date(dateString);
  return dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

async function loadInvitationCard() {
  // id na thakle kono kaj korar dorkar nai
  if (!registrationId) {
    document.getElementById('loadingMessage').innerText = 'No registration ID found.';
    return;
  }

  try {
    const response = await fetch('/api/registrations/' + registrationId + '/invitation-card', {
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token }
    });

    const data = await response.json();

    if (!response.ok) {
      // backend theke je message ashche seta e dekhaye dicchi
      // (jemon "Payment not confirmed yet" ba "You are not allowed to view this card")
      document.getElementById('loadingMessage').innerText = data.message;
      return;
    }

    displayCard(data);

  } catch (error) {
    document.getElementById('loadingMessage').innerText = 'Something went wrong.';
  }
}

function displayCard(registration) {
  // loading message lukiye, card dekhacchi
  document.getElementById('loadingMessage').classList.add('hidden');
  document.getElementById('invitationCard').classList.remove('hidden');

  document.getElementById('eventTitle').innerText = registration.event.title;
  document.getElementById('alumniName').innerText = registration.user.name;
  document.getElementById('eventDate').innerText = formatDate(registration.event.eventDate);
  document.getElementById('eventVenue').innerText = registration.event.place;
  document.getElementById('serialNumber').innerText = registration.serialNumber;
  document.getElementById('paymentStatusText').innerText = registration.paymentStatus.toUpperCase();
}

// Print button e click korle browser er print dialog open hobe
document.getElementById('printBtn').addEventListener('click', function () {
  window.print();
});

// Page load howar sathe sathe card ta load kortesi
loadInvitationCard();