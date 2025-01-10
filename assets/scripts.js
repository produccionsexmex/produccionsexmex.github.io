document.addEventListener("DOMContentLoaded", () => {
    const content = document.getElementById("content");
    const navLinks = document.querySelectorAll(".nav-link");
  
    fetch("data/catalogo.json")
      .then(response => response.json())
      .then(data => {
        navLinks.forEach(link => {
          link.addEventListener("click", event => {
            event.preventDefault();
            navLinks.forEach(link => link.classList.remove("active"));
            link.classList.add("active");
  
            const category = link.getAttribute("data-category");
            const filteredItems = data.filter(item => item.categoria === category);
            displayCategory(category, filteredItems);
          });
        });
      });
  
    function displayCategory(category, items) {
      content.innerHTML = `<h2 class="text-center mb-4">${category}</h2>`;
      const subcategories = groupBySubcategory(items);
      for (const [subcategory, subitems] of Object.entries(subcategories)) {
        content.innerHTML += `
          <h3>${subcategory}</h3>
          <div class="row g-4">
            ${subitems
              .map(item => `
                <div class="col-md-4 col-lg-3">
                  <div class="card h-100">
                    <img src="${item.imagen}" class="card-img-top" alt="${item.nombre}">
                    <div class="card-body">
                      <h5 class="card-title">${item.nombre}</h5>
                      ${item.medidas ? `<p class="card-text">Medidas: ${item.medidas.join(", ")}</p>` : ""}
                    </div>
                  </div>
                </div>
              `)
              .join("")}
          </div>
        `;
      }
    }
  
    function groupBySubcategory(items) {
      return items.reduce((acc, item) => {
        const subcategory = item.subcategoria || "Otros";
        if (!acc[subcategory]) acc[subcategory] = [];
        acc[subcategory].push(item);
        return acc;
      }, {});
    }
  });
  