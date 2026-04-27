/* Enhancements – Tier 2 + 3
 * Loaded AFTER js/script.js. Adds GSAP scroll polish, SplitType hero reveal,
 * Vanilla Tilt cards, glow cursor, canvas particles, animated SVG card icons.
 * All effects respect prefers-reduced-motion and pointer device.
 */
(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isCoarse = window.matchMedia('(pointer: coarse)').matches;

    document.addEventListener('DOMContentLoaded', () => {

        // ─── 1. SplitType + GSAP hero title letter reveal ────────────────
        if (!reduced && window.gsap && window.SplitType) {
            const heroTitle = document.querySelector('.photo-reveal-text .hero-title, .hero-content .hero-title, .hero h1');
            if (heroTitle) {
                const split = new SplitType(heroTitle, { types: 'chars' });
                gsap.from(split.chars, {
                    yPercent: 110,
                    opacity: 0,
                    duration: 0.9,
                    ease: 'power4.out',
                    stagger: 0.035,
                    delay: 0.2
                });
            }
        }

        // ─── 2. GSAP ScrollTrigger polish ────────────────────────────────
        if (!reduced && window.gsap && window.ScrollTrigger) {
            gsap.registerPlugin(ScrollTrigger);

            // Subtle parallax on visual cards
            gsap.utils.toArray('.visual-card').forEach((el, i) => {
                gsap.to(el, {
                    y: -20 - i * 10,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: el,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: true
                    }
                });
            });

            // Achievements: spring-in with ScrollTrigger (replaces basic reveal for these)
            const achievements = gsap.utils.toArray('.achievement-card');
            if (achievements.length) {
                gsap.from(achievements, {
                    y: 60, opacity: 0, scale: 0.92,
                    duration: 0.75, ease: 'back.out(1.4)',
                    stagger: 0.08,
                    scrollTrigger: { trigger: '.achievements-grid', start: 'top 80%' }
                });
            }

            // Section headings get a slight upward drift
            gsap.utils.toArray('.section-head h2').forEach(h => {
                gsap.from(h, {
                    y: 20, opacity: 0,
                    duration: 0.7, ease: 'power3.out',
                    scrollTrigger: { trigger: h, start: 'top 85%' }
                });
            });
        }

        // ─── 3. Vanilla Tilt on cards (desktop only) ─────────────────────
        if (!reduced && !isCoarse && window.VanillaTilt) {
            VanillaTilt.init(
                document.querySelectorAll('.card, .team-member, .achievement-card, .visual-card'),
                {
                    max: 6,
                    speed: 600,
                    glare: true,
                    'max-glare': 0.18,
                    scale: 1.02,
                    perspective: 1200
                }
            );
        }

        // ─── 4. Custom glow cursor (desktop only) ────────────────────────
        if (!reduced && !isCoarse) {
            const cursor = document.createElement('div');
            cursor.className = 'glow-cursor';
            cursor.innerHTML = '<span class="glow-cursor-dot"></span><span class="glow-cursor-ring"></span>';
            document.body.appendChild(cursor);
            document.body.classList.add('has-glow-cursor');

            let tx = 0, ty = 0, cx = 0, cy = 0, ringX = 0, ringY = 0;

            document.addEventListener('mousemove', (e) => { tx = e.clientX; ty = e.clientY; });
            document.addEventListener('mouseleave', () => cursor.classList.add('hidden'));
            document.addEventListener('mouseenter',  () => cursor.classList.remove('hidden'));

            const tick = () => {
                cx += (tx - cx) * 0.6;   // dot follows fast
                cy += (ty - cy) * 0.6;
                ringX += (tx - ringX) * 0.18; // ring lags
                ringY += (ty - ringY) * 0.18;
                cursor.style.setProperty('--dx', cx + 'px');
                cursor.style.setProperty('--dy', cy + 'px');
                cursor.style.setProperty('--rx', ringX + 'px');
                cursor.style.setProperty('--ry', ringY + 'px');
                requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);

            const hoverTargets = 'a, button, .card, .team-member, .achievement-card, .gallery-item, .visual-card, .filter-btn, .btn, [role="button"]';
            document.addEventListener('mouseover', (e) => {
                if (e.target.closest(hoverTargets)) cursor.classList.add('hover');
            });
            document.addEventListener('mouseout', (e) => {
                if (e.target.closest(hoverTargets)) cursor.classList.remove('hover');
            });
        }

        // ─── 5. Canvas particles in CTA section ──────────────────────────
        if (!reduced) {
            document.querySelectorAll('.section-cta').forEach(section => {
                const canvas = document.createElement('canvas');
                canvas.className = 'particles-canvas';
                section.prepend(canvas);
                const ctx = canvas.getContext('2d');

                let w, h, particles, raf;
                const PARTICLE_COUNT = 40;

                const resize = () => {
                    const dpr = Math.min(window.devicePixelRatio || 1, 2);
                    w = canvas.clientWidth = section.offsetWidth;
                    h = canvas.clientHeight = section.offsetHeight;
                    canvas.width  = w * dpr;
                    canvas.height = h * dpr;
                    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                };

                const init = () => {
                    particles = Array.from({ length: PARTICLE_COUNT }, () => ({
                        x: Math.random() * w,
                        y: Math.random() * h,
                        r: Math.random() * 1.6 + 0.6,
                        vx: (Math.random() - 0.5) * 0.25,
                        vy: -(Math.random() * 0.35 + 0.08),
                        a: Math.random() * 0.5 + 0.2
                    }));
                };

                const draw = () => {
                    ctx.clearRect(0, 0, w, h);
                    particles.forEach(p => {
                        p.x += p.vx;
                        p.y += p.vy;
                        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
                        if (p.x < -10) p.x = w + 10;
                        if (p.x > w + 10) p.x = -10;
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(213, 243, 220, ${p.a})`;
                        ctx.fill();
                    });
                    raf = requestAnimationFrame(draw);
                };

                const start = () => { resize(); init(); cancelAnimationFrame(raf); draw(); };

                start();
                window.addEventListener('resize', start);

                // Pause if section not in view (perf)
                const visObs = new IntersectionObserver(([entry]) => {
                    if (entry.isIntersecting) {
                        if (!raf) draw();
                    } else {
                        cancelAnimationFrame(raf);
                        raf = null;
                    }
                });
                visObs.observe(section);
            });
        }

        // ─── 6. Replace value-card emoji with animated SVG ──────────────
        const iconMap = {
            '🌾': `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
                <path d="M24 6v36"/><path d="M24 14c-3-3-9-3-12 0 3 3 9 3 12 0z"/>
                <path d="M24 14c3-3 9-3 12 0-3 3-9 3-12 0z"/>
                <path d="M24 22c-3-3-9-3-12 0 3 3 9 3 12 0z"/>
                <path d="M24 22c3-3 9-3 12 0-3 3-9 3-12 0z"/>
                <path d="M24 30c-3-3-9-3-12 0 3 3 9 3 12 0z"/>
                <path d="M24 30c3-3 9-3 12 0-3 3-9 3-12 0z"/></svg>`,
            '🤝': `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8 24l6-6 4 2 6-6 6 6-12 12-6-6z"/>
                <path d="M28 24l8-8 4 4-8 8"/>
                <path d="M22 30l4 4 6-6"/></svg>`,
            '🎯': `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2">
                <circle cx="24" cy="24" r="18"/>
                <circle cx="24" cy="24" r="11"/>
                <circle cx="24" cy="24" r="4" fill="currentColor"/></svg>`,
            '🌱': `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M24 42V24"/>
                <path d="M24 24c0-8-6-14-14-14 0 8 6 14 14 14z"/>
                <path d="M24 30c0-6 5-11 11-11 0 6-5 11-11 11z"/></svg>`,
            '🎉': `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8 40l10-26 18 18z"/>
                <path d="M30 8l2 4M40 14l-4 2M36 22l4-2M28 18l4-4"/></svg>`,
            '🏆': `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 8h20v8a10 10 0 01-20 0z"/>
                <path d="M14 12H8a4 4 0 004 6"/>
                <path d="M34 12h6a4 4 0 01-4 6"/>
                <path d="M20 28v6h8v-6"/>
                <path d="M16 40h16"/></svg>`,
            '❤️': `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M24 40s-14-8-14-19a8 8 0 0114-5 8 8 0 0114 5c0 11-14 19-14 19z"/></svg>`,
            '🎓': `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 18l20-8 20 8-20 8z"/>
                <path d="M12 22v10c0 3 5 6 12 6s12-3 12-6V22"/>
                <path d="M44 18v10"/></svg>`,
            '🎭': `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
                <circle cx="18" cy="22" r="12"/><circle cx="34" cy="26" r="10"/>
                <path d="M14 22h2M22 22h2M30 26h2M36 26h2"/>
                <path d="M14 28c2 2 6 2 8 0M30 32c2 1 4 1 6 0"/></svg>`,
            '⛰️': `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 40L18 16l8 14 4-6 10 16z"/>
                <path d="M16 22l4 6"/></svg>`
        };

        document.querySelectorAll('.card-icon').forEach(el => {
            const txt = el.textContent.trim();
            if (iconMap[txt]) {
                el.innerHTML = iconMap[txt];
                el.classList.add('card-icon-svg');
            }
        });

        // ─── 7. Magnetic buttons (desktop only) ──────────────────────────
        if (!reduced && !isCoarse) {
            document.querySelectorAll('.btn-primary, .btn-large').forEach(btn => {
                btn.addEventListener('mousemove', (e) => {
                    const r = btn.getBoundingClientRect();
                    const x = e.clientX - r.left - r.width / 2;
                    const y = e.clientY - r.top  - r.height / 2;
                    btn.style.transform = `translate(${x * 0.18}px, ${y * 0.25}px)`;
                });
                btn.addEventListener('mouseleave', () => {
                    btn.style.transform = '';
                });
            });
        }
    });
})();
