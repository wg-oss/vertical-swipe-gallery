document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.querySelector('.gallery');
    let currentSlide = 0;
    let startY = 0;
    let startX = 0;
    let isSwiping = false;
    let isHorizontalSwipe = false;
    let currentHorizontalPanel = 0;
    
    // Disable vertical scroll on document
    document.body.style.overflow = 'hidden';

    // Image paths
    const images = [
        'images/MOSH! FINAL DRAFT WEBSITE-01.jpg',
        'images/MOSH! FINAL DRAFT WEBSITE-02.jpg',
        'images/MOSH! FINAL DRAFT WEBSITE-03.jpg',
        'images/MOSH! FINAL DRAFT WEBSITE-04.jpg',
        'images/MOSH! FINAL DRAFT WEBSITE-05.jpg',
        'images/MOSH! FINAL DRAFT WEBSITE-06.jpg',
        'images/MOSH! FINAL DRAFT WEBSITE-07.jpg',
        'images/MOSH! FINAL DRAFT WEBSITE-08.jpg',
        'images/MOSH! FINAL DRAFT WEBSITE-09.jpg',
        'images/MOSH! FINAL DRAFT WEBSITE-10.jpg',
        'images/MOSH! FINAL DRAFT WEBSITE-11.jpg',
        'images/MOSH! FINAL DRAFT WEBSITE-12.jpg',
        'images/MOSH! FINAL DRAFT WEBSITE-13.jpg'
    ];
    
    // Preload images to ensure they're loaded before displaying
    function preloadImages() {
        images.forEach(src => {
            const img = new Image();
            img.src = src;
        });
    }

    // Initialize gallery with images
    function initGallery() {
        gallery.innerHTML = '';
        images.forEach((src, index) => {
            const slide = document.createElement('div');
            slide.className = 'slide';
            slide.dataset.index = index; // Add data-index for easier selection
            slide.style.transform = `translateY(${index * 100}%)`;
            
            const slideContent = document.createElement('div');
            slideContent.className = 'slide-content';
            
            // Check if this is a landscape image (not first or last)
            const isLandscape = index > 0 && index < images.length - 1;
            
            if (isLandscape) {
                // Create left panel (first half of image)
                const leftPanel = document.createElement('div');
                leftPanel.className = 'slide-panel';
                const leftImg = document.createElement('img');
                leftImg.src = src;
                leftImg.alt = `Image ${index + 1} - Left`;
                leftImg.loading = 'lazy';
                leftImg.style.pointerEvents = 'none';
                leftPanel.appendChild(leftImg);
                
                // Create right panel (second half of image)
                const rightPanel = document.createElement('div');
                rightPanel.className = 'slide-panel';
                const rightImg = document.createElement('img');
                rightImg.src = src;
                rightImg.alt = `Image ${index + 1} - Right`;
                rightImg.loading = 'lazy';
                rightImg.style.pointerEvents = 'none';
                rightPanel.appendChild(rightImg);
                
                slideContent.appendChild(leftPanel);
                slideContent.appendChild(rightPanel);
                
                // Enable horizontal scrolling for landscape slides
                slideContent.style.overflowX = 'auto';
                slideContent.style.touchAction = 'pan-x';
                
                // Initialize scroll position to first panel
                setTimeout(() => {
                    slideContent.scrollLeft = 0;
                }, 100);
            } else {
                // Single panel for first and last images
                const panel = document.createElement('div');
                panel.className = 'slide-panel';
                const img = document.createElement('img');
                img.src = src;
                img.alt = `Image ${index + 1}`;
                img.loading = 'lazy';
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'contain';
                img.style.pointerEvents = 'none';
                panel.appendChild(img);
                slideContent.appendChild(panel);
                
                // Disable horizontal scrolling for non-landscape slides
                slideContent.style.overflowX = 'hidden';
                slideContent.style.touchAction = 'pan-y';
            }
            
            slide.appendChild(slideContent);
            gallery.appendChild(slide);
        });
        
        createNavDots();
        updateActiveDot();
    }

    // Create navigation dots
    function createNavDots() {
        const navDots = document.createElement('div');
        navDots.className = 'nav-dots';
        
        images.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.className = 'dot';
            dot.addEventListener('click', () => goToSlide(index));
            navDots.appendChild(dot);
        });
        
        document.body.appendChild(navDots);
    }

    // Update active dot
    function updateActiveDot() {
        const dots = document.querySelectorAll('.dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
    }

    // Go to specific slide
    function goToSlide(slideIndex) {
        const slides = document.querySelectorAll('.slide');
        if (slideIndex >= 0 && slideIndex < slides.length) {
            currentSlide = slideIndex;
            slides.forEach((slide, index) => {
                slide.style.transform = `translateY(${(index - currentSlide) * 100}%)`;
            });
            updateActiveDot();
        }
    }

    // Touch event handlers
    function handleTouchStart(e) {
        startY = e.touches[0].clientY;
        startX = e.touches[0].clientX;
        isSwiping = true;
    }

    function handleTouchMove(e) {
        if (!isSwiping) return;
        
        const currentTouch = e.touches[0];
        const diffX = startX - currentTouch.clientX;
        const diffY = startY - currentTouch.clientY;
        const isLandscapeSlide = currentSlide > 0 && currentSlide < images.length - 1;
        
        // Prevent default to stop any page scrolling
        e.preventDefault();
        
        // For landscape slides, allow both vertical and horizontal swiping
        if (isLandscapeSlide) {
            const slideContent = document.querySelector(`.slide[data-index="${currentSlide}"] .slide-content`);
            if (slideContent) {
                // Check if we're at the edges of horizontal scroll
                const atLeftEdge = slideContent.scrollLeft <= 0;
                const atRightEdge = slideContent.scrollLeft >= (slideContent.scrollWidth - slideContent.clientWidth - 1);
                
                // If we're at the left edge and swiping right, or at the right edge and swiping left
                // then allow the vertical swipe to change slides
                if ((atLeftEdge && diffX < 0) || (atRightEdge && diffX > 0)) {
                    // Allow vertical swipe to change slides
                    return;
                }
                
                // Otherwise, handle horizontal scrolling
                const newScrollLeft = slideContent.scrollLeft + diffX;
                const maxScroll = slideContent.scrollWidth - slideContent.clientWidth;
                slideContent.scrollLeft = Math.max(0, Math.min(maxScroll, newScrollLeft));
                
                // Update start positions for next move event
                startX = currentTouch.clientX;
                startY = currentTouch.clientY;
                return;
            }
        }
        
        // For vertical swipes (or non-landscape slides)
        if (Math.abs(diffY) > 10) {
            // Allow the swipe to continue naturally
            return;
        }
    }

    function handleTouchEnd(e) {
        if (!isSwiping) return;
        
        const endY = e.changedTouches[0].clientY;
        const endX = e.changedTouches[0].clientX;
        const diffY = startY - endY;
        const diffX = startX - endX;
        const threshold = 30;
        
        // Check if this was a vertical swipe (for changing slides)
        if (Math.abs(diffY) > threshold) {
            if (diffY > 0 && currentSlide < images.length - 1) {
                // Swipe up - go to next slide
                goToSlide(currentSlide + 1);
            } else if (diffY < 0 && currentSlide > 0) {
                // Swipe down - go to previous slide
                goToSlide(currentSlide - 1);
            }
        }
        
        // Reset states
        isSwiping = false;
    }

    // Mouse wheel and trackpad event for desktop
    function handleWheel(e) {
        // For landscape slides, allow horizontal scrolling with shift+wheel or trackpad
        const isLandscapeSlide = currentSlide > 0 && currentSlide < images.length - 1;
        
        if (isLandscapeSlide && (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY))) {
            // Horizontal scroll
            const slideContent = document.querySelector(`.slide[data-index="${currentSlide}"] .slide-content`);
            if (slideContent) {
                slideContent.scrollLeft += (e.deltaX || e.deltaY);
                e.preventDefault();
            }
            return;
        }
        
        // Vertical scroll for changing slides
        if (e.deltaY > 10 && currentSlide < images.length - 1) {
            // Scroll down - go to next slide
            goToSlide(currentSlide + 1);
            e.preventDefault();
        } else if (e.deltaY < -10 && currentSlide > 0) {
            // Scroll up - go to previous slide
            goToSlide(currentSlide - 1);
            e.preventDefault();
        }
    }

    // Keyboard navigation
    function handleKeyDown(e) {
        switch(e.key) {
            case 'ArrowUp':
                e.preventDefault();
                if (currentSlide > 0) {
                    goToSlide(currentSlide - 1);
                }
                break;
            case 'ArrowDown':
                e.preventDefault();
                if (currentSlide < images.length - 1) {
                    goToSlide(currentSlide + 1);
                }
                break;
            case 'Home':
                e.preventDefault();
                goToSlide(0);
                break;
            case 'End':
                e.preventDefault();
                goToSlide(images.length - 1);
                break;
        }
    }

    // Initialize the gallery
    initGallery();

    // Add event listeners
    gallery.addEventListener('touchstart', handleTouchStart, { passive: false });
    gallery.addEventListener('touchmove', handleTouchMove, { passive: false });
    gallery.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
});
