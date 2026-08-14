/* =====================================================
   MILASHES INSUMOS
   SCRIPT COMPLETO + SUPABASE
   ===================================================== */

/* =====================================================
   CONFIGURACIÓN SUPABASE
   ===================================================== */

const SUPABASE_URL =
  "https://dnorgfrhhuclcgptgdqm.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_BnnKBE7o9TJHWA-12CmVIw_vv3M5HJi";

const WHATSAPP_NUMBER = "5491100000000";

const INSTAGRAM_URL = "https://instagram.com/";


/* =====================================================
   CLIENTE SUPABASE
   ===================================================== */

const supabase = window.supabase;


/* =====================================================
   PRODUCTOS
   ===================================================== */

let products = [];


/* =====================================================
   PRODUCTOS DE RESPALDO
   Si Supabase falla, estos aparecen igualmente.
   ===================================================== */

const fallbackProducts = [

  {
    id: 1,
    name: "Pestañas Clásicas 0.15 C",
    category: "Pestañas",
    price: 8500,
    transfer_price: 7650,
    description: "Bandeja de pestañas individuales para técnica clásica.",
    image: "https://images.unsplash.com/photo-1583001931096-959e9a1a6223?auto=format&fit=crop&w=700&q=80",
    discount: 10
  },

  {
    id: 2,
    name: "Pestañas Clásicas 0.20 C",
    category: "Pestañas",
    price: 8900,
    transfer_price: 8010,
    description: "Pestañas profesionales de excelente definición y curvatura.",
    image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=700&q=80",
    discount: 10
  },

  {
    id: 3,
    name: "Pestañas Volumen 0.07 D",
    category: "Pestañas",
    price: 10500,
    transfer_price: 9450,
    description: "Fibra liviana para técnicas de volumen y mega volumen.",
    image: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=700&q=80",
    discount: 10
  },

  {
    id: 4,
    name: "Pestañas Volumen 0.05 CC",
    category: "Pestañas",
    price: 11200,
    transfer_price: 10080,
    description: "Curvatura CC ideal para diferentes estilos de volumen.",
    image: "https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?auto=format&fit=crop&w=700&q=80",
    discount: 10
  },

  {
    id: 5,
    name: "Pestañas YY 0.07",
    category: "Pestañas",
    price: 9800,
    transfer_price: 8820,
    description: "Pestañas YY para lograr mayor volumen de manera práctica.",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=700&q=80",
    discount: 10
  },

  {
    id: 6,
    name: "Pestañas W 0.07",
    category: "Pestañas",
    price: 10200,
    transfer_price: 9180,
    description: "Pestañas W para volumen y efecto de mayor densidad.",
    image: "https://images.unsplash.com/photo-1581182800629-7d90925ad072?auto=format&fit=crop&w=700&q=80",
    discount: 10
  },

  {
    id: 7,
    name: "Adhesivo Profesional 5 ml",
    category: "Adhesivos",
    price: 14500,
    transfer_price: 13050,
    description: "Adhesivo profesional de secado rápido para extensiones.",
    image: "https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=700&q=80",
    discount: 10
  }

];


/* =====================================================
   ESTADO
   ===================================================== */

let cartItemsState =
  JSON.parse(localStorage.getItem("milashesCart")) || [];

let activeCategory = "Todos";
let activePrice = "all";
let searchTerm = "";


/* =====================================================
   ELEMENTOS
   ===================================================== */

const productGrid =
  document.getElementById("productGrid");

const resultsCount =
  document.getElementById("resultsCount");

const noResults =
  document.getElementById("noResults");

const searchInput =
  document.getElementById("searchInput");

const searchButton =
  document.getElementById("searchButton");

const cartButton =
  document.getElementById("cartButton");

const cartElement =
  document.getElementById("cart");

const cartOverlay =
  document.getElementById("cartOverlay");

const closeCart =
  document.getElementById("closeCart");

const cartItems =
  document.getElementById("cartItems");

const cartCount =
  document.getElementById("cartCount");

const cartTotal =
  document.getElementById("cartTotal");

const checkoutButton =
  document.getElementById("checkoutButton");

const continueShopping =
  document.getElementById("continueShopping");

const productModal =
  document.getElementById("productModal");

const closeModal =
  document.getElementById("closeModal");

const modalContent =
  document.getElementById("modalContent");

const mobileMenu =
  document.getElementById("mobileMenu");

