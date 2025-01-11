// Variables de los elementos
const itemsContainer = document.getElementById("itemsContainer");
const subcategoriesNav = document.getElementById("subcategoriesNav");
const searchBar = document.getElementById("searchBar");
const subcategoriesList = document.getElementById("subcategoriesList");

let items = []; // Array donde almacenamos los ítems cargados
let currentCategory = ''; // Para saber qué categoría estamos viendo actualmente

// Función para cargar los ítems desde el archivo JSON externo
async function loadItems() {
  try {
    const response = await fetch('data/catalog.json'); // Cambia la ruta a tu archivo JSON
    items = await response.json();
    displayItems(items); // Muestra todos los ítems al cargar
  } catch (error) {
    console.error('Error al cargar los ítems:', error);
  }
}

// Función para mostrar los ítems en la página
function displayItems(items) {
  itemsContainer.innerHTML = items
    .map(item => {
      const displayName = item.nombre ? item.nombre : "";
      return `
        <div class="col-12 col-3 col-md-4 col-lg-4 mb-4">
          <div class="card h-100">
            <img src="${item.imagen}" class="card-img-top" alt="${displayName}">
            ${displayName ? `
              <div class="card-body">
                <h5 class="card-title">${displayName}</h5>
                ${item.medidas ? `<p>Medidas: ${item.medidas.join(", ")}</p>` : ""}
                ${item.tags ? `<p>Tags: ${item.tags.join(", ")}</p>` : ""}
              </div>` : ""}
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
  const filteredItems = items.filter(item => item.subcategoria === subcategory);
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

// Función para manejar la navegación de la categoría principal
function handleCategoryClick(category) {
  displaySubcategories(category);
  const filteredItems = items.filter(item => item.categoria === category);
  displayItems(filteredItems);
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
