// Smooth-scroll fallback for browsers ignoring CSS scroll-behavior,
    // and to account for the sticky header when landing on a section.
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var id = this.getAttribute('href').slice(1);
        var target = document.getElementById(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          history.pushState(null, '', '#' + id);
        }
      });
    });

    // Roulette-style auto-scrolling project carousel.
    // Driven with requestAnimationFrame rather than a CSS animation so it
    // keeps running reliably across browsers, and pauses cleanly on hover.
    (function () {
      var viewport = document.querySelector('[data-carousel]');
      var track = viewport && viewport.querySelector('.work-track');
      if (!track) return;

      var pxPerSecond = 40; // scroll speed
      var offset = 0;
      var paused = false;
      var lastTime = null;
      var loopWidth = 0;

      function measure() {
        // The track's content is duplicated once, so half its scrollWidth
        // is exactly one full set of cards — that's our seamless loop point.
        loopWidth = track.scrollWidth / 2;
      }

      function tick(time) {
        if (lastTime === null) lastTime = time;
        var delta = (time - lastTime) / 1000;
        lastTime = time;

        if (!paused && loopWidth > 0) {
          offset += pxPerSecond * delta;
          if (offset >= loopWidth) offset -= loopWidth;
          track.style.transform = 'translateX(' + (-offset) + 'px)';
        }
        requestAnimationFrame(tick);
      }

      measure();
      window.addEventListener('resize', measure);

      viewport.addEventListener('mouseenter', function () { paused = true; });
      viewport.addEventListener('mouseleave', function () { paused = false; });
      viewport.addEventListener('focusin', function () { paused = true; });
      viewport.addEventListener('focusout', function () { paused = false; });

      requestAnimationFrame(tick);
    })();

    // Contact email modal
    (function () {
      var modal = document.getElementById('emailModal');
      if (!modal) return;

      var openTriggers = document.querySelectorAll('[data-modal-open="emailModal"]');
      var closeTriggers = modal.querySelectorAll('[data-modal-close]');
      var form = document.getElementById('emailForm');
      var lastFocused = null;

      function openModal() {
        lastFocused = document.activeElement;
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        var firstField = form.querySelector('input, textarea');
        if (firstField) firstField.focus();
      }

      function closeModal() {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (lastFocused) lastFocused.focus();
      }

      openTriggers.forEach(function (btn) {
        btn.addEventListener('click', openModal);
      });

      closeTriggers.forEach(function (el) {
        el.addEventListener('click', closeModal);
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
      });

      function showFormStatus(message, isError) {
        var status = form.querySelector('.email-form-status');
        if (!status) {
          status = document.createElement('p');
          status.className = 'email-form-status';
          form.appendChild(status);
        }
        status.textContent = message;
        status.classList.toggle('is-error', !!isError);
      }

      form.addEventListener('submit', function (e) {
        e.preventDefault();

        var submitBtn = form.querySelector('.email-submit');
        var originalLabel = submitBtn.textContent;
        submitBtn.textContent = 'Sending…';
        submitBtn.disabled = true;

        fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        })
          .then(function (response) {
            if (response.ok) {
              showFormStatus('Message sent — thanks! I\'ll get back to you soon.', false);
              form.reset();
              setTimeout(closeModal, 1600);
            } else {
              showFormStatus('Something went wrong. Please try again.', true);
            }
          })
          .catch(function () {
            showFormStatus('Network error. Please try again.', true);
          })
          .finally(function () {
            submitBtn.textContent = originalLabel;
            submitBtn.disabled = false;
          });
      });
    })();