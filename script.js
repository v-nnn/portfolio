/**
 * Portfolio Website JavaScript
 * Author: Vishav Nandha
 * Description: Handles all interactive elements, animations, and functionality for the portfolio website
 */

// Wait for DOM to be fully loaded before executing scripts
document.addEventListener('DOMContentLoaded', () => {
    'use strict';
    
    // Initialize all modules
    try {
        ThemeManager.init();
        NavigationManager.init();
        AnimationController.init();
        TypingEffect.init();
        SkillsManager.init();
        ProjectsManager.init();
        FormManager.init();
        ScrollManager.init();
        ParticlesManager.init();
    } catch (error) {
        console.error('Initialization error:', error);
        // Continue execution with graceful degradation
    }
});

/**
 * Theme Manager
 * Handles the dark/light mode toggle functionality and user preference storage
 */
const ThemeManager = (() => {
    // Private variables
    const themeToggle = document.getElementById('themeToggle');
    const THEME_STORAGE_KEY = 'portfolio-theme-preference';
    const DARK_THEME = 'dark';
    const LIGHT_THEME = 'light';
    let currentTheme = LIGHT_THEME;
    
    // Get user's preferred color scheme
    const getPreferredColorScheme = () => {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return DARK_THEME;
        }
        return LIGHT_THEME;
    };
    
    // Check for saved theme preference or use preferred color scheme
    const getSavedTheme = () => {
        try {
            const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
            return savedTheme || getPreferredColorScheme();
        } catch (error) {
            console.warn('Error accessing localStorage:', error);
            return getPreferredColorScheme();
        }
    };
    
    // Save theme preference to localStorage
    const saveThemePreference = (theme) => {
        try {
            localStorage.setItem(THEME_STORAGE_KEY, theme);
        } catch (error) {
            console.warn('Error saving theme preference:', error);
        }
    };
    
    // Apply theme to document
    const applyTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        currentTheme = theme;
    };
    
    // Toggle between light and dark themes
    const toggleTheme = () => {
        const newTheme = currentTheme === DARK_THEME ? LIGHT_THEME : DARK_THEME;
        applyTheme(newTheme);
        saveThemePreference(newTheme);
    };
    
    // Initialize theme manager
    const init = () => {
        if (!themeToggle) {
            console.warn('Theme toggle button not found');
            return;
        }
        
        // Load saved theme
        const savedTheme = getSavedTheme();
        applyTheme(savedTheme);
        
        // Add event listener to theme toggle button
        themeToggle.addEventListener('click', toggleTheme);
        
        // Listen for system theme changes
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                const newTheme = e.matches ? DARK_THEME : LIGHT_THEME;
                applyTheme(newTheme);
                saveThemePreference(newTheme);
            });
        }
    };
    
    // Public API
    return {
        init,
        getCurrentTheme: () => currentTheme,
        toggleTheme
    };
})();

/**
 * Navigation Manager
 * Handles mobile navigation toggle and active link highlighting
 */
const NavigationManager = (() => {
    // Private variables
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const header = document.querySelector('.header');
    
    // Toggle mobile navigation menu
    const toggleNavMenu = () => {
        if (!navMenu) return;
        
        navMenu.classList.toggle('active');
        
        // Toggle aria-expanded attribute for accessibility
        const isExpanded = navMenu.classList.contains('active');
        navToggle.setAttribute('aria-expanded', isExpanded);
        
        // Prevent body scrolling when menu is open
        document.body.style.overflow = isExpanded ? 'hidden' : '';
    };
    
    // Close navigation menu when a link is clicked
    const closeNavMenu = () => {
        if (!navMenu) return;
        navMenu.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    };
    
    // Update active link based on scroll position
    const updateActiveLink = () => {
        const scrollPosition = window.scrollY;
        
        // Find all section elements
        const sections = document.querySelectorAll('section[id]');
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                // Remove active class from all links
                navLinks.forEach(link => {
                    link.classList.remove('active');
                });
                
                // Add active class to current section link
                try {
                    const currentLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
                    if (currentLink) {
                        currentLink.classList.add('active');
                    }
                } catch (error) {
                    console.warn(`Error updating active link for section #${sectionId}:`, error);
                }
            }
        });
    };
    
    // Handle header style on scroll
    const handleHeaderScroll = () => {
        if (!header) return;
        
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };
    
    // Initialize navigation manager
    const init = () => {
        // Add event listener to navigation toggle button
        if (navToggle) {
            navToggle.addEventListener('click', toggleNavMenu);
        }
        
        // Add event listeners to navigation links
        navLinks.forEach(link => {
            link.addEventListener('click', closeNavMenu);
        });
        
        // Add scroll event listeners for header and active link
        window.addEventListener('scroll', () => {
            handleHeaderScroll();
            updateActiveLink();
        }, { passive: true });
        
        // Initialize header state
        handleHeaderScroll();
        updateActiveLink();
    };
    
    // Public API
    return {
        init,
        closeNavMenu
    };
})();

