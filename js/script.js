document.addEventListener('DOMContentLoaded', () => {

    // ─── Page load fade-in ────────────────────────────────────────────────
    document.body.classList.add('loaded');

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ─── Scroll progress bar ──────────────────────────────────────────────
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.prepend(progressBar);

    // ─── Back to top button ───────────────────────────────────────────────
    const backToTop = document.createElement('button');
    backToTop.className = 'back-to-top';
    backToTop.setAttribute('aria-label', 'Nach oben scrollen');
    backToTop.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="18 15 12 9 6 15"/></svg>`;
    document.body.appendChild(backToTop);
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    // ─── Mobile Navigation + backdrop ────────────────────────────────────
    const navToggle = document.querySelector('.nav-toggle');
    const nav = document.getElementById('main-nav');

    const navBackdrop = document.createElement('div');
    navBackdrop.className = 'nav-backdrop';
    document.body.appendChild(navBackdrop);

    function openNav() {
        nav.classList.add('open');
        navToggle.setAttribute('aria-expanded', 'true');
        navToggle.classList.add('is-open');
        navBackdrop.classList.add('visible');
        document.body.classList.add('nav-open');
    }

    function closeNav() {
        nav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.classList.remove('is-open');
        navBackdrop.classList.remove('visible');
        document.body.classList.remove('nav-open');
    }

    if (navToggle && nav) {
        navToggle.addEventListener('click', () => {
            nav.classList.contains('open') ? closeNav() : openNav();
        });
        nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeNav));
        navBackdrop.addEventListener('click', closeNav);
    }

    // ─── Header + scroll progress ─────────────────────────────────────────
    const header        = document.querySelector('.header');
    const revealWrap    = document.querySelector('.photo-reveal-wrap');
    const revealImg     = document.querySelector('.photo-reveal-img');
    const revealText    = document.querySelector('.photo-reveal-text');
    const revealOverlay = document.querySelector('.photo-reveal-overlay');
    const scrollHint    = document.querySelector('.scroll-hint');

    window.addEventListener('scroll', () => {
        const scrollY   = window.scrollY;
        const maxScroll = document.body.scrollHeight - window.innerHeight;
        progressBar.style.width = (scrollY / maxScroll * 100) + '%';
        if (header) header.classList.toggle('scrolled', scrollY > 20);

        backToTop.classList.toggle('visible', scrollY > 400);

        if (revealWrap && revealImg) {
            const rect       = revealWrap.getBoundingClientRect();
            const scrollable = revealWrap.offsetHeight - window.innerHeight;
            const p          = Math.max(0, Math.min(1, -rect.top / scrollable));

            const blur   = ((1 - p) * 18).toFixed(1);
            const bright = (0.52 + p * 0.48).toFixed(2);
            const sat    = (0.5  + p * 0.5).toFixed(2);
            const scale  = (1.1  - p * 0.1).toFixed(3);
            revealImg.style.filter    = `blur(${blur}px) brightness(${bright}) saturate(${sat})`;
            revealImg.style.transform = `scale(${scale})`;

            const textP = Math.max(0, 1 - p / 0.45);
            const textY = -(p * 80).toFixed(1);
            if (revealText) {
                revealText.style.opacity   = textP.toFixed(3);
                revealText.style.transform = `translateY(${textY}px)`;
            }
            if (revealOverlay) revealOverlay.style.opacity = textP.toFixed(3);
            if (scrollHint)    scrollHint.style.opacity    = (p < 0.08 ? 1 - p * 12 : 0).toFixed(2);
        }
    }, { passive: true });

    // ─── Scroll-reveal ────────────────────────────────────────────────────
    if (!prefersReducedMotion) {
        const revealMap = [
            { selector: '.card',             cls: 'reveal'       },
            { selector: '.event',            cls: 'reveal'       },
            { selector: '.team-member',      cls: 'reveal'       },
            { selector: '.stat',             cls: 'reveal-scale' },
            { selector: '.section-head',     cls: 'reveal'       },
            { selector: '.split-text',       cls: 'reveal-left'  },
            { selector: '.split-visual',     cls: 'reveal-right' },
            { selector: '.cta-inner',        cls: 'reveal-scale' },
            { selector: '.contact-info',     cls: 'reveal-left'  },
            { selector: '.contact-form',     cls: 'reveal-right' },
            { selector: '.gallery-item',     cls: 'reveal'       },
            { selector: '.group-photo-wrap',      cls: 'reveal-scale' },
            { selector: '.achievement-card',      cls: 'reveal'       },
            { selector: '.achievement-spotlight', cls: 'reveal-scale' },
        ];

        revealMap.forEach(({ selector, cls }) => {
            document.querySelectorAll(selector).forEach(el => {
                if (!el.classList.contains('reveal') &&
                    !el.classList.contains('reveal-left') &&
                    !el.classList.contains('reveal-right') &&
                    !el.classList.contains('reveal-scale')) {
                    el.classList.add(cls);
                }
            });
        });

        document.querySelectorAll('.cards, .team, .stats').forEach(c => c.classList.add('stagger'));

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale')
            .forEach(el => observer.observe(el));
    }

    // ─── Button ripple ────────────────────────────────────────────────────
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const ripple = document.createElement('span');
            ripple.className = 'ripple-effect';
            const rect = btn.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height) * 1.5;
            ripple.style.cssText = `
                width: ${size}px; height: ${size}px;
                left: ${e.clientX - rect.left - size / 2}px;
                top:  ${e.clientY - rect.top  - size / 2}px;
                position: absolute; border-radius: 50%; pointer-events: none;
            `;
            btn.appendChild(ripple);
            setTimeout(() => ripple.remove(), 550);
        });
    });

    // ─── Animated number counter ──────────────────────────────────────────
    if (!prefersReducedMotion) {
        const countObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                countObserver.unobserve(entry.target);
                const el       = entry.target;
                const target   = parseInt(el.dataset.count, 10);
                const suffix   = el.dataset.suffix || '';
                const start    = performance.now();
                const duration = 1400;
                const tick = (now) => {
                    const t     = Math.min((now - start) / duration, 1);
                    const eased = 1 - Math.pow(1 - t, 3);
                    el.textContent = Math.round(eased * target) + suffix;
                    if (t < 1) requestAnimationFrame(tick);
                };
                requestAnimationFrame(tick);
            });
        }, { threshold: 0.5 });

        document.querySelectorAll('.stat-num[data-count]')
            .forEach(el => countObserver.observe(el));
    }

    // ─── Gallery filter (animated) ────────────────────────────────────────
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems  = document.querySelectorAll('.gallery-item');

    function filterGallery(filter) {
        galleryItems.forEach(item => {
            const matches  = filter === 'all' || item.dataset.category === filter;
            const isHidden = item.classList.contains('hidden');
            const isHiding = item.classList.contains('is-hiding');

            if (matches && (isHidden || isHiding)) {
                item.classList.remove('hidden');
                item.classList.add('is-hiding');
                requestAnimationFrame(() => requestAnimationFrame(() => {
                    item.classList.remove('is-hiding');
                }));
            } else if (!matches && !isHidden && !isHiding) {
                item.classList.add('is-hiding');
                const onEnd = (e) => {
                    if (e.propertyName !== 'opacity') return;
                    item.classList.add('hidden');
                    item.classList.remove('is-hiding');
                    item.removeEventListener('transitionend', onEnd);
                };
                item.addEventListener('transitionend', onEnd);
            }
        });
    }

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterGallery(btn.dataset.filter);
        });
    });

    // ─── Gallery Lightbox ─────────────────────────────────────────────────
    const lightbox = document.querySelector('.lightbox');
    if (lightbox && galleryItems.length) {
        const items    = Array.from(galleryItems);
        let currentIdx = 0;
        let touchStartX = 0;
        let prevFocus  = null;

        const display  = lightbox.querySelector('.lightbox-display');
        const labelEl  = lightbox.querySelector('.lightbox-label');
        const counter  = lightbox.querySelector('.lightbox-counter');
        const closeBtn = lightbox.querySelector('.lightbox-close');
        const prevBtn  = lightbox.querySelector('.lightbox-prev');
        const nextBtn  = lightbox.querySelector('.lightbox-next');

        function getVisible() {
            return items.filter(i => !i.classList.contains('hidden') && !i.classList.contains('is-hiding'));
        }

        function updateDisplay() {
            const item = items[currentIdx];
            const srcImg = item.querySelector('img');
            const lightboxImg = display.querySelector('.lightbox-img');
            if (srcImg && lightboxImg) {
                lightboxImg.src = srcImg.src;
                lightboxImg.alt = srcImg.alt || '';
                lightboxImg.style.display = 'block';
                display.style.background = '#111';
            } else {
                if (lightboxImg) lightboxImg.style.display = 'none';
                display.style.background = item.style.background;
            }
            labelEl.textContent = item.querySelector('.gallery-label')?.textContent ?? '';
            const vis = getVisible();
            const pos = vis.indexOf(item) + 1;
            counter.textContent = `${pos} / ${vis.length}`;
        }

        function openLightbox(index) {
            prevFocus = document.activeElement;
            currentIdx = index;
            updateDisplay();
            lightbox.classList.add('open');
            document.body.classList.add('lightbox-open');
            closeBtn.focus();
        }

        function closeLightbox() {
            lightbox.classList.remove('open');
            document.body.classList.remove('lightbox-open');
            prevFocus?.focus();
        }

        function navigate(dir) {
            const vis = getVisible();
            const cur = vis.indexOf(items[currentIdx]);
            const next = (cur + dir + vis.length) % vis.length;
            currentIdx = items.indexOf(vis[next]);
            updateDisplay();
        }

        items.forEach((item, i) => item.addEventListener('click', () => openLightbox(i)));
        closeBtn.addEventListener('click', closeLightbox);
        prevBtn.addEventListener('click', () => navigate(-1));
        nextBtn.addEventListener('click', () => navigate(1));
        lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('open')) return;
            if (e.key === 'Escape')     closeLightbox();
            if (e.key === 'ArrowLeft')  navigate(-1);
            if (e.key === 'ArrowRight') navigate(1);
        });

        lightbox.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        }, { passive: true });
        lightbox.addEventListener('touchend', (e) => {
            const diff = touchStartX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 50) navigate(diff > 0 ? 1 : -1);
        }, { passive: true });
    }

    // ─── Contact form validation ──────────────────────────────────────────
    const contactForm = document.getElementById('contact-form');
    const formStatus  = document.getElementById('form-status');

    if (contactForm) {
        function getOrCreateError(group) {
            let err = group.querySelector('.field-error');
            if (!err) {
                err = document.createElement('span');
                err.className = 'field-error';
                err.setAttribute('aria-live', 'polite');
                group.appendChild(err);
            }
            return err;
        }

        function validateField(field) {
            const group = field.closest('.form-group');
            if (!group) return true;
            const err = getOrCreateError(group);
            let msg = '';

            if (field.type === 'checkbox') {
                if (!field.checked) msg = 'Bitte akzeptiere die Datenschutzbestimmungen.';
            } else if (field.type === 'email') {
                if (!field.value.trim()) {
                    msg = 'E-Mail ist erforderlich.';
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
                    msg = 'Bitte eine gültige E-Mail-Adresse eingeben.';
                }
            } else if (field.id === 'message') {
                if (!field.value.trim()) {
                    msg = 'Nachricht ist erforderlich.';
                } else if (field.value.trim().length < 10) {
                    msg = 'Mindestens 10 Zeichen erforderlich.';
                }
            } else if (field.required && !field.value.trim()) {
                const labelText = group.querySelector('label')?.textContent.replace('*', '').trim();
                msg = `${labelText || 'Dieses Feld'} ist erforderlich.`;
            }

            group.classList.toggle('has-error', !!msg);
            err.textContent = msg;
            return !msg;
        }

        contactForm.querySelectorAll('input, textarea').forEach(field => {
            field.addEventListener('blur', () => validateField(field));
        });

        contactForm.addEventListener('submit', e => {
            e.preventDefault();
            const fields = [...contactForm.querySelectorAll('input[required], textarea[required]')];
            let allValid   = true;
            let firstInvalid = null;

            fields.forEach(f => {
                if (!validateField(f)) {
                    allValid = false;
                    if (!firstInvalid) firstInvalid = f;
                }
            });

            if (!allValid) { firstInvalid?.focus(); return; }

            formStatus.textContent = '✓ Vielen Dank für deine Nachricht! Wir melden uns bald bei dir.';
            formStatus.classList.add('success');
            contactForm.reset();
            contactForm.querySelectorAll('.form-group.has-error').forEach(g => {
                g.classList.remove('has-error');
                const errEl = g.querySelector('.field-error');
                if (errEl) errEl.textContent = '';
            });
            setTimeout(() => {
                formStatus.classList.remove('success');
                formStatus.textContent = '';
            }, 6000);
        });
    }

    // ─── Event countdown ──────────────────────────────────────────────────
    const eventEls = document.querySelectorAll('.event[data-date]');
    if (eventEls.length) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let nextEl  = null;
        let minDiff = Infinity;

        eventEls.forEach(ev => {
            const d    = new Date(ev.dataset.date);
            const diff = Math.ceil((d - today) / 86400000);
            if (diff >= 0 && diff < minDiff) {
                minDiff = diff;
                nextEl  = ev;
            }
        });

        if (nextEl) {
            const badge = document.createElement('span');
            badge.className = 'countdown-badge';
            badge.textContent = minDiff === 0 ? 'Heute!' : `In ${minDiff} ${minDiff === 1 ? 'Tag' : 'Tagen'}`;
            nextEl.querySelector('.event-info h3')?.appendChild(badge);
        }
    }

});
