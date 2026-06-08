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
  initLanguageTranslation();
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

/* --- Multi-Language Translation System (EN | HI) --- */
function initLanguageTranslation() {
  const TRANSLATIONS = {
    en: {
      // Navigation & Globals
      "nav-home": "Home",
      "nav-about": "About Us",
      "nav-faq": "FAQs",
      "nav-contact": "Contact Us",
      "btn-download": "Download App",
      "btn-register": "Register as Dealer",
      "btn-download-apk": "Download APK",
      
      // Hero (Homepage)
      "hero-tagline": "B2B Tyre Marketplace India",
      "hero-title": "Find Tyres Nearby.<br><span class=\"gradient-text\">Get Quotes Fast.</span>",
      "hero-sub": "NearZo helps tyre dealers, retailers, wholesalers, and distributors quickly find stock, compare prices, and close deals through a trusted local dealer network.",
      
      // Features (Homepage)
      "feat-badge": "Features",
      "feat-title": "Designed to Grow Your Tyre Business",
      "feat-sub": "NearZo simplifies tyre procurement, helping businesses find stock nearby and close wholesale deals securely.",
      "feat-1-title": "Post Requirements Instantly",
      "feat-1-desc": "Post size, quantity, and brand requirements in 30 seconds. No more tedious dialing and messaging.",
      "feat-2-title": "Receive Multiple Quotes",
      "feat-2-desc": "Receive competitive price quotes from wholesale dealers in your vicinity within minutes.",
      "feat-3-title": "Connect with Nearby Dealers",
      "feat-3-desc": "Tap into local inventories. Connect with verified distributors in your target locality instantly.",
      "feat-4-title": "Fast Deal Closure",
      "feat-4-desc": "Accept quotes directly, access direct WhatsApp / phone contact lines, and wrap up deals immediately.",
      "feat-5-title": "Secure Dealer Network",
      "feat-5-desc": "Trade with peace of mind. Every wholesaler, distributor, and retailer is verified using OTP validation.",
      
      // Process
      "proc-badge": "Process",
      "proc-title": "How NearZo Works",
      "proc-sub": "Connecting tyre buyers and sellers in 5 simple, friction-free steps.",
      "step-1-title": "Post Requirement",
      "step-1-desc": "Select tyre size, quantity, brand preference, and post.",
      "step-2-title": "Receive Quotes",
      "step-2-desc": "Wholesalers in your area bid on your tyre request.",
      "step-3-title": "Compare Prices",
      "step-3-desc": "Compare stock availability, delivery times, and price.",
      "step-4-title": "Accept Best Deal",
      "step-4-desc": "Lock in the best price and choose your supplier.",
      "step-5-title": "Call or WhatsApp",
      "step-5-desc": "Call or WhatsApp to schedule pickup or delivery.",
      
      // Benefits
      "ben-badge": "Benefits",
      "ben-title": "Grow Profit. Cut Hassle.",
      "ben-header-old": "The Old Sourcing Way",
      "ben-header-new": "The NearZo Way",
      "ben-old-1": "Calling 10+ wholesale suppliers one-by-one looking for a specific size.",
      "ben-old-2": "No transparent pricing; pricing changes based on phone negotiation.",
      "ben-old-3": "Losing customers who leave because stock takes too long to find.",
      "ben-new-1": "Post once; local suppliers respond with availability and prices instantly.",
      "ben-new-2": "Compare multiple transparent quotes side-by-side on your screen.",
      "ben-new-3": "Close sales in minutes; keep your walk-in clients happy.",
      "ben-1-title": "Save Time",
      "ben-1-desc": "Eliminate endless outbound calls. Broadcast your tyre requirement in seconds.",
      "ben-2-title": "Reduce Phone Calls",
      "ben-2-desc": "Work quietly and efficiently. Receive price points and stock availability details digitally.",
      "ben-3-title": "Find Stock Faster",
      "ben-3-desc": "Source hard-to-find sizes (SUV, radial, performance tyres) from a large pool of local distributors.",
      "ben-4-title": "Expand Business Network",
      "ben-4-desc": "Build relationships with new trusted tyre wholesalers, retailers, and distributors in your region.",
      
      // Coverage
      "cov-badge": "Active Locations",
      "cov-title": "Sourcing Tyres Locally",
      "cov-sub": "NearZo operates a robust network of automotive parts and tyre dealers across key regions.",
      "cov-exp-title": "Expanding Across India",
      "cov-exp-sub": "Adding more dealers, wholesale hubs, and cities daily.",
      
      // Testimonials
      "test-badge": "Testimonials",
      "test-title": "What Tyre Dealers Say",
      "test-sub": "Hear from real business owners who rely on NearZo daily to source stocks.",
      "test-1-quote": "\"Before NearZo, we spent 2 hours every morning calling distributors in Panvel and Kamothe just to locate 18-inch SUV tyres. Now I post a query on the app and get quotes in 5 minutes. Saves us massive time!\"",
      "test-1-author": "Rajesh Kumar (Owner, Kumar Tyre Zone)",
      "test-2-quote": "\"Being a wholesaler, finding new retailers was expensive. NearZo sends matching requests from retail shops straight to my mobile. Our monthly business volumes have increased by 25%.\"",
      "test-2-author": "Mandeep Singh (Partner, Guru Nanak Tyre House)",
      "test-3-quote": "\"Customer walked in needing MRF tyres. We had no stock. We posted on NearZo, received a quote from a dealer 2 km away, picked it up, and fitted it for our customer in 40 minutes. Simply outstanding!\"",
      "test-3-author": "Amit Patel (Proprietor, Patel Wheels)",

      // CTA Banner
      "cta-banner-title": "Ready to Find Tyres Faster?",
      "cta-banner-sub": "Download the NearZo app today and join India's fastest growing B2B tyre trading dealer network.",
      "btn-download-now": "Download NearZo App",
      
      // About Us Page
      "about-header-title": "About Us",
      "about-over-badge": "Company Overview",
      "about-over-title": "Solving Tyre Sourcing Digitally",
      "about-over-p1": "NearZo is a B2B tyre marketplace built from the ground up to solve urgent tyre sourcing challenges for dealers and automotive businesses in India.",
      "about-over-p2": "Historically, tyre retailers and parts dealers have had to make dozens of phone calls everyday just to check local availability for client orders. NearZo changes this. By wrapping the local network of tyre wholesalers, distributors, and shops into a single mobile interface, we make locating and buying tyres lightning fast, completely transparent, and hassle-free.",
      "about-stat-1-label": "Sourcing Speed",
      "about-stat-2-label": "Connected Dealers",
      "about-stat-3-label": "Sourcing Success",
      "about-why-title": "Why NearZo?",
      "about-why-1-title": "Faster Sourcing",
      "about-why-1-desc": "Broadcast requests to the entire local grid; receive price quotes in minutes instead of hours.",
      "about-why-2-title": "Trusted Dealer Network",
      "about-why-2-desc": "Interact only with verified retailers, wholesalers, and distributors who are authenticated via OTP.",
      "about-why-3-title": "Better Business Opportunities",
      "about-why-3-desc": "Wholesalers get direct wholesale leads. Retailers secure hard-to-find sizes and close customer deals instantly.",
      "about-why-4-title": "Simple and Easy to Use",
      "about-why-4-desc": "Our mobile interface is simple, lightweight, and custom-tailored for business owners who may not be highly technical.",
      "about-mission-title": "Our Mission",
      "about-mission-desc": "To create India's most trusted, transparent, and efficient B2B tyre trading network. We aim to remove sourcing friction, allowing businesses to thrive and customers to stay on the move.",
      "about-vision-title": "Our Vision",
      "about-vision-desc": "To digitally connect every single tyre dealer, distributor, and brand in India into a unified real-time logistics ecosystem, setting a new benchmark for automotive parts trading.",
      
      // Contact Us Page
      "contact-header-title": "Contact Us",
      "contact-form-title": "Register as Dealer / Send Inquiry",
      "contact-lbl-name": "Full Name *",
      "contact-lbl-phone": "Mobile Number *",
      "contact-lbl-business": "Business Name *",
      "contact-lbl-city": "City / Area *",
      "contact-lbl-message": "Message (Optional)",
      "contact-btn-submit": "Submit Dealer Registration",
      "contact-support-title": "Business Support Desk",
      "contact-support-email": "Email Support",
      "contact-support-call": "Call Support",
      "contact-support-wa": "WhatsApp Chat",
      "contact-support-office": "Head Office",
      
      // FAQ Page
      "faq-header-title": "Frequently Asked Questions",
      "faq-badge": "Help Desk",
      "faq-title": "Got Questions? We Have Answers",
      "faq-sub": "Everything you need to know about the NearZo tyre marketplace platform.",
      "privacy-policy-header": "Privacy Policy"
    },
    hi: {
      // Navigation & Globals
      "nav-home": "मुख्य पृष्ठ",
      "nav-about": "हमारे बारे में",
      "nav-faq": "अक्सर पूछे जाने वाले सवाल",
      "nav-contact": "संपर्क करें",
      "btn-download": "ऐप डाउनलोड",
      "btn-register": "डीलर पंजीकरण",
      "btn-download-apk": "एपीके डाउनलोड",
      
      // Hero (Homepage)
      "hero-tagline": "बी2बी टायर मार्केटप्लेस भारत",
      "hero-title": "आस-पास के टायर ढूंढें।<br><span class=\"gradient-text\">तुरंत कोट्स प्राप्त करें।</span>",
      "hero-sub": "नियरज़ो (NearZo) टायर डीलरों, खुदरा विक्रेताओं, थोक विक्रेताओं और ऑटोमोटिव व्यवसायों को एक भरोसेमंद स्थानीय डीलर नेटवर्क के माध्यम से स्टॉक खोजने, कीमतों की तुलना करने और तुरंत सौदे करने में मदद करता है।",
      
      // Features (Homepage)
      "feat-badge": "विशेषताएं",
      "feat-title": "आपके टायर व्यवसाय को बढ़ाने के लिए डिज़ाइन किया गया",
      "feat-sub": "नियरज़ो टायर खरीद को सरल बनाता है, जिससे व्यवसायों को नज़दीकी स्टॉक खोजने और थोक सौदों को सुरक्षित रूप से पूरा करने में मदद मिलती है।",
      "feat-1-title": "आवश्यकताएं तुरंत पोस्ट करें",
      "feat-1-desc": "30 सेकंड में टायर का आकार, मात्रा और ब्रांड प्राथमिकता पोस्ट करें। फोन कॉल और मैसेजिंग के झंझट से मुक्ति।",
      "feat-2-title": "अनेक कोट्स प्राप्त करें",
      "feat-2-desc": "कुछ ही मिनटों में अपने क्षेत्र के थोक डीलरों से प्रतिस्पर्धी मूल्य कोट्स प्राप्त करें।",
      "feat-3-title": "आस-पास के डीलरों से जुड़ें",
      "feat-3-desc": "स्थानीय स्टॉक का लाभ उठाएं। अपने लक्षित क्षेत्र में सत्यापित वितरकों से तुरंत संपर्क स्थापित करें।",
      "feat-4-title": "सौदे तुरंत बंद करें",
      "feat-4-desc": "सीधे कोट्स स्वीकार करें, व्हाट्सऐप या फोन के माध्यम से संपर्क करें और सौदे को तुरंत अंतिम रूप दें।",
      "feat-5-title": "सुरक्षित डीलर नेटवर्क",
      "feat-5-desc": "पूरी सुरक्षा के साथ व्यापार करें। प्रत्येक थोक और खुदरा डीलर को ओटीपी सत्यापन के माध्यम से सत्यापित किया जाता है।",
      
      // Process
      "proc-badge": "प्रक्रिया",
      "proc-title": "नियरज़ो कैसे काम करता है",
      "proc-sub": "टायर खरीदारों और विक्रेताओं को 5 आसान और सरल चरणों में जोड़ना।",
      "step-1-title": "आवश्यकता पोस्ट करें",
      "step-1-desc": "टायर का आकार, मात्रा और पसंदीदा ब्रांड चुनें और पोस्ट करें।",
      "step-2-title": "कोट्स प्राप्त करें",
      "step-2-desc": "आपके क्षेत्र के थोक विक्रेता आपके टायर अनुरोध पर अपनी कीमतें भेजते हैं।",
      "step-3-title": "कीमतों की तुलना करें",
      "step-3-desc": "स्टॉक उपलब्धता, डिलीवरी समय और कीमत की तुलना करें।",
      "step-4-title": "सर्वश्रेष्ठ सौदा स्वीकार करें",
      "step-4-desc": "सबसे कम कीमत लॉक करें और अपने पसंदीदा सप्लायर को चुनें।",
      "step-5-title": "कॉल या व्हाट्सऐप करें",
      "step-5-desc": "डिलीवरी या पिकअप की व्यवस्था के लिए सप्लायर को कॉल या व्हाट्सऐप करें।",
      
      // Benefits
      "ben-badge": "लाभ",
      "ben-title": "मुनाफा बढ़ाएं। झंझट घटाएं।",
      "ben-header-old": "पुराना तरीका",
      "ben-header-new": "नियरज़ो का आधुनिक तरीका",
      "ben-old-1": "टायर का साइज खोजने के लिए एक-एक करके 10+ थोक सप्लायरों को कॉल करना।",
      "ben-old-2": "कोई पारदर्शी मूल्य निर्धारण नहीं; फोन पर मोलभाव के बाद ही कीमत तय होना।",
      "ben-old-3": "स्टॉक न मिलने के कारण ग्राहकों का वापस चले जाना और नुकसान होना।",
      "ben-new-1": "एक बार पोस्ट करें; आस-पास के सभी सप्लायर तुरंत उपलब्धता और कीमत बताते हैं।",
      "ben-new-2": "अपनी स्क्रीन पर एक साथ कई पारदर्शी कोट्स की तुलना करें।",
      "ben-new-3": "मिनटों में बिक्री पूरी करें; अपने ग्राहकों को तुरंत सर्विस देकर खुश रखें।",
      "ben-1-title": "समय बचाएं",
      "ben-1-desc": "लगातार फोन कॉल्स करने से बचें। केवल कुछ सेकंड में अपना अनुरोध भेजें।",
      "ben-2-title": "फोन कॉल्स कम करें",
      "ben-2-desc": "शांत और कुशल तरीके से काम करें। डिजिटल रूप से कीमतें और स्टॉक की जानकारी प्राप्त करें।",
      "ben-3-title": "तेजी से स्टॉक खोजें",
      "ben-3-desc": "बड़ी संख्या में स्थानीय वितरकों से दुर्लभ साइज (एसयूवी, रेडियल, परफॉर्मेंस टायर) आसानी से प्राप्त करें।",
      "ben-4-title": "व्यापार नेटवर्क का विस्तार करें",
      "ben-4-desc": "अपने क्षेत्र में नए भरोसेमंद थोक विक्रेताओं और खुदरा विक्रेताओं से व्यापार संबंध बनाएं।",
      
      // Coverage
      "cov-badge": "सक्रिय क्षेत्र",
      "cov-title": "स्थानीय स्तर पर टायर की आपूर्ति",
      "cov-sub": "नियरज़ो प्रमुख क्षेत्रों में ऑटोमोटिव और टायर डीलरों का एक मजबूत नेटवर्क संचालित करता है।",
      "cov-exp-title": "पूरे भारत में विस्तार",
      "cov-exp-sub": "प्रतिदिन नए डीलर, थोक केंद्र और शहर जोड़े जा रहे हैं।",
      
      // Testimonials
      "test-badge": "डीलरों की राय",
      "test-title": "टायर डीलरों का अनुभव",
      "test-sub": "उन वास्तविक व्यवसाय मालिकों से सुनें जो स्टॉक खोजने के लिए दैनिक रूप से नियरज़ो पर निर्भर हैं।",
      "test-1-quote": "\"नियरज़ो से पहले, हम केवल 18-इंच एसयूवी टायरों का पता लगाने के लिए पनवेल और कामोठे के सप्लायरों को फोन करने में हर सुबह 2 घंटे गंवाते थे। अब हम ऐप पर अनुरोध डालते हैं और 5 मिनट में कोट्स मिल जाते हैं। हमारा बहुत समय बचता है!\"",
      "test-1-author": "राजेश कुमार (मालिक, कुमार टायर जोन)",
      "test-2-quote": "\"एक थोक विक्रेता होने के नाते, नए खुदरा विक्रेताओं तक पहुंचना महंगा था। नियरज़ो सीधे मेरे मोबाइल पर खुदरा दुकानों से मैचिंग अनुरोध भेजता है। हमारा मासिक व्यापार वॉल्यूम 25% बढ़ गया है।\"",
      "test-2-author": "मनदीप सिंह (पार्टनर, गुरु नानक टायर हाउस)",
      "test-3-quote": "\"ग्राहक को एमआरएफ टायर चाहिए थे। हमारे पास स्टॉक नहीं था। हमने नियरज़ो पर पोस्ट किया, 2 किमी दूर के एक डीलर से कोट मिला, उसे पिकअप किया और 40 मिनट में ग्राहक की गाड़ी में फिट कर दिया। बेहद शानदार!\"",
      "test-3-author": "अमित पटेल (प्रोपराइटर, पटेल व्हील्स)",

      // CTA Banner
      "cta-banner-title": "टायर तेजी से खोजने के लिए तैयार हैं?",
      "cta-banner-sub": "आज ही नियरज़ो ऐप डाउनलोड करें और भारत के सबसे तेजी से बढ़ते बी2बी टायर डीलर नेटवर्क में शामिल हों।",
      "btn-download-now": "नियरज़ो ऐप डाउनलोड करें",
      
      // About Us Page
      "about-header-title": "हमारे बारे में",
      "about-over-badge": "कंपनी का परिचय",
      "about-over-title": "टायर सोर्सिंग का डिजिटल समाधान",
      "about-over-p1": "नियरज़ो एक बी2बी टायर मार्केटप्लेस है जिसे भारत में डीलरों और ऑटोमोटिव व्यवसायों के लिए तत्काल टायर सोर्सिंग की चुनौतियों को हल करने के लिए बनाया गया है।",
      "about-over-p2": "पहले, टायर खुदरा विक्रेताओं को केवल स्टॉक की उपलब्धता जांचने के लिए रोज़ाना दर्जनों फोन कॉल करने पड़ते थे। नियरज़ो इसे बदलता है। थोक विक्रेताओं, वितरकों और दुकानों के स्थानीय नेटवर्क को एक मोबाइल इंटरफ़ेस में जोड़कर, हम टायर खोजने और खरीदने की प्रक्रिया को बेहद तेज़, पारदर्शी और आसान बनाते हैं।",
      "about-stat-1-label": "सोर्सिंग की गति",
      "about-stat-2-label": "सक्रिय डीलर",
      "about-stat-3-label": "सफलता दर",
      "about-why-title": "नियरज़ो क्यों चुनें?",
      "about-why-1-title": "तेज सोर्सिंग",
      "about-why-1-desc": "पूरे स्थानीय नेटवर्क पर अनुरोध प्रसारित करें; घंटों के बजाय मिनटों में कोट्स प्राप्त करें।",
      "about-why-2-title": "भरोसेमंद डीलर नेटवर्क",
      "about-why-2-desc": "केवल सत्यापित खुदरा और थोक विक्रेताओं से बातचीत करें जो ओटीपी के माध्यम से प्रमाणित हैं।",
      "about-why-3-title": "बेहतर व्यावसायिक अवसर",
      "about-why-3-desc": "थोक विक्रेताओं को सीधे थोक ग्राहक मिलते हैं। खुदरा विक्रेता दुर्लभ आकार सुरक्षित कर तुरंत बिक्री पूरी करते हैं।",
      "about-why-4-title": "सरल और उपयोग में आसान",
      "about-why-4-desc": "हमारा मोबाइल इंटरफ़ेस बहुत सरल है, जिसे वे डीलर भी आसानी से चला सकते हैं जो तकनीकी रूप से बहुत कुशल नहीं हैं।",
      "about-mission-title": "हमारा मिशन",
      "about-mission-desc": "भारत का सबसे भरोसेमंद, पारदर्शी और कुशल बी2बी टायर ट्रेडिंग नेटवर्क बनाना। हम सोर्सिंग के झंझटों को खत्म करना चाहते हैं ताकि डीलरों का व्यवसाय बढ़ सके।",
      "about-vision-title": "हमारा विजन",
      "about-vision-desc": "भारत के प्रत्येक टायर डीलर और वितरक को एक वास्तविक समय के रसद पारिस्थितिकी तंत्र से जोड़ना, जो ऑटोमोटिव पार्ट्स व्यापार में एक नया मानक स्थापित करेगा।",
      
      // Contact Us Page
      "contact-header-title": "संपर्क करें",
      "contact-form-title": "डीलर पंजीकरण / पूछताछ भेजें",
      "contact-lbl-name": "पूरा नाम *",
      "contact-lbl-phone": "मोबाइल नंबर *",
      "contact-lbl-business": "व्यापार का नाम *",
      "contact-lbl-city": "शहर / क्षेत्र *",
      "contact-lbl-message": "संदेश (वैकल्पिक)",
      "contact-btn-submit": "डीलर पंजीकरण सबमिट करें",
      "contact-support-title": "व्यापार सहायता डेस्क",
      "contact-support-email": "ईमेल सपोर्ट",
      "contact-support-call": "फोन सपोर्ट",
      "contact-support-wa": "व्हाट्सऐप चैट",
      "contact-support-office": "मुख्य कार्यालय",
      
      // FAQ Page
      "faq-header-title": "अक्सर पूछे जाने वाले प्रश्न",
      "faq-badge": "सहायता डेस्क",
      "faq-title": "कोई सवाल है? हमारे पास जवाब हैं",
      "faq-sub": "नियरज़ो टायर मार्केटप्लेस प्लेटफॉर्म के बारे में वह सब कुछ जो आप जानना चाहते हैं।",
      "privacy-policy-header": "गोपनीयता नीति"
    }
  };

  const enBtn = document.querySelector('.lang-btn-en');
  const hiBtn = document.querySelector('.lang-btn-hi');
  const mobileEnBtn = document.querySelector('.mobile-lang-btn-en');
  const mobileHiBtn = document.querySelector('.mobile-lang-btn-hi');

  let currentLang = localStorage.getItem('nearzo_language') || 'en';

  function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('nearzo_language', lang);

    const translateElements = document.querySelectorAll('[data-translate]');
    translateElements.forEach(el => {
      const key = el.getAttribute('data-translate');
      if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
        el.innerHTML = TRANSLATIONS[lang][key];
      }
    });

    // Update active visual status on selectors
    if (enBtn && hiBtn) {
      if (lang === 'en') {
        enBtn.classList.add('active');
        hiBtn.classList.remove('active');
      } else {
        hiBtn.classList.add('active');
        enBtn.classList.remove('active');
      }
    }

    if (mobileEnBtn && mobileHiBtn) {
      if (lang === 'en') {
        mobileEnBtn.classList.add('active');
        mobileHiBtn.classList.remove('active');
      } else {
        mobileHiBtn.classList.add('active');
        mobileEnBtn.classList.remove('active');
      }
    }

    // Translate dynamic placeholders if on contact page
    const nameInput = document.getElementById('contact-name');
    const phoneInput = document.getElementById('contact-phone');
    const businessInput = document.getElementById('contact-business');
    const cityInput = document.getElementById('contact-city');
    const msgInput = document.getElementById('contact-message');

    if (nameInput) {
      nameInput.placeholder = lang === 'hi' ? 'अपना नाम दर्ज करें' : 'Enter your name';
      phoneInput.placeholder = lang === 'hi' ? '10-अंकों का मोबाइल नंबर दर्ज करें' : 'Enter 10-digit mobile number';
      businessInput.placeholder = lang === 'hi' ? 'टायर की दुकान / व्यवसाय का नाम' : 'Enter tyre shop / business name';
      cityInput.placeholder = lang === 'hi' ? 'जैसे: पनवेल, नवी मुंबई' : 'e.g. Panvel, Navi Mumbai';
      if (msgInput) msgInput.placeholder = lang === 'hi' ? 'अपनी टायर आवश्यकताओं या प्रश्नों को लिखें...' : 'Specify tyre requirements or query...';
    }
  }

  // Set up listeners
  if (enBtn) {
    enBtn.addEventListener('click', (e) => {
      e.preventDefault();
      applyLanguage('en');
    });
  }
  if (hiBtn) {
    hiBtn.addEventListener('click', (e) => {
      e.preventDefault();
      applyLanguage('hi');
    });
  }
  if (mobileEnBtn) {
    mobileEnBtn.addEventListener('click', (e) => {
      e.preventDefault();
      applyLanguage('en');
    });
  }
  if (mobileHiBtn) {
    mobileHiBtn.addEventListener('click', (e) => {
      e.preventDefault();
      applyLanguage('hi');
    });
  }

  // Initialize language on load
  applyLanguage(currentLang);
}
