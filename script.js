/* =====================================================
   MILASHES INSUMOS
   Catálogo + buscador + filtros + carrito
   ===================================================== */


/* =====================================================
   CONFIGURACIÓN
   ===================================================== */

const WHATSAPP_NUMBER = "5491156348200";
const INSTAGRAM_URL = "https://www.instagram.com/mi_lashess_/";


/* =====================================================
   PRODUCTOS
   ===================================================== */

const products = [

  {
    id: 1,
    name: "Pestañas 0.05 D",
    category: "Pestañas",
    price: 8500,
    transferPrice: 7650,
    description: "Pestañas profesionales para extensiones de pestañas.",
    image: "https://images.unsplash.com/photo-1583001931096-959e9a1a6223?auto=format&fit=crop&w=700&q=80",
    discount: 10
  },

  {
    id: 2,
    name: "Pestañas 0.07 C",
    category: "Pestañas",
    price: 8500,
    transferPrice: 7650,
    description: "Pestañas profesionales para diferentes técnicas.",
    image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=700&q=80",
    discount: 10
  },

  {
    id: 3,
    name: "Adhesivo",
    category: "Adhesivos",
    price: 12000,
    transferPrice: 10800,
    description: "Adhesivo profesional para extensiones de pestañas.",
    image: "https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=700&q=80",
    discount: 10
  },

  {
    id: 4,
    name: "Pinza Curva",
    category: "Pinzas",
    price: 7000,
    transferPrice: 6300,
    description: "Pinza curva de precisión para aplicación de extensiones.",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=700&q=80",
    discount: 10
  },

  {
    id: 5,
    name: "Pinza Recta",
    category: "Pinzas",
    price: 7000,
    transferPrice: 6300,
    description: "Pinza recta profesional para aislamiento.",
    image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=700&q=80",
    discount: 10
  },

  {
    id: 6,
    name: "Parche",
    category: "Accesorios",
    price: 5000,
    transferPrice: 4500,
    description: "Parche de hidrogel para el trabajo de extensiones.",
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=700&q=80",
    discount: 10
  },

  {
    id: 7,
    name: "Microbrush",
    category: "Accesorios",
    price: 3500,
    transferPrice: 3150,
    description: "Microbrush descartables para preparación y aplicación.",
    image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=700&q=80",
    discount: 10
  }

];


/* =====================================================
   ESTADO
   ===================================================== */

let cartItemsData =
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

const cartPanel =
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
   FORMATEAR PRECIO
   ===================================================== */

function formatPrice(price) {

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
  }).format(price);

}


/* =====================================================
   MOSTRAR PRODUCTOS
   ===================================================== */

function renderProducts() {

  let filtered = [...products];


  /* BÚSQUEDA */

  if (searchTerm.trim() !== "") {

    const term =
      searchTerm.toLowerCase().trim();

    filtered = filtered.filter(product =>
      product.name.toLowerCase().includes(term) ||
      product.category.toLowerCase().includes(term) ||
      product.description.toLowerCase().includes(term)
    );

  }


  /* CATEGORÍA */

  if (activeCategory !== "Todos") {

    filtered = filtered.filter(product =>
      product.category === activeCategory
    );

  }


  /* PRECIO */

  if (activePrice === "under10000") {

    filtered = filtered.filter(product =>
      product.price < 10000
    );

  }


  if (activePrice === "10000-20000") {

    filtered = filtered.filter(product =>
      product.price >= 10000 &&
      product.price <= 20000
    );

  }


  if (activePrice === "over20000") {

    filtered = filtered.filter(product =>
      product.price > 20000
    );

  }


  /* ORDEN */

  const sortElement =
    document.getElementById("sortProducts");

  if (sortElement) {

    const sort =
      sortElement.value;


    if (sort === "price-low") {

      filtered.sort((a, b) =>
        a.price - b.price
      );

    }


    if (sort === "price-high") {

      filtered.sort((a, b) =>
        b.price - a.price
      );

    }


    if (sort === "name") {

      filtered.sort((a, b) =>
        a.name.localeCompare(b.name)
      );

    }

  }


  /* LIMPIAR */

  productGrid.innerHTML = "";


  /* RESULTADOS */

  resultsCount.textContent =
    `${filtered.length} producto${filtered.length !== 1 ? "s" : ""}`;


  /* SIN RESULTADOS */

  if (filtered.length === 0) {

    noResults.style.display = "block";

    return;

  }


  noResults.style.display = "none";


  /* CREAR TARJETAS */

  filtered.forEach(product => {

    const card =
      document.createElement("article");

    card.className =
      "product-card";


    card.innerHTML = `

      <div class="product-image">

        <img
          src="${product.image}"
          alt="${product.name}"
          loading="lazy"
          onerror="this.src='https://via.placeholder.com/700x700?text=MILASHES'"
        >

        ${
          product.discount
            ? `<span class="discount">-${product.discount}%</span>`
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
          ${formatPrice(product.transferPrice)}
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


  /* BOTONES AGREGAR */

  document
    .querySelectorAll(".add-cart")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          addToCart(
            Number(button.dataset.id)
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
            Number(button.dataset.id)
          );

        }
      );

    });

}


/* =====================================================
   AGREGAR AL CARRITO
   ===================================================== */

function addToCart(productId) {

  const product =
    products.find(
      p => p.id === productId
    );


  if (!product) return;


  const existing =
    cartItemsData.find(
      item => item.id === productId
    );


  if (existing) {

    existing.quantity++;

  } else {

    cartItemsData.push({

      id: product.id,

      quantity: 1

    });

  }


  saveCart();

  renderCart();

  openCart();

}


/* =====================================================
   GUARDAR CARRITO
   ===================================================== */

function saveCart() {

  localStorage.setItem(
    "milashesCart",
    JSON.stringify(cartItemsData)
  );

}


/* =====================================================
   RENDER CARRITO
   ===================================================== */

function renderCart() {

  cartItems.innerHTML = "";


  if (cartItemsData.length === 0) {

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


  cartItemsData.forEach(item => {

    const product =
      products.find(
        p => p.id === item.id
      );


    if (!product) return;


    const subtotal =
      product.price * item.quantity;


    total += subtotal;

    quantityTotal += item.quantity;


    const element =
      document.createElement("div");


    element.className =
      "cart-item";


    element.innerHTML = `

      <img
        src="${product.image}"
        alt="${product.name}"
        onerror="this.src='https://via.placeholder.com/150x150?text=MILASHES'"
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


    cartItems.appendChild(element);

  });


  cartCount.textContent =
    quantityTotal;


  cartTotal.textContent =
    formatPrice(total);


  /* EVENTOS */

  document
    .querySelectorAll(".quantity button")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const id =
            Number(button.dataset.id);

          const action =
            button.dataset.action;


          changeQuantity(
            id,
            action
          );

        }
      );

    });

}


