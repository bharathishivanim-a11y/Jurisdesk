let currentRole = 'advocate';
let currentUser = null;
let allCases = [];

// DOM Elements
const loginSection = document.getElementById('loginSection');
const appSection = document.getElementById('appSection');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const caseForm = document.getElementById('caseForm');
const addCaseBtn = document.getElementById('addCaseBtn');

function setRole(role) {
  currentRole = role;
  document.getElementById('btnRoleAdvocate').classList.toggle('active', role === 'advocate');
  document.getElementById('btnRoleClient').classList.toggle('active', role === 'client');
}

function toggleAuthMode(mode) {
  if (mode === 'register') {
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
  } else {
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
  }
}

// Login
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role: currentRole })
    });

    const data = await res.json();
    if (res.ok) {
      currentUser = data;
      setupDashboard();
    } else {
      alert(data.error || 'Login failed');
    }
  } catch (err) {
    alert('Failed to connect to server.');
  }
});

// Register
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('regName').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role: currentRole })
    });

    const data = await res.json();
    if (res.ok) {
      alert('Registration successful! Please login.');
      toggleAuthMode('login');
    } else {
      alert(data.error || 'Registration failed');
    }
  } catch (err) {
    alert('Server error during registration');
  }
});

function setupDashboard() {
  loginSection.style.display = 'none';
  appSection.style.display = 'block';

  const userBadge = document.getElementById('userWelcomeBadge');
  const tableTitle = document.getElementById('tableTitle');

  if (currentUser.role === 'advocate') {
    userBadge.textContent = `👨‍⚖️ ${currentUser.name} (Advocate)`;
    tableTitle.textContent = `📂 All Cases Assigned to ${currentUser.name}`;
    addCaseBtn.style.display = 'inline-block';
  } else {
    userBadge.textContent = `👤 ${currentUser.name} (Client)`;
    tableTitle.textContent = `📂 My Legal Cases`;
    addCaseBtn.style.display = 'none'; // Clients cannot add cases
  }

  fetchCases();
}

function logout() {
  currentUser = null;
  appSection.style.display = 'none';
  loginSection.style.display = 'flex';
  loginForm.reset();
  registerForm.reset();
}

// Fetch Cases specific to Logged in user name & role
async function fetchCases() {
  try {
    const res = await fetch(`/api/cases?role=${currentUser.role}&name=${encodeURIComponent(currentUser.name)}`);
    allCases = await res.json();
    renderDashboard(allCases);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

function renderDashboard(cases) {
  const tbody = document.getElementById('caseTableBody');
  tbody.innerHTML = '';

  document.getElementById('statTotal').textContent = cases.length;
  document.getElementById('statPending').textContent = cases.filter(c => c.status === 'Pending').length;
  document.getElementById('statInProgress').textContent = cases.filter(c => c.status === 'In Progress').length;
  document.getElementById('statClosed').textContent = cases.filter(c => c.status === 'Closed').length;
  document.getElementById('caseCountBadge').textContent = `Showing ${cases.length} of ${allCases.length} cases`;

  if (cases.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 25px;">No legal cases recorded for ${currentUser.name}.</td></tr>`;
    return;
  }

  cases.forEach(item => {
    const tr = document.createElement('tr');
    
    // Advocate can edit/delete, Client is read-only
    const actionCell = currentUser.role === 'advocate' ? `
      <td>
        <button class="action-btn" title="Edit" onclick="openEditModal('${item._id}')">✏️</button>
        <button class="action-btn" title="Delete" onclick="deleteCase('${item._id}')">🗑️</button>
      </td>
    ` : `<td><span style="color:#64748b; font-size:0.8rem;">Read-Only</span></td>`;

    tr.innerHTML = `
      <td><strong>${item.caseNumber}</strong></td>
      <td>${item.title}</td>
      <td>${item.clientName}</td>
      <td><strong>${item.advocateName}</strong></td>
      <td>${item.court}</td>
      <td><span class="badge ${item.status.replace(/\s+/g, '-')}">${item.status}</span></td>
      <td>🗓️ ${item.nextHearingDate}</td>
      ${actionCell}
    `;
    tbody.appendChild(tr);
  });
}

function filterCases() {
  const query = document.getElementById('searchInput').value.toLowerCase();
  const statusFilter = document.getElementById('statusFilter').value;

  const filtered = allCases.filter(c => {
    const matchesQuery = c.caseNumber.toLowerCase().includes(query) ||
                         c.title.toLowerCase().includes(query) ||
                         c.clientName.toLowerCase().includes(query) ||
                         c.advocateName.toLowerCase().includes(query) ||
                         c.court.toLowerCase().includes(query);
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  renderDashboard(filtered);
}

function openAddModal() {
  document.getElementById('editCaseId').value = '';
  document.getElementById('modalTitle').textContent = 'Add New Legal Case';
  caseForm.reset();
  // Auto-fill logged in advocate's name
  if (currentUser.role === 'advocate') {
    document.getElementById('advocateName').value = currentUser.name;
  }
  document.getElementById('caseModal').classList.add('active');
}

function openEditModal(id) {
  const item = allCases.find(c => c._id === id);
  if (!item) return;

  document.getElementById('editCaseId').value = item._id;
  document.getElementById('modalTitle').textContent = 'Edit Legal Case';
  document.getElementById('caseNumber').value = item.caseNumber;
  document.getElementById('title').value = item.title;
  document.getElementById('clientName').value = item.clientName;
  document.getElementById('advocateName').value = item.advocateName;
  document.getElementById('court').value = item.court;
  document.getElementById('status').value = item.status;
  document.getElementById('nextHearingDate').value = item.nextHearingDate;

  document.getElementById('caseModal').classList.add('active');
}

function closeModal() {
  document.getElementById('caseModal').classList.remove('active');
}

caseForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('editCaseId').value;

  const payload = {
    caseNumber: document.getElementById('caseNumber').value,
    title: document.getElementById('title').value,
    clientName: document.getElementById('clientName').value,
    advocateName: document.getElementById('advocateName').value,
    court: document.getElementById('court').value,
    status: document.getElementById('status').value,
    nextHearingDate: document.getElementById('nextHearingDate').value
  };

  try {
    let res;
    if (id) {
      res = await fetch(`/api/cases/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }

    if (res.ok) {
      closeModal();
      fetchCases();
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to save case.');
    }
  } catch (err) {
    console.error('Error saving case:', err);
  }
});

async function deleteCase(id) {
  if (confirm('Are you sure you want to delete this case?')) {
    await fetch(`/api/cases/${id}`, { method: 'DELETE' });
    fetchCases();
  }
}