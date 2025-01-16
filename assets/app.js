let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  // Evita que el navegador muestre el banner por defecto
  e.preventDefault();
  deferredPrompt = e;

  // Muestra un botón o enlace para que el usuario lo active
  const installButton = document.getElementById('install-button');
  installButton.style.display = 'block';

  // Cuando el usuario haga clic en el botón
  installButton.addEventListener('click', () => {
    // Muestra el cuadro de instalación
    deferredPrompt.prompt();

    // Espera la respuesta del usuario
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('El usuario añadió la PWA a la pantalla de inicio');
      } else {
        console.log('El usuario no añadió la PWA');
      }
      deferredPrompt = null;
    });
  });
});