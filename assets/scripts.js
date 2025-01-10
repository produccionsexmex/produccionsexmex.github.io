document.addEventListener("DOMContentLoaded", () => {
    const catalog = document.getElementById("catalog");
    const searchInput = document.getElementById("search");
  
    fetch("data/vestuarios.json")
      .then(response => response.json())
      .then(data => {
        displayCatalog(data);
  
        searchInput.addEventListener("input", () => {
          const searchTerm = searchInput.value.toLowerCase();
          const filtered = data.filter(item =>
            item.nombre.toLowerCase().includes(searchTerm) ||
            item.categoria.toLowerCase().includes(searchTerm)
          );
          displayCatalog(filtered);
        });
      });
  
    function displayCatalog(items) {
      catalog.innerHTML = "";
      items.forEach(item => {
        const card = `
          <div class="col-md-4 col-lg-3">
            <div class="card h-100">
              <img src="${item.imagen}" class="card-img-top" alt="${item.nombre}">
              <div class="card-body">
                <h5 class="card-title">${item.nombre}</h5>
                <p class="card-text text-muted">${item.categoria}</p>
              </div>
            </div>
          </div>
        `;
        catalog.insertAdjacentHTML("beforeend", card);
      });
    }
  });
  