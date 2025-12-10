// =========================================================
// VARIABLES GLOBALES
// =========================================================

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
let currentSubcategory = ''; // Ej: "Zapatillas" (tipo) o "" si no hay tipo seleccionado
let currentMainSubcategory = ''; // Ej: "Calzado" (subcategoría padre)
let currentFilterAttribute = ''; // 'medidas' o 'color'
let currentFilterValue = ''; // valor del filtro avanzado
let currentOrder = 'desc'; // 'desc' = más nuevo, 'asc' = más viejo

// =========================================================
// Mapeo de Categorías (mantener sincronizado con JSON 'tipo' values)
// =========================================================
const categoryMappings = {
    "Vestuario de mujer": {
        "Vestidos": [
            "Putivestidos",
            "Vestidos largos",
            "Mezclilla",
            "Brillosos cortos",
            "Brillosos largos"
        ],
        "Enterizos":[ "Normales", "Brillosos" ],
        "Calzado": ["Zapatillas", "Botas", "Botas Vaqueras", "Botines"],
        "Faldas": ["Faldas cortas", "Faldas largas", "Mezclilla" ],
        "Blusas": ["Básicas","Manga Larga","Tops","Playeras","Pantiblusas"],
        "Lencería": [],
        "Bodysuits": [],
        "Disfraces": [
            "Enfermeras","Sexys","Superheroínas","Personajes","Navideños","Juego Del Calamar","Fantasía"
        ],
        "Variado": [],
        "Deportivos": [],
        "Utilería": []
    },
    "Vestuario de hombre": {
        "Disfraces": [],
        "Utilería": []
    },
    "Sado": {
        "Utilería": []
    },
    "Decoración": {
        "Jarrones": [],
        "Lámparas y Macetas": [],
        "Lámparas": [],
        "Plantas": [],
        "Utilería": []
    }
};

// =========================================================
// UTILIDADES DE ORDENAMIENTO
// =========================================================
function extraerNumeroDeImagen(ruta) {
    if (!ruta || typeof ruta !== 'string') return 0;
    // buscamos el último grupo de dígitos en la ruta (maneja nombres con -1.jpg etc.)
    const matches = ruta.match(/(\d+)(?=[^0-9]*\.[a-z]{2,4}$)/i);
    if (matches && matches[1]) return parseInt(matches[1], 10);
    // fallback: buscar cualquier número
    const any = ruta.match(/(\d+)/);
    return any ? parseInt(any[1], 10) : 0;
}

function ordenarItemsPorImagen(array) {
    // devuelve nuevo array ordenado según currentOrder
    return [...array].sort((a, b) => {
        const A = extraerNumeroDeImagen(a.imagen);
        const B = extraerNumeroDeImagen(b.imagen);
        return currentOrder === "desc" ? B - A : A - B;
    });
}

function ordenarPorImagenDesc(a, b) {
    const A = extraerNumeroDeImagen(a.imagen);
    const B = extraerNumeroDeImagen(b.imagen);
    return B - A;
}

// =========================================================
// CARGA INICIAL
// =========================================================
async function loadItems() {
    try {
        const response = await fetch('data/catalog.json');
        items = await response.json();

        // inicial: ordenamos por desc (más nuevo)
        items = ordenarItemsPorImagen(items);

        // estados iniciales
        currentCategory = '';
        currentSubcategory = '';
        currentMainSubcategory = '';
        currentFilterAttribute = '';
        currentFilterValue = '';
        currentOrder = 'desc';

        subcategoriesList.innerHTML = '';
        sizesNav.style.display = 'none';

        currentCategoryHeading.textContent = 'Catálogo General';
        itemsContainer.innerHTML = '<p class="text-muted">Por favor, selecciona una categoría.</p>';

        if (toggleOrderBtn) toggleOrderBtn.textContent = 'Ordenar: Más nuevo';
    } catch (error) {
        console.error('Error al cargar los ítems:', error);
    }
}

