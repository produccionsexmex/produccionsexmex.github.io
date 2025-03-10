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

// Mapeo de subcategorías dentro de dropdowns
const categoryMappings = {
    "Vestuario de mujer": {
        "Vestidos": ["Vestidos largos", "Brillosos", "Putivestidos", "Mamelucos y Enterizos"],
        "Calzado": ["Zapatos", "Botas", "Botas Vaqueras", "Botines"],
        "Faldas": ["Faldas largas", "Faldas cortas"],
        "Playeras": ["Playeras", "Blusas Básicas", "Tops", "Blusas Manga Larga", "Leotardos"],
        "Disfraces": ["Disfraces", "Juego Del Calamar"],
        "Deportivos": [],
        "Utilería": [],
    },
    "Vestuario de hombre": {
        "Disfraces": [],
        "Utilería": [],
    },
    "Sado": {
        "Utilería": [],
    },
    "Decoración": {
        "Jarrones": [],
        "Lámparas y Macetas": [],
        "Lámparas": [],
        "Plantas": [],
        "Utilería": [],
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

function toTitleCase(str) {
    return str
        .toLowerCase()
        .replace(/(^|\s)([a-záéíóúñü])/g, (match) => match.toUpperCase());
}


// Mostrar ítems filtrados
function displayItems(filteredItems) {
    if (filteredItems.length === 0) {
        itemsContainer.innerHTML = '<p class="text-muted">No hay ítems disponibles para esta búsqueda.</p>';
    } else {
        itemsContainer.innerHTML = filteredItems.map(item => {
            const displayName = item.nombre ? toTitleCase(item.nombre) : '';
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
            item.tipo?.toLowerCase() || '',
            ...(item.tags ? item.tags.map(tag => tag.toLowerCase()) : [])
        ].join(' ');

        return keywords.every(keyword => itemData.includes(keyword));
    });

    displayItems(filteredItems);
}

// Activar categoría
function setActiveCategory(category) {
    document.querySelectorAll('.nav-link[data-category]').forEach(link => link.classList.remove('active'));
    const categoryLink = document.querySelector(`.nav-link[data-category="${category}"]`);
    if (categoryLink) categoryLink.classList.add('active');
}

// Activar subcategoría
function setActiveSubcategory(subcategory) {
    document.querySelectorAll('.nav-link[data-subcategory]').forEach(link => link.classList.remove('active'));
    const subcategoryLink = document.querySelector(`.nav-link[data-subcategory="${subcategory}"]`);
    if (subcategoryLink) subcategoryLink.classList.add('active');
}

// Activar filtro
function setActiveFilter(filter) {
    document.querySelectorAll('.btn-filter').forEach(btn => btn.classList.remove('active'));
    const filterButton = document.querySelector(`.btn-filter[data-filter="${filter}"]`);
    if (filterButton) filterButton.classList.add('active');
}


// Mostrar las subcategorías
function displaySubcategories(category) {
    console.log("Mostrando subcategorías para:", category);
    currentCategory = category;
    subcategoriesList.innerHTML = '';

    if (categoryMappings[category]) {
        Object.keys(categoryMappings[category]).forEach(mainSubcategory => {
            const subcategories = categoryMappings[category][mainSubcategory];

            if (subcategories.length > 0) {
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
            } else {
                subcategoriesList.innerHTML += `
                    <li class="nav-item">
                        <a class="nav-link" href="#" onclick="handleSubcategoryClick('${mainSubcategory}')">${mainSubcategory}</a>
                    </li>
                `;
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

    const filteredItems = items.filter(item =>
        item.categoria.trim().toLowerCase() === currentCategory.trim().toLowerCase() &&
        item.subcategoria.trim().toLowerCase() === subcategory.trim().toLowerCase()
    );

    const calzadoSubcategorias = ["Zapatos", "Botas", "Botas Vaqueras", "Botines"];

    console.log(`Filtrando categoría: ${currentCategory}, subcategoría: ${subcategory}`);
    console.log("Ítems encontrados:", filteredItems);

    displayItems(filteredItems);

    // 🚨 Separamos las condiciones para que se ejecuten todas correctamente
    if (subcategory.toLowerCase() === 'utilería') {
        displaySubcategoryFilters(subcategory, 'tipo'); // Filtra por tipo en Utilería
    }
    
    if (subcategory.toLowerCase() === 'jarrones') {
        displaySubcategoryFilters(subcategory, 'color'); // Filtra por color en Jarrones
    }
    
    if (subcategory.toLowerCase() === 'plantas') {
        displaySubcategoryFilters(subcategory, 'tipo'); // Filtra por tipo en Plantas
    }

    if (calzadoSubcategorias.includes(subcategory)) {
        displaySizes(filteredItems); // Filtra por medidas en Calzado
    }
}

// Mostrar medidas para Calzado
function displaySizes(filteredItems) {
    const sizes = new Set();

    filteredItems.forEach(item => {
        if (item.medidas) {
            item.medidas.forEach(medida => sizes.add(medida));
        }
    });

    if (sizes.size > 0) {
        sizesNav.classList.remove("d-none");
        sizesNav.style.display = "block";

        sizesList.innerHTML = [...sizes].sort().map(medida => `
            <li class="nav-item me-2 mb-2">
                <a class="btn btn-outline-primary" href="#" onclick="filterBySize('${medida}')">${medida}</a>
            </li>
        `).join("");
    } else {
        sizesNav.style.display = "none";
        sizesList.innerHTML = "";
    }
}

// Filtrar ítems por medida específica
function filterBySize(size) {
    const filteredItems = items.filter(item =>
        item.categoria === currentCategory &&
        item.subcategoria === currentSubcategory &&
        item.medidas?.includes(size)
    );

    displayItems(filteredItems);
}

// Mostrar filtros para medidas en Calzado, tipo en Utilería y color en Jarrones
function displaySubcategoryFilters(subcategory, filterKey) {
    const itemsInSubcategory = items.filter(item =>
        item.categoria.trim().toLowerCase() === currentCategory.trim().toLowerCase() &&
        item.subcategoria.trim().toLowerCase() === subcategory.trim().toLowerCase() &&
        item[filterKey]
    );
    
    console.log(`Filtrando por ${filterKey} en ${currentCategory} > ${subcategory}`);
    console.log("Ítems disponibles para filtro:", itemsInSubcategory);

    if (itemsInSubcategory.length > 0) {
        sizesNav.classList.remove("d-none");
        sizesNav.style.display = "block";

        const filters = [...new Set(itemsInSubcategory.map(item => item[filterKey]))].sort();

        sizesList.innerHTML = filters.map(filterValue => `
            <li class="nav-item me-2 mb-2">
                <a class="btn btn-outline-primary" href="#" onclick="filterBySubcategoryAttribute('${filterKey}', '${filterValue}')">${filterValue}</a>
            </li>
        `).join("");
    } else {
        sizesNav.style.display = 'none';
        sizesList.innerHTML = "";
    }
}

// Filtrar ítems por atributo dinámico (medidas, tipo o color)
function filterBySubcategoryAttribute(attribute, value) {
    const filteredItems = items.filter(item =>
        item.categoria === currentCategory &&
        item.subcategoria === currentSubcategory &&
        item[attribute] === value
    );

    displayItems(filteredItems);
}

// Manejar clic en una categoría
function handleCategoryClick(category) {
    const navbarCollapse = document.getElementById('navbarNav');
    const bsCollapse = new bootstrap.Collapse(navbarCollapse, { toggle: false });
    bsCollapse.hide();

    displaySubcategories(category);
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