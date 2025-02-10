// Variables globales
const itemsContainer = document.getElementById("itemsContainer");
const subcategoriesNav = document.getElementById("subcategoriesNav");
const sizesNav = document.getElementById("sizesNav");
const searchBar = document.getElementById("searchBar");
const subcategoriesList = document.getElementById("subcategoriesList");
const sizesList = document.getElementById("sizesList");
const currentCategoryHeading = document.getElementById('currentCategory');

let items = [];
let currentCategory = '';
let currentSubcategory = '';

// Estructura para agrupar subcategorías dentro de dropdowns
const categoryMappings = {
    "Vestuario de mujer": {
        "Vestidos": ["Vestidos largos", "Brillosos", "Putivestidos"],
        "Calzado": ["Zapatos", "Botas", "Botines"],
        "Faldas": ["Faldas largas", "Faldas cortas"],
        "Playeras": ["Playeras", "Blusas Básicas", "Tops", "Blusas Manga Larga", "Leotardos"],
        "Disfraces": ["Disfraces", "Juego Del Calamar"],
        "Deportivos": ["Deportivos"]
    },
    "Vestuario de hombre": {
        "Disfraces": ["Disfraces"],
    },
    "Decoración": {
        "Jarrones": ["Jarrones"],
        "Lamparas y Macetas": ["Lamparas y macetas"],
    }
};

// Cargar ítems desde el JSON
async function loadItems() {
    try {
        const response = await fetch('data/catalog.json');
        items = await response.json();
        console.log('Ítems cargados correctamente');
    } catch (error) {
        console.error('Error al cargar los ítems:', error);
    }
}

// Mostrar ítems filtrados
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
                <div class="col-xl-3 col-lg-4 col-sm-6 col-12 mb-4">
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

// Función para mostrar las subcategorías y manejar las variaciones (por ejemplo, colores)
function displaySubcategories(category) {
    currentCategory = category;
    subcategoriesList.innerHTML = '';  // Limpiar los ítems previos

    if (categoryMappings[category]) {
        Object.keys(categoryMappings[category]).forEach(mainSubcategory => {
            const subcategories = categoryMappings[category][mainSubcategory];

            if (subcategories.length === 1 && !Array.isArray(subcategories[0])) {
                // Si la subcategoría tiene solo un ítem, mostrarla como un enlace
                const subcategory = subcategories[0];
                subcategoriesList.innerHTML += `
                    <li class="nav-item">
                        <a class="nav-link" href="#" onclick="handleSubcategoryClick('${subcategory}')">${subcategory}</a>
                    </li>
                `;
            } else if (subcategories.length === 1 && Array.isArray(subcategories[0])) {
                // Si tiene una variación (como colores), mostrar cada variación como un enlace
                const variations = subcategories[0];
                variations.forEach(variation => {
                    subcategoriesList.innerHTML += `
                        <li class="nav-item">
                            <a class="nav-link" href="#" onclick="handleSubcategoryClick('${mainSubcategory} - ${variation}')">${variation}</a>
                        </li>
                    `;
                });
            } else {
                // Si tiene más de un ítem, mostrar un dropdown para esas subcategorías
                let dropdownHTML = `
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" id="${mainSubcategory}-dropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            ${mainSubcategory}
                        </a>
                        <ul class="dropdown-menu" aria-labelledby="${mainSubcategory}-dropdown">
                            ${subcategories.map(sub => `<li><a class="dropdown-item" href="#" onclick="handleSubcategoryClick('${sub}')">${sub}</a></li>`).join("")}
                        </ul>
                    </li>
                `;
                subcategoriesList.innerHTML += dropdownHTML;
            }
        });
    }

    currentCategoryHeading.textContent = category;
    itemsContainer.innerHTML = '<p class="text-muted">Selecciona una subcategoría para ver los ítems.</p>';
    sizesNav.style.display = 'none';
}

// Manejar el clic en una subcategoría
function handleSubcategoryClick(subcategory) {
    currentSubcategory = subcategory;
    currentCategoryHeading.textContent = `${currentCategory} > ${subcategory}`;

    // Filtrar los ítems según la categoría y la subcategoría seleccionada
    const filteredItems = items.filter(item => 
        item.categoria === currentCategory && item.subcategoria === subcategory
    );

    displayItems(filteredItems);

    // Si la subcategoría es "Zapatos" (o cualquier otra que tenga tallas), mostrar las tallas
    if (subcategory.toLowerCase() === 'zapatos', 'botas', 'botines') {
        displaySizes(subcategory);
    } else {
        sizesNav.style.display = 'none';
    }

    // Si la subcategoría es "Jarrones", mostrar los colores
    if (subcategory.toLowerCase() === 'jarrones') {
        displayColors(subcategory);
    } else {
        sizesNav.style.display = 'none';
    }
}

// Mostrar items por color
function displayColors(subcategory) {
    // Filtrar solo los jarrones que tienen colores definidos
    const itemsInSubcategory = items.filter(item => 
        item.categoria === currentCategory && 
        item.subcategoria === subcategory && 
        item.color?.length > 0
    );

    if (itemsInSubcategory.length > 0) {
        sizesNav.classList.remove("d-none");
        sizesNav.style.display = "block";

        // Obtener la lista de colores únicos
        const colors = [...new Set(itemsInSubcategory.flatMap(item => item.color))].sort();

        // Mostrar botones de colores
        sizesList.innerHTML = colors.map(color => `
            <li class="nav-item me-2 mb-2">
                <a class="btn btn-outline-primary" href="#" onclick="filterByColor('${color}')">${color}</a>
            </li>
        `).join("");
    } else {
        sizesNav.style.display = 'none';
        sizesList.innerHTML = "";
    }
}

function filterByColor(color) {
    const filteredItems = items.filter(item => 
        item.categoria === currentCategory &&
        item.subcategoria === currentSubcategory &&
        item.color?.includes(color)
    );

    displayItems(filteredItems);
}

// Mostrar tallas para una subcategoría específica
function displaySizes(subcategory) {
    // Filtrar solo los ítems de la categoría y subcategoría actual
    const itemsInSubcategory = items.filter(item => 
        item.categoria === currentCategory && 
        item.subcategoria === subcategory && 
        item.medidas?.length > 0
    );

    if (itemsInSubcategory.length > 0) {
        sizesNav.classList.remove("d-none");
        sizesNav.style.display = "block";

        // Obtener solo las medidas de los ítems dentro de la categoría y subcategoría actual
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
    const filteredItems = items.filter(item => 
        item.categoria === currentCategory &&
        item.subcategoria === currentSubcategory &&
        item.medidas?.includes(size)
    );

    displayItems(filteredItems);
}

function handleCategoryClick(category) {
    const navbarCollapse = document.getElementById('navbarNav');
    const bsCollapse = new bootstrap.Collapse(navbarCollapse, { toggle: false });
    bsCollapse.hide();

    displaySubcategories(category);  // Esto ahora manejará cualquier categoría
}

// Eventos
searchBar.addEventListener("input", filterItems);

document.querySelectorAll('.nav-link[data-category]').forEach(link => {
    link.addEventListener('click', event => {
        const category = event.target.getAttribute('data-category');
        handleCategoryClick(category);
    });
});

// Inicialización
loadItems();