// =========================================================
// TOOLS
// =========================================================
function toTitleCase(str) {
    if (!str) return '';
    return str
        .toLowerCase()
        .replace(/(^|\s)([a-záéíóúñü])/g, (m, g1, g2) => g1 + g2.toUpperCase());
}

// =========================================================
// RENDERIZADO DE ITEMS
// =========================================================
function displayItems(filteredItems) {
    if (!Array.isArray(filteredItems)) filteredItems = [];

    if (filteredItems.length === 0) {
        itemsContainer.innerHTML = '<p class="text-muted">No hay ítems disponibles.</p>';
        return;
    }

    // Aplicamos orden aquí para asegurar que siempre respete currentOrder
    const ordered = ordenarItemsPorImagen(filteredItems);

    itemsContainer.innerHTML = ordered.map(item => {
        const name = item.nombre ? toTitleCase(item.nombre) : '';
        const medidasText = item.medidas && Array.isArray(item.medidas) && item.medidas.length > 0
            ? `<p>Medidas: ${item.medidas.join(", ")}</p>` : "";
        const tags = item.tags && Array.isArray(item.tags)
            ? item.tags.map(tag => `<span class="badge bg-primary me-1">${tag}</span>`).join("") : "";

        return `
            <div class="col-xl-3 col-lg-4 col-sm-6 col-12 mb-4">
                <div class="card h-100">
                    <img src="${item.imagen}" class="card-img-top" alt="${name}">
                    <div class="card-body">
                        ${name ? `<h5 class="card-title">${name}</h5>` : ""}
                        ${medidasText}
                        ${tags ? `<div class="mt-2">${tags}</div>` : ""}
                    </div>
                </div>
            </div>
        `;
    }).join("");
}

// =========================================================
// FILTRADO PRINCIPAL (BUSCADOR + ESTADO)
// =========================================================
function filterItems() {
    const query = (searchBar && searchBar.value) ? searchBar.value.toLowerCase().trim() : '';
    const keywords = query ? query.split(/\s+/) : [];

    let baseItems = items;

    // Filtrar por categoría principal
    if (currentCategory) {
        baseItems = baseItems.filter(item =>
            (item.categoria || '').toLowerCase().trim() === currentCategory.toLowerCase().trim()
        );

        // Filtrar por subcategoría padre (ej. Calzado)
        if (currentMainSubcategory) {
            baseItems = baseItems.filter(item =>
                (item.subcategoria || '').toLowerCase().trim() === currentMainSubcategory.toLowerCase().trim()
            );
        }

        // Filtrar por tipo (si se seleccionó un tipo distinto a la subcategoría padre)
        if (currentSubcategory && currentSubcategory !== currentMainSubcategory) {
            baseItems = baseItems.filter(item =>
                (item.tipo || '').toLowerCase().trim() === currentSubcategory.toLowerCase().trim()
            );
        }

        // Filtrar por filtro avanzado (medidas o color)
        if (currentFilterAttribute && currentFilterValue) {
            const fv = currentFilterValue.toString().trim().toLowerCase();
            if (currentFilterAttribute === 'medidas') {
                baseItems = baseItems.filter(item => Array.isArray(item.medidas) && item.medidas.map(String).some(m => m.toLowerCase().trim() === fv));
            } else if (currentFilterAttribute === 'color') {
                baseItems = baseItems.filter(item => ((item.color || '')).toLowerCase().trim() === fv);
            }
        }
    }

    // Aplicar búsqueda de texto sobre baseItems
    const filteredSearch = baseItems.filter(item => {
        if (keywords.length === 0) return true;
        const text = [
            item.nombre || '',
            item.categoria || '',
            item.subcategoria || '',
            item.tipo || '',
            ...(item.tags || [])
        ].join(' ').toLowerCase();
        return keywords.every(k => text.includes(k));
    });

    displayItems(filteredSearch);
    updateCurrentCategoryHeading();

    // Regenerar filtros avanzados si corresponde
    if (currentMainSubcategory === "Calzado" || currentMainSubcategory === "Jarrones") {
        regenerateAdvancedFilters();
    } else {
        sizesNav.style.display = 'none';
    }
}

