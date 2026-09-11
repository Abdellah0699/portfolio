// Abdellah — Portfolio           
// Mobile nav, scroll-reveal, and a short page transition.

(function () {
  document.body.classList.remove('pre-load');

  var navToggle = document.getElementById('navToggle');
  var navMenu = document.getElementById('navMenuMobile');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      var isOpen = navMenu.classList.toggle('is-open');
      navToggle.classList.toggle('is-open', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
    navMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navMenu.classList.remove('is-open');
        navToggle.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Fade/slide reveal when sections enter the viewport
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // Pixel Stars background for the hero. Canvas keeps the effect lightweight and dependency-free.
  var pixelStarsCanvas = document.getElementById('pixelStars');
  if (pixelStarsCanvas) {
    var pixelStarsCtx = pixelStarsCanvas.getContext('2d');
    var pixelStarsMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    var pixelStars = [];
    var pixelShooters = [];
    var pixelStarsWidth = 0;
    var pixelStarsHeight = 0;
    var pixelStarsDpr = 1;
    var pixelStarsAnimation = 0;
    var pixelStarsLastTime = 0;
    var pixelStarsLastShooter = 0;
    var pixelStarsResizeTimer = 0;

    function pixelStarRandom(min, max) {
      return min + Math.random() * (max - min);
    }

    function pixelStarsResize() {
      var rect = pixelStarsCanvas.getBoundingClientRect();
      pixelStarsWidth = Math.max(1, Math.floor(rect.width));
      pixelStarsHeight = Math.max(1, Math.floor(rect.height));
      pixelStarsDpr = Math.min(window.devicePixelRatio || 1, 2);

      pixelStarsCanvas.width = Math.floor(pixelStarsWidth * pixelStarsDpr);
      pixelStarsCanvas.height = Math.floor(pixelStarsHeight * pixelStarsDpr);
      pixelStarsCtx.setTransform(pixelStarsDpr, 0, 0, pixelStarsDpr, 0, 0);

      var density = window.innerWidth <= 640 ? 0.000055 : 0.000075;
      var count = Math.round(pixelStarsWidth * pixelStarsHeight * density);
      pixelStars = [];

      for (var i = 0; i < count; i++) {
        pixelStars.push({
          x: pixelStarRandom(8, pixelStarsWidth - 8),
          y: pixelStarRandom(8, pixelStarsHeight - 8),
          size: Math.random() < 0.60 ? 1 : 2,
          alpha: pixelStarRandom(0.3, 0.9),
          twinkle: pixelStarRandom(0.7, 1.8),
          phase: pixelStarRandom(0, Math.PI * 2)
        });
      }

      pixelShooters = [];
    }

    function pixelStarsDraw(time) {
      if (!pixelStarsWidth || !pixelStarsHeight) return;

      var elapsed = time * 0.001;
      var delta = Math.min(40, time - pixelStarsLastTime || 16.67);
      pixelStarsLastTime = time;

      pixelStarsCtx.clearRect(0, 0, pixelStarsWidth, pixelStarsHeight);

      pixelStars.forEach(function (star) {
        var pulse = 0.72 + Math.sin(elapsed * star.twinkle + star.phase) * 0.28;
        pixelStarsCtx.globalAlpha = star.alpha * pulse;
        pixelStarsCtx.fillStyle = '#F3F1EA';
        pixelStarsCtx.fillRect(Math.round(star.x), Math.round(star.y), star.size, star.size);
      });

      if (!pixelStarsMotionQuery.matches && elapsed - pixelStarsLastShooter > 2.5) {
        pixelStarsLastShooter = elapsed;
        if (Math.random() < 0.75) {
          pixelShooters.push({
            x: pixelStarRandom(pixelStarsWidth * 0.15, pixelStarsWidth * 0.82),
            y: pixelStarRandom(20, pixelStarsHeight * 0.48),
            length: pixelStarRandom(45, 90),
            speed: pixelStarRandom(360, 520),
            life: 0,
            maxLife: pixelStarRandom(0.55, 0.9),
            angle: pixelStarRandom(0.45, 0.72)
          });
        }
      }

      pixelStarsCtx.globalAlpha = 1;
      pixelShooters = pixelShooters.filter(function (shooter) {
        shooter.life += delta / 1000;
        var distance = shooter.life * shooter.speed;
        var x = shooter.x + Math.cos(shooter.angle) * distance;
        var y = shooter.y + Math.sin(shooter.angle) * distance;
        var progress = Math.min(1, shooter.life / shooter.maxLife);
        var opacity = 1 - progress;
        var tailDistance = shooter.length * (0.55 + progress * 0.45);
        var tailX = x - Math.cos(shooter.angle) * tailDistance;
        var tailY = y - Math.sin(shooter.angle) * tailDistance;

        pixelStarsCtx.globalAlpha = opacity * 0.55;
        pixelStarsCtx.strokeStyle = '#F3F1EA';
        pixelStarsCtx.lineWidth = 1;
        pixelStarsCtx.beginPath();
        pixelStarsCtx.moveTo(Math.round(tailX), Math.round(tailY));
        pixelStarsCtx.lineTo(Math.round(x), Math.round(y));
        pixelStarsCtx.stroke();

        pixelStarsCtx.globalAlpha = opacity;
        pixelStarsCtx.fillStyle = '#F3F1EA';
        pixelStarsCtx.fillRect(Math.round(x), Math.round(y), 2, 2);

        return shooter.life < shooter.maxLife && x < pixelStarsWidth + 100 && y < pixelStarsHeight + 100;
      });

      pixelStarsCtx.globalAlpha = 1;

      if (!pixelStarsMotionQuery.matches) {
        pixelStarsAnimation = window.requestAnimationFrame(pixelStarsDraw);
      }
    }

    function pixelStarsStart() {
      if (pixelStarsAnimation) window.cancelAnimationFrame(pixelStarsAnimation);
      pixelStarsLastTime = 0;
      pixelStarsLastShooter = 0;
      pixelStarsResize();

      if (pixelStarsMotionQuery.matches) {
        pixelStarsDraw(0);
      } else {
        pixelStarsAnimation = window.requestAnimationFrame(pixelStarsDraw);
      }
    }

    window.addEventListener('resize', function () {
      window.clearTimeout(pixelStarsResizeTimer);
      pixelStarsResizeTimer = window.setTimeout(pixelStarsStart, 120);
    }, { passive: true });

    if (pixelStarsMotionQuery.addEventListener) {
      pixelStarsMotionQuery.addEventListener('change', pixelStarsStart);
    } else if (pixelStarsMotionQuery.addListener) {
      pixelStarsMotionQuery.addListener(pixelStarsStart);
    }

    pixelStarsStart();
  }

  // Short fade-out transition before navigating to a project page   
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('a[data-transition]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var href = link.getAttribute('href');
      if (!href || reduceMotion || link.target === '_blank') return;
      e.preventDefault();
      document.body.classList.add('is-leaving');
      window.setTimeout(function () { window.location.href = href; }, 220);
    });
  });
})();
