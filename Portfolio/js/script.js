// ===== NAVIGATION & SCROLL =====
const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll(".section");
const hamburger = document.querySelector(".hamburger");
const navLinksContainer = document.querySelector(".nav-links");

// Hamburger Menu Toggle
hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navLinksContainer.classList.toggle("active");
});

// Close mobile menu when link is clicked
navLinks.forEach(link => {
    link.addEventListener("click", () => {
        hamburger.classList.remove("active");
        navLinksContainer.classList.remove("active");
    });
});

// Reveal sections on scroll with animation
const revealSection = () => {
    const triggerBottom = window.innerHeight * 0.85;

    sections.forEach((section, index) => {
        const sectionTop = section.getBoundingClientRect().top;

        if (sectionTop < triggerBottom) {
            section.classList.add("show");
        }
    });
};

window.addEventListener("scroll", revealSection);
window.addEventListener("load", revealSection);

// Active navbar link based on scroll position
window.addEventListener("scroll", () => {
    let current = "";

    sections.forEach(section => {
        const sectionTop = section.offsetTop - 120;
        if (scrollY >= sectionTop) {
            current = section.getAttribute("id");
        }
    });

    navLinks.forEach(link => {
        link.classList.remove("active");
        if (link.getAttribute("href") === `#${current}`) {
            link.classList.add("active");
        }
    });
});

// ===== SCROLL TO TOP BUTTON =====
const scrollBtn = document.createElement("button");
scrollBtn.innerText = "↑";
scrollBtn.classList.add("scroll-top");
document.body.appendChild(scrollBtn);

scrollBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});

window.addEventListener("scroll", () => {
    if (window.scrollY > 500) {
        scrollBtn.classList.add("show");
    } else {
        scrollBtn.classList.remove("show");
    }
});

// ===== SKILLS SLIDER FUNCTIONALITY =====
const sliderButtons = document.querySelectorAll('.slider-btn');

sliderButtons.forEach(button => {
    button.addEventListener('click', function() {
        const sliderID = this.getAttribute('data-slider');
        const slider = document.getElementById(sliderID);
        const isNextBtn = this.classList.contains('next-btn');
        
        // Get the scroll amount (approximately the width of one card)
        const scrollAmount = 240; // card width (200px) + gap (25px) + padding
        
        if (isNextBtn) {
            slider.scrollBy({
                left: scrollAmount,
                behavior: 'smooth'
            });
        } else {
            slider.scrollBy({
                left: -scrollAmount,
                behavior: 'smooth'
            });
        }
    });
});

// ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && document.querySelector(href)) {
            e.preventDefault();
            const target = document.querySelector(href);
            const headerOffset = 100;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ===== PARALLAX EFFECT ON HERO =====
const hero = document.querySelector('.hero');
window.addEventListener('scroll', () => {
    if (window.scrollY < window.innerHeight) {
        hero.style.backgroundPosition = `center ${window.scrollY * 0.5}px`;
    }
});

// ===== COUNTER ANIMATION FOR STATS =====
const countUp = (element, target, duration = 2000) => {
    let current = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = Math.ceil(target) + '+';
            clearInterval(timer);
        } else {
            element.textContent = Math.ceil(current) + '+';
        }
    }, 16);
};

const animateStats = () => {
    const stats = document.querySelectorAll('.stat h4');
    const triggerBottom = window.innerHeight * 0.8;
    
    let animated = false;
    
    stats.forEach(stat => {
        const statTop = stat.getBoundingClientRect().top;
        
        if (statTop < triggerBottom && !animated) {
            const number = parseInt(stat.textContent);
            countUp(stat, number);
            animated = true;
        }
    });
};

window.addEventListener('scroll', animateStats);
window.addEventListener('load', animateStats);

// ===== PROJECT CARD HOVER EFFECT =====
const projectCards = document.querySelectorAll('.project-card');
projectCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        projectCards.forEach(c => {
            if (c !== this) {
                c.style.opacity = '0.5';
            }
        });
    });

    card.addEventListener('mouseleave', function() {
        projectCards.forEach(c => {
            c.style.opacity = '1';
        });
    });
});

// ===== TIMELINE ANIMATION =====
const animateTimeline = () => {
    const timelineItems = document.querySelectorAll('.timeline-item');
    const triggerBottom = window.innerHeight * 0.8;

    timelineItems.forEach((item, index) => {
        const itemTop = item.getBoundingClientRect().top;
        
        if (itemTop < triggerBottom) {
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
            }, index * 200);
        }
    });
};

const timelineItems = document.querySelectorAll('.timeline-item');
timelineItems.forEach(item => {
    item.style.opacity = '0';
    item.style.transform = 'translateX(-30px)';
    item.style.transition = 'all 0.6s ease';
});

window.addEventListener('scroll', animateTimeline);
window.addEventListener('load', animateTimeline);

// ===== CONTACT BUTTON ANIMATION =====
const contactLinks = document.querySelectorAll('.social-link');
contactLinks.forEach(link => {
    link.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px) scale(1.05)';
    });

    link.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// ===== DYNAMIC TEXT ANIMATION (Typing Effect) =====
const typeWriter = (element, text, speed = 50) => {
    element.innerHTML = '';
    let index = 0;

    const type = () => {
        if (index < text.length) {
            element.textContent += text.charAt(index);
            index++;
            setTimeout(type, speed);
        }
    };

    type();
};

// Apply typing effect to hero greeting on load
window.addEventListener('load', () => {
    const heroGreeting = document.querySelector('.hero-greeting');
    if (heroGreeting) {
        const text = heroGreeting.textContent;
        typeWriter(heroGreeting, text, 40);
    }
});

// ===== PAGE LOAD ANIMATION =====
window.addEventListener('load', () => {
    document.body.style.opacity = '1';
});

// ===== CURSOR EFFECT (Optional - Smooth tracking) =====
let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

// ===== INTERSECTION OBSERVER FOR BETTER PERFORMANCE =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

sections.forEach(section => {
    observer.observe(section);
});

// ===== FORM VALIDATION (For future contact form) =====
const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

// ===== MOBILE RESPONSIVENESS CHECK =====
const isMobile = () => window.innerWidth <= 768;

// ===== PERFORMANCE OPTIMIZATION =====
let ticking = false;

window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            revealSection();
            animateSkillBars();
            animateTimeline();
            ticking = false;
        });
        ticking = true;
    }
});

// ===== CONSOLE EASTER EGG =====
console.log(
    '%c🚀 Welcome to Abdullah Akbar\'s Portfolio!',
    'font-size: 20px; color: #38bdf8; font-weight: bold;'
);
console.log(
    '%cLooking at the code, are you? Feel free to check out my GitHub and connect with me!',
    'font-size: 14px; color: #cbd5f5;'
);
