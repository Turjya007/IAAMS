const token = localStorage.getItem('iaamsToken');

if (!token) {
  window.location.href = 'login.html';
}

// URL theke eventId ta ber kortesi
// jemon: attendance.html?eventId=abc123 hole, "abc123" ta pabo
const urlParams = new URLSearchParams(window.location.search);
const eventId = urlParams.get('eventId');

function showResult(type, message) {
  // loading message lukiye dicchi
  document.getElementById('statusMessage').classList.add('hidden');

  const iconBox = document.getElementById('statusIcon');
  iconBox.classList.remove('hidden');

  // type onujayi (success/warning/error) class lagiye dicchi
  iconBox.classList.add('status-' + type);

  let icon = '';
  if (type === 'success') {
    icon = '✅';
  } else if (type === 'warning') {
    icon = '⚠️';
  } else {
    icon = '❌';
  }

  iconBox.innerHTML = '<div>' + icon + '</div><p class="status-text">' + message + '</p>';
}

async function markAttendance() {
  // eventId na thakle kono kaj korar dorkar nai
  if (!eventId) {
    showResult('error', 'No event ID found in the link.');
    return;
  }

  try {
    const response = await fetch('/api/registrations/attendance/' + eventId, {
      method: 'PATCH',
      headers: { 'Authorization': 'Bearer ' + token }
    });

    const data = await response.json();

    if (!response.ok) {
      // backend theke asha error message ta dekhaye dicchi
      // (jemon "You have not registered for this event" ba "Your payment is not confirmed yet")
      showResult('error', data.message);
      return;
    }

    // response ok, kintu already marked kina check kortesi
    if (data.alreadyMarked === true) {
      showResult('warning', data.message);
    } else {
      showResult('success', data.message);
    }

  } catch (error) {
    showResult('error', 'Something went wrong. Please try again.');
  }
}

// Page load howar sathe sathe attendance mark kortesi
markAttendance();