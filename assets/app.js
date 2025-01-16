let deferredPrompt; // Variable para guardar el evento de instalación

// Detectar cuando la PWA es elegible para ser instalada
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevenir que se muestre el prompt automáticamente
  e.preventDefault();
  // Guardar el evento para dispararlo más tarde
  deferredPrompt = e;

  // Mostrar un mensaje o alerta
  alert('¡Puedes instalar esta aplicación en tu dispositivo!');

  // Opcional: Mostrar un botón para que el usuario pueda hacer clic para instalar la app
  const installButton = document.getElementById('install-btn');
  if (installButton) {
    installButton.style.display = 'block'; // Muestra el botón de instalación
  }
});

// Escuchar cuando el usuario haga clic en el botón de instalación
const installButton = document.getElementById('install-btn');
installButton?.addEventListener('click', () => {
  // Mostrar el prompt de instalación
  deferredPrompt.prompt();

  // Esperar a que el usuario responda
  deferredPrompt.userChoice
    .then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('El usuario aceptó la instalación');
      } else {
        console.log('El usuario rechazó la instalación');
      }
      deferredPrompt = null; // Restablecer el evento
    });
});