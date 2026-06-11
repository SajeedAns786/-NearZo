document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const logoutBtn = document.getElementById('logoutBtn');
  const statDealers = document.getElementById('statDealers');
  const statBids = document.getElementById('statBids');
  const statDownloads = document.getElementById('statDownloads');
  const statInquiries = document.getElementById('statInquiries');
  
  const dealersTableBody = document.getElementById('dealersTableBody');
  const activityFeed = document.getElementById('activityFeed');
  
  const sourceText = document.getElementById('sourceText');
  const sourceBadge = document.getElementById('sourceBadge');
  
  const sidebarLinks = document.querySelectorAll('.sidebar-link');
  const viewTitle = document.getElementById('viewTitle');
  const viewSubtitle = document.getElementById('viewSubtitle');
  const tablePanelTitle = document.getElementById('tablePanelTitle');
  
  const searchInput = document.getElementById('tableSearchInput');
  const tabButtons = document.querySelectorAll('#dealerFilterTabs .tab-btn');
  const dealerFilterTabs = document.getElementById('dealerFilterTabs');
  const dealersTableHead = document.querySelector('#dealersTable thead');
  
  // Mobile Menu Toggles
  const menuToggleBtn = document.getElementById('menuToggleBtn');
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');

  // Dashboard State
  let store = {
    dealers: [],
    inquiries: [],
    summary: {},
    activeTab: 'dashboard', // dashboard, dealers, inquiries
    dealerFilter: 'all',
    searchQuery: '',
    dataSource: ''
  };

  // 1. Fetch Stats from Backend
  async function fetchDashboardStats() {
    try {
      const response = await fetch('/api/admin/stats');
      if (response.status === 401) {
        // Not authenticated, redirect to login
        window.location.href = '/admin';
        return;
      }

      const data = await response.json();
      if (data.success && data.stats) {
        store.dealers = data.stats.dealers || [];
        store.inquiries = data.stats.recentInquiries || [];
        store.summary = data.stats.summary || {};
        store.dataSource = data.stats.dataSource || '';
        
        renderDashboard();
      } else {
        console.error('Failed to load dashboard data:', data.message);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  }

  // 2. Render Functions
  function renderDashboard() {
    // Render Stats Metrics
    statDealers.innerText = formatNumber(store.summary.totalDealers || store.dealers.length);
    statBids.innerText = formatNumber(store.summary.activeBids || 0);
    statDownloads.innerText = formatNumber(store.summary.appDownloads || 0);
    statInquiries.innerText = formatNumber(store.summary.inquiriesCount || store.inquiries.length);

    // Data Source indicator
    sourceText.innerText = store.dataSource;
    if (store.dataSource.includes('Mock')) {
      sourceBadge.classList.add('mock');
    } else {
      sourceBadge.classList.remove('mock');
    }

    // Render based on current view/tab
    renderMainPanel();
    renderActivityFeed();
  }

  function renderMainPanel() {
    if (store.activeTab === 'dashboard' || store.activeTab === 'dealers') {
      // Show Dealer Controls
      dealerFilterTabs.style.display = 'flex';
      tablePanelTitle.innerText = store.activeTab === 'dashboard' ? 'Registered Tyre Dealers' : 'Full Tyre Dealer Directory';
      
      // Reset Headers to Dealers headers
      dealersTableHead.innerHTML = `
        <tr>
          <th>Dealer Name</th>
          <th>City</th>
          <th>Phone Number</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      `;

      // Filter and Search Dealers
      let filteredDealers = store.dealers.filter(dealer => {
        // Tab Filter
        if (store.dealerFilter === 'verified' && dealer.status.toLowerCase() !== 'verified') return false;
        if (store.dealerFilter === 'pending' && dealer.status.toLowerCase() !== 'pending') return false;
        
        // Search Filter
        if (store.searchQuery) {
          const query = store.searchQuery.toLowerCase();
          const matchesName = dealer.name.toLowerCase().includes(query);
          const matchesCity = dealer.city.toLowerCase().includes(query);
          const matchesPhone = dealer.phone.toLowerCase().includes(query);
          return matchesName || matchesCity || matchesPhone;
        }
        return true;
      });

      // Populate Table Body
      if (filteredDealers.length === 0) {
        dealersTableBody.innerHTML = `
          <tr>
            <td colspan="5" style="text-align: center; color: var(--text-gray); padding: 40px 0;">
              No dealers found matching criteria.
            </td>
          </tr>
        `;
      } else {
        dealersTableBody.innerHTML = filteredDealers.map((dealer, idx) => {
          const statusClass = dealer.status.toLowerCase() === 'verified' ? 'verified' : 'pending';
          const formatTime = new Date(dealer.created).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric'
          });
          
          return `
            <tr>
              <td>
                <div class="dealer-name-cell">
                  <span class="dealer-main-name">${escapeHTML(dealer.name)}</span>
                  <span class="dealer-time">Joined: ${formatTime}</span>
                </div>
              </td>
              <td>${escapeHTML(dealer.city)}</td>
              <td><code>${escapeHTML(dealer.phone)}</code></td>
              <td>
                <span class="status-badge ${statusClass}">
                  <span class="source-dot"></span>
                  ${dealer.status}
                </span>
              </td>
              <td>
                <div class="table-actions">
                  <button class="action-btn" title="View details" onclick="alertDealerInfo('${escapeJS(dealer.name)}', '${escapeJS(dealer.phone)}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </button>
                  <button class="action-btn" title="${dealer.status.toLowerCase() === 'verified' ? 'Deactivate' : 'Approve'}" onclick="toggleDealerVerification(${idx})">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                      ${dealer.status.toLowerCase() === 'verified' 
                        ? '<circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>' 
                        : '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>'
                      }
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          `;
        }).join('');
      }
    } else if (store.activeTab === 'inquiries') {
      // Show Inquiries panel layout inside the table container
      dealerFilterTabs.style.display = 'none';
      tablePanelTitle.innerText = 'Customer & Dealer Inquiries';
      
      // Update Table Headers
      dealersTableHead.innerHTML = `
        <tr>
          <th>Sender Name</th>
          <th>Email Address</th>
          <th>Subject</th>
          <th>Message</th>
          <th>Actions</th>
        </tr>
      `;

      // Filter and Search Inquiries
      let filteredInquiries = store.inquiries.filter(inq => {
        if (store.searchQuery) {
          const query = store.searchQuery.toLowerCase();
          return inq.name.toLowerCase().includes(query) ||
                 inq.email.toLowerCase().includes(query) ||
                 inq.subject.toLowerCase().includes(query) ||
                 inq.message.toLowerCase().includes(query);
        }
        return true;
      });

      // Populate Table Body with Inquiries
      if (filteredInquiries.length === 0) {
        dealersTableBody.innerHTML = `
          <tr>
            <td colspan="5" style="text-align: center; color: var(--text-gray); padding: 40px 0;">
              No inquiries found matching search criteria.
            </td>
          </tr>
        `;
      } else {
        dealersTableBody.innerHTML = filteredInquiries.map((inq, idx) => `
          <tr>
            <td><strong>${escapeHTML(inq.name)}</strong></td>
            <td><code>${escapeHTML(inq.email)}</code></td>
            <td><span style="color: var(--primary-orange); font-weight: 500;">${escapeHTML(inq.subject)}</span></td>
            <td style="max-width: 320px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${escapeHTML(inq.message)}">
              ${escapeHTML(inq.message)}
            </td>
            <td>
              <div class="table-actions">
                <button class="action-btn" title="View Full Message & Reply" onclick="viewInquiryMessage(${idx})">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </button>
                <button class="action-btn" title="Mark as Resolved" onclick="resolveInquiry(${idx})">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        `).join('');
      }
    }
  }

  function renderActivityFeed() {
    // Generate some dynamic mock activities mixed with inquiries
    const activityItems = [
      { type: 'bid', title: 'New Sourcing Bid Placed', desc: 'Dealers competed for 20x MRF Steel Muscle Radial Tyres.', time: '2 mins ago' },
      { type: 'dealer', title: 'Dealer Verified Successfully', desc: 'Gujarat Tyre Zone verification checks approved.', time: '1 hour ago' },
      { type: 'download', title: 'NearZo Android App Install', desc: 'New user registered via device OTP from Chandigarh.', time: '3 hours ago' }
    ];

    // Append inquiries to activities
    store.inquiries.forEach((inq, idx) => {
      activityItems.push({
        type: 'inquiry',
        title: `Contact Inquiry: ${inq.subject}`,
        desc: `${inq.name} sent message: "${inq.message.substring(0, 45)}..."`,
        time: idx === 0 ? '5 mins ago' : idx === 1 ? '4 hours ago' : '1 day ago'
      });
    });

    // Sort or order them nicely
    activityFeed.innerHTML = activityItems.map(item => {
      const isDealer = item.type === 'dealer' || item.type === 'bid';
      return `
        <div class="feed-item ${!isDealer ? 'feed-inquiry' : ''}">
          <div class="feed-avatar">
            ${isDealer 
              ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                 </svg>`
              : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                 </svg>`
            }
          </div>
          <div class="feed-body">
            <span class="feed-title">${escapeHTML(item.title)}</span>
            <span class="feed-desc">${escapeHTML(item.desc)}</span>
            <span class="feed-time">${item.time}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  // 3. Tab Swapping (Sidebar Controls)
  sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      sidebarLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      const targetTab = link.getAttribute('data-tab');
      store.activeTab = targetTab;
      
      // Reset search
      searchInput.value = '';
      store.searchQuery = '';

      if (targetTab === 'dashboard') {
        viewTitle.innerText = 'Dashboard Overview';
        viewSubtitle.innerText = 'Real-time stats from NearZo application ecosystem';
      } else if (targetTab === 'dealers') {
        viewTitle.innerText = 'Tyre Dealers Management';
        viewSubtitle.innerText = 'Approve, review, or verify tyre dealers registered on the mobile application';
      } else if (targetTab === 'inquiries') {
        viewTitle.innerText = 'Inquiries Database';
        viewSubtitle.innerText = 'Respond and review contact questions from the marketplace website';
      }

      renderMainPanel();
      
      // Close mobile sidebar on navigation click
      sidebar.classList.remove('open');
      sidebarOverlay.classList.remove('open');
    });
  });

  // 4. Filters & Searches
  searchInput.addEventListener('input', (e) => {
    store.searchQuery = e.target.value.trim();
    renderMainPanel();
  });

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      store.dealerFilter = btn.getAttribute('data-filter');
      renderMainPanel();
    });
  });

  // 5. Simulated Actions (verification, replies)
  window.toggleDealerVerification = function(index) {
    const dealer = store.dealers[index];
    if (!dealer) return;

    if (dealer.status.toLowerCase() === 'verified') {
      dealer.status = 'Pending';
      showToast(`Dealer "${dealer.name}" marked as Pending verification.`);
    } else {
      dealer.status = 'Verified';
      showToast(`Dealer "${dealer.name}" verified successfully!`);
    }
    renderDashboard();
  };

  window.alertDealerInfo = function(name, phone) {
    alert(`Dealer Details:\nName: ${name}\nPhone: ${phone}\nAccess Level: Full Mobile Partner`);
  };

  window.viewInquiryMessage = function(idx) {
    const inq = store.inquiries[idx];
    if (!inq) return;
    alert(`Inquiry Details:\nFrom: ${inq.name} (${inq.email})\nSubject: ${inq.subject}\n\nMessage:\n"${inq.message}"`);
  };

  window.resolveInquiry = function(idx) {
    const inq = store.inquiries[idx];
    if (!inq) return;
    
    // Simulate removing from list
    store.inquiries.splice(idx, 1);
    if (store.summary.inquiriesCount > 0) store.summary.inquiriesCount--;
    
    showToast(`Inquiry from "${inq.name}" marked as resolved.`);
    renderDashboard();
  };

  // Toast Functionality
  function showToast(msg) {
    const toast = document.getElementById('actionToast');
    const toastMsg = document.getElementById('toastMessage');
    
    toastMsg.innerText = msg;
    toast.classList.add('show');
    
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3500);
  }

  // 6. Logout Handling
  logoutBtn.addEventListener('click', async () => {
    if (!confirm('Are you sure you want to sign out?')) return;
    
    try {
      const response = await fetch('/api/admin/logout', {
        method: 'POST'
      });
      if (response.ok) {
        window.location.href = '/admin';
      }
    } catch (e) {
      console.error('Logout failed:', e);
      // Hard redirect to clear frontend cookies if fetch fails
      window.location.href = '/admin';
    }
  });

  // 7. Mobile Navigation Toggle Controls
  menuToggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    sidebarOverlay.classList.toggle('open');
  });

  sidebarOverlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('open');
  });

  // Utils
  function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function escapeHTML(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function escapeJS(str) {
    if (!str) return '';
    return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
  }

  // Initialize
  fetchDashboardStats();
});
