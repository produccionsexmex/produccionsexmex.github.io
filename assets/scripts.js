// =========================================================
// 1. VARIABLES GLOBALES Y UTILIDADES
// =========================================================

// Variables globales
const itemsContainer = document.getElementById("itemsContainer");
const subcategoriesNav = document.getElementById("subcategoriesNav");
const sizesNav = document.getElementById("sizesNav");
const searchBar = document.getElementById("searchBar");
const subcategoriesList = document.getElementById("subcategoriesList");
const sizesList = document.getElementById("sizesList");
const currentCategoryHeading = document.getElementById('currentCategory');
const toggleOrderBtn = document.getElementById('toggleOrderBtn');

let items = [];
let currentCategory = '';
let currentSubcategory = '';
let currentMainSubcategory = ''; 
let currentFilterAttribute = ''; 
let currentFilterValue = ''; 
let currentOrder = 'desc'; 

// Mapeo de subcategorías (AJUSTADO: Disfraces vuelve a ser un desplegable con tipos)
const categoryMappings = {
    "Vestuario de mujer": {
        "Vestidos": [
            "Putivestidos",
            "Vestidos largos",
            "Mezclilla",
            "Brillosos cortos",
            "Brillosos largos"],
        "Enterizos":[
            "Normales",
            "Brillosos",
        ],
        "Calzado": ["Zapatillas", "Botas", "Botas Vaqueras", "Botines"],
        "Faldas": ["Faldas cortas", "Mezclilla", "Cortas brillosas", "Faldas largas", "Largas brillosas"],
        "Blusas": [
            "Básicas",
            "De vestir",
            "Manga Larga",
            "Tops",
            "Playeras",
            "Pantiblusas",
        ],
        "Disfraces": [ // 👈 REVERTIDO: Vuelve a ser un desplegable
            "Enfermeras",
            "Sexys",
            "Superheroínas",
            "Personajes",
            "Juego Del Calamar"
        ], 
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

// ... (El resto de funciones auxiliares)

function ordenarItemsPorImagen(array) {
    return [...array].sort((a, b) => {
        const numA = extraerNumeroDeImagen(a.imagen);
        const numB = extraerNumeroDeImagen(b.imagen);
        return currentOrder === 'desc' ? numB - numA : numA - numB;
    });
}

function ordenarPorImagenDesc(a, b) {
    const matchA = a.imagen && a.imagen.match(/(\d+)\.jpg$/i);
    const matchB = b.imagen && b.imagen.match(/(\d+)\.jpg$/i);
    const numA = matchA ? parseInt(matchA[1]) : 0;
    const numB = matchB ? parseInt(matchB[1]) : 0;
    return numB - numA;
}

function extraerNumeroDeImagen(ruta) {
    const match = ruta.match(/(\d+)/); 
    return match ? parseInt(match[1], 10) : 0;
}

function toTitleCase(str) {
    return str
        .toLowerCase()
        .replace(/(^|\s)([a-záéíóúñü])/g, (match) => match.toUpperCase());
}


// -----------------------------------------------------------------------------------------------------------------
// FUNCIÓN DE CARGA INICIAL (SIN SELECCIÓN AUTOMÁTICA)
// -----------------------------------------------------------------------------------------------------------------
async function loadItems() {
  try {
    const response = await fetch('data/catalog.json');
    items = await response.json();

    items = items.sort(ordenarPorImagenDesc);

    // Estado de inicio: limpia y lista para la selección del usuario.
    currentCategory = '';
    currentSubcategory = '';
    currentMainSubcategory = '';
    currentFilterAttribute = '';
    currentFilterValue = '';
    
    // Ocultar listas de subcategorías y filtros
    subcategoriesList.innerHTML = '';
    sizesNav.style.display = 'none';

    // Mostrar mensaje de bienvenida
    currentCategoryHeading.textContent = 'Catálogo General';
    itemsContainer.innerHTML = '<p class="text-muted">Por favor, usa el menú superior para seleccionar una Categoría Principal.</p>';
    
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
    
    // 1. Obtener los ítems base filtrados por la categoría y subcategoría principal (o tipo)
    let baseItems = items;
    if (currentCategory) {
        baseItems = items.filter(item => 
            item.categoria.trim().toLowerCase() === currentCategory.trim().toLowerCase()
        );

        if (currentMainSubcategory) {
            // Filtrar por la subcategoría base (e.g., 'Calzado', 'Disfraces')
            baseItems = baseItems.filter(item => 
                item.subcategoria.trim().toLowerCase() === currentMainSubcategory.trim().toLowerCase()
            );
        }

        if (currentFilterAttribute === 'tipo' && currentFilterValue) {
             // Si hay un filtro de tipo activo (e.g., 'Enfermeras')
            baseItems = baseItems.filter(item => 
                item.tipo && item.tipo.trim().toLowerCase() === currentFilterValue.trim().toLowerCase()
            );
        }
    } else {
        // Búsqueda en todo el catálogo si no hay categoría seleccionada
        baseItems = items;
    }


    // 2. Aplicar filtro de búsqueda de texto
    const filteredItemsBySearch = baseItems.filter(item => {
        const itemData = [
            item.nombre?.toLowerCase() || '',
            item.categoria?.toLowerCase() || '',
            item.subcategoria?.toLowerCase() || '',
            item.tipo?.toLowerCase() || '',
            ...(item.tags ? item.tags.map(tag => tag.toLowerCase()) : [])
        ].join(' ');

        return keywords.every(keyword => itemData.includes(keyword));
    });
    
    // 3. Aplicar filtros dinámicos (medidas/color) si existen, aunque ya no deberían usarse con Disfraces.
    let finalFilteredItems = filteredItemsBySearch;
    if (currentFilterAttribute === 'medidas' && currentFilterValue) {
        finalFilteredItems = filteredItemsBySearch.filter(item => {
            return item.medidas && item.medidas.includes(currentFilterValue);
        });
    } else if (currentFilterAttribute === 'color' && currentFilterValue) {
        finalFilteredItems = filteredItemsBySearch.filter(item => {
            return item.color && item.color.toLowerCase() === currentFilterValue.toLowerCase();
        });
    }

    displayItems(ordenarItemsPorImagen(finalFilteredItems)); 
}


function setActiveFilter(filter) {
    // Esta función no es necesaria para los desplegables, solo para botones.
    document.querySelectorAll('.btn-outline-primary').forEach(btn => btn.classList.remove('active'));
    const filterButton = document.querySelector(`.btn[onclick*="'${filter}'"]`);
    if (filterButton) filterButton.classList.add('active');
}


// Mostrar las subcategorías (Genera enlaces directos o desplegables)
function displaySubcategories(category) {
    currentCategory = category;
    subcategoriesList.innerHTML = '';

    if (categoryMappings[category]) {
        Object.keys(categoryMappings[category]).forEach(mainSubcategory => {
            const subcategories = categoryMappings[category][mainSubcategory];

            if (subcategories.length > 0) {
                // Genera el Dropdown (para Vestidos, Disfraces, etc.)
                let dropdownHTML = `
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" id="${mainSubcategory}-dropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            ${mainSubcategory}
                        </a>
                        <ul class="dropdown-menu" aria-labelledby="${mainSubcategory}-dropdown">
                            ${subcategories.map(sub => 
                                // El clic en el ítem del desplegable llama a handleSubcategoryClick con un indicador de que es un 'tipo'.
                                `<li><a class="dropdown-item" href="#" onclick="handleSubcategoryClick('${sub}', 'type')">${sub}</a></li>` 
                            ).join("")}
                        </ul>
                    </li>
                `;
                subcategoriesList.innerHTML += dropdownHTML;
            } else {
                // Genera el enlace directo (para Deportivos, Utilería, etc.)
                subcategoriesList.innerHTML += `
                    <li class="nav-item">
                        <a class="nav-link" href="#" onclick="handleSubcategoryClick('${mainSubcategory}')">${mainSubcategory}</a>
                    </li>
                `;
            }
        });
    }
    
    // Al cambiar de categoría principal, ocultamos cualquier filtro avanzado
    sizesNav.style.display = 'none';
    currentFilterValue = '';

    currentCategoryHeading.textContent = category;
    itemsContainer.innerHTML = '<p class="text-muted">Selecciona una subcategoría para ver los ítems.</p>';
}


// -----------------------------------------------------------------------------------------------------------------
// FUNCIÓN CLAVE MODIFICADA: Manejar el clic en una subcategoría (o tipo)
// -----------------------------------------------------------------------------------------------------------------
function handleSubcategoryClick(subcategory, isTypeClick = false) {
    // 1. Reiniciar estados de filtro
    currentSubcategory = subcategory; 
    currentMainSubcategory = ''; // Se definirá en base al tipo de clic
    currentFilterAttribute = '';
    currentFilterValue = '';
    
    let filteredItems = [];

    if (isTypeClick) {
        // Caso 2: Clic en un elemento del desplegable (e.g., 'Enfermeras')
        
        let mainSubcategory = '';
        const currentSubcategoryMap = categoryMappings[currentCategory] || {};
        
        // 1. Buscamos la subcategoría principal (clave) que contiene este tipo (valor)
        for (const [key, values] of Object.entries(currentSubcategoryMap)) {
            if (values.includes(subcategory)) { // Si 'Enfermeras' está dentro de ['Enfermeras', 'Sexys', ...]
                mainSubcategory = key; // mainSubcategory = 'Disfraces'
                break;
            }
        }

        currentMainSubcategory = mainSubcategory;
        currentFilterAttribute = 'tipo';
        currentFilterValue = subcategory; // 'Enfermeras'

        // 2. Aplicar el filtro doble: subcategoría principal + el tipo clicqueado
        filteredItems = items.filter(item => 
            item.categoria.trim().toLowerCase() === currentCategory.trim().toLowerCase() &&
            item.subcategoria.trim().toLowerCase() === mainSubcategory.trim().toLowerCase() &&
            item.tipo && item.tipo.trim().toLowerCase() === subcategory.trim().toLowerCase()
        );

        currentCategoryHeading.textContent = `${currentCategory} > ${mainSubcategory} > ${subcategory}`;

    } else {
        // Caso 1: Clic en un enlace directo (e.g., 'Deportivos' o 'Calzado')
        currentMainSubcategory = subcategory;

        // Aplicar el filtro base: solo por subcategoría
        filteredItems = items.filter(item => 
            item.categoria.trim().toLowerCase() === currentCategory.trim().toLowerCase() &&
            item.subcategoria.trim().toLowerCase() === currentMainSubcategory.trim().toLowerCase()
        );

        currentCategoryHeading.textContent = `${currentCategory} > ${subcategory}`;
    }

    displayItems(ordenarItemsPorImagen(filteredItems));

    // Lógica de filtros avanzados (Solo para Calzado o Jarrones)
    sizesNav.style.display = 'none';
    const calzadoSubcategorias = ["Zapatillas", "Botas", "Botas Vaqueras", "Botines"];

    if (calzadoSubcategorias.includes(currentMainSubcategory)) {
        displaySizes(filteredItems);
    } 
    else if (currentMainSubcategory.toLowerCase() === 'jarrones') {
        displaySubcategoryFilters(currentMainSubcategory, 'color');
    } 
    // Si fue un clic de 'tipo' (Disfraces), no hay filtros adicionales.
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
        
        let filterHTML = `<li class="nav-item me-2 mb-2"><a class="btn btn-outline-primary ${currentFilterValue === '' ? 'active' : ''}" href="#" onclick="handleClearFilter('${currentMainSubcategory}')">TODOS</a></li>`;
        
        filterHTML += [...sizes].sort().map(medida => {
            const isActive = currentFilterValue === medida ? 'active' : '';
            return `
                <li class="nav-item me-2 mb-2">
                    <a class="btn btn-outline-primary ${isActive}" href="#" onclick="filterBySubcategoryAttribute('medidas', '${medida}')">${medida}</a>
                </li>
            `;
        }).join("");
        sizesList.innerHTML = filterHTML;
    } else {
        sizesNav.style.display = "none";
        sizesList.innerHTML = "";
    }
}


// Mostrar filtros avanzados (color para Jarrones)
function displaySubcategoryFilters(subcategory, filterKey) {
    const itemsInSubcategory = items.filter(item =>
        item.categoria.trim().toLowerCase() === currentCategory.trim().toLowerCase() &&
        item.subcategoria.trim().toLowerCase() === subcategory.trim().toLowerCase() &&
        item[filterKey]
    );

    let filterHTML = `<li class="nav-item me-2 mb-2"><a class="btn btn-outline-primary ${currentFilterValue === '' ? 'active' : ''}" href="#" onclick="handleClearFilter('${subcategory}')">TODOS</a></li>`;
    
    const filters = [...new Set(itemsInSubcategory.map(item => item[filterKey]))].sort();

    filterHTML += filters.map(filterValue => {
        const isActive = currentFilterValue === filterValue ? 'active' : '';

        return `
            <li class="nav-item me-2 mb-2">
                <a class="btn btn-outline-primary ${isActive}" href="#" onclick="filterBySubcategoryAttribute('${filterKey}', '${filterValue}')">${filterValue}</a>
            </li>
        `;
    }).join("");
    
    if (filters.length > 0) {
        sizesNav.classList.remove("d-none");
        sizesNav.style.display = "block";
        sizesList.innerHTML = filterHTML;
    } else {
        sizesNav.style.display = 'none';
        sizesList.innerHTML = "";
    }
}

// Filtrar ítems por atributo dinámico (medidas o color)
function filterBySubcategoryAttribute(attribute, value) {
    currentFilterAttribute = attribute;
    currentFilterValue = value;
    
    const filteredItems = items.filter(item => {
        const matchesCategory = item.categoria === currentCategory;
        const matchesSubcategory = item.subcategoria === currentMainSubcategory;
        
        if (attribute === 'medidas' && Array.isArray(item.medidas)) {
             return matchesCategory && matchesSubcategory && item.medidas.includes(value);
        } else {
            return matchesCategory && matchesSubcategory && item[attribute] === value;
        }
    });
    
    currentCategoryHeading.textContent = `${currentCategory} > ${currentMainSubcategory} > ${toTitleCase(value)}`;
    
    displayItems(ordenarItemsPorImagen(filteredItems)); 
    setActiveFilter(value);
}

// Limpiar filtro de Medida/Color (llamada por el botón 'TODOS')
function handleClearFilter(mainSubcategory) {
    currentFilterAttribute = '';
    currentFilterValue = '';
    
    // Simplemente volvemos a llamar a handleSubcategoryClick para cargar solo la subcategoría base
    handleSubcategoryClick(mainSubcategory, false);
}


// Manejar clic en una categoría
function handleCategoryClick(category) {
    const navbarCollapse = document.getElementById('navbarNav');
    const bsCollapse = new bootstrap.Collapse(navbarCollapse, { toggle: false });
    bsCollapse.hide();
    
    // Activa la clase 'active' en la navbar
    document.querySelectorAll('.nav-link[data-category]').forEach(link => link.classList.remove('active'));
    const categoryLink = document.querySelector(`.nav-link[data-category="${category}"]`);
    if (categoryLink) categoryLink.classList.add('active');

    displaySubcategories(category);
}

// Eventos
searchBar.addEventListener("input", filterItems);
document.querySelectorAll('.nav-link[data-category]').forEach(link => {
    link.addEventListener('click', event => {
        event.preventDefault(); 
        const category = event.target.getAttribute('data-category');
        handleCategoryClick(category);
    });
});

//Toggle btn
document.getElementById('toggleOrderBtn').addEventListener('click', () => {
    currentOrder = currentOrder === 'desc' ? 'asc' : 'desc';
    document.getElementById('toggleOrderBtn').textContent = 
        currentOrder === 'desc' ? 'Orden: Más nuevo' : 'Orden: Más viejo';

    // Si hay una subcategoría o tipo seleccionado, recargar para reordenar
    if (currentSubcategory) {
         // Si hay un filtro de tipo activo, lo recargamos
        if (currentFilterAttribute === 'tipo') {
            handleSubcategoryClick(currentFilterValue, true);
        } else {
            handleSubcategoryClick(currentSubcategory, false);
        }
    }
});

// Inicialización
loadItems();