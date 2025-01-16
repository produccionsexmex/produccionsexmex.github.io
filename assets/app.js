let deferredPrompt;

// Escucha el evento `beforeinstallprompt`
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // Previene la alerta nativa
    deferredPrompt = e; // Guarda el evento

    // Muestra la alerta de Bootstrap
    const installAlert = document.getElementById('installAlert');
    installAlert.classList.remove('d-none'); // Asegúrate de remover la clase para mostrarla
});

// Manejador del botón "Instalar ahora"
document.getElementById('installBtn').addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt(); // Lanza el cuadro de diálogo de instalación nativo

        const { outcome } = await deferredPrompt.userChoice; // Espera la respuesta del usuario
        if (outcome === 'accepted') {
            console.log('¡Aplicación instalada!');
        } else {
            console.log('Instalación rechazada.');
        }

        deferredPrompt = null; // Limpia el evento después de usarlo

        // Ocultar la alerta de Bootstrap
        const installAlert = document.getElementById('installAlert');
        installAlert.classList.add('d-none');
    }
});

// Opcional: Ocultar la alerta si el usuario la cierra
document.querySelector('.btn-close').addEventListener('click', () => {
    const installAlert = document.getElementById('installAlert');
    installAlert.classList.add('d-none');
});