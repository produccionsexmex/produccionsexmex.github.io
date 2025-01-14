// Variables de los elementos
const itemsContainer = document.getElementById("itemsContainer");
const subcategoriesNav = document.getElementById("subcategoriesNav");
const sizesNav = document.getElementById("sizesNav"); // Contenedor para las tallas
const searchBar = document.getElementById("searchBar");
const subcategoriesList = document.getElementById("subcategoriesList");
const sizesList = document.getElementById("sizesList"); // Lista de tallas

let items = []; // Array donde almacenamos los ítems cargados
let currentCategory = ''; // Para saber qué categoría estamos viendo actualmente
let currentSubcategory = ''; // Para saber qué subcategoría estamos viendo actualmente

async function loadItems() {
    try {
      const response = await fetch('data/catalog.json'); // Cambia la ruta a tu archivo JSON
      items = await response.json();
  
      // No llamamos a `displayItems` al inicio para evitar mostrar ítems de forma predeterminada
      console.log('Ítems cargados correctamente');
    } catch (error) {
      console.error('Error al cargar los ítems:', error);
    }
  }
  

// Función para mostrar los ítems en la página
function displayItems(items) {
  itemsContainer.innerHTML = items
    .map(item => {
      const displayName = item.nombre ? item.nombre : "";
      const tags = item.tags ? 
        item.tags.map(tag => `<span class="badge bg-primary me-1">${tag}</span>`).join("") 
        : "";

      return `
        <div class="col-lg-4 col-sm-6 col-12 mb-4">
          <div class="card h-100">
            <img src="${item.imagen}" class="card-img-top" alt="${displayName}">
            <div class="card-body">
              ${displayName ? `<h5 class="card-title">${displayName}</h5>` : ""}
              ${item.medidas ? `<p>Medidas: ${item.medidas.join(", ")}</p>` : ""}
              ${tags ? `<div class="mt-2">${tags}</div>` : ""}
            </div>
          </div>
        </div>`;
    })
    .join("");
}

// Función para filtrar los ítems basados en el texto de búsqueda
function filterItems() {
  const query = searchBar.value.toLowerCase();

  const filteredItems = items.filter(item => {
      // Realizamos la búsqueda en nombre, categoría, subcategoría, tags y color
      return (
          (item.nombre && item.nombre.toLowerCase().includes(query)) || // Busca en nombre
          (item.categoria && item.categoria.toLowerCase().includes(query)) || // Busca en categoría
          (item.subcategoria && item.subcategoria.toLowerCase().includes(query)) || // Busca en subcategoría
          (item.tags && item.tags.some(tag => tag.toLowerCase().includes(query))) || // Busca en tags
          (item.color && item.color.toLowerCase().includes(query)) // Busca en color
      );
  });

  displayItems(filteredItems); // Muestra los ítems filtrados
}

// Función para filtrar los ítems basados en el texto de búsqueda
function filterItems() {
  const query = searchBar.value.toLowerCase().trim();
  
  // Divide la búsqueda en palabras clave
  const keywords = query.split(/\s+/);

  // Filtra los ítems
  const filteredItems = items.filter(item => {
    // Une todos los datos relevantes del ítem en un solo string
    const itemData = [
      item.nombre?.toLowerCase() || '',
      item.categoria?.toLowerCase() || '',
      item.subcategoria?.toLowerCase() || '',
      ...(item.tags ? item.tags.map(tag => tag.toLowerCase()) : [])
    ].join(' ');

    // Verifica que todas las palabras clave estén presentes en el string
    return keywords.every(keyword => itemData.includes(keyword));
  });

  // Muestra los ítems filtrados
  if (filteredItems.length > 0) {
    displayItems(filteredItems);
  } else if (query) {
    itemsContainer.innerHTML = '<p class="text-muted">No se encontraron resultados para esta búsqueda.</p>';
  } else {
    itemsContainer.innerHTML = ''; // Limpia los ítems si no hay búsqueda
  }
}

// Función para mostrar los ítems en la página
function displayItems(items) {
  if (items.length === 0) {
      itemsContainer.innerHTML = '<p class="text-muted">No hay ítems disponibles para esta búsqueda.</p>';
  } else {
      itemsContainer.innerHTML = items
          .map(item => {
              const displayName = item.nombre ? item.nombre : "";
              const tags = item.tags ?
                  item.tags.map(tag => `<span class="badge bg-primary me-1">${tag}</span>`).join("")
                  : "";

              return `
              <div class="col-lg-4 col-sm-6 col-12 mb-4">
                  <div class="card h-100">
                      <img src="${item.imagen}" class="card-img-top" alt="${displayName}">
                      <div class="card-body">
                          ${displayName ? `<h5 class="card-title">${displayName}</h5>` : ""}
                          ${item.medidas ? `<p>Medidas: ${item.medidas.join(", ")}</p>` : ""}
                          ${tags ? `<div class="mt-2">${tags}</div>` : ""}
                      </div>
                  </div>
              </div>`;
          })
          .join("");
  }
}

// Evento de búsqueda
searchBar.addEventListener("input", filterItems); // Filtra mientras se escribe

