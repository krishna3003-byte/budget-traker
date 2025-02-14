let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// DOM Elements
const transactionForm = document.getElementById('transactionForm');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const dateInput = document.getElementById('date');
const typeInput = document.getElementById('type');
const transactionList = document.getElementById('transactionList');
const balanceElement = document.getElementById('balance');
const themeToggle = document.getElementById('themeToggle');
const ctx = document.getElementById('budgetChart').getContext('2d');

// Chart Initialization
const budgetChart = new Chart(ctx, {
  type: 'pie',
  data: {
    labels: ['Income', 'Expenses'],
    datasets: [{
      data: [0, 0],
      backgroundColor: ['#2ecc71', '#e74c3c'],
    }]
  }
});

// Add transaction
transactionForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const transaction = {
    id: Date.now(),
    description: descriptionInput.value,
    amount: +amountInput.value,
    category: categoryInput.value,
    date: dateInput.value,
    type: typeInput.value
  };

  transactions.push(transaction);
  saveTransactions();
  updateUI();
  transactionForm.reset();
});

// Save transactions to localStorage
function saveTransactions() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Update UI
function updateUI() {
  // Clear transaction list
  transactionList.innerHTML = '';

  // Calculate balance
  const balance = transactions.reduce((total, transaction) => {
    return transaction.type === 'income' ? total + transaction.amount : total - transaction.amount;
  }, 0);

  // Display balance
  balanceElement.textContent = `$${balance.toFixed(2)}`;

  // Update chart
  const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  budgetChart.data.datasets[0].data = [income, expenses];
  budgetChart.update();

  // Display transactions
  transactions.forEach(transaction => {
    const li = document.createElement('li');
    li.classList.add(transaction.type);
    li.innerHTML = `
      <span>${transaction.date} - ${transaction.description} (${transaction.category})</span>
      <span>${transaction.type === 'income' ? '+' : '-'}$${Math.abs(transaction.amount).toFixed(2)}</span>
      <button class="edit-btn" onclick="editTransaction(${transaction.id})">✏️</button>
      <button class="delete-btn" onclick="deleteTransaction(${transaction.id})">❌</button>
    `;
    transactionList.appendChild(li);
  });
}

// Delete transaction
function deleteTransaction(id) {
  transactions = transactions.filter(transaction => transaction.id !== id);
  saveTransactions();
  updateUI();
}

// Edit transaction
function editTransaction(id) {
  const transaction = transactions.find(t => t.id === id);
  if (transaction) {
    descriptionInput.value = transaction.description;
    amountInput.value = transaction.amount;
    categoryInput.value = transaction.category;
    dateInput.value = transaction.date;
    typeInput.value = transaction.type;

    deleteTransaction(id);
  }
}

// Dark mode toggle
themeToggle.addEventListener('click', () => {
  document.body.dataset.theme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
  themeToggle.textContent = document.body.dataset.theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
});

// Initial UI update
updateUI();
let goals = JSON.parse(localStorage.getItem('goals')) || [];

document.getElementById('budgetGoalForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const goal = {
    category: document.getElementById('goalCategory').value,
    amount: +document.getElementById('goalAmount').value
  };
  goals.push(goal);
  localStorage.setItem('goals', JSON.stringify(goals));
  updateGoalsUI();
});

function updateGoalsUI() {
  const goalList = document.getElementById('goalList');
  goalList.innerHTML = '';
  goals.forEach(goal => {
    const spent = transactions
      .filter(t => t.category === goal.category && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const li = document.createElement('li');
    li.innerHTML = `
      ${goal.category}: $${spent.toFixed(2)} / $${goal.amount.toFixed(2)}
      <progress value="${spent}" max="${goal.amount}"></progress>
    `;
    goalList.appendChild(li);
  });
}
document.getElementById('exportButton').addEventListener('click', () => {
    const csv = transactions.map(t => `${t.date},${t.description},${t.category},${t.type},${t.amount}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.csv';
    a.click();
  });
  