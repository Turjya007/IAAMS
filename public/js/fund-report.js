const token = localStorage.getItem('iaamsToken');

if (!token) {
  window.location.href = 'login.html';
}

function formatDate(dateString) {
  const dateObj = new Date(dateString);
  return dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

async function loadReport() {
  try {
    const response = await fetch('/api/fund', {
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token }
    });

    const data = await response.json();

    if (!response.ok) {
      document.getElementById('loadingMessage').innerText = data.message || 'Could not load report.';
      return;
    }

    // ============ Summary বসানো ============
    document.getElementById('sumTotalIncome').innerText = 'TK' + data.totalIncome;
    document.getElementById('sumTotalExpense').innerText = 'TK' + data.totalExpense;
    document.getElementById('sumBalance').innerText = 'TK' + data.balance;

    document.getElementById('reportGeneratedDate').innerText = 'Generated on: ' + formatDate(new Date());

    buildIncomeBreakdown(data.entries);
    buildExpenseBreakdown(data.entries);
    buildEventWiseTable(data.entries);
    buildLedger(data.entries);

    // sob taiyar hoye gele, loading message lukiye report dekhacchi
    document.getElementById('loadingMessage').classList.add('hidden');
    document.getElementById('reportContent').classList.remove('hidden');

  } catch (error) {
    document.getElementById('loadingMessage').innerText = 'Something went wrong.';
  }
}

// ============ Income Breakdown (category onujayi joga kora) ============
function buildIncomeBreakdown(entries) {
  const categoryTotals = {}; // ekta khali object, jekhane category -> total amount joma hobe

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];

    if (entry.type === 'income') {
      if (categoryTotals[entry.category] === undefined) {
        categoryTotals[entry.category] = 0;
      }
      categoryTotals[entry.category] = categoryTotals[entry.category] + entry.amount;
    }
  }

  fillBreakdownTable('incomeBreakdownTable', categoryTotals);
}

// ============ Expense Breakdown (category onujayi joga kora) ============
function buildExpenseBreakdown(entries) {
  const categoryTotals = {};

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];

    if (entry.type === 'expense') {
      if (categoryTotals[entry.category] === undefined) {
        categoryTotals[entry.category] = 0;
      }
      categoryTotals[entry.category] = categoryTotals[entry.category] + entry.amount;
    }
  }

  fillBreakdownTable('expenseBreakdownTable', categoryTotals);
}

// income ar expense breakdown, duitar jonnoi ei ekoi function kaje lagbe
// (category -> total emon object pele, table er tbody te row bosiye dey)
function fillBreakdownTable(tableId, categoryTotals) {
  const tbody = document.getElementById(tableId).querySelector('tbody');

  const categoryNames = Object.keys(categoryTotals); // shob category er naam ekta array te

  if (categoryNames.length === 0) {
    tbody.innerHTML = '<tr><td colspan="2">No data</td></tr>';
    return;
  }

  tbody.innerHTML = '';

  for (let i = 0; i < categoryNames.length; i++) {
    const name = categoryNames[i];
    const total = categoryTotals[name];

    tbody.innerHTML += '<tr><td>' + name + '</td><td>TK' + total + '</td></tr>';
  }
}

// ============ Event-wise Income & Expense Table ============
function buildEventWiseTable(entries) {
  const eventTotals = {}; // event naam -> { income: 0, expense: 0 }

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];

    // event thakle tar title, na thakle "General / No Event"
    let eventName = 'General / No Event';
    if (entry.event) {
      eventName = entry.event.title;
    }

    if (eventTotals[eventName] === undefined) {
      eventTotals[eventName] = { income: 0, expense: 0 };
    }

    if (entry.type === 'income') {
      eventTotals[eventName].income = eventTotals[eventName].income + entry.amount;
    } else {
      eventTotals[eventName].expense = eventTotals[eventName].expense + entry.amount;
    }
  }

  const tbody = document.getElementById('eventWiseTable').querySelector('tbody');
  const eventNames = Object.keys(eventTotals);

  if (eventNames.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3">No data</td></tr>';
    return;
  }

  tbody.innerHTML = '';

  for (let i = 0; i < eventNames.length; i++) {
    const name = eventNames[i];
    const totals = eventTotals[name];

    tbody.innerHTML += '<tr><td>' + name + '</td><td>TK' + totals.income + '</td><td>TK' + totals.expense + '</td></tr>';
  }
}

// ============ Transaction Ledger (purono theke notun, running balance soho) ============
function buildLedger(entries) {
  // backend theke notun-theke-purono order e ashe, tai ulte dicchi
  // (age kore rakha array ke na bodle, notun ekta copy banie sort korchi)
  const sortedEntries = entries.slice();

  sortedEntries.sort(function (a, b) {
    return new Date(a.createdAt) - new Date(b.createdAt);
  });

  const tbody = document.getElementById('ledgerTable').querySelector('tbody');
  tbody.innerHTML = '';

  let runningBalance = 0;

  for (let i = 0; i < sortedEntries.length; i++) {
    const entry = sortedEntries[i];

    let amountText = '+TK' + entry.amount;
    if (entry.type === 'income') {
      runningBalance = runningBalance + entry.amount;
    } else {
      runningBalance = runningBalance - entry.amount;
      amountText = '-TK' + entry.amount;
    }

    tbody.innerHTML += `
      <tr>
        <td>${formatDate(entry.createdAt)}</td>
        <td>${entry.type}</td>
        <td>${entry.description || entry.category}</td>
        <td>${amountText}</td>
        <td>TK${runningBalance}</td>
      </tr>
    `;
  }
}

// ============ Print বাটন ============
document.getElementById('printBtn').addEventListener('click', function () {
  window.print();
});

loadReport();