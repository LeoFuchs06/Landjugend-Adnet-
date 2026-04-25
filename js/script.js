document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.querySelector('.nav-toggle');
    const nav = document.getElementById('main-nav');

    if (navToggle && nav) {
        navToggle.addEventListener('click', () => {
            const isOpen = nav.classList.toggle('open');
            navToggle.setAttribute('aria-expanded', String(isOpen));
        });

        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('open');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;
            galleryItems.forEach(item => {
                const matches = filter === 'all' || item.dataset.category === filter;
                item.classList.toggle('hidden', !matches);
            });
        });
    });

    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    if (contactForm) {
        contactForm.addEventListener('submit', e => {
            e.preventDefault();
            formStatus.textContent = 'Vielen Dank für deine Nachricht! Wir melden uns bald bei dir.';
            formStatus.classList.add('success');
            contactForm.reset();
            setTimeout(() => {
                formStatus.classList.remove('success');
                formStatus.textContent = '';
            }, 6000);
        });
    }

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.card, .event, .team-member, .stat').forEach(el => {
        observer.observe(el);
    });
});
