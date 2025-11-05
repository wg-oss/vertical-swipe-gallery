document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.querySelector('.gallery');
    let currentSlide = 0;
    let startY = 0;
    let startX = 0;
    let startScrollLeft = 0;
    let isSwiping = false;
    let isHorizontalPan = false;
    let isLandscapeSlide = false;
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
            slide.dataset.index = index;
            slide.style.transform = `translateY(${index * 100}%)`;
            
            const slideContent = document.createElement('div');
            slideContent.className = 'slide-content';
            
            // Check if this is a landscape image (not first or last)
            const isLandscape = index > 0 && index < images.length - 1;
            
            // Create container for the image
            const panel = document.createElement('div');
            panel.className = 'slide-panel';
            
            // Create the image
            const img = document.createElement('img');
            img.src = src;
            img.alt = `Image ${index + 1}`;
            img.loading = 'lazy';
            img.style.pointerEvents = 'none';
            
            if (isLandscape) {
                // For landscape images, make it wider and enable horizontal scrolling
                img.style.width = '200%';
                img.style.height = '100%';
                img.style.objectFit = 'cover';
                img.style.objectPosition = 'left center';
                
                // Enable horizontal scrolling
                slideContent.style.overflowX = 'auto';
                slideContent.style.touchAction = 'pan-x';
                
                // Add a class to identify landscape slides
                slideContent.classList.add('landscape-slide');
            } else {
                // For portrait images, use normal sizing
                img.style.width = '100%';
                img.style.height = 'auto';
                img.style.objectFit = 'contain';
                
                // Disable horizontal scrolling
                slideContent.style.overflowX = 'hidden';
                slideContent.style.touchAction = 'pan-y';
            }
            
            panel.appendChild(img);
            slideContent.appendChild(panel);
            slide.appendChild(slideContent);
            gallery.appendChild(slide);
            
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
        const touch = e.touches[0];
        startY = touch.clientY;
        startX = touch.clientX;
        isSwiping = true;
        isHorizontalPan = false;
        
        // Get the current slide content
        const slideContent = document.querySelector(`.slide[data-index="${currentSlide}"] .slide-content`);
        if (slideContent && slideContent.classList.contains('landscape-slide')) {
            startScrollLeft = slideContent.scrollLeft;
            isLandscapeSlide = true;
        } else {
            isLandscapeSlide = false;
        }
        
        // Don't prevent default to allow native scrolling
        // e.preventDefault();
    }

    function handleTouchMove(e) {
        if (!isSwiping) return;
        
        const touch = e.touches[0];
        const currentX = touch.clientX;
        const currentY = touch.clientY;
        const diffX = startX - currentX;
        const diffY = startY - currentY;
        
        // Only process if we haven't determined the direction yet or it's a horizontal pan
        if (!isHorizontalPan && isLandscapeSlide) {
            // Check if this is a horizontal pan
            if (Math.abs(diffX) > 10) {
                isHorizontalPan = true;
            } else if (Math.abs(diffY) > 10) {
                // Vertical swipe - let it propagate
                return;
            }
        }
        
        // Handle horizontal pan for landscape slides
        if (isHorizontalPan && isLandscapeSlide) {
            const slideContent = document.querySelector(`.slide[data-index="${currentSlide}"] .slide-content`);
            if (slideContent) {
                const newScrollLeft = startScrollLeft + diffX;
                slideContent.scrollLeft = newScrollLeft;
                e.preventDefault();
                return;
            }
        }
        
        // For vertical swipes (non-landscape or intentional vertical swipes)
        if (!isHorizontalPan && Math.abs(diffY) > 10) {
            // Allow vertical swipe to change slides
            return;
        }
    }

    function handleTouchEnd(e) {
        if (!isSwiping) return;
        
        const touch = e.changedTouches[0];
        const endY = touch.clientY;
        const endX = touch.clientX;
        const diffY = startY - endY;
        const diffX = startX - endX;
        const threshold = 10; // Reduced threshold for better responsiveness
        
        // Handle vertical swipe to change slides
        if (!isHorizontalPan && Math.abs(diffY) > threshold) {
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
        isHorizontalPan = false;
    }

    // Mouse wheel and trackpad event for desktop
    function handleWheel(e) {
        // For landscape slides, allow horizontal scrolling with shift+wheel or trackpad
        const isLandscapeSlide = currentSlide > 0 && currentSlide < images.length - 1;
        
        if (isLandscapeSlide) {
            const slideContent = document.querySelector(`.slide[data-index="${currentSlide}"] .slide-content`);
            if (slideContent) {
                // Check if we're at the edges of horizontal scroll
                const atLeftEdge = slideContent.scrollLeft <= 0;
                const atRightEdge = slideContent.scrollWidth - slideContent.clientWidth - slideContent.scrollLeft < 1;
                
                // If we're at the edges, allow vertical scroll to change slides
                if ((atLeftEdge && e.deltaX > 0) || (atRightEdge && e.deltaX < 0)) {
                    // Allow vertical scroll to change slides
                } else if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
                    // Horizontal scroll
                    slideContent.scrollLeft += (e.deltaX || e.deltaY);
                    e.preventDefault();
                    return;
                }
            }
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
