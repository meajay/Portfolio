document.addEventListener('DOMContentLoaded', () => {
    // Reveal Animations
    const observer = new IntersectionObserver((entries) => {
        let delay = 0;
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                setTimeout(() => { entry.target.classList.add('vis'); }, delay);
                delay += 80;
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

    // Dynamic Site Background Color & Ambient Orb Theme Observer
    const orb = document.querySelector('.orb');
    let activeCards = new Set();

    // Explicitly define ventures component to prevent scope issues
    const venturesContent = document.getElementById('ventures-content');

    const bgObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                activeCards.add(entry.target);
            } else {
                activeCards.delete(entry.target);
            }
        });

        // Critical Logic: Do not override background with Showcase Apps dynamically if the Startup Venture is currently explicitly toggled Open
        if (venturesContent && venturesContent.classList.contains('open')) {
            return;
        }

        if (activeCards.size > 0) {
            const target = Array.from(activeCards).pop();
            const bodyBgColor = target.getAttribute('data-body-bg');
            const orbBgColor = target.getAttribute('data-bg');

            if (bodyBgColor) {
                document.body.style.backgroundColor = bodyBgColor;
            }
            if (orbBgColor && orb) {
                orb.style.background = `radial-gradient(circle, ${orbBgColor} 0%, transparent 70%)`;
            }
        } else {
            document.body.style.backgroundColor = '';
            if (orb) {
                orb.style.background = `radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%)`;
            }
        }
    }, { rootMargin: "-30% 0px -30% 0px", threshold: 0 });

    document.querySelectorAll('.app-card[data-bg]').forEach(c => bgObserver.observe(c));

    // Scroll Control & Touch Interactions Map for Mobile/Trackpad Fallbacks natively
    document.querySelectorAll('.app-card[data-url]').forEach(card => {
        let isScrubbing = false;
        const wrapper = card.querySelector('.app-screens-wrapper');

        if (wrapper) {
            let isDown = false;
            let startX = 0;
            let scrollLeftPos = 0;

            wrapper.addEventListener('mousedown', (e) => {
                isScrubbing = false;
                isDown = true;
                wrapper.classList.add('active');
                startX = e.pageX - wrapper.offsetLeft;
                scrollLeftPos = wrapper.scrollLeft;
            });

            wrapper.addEventListener('mouseleave', () => {
                isDown = false;
                wrapper.classList.remove('active');
                wrapper.dataset.hovering = "false";
            });

            wrapper.addEventListener('mouseup', () => {
                isDown = false;
                wrapper.classList.remove('active');
            });

            wrapper.addEventListener('mousemove', (e) => {
                if (!isDown) return;
                const x = e.pageX - wrapper.offsetLeft;
                const walk = (x - startX) * 2;

                if (Math.abs(x - startX) > 5) {
                    isScrubbing = true;
                }
                wrapper.scrollLeft = scrollLeftPos - walk;
            });

            wrapper.addEventListener('mouseenter', () => { wrapper.dataset.hovering = "true"; });
        }

        card.addEventListener('click', (e) => {
            if (isScrubbing) {
                e.preventDefault();
                return;
            }
            const url = card.getAttribute('data-url');
            if (url) {
                window.open(url, '_blank', 'noopener,noreferrer');
            }
        });
    });

    // Auto-Scroll Matrix Engine
    const sliders = document.querySelectorAll('.app-screens-wrapper');
    sliders.forEach(slider => {
        let direction = 1;
        let fractionAcc = 0;

        function autoScroll() {
            const isHovering = slider.dataset.hovering === "true";
            const isMobile = window.innerWidth < 900;
            const isVenture = slider.closest('#ventures-content') !== null;

            if (!isHovering && !(isMobile && isVenture)) {
                fractionAcc += (0.9 * direction);

                if (Math.abs(fractionAcc) >= 1) {
                    let move = Math.trunc(fractionAcc);
                    let prevPosition = slider.scrollLeft;
                    slider.scrollLeft += move;
                    fractionAcc -= move;

                    if (slider.scrollLeft === prevPosition) {
                        direction *= -1;
                        fractionAcc = 0;
                    }
                }
            }
            requestAnimationFrame(autoScroll);
        }
        requestAnimationFrame(autoScroll);
    });

    // Collapsible Early Ventures Section Animation Logic
    const toggleBtn = document.getElementById('toggle-ventures');
    const venturesWrapper = document.getElementById('ventures-wrapper');

    if (venturesContent) {
        const ventureObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting && venturesContent.classList.contains('open')) {
                    closeVentures();
                }
            });
        }, { threshold: 0 });
        ventureObserver.observe(venturesContent);
    }

    function closeVentures() {
        if (!venturesContent) return;
        venturesContent.style.maxHeight = '0px';
        venturesContent.classList.remove('open');

        if (venturesWrapper) {
            venturesWrapper.style.display = 'block';
            setTimeout(() => {
                toggleBtn.style.opacity = '1';
                toggleBtn.style.transform = 'scale(1)';
            }, 50);
        }

        // We check active cards again upon closing to correctly re-assign the DOM environment naturally
        if (activeCards.size > 0) {
            const target = Array.from(activeCards).pop();
            const bodyBgColor = target.getAttribute('data-body-bg');
            if (bodyBgColor) document.body.style.backgroundColor = bodyBgColor;

            const orbBgColor = target.getAttribute('data-bg');
            if (orbBgColor && orb) orb.style.background = `radial-gradient(circle, ${orbBgColor} 0%, transparent 70%)`;
        } else {
            document.body.style.backgroundColor = '';
            if (orb) orb.style.background = `radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%)`;
        }
    }

    if (toggleBtn && venturesContent) {
        toggleBtn.addEventListener('click', () => {
            venturesContent.style.display = 'block';
            venturesContent.style.maxHeight = venturesContent.scrollHeight + 500 + 'px';
            venturesContent.classList.add('open');

            toggleBtn.style.opacity = '0';
            toggleBtn.style.transform = 'scale(0.8)';
            setTimeout(() => {
                if (venturesWrapper) venturesWrapper.style.display = 'none';
            }, 400);

            // Maintain deep maroon/magenta venture lock
            document.body.style.backgroundColor = '#1e0317';
            if (orb) orb.style.background = `radial-gradient(circle, rgba(247, 37, 133, 0.15) 0%, transparent 70%)`;

            document.querySelectorAll('#ventures-content .fade-in').forEach((el) => {
                el.classList.remove('vis');
                observer.observe(el);
            });
        });
    }

    // Mobile Menu Toggle Logic
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navAnchors = document.querySelectorAll('.nav-links a');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navLinks.classList.toggle('show');
        });

        navAnchors.forEach(anchor => {
            anchor.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('show');
            });
        });
    }
});