/**
 * Animation Controller
 * Manages scroll-triggered animations and reveals elements as they come into view
 */
const AnimationController = (() => {
    // Elements to animate
    let animatedElements = [];
    
    // Animation classes to apply
    const ANIMATION_CLASSES = {
        fadeIn: 'animate-fadeIn',
        slideUp: 'animate-slideUp',
        slideRight: 'animate-slideRight',
        slideLeft: 'animate-slideLeft'
    };
    
    // Default animation options
    const defaultOptions = {
        threshold: 0.2,
        once: true
    };
    
    // Set up the Intersection Observer
    const setupObserver = (elements, options = {}) => {
        const observerOptions = { ...defaultOptions, ...options };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const animationType = element.dataset.animation || 'fadeIn';
                    const delay = element.dataset.delay || 0;
                    
                    // Add animation class after specified delay
                    setTimeout(() => {
                        element.classList.add(ANIMATION_CLASSES[animationType]);
                    }, delay);
                    
                    // Stop observing if animation should only happen once
                    if (observerOptions.once) {
                        observer.unobserve(element);
                    }
                } else if (!observerOptions.once) {
                    // Remove animation class when element is not in view
                    const element = entry.target;
                    const animationType = element.dataset.animation || 'fadeIn';
                    element.classList.remove(ANIMATION_CLASSES[animationType]);
                }
            });
        }, {
            root: null,
            rootMargin: '0px',
            threshold: observerOptions.threshold
        });
        
        elements.forEach(element => {
            observer.observe(element);
        });
        
        return observer;
    };
    
    // Initialize animation elements
    const initAnimationElements = () => {
        // Find all elements with data-animation attribute
        const elements = document.querySelectorAll('[data-animation]');
        animatedElements = Array.from(elements);
        
        // Add initial hidden state to all animated elements
        animatedElements.forEach(element => {
            element.style.opacity = '0';
        });
        
        // Set up the intersection observer
        if (animatedElements.length > 0) {
            if ('IntersectionObserver' in window) {
                setupObserver(animatedElements);
            } else {
                // Fallback for browsers that don't support Intersection Observer
                animatedElements.forEach(element => {
                    element.style.opacity = '1';
                    const animationType = element.dataset.animation || 'fadeIn';
                    element.classList.add(ANIMATION_CLASSES[animationType]);
                });
            }
        }
    };
    
    // Add animation to specific elements
    const addAnimation = (selector, animationType, options = {}) => {
        const elements = document.querySelectorAll(selector);
        
        if (elements.length > 0) {
            elements.forEach(element => {
                element.dataset.animation = animationType;
                element.style.opacity = '0';
                animatedElements.push(element);
            });
            
            if ('IntersectionObserver' in window) {
                setupObserver(Array.from(elements), options);
            } else {
                // Fallback for browsers that don't support Intersection Observer
                elements.forEach(element => {
                    element.style.opacity = '1';
                    element.classList.add(ANIMATION_CLASSES[animationType]);
                });
            }
        }
    };
    
    // Initialize animation controller
    const init = () => {
        // Check if IntersectionObserver is supported
        if (!('IntersectionObserver' in window)) {
            console.warn('IntersectionObserver not supported. Using fallback animation method.');
        }
        
        // Initialize animations with a slight delay to ensure page is ready
        setTimeout(() => {
            initAnimationElements();
            
            // Add specific animations to elements that don't have data-animation attribute
            addAnimation('.about-content', 'fadeIn');
            addAnimation('.skill-item', 'slideUp', { threshold: 0.1 });
            addAnimation('.project-card', 'slideUp', { threshold: 0.1 });
            addAnimation('.timeline-item', 'slideRight', { threshold: 0.1 });
            addAnimation('.education-item', 'slideUp', { threshold: 0.1 });
            addAnimation('.contact-item', 'slideLeft', { threshold: 0.1 });
            addAnimation('.contact-form-container', 'fadeIn', { threshold: 0.1 });
        }, 100);
    };
    
    // Public API
    return {
        init,
        addAnimation
    };
})();

