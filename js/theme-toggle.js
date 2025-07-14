// SCRIPT PARA EL BOTÓN TOGGLE DÍA/NOCHE

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar el botón toggle existente
    function initializeThemeToggle() {
        // Buscar el botón existente en el HTML
        const existingToggle = document.querySelector('.theme-toggle');
        
        if (existingToggle) {
            // Usar el botón existente
            existingToggle.addEventListener('click', toggleTheme);
            applyStoredTheme();
        } else {
            // Solo crear uno nuevo si no existe (fallback)
            createAndInsertToggleButton();
        }
    }
    
    // Función para crear botón solo si no existe
    function createAndInsertToggleButton() {
        const themeToggle = document.createElement('button');
        themeToggle.className = 'theme-toggle';
        themeToggle.setAttribute('aria-label', 'Cambiar tema día/noche');
        
        themeToggle.innerHTML = `
            <div class="theme-toggle-inner">
                <div class="theme-toggle-switch"></div>
            </div>
        `;
        
        // Buscar donde insertar
        const nav = document.querySelector('nav');
        if (nav) {
            nav.appendChild(themeToggle);
        } else {
            const header = document.querySelector('header');
            if (header) {
                header.appendChild(themeToggle);
            }
        }
        
        themeToggle.addEventListener('click', toggleTheme);
        applyStoredTheme();
    }
    
    // Función para cambiar el tema
    function toggleTheme() {
        const root = document.documentElement;
        const isLightTheme = root.classList.contains('light-theme');
        const themeToggle = document.querySelector('.theme-toggle');
        
        if (isLightTheme) {
            // Cambiar a tema oscuro
            root.classList.remove('light-theme');
            themeToggle.classList.remove('light');
            localStorage.setItem('theme', 'dark');
        } else {
            // Cambiar a tema claro
            root.classList.add('light-theme');
            themeToggle.classList.add('light');
            localStorage.setItem('theme', 'light');
        }
        
        // Agregar efecto de transición suave
        document.body.style.transition = 'all 0.3s ease';
        setTimeout(() => {
            document.body.style.transition = '';
        }, 300);
    }
    
    // Aplicar tema guardado en localStorage
    function applyStoredTheme() {
        const storedTheme = localStorage.getItem('theme');
        const themeToggle = document.querySelector('.theme-toggle');
        const root = document.documentElement;
        
        if (storedTheme === 'light') {
            root.classList.add('light-theme');
            if (themeToggle) {
                themeToggle.classList.add('light');
            }
        } else {
            root.classList.remove('light-theme');
            if (themeToggle) {
                themeToggle.classList.remove('light');
            }
        }
    }
    
    // Detectar preferencia del sistema
    function detectSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            if (!localStorage.getItem('theme')) {
                document.documentElement.classList.add('light-theme');
                const themeToggle = document.querySelector('.theme-toggle');
                if (themeToggle) {
                    themeToggle.classList.add('light');
                }
            }
        }
    }
    
    // Inicializar
    initializeThemeToggle();
    detectSystemTheme();
    
    // Escuchar cambios en la preferencia del sistema
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', e => {
            if (!localStorage.getItem('theme')) {
                const root = document.documentElement;
                const themeToggle = document.querySelector('.theme-toggle');
                
                if (e.matches) {
                    root.classList.add('light-theme');
                    if (themeToggle) themeToggle.classList.add('light');
                } else {
                    root.classList.remove('light-theme');
                    if (themeToggle) themeToggle.classList.remove('light');
                }
            }
        });
    }
});

// Función global para cambiar tema (puede ser llamada desde otros scripts)
window.setTheme = function(theme) {
    const root = document.documentElement;
    const themeToggle = document.querySelector('.theme-toggle');
    
    if (theme === 'light') {
        root.classList.add('light-theme');
        if (themeToggle) themeToggle.classList.add('light');
        localStorage.setItem('theme', 'light');
    } else {
        root.classList.remove('light-theme');
        if (themeToggle) themeToggle.classList.remove('light');
        localStorage.setItem('theme', 'dark');
    }
};

// Función global para obtener tema actual
window.getCurrentTheme = function() {
    return document.documentElement.classList.contains('light-theme') ? 'light' : 'dark';
};
