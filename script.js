/**
 * ==========================================================================
 * HWK–COP17 PARTNERSHIP LANDING PAGE — JAVASCRIPT
 * Hiking with Knowledge (HWK) Mongolia
 * Lightweight, Accessible, Vanilla JS
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // ------------------------------------------------------------------------
  // 1. CONFIGURATION
  // ------------------------------------------------------------------------
  /**
   * Set your deployed Google Apps Script Web App URL below.
   * To deploy: Open Google Sheet > Extensions > Apps Script > Paste integration/Code.gs > Deploy as Web App.
   * When empty, the form remains in an unconfigured state and displays the direct-contact fallback without submitting or clearing user data.
   */
  const GOOGLE_APPS_SCRIPT_ENDPOINT = "https://script.google.com/macros/s/AKfycbyY6ef-GHxyX-CT3o0M2TiCdfq864-Lx9_rHpDuO5MhDcl3hz_Kth-HATfDJTOxq1b-lw/exec"; 

  // ------------------------------------------------------------------------
  // 2. MOBILE NAVIGATION TOGGLE
  // ------------------------------------------------------------------------
  const menuToggle = document.getElementById('mobile-menu-toggle');
  const navLinks = document.getElementById('nav-links');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', !isExpanded);
      navLinks.classList.toggle('active');
    });

    // Close menu when a navigation link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ------------------------------------------------------------------------
  // 3. SELECTABLE CHIPS FOR FORM
  // ------------------------------------------------------------------------
  // A) Multi-select "I'm interested in..." chips
  const interestChips = document.querySelectorAll('.chip-interest');
  const interestsHiddenInput = document.getElementById('field-interests');

  function updateInterestsValue() {
    const selected = Array.from(interestChips)
      .filter(chip => chip.classList.contains('active'))
      .map(chip => chip.getAttribute('data-value'));
    if (interestsHiddenInput) {
      interestsHiddenInput.value = selected.join(', ');
    }
  }

  interestChips.forEach(chip => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('active');
      const isPressed = chip.classList.contains('active');
      chip.setAttribute('aria-pressed', isPressed ? 'true' : 'false');
      updateInterestsValue();
    });
  });

  // B) Single-select "Which HWK opportunity interests you?" chips
  const opportunityChips = document.querySelectorAll('.chip-opportunity');
  const opportunityHiddenInput = document.getElementById('field-opportunity');

  function setOpportunitySelection(targetValue) {
    opportunityChips.forEach(chip => {
      const val = chip.getAttribute('data-value');
      const isMatch = Boolean(targetValue && val === targetValue);
      chip.classList.toggle('active', isMatch);
      chip.setAttribute('aria-pressed', isMatch ? 'true' : 'false');
    });
    if (opportunityHiddenInput) {
      opportunityHiddenInput.value = targetValue || '';
    }
  }

  opportunityChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const val = chip.getAttribute('data-value');
      // If already active, toggle off so opportunity remains optional
      if (chip.classList.contains('active')) {
        chip.classList.remove('active');
        chip.setAttribute('aria-pressed', 'false');
        if (opportunityHiddenInput) opportunityHiddenInput.value = '';
      } else {
        setOpportunitySelection(val);
      }
    });
  });

  // ------------------------------------------------------------------------
  // 4. OPPORTUNITY CARD CTA BUTTONS (PRE-SELECTION & SMOOTH SCROLL)
  // ------------------------------------------------------------------------
  const selectOppButtons = document.querySelectorAll('[data-select-opportunity]');
  const formSection = document.getElementById('partnership-form');

  selectOppButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const oppValue = btn.getAttribute('data-select-opportunity');
      
      // 1. Preselect the matching chip in the form
      setOpportunitySelection(oppValue);

      // 2. Smoothly scroll to the form
      if (formSection) {
        formSection.scrollIntoView({ behavior: 'smooth' });
        
        // 3. Accessibility: Focus on the first input field
        const nameField = document.getElementById('field-name');
        if (nameField) {
          setTimeout(() => nameField.focus({ preventScroll: true }), 400);
        }
      }
    });
  });

  // ------------------------------------------------------------------------
  // 5. FORM VALIDATION & CONFIRMED SUBMISSION (ROUND 3.1A)
  // ------------------------------------------------------------------------
  const form = document.getElementById('partnership-interest-form');
  const formStatus = document.getElementById('form-status-message');
  const submitBtn = document.getElementById('form-submit-btn');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Reset status
      if (formStatus) {
        formStatus.className = 'form-status';
        formStatus.innerHTML = '';
        formStatus.style.display = 'none';
      }

      // Collect field values
      const name = (document.getElementById('field-name')?.value || '').trim();
      const organization = (document.getElementById('field-organization')?.value || '').trim();
      const email = (document.getElementById('field-email')?.value || '').trim();
      const interestedIn = interestsHiddenInput ? interestsHiddenInput.value.trim() : '';
      const opportunity = opportunityHiddenInput ? opportunityHiddenInput.value.trim() : '';
      const notes = (document.getElementById('field-notes')?.value || '').trim();

      // Client-side Validation
      const errors = [];
      if (!name) {
        errors.push("Please enter your name.");
      } else if (name.length > 120) {
        errors.push("Name must be under 120 characters.");
      }

      if (!organization) {
        errors.push("Please enter your organization.");
      } else if (organization.length > 180) {
        errors.push("Organization must be under 180 characters.");
      }

      if (!email) {
        errors.push("Please enter your email address.");
      } else if (email.length > 254) {
        errors.push("Email address is too long.");
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          errors.push("Please enter a valid email address.");
        }
      }

      if (!interestedIn) {
        errors.push("Please select at least one interest under 'I’m interested in…'");
      }

      if (notes.length > 1000) {
        errors.push("Notes must be under 1000 characters.");
      }

      if (errors.length > 0) {
        showStatusMessage(errors.join(" "), "status-error");
        return;
      }

      // Set Submitting State
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending…';
      }

      // TASK 1 & TASK 11: When endpoint is blank, fail safely without fake success
      if (!GOOGLE_APPS_SCRIPT_ENDPOINT || GOOGLE_APPS_SCRIPT_ENDPOINT.trim() === "") {
        showStatusMessage(
          'The partnership form is not connected yet. Please contact us at <a href="mailto:hikingwithknowledge@gmail.com" style="color: inherit; text-decoration: underline;">hikingwithknowledge@gmail.com</a>.',
          'status-error'
        );
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit Partnership Interest';
        }
        return;
      }

      // TASK 3: Confirmed Submission via hidden iframe + form POST + postMessage
      const submissionToken = "hwk_" + Date.now() + "_" + Math.random().toString(36).substring(2, 10);

      // Ensure hidden transport iframe exists
      let transportIframe = document.getElementById('hwk-transport-iframe');
      if (!transportIframe) {
        transportIframe = document.createElement('iframe');
        transportIframe.id = 'hwk-transport-iframe';
        transportIframe.name = 'hwk_transport_iframe';
        transportIframe.style.display = 'none';
        transportIframe.setAttribute('aria-hidden', 'true');
        transportIframe.setAttribute('tabindex', '-1');
        document.body.appendChild(transportIframe);
      }

      let timeoutTimer = null;
      let messageHandler = null;

      const cleanupTransport = () => {
        if (timeoutTimer) {
          clearTimeout(timeoutTimer);
          timeoutTimer = null;
        }
        if (messageHandler) {
          window.removeEventListener('message', messageHandler);
          messageHandler = null;
        }
      };

      // 15-second timeout for server response
      timeoutTimer = setTimeout(() => {
        cleanupTransport();
        showStatusMessage(
          'Submission timed out. Please try again or contact us directly at <a href="mailto:hikingwithknowledge@gmail.com" style="color: inherit; text-decoration: underline;">hikingwithknowledge@gmail.com</a>.',
          'status-error'
        );
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit Partnership Interest';
        }
      }, 15000);

      // Trusted Origin Validator for Google Apps Script responses
      const isTrustedGoogleOrigin = (origin) => {
        if (!origin || typeof origin !== 'string') return false;
        try {
          const url = new URL(origin);
          if (url.protocol !== 'https:') return false;
          const host = url.hostname.toLowerCase();
          return host === 'script.google.com' ||
                 host === 'script.googleusercontent.com' ||
                 host.endsWith('.googleusercontent.com');
        } catch (urlErr) {
          return false;
        }
      };

      // Message listener for verified server confirmation
      messageHandler = (event) => {
        // 1. Validate actual sending iframe window
        if (event.source !== transportIframe.contentWindow) {
          return;
        }

        // 2. Validate trusted HTTPS Google origin
        if (!isTrustedGoogleOrigin(event.origin)) {
          return;
        }

        let data = event.data;
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          } catch (jsonParseErr) {
            return;
          }
        }

        // 3. Validate message identity and matching submission token
        if (!data || data.source !== 'hwk-partnership-form' || data.token !== submissionToken) {
          return;
        }

        cleanupTransport();

        if (data.status === 'success') {
          // VERIFIED SUCCESS ONLY: Show confirmation, reset form, clear chips
          showStatusMessage(
            'Thank you for connecting with Hiking with Knowledge. We’ve received your partnership interest and look forward to continuing the conversation.',
            'status-success'
          );

          form.reset();
          interestChips.forEach(chip => {
            chip.classList.remove('active');
            chip.setAttribute('aria-pressed', 'false');
          });
          opportunityChips.forEach(chip => {
            chip.classList.remove('active');
            chip.setAttribute('aria-pressed', 'false');
          });
          if (interestsHiddenInput) interestsHiddenInput.value = '';
          if (opportunityHiddenInput) opportunityHiddenInput.value = '';
        } else {
          // Controlled server error: preserve user inputs
          const serverMsg = data.message || 'We could not submit your request at this time.';
          showStatusMessage(
            `${serverMsg} Please contact us at <a href="mailto:hikingwithknowledge@gmail.com" style="color: inherit; text-decoration: underline;">hikingwithknowledge@gmail.com</a>.`,
            'status-error'
          );
        }

        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit Partnership Interest';
        }
      };

      window.addEventListener('message', messageHandler);

      // Create and dispatch hidden form POST to Google Apps Script
      const hiddenForm = document.createElement('form');
      hiddenForm.style.display = 'none';
      hiddenForm.method = 'POST';
      hiddenForm.action = GOOGLE_APPS_SCRIPT_ENDPOINT;
      hiddenForm.target = 'hwk_transport_iframe';

      const fields = {
        token: submissionToken,
        name: name,
        organization: organization,
        email: email,
        interestedIn: interestedIn,
        opportunity: opportunity, // Blank if unselected (Task 7)
        notes: notes
      };

      Object.keys(fields).forEach(key => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = fields[key];
        hiddenForm.appendChild(input);
      });

      document.body.appendChild(hiddenForm);

      try {
        hiddenForm.submit();
      } catch (submitErr) {
        cleanupTransport();
        showStatusMessage(
          'An unexpected error occurred during submission. Please contact us directly at <a href="mailto:hikingwithknowledge@gmail.com" style="color: inherit; text-decoration: underline;">hikingwithknowledge@gmail.com</a>.',
          'status-error'
        );
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit Partnership Interest';
        }
      } finally {
        if (hiddenForm.parentNode) {
          hiddenForm.parentNode.removeChild(hiddenForm);
        }
      }
    });
  }

  function showStatusMessage(message, typeClass) {
    if (!formStatus) return;
    formStatus.className = `form-status ${typeClass} active`;
    if (message.indexOf('<') !== -1) {
      formStatus.innerHTML = message;
    } else {
      formStatus.textContent = message;
    }
    formStatus.style.display = 'block';
    formStatus.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
});
