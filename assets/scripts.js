document.addEventListener("DOMContentLoaded", () => {
    const content = document.getElementById("content");
    const navLinks = document.querySelectorAll(".nav-link");
    const navbarCollapse = document.querySelector(".navbar-collapse"); // El contenedor del menú colapsable
  
    fetch("data/catalog.json")
      .then(response => response.json())
      .then(data => {
        navLinks.forEach(link => {
          link.addEventListener("click", event => {
            event.preventDefault();
            const category = link.getAttribute("data-category");
            const filteredItems = data.filter(item => item.categoria === category);
            displayCategory(filteredItems);
  
            // Cerrar el menú después de seleccionar una categoría
            if (navbarCollapse.classList.contains("show")) {
              const bootstrapCollapse = new bootstrap.Collapse(navbarCollapse);
              bootstrapCollapse.hide();
            }
          });
        });
      });
  
    function displayCategory(items) {
      content.innerHTML = items
        .map(
          item => `
          <div class="col-12 col-3 col-md-4 col-lg-4 mb-4">
            <div class="card h-100">
              <img src="${item.imagen}" class="card-img-top" alt="${item.nombre}">
              <div class="card-body">
                <h5 class="card-title">${item.nombre}</h5>
                ${item.medidas ? `<p>Medidas: ${item.medidas.join(", ")}</p>` : ""}
              </div>
            </div>
          </div>`
        )
        .join("");
    }
  });
  