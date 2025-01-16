// Verificar si la PWA ya está instalada
function isPWAInstalled() {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
}

// Mostrar alerta de instalación personalizada
function showInstallAlert(platform) {
    const installAlert = document.getElementById('installAlert');
    const installInstructions = document.getElementById('installInstructions');

    // Personalizar instrucciones según la plataforma
    if (platform === 'ios') {
        installInstructions.textContent = 'Pulsa el botón "Compartir" y selecciona "Añadir a pantalla de inicio".';
    } else if (platform === 'android') {
        installInstructions.textContent = 'Pulsa "Añadir a pantalla de inicio" en tu navegador.';
    }

    // Mostrar alerta si no está instalada y no fue descartada antes
    if (!isPWAInstalled() && !localStorage.getItem('pwaDismissed')) {
        installAlert.classList.remove('d-none');

        // Manejar cierre manual de la alerta
        const closeBtn = installAlert.querySelector('.btn-close');
        closeBtn.addEventListener('click', () => {
            localStorage.setItem('pwaDismissed', 'true');
            installAlert.classList.add('d-none');
        });
    }
}

// Detectar evento `beforeinstallprompt` para Android
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // Evitar el diálogo automático
    deferredPrompt = e; // Guardar el evento para usarlo más tarde

    showInstallAlert('android');

    // Agregar funcionalidad al botón de instalación (si lo tienes)
    const installAlert = document.getElementById('installAlert');
    installAlert.addEventListener('click', () => {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('PWA instalada');
                installAlert.classList.add('d-none');
            } else {
                console.log('El usuario canceló la instalación');
            }
            deferredPrompt = null;
        });
    });
});

// Detectar si estamos en iOS
const isIos = () => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(userAgent);
};

// Detectar si estamos en Safari en iOS
const isInStandaloneMode = () => 'standalone' in window.navigator && window.navigator.standalone;

// Mostrar alerta según la plataforma
if (!isPWAInstalled()) {
    if (isIos() && !isInStandaloneMode()) {
        showInstallAlert('ios');
    }
}