const nav =
  document.getElementById("nav");


/* =====================================================
   PRECIO
   ===================================================== */

function formatPrice(price) {

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
  }).format(Number(price) || 0);

}


/* =====================================================
   CARGAR SUPABASE
   ===================================================== */

async function loadProducts() {

  console.log("Conectando con Supabase...");

  try {

    if (!supabase) {

      throw new Error(
        "La librería de Supabase no está cargada."
      );

    }


    const response =
      await fetch(
        `${SUPABASE_URL}/rest/v1/products?select=*`,
        {
          method: "GET",

          headers: {
            "apikey": SUPABASE_KEY,
            "Authorization":
              `Bearer ${SUPABASE_KEY}`,
            "Content-Type":
              "application/json"
          }
        }
      );


    if (!response.ok) {

      const errorText =
        await response.text();

      throw new Error(
        `Supabase respondió ${response.status}: ${errorText}`
      );

    }


    const data =
      await response.json();


    console.log(
      "Productos recibidos desde Supabase:",
      data
    );


    if (!Array.isArray(data)) {

      throw new Error(
        "Supabase no devolvió una lista de productos."
      );

    }


    products =
      data.map(product => ({

        id: product.id,

        name:
          product.name || "Producto sin nombre",

        category:
          product.category || "Sin categoría",

        price:
          Number(product.price) || 0,

        transfer_price:
          Number(product.transfer_price) ||
          Number(product.price) || 0,

        description:
          product.description || "",

        image:
          product.image ||
          "https://images.unsplash.com/photo-1583001931096-959e9a1a6223?auto=format&fit=crop&w=700&q=80",

        discount:
          Number(product.discount) || 0

      }));


    console.log(
      `Se cargaron ${products.length} productos.`
    );


    /*
     Si Supabase está vacío, usamos ejemplos.
    */

    if (products.length === 0) {

      console.warn(
        "La tabla products está vacía. Se utilizarán productos de ejemplo."
      );

      products = fallbackProducts;

    }


    renderProducts();
    renderCart();

  }


  catch (error) {

    console.error(
      "ERROR SUPABASE:",
      error
    );


    /*
     Si hay error, mostramos productos
     de respaldo.
    */

    products = fallbackProducts;


    renderProducts();
    renderCart();


    console.warn(
      "Se utilizaron productos de respaldo."
    );

  }

}


/* =====================================================
   MOSTRAR PRODUCTOS
   ===================================================== */

