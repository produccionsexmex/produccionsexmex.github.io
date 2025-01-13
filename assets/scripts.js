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
    return (
      item.nombre.toLowerCase().includes(query) ||
      item.categoria.toLowerCase().includes(query) ||
      item.subcategoria.toLowerCase().includes(query) ||
      item.tags.some(tag => tag.toLowerCase().includes(query))
    );
  });

  displayItems(filteredItems);
}

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

function displayColorsNav(filteredItems) {
  // Limpia el contenido actual del menú de colores
  subcategoriesList.innerHTML = '';

  // Obtén una lista única de colores
  const colors = [...new Set(filteredItems.map(item => item.color))];

  // Si hay colores, genera los elementos dinámicos
  if (colors.length > 0) {
    subcategoriesList.innerHTML = colors
      .map(color => `
        <li class="nav-item">
          <a class="nav-link" href="#" onclick="filterByColor('${color}')">${color}</a>
        </li>
      `)
      .join("");
  }
}

function filterByColor(color) {
  const filteredItems = items.filter(
    item => item.categoria === currentCategory &&
            item.subcategoria === currentSubcategory &&
            item.color === color
  );

  // Actualiza los ítems mostrados y el encabezado
  if (filteredItems.length > 0) {
    displayItems(filteredItems);
    currentCategoryHeading.textContent = `${currentCategory} > ${currentSubcategory} > ${color}`;
  } else {
    itemsContainer.innerHTML = '<p class="text-muted">No hay ítems disponibles para este color.</p>';
  }
}

function filterBySubcategory(subcategory) {
  // Actualiza el encabezado con la categoría y subcategoría
  currentCategoryHeading.textContent = `${currentCategory} > ${subcategory}`;
  currentSubcategory = subcategory; // Guarda la subcategoría actual

  // Filtra los ítems según la categoría y subcategoría
  const filteredItems = items.filter(
    item => item.categoria === currentCategory && item.subcategoria === subcategory
  );

  // Muestra los ítems filtrados
  if (filteredItems.length > 0) {
    displayItems(filteredItems); // Muestra los ítems de la subcategoría

    // Si la categoría es "Calzado", muestra el menú de tallas
    if (currentCategory === 'Calzado') {
      displaySizesNav(filteredItems); // Muestra tallas si es Calzado
    } else {
      sizesNav.style.display = 'none'; // Oculta el menú de tallas si no es Calzado
    }

    // Muestra el menú de colores (si la subcategoría tiene colores)
    displayColorsNav(filteredItems);
  } else {
    itemsContainer.innerHTML = '<p class="text-muted">No hay ítems disponibles para esta subcategoría.</p>';
    subcategoriesNav.innerHTML = ''; // Limpia el menú de colores si no hay ítems
  }
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
      displayColorsNav(filteredItems); // Muestra el menú de colores si aplica
    } else {
      itemsContainer.innerHTML = '<p class="text-muted">No hay ítems disponibles para esta subcategoría.</p>';
      subcategoriesNav.innerHTML = ''; // Limpia el menú de colores si no hay ítems
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