/**
 * Typing Effect
 * Creates a typing animation for the hero title and subtitle
 */
const TypingEffect = (() => {
    // Private variables
    const typingName = document.getElementById('typingName');
    const typingSubtitle = document.getElementById('typingSubtitle');
    
    // Create typing effect for an element
    const createTypingEffect = (element, text, speed = 100, startDelay = 0) => {
        if (!element) return;
        
        // Store original text
        const originalText = text || element.textContent;
        
        // Clear the element's text content
        element.textContent = '';
        element.style.opacity = '1';
        
        // Add typing cursor
        element.style.borderRight = '3px solid var(--primary-color)';
        element.style.animation = 'blink 0.7s infinite';
        
        let i = 0;
        
        // Delay the start of typing
        setTimeout(() => {
            // Type each character
            const typingInterval = setInterval(() => {
                if (i < originalText.length) {
                    element.textContent += originalText.charAt(i);
                    i++;
                } else {
                    clearInterval(typingInterval);
                    
                    // Remove typing cursor after typing is complete
                    setTimeout(() => {
                        element.style.borderRight = 'none';
                        element.style.animation = 'none';
                    }, 1000);
                }
            }, speed);
        }, startDelay);
    };
    
    // Initialize typing effect
    const init = () => {
        // Create typing effect for name
        if (typingName) {
            const nameText = typingName.textContent;
            createTypingEffect(typingName, nameText, 100, 500);
        }
        
        // Create typing effect for subtitle
        if (typingSubtitle) {
            const subtitleText = typingSubtitle.textContent;
            createTypingEffect(typingSubtitle, subtitleText, 80, 2000);
        }
    };
    
    // Public API
    return {
        init,
        createTypingEffect
    };
})();

/**
 * Skills Manager
 * Handles skills category filtering and skill progress bar animations
 */
const SkillsManager = (() => {
    // Private variables
    const categoryButtons = document.querySelectorAll('.category-btn');
    const skillsCategories = document.querySelectorAll('.skills-category');
    const skillsContent = document.querySelector('.skills-content');
    const skillBars = document.querySelectorAll('.skill-progress');
    
    // Switch between skills categories
    const switchCategory = (categoryId) => {
        if (!skillsCategories.length) return;
        
        // Remove active class from all categories
        skillsCategories.forEach(category => {
            category.classList.remove('active');
        });
        
        // Remove active class from all buttons
        categoryButtons.forEach(button => {
            button.classList.remove('active');
        });
        
        // Add active class to selected category
        const selectedCategory = document.querySelector(`.skills-category[data-category="${categoryId}"]`);
        if (selectedCategory) {
            selectedCategory.classList.add('active');
        }
        
        // Add active class to selected button
        const selectedButton = document.querySelector(`.category-btn[data-category="${categoryId}"]`);
        if (selectedButton) {
            selectedButton.classList.add('active');
        }
        
        // Animate skill bars in the selected category
        animateSkillBars(selectedCategory);
    };
    
    // Animate skill progress bars
    const animateSkillBars = (container = document) => {
        // Find all skill progress bars in the container
        const progressBars = container.querySelectorAll('.skill-progress');
        
        if (!progressBars.length) return;
        
        // Reset progress bars
        progressBars.forEach(bar => {
            bar.style.width = '0';
        });
        
        // Animate progress bars
        setTimeout(() => {
            progressBars.forEach(bar => {
                const progress = bar.getAttribute('data-progress') || 0;
                bar.style.width = `${progress}%`;
            });
        }, 200);
    };
    
    // Initialize skills manager
    const init = () => {
        if (!categoryButtons.length || !skillsCategories.length) return;
        
        // Add event listeners to category buttons
        categoryButtons.forEach(button => {
            button.addEventListener('click', () => {
                const categoryId = button.getAttribute('data-category');
                if (categoryId) {
                    switchCategory(categoryId);
                }
            });
        });
        
        // Set up intersection observer for skills content
        if ('IntersectionObserver' in window && skillsContent) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // Get active category and animate its skill bars
                        const activeCategory = document.querySelector('.skills-category.active');
                        if (activeCategory) {
                            animateSkillBars(activeCategory);
                        }
                        
                        // Stop observing after animation
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.2
            });
            
            observer.observe(skillsContent);
        } else {
            // Fallback for browsers that don't support Intersection Observer
            setTimeout(() => {
                const activeCategory = document.querySelector('.skills-category.active');
                if (activeCategory) {
                    animateSkillBars(activeCategory);
                }
            }, 1000);
        }
    };
    
    // Public API
    return {
        init,
        switchCategory,
        animateSkillBars
    };
})();

