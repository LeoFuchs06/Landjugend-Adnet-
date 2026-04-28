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

/* ================================================================
 * 2026 Native Platform Features
 * Service Worker · ICS Calendar · WebShare · Dark Mode · Install Prompt
 * Loaded inside its own IIFE so it's independent from the block above.
 * ================================================================ */
(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ─── Dark Mode (early, runs before DOMContentLoaded to avoid flash) ──
    const stored = (() => { try { return localStorage.getItem('lj-theme'); } catch (_) { return null; } })();
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = stored || (systemPrefersDark ? 'dark' : 'light');
    document.documentElement.dataset.theme = initialTheme;

    document.addEventListener('DOMContentLoaded', () => {

        // ─── 1. Service Worker registration ──────────────────────────────
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('js/sw.js')
                    .catch(err => console.warn('SW registration failed:', err));
            });
        }

        // ─── 2. Dark Mode Toggle Button ──────────────────────────────────
        const navContainer = document.querySelector('.header-inner');
        if (navContainer && !document.querySelector('.theme-toggle')) {
            const toggle = document.createElement('button');
            toggle.className = 'theme-toggle';
            toggle.setAttribute('aria-label', 'Farbschema wechseln');
            toggle.innerHTML = `
                <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
                <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="4"/>
                    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
                </svg>`;
            const navToggleBtn = navContainer.querySelector('.nav-toggle');
            if (navToggleBtn) navContainer.insertBefore(toggle, navToggleBtn);
            else navContainer.appendChild(toggle);

            toggle.addEventListener('click', () => {
                const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
                const apply = () => {
                    document.documentElement.dataset.theme = next;
                    try { localStorage.setItem('lj-theme', next); } catch (_) {}
                };
                if (document.startViewTransition && !reduced) {
                    document.startViewTransition(apply);
                } else {
                    apply();
                }
            });
        }

        // ─── 3. ICS Calendar download for events ─────────────────────────
        const events = document.querySelectorAll('.event[data-date]');
        if (events.length) {
            const pad = n => String(n).padStart(2, '0');
            const fmtICS = d => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
            const escapeICS = s => String(s || '').replace(/[\\;,]/g, m => '\\' + m).replace(/\n/g, '\\n');

            const icsFor = (title, dateStr, locationStr, descStr) => {
                const start = new Date(dateStr + 'T16:00:00');
                const end   = new Date(start.getTime() + 4 * 60 * 60 * 1000);
                return [
                    'BEGIN:VCALENDAR', 'VERSION:2.0',
                    'PRODID:-//Landjugend Adnet//DE',
                    'BEGIN:VEVENT',
                    `UID:${dateStr}-${title.replace(/\s+/g, '-')}@landjugend-adnet.at`,
                    `DTSTAMP:${fmtICS(new Date())}`,
                    `DTSTART:${fmtICS(start)}`,
                    `DTEND:${fmtICS(end)}`,
                    `SUMMARY:${escapeICS(title)}`,
                    `LOCATION:${escapeICS(locationStr)}`,
                    `DESCRIPTION:${escapeICS(descStr)}`,
                    'END:VEVENT', 'END:VCALENDAR'
                ].join('\r\n');
            };

            const supportsShare = !!navigator.share;

            events.forEach(ev => {
                const title    = ev.querySelector('.event-info h3')?.textContent.replace(/In \d+ Tag.*|Heute!/, '').trim() || 'Event';
                const meta     = ev.querySelector('.event-meta')?.textContent || '';
                const desc     = ev.querySelector('.event-info p:last-of-type')?.textContent || '';
                const dateStr  = ev.dataset.date;
                const location = (meta.match(/📍\s*([^·]+)/) || [, 'Adnet'])[1].trim();

                if (ev.querySelector('.event-actions')) return; // idempotent

                const actions = document.createElement('div');
                actions.className = 'event-actions';

                const icsBtn = document.createElement('button');
                icsBtn.type = 'button';
                icsBtn.className = 'event-action';
                icsBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg> In Kalender`;
                icsBtn.addEventListener('click', () => {
                    const blob = new Blob([icsFor(title, dateStr, location, desc)], { type: 'text/calendar' });
                    const url  = URL.createObjectURL(blob);
                    const a    = document.createElement('a');
                    a.href = url;
                    a.download = `${title.replace(/[^\w-]+/g, '_')}.ics`;
                    document.body.appendChild(a); a.click(); a.remove();
                    setTimeout(() => URL.revokeObjectURL(url), 1000);
                });
                actions.appendChild(icsBtn);

                if (supportsShare) {
                    const shareBtn = document.createElement('button');
                    shareBtn.type = 'button';
                    shareBtn.className = 'event-action';
                    shareBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/></svg> Teilen`;
                    shareBtn.addEventListener('click', async () => {
                        try {
                            await navigator.share({
                                title: `${title} – Landjugend Adnet`,
                                text:  `${title} am ${new Date(dateStr).toLocaleDateString('de-AT', { day: '2-digit', month: 'long', year: 'numeric' })} in ${location}.`,
                                url:   location.href || window.location.href
                            });
                        } catch (err) { /* User cancelled */ }
                    });
                    actions.appendChild(shareBtn);
                }

                ev.querySelector('.event-info')?.appendChild(actions);
            });
        }

        // ─── 4. PWA Install Prompt Banner ────────────────────────────────
        let deferredPrompt = null;
        const installBanner = () => {
            if (document.querySelector('.pwa-install-banner')) return null;
            const b = document.createElement('div');
            b.className = 'pwa-install-banner';
            b.innerHTML = `
                <span>📱 Landjugend Adnet zur Startseite?</span>
                <button class="pwa-install">Installieren</button>
                <button class="pwa-dismiss" aria-label="Schließen">✕</button>`;
            document.body.appendChild(b);
            return b;
        };

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            const dismissed = (() => { try { return localStorage.getItem('lj-pwa-dismissed'); } catch (_) { return null; } })();
            if (dismissed) return;

            setTimeout(() => {
                const b = installBanner();
                if (!b) return;
                requestAnimationFrame(() => b.classList.add('visible'));

                b.querySelector('.pwa-install').addEventListener('click', async () => {
                    if (!deferredPrompt) return;
                    deferredPrompt.prompt();
                    deferredPrompt = null;
                    b.classList.remove('visible');
                });
                b.querySelector('.pwa-dismiss').addEventListener('click', () => {
                    b.classList.remove('visible');
                    try { localStorage.setItem('lj-pwa-dismissed', '1'); } catch (_) {}
                });
            }, 8000);
        });

        // ─── 5. Leaflet map on contact page ──────────────────────────────
        const mapEl = document.getElementById('lj-map');
        if (mapEl && window.L) {
            const adnet = [47.7, 13.13]; // approx Adnet, Salzburg
            const map = L.map(mapEl, { scrollWheelZoom: false, zoomControl: true }).setView(adnet, 14);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '© OpenStreetMap'
            }).addTo(map);
            const icon = L.divIcon({
                className: 'lj-map-pin',
                html: '<div style="width:32px;height:32px;background:#2d6a4f;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 4px 12px rgba(0,0,0,0.3);display:grid;place-items:center;color:#fff;font-weight:700;font-family:Bitter,serif"><span style="transform:rotate(45deg);font-size:14px">LJ</span></div>',
                iconSize: [32, 32],
                iconAnchor: [16, 32]
            });
            L.marker(adnet, { icon }).addTo(map).bindPopup('<strong>Landjugend Adnet</strong><br>5421 Adnet, Salzburg');
            mapEl.addEventListener('click', () => map.scrollWheelZoom.enable(), { once: true });
        }
    });
})();

