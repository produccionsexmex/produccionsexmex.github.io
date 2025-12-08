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
let currentSubcategory = '';
let currentMainSubcategory = '';
let currentFilterAttribute = '';
let currentFilterValue = '';
let currentOrder = 'desc';

// =========================================================
// SUBCATEGORÍAS
// =========================================================

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
        "Lencería": [],
        "Bodysuits": [],
        "Disfraces": [
            "Enfermeras",
            "Sexys",
            "Superheroínas",
            "Personajes",
            "Navideños",
            "Juego Del Calamar", 
            "Fantasía"
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


// =========================================================
// ORDENAMIENTO POR IMAGEN
// =========================================================

function extraerNumeroDeImagen(ruta) {
    const match = ruta.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
}

function ordenarItemsPorImagen(array) {
    return [...array].sort((a, b) => {
        const A = extraerNumeroDeImagen(a.imagen);
        const B = extraerNumeroDeImagen(b.imagen);
        return currentOrder === "desc" ? B - A : A - B;
    });
}

function ordenarPorImagenDesc(a, b) {
    const matchA = a.imagen?.match(/(\d+)\.jpg$/i);
    const matchB = b.imagen?.match(/(\d+)\.jpg$/i);
    const A = matchA ? parseInt(matchA[1]) : 0;
    const B = matchB ? parseInt(matchB[1]) : 0;
    return B - A;
}


// =========================================================
// CARGA INICIAL
// =========================================================
async function loadItems() {
    try {
        const response = await fetch('data/catalog.json');
        items = await response.json();

        items = items.sort(ordenarPorImagenDesc);

        currentCategory = '';
        currentSubcategory = '';
        currentMainSubcategory = '';
        currentFilterAttribute = '';
        currentFilterValue = '';

        subcategoriesList.innerHTML = '';
        sizesNav.style.display = 'none';

        currentCategoryHeading.textContent = 'Catálogo General';
        itemsContainer.innerHTML =
            '<p class="text-muted">Por favor, selecciona una categoría.</p>';

    } catch (error) {
        console.error('Error al cargar los ítems:', error);
    }
}


// =========================================================
// MOSTRAR ITEMS
// =========================================================
function displayItems(filteredItems) {
    if (filteredItems.length === 0) {
        itemsContainer.innerHTML = '<p class="text-muted">No hay ítems disponibles.</p>';
        return;
    }

    itemsContainer.innerHTML = filteredItems.map(item => {
        const name = item.nombre ? item.nombre : '';
        const tags = item.tags ? item.tags.map(tag => `<span class="badge bg-primary me-1">${tag}</span>`).join("") : "";

        return `
            <div class="col-xl-3 col-lg-4 col-sm-6 col-12 mb-4">
                <div class="card h-100">
                    <img src="${item.imagen}" class="card-img-top" alt="${name}">
                    <div class="card-body">
                        ${name ? `<h5 class="card-title">${name}</h5>` : ""}
                        ${item.medidas ? `<p>Medidas: ${item.medidas.join(", ")}</p>` : ""}
                        ${tags ? `<div class="mt-2">${tags}</div>` : ""}
                    </div>
                </div>
            </div>`;
    }).join("");
}


// =========================================================
// BUSCADOR
// =========================================================
function filterItems() {
    const query = searchBar.value.toLowerCase().trim();
    const keywords = query.split(/\s+/);

    let baseItems = items;

    if (currentCategory) {
        baseItems = items.filter(item =>
            item.categoria.toLowerCase() === currentCategory.toLowerCase()
        );

        if (currentMainSubcategory) {
            baseItems = baseItems.filter(item =>
                item.subcategoria.toLowerCase() === currentMainSubcategory.toLowerCase()
            );
        }

        if (currentFilterAttribute === 'tipo') {
            baseItems = baseItems.filter(item =>
                item.tipo?.toLowerCase() === currentFilterValue.toLowerCase()
            );
        }
    }

    const filteredSearch = baseItems.filter(item => {
        const text = [
            item.nombre,
            item.categoria,
            item.subcategoria,
            item.tipo,
            ...(item.tags || [])
        ].join(" ").toLowerCase();

        return keywords.every(k => text.includes(k));
    });

    displayItems(ordenarItemsPorImagen(filteredSearch));
}


// =========================================================
// SUBCATEGORÍAS
// =========================================================
function displaySubcategories(category) {
    currentCategory = category;
    subcategoriesList.innerHTML = "";

    const submap = categoryMappings[category];

    Object.keys(submap).forEach(main => {
        const subs = submap[main];

        if (subs.length > 0) {
            subcategoriesList.innerHTML += `
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">${main}</a>
                    <ul class="dropdown-menu">
                        ${subs.map(s => `<li><a class="dropdown-item" href="#" onclick="handleSubcategoryClick('${s}', true)">${s}</a></li>`).join("")}
                    </ul>
                </li>
            `;
        } else {
            subcategoriesList.innerHTML += `
                <li class="nav-item">
                    <a class="nav-link" href="#" onclick="handleSubcategoryClick('${main}', false)">${main}</a>
                </li>
            `;
        }
    });

    sizesNav.style.display = 'none';

    currentCategoryHeading.textContent = category;
    itemsContainer.innerHTML = '<p class="text-muted">Selecciona una subcategoría.</p>';
}


// =========================================================
// MANEJO DE SUBCATEGORÍAS Y TIPOS
// =========================================================
function handleSubcategoryClick(subcategory, isType) {
    currentSubcategory = subcategory;
    currentFilterAttribute = "";
    currentFilterValue = "";

    let filteredItems = [];

    if (isType) {
        let main = '';
        const map = categoryMappings[currentCategory];

        for (const [key, values] of Object.entries(map)) {
            if (values.includes(subcategory)) {
                main = key;
                break;
            }
        }

        currentMainSubcategory = main;
        currentFilterAttribute = "tipo";
        currentFilterValue = subcategory;

        filteredItems = items.filter(item =>
            item.categoria.toLowerCase() === currentCategory.toLowerCase() &&
            item.subcategoria.toLowerCase() === main.toLowerCase() &&
            item.tipo?.toLowerCase() === subcategory.toLowerCase()
        );

        currentCategoryHeading.textContent = `${currentCategory} > ${main} > ${subcategory}`;
    }

    else {
        currentMainSubcategory = subcategory;

        filteredItems = items.filter(item =>
            item.categoria.toLowerCase() === currentCategory.toLowerCase() &&
            item.subcategoria.toLowerCase() === subcategory.toLowerCase()
        );

        currentCategoryHeading.textContent = `${currentCategory} > ${subcategory}`;
    }

    displayItems(ordenarItemsPorImagen(filteredItems));

    sizesNav.style.display = "none";

    const calzado = ["Zapatillas", "Botas", "Botas Vaqueras", "Botines"];

    if (calzado.includes(currentMainSubcategory)) {
        displaySizes(filteredItems);
    }
}


// =========================================================
// FILTRO POR MEDIDAS (Calzado)
// =========================================================

function displaySizes(filteredItems) {
    const sizes = new Set();

    filteredItems.forEach(item => {
        item.medidas?.forEach(m => sizes.add(m));
    });

    if (sizes.size === 0) {
        sizesNav.style.display = 'none';
        return;
    }

    sizesNav.style.display = 'block';

    let html = `
        <li class="nav-item me-2 mb-2">
            <a class="btn btn-outline-primary" href="#" onclick="handleClearFilter('${currentMainSubcategory}')">TODOS</a>
        </li>
    `;

    html += [...sizes].sort().map(s => `
        <li class="nav-item me-2 mb-2">
            <a class="btn btn-outline-primary" href="#" onclick="filterBySubcategoryAttribute('medidas', '${s}')">${s}</a>
        </li>
    `).join("");

    sizesList.innerHTML = html;
}

function filterBySubcategoryAttribute(attribute, value) {
    currentFilterAttribute = attribute;
    currentFilterValue = value;

    const filteredItems = items.filter(item =>
        item.categoria === currentCategory &&
        item.subcategoria === currentMainSubcategory &&
        item.medidas?.includes(value)
    );

    displayItems(ordenarItemsPorImagen(filteredItems));
}


// =========================================================
// LIMPIAR FILTRO
// =========================================================

function handleClearFilter(mainSubcategory) {
    currentFilterAttribute = "";
    currentFilterValue = "";
    handleSubcategoryClick(mainSubcategory, false);
}


// =========================================================
// EVENTOS
// =========================================================
document.querySelectorAll('.nav-link[data-category]').forEach(link => {
    link.addEventListener("click", e => {
        e.preventDefault();
        const category = e.target.dataset.category;
        displaySubcategories(category);
    });
});

searchBar?.addEventListener("input", filterItems);

toggleOrderBtn.addEventListener("click", () => {
    currentOrder = currentOrder === "desc" ? "asc" : "desc";

    toggleOrderBtn.textContent =
        currentOrder === "desc" ? "Ordenar: Más nuevo" : "Ordenar: Más viejo";

    if (currentSubcategory) {
        handleSubcategoryClick(currentSubcategory, currentFilterAttribute === "tipo");
    }
});


// =========================================================
// INICIO
// =========================================================
loadItems();