// Función para filtrar ítems por subcategoría
function filterBySubcategory(subcategory) {
  currentSubcategory = subcategory; // Guarda la subcategoría seleccionada
  const filteredItems = items.filter(item => item.subcategoria === subcategory);
  displayItems(filteredItems);
  displaySizes(subcategory); // Muestra las tallas disponibles para esta subcategoría
}

// Función para filtrar ítems por talla
function filterBySize(size) {
  const filteredItems = items.filter(item => item.medidas && item.medidas.includes(size));
  displayItems(filteredItems);
}

// Función para mostrar las subcategorías de una categoría
function displaySubcategories(category) {
  currentCategory = category;
  const subcategories = [...new Set(items.filter(item => item.categoria === category).map(item => item.subcategoria))];
  subcategoriesList.innerHTML = subcategories
    .map(subcategory => `
      <li class="nav-item">
        <a class="nav-link" href="#" onclick="filterBySubcategory('${subcategory}')">${subcategory}</a>
      </li>`)
    .join("");
}

function displayColors(subcategory) {
  const colors = [...new Set(items
    .filter(item => item.subcategoria === subcategory)
    .map(item => item.color)
  )];

  subcategoriesNav.innerHTML = colors
    .map(color => `
      <li class="nav-item">
        <a class="nav-link" href="#" onclick="filterByColor('${color}')">${color}</a>
      </li>`)
    .join("");
}

function filterByColor(color) {
  const filteredItems = items.filter(item => item.color === color);
  displayItems(filteredItems);
}

function filterBySubcategory(subcategory) {
  const filteredItems = items.filter(item => item.subcategoria === subcategory);
  displayItems(filteredItems);
  displayColors(subcategory); // Muestra los colores disponibles
}

// Función para mostrar las tallas disponibles en una subcategoría
function displaySizes(subcategory) {
  // Filtra los ítems de la subcategoría de calzado
  const itemsInSubcategory = items.filter(item => item.subcategoria === subcategory && item.medidas);

  if (itemsInSubcategory.length > 0) {
    sizesNav.style.display = 'block'; // Muestra el menú de tallas si hay productos con medidas
  } else {
    sizesNav.style.display = 'none'; // Oculta el menú si no hay productos con tallas
  }

  // Obtén todas las tallas disponibles, asegurando que sean únicas
  const sizes = [...new Set(itemsInSubcategory.flatMap(item => item.medidas))].sort((a, b) => {
    // Ordena las tallas de menor a mayor, tratando las fracciones como cadenas
    return a.localeCompare(b);
  });
  
  // Mostrar las tallas en el menú
  sizesList.innerHTML = sizes
    .map(size => `
      <li class="nav-item me-2 mb-2">
        <a class="btn btn-outline-primary" href="#" onclick="filterBySize('${size}')">${size}</a>
      </li>`)
    .join("");
}

// Variables de los elementos
const currentCategoryHeading = document.getElementById('currentCategory');

function handleCategoryClick(category) {
    // Cerrar el menú de Bootstrap
    const navbarCollapse = document.getElementById('navbarNav');
    const bsCollapse = new bootstrap.Collapse(navbarCollapse, { toggle: false });
    bsCollapse.hide(); // Oculta el menú
  
    // Actualiza el encabezado con la categoría seleccionada
    currentCategory = category;
    currentCategoryHeading.textContent = category;
  
    // Muestra las subcategorías de la categoría seleccionada
    displaySubcategories(category);
  
    // Limpia los ítems mostrados inicialmente al cambiar de categoría
    itemsContainer.innerHTML = '<p class="text-muted">Selecciona una subcategoría para ver los ítems.</p>';
  
    // Oculta el menú de tallas por defecto
    sizesNav.style.display = 'none';
  }
  
  

  function filterBySubcategory(subcategory) {
    // Actualiza el encabezado con la categoría y la subcategoría
    currentCategoryHeading.textContent = `${currentCategory} > ${subcategory}`;
  
    // Filtra los ítems considerando la categoría actual y la subcategoría seleccionada
    const filteredItems = items.filter(
      item => item.categoria === currentCategory && item.subcategoria === subcategory
    );
  
    // Muestra los ítems filtrados si existen
    if (filteredItems.length > 0) {
      displayItems(filteredItems);
    } else {
      itemsContainer.innerHTML = '<p class="text-muted">No hay ítems disponibles para esta subcategoría.</p>';
    }
  
    // Si la categoría es "Calzado", muestra el menú de tallas
    if (currentCategory === 'Calzado') {
      displaySizesNav(filteredItems);
    } else {
      sizesNav.style.display = 'none';
    }
  }
  
  

  

// Eventos
searchBar.addEventListener("input", filterItems); // Filtra mientras se escribe

// Manejo de clics en las categorías principales
document.querySelectorAll('.nav-link[data-category]').forEach(link => {
  link.addEventListener('click', (event) => {
    const category = event.target.getAttribute('data-category');
    handleCategoryClick(category);
  });
});

// Cargar ítems al inicio
loadItems();
