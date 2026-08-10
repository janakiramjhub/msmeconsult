document.addEventListener('DOMContentLoaded', () => {

  // =========================================================================
  // 1. Navigation & Header scrolled class
  // =========================================================================
  const header = document.getElementById('header');
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Mobile drawer trigger
  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
  });

  // Close mobile drawer on navigation click
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      menuToggle.classList.remove('active');
      navMenu.classList.remove('active');
    });
  });

  // =========================================================================
  // 2. Multi-step Business Health Diagnostic Wizard
  // =========================================================================
  let currentStep = 1;
  const totalSteps = 4;

  const nextBtn = document.getElementById('diag-next-btn');
  const prevBtn = document.getElementById('diag-prev-btn');
  const scoreDisplay = document.getElementById('diag-score-display');
  const gaugeFill = document.getElementById('diag-gauge-fill');
  const reportDesc = document.getElementById('diag-report-desc');
  const bookConsultBtn = document.getElementById('diag-report-cta');

  const updateStepUI = () => {
    // Hide all step panels
    for (let i = 1; i <= totalSteps; i++) {
      document.getElementById(`step-panel-${i}`).classList.remove('active');
      const dot = document.querySelector(`.step-dot[data-step="${i}"]`);
      if (dot) {
        dot.classList.remove('active', 'completed');
        if (i < currentStep) {
          dot.classList.add('completed');
        } else if (i === currentStep) {
          dot.classList.add('active');
        }
      }
    }

    // Show active step panel
    document.getElementById(`step-panel-${currentStep}`).classList.add('active');

    // Manage buttons visibility and content
    if (currentStep === 1) {
      prevBtn.style.visibility = 'hidden';
    } else {
      prevBtn.style.visibility = 'visible';
    }

    if (currentStep === totalSteps) {
      nextBtn.innerHTML = 'Calculate Health Score <i class="fa-solid fa-calculator"></i>';
    } else {
      nextBtn.innerHTML = 'Next Step <i class="fa-solid fa-arrow-right"></i>';
    }
  };

  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      currentStep++;
      updateStepUI();
    } else {
      // Calculate final diagnostic metrics
      evaluateHealthScore();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      currentStep--;
      updateStepUI();
    }
  };

  const evaluateHealthScore = () => {
    // 1. Operations Score (Max: 50)
    const opVal = parseInt(document.querySelector('input[name="diag-op"]:checked').value);
    let opScore = 10;
    if (opVal === 2) opScore = 25;
    if (opVal === 3) opScore = 50;

    // 2. Tech Maturity Score (Max: 50)
    const techVal = parseInt(document.querySelector('input[name="diag-tech"]:checked').value);
    let techScore = 5;
    if (techVal === 2) techScore = 15;
    if (techVal === 3) techScore = 35;
    if (techVal === 4) techScore = 50;

    // 3. Financial Visibility Score (Max: 50)
    const finVal = parseInt(document.querySelector('input[name="diag-fin"]:checked').value);
    let finScore = 10;
    if (finVal === 2) finScore = 25;
    if (finVal === 3) finScore = 50;

    // Base Percentage out of 100
    const rawSum = opScore + techScore + finScore;
    let basePct = Math.round(rawSum / 1.5);

    // 4. Deductions for explicit active pain points
    let activeDeductions = 0;
    const gstCheck = document.getElementById('comp-opt-1').checked;
    const crmCheck = document.getElementById('comp-opt-2').checked;
    const supplyCheck = document.getElementById('comp-opt-3').checked;

    if (gstCheck) activeDeductions += 10;
    if (crmCheck) activeDeductions += 10;
    if (supplyCheck) activeDeductions += 12;

    let finalScore = basePct - activeDeductions;
    // Clamp score
    finalScore = Math.max(5, Math.min(98, finalScore));

    // Update Result UI
    scoreDisplay.textContent = `${finalScore}%`;
    gaugeFill.style.width = `${finalScore}%`;

    // Dynamic advice text based on Niti Aayog / Niti Niyog guidelines
    let diagnosisTitle = "";
    let diagnosisBody = "";
    let fontColor = "var(--accent-gold)";

    if (finalScore < 40) {
      fontColor = "#ff3b30";
      diagnosisTitle = "CRITICAL FIREFIGHTING OPERATION";
      diagnosisBody = "Your enterprise shows low digital maturity (Paper/Excel silos) and high reliance on individual knowledge. This causes quality inconsistencies, delayed deliveries, and Trapped Working Capital. **Priority Recommendation**: Streamline manual workflows with documented SOPs and standard inventory controls.";
    } else if (finalScore >= 40 && finalScore < 75) {
      fontColor = "var(--accent-gold)";
      diagnosisTitle = "MODERATE OPERATIONAL RISK";
      diagnosisBody = "You have transitioned beyond paper ledgers, but lack consolidated analytics. Departments operate in silos with poor handoffs, and managers face a GST/PF compliance burden. **Priority Recommendation**: Implement a centralized cloud ERP to automate workflows and unify reporting.";
    } else {
      fontColor = "#4cd964";
      diagnosisTitle = "HEALTHY DIGITIZED OPERATION";
      diagnosisBody = "Your systems are structured and documented. To scale to a Level 5 organization, we recommend deploying automated AI quotation engines, CRM ticket pipelines, and predictive supply chain analytics.";
    }

    scoreDisplay.style.color = fontColor;
    reportDesc.innerHTML = `<strong style="display:block; margin-bottom:8px; color:${fontColor};">${diagnosisTitle}</strong>${diagnosisBody}`;

    // Enable booking button
    bookConsultBtn.disabled = false;
    bookConsultBtn.dataset.calculatedScore = `${finalScore}% (${diagnosisTitle})`;
    bookConsultBtn.dataset.recommendation = diagnosisBody;
  };

  // Nav buttons events
  nextBtn.addEventListener('click', handleNextStep);
  prevBtn.addEventListener('click', handlePrevStep);

  // Auto pre-populate form from diagnostic result
  bookConsultBtn.addEventListener('click', () => {
    const score = bookConsultBtn.dataset.calculatedScore;
    const rec = bookConsultBtn.dataset.recommendation;

    const companyNotes = document.getElementById('inquiry-notes');
    const contactSection = document.getElementById('contact');

    if (companyNotes && contactSection) {
      companyNotes.value = `Online Diagnostics Result: ${score}\nRequested operational audit to resolve key bottlenecks.\nRecommended Roadmap: ${rec.replace(/\*\*/g, '')}`;
      contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  // =========================================================================
  // 3. Client consultation booking form validation
  // =========================================================================
  const form = document.getElementById('consultation-form');
  const formMsg = document.getElementById('form-msg');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const company = document.getElementById('company-name').value.trim();
    const name = document.getElementById('owner-name').value.trim();
    const phone = document.getElementById('contact-phone').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const sector = document.getElementById('business-sector').value;
    const size = document.getElementById('company-size').value;
    const notes = document.getElementById('inquiry-notes').value.trim();

    // Reset status
    formMsg.className = 'form-message';
    formMsg.style.display = 'none';

    // Required fields check
    if (!company || !name || !phone || !sector || !size) {
      showFormError('Please fill out all required fields marked with *');
      return;
    }

    // Phone standard check (Indian 10 digit starts with 6,7,8,9)
    const phonePattern = /^[6789]\d{9}$/;
    if (!phonePattern.test(phone)) {
      showFormError('Please enter a valid 10-digit mobile number (e.g. 9876543210)');
      return;
    }

    // Email optional syntax check
    if (email) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        showFormError('Please enter a valid email address');
        return;
      }
    }

    // Success response
    showFormSuccess(`Thank you, ${name}! Your diagnostic booking request for ${company} is submitted. A senior consulting manager will call you on ${phone} within 2 hours.`);

    // Persist details locally
    const bookings = JSON.parse(localStorage.getItem('msme_consult_bookings') || '[]');
    bookings.push({
      id: Date.now(),
      company,
      name,
      phone,
      email,
      sector,
      size,
      notes,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('msme_consult_bookings', JSON.stringify(bookings));

    // Reset form
    form.reset();
  });

  const showFormError = (msg) => {
    formMsg.textContent = msg;
    formMsg.classList.add('error');
    formMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const showFormSuccess = (msg) => {
    formMsg.textContent = msg;
    formMsg.classList.add('success');
    formMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

});