/* =====================================================
   CAMBIAR CANTIDAD
   ===================================================== */

function changeQuantity(id, action) {

  const item =
    cartItemsData.find(
      product => product.id === id
    );


  if (!item) return;


  if (action === "plus") {

    item.quantity++;

  }


  if (action === "minus") {

    item.quantity--;

    if (item.quantity <= 0) {

      cartItemsData =
        cartItemsData.filter(
          product => product.id !== id
        );

    }

  }


  if (action === "remove") {

    cartItemsData =
      cartItemsData.filter(
        product => product.id !== id
      );

  }


  saveCart();

  renderCart();

}


/* =====================================================
   ABRIR CARRITO
   ===================================================== */

function openCart() {

  cartPanel.classList.add("active");

  cartOverlay.classList.add("active");

  document.body.style.overflow =
    "hidden";

}


/* =====================================================
   CERRAR CARRITO
   ===================================================== */

function closeCartFunction() {

  cartPanel.classList.remove("active");

  cartOverlay.classList.remove("active");

  document.body.style.overflow =
    "";

}


/* =====================================================
   EVENTOS CARRITO
   ===================================================== */

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
   CHECKOUT WHATSAPP
   ===================================================== */

if (checkoutButton) {

  checkoutButton.addEventListener(
    "click",
    checkout
  );

}


function checkout() {

  if (cartItemsData.length === 0) {

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


  cartItemsData.forEach(item => {

    const product =
      products.find(
        p => p.id === item.id
      );


    if (!product) return;


    const subtotal =
      product.price * item.quantity;


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


      const productos =
        document.getElementById(
          "productos"
        );


      if (productos) {

        productos.scrollIntoView({
          behavior: "smooth"
        });

      }

    }
  );

}


/* =====================================================
   FILTROS CATEGORÍA
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
   FILTROS PRECIO
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
   ORDENAR
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

      activeCategory = "Todos";

      activePrice = "all";

      searchTerm = "";


      if (searchInput) {

        searchInput.value = "";

      }


      const categoryTodos =
        document.querySelector(
          'input[name="category"][value="Todos"]'
        );


      if (categoryTodos) {

        categoryTodos.checked = true;

      }


      const priceAll =
        document.querySelector(
          'input[name="price"][value="all"]'
        );


      if (priceAll) {

        priceAll.checked = true;

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

          radio.checked = true;

        }


        renderProducts();


        const productos =
          document.getElementById(
            "productos"
          );


        if (productos) {

          productos.scrollIntoView({
            behavior: "smooth"
          });

        }

      }
    );

  });


/* =====================================================
   MODAL PRODUCTO
   ===================================================== */

function openProduct(id) {

  const product =
    products.find(
      p => p.id === id
    );


  if (!product) return;


  modalContent.innerHTML = `

    <div class="modal-product">

      <img
        src="${product.image}"
        alt="${product.name}"
        onerror="this.src='https://via.placeholder.com/700x700?text=MILASHES'"
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
          ${formatPrice(product.transferPrice)}
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


  const modalAddCart =
    document.getElementById(
      "modalAddCart"
    );


  if (modalAddCart) {

    modalAddCart.addEventListener(
      "click",
      () => {

        addToCart(product.id);

        closeProductModal();

      }
    );

  }

}


/* =====================================================
   CERRAR MODAL
   ===================================================== */

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
        event.target === productModal
      ) {

        closeProductModal();

      }

    }
  );

}


/* =====================================================
   MENÚ MOBILE
   ===================================================== */

if (mobileMenu && nav) {

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
        .includes("instagram")
    ) {

      link.href =
        INSTAGRAM_URL;

    }

  });


/* =====================================================
   WHATSAPP
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
   ESCAPE PARA CERRAR
   ===================================================== */

document.addEventListener(
  "keydown",
  event => {

    if (event.key === "Escape") {

      closeCartFunction();

      closeProductModal();

    }

  }
);


/* =====================================================
   INICIALIZACIÓN
   ===================================================== */

renderProducts();

renderCart();