// =========================================================
// HEADER/ENCABEZADO
// =========================================================
function updateCurrentCategoryHeading() {
    let headingText = currentCategory || 'Catálogo General';

    if (currentMainSubcategory) headingText += ` > ${currentMainSubcategory}`;
    if (currentSubcategory && currentSubcategory !== currentMainSubcategory) headingText += ` > ${currentSubcategory}`;
    if (currentFilterValue) headingText += ` (Filtro: ${currentFilterValue})`;

    currentCategoryHeading.textContent = headingText;
}

// =========================================================
// NAVEGACIÓN: Subcategorías (render dinámico)
// =========================================================
function displaySubcategories(category) {
    currentCategory = category;
    subcategoriesList.innerHTML = '';

    const submap = categoryMappings[category] || {};

    Object.keys(submap).forEach(main => {
        const subs = submap[main];

        if (Array.isArray(subs) && subs.length > 0) {
            // dropdown (los items dentro son "tipo")
            subcategoriesList.innerHTML += `
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">${main}</a>
                    <ul class="dropdown-menu">
                        ${subs.map(s => `<li><a class="dropdown-item" href="#" onclick="handleSubcategoryClick('${s}', true)">${s}</a></li>`).join("")}
                    </ul>
                </li>
            `;
        } else {
            // enlace directo
            subcategoriesList.innerHTML += `
                <li class="nav-item">
                    <a class="nav-link" href="#" onclick="handleSubcategoryClick('${main}', false)">${main}</a>
                </li>
            `;
        }
    });

    // Reiniciar estados relacionados a filtros
    sizesNav.style.display = 'none';
    currentFilterAttribute = '';
    currentFilterValue = '';
    currentSubcategory = '';
    currentMainSubcategory = '';

    currentCategoryHeading.textContent = currentCategory;
    itemsContainer.innerHTML = '<p class="text-muted">Selecciona una subcategoría.</p>';
}

// =========================================================
// MANEJO DE SUBCATEGORÍAS / TIPOS
// =========================================================
function handleSubcategoryClick(subcategory, isType) {
    // limpiar filtros avanzados
    currentFilterAttribute = "";
    currentFilterValue = "";

    currentSubcategory = subcategory;

    if (isType) {
        // buscamos el padre (mainSubcategory) que contiene este tipo
        let mainCategory = '';
        const map = categoryMappings[currentCategory] || {};
        for (const [key, values] of Object.entries(map)) {
            if (Array.isArray(values) && values.includes(subcategory)) {
                mainCategory = key;
                break;
            }
        }
        currentMainSubcategory = mainCategory;
    } else {
        // el enlace directo es la subcategoría padre
        currentMainSubcategory = subcategory;
    }

    // Aplicar filtro y actualizar vista
    filterItems();
}

// =========================================================
// REGENERAR FILTROS AVANZADOS (Tallas y Colores)
// =========================================================
function regenerateAdvancedFilters() {
    let filterAttribute = '';
    if (currentMainSubcategory === "Calzado") filterAttribute = 'medidas';
    else if (currentMainSubcategory === "Jarrones") filterAttribute = 'color';

    if (!filterAttribute) {
        sizesNav.style.display = 'none';
        return;
    }

    // baseItemsForFilters: todos los ítems del padre (p.ej. Calzado) en la categoría actual
    let baseItemsForFilters = items.filter(item =>
    (item.categoria || '').toLowerCase().trim() === currentCategory.toLowerCase().trim() &&
    (item.subcategoria || '').toLowerCase().trim() === currentMainSubcategory.toLowerCase().trim()
);

// Si hay un tipo seleccionado (ej. "Botas"), filtramos solo ese tipo
if (currentSubcategory && currentSubcategory !== currentMainSubcategory) {
    baseItemsForFilters = baseItemsForFilters.filter(item =>
        (item.tipo || '').toLowerCase().trim() === currentSubcategory.toLowerCase().trim()
    );
}

    displaySubcategoryFilters(baseItemsForFilters, filterAttribute);
}