function renderProducts() {

  if (!productGrid) return;


  let filtered =
    [...products];


  /* BUSCADOR */

  if (
    searchTerm.trim() !== ""
  ) {

    const term =
      searchTerm
        .toLowerCase()
        .trim();


    filtered =
      filtered.filter(product =>

        product.name
          .toLowerCase()
          .includes(term)

        ||

        product.category
          .toLowerCase()
          .includes(term)

        ||

        product.description
          .toLowerCase()
          .includes(term)

      );

  }


  /* CATEGORÍA */

  if (
    activeCategory !== "Todos"
  ) {

    filtered =
      filtered.filter(product =>

        product.category ===
        activeCategory

      );

  }


  /* PRECIO */

  if (
    activePrice ===
    "under10000"
  ) {

    filtered =
      filtered.filter(product =>
        Number(product.price) < 10000
      );

  }


  if (
    activePrice ===
    "10000-20000"
  ) {

    filtered =
      filtered.filter(product =>

        Number(product.price) >= 10000 &&

        Number(product.price) <= 20000

      );

  }


  if (
    activePrice ===
    "over20000"
  ) {

    filtered =
      filtered.filter(product =>
        Number(product.price) > 20000
      );

  }


  /* ORDEN */

  const sortElement =
    document.getElementById(
      "sortProducts"
    );


  if (sortElement) {

    const sort =
      sortElement.value;


    if (
      sort === "price-low"
    ) {

      filtered.sort(
        (a, b) =>
          Number(a.price) -
          Number(b.price)
      );

    }


    if (
      sort === "price-high"
    ) {

      filtered.sort(
        (a, b) =>
          Number(b.price) -
          Number(a.price)
      );

    }


    if (
      sort === "name"
    ) {

      filtered.sort(
        (a, b) =>
          a.name.localeCompare(
            b.name
          )
      );

    }

  }


  /* LIMPIAR */

  productGrid.innerHTML = "";


  /* RESULTADOS */

  if (resultsCount) {

    resultsCount.textContent =
      `${filtered.length} producto${filtered.length !== 1 ? "s" : ""}`;

  }


  /* SIN RESULTADOS */

  if (
    filtered.length === 0
  ) {

    if (noResults) {

      noResults.style.display =
        "block";

    }

    return;

  }


  if (noResults) {

    noResults.style.display =
      "none";

  }


  /* PRODUCTOS */

  filtered.forEach(product => {

    const card =
      document.createElement(
        "article"
      );


    card.className =
      "product-card";


    card.innerHTML = `

      <div class="product-image">

        <img
          src="${product.image}"
          alt="${product.name}"
          loading="lazy"
          onerror="this.src='https://images.unsplash.com/photo-1583001931096-959e9a1a6223?auto=format&fit=crop&w=700&q=80'"
        >

        ${
          product.discount > 0
            ? `
              <span class="discount">
                -${product.discount}%
              </span>
            `
            : ""
        }

      </div>


      <div class="product-info">

        <span class="product-category">
          ${product.category}
        </span>


        <h3 class="product-name">
          ${product.name}
        </h3>


        <p class="product-description">
          ${product.description}
        </p>


        <div class="price">
          ${formatPrice(product.price)}
        </div>


        <div class="transfer-price">

          ${formatPrice(
            product.transfer_price
          )}

          pagando por transferencia

        </div>


        <button
          class="add-cart"
          data-id="${product.id}"
        >
          AGREGAR AL CARRITO
        </button>


        <span
          class="view-product"
          data-id="${product.id}"
        >
          Ver producto
        </span>

      </div>

    `;


    productGrid.appendChild(card);

  });


  /* BOTONES CARRITO */

  document
    .querySelectorAll(".add-cart")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          addToCart(
            Number(
              button.dataset.id
            )
          );

        }
      );

    });


  /* VER PRODUCTO */

  document
    .querySelectorAll(".view-product")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          openProduct(
            Number(
              button.dataset.id
            )
          );

        }
      );

    });

}


/* =====================================================
   CARRITO
   ===================================================== */

function addToCart(productId) {

  const product =
    products.find(
      p => Number(p.id) ===
      Number(productId)
    );


  if (!product) return;


  const existing =
    cartItemsState.find(
      item =>
        Number(item.id) ===
        Number(productId)
    );


  if (existing) {

    existing.quantity++;

  }

  else {

    cartItemsState.push({

      id: product.id,

      quantity: 1

    });

  }


  saveCart();

  renderCart();

  openCart();

}


function saveCart() {

  localStorage.setItem(
    "milashesCart",
    JSON.stringify(
      cartItemsState
    )
  );

}


/* =====================================================
   MOSTRAR CARRITO
   ===================================================== */

function renderCart() {

  if (!cartItems) return;


  cartItems.innerHTML = "";


  if (
    cartItemsState.length === 0
  ) {

    cartItems.innerHTML = `

      <div class="empty-cart">

        <div>🛒</div>

        <h3>
          Tu carrito está vacío
        </h3>

        <p>
          Agregá productos para comenzar.
        </p>

      </div>

    `;


    cartCount.textContent = "0";

    cartTotal.textContent =
      formatPrice(0);

    return;

  }


  let total = 0;
  let quantityTotal = 0;


  cartItemsState.forEach(item => {

    const product =
      products.find(
        p =>
          Number(p.id) ===
          Number(item.id)
      );


    if (!product) return;


    const subtotal =
      Number(product.price) *
      Number(item.quantity);


    total += subtotal;

    quantityTotal +=
      Number(item.quantity);


    const element =
      document.createElement(
        "div"
      );


    element.className =
      "cart-item";


    element.innerHTML = `

      <img
        src="${product.image}"
        alt="${product.name}"
      >


      <div class="cart-item-info">

        <h4>
          ${product.name}
        </h4>


        <div class="cart-item-price">
          ${formatPrice(product.price)}
        </div>


        <div class="quantity">

          <button
            data-action="minus"
            data-id="${product.id}"
          >
            −
          </button>


          <span>
            ${item.quantity}
          </span>


          <button
            data-action="plus"
            data-id="${product.id}"
          >
            +
          </button>


          <button
            class="remove-item"
            data-action="remove"
            data-id="${product.id}"
          >
            Eliminar
          </button>

        </div>

      </div>

    `;


    cartItems.appendChild(
      element
    );

  });


  cartCount.textContent =
    quantityTotal;


  cartTotal.textContent =
    formatPrice(total);


  document
    .querySelectorAll(
      ".quantity button"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          changeQuantity(

            Number(
              button.dataset.id
            ),

            button.dataset.action

          );

        }
      );

    });

}


