let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevenir que el navegador muestre el cuadro de diálogo de instalación por defecto
    e.preventDefault();

    // Guardar el evento para usarlo más tarde
    deferredPrompt = e;

    // Mostrar la alerta de Bootstrap
    const installAlert = document.getElementById('installAlert');
    installAlert.classList.remove('d-none');
});

// Maneja el clic en el botón de instalación
const installBtn = document.getElementById('installBtn');
installBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt(); // Mostrar el cuadro de diálogo de instalación nativo

        const { outcome } = await deferredPrompt.userChoice; // Esperar la respuesta del usuario
        if (outcome === 'accepted') {
            console.log('¡Aplicación instalada!');
        } else {
            console.log('El usuario rechazó la instalación.');
        }

        // Limpia el evento después de usarlo
        deferredPrompt = null;
    }

    // Ocultar la alerta de instalación
    const installAlert = document.getElementById('installAlert');
    installAlert.classList.add('d-none');
});