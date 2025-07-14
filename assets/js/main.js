// Initialize AOS (Animate On Scroll)
AOS.init({ 
    duration: 800, 
    once: true, 
    offset: 50 
});

// Theme toggle functionality
const themeToggle = document.getElementById('checkbox');
const body = document.body;

// Particles configuration for dark mode
const darkParticlesConfig = { 
    fpsLimit: 60, 
    particles: { 
        number: { 
            value: 60, 
            density: { 
                enable: true, 
                value_area: 800 
            } 
        }, 
        color: { 
            value: "#ffffff" 
        }, 
        shape: { 
            type: "circle" 
        }, 
        opacity: { 
            value: 0.5, 
            random: true 
        }, 
        size: { 
            value: 3, 
            random: true 
        }, 
        links: { 
            color: "#ffffff", 
            distance: 150, 
            enable: true, 
            opacity: 0.4, 
            width: 1 
        }, 
        move: { 
            enable: true, 
            speed: 2, 
            direction: "none", 
            random: false, 
            straight: false, 
            out_mode: "out", 
            bounce: false 
        }, 
    }, 
    interactivity: { 
        detectsOn: "canvas", 
        events: { 
            onhover: { 
                enable: true, 
                mode: "grab" 
            }, 
            onclick: { 
                enable: true, 
                mode: "push" 
            }, 
            resize: true 
        }, 
        modes: { 
            grab: { 
                distance: 140, 
                line_linked: { 
                    opacity: 1 
                } 
            }, 
            push: { 
                particles_nb: 4 
            } 
        }, 
    }, 
    retina_detect: true 
};

// Particles configuration for light mode
const lightParticlesConfig = {
    ...darkParticlesConfig,
    particles: {
        ...darkParticlesConfig.particles,
        number: { 
            value: 50 
        },
        color: { 
            value: "#0d6efd" // warna biru lebih gelap agar lebih jelas di background terang
        },
        links: {
            ...darkParticlesConfig.particles.links,
            color: "#6c757d",
            opacity: 0.8, // lebih tebal
            width: 2,     // lebih tebal
        },
    },
};

// Function to load particles
function loadParticles(config) { 
    tsParticles.load("particles-js", config); 
}

// Function to handle theme change
function handleThemeChange(isLight) { 
    if (isLight) { 
        body.classList.add('light-mode'); 
        localStorage.setItem('theme', 'light-mode'); 
        loadParticles(lightParticlesConfig); 
    } else { 
        body.classList.remove('light-mode'); 
        localStorage.setItem('theme', 'dark-mode'); 
        loadParticles(darkParticlesConfig); 
    } 
}

// Check current theme and apply
const currentTheme = localStorage.getItem('theme');
if (currentTheme === 'light-mode') { 
    themeToggle.checked = true; 
    handleThemeChange(true); 
} else { 
    handleThemeChange(false); 
}

// Theme toggle event listener
themeToggle.addEventListener('change', () => { 
    handleThemeChange(themeToggle.checked); 
});

// Navigation functionality
const sections = document.querySelectorAll('main > section');
const navLinks = document.querySelectorAll('.nav-menu a');

// Add click event to navigation links
navLinks.forEach(link => { 
    link.addEventListener('click', function() { 
        navLinks.forEach(nav => nav.classList.remove('active')); 
        this.classList.add('active'); 
    }); 
});

// Update active navigation on scroll
window.addEventListener('scroll', () => { 
    let current = 'home'; 
    sections.forEach(section => { 
        const sectionTop = section.offsetTop; 
        if (pageYOffset >= sectionTop - 150) { 
            current = section.getAttribute('id'); 
        } 
    }); 
    navLinks.forEach(link => { 
        link.classList.remove('active'); 
        if (link.getAttribute('href').includes(current)) { 
            link.classList.add('active'); 
        } 
    }); 
});

// Contact form functionality
const contactForm = document.getElementById('contact-form');
const modalContainer = document.getElementById('success-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const modalOverlay = document.querySelector('.modal-overlay');

// Function to show modal
function showModal() { 
    modalContainer.classList.add('show'); 
}

// Function to close modal
function closeModal() { 
    modalContainer.classList.remove('show'); 
}

// Contact form submit event
contactForm.addEventListener('submit', function(event) { 
    event.preventDefault(); 
    showModal(); 
    contactForm.reset(); 
    setTimeout(() => { 
        closeModal(); 
    }, 4000); 
});

// Close modal event listeners
closeModalBtn.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', closeModal); 