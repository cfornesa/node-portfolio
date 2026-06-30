(function() {
    var menuBtn = document.getElementById('navMenuBtn');
    var mobileMenu = document.getElementById('mobile-menu');
    var menuIcon = document.getElementById('navMenuIcon');

    if (!menuBtn || !mobileMenu) return;

    menuBtn.addEventListener('click', function() {
        var isHidden = mobileMenu.classList.contains('hidden');
        mobileMenu.classList.toggle('hidden', !isHidden);
        if (menuIcon) menuIcon.textContent = isHidden ? 'close' : 'menu';
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            mobileMenu.classList.add('hidden');
            if (menuIcon) menuIcon.textContent = 'menu';
        }
    });
})();