// =========================================================
// RENDERIZAR BOTONES DE FILTRO (Tallas/Colores)
// =========================================================
function displaySubcategoryFilters(filteredItems, filterKey) {
    const filters = new Set();

    filteredItems.forEach(item => {
        const prop = item[filterKey];
        if (!prop) return;

        if (Array.isArray(prop)) {
            prop.forEach(v => {
                if (v !== undefined && v !== null) filters.add(String(v).trim());
            });
        } else {
            filters.add(String(prop).trim());
        }
    });

    // Si no hay valores, ocultamos
    if (filters.size === 0) {
        sizesNav.classList.add("d-none");
        sizesList.innerHTML = '';
        return;
    }

    // Mostramos menú
    sizesNav.classList.remove("d-none");
    sizesNav.style.display = 'block';

    let html = `
        <li class="nav-item me-2 mb-2">
            <a class="btn btn-outline-primary ${currentFilterValue === '' ? 'active' : ''}"
               href="#"
               onclick="handleClearFilter()">TODOS</a>
        </li>
    `;

    html += [...filters]
        .sort((a, b) => {
            const na = parseFloat(String(a).replace(/\s+/g, ''));
            const nb = parseFloat(String(b).replace(/\s+/g, ''));
            if (!isNaN(na) && !isNaN(nb)) return na - nb;
            return String(a).localeCompare(String(b));
        })
        .map(value => {
            const isActive =
                currentFilterAttribute === filterKey && currentFilterValue === value ? 'active' : '';

            return `
                <li class="nav-item me-2 mb-2">
                    <a class="btn btn-outline-primary ${isActive}"
                       href="#"
                       onclick="filterBySubcategoryAttribute('${filterKey}', '${value.replace(/'/g, "\\'")}')">
                        ${value}
                    </a>
                </li>
            `;
        })
        .join("");

    sizesList.innerHTML = html;
}

// =========================================================
// FILTRAR POR ATRIBUTO (TALLAS / COLOR)
// =========================================================
function filterBySubcategoryAttribute(attribute, value) {
    currentFilterAttribute = attribute;
    currentFilterValue = value;
    filterItems();
}

// =========================================================
// LIMPIAR FILTRO (TODOS)
// =========================================================
function handleClearFilter() {
    currentFilterAttribute = '';
    currentFilterValue = '';
    filterItems();
}

// =========================================================
// MANEJO CLIC EN CATEGORÍA PRINCIPAL
// =========================================================
function handleCategoryClick(category) {
    const navbarCollapse = document.getElementById('navbarNav');
    const bsCollapse = new bootstrap.Collapse(navbarCollapse, { toggle: false });
    bsCollapse.hide();

    // activar visualmente (si quieres)
    document.querySelectorAll('.nav-link[data-category]').forEach(link => link.classList.remove('active'));
    const categoryLink = document.querySelector(`.nav-link[data-category="${category}"]`);
    if (categoryLink) categoryLink.classList.add('active');

    displaySubcategories(category);
}

// =========================================================
// EVENTOS
// =========================================================
document.querySelectorAll('.nav-link[data-category]').forEach(link => {
    link.addEventListener("click", e => {
        e.preventDefault();
        const category = e.target.dataset.category;
        handleCategoryClick(category);
    });
});

if (searchBar) searchBar.addEventListener("input", filterItems);

if (toggleOrderBtn) {
    toggleOrderBtn.addEventListener("click", () => {
        currentOrder = currentOrder === "desc" ? "asc" : "desc";
        toggleOrderBtn.textContent = currentOrder === 'desc' ? 'Ordenar: Más nuevo' : 'Ordenar: Más viejo';
        // Re-aplicar filtro/orden
        filterItems();
    });
}

// =========================================================
// INICIO
// =========================================================
loadItems();