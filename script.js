document.addEventListener('DOMContentLoaded', () => {
    AOS.init({
        once: true,
        duration: 700,
        easing: 'ease-out-cubic'
    });

    const menuToggle = document.getElementById('menuToggle');
    const mobileMenu = document.getElementById('mobileMenu');

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    const counterElements = document.querySelectorAll('[data-count-to]');
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            }

            const el = entry.target;
            const target = Number(el.getAttribute('data-count-to'));
            const start = Number(el.getAttribute('data-count-from')) || 0;
                const suffix = el.getAttribute('data-count-suffix') || '';
            const duration = 1600;
            const startTime = performance.now();

            const updateCounter = now => {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const value = Math.floor(start + (target - start) * progress);

                    el.textContent = `${value}${suffix}`;

                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                }
            };

            requestAnimationFrame(updateCounter);
            obs.unobserve(el);
        });
    }, { threshold: 0.4 });

    counterElements.forEach(el => observer.observe(el));

    const contactForm = document.querySelector('#kontaktai form');
    if (contactForm) {
        contactForm.addEventListener('submit', event => {
            event.preventDefault();
            alert('Ačiū! Jūsų žinutė gauta. Susisieksiu kuo greičiau.');
            contactForm.reset();
        });
    }
});
