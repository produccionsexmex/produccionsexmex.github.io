document.addEventListener("DOMContentLoaded", () => {
    const catalog = document.getElementById("catalog");
    const searchInput = document.getElementById("search");
  
    fetch("data/catalog.json")
      .then(response => response.json())
      .then(data => {
        const categories = groupByCategory(data);
        displayCatalog(categories);
  
        searchInput.addEventListener("input", () => {
          const searchTerm = searchInput.value.toLowerCase();
          const filtered = data.filter(item =>
            item.nombre.toLowerCase().includes(searchTerm) ||
            item.categoria.toLowerCase().includes(searchTerm)
          );
          const filteredCategories = groupByCategory(filtered);
          displayCatalog(filteredCategories);
        });
      });
  
    function groupByCategory(items) {
      return items.reduce((acc, item) => {
        if (!acc[item.categoria]) {
          acc[item.categoria] = [];
        }
        acc[item.categoria].push(item);
        return acc;
      }, {});
    }
  
    function displayCatalog(categories) {
      catalog.innerHTML = "";
      for (const [category, items] of Object.entries(categories)) {
        const section = document.createElement("section");
        section.classList.add("mb-5");
        section.innerHTML = `
          <h2 class="text-center mb-4">${category}</h2>
          <div class="row g-4">
            ${items
              .map(item => `
                <div class="col-md-4 col-lg-3">
                  <div class="card h-100">
                    <img src="${item.imagen}" class="card-img-top" alt="${item.nombre}">
                    <div class="card-body">
                      <h5 class="card-title">${item.nombre}</h5>
                    </div>
                  </div>
                </div>
              `)
              .join("")}
          </div>
        `;
        catalog.appendChild(section);
      }
    }
  });
  