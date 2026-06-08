/* 
   NearZo B2B Tyre Marketplace Website
   Main Interaction Logic
*/

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initFaqAccordions();
  initContactForm();
  initStickyDownloadBar();
  initMapSimulation();
  initAnalytics();
});

/* --- Responsive Navigation (Hamburger & Scroll behavior) --- */
function initNavigation() {
  const header = document.querySelector('header');
  const hamburger = document.querySelector('.hamburger');
  const mobileDrawer = document.querySelector('.mobile-drawer');
  const overlay = document.querySelector('.overlay');

  if (!header) return;

  // Change header styling on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Mobile Drawer Toggle
  function toggleDrawer() {
    hamburger.classList.toggle('open');
    mobileDrawer.classList.toggle('open');
    overlay.classList.toggle('active');
    
    // Prevent background scrolling when menu is open
    if (mobileDrawer.classList.contains('open')) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  if (hamburger) {
    hamburger.addEventListener('click', toggleDrawer);
  }

  if (overlay) {
    overlay.addEventListener('click', toggleDrawer);
  }

  // Close drawer if clicking link
  const drawerLinks = document.querySelectorAll('.mobile-nav-link');
  drawerLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (mobileDrawer && mobileDrawer.classList.contains('open')) {
        toggleDrawer();
      }
    });
  });
}

/* --- FAQ Accordions Toggle --- */
function initFaqAccordions() {
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    const content = item.querySelector('.faq-content');

    if (!trigger || !content) return;

    trigger.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      // Close all other open FAQ items first (Accordion behavior)
      faqItems.forEach(otherItem => {
        if (otherItem !== item && otherItem.classList.contains('active')) {
          otherItem.classList.remove('active');
          otherItem.querySelector('.faq-content').style.maxHeight = null;
        }
      });

      // Toggle current FAQ item
      if (isActive) {
        item.classList.remove('active');
        content.style.maxHeight = null;
      } else {
        item.classList.add('active');
        // Set max-height dynamically to enable CSS transition
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });
}

/* --- Contact Form Validation & Submission Confirmation --- */
function initContactForm() {
  const contactForm = document.getElementById('nearzo-contact-form');
  if (!contactForm) return;

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Field references
    const nameInput = document.getElementById('contact-name');
    const phoneInput = document.getElementById('contact-phone');
    const businessInput = document.getElementById('contact-business');
    const cityInput = document.getElementById('contact-city');
    const messageInput = document.getElementById('contact-message');

    // Basic Validation checks
    if (!nameInput.value.trim()) {
      showError(nameInput, 'Name is required');
      return;
    }
    
    // Indian Mobile number validation (10 digits, optionally starting with country code or 0)
    const phoneVal = phoneInput.value.trim().replace(/\D/g, '');
    if (phoneVal.length < 10) {
      showError(phoneInput, 'Enter a valid 10-digit mobile number');
      return;
    }

    if (!businessInput.value.trim()) {
      showError(businessInput, 'Business Name is required');
      return;
    }

    if (!cityInput.value.trim()) {
      showError(cityInput, 'City/Location is required');
      return;
    }

    // Success Simulation
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Sending...';

    setTimeout(() => {
      // Create and show success toast
      showToast('Thank you! Our representative will call you within 24 hours.');
      
      // Reset form
      contactForm.reset();
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }, 1200);
  });

  function showError(inputElement, msg) {
    // Basic browser warning alert
    alert(msg);
    inputElement.focus();
  }
}

/* --- Toast Notification Helper --- */
function showToast(message) {
  // Check if toast element already exists
  let toast = document.querySelector('.toast-notification');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast-notification';
    document.body.appendChild(toast);
  }

  // Set message (using a checkmark icon SVG in raw text)
  toast.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
    <span>${message}</span>
  `;

  // Animate open
  toast.classList.add('show');

  // Dismiss after 4 seconds
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

/* --- Mobile Bottom Download Sticky Bar Dismissal --- */
function initStickyDownloadBar() {
  const closeBtn = document.querySelector('.sticky-bar-close-btn');
  const stickyBar = document.querySelector('.mobile-download-sticky-bar');

  if (closeBtn && stickyBar) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Avoid triggering any download navigation clicks
      stickyBar.style.display = 'none';
      // Save user dismissal in session storage
      sessionStorage.setItem('nearzo_download_bar_dismissed', 'true');
    });

    // Check if previously dismissed in current session
    if (sessionStorage.getItem('nearzo_download_bar_dismissed') === 'true') {
      stickyBar.style.display = 'none';
    }
  }
}

/* --- Contact Us Mock Map Simulation --- */
function initMapSimulation() {
  const pin = document.getElementById('interactive-map-pin');
  if (pin) {
    pin.addEventListener('click', () => {
      showToast('NearZo Sourcing Center: Navi Mumbai, India');
    });
  }
}

/* --- Google Analytics Ready Hook --- */
function initAnalytics() {
  // Google Analytics setup placeholder
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  // Replace G-XXXXXXXXXX with your actual GA tag
  gtag('config', 'G-NEARZO404');
  
  // Track button events on CTAs
  const downloadBtns = document.querySelectorAll('[href*="drive.google.com"], [href*="play.google.com"]');
  downloadBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Trigger virtual pageview or event
      console.log('NearZo Analytics: Tracked App Download Button Click');
      if (typeof gtag === 'function') {
        gtag('event', 'click', {
          'event_category': 'Engagement',
          'event_label': 'App Download Link'
        });
      }
    });
  });

  const whatsappBtns = document.querySelectorAll('[href*="wa.me"], [href*="whatsapp.com"]');
  whatsappBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      console.log('NearZo Analytics: Tracked WhatsApp Routing Click');
      if (typeof gtag === 'function') {
        gtag('event', 'click', {
          'event_category': 'Engagement',
          'event_label': 'WhatsApp Chat Link'
        });
      }
    });
  });
}