/**
 * Projects Manager
 * Handles project card flip animations
 */
const ProjectsManager = (() => {
    // Private variables
    const projectCards = document.querySelectorAll('.project-card');
    const detailsButtons = document.querySelectorAll('.project-details-btn');
    const backButtons = document.querySelectorAll('.project-back-btn');
    
    // Flip a project card to show details
    const flipCard = (card) => {
        if (!card) return;
        
        const content = card.querySelector('.project-content');
        if (content) {
            content.classList.add('flipped');
        }
    };
    
    // Flip a project card back to show front
    const flipCardBack = (card) => {
        if (!card) return;
        
        const content = card.querySelector('.project-content');
        if (content) {
            content.classList.remove('flipped');
        }
    };
    
    // Initialize projects manager
    const init = () => {
        // Add event listeners to details buttons
        detailsButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const card = button.closest('.project-card');
                flipCard(card);
            });
        });
        
        // Add event listeners to back buttons
        backButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const card = button.closest('.project-card');
                flipCardBack(card);
            });
        });
        
        // Add accessibility support with keyboard
        projectCards.forEach(card => {
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const content = card.querySelector('.project-content');
                    if (content) {
                        content.classList.toggle('flipped');
                    }
                }
            });
        });
    };
    
    // Public API
    return {
        init,
        flipCard,
        flipCardBack
    };
})();

/**
 * Form Manager
 * Handles form validation and submission
 */
const FormManager = (() => {
    // Private variables
    const contactForm = document.getElementById('contactForm');
    
    // Validate form input
    const validateForm = (form) => {
        const inputs = form.querySelectorAll('input, textarea');
        let isValid = true;
        
        inputs.forEach(input => {
            // Reset error state
            input.classList.remove('error');
            
            // Check if input is required and empty
            if (input.hasAttribute('required') && !input.value.trim()) {
                input.classList.add('error');
                isValid = false;
            }
            
            // Validate email format
            if (input.type === 'email' && input.value.trim()) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(input.value.trim())) {
                    input.classList.add('error');
                    isValid = false;
                }
            }
        });
        
        return isValid;
    };
    
    // Submit form data
    const submitForm = async (form) => {
        // In a real application, you would send the form data to a server
        // For this example, we'll simulate a successful submission
        
        const formData = new FormData(form);
        const formObject = {};
        
        // Convert FormData to a plain object
        formData.forEach((value, key) => {
            formObject[key] = value;
        });
        
        // Simulate API call with a delay
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Form submitted:', formObject);
                resolve({ success: true, message: 'Message sent successfully!' });
            }, 1000);
        });
    };
    
    // Show form submission status message
    const showStatusMessage = (form, message, isError = false) => {
        // Remove any existing status message
        const existingStatus = form.querySelector('.form-status');
        if (existingStatus) {
            existingStatus.remove();
        }
        
        // Create status message element
        const statusElement = document.createElement('div');
        statusElement.className = `form-status ${isError ? 'error' : 'success'}`;
        statusElement.textContent = message;
        
        // Add status message to form
        form.appendChild(statusElement);
        
        // Remove status message after 5 seconds
        setTimeout(() => {
            statusElement.classList.add('fade-out');
            setTimeout(() => {
                statusElement.remove();
            }, 500);
        }, 5000);
    };
    
    // Initialize form manager
    const init = () => {
        if (!contactForm) return;
        
        // Add form submission event listener
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Validate form
            if (!validateForm(contactForm)) {
                showStatusMessage(contactForm, 'Please fill in all required fields correctly.', true);
                return;
            }
            
            // Disable submit button and show loading state
            const submitButton = contactForm.querySelector('.btn-submit');
            const originalButtonText = submitButton.innerHTML;
            submitButton.disabled = true;
            submitButton.innerHTML = '<span>Sending...</span> <i class="fas fa-spinner fa-spin"></i>';
            
            try {
                // Submit form data
                const response = await submitForm(contactForm);
                
                if (response.success) {
                    // Show success message
                    showStatusMessage(contactForm, response.message);
                    
                    // Clear form
                    contactForm.reset();
                } else {
                    // Show error message
                    showStatusMessage(contactForm, response.message || 'Something went wrong. Please try again.', true);
                }
            } catch (error) {
                console.error('Form submission error:', error);
                showStatusMessage(contactForm, 'An error occurred. Please try again later.', true);
            } finally {
                // Re-enable submit button and restore original text
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
            }
        });
        
        // Add input focus events for floating labels
        const formInputs = contactForm.querySelectorAll('input, textarea');
        formInputs.forEach(input => {
            // Handle initial state
            if (input.value.trim() !== '') {
                input.classList.add('has-value');
            }
            
            // Handle input events
            input.addEventListener('input', () => {
                if (input.value.trim() !== '') {
                    input.classList.add('has-value');
                } else {
                    input.classList.remove('has-value');
                }
            });
        });
    };
    
    // Public API
    return {
        init,
        validateForm,
        submitForm
    };
})();

