// Variables globales
const itemsContainer = document.getElementById("itemsContainer");
const subcategoriesNav = document.getElementById("subcategoriesNav");
const sizesNav = document.getElementById("sizesNav"); // Contenedor para las tallas
const searchBar = document.getElementById("searchBar");
const subcategoriesList = document.getElementById("subcategoriesList");
const sizesList = document.getElementById("sizesList"); // Lista de tallas
const currentCategoryHeading = document.getElementById('currentCategory');

let items = []; // Ítems cargados desde el JSON
let currentCategory = ''; // Categoría actual
let currentSubcategory = ''; // Subcategoría actual

// Cargar ítems desde el archivo JSON
async function loadItems() {
    try {
        const response = await fetch('data/catalog.json');
        items = await response.json();
        console.log('Ítems cargados correctamente');
    } catch (error) {
        console.error('Error al cargar los ítems:', error);
    }
}

// Mostrar los ítems filtrados en la página
function displayItems(filteredItems) {
    if (filteredItems.length === 0) {
        itemsContainer.innerHTML = '<p class="text-muted">No hay ítems disponibles para esta búsqueda.</p>';
    } else {
        itemsContainer.innerHTML = filteredItems.map(item => {
            const displayName = item.nombre || '';
            const tags = item.tags
                ? item.tags.map(tag => `<span class="badge bg-primary me-1">${tag}</span>`).join("")
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
        }).join("");
    }
}

// Filtrar ítems según el texto de búsqueda
function filterItems() {
    const query = searchBar.value.toLowerCase().trim();
    const keywords = query.split(/\s+/);

    const filteredItems = items.filter(item => {
        const itemData = [
            item.nombre?.toLowerCase() || '',
            item.categoria?.toLowerCase() || '',
            item.subcategoria?.toLowerCase() || '',
            ...(item.tags ? item.tags.map(tag => tag.toLowerCase()) : [])
        ].join(' ');

        return keywords.every(keyword => itemData.includes(keyword));
    });

    displayItems(filteredItems);
}

// Mostrar las subcategorías de una categoría
function displaySubcategories(category) {
    currentCategory = category;

    const subcategories = [...new Set(items
        .filter(item => item.categoria === category)
        .map(item => item.subcategoria)
    )];

    subcategoriesList.innerHTML = subcategories.map(subcategory => `
        <li class="nav-item">
            <a class="nav-link" href="#" onclick="handleSubcategoryClick('${subcategory}')">${subcategory}</a>
        </li>
    `).join("");

    currentCategoryHeading.textContent = category;
    itemsContainer.innerHTML = '<p class="text-muted">Selecciona una subcategoría para ver los ítems.</p>';
    sizesNav.style.display = 'none';
}

// Manejar el clic en una subcategoría
function handleSubcategoryClick(subcategory) {
    currentSubcategory = subcategory;
    currentCategoryHeading.textContent = `${currentCategory} > ${subcategory}`;

    const filteredItems = items.filter(item => item.categoria === currentCategory && item.subcategoria === subcategory);

    displayItems(filteredItems);

    if (subcategory.toLowerCase() === 'zapatos') {
        displaySizes(subcategory);
    } else {
        sizesNav.style.display = 'none';
    }
}

// Mostrar tallas para una subcategoría específica
function displaySizes(subcategory) {
    const itemsInSubcategory = items.filter(item => item.subcategoria === subcategory && item.medidas?.length > 0);

    if (itemsInSubcategory.length > 0) {
        sizesNav.classList.remove("d-none");
        sizesNav.style.display = "block";

        const sizes = [...new Set(itemsInSubcategory.flatMap(item => item.medidas))].sort();

        sizesList.innerHTML = sizes.map(size => `
            <li class="nav-item me-2 mb-2">
                <a class="btn btn-outline-primary" href="#" onclick="filterBySize('${size}')">${size}</a>
            </li>
        `).join("");
    } else {
        sizesNav.style.display = 'none';
        sizesList.innerHTML = "";
    }
}

// Filtrar ítems por talla
function filterBySize(size) {
    const filteredItems = items.filter(item => item.medidas?.includes(size));
    displayItems(filteredItems);
}

// Manejar clic en las categorías principales
function handleCategoryClick(category) {
    const navbarCollapse = document.getElementById('navbarNav');
    const bsCollapse = new bootstrap.Collapse(navbarCollapse, { toggle: false });
    bsCollapse.hide();

    displaySubcategories(category);
}

// Eventos
searchBar.addEventListener("input", filterItems); // Búsqueda en tiempo real

document.querySelectorAll('.nav-link[data-category]').forEach(link => {
    link.addEventListener('click', event => {
        const category = event.target.getAttribute('data-category');
        handleCategoryClick(category);
    });
});

// Inicialización
loadItems();