/* =====================================================
   CAMBIAR CANTIDAD
   ===================================================== */

function changeQuantity(
  id,
  action
) {

  const item =
    cartItemsState.find(
      product =>
        Number(product.id) ===
        Number(id)
    );


  if (!item) return;


  if (
    action === "plus"
  ) {

    item.quantity++;

  }


  if (
    action === "minus"
  ) {

    item.quantity--;


    if (
      item.quantity <= 0
    ) {

      cartItemsState =
        cartItemsState.filter(
          product =>
            Number(product.id) !==
            Number(id)
        );

    }

  }


  if (
    action === "remove"
  ) {

    cartItemsState =
      cartItemsState.filter(
        product =>
          Number(product.id) !==
          Number(id)
      );

  }


  saveCart();

  renderCart();

}


/* =====================================================
   ABRIR CARRITO
   ===================================================== */

function openCart() {

  cartElement.classList.add(
    "active"
  );

  cartOverlay.classList.add(
    "active"
  );

  document.body.style.overflow =
    "hidden";

}


function closeCartFunction() {

  cartElement.classList.remove(
    "active"
  );

  cartOverlay.classList.remove(
    "active"
  );

  document.body.style.overflow =
    "";

}


if (cartButton) {

  cartButton.addEventListener(
    "click",
    openCart
  );

}


if (closeCart) {

  closeCart.addEventListener(
    "click",
    closeCartFunction
  );

}


if (cartOverlay) {

  cartOverlay.addEventListener(
    "click",
    closeCartFunction
  );

}


if (continueShopping) {

  continueShopping.addEventListener(
    "click",
    closeCartFunction
  );

}


/* =====================================================
   WHATSAPP
   ===================================================== */

function checkout() {

  if (
    cartItemsState.length === 0
  ) {

    alert(
      "Tu carrito está vacío."
    );

    return;

  }


  let message =
    "Hola MILASHES INSUMOS 👋\n\n";


  message +=
    "Quiero realizar el siguiente pedido:\n\n";


  let total = 0;


  cartItemsState.forEach(item => {

    const product =
      products.find(
        p =>
          Number(p.id) ===
          Number(item.id)
      );


    if (!product) return;


    const subtotal =
      Number(product.price) *
      Number(item.quantity);


    total += subtotal;


    message +=
      `• ${product.name} x${item.quantity} - ${formatPrice(subtotal)}\n`;

  });


  message +=
    `\nTOTAL: ${formatPrice(total)}\n\n`;

  message +=
    "Nombre:\n";

  message +=
    "Localidad:\n";

  message +=
    "Método de envío:\n";


  const url =
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;


  window.open(
    url,
    "_blank"
  );

}


if (checkoutButton) {

  checkoutButton.addEventListener(
    "click",
    checkout
  );

}


/* =====================================================
   BUSCADOR
   ===================================================== */

if (searchInput) {

  searchInput.addEventListener(
    "input",
    () => {

      searchTerm =
        searchInput.value;

      renderProducts();

    }
  );

}


if (searchButton) {

  searchButton.addEventListener(
    "click",
    () => {

      searchTerm =
        searchInput.value;

      renderProducts();


      document
        .getElementById(
          "productos"
        )
        ?.scrollIntoView({
          behavior: "smooth"
        });

    }
  );

}


/* =====================================================
   FILTRO CATEGORÍA
   ===================================================== */

document
  .querySelectorAll(
    'input[name="category"]'
  )
  .forEach(input => {

    input.addEventListener(
      "change",
      () => {

        activeCategory =
          input.value;

        renderProducts();

      }
    );

  });


/* =====================================================
   FILTRO PRECIO
   ===================================================== */

document
  .querySelectorAll(
    'input[name="price"]'
  )
  .forEach(input => {

    input.addEventListener(
      "change",
      () => {

        activePrice =
          input.value;

        renderProducts();

      }
    );

  });


/* =====================================================
   ORDEN
   ===================================================== */