/**
 * Scroll Manager
 * Handles smooth scrolling and scroll-to-top functionality
 */
const ScrollManager = (() => {
    // Private variables
    const scrollLinks = document.querySelectorAll('a[href^="#"]');
    const scrollToTopButton = document.getElementById('scrollToTop');
    
    // Smooth scroll to target element
    const smoothScrollTo = (target, duration = 1000) => {
        if (!target) return;
        
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;
        
        // Animation function
        const animation = (currentTime) => {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            const easeInOutCubic = progress < 0.5
                ? 4 * progress * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;
            
            window.scrollTo(0, startPosition + distance * easeInOutCubic);
            
            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        };
        
        // Start animation
        requestAnimationFrame(animation);
    };
    
    // Handle scroll to top button visibility
    const handleScrollToTopButton = () => {
        if (!scrollToTopButton) return;
        
        if (window.pageYOffset > 500) {
            scrollToTopButton.classList.add('active');
        } else {
            scrollToTopButton.classList.remove('active');
        }
    };
    
    // Initialize scroll manager
    const init = () => {
        // Add event listeners to scroll links
        scrollLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                const targetId = link.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    // Close mobile navigation menu if open
                    if (NavigationManager) {
                        NavigationManager.closeNavMenu();
                    }
                    
                    // Smooth scroll to target
                    smoothScrollTo(targetElement);
                }
            });
        });
        
        // Add event listener to scroll to top button
        if (scrollToTopButton) {
            scrollToTopButton.addEventListener('click', () => {
                smoothScrollTo(document.body, 800);
            });
        }
        
        // Add scroll event listener for scroll to top button
        window.addEventListener('scroll', handleScrollToTopButton, { passive: true });
        
        // Initialize scroll to top button visibility
        handleScrollToTopButton();
    };
    
    // Public API
    return {
        init,
        smoothScrollTo
    };
})();

/**
 * Particles Manager
 * Sets up and controls the particles.js background in the hero section
 */
