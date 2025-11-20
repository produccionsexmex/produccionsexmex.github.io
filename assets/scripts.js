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
let currentOrder = 'desc'; // o 'asc'

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

// 🔧 Función para extraer el último número de una ruta de imagen
function extraerNumeroDeImagen(ruta) {
    const match = ruta.match(/(\d+)/); // Solo el primer número
    return match ? parseInt(match[1], 10) : 0;
}

// 🔃 Función para ordenar por número en la imagen (más nuevo = número más alto)
function ordenarPorImagenDesc(a, b) {
    const numA = extraerNumeroDeImagen(a.imagen);
    const numB = extraerNumeroDeImagen(b.imagen);
    return currentOrder === 'desc'
        ? numB - numA
        : numA - numB;
}

// Mapeo de subcategorías dentro de dropdowns
const categoryMappings = {
    "Vestuario de mujer": {
        "Vestidos": [
            "Putivestidos",
            "Largos",
            "Mezclilla",
            "Brillosos cortos",
            "Brillosos largos"],
        "Enterizos":[
            "Normales",
            "Brillosos",
        ],
        "Calzado": ["Zapatos", "Botas", "Botas Vaqueras", "Botines"],
        "Faldas": ["Cortas", "Mezclilla", "Cortas brillosas", "Largas", "Largas brillosas"],
        "Blusas": [
            "Blusas básicas",
            "Blusas de vestir",
            "Blusas manga larga",
            "Tops",
            "Playeras",
            "Pantiblusas",
        ],
        "Disfraces": ["Enfermeras", "Sexys", "Heroínas", "Personajes", "Juego Del Calamar"],
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

    // Ordenar los ítems del más nuevo al más viejo según número de imagen
    items = items.sort(ordenarPorImagenDesc);

    console.log('Ítems cargados y ordenados correctamente');
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

    displayItems(ordenarItemsPorImagen(filteredItems)); // ✅ Correcto
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

    // Mostrar o agregar botón de orden
    const toggleBtn = document.getElementById('toggleOrderBtn');
    if (!toggleBtn) {
        const btn = document.createElement('button');
        btn.id = 'toggleOrderBtn';
        btn.className = 'btn btn-sm btn-outline-primary ms-auto';
        btn.innerText = 'Ordenar: Más nuevo';
        btn.onclick = toggleOrder;
        subcategoriesContainer.appendChild(btn);
    } else {
        toggleBtn.style.display = 'inline-block';
    }

    currentCategoryHeading.textContent = category;
    itemsContainer.innerHTML = '<p class="text-muted">Selecciona una subcategoría para ver los ítems.</p>';
    sizesNav.style.display = 'none';
}

// Manejar el clic en una subcategoría
function handleSubcategoryClick(subcategory) {
    currentSubcategory = subcategory;
    currentCategoryHeading.textContent = `${currentCategory} > ${subcategory}`;

    const filteredItems = items
  .filter(item => item.categoria.trim().toLowerCase() === currentCategory.trim().toLowerCase() &&
                  item.subcategoria.trim().toLowerCase() === subcategory.trim().toLowerCase())
  .sort(ordenarPorImagenDesc);
    displayItems(filteredItems);

    const calzadoSubcategorias = ["Zapatos", "Botas", "Botas Vaqueras", "Botines"];

    console.log(`Filtrando categoría: ${currentCategory}, subcategoría: ${subcategory}`);
    console.log("Ítems encontrados:", filteredItems);

    displayItems(filteredItems);

    // Primero, ocultamos el menú por defecto
    sizesNav.style.display = 'none';

    // Si la subcategoría es de Calzado, mostrar medidas
    if (calzadoSubcategorias.includes(subcategory)) {
        displaySizes(filteredItems);
    } 
    // Si la subcategoría es Utilería en Vestuario o Decoración, mostrar tipos
    else if (subcategory.toLowerCase() === 'utilería' && 
            (currentCategory.toLowerCase().includes("vestuario") || 
             currentCategory.toLowerCase().includes("decoración"))) {
        displaySubcategoryFilters(subcategory, 'tipo');
    } 
    // Si la subcategoría es Jarrones, mostrar colores
    else if (subcategory.toLowerCase() === 'jarrones') {
        displaySubcategoryFilters(subcategory, 'color');
    }
    // Si la subcategoría es Plantas, mostrar colores
    else if (subcategory.toLowerCase() === 'plantas') {
        displaySubcategoryFilters(subcategory, 'tipo'); // Filtra por tipo en Plantas
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

    displayItems(ordenarItemsPorImagen(filteredItems)); // ✅ Correcto
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

    displayItems(ordenarItemsPorImagen(filteredItems)); // ✅ Correcto
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

//Toggle btn
document.getElementById('toggleOrderBtn').addEventListener('click', () => {
    currentOrder = currentOrder === 'desc' ? 'asc' : 'desc';
    document.getElementById('toggleOrderBtn').textContent = 
        currentOrder === 'desc' ? 'Orden: Más nuevo' : 'Orden: Más viejo';

    // Recarga la subcategoría actual si está seleccionada
    if (currentSubcategory) {
        handleSubcategoryClick(currentSubcategory);
    }
});

// Inicialización
loadItems();