const sortProducts =
  document.getElementById(
    "sortProducts"
  );


if (sortProducts) {

  sortProducts.addEventListener(
    "change",
    renderProducts
  );

}


/* =====================================================
   LIMPIAR FILTROS
   ===================================================== */

const clearFilters =
  document.getElementById(
    "clearFilters"
  );


if (clearFilters) {

  clearFilters.addEventListener(
    "click",
    () => {

      activeCategory =
        "Todos";

      activePrice =
        "all";

      searchTerm =
        "";


      if (searchInput) {

        searchInput.value =
          "";

      }


      const category =
        document.querySelector(
          'input[name="category"][value="Todos"]'
        );


      if (category) {

        category.checked =
          true;

      }


      const price =
        document.querySelector(
          'input[name="price"][value="all"]'
        );


      if (price) {

        price.checked =
          true;

      }


      if (sortProducts) {

        sortProducts.value =
          "default";

      }


      renderProducts();

    }
  );

}


/* =====================================================
   CATEGORÍAS
   ===================================================== */

document
  .querySelectorAll(
    ".category-card, .nav a[data-category]"
  )
  .forEach(element => {

    element.addEventListener(
      "click",
      event => {

        const category =
          element.dataset.category;


        if (!category) return;


        event.preventDefault();


        activeCategory =
          category;


        const radio =
          document.querySelector(
            `input[name="category"][value="${category}"]`
          );


        if (radio) {

          radio.checked =
            true;

        }


        renderProducts();


        document
          .getElementById(
            "productos"
          )
          ?.scrollIntoView({
            behavior: "smooth"
          });

      }
    );

  });


/* =====================================================
   MODAL PRODUCTO
   ===================================================== */

function openProduct(id) {

  const product =
    products.find(
      p =>
        Number(p.id) ===
        Number(id)
    );


  if (!product) return;


  modalContent.innerHTML = `

    <div class="modal-product">

      <img
        src="${product.image}"
        alt="${product.name}"
      >


      <div class="modal-info">

        <span class="product-category">
          ${product.category}
        </span>


        <h2>
          ${product.name}
        </h2>


        <p>
          ${product.description}
        </p>


        <div class="modal-price">
          ${formatPrice(product.price)}
        </div>


        <div class="transfer-price">

          ${formatPrice(
            product.transfer_price
          )}

          pagando por transferencia

        </div>


        <button
          class="add-cart"
          id="modalAddCart"
        >
          AGREGAR AL CARRITO
        </button>

      </div>

    </div>

  `;


  productModal.classList.add(
    "active"
  );


  document.body.style.overflow =
    "hidden";


  document
    .getElementById(
      "modalAddCart"
    )
    .addEventListener(
      "click",
      () => {

        addToCart(
          product.id
        );

        closeProductModal();

      }
    );

}


function closeProductModal() {

  productModal.classList.remove(
    "active"
  );

  document.body.style.overflow =
    "";

}


if (closeModal) {

  closeModal.addEventListener(
    "click",
    closeProductModal
  );

}


if (productModal) {

  productModal.addEventListener(
    "click",
    event => {

      if (
        event.target ===
        productModal
      ) {

        closeProductModal();

      }

    }
  );

}


/* =====================================================
   MENÚ MOBILE
   ===================================================== */

if (mobileMenu) {

  mobileMenu.addEventListener(
    "click",
    () => {

      nav.classList.toggle(
        "active"
      );

    }
  );

}


/* =====================================================
   INSTAGRAM
   ===================================================== */

document
  .querySelectorAll(
    'a[target="_blank"]'
  )
  .forEach(link => {

    if (
      link.textContent
        .toLowerCase()
        .includes(
          "instagram"
        )
    ) {

      link.href =
        INSTAGRAM_URL;

    }

  });


/* =====================================================
   WHATSAPP CONTACTO
   ===================================================== */

const whatsappContact =
  document.getElementById(
    "whatsappContact"
  );


if (whatsappContact) {

  whatsappContact.href =
    `https://wa.me/${WHATSAPP_NUMBER}`;

}


/* =====================================================
   ESCAPE
   ===================================================== */

document.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Escape"
    ) {

      closeCartFunction();

      closeProductModal();

    }

  }
);


/* =====================================================
   INICIAR
   ===================================================== */

console.log(
  "MILASHES INSUMOS iniciado."
);

loadProducts();