const ParticlesManager = (() => {
    // Configuration for particles.js
    const particlesConfig = {
        particles: {
            number: {
                value: 50,
                density: {
                    enable: true,
                    value_area: 800
                }
            },
            color: {
                value: ['#0078D7', '#28A745', '#333333']
            },
            shape: {
                type: ['circle', 'triangle'],
                stroke: {
                    width: 0,
                    color: '#000000'
                }
            },
            opacity: {
                value: 0.5,
                random: false,
                anim: {
                    enable: false,
                    speed: 1,
                    opacity_min: 0.1,
                    sync: false
                }
            },
            size: {
                value: 3,
                random: true,
                anim: {
                    enable: false,
                    speed: 40,
                    size_min: 0.1,
                    sync: false
                }
            },
            line_linked: {
                enable: true,
                distance: 150,
                color: '#0078D7',
                opacity: 0.2,
                width: 1
            },
            move: {
                enable: true,
                speed: 2,
                direction: 'none',
                random: false,
                straight: false,
                out_mode: 'out',
                bounce: false,
                attract: {
                    enable: false,
                    rotateX: 600,
                    rotateY: 1200
                }
            }
        },
        interactivity: {
            detect_on: 'canvas',
            events: {
                onhover: {
                    enable: true,
                    mode: 'grab'
                },
                onclick: {
                    enable: true,
                    mode: 'push'
                },
                resize: true
            },
            modes: {
                grab: {
                    distance: 140,
                    line_linked: {
                        opacity: 0.5
                    }
                },
                push: {
                    particles_nb: 3
                }
            }
        },
        retina_detect: true
    };
    
    // Dark mode particle configuration
    const darkModeParticlesConfig = {
        ...particlesConfig,
        particles: {
            ...particlesConfig.particles,
            color: {
                value: ['#1E90FF', '#3CB371', '#F8F9FA']
            },
            line_linked: {
                ...particlesConfig.particles.line_linked,
                color: '#1E90FF'
            }
        }
    };
    
    // Update particles configuration based on theme
    const updateParticlesTheme = () => {
        if (!window.pJSDom || !window.pJSDom.length) return;
        
        const currentTheme = ThemeManager.getCurrentTheme();
        const config = currentTheme === 'dark' ? darkModeParticlesConfig : particlesConfig;
        
        try {
            window.pJSDom[0].pJS.particles.color.value = config.particles.color.value;
            window.pJSDom[0].pJS.particles.line_linked.color = config.particles.line_linked.color;
            
            // Update particles
            window.pJSDom[0].pJS.fn.particlesRefresh();
        } catch (error) {
            console.warn('Error updating particles theme:', error);
        }
    };
    
    // Initialize particles manager
    const init = () => {
        // Check if particles.js is loaded and particles container exists
        if (typeof particlesJS === 'undefined' || !document.getElementById('particles-js')) {
            console.warn('Particles.js library or container not found');
            return;
        }
        
        // Get current theme for initial configuration
        const currentTheme = ThemeManager.getCurrentTheme();
        const config = currentTheme === 'dark' ? darkModeParticlesConfig : particlesConfig;
        
        try {
            // Initialize particles.js
            particlesJS('particles-js', config);
            
            // Update particles theme when theme changes
            const themeToggle = document.getElementById('themeToggle');
            if (themeToggle) {
                themeToggle.addEventListener('click', () => {
                    setTimeout(updateParticlesTheme, 100);
                });
            }
        } catch (error) {
            console.error('Error initializing particles.js:', error);
            
            // Remove particles container if initialization fails
            const particlesContainer = document.getElementById('particles-js');
            if (particlesContainer) {
                particlesContainer.style.display = 'none';
            }
        }
    };
    
    // Public API
    return {
        init,
        updateParticlesTheme
    };
})();

/**
 * Performance Optimization and Error Recovery
 */
(() => {
    // Optimize animations by using requestAnimationFrame
    const optimizeAnimations = () => {
        // Debounce scroll event handlers
        const debounce = (func, wait = 10, immediate = true) => {
            let timeout;
            return function() {
                const context = this, args = arguments;
                const later = function() {
                    timeout = null;
                    if (!immediate) func.apply(context, args);
                };
                const callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) func.apply(context, args);
            };
        };
        
        // Optimize scroll event handlers
        const scrollHandlers = debounce(() => {
            // Add your scroll-dependent functions here
        }, 10);
        
        window.addEventListener('scroll', scrollHandlers, { passive: true });
    };
    
    // Monitor and recover from JavaScript errors
    const setupErrorRecovery = () => {
        window.addEventListener('error', (e) => {
            console.error('JavaScript error:', e.message);
            
            // Attempt to recover basic functionality
            try {
                // Re-initialize critical components if they fail
                if (e.message.includes('NavigationManager')) {
                    NavigationManager.init();
                }
                
                if (e.message.includes('ThemeManager')) {
                    ThemeManager.init();
                }
                
                // Provide visual feedback for critical errors
                const errorMessage = document.createElement('div');
                errorMessage.className = 'error-notification';
                errorMessage.textContent = 'An error occurred. Some features may not work properly.';
                document.body.appendChild(errorMessage);
                
                // Remove error message after 5 seconds
                setTimeout(() => {
                    errorMessage.remove();
                }, 5000);
            } catch (recoverError) {
                console.error('Error recovery failed:', recoverError);
            }
        });
    };
    
    // Initialize performance optimizations and error recovery
    const init = () => {
        optimizeAnimations();
        setupErrorRecovery();
        
        // Add event listener for page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                // Resume animations when page becomes visible
                ParticlesManager.updateParticlesTheme();
            }
        });
    };
    
    // Call initialization after DOM is loaded
    document.addEventListener('DOMContentLoaded', init);
})();