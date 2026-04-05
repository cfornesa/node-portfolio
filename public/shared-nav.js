(function() {
    var desktopMedia = window.matchMedia('(min-width: 1024px)');

    function initSharedNav() {
        var header = document.querySelector('.app-header');
        var nav = header ? header.querySelector('.header-nav') : null;
        var menuBtn = document.getElementById('navMenuBtn');
        var menuIcon = document.getElementById('navMenuIcon');

        if (!header || !nav || !menuBtn || !menuIcon) {
            return;
        }

        if (!nav.id) {
            nav.id = 'headerNav';
        }

        menuBtn.setAttribute('aria-controls', nav.id);

        function setNavState(isOpen) {
            var canCollapse = !desktopMedia.matches;
            var shouldOpen = canCollapse && isOpen;

            header.classList.toggle('nav-open', shouldOpen);
            nav.setAttribute('aria-hidden', String(canCollapse ? !shouldOpen : false));
            menuBtn.setAttribute('aria-expanded', String(shouldOpen));
            menuBtn.setAttribute('aria-label', shouldOpen ? 'Close navigation menu' : 'Open navigation menu');
            menuIcon.textContent = shouldOpen ? 'close' : 'menu';
        }

        function syncNavForViewport() {
            setNavState(false);
        }

        setNavState(false);

        menuBtn.addEventListener('click', function() {
            if (desktopMedia.matches) {
                return;
            }

            setNavState(!header.classList.contains('nav-open'));
        });

        nav.querySelectorAll('.nav-link').forEach(function(link) {
            link.addEventListener('click', function() {
                setNavState(false);
            });
        });

        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                setNavState(false);
            }
        });

        if (typeof desktopMedia.addEventListener === 'function') {
            desktopMedia.addEventListener('change', syncNavForViewport);
        } else if (typeof desktopMedia.addListener === 'function') {
            desktopMedia.addListener(syncNavForViewport);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSharedNav);
    } else {
        initSharedNav();
    }
})();
