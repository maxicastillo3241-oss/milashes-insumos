/* =====================================================
   MILASHES INSUMOS
   TIENDA
   SUPABASE + CARRITO + FILTROS
===================================================== */


/* =====================================================
   SUPABASE
===================================================== */

const SUPABASE_URL = "https://dnorgfrhhuclcgptgdqm.supabase.co";

const SUPABASE_KEY = "sb_publishable_BnnKBE7o9TJHWA-12CmVIw_vv3M5HJi";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

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

const sortProducts =
  document.getElementById("sortProducts");

const clearFilters =
  document.getElementById("clearFilters");

const cartButton =
  document.getElementById("cartButton");

const cart =
  document.getElementById("cart");

const cartOverlay =
  document.getElementById("cartOverlay");

const closeCart =
  document.getElementById("closeCart");

const continueShopping =
  document.getElementById("continueShopping");

const cartItems =
  document.getElementById("cartItems");

const cartCount =
  document.getElementById("cartCount");

const cartTotal =
  document.getElementById("cartTotal");

const checkoutButton =
  document.getElementById("checkoutButton");

const productModal =
  document.getElementById("productModal");

const modalContent =
  document.getElementById("modalContent");

const closeModal =
  document.getElementById("closeModal");

const mobileMenu =
  document.getElementById("mobileMenu");

const nav =
  document.getElementById("nav");

const whatsappContact =
  document.getElementById("whatsappContact");


/* =====================================================
   ESTADO
===================================================== */

let products = [];

let cartData =
  JSON.parse(
    localStorage.getItem("milashes_cart") || "[]"
  );


/* =====================================================
   CONFIGURACIÓN WHATSAPP
   CAMBIÁ EL NÚMERO POR EL DE MILASHES
===================================================== */

const WHATSAPP_NUMBER =
  "5491156348200";


/* =====================================================
   FORMATO DE PRECIO
===================================================== */

function formatPrice(price) {

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
  }).format(Number(price) || 0);

}


/* =====================================================
   ESCAPAR HTML
===================================================== */

function escapeHTML(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


/* =====================================================
   IMAGEN POR DEFECTO
===================================================== */

function getProductImage(product) {

  return product.image ||
    "https://via.placeholder.com/600x600?text=MILASHES";


}


/* =====================================================
   CARGAR PRODUCTOS DESDE SUPABASE
===================================================== */

async function loadProducts() {

  productGrid.innerHTML = `
    <div style="
      grid-column:1/-1;
      text-align:center;
      padding:60px 20px;
      color:#777;
      font-size:12px;
    ">
      Cargando productos...
    </div>
  `;

  noResults.style.display = "none";


  const {
    data,
    error
  } =
    await supabaseClient
      .from("products")
      .select("*")
      .eq("active", true)
      .order("id", {
        ascending: false
      });


  if (error) {

    console.error(
      "Error cargando productos:",
      error
    );

    productGrid.innerHTML = `
      <div style="
        grid-column:1/-1;
        text-align:center;
        padding:60px 20px;
        color:#c45b68;
        font-size:12px;
      ">
        No se pudieron cargar los productos.
        <br><br>
        ${escapeHTML(error.message)}
      </div>
    `;

    resultsCount.textContent =
      "0 productos";

    return;

  }


  products = data || [];


  console.log(
    "Productos cargados desde Supabase:",
    products
  );


  applyFilters();

}


/* =====================================================
   FILTROS
===================================================== */

function getSelectedCategory() {

  const selected =
    document.querySelector(
      'input[name="category"]:checked'
    );

  return selected
    ? selected.value
    : "Todos";

}


function getSelectedPrice() {

  const selected =
    document.querySelector(
      'input[name="price"]:checked'
    );

  return selected
    ? selected.value
    : "all";

}


/* =====================================================
   APLICAR FILTROS
===================================================== */

function applyFilters() {

  let filtered =
    [...products];


  /* -------------------------
     CATEGORÍA
  ------------------------- */

  const category =
    getSelectedCategory();


  if (
    category &&
    category !== "Todos"
  ) {

    filtered =
      filtered.filter(product =>
        String(product.category || "")
          .toLowerCase() ===
        category.toLowerCase()
      );

  }


  /* -------------------------
     PRECIO
  ------------------------- */

  const priceFilter =
    getSelectedPrice();


  if (priceFilter === "under10000") {

    filtered =
      filtered.filter(product =>
        Number(product.price) < 10000
      );

  }


  if (priceFilter === "10000-20000") {

    filtered =
      filtered.filter(product =>
        Number(product.price) >= 10000 &&
        Number(product.price) <= 20000
      );

  }


  if (priceFilter === "over20000") {

    filtered =
      filtered.filter(product =>
        Number(product.price) > 20000
      );

  }


  /* -------------------------
     BÚSQUEDA
  ------------------------- */

  const search =
    searchInput
      ? searchInput.value
          .trim()
          .toLowerCase()
      : "";


  if (search) {

    filtered =
      filtered.filter(product => {

        const name =
          String(product.name || "")
            .toLowerCase();

        const categoryText =
          String(product.category || "")
            .toLowerCase();

        const description =
          String(product.description || "")
            .toLowerCase();

        return (
          name.includes(search) ||
          categoryText.includes(search) ||
          description.includes(search)
        );

      });

  }


  /* -------------------------
     ORDEN
  ------------------------- */

  const sort =
    sortProducts
      ? sortProducts.value
      : "default";


  if (sort === "price-low") {

    filtered.sort(
      (a, b) =>
        Number(a.price || 0) -
        Number(b.price || 0)
    );

  }


  if (sort === "price-high") {

    filtered.sort(
      (a, b) =>
        Number(b.price || 0) -
        Number(a.price || 0)
    );

  }


  if (sort === "name") {

    filtered.sort(
      (a, b) =>
        String(a.name || "")
          .localeCompare(
            String(b.name || ""),
            "es"
          )
    );

  }


  renderProducts(filtered);

}


/* =====================================================
   MOSTRAR PRODUCTOS
===================================================== */

function renderProducts(list) {

  productGrid.innerHTML = "";


  resultsCount.textContent =
    `${list.length} ${
      list.length === 1
        ? "producto"
        : "productos"
    }`;


  if (list.length === 0) {

    noResults.style.display =
      "block";

    return;

  }


  noResults.style.display =
    "none";


  list.forEach(product => {

    const card =
      document.createElement("article");

    card.className =
      "product-card";


    const image =
      getProductImage(product);


    const price =
      Number(product.price) || 0;


    const transferPrice =
      Number(product.transfer_price) || 0;


    const discount =
      Number(product.discount) || 0;


    card.innerHTML = `

      <div class="product-image">

        <img
          src="${escapeHTML(image)}"
          alt="${escapeHTML(product.name || "Producto")}"
          loading="lazy"
        >

        ${
          discount > 0
            ? `
              <span class="discount">
                -${discount}%
              </span>
            `
            : ""
        }

      </div>


      <div class="product-info">

        <div class="product-category">
          ${escapeHTML(
            product.category ||
            "Sin categoría"
          )}
        </div>


        <div class="product-name">
          ${escapeHTML(
            product.name ||
            "Producto sin nombre"
          )}
        </div>


        <div class="product-description">
          ${escapeHTML(
            product.description ||
            ""
          )}
        </div>


        <div class="price">
          ${formatPrice(price)}
        </div>


        ${
          transferPrice > 0
            ? `
              <div class="transfer-price">
                Transferencia:
                ${formatPrice(transferPrice)}
              </div>
            `
            : ""
        }


        <button
          class="add-cart"
          data-id="${product.id}"
        >
          AGREGAR AL CARRITO
        </button>


        <div
          class="view-product"
          data-id="${product.id}"
        >
          Ver producto
        </div>

      </div>

    `;


    productGrid.appendChild(card);

  });


  /* -------------------------
     BOTONES CARRITO
  ------------------------- */

  productGrid
    .querySelectorAll(".add-cart")
    .forEach(button => {

      button.addEventListener(
        "click",
        function() {

          const id =
            this.dataset.id;

          addToCart(id);

        }
      );

    });


  /* -------------------------
     VER PRODUCTO
  ------------------------- */

  productGrid
    .querySelectorAll(".view-product")
    .forEach(button => {

      button.addEventListener(
        "click",
        function() {

          const id =
            this.dataset.id;

          openProductModal(id);

        }
      );

    });

}


/* =====================================================
   CATEGORÍAS
===================================================== */

document
  .querySelectorAll(
    ".category-card"
  )
  .forEach(button => {

    button.addEventListener(
      "click",
      function() {

        const category =
          this.dataset.category;


        const radio =
          document.querySelector(
            `input[name="category"][value="${category}"]`
          );


        if (radio) {

          radio.checked =
            true;

        }


        applyFilters();


        const productsSection =
          document.getElementById(
            "productos"
          );


        if (productsSection) {

          productsSection.scrollIntoView({
            behavior: "smooth"
          });

        }

      }
    );

  });


/* =====================================================
   NAV CATEGORÍAS
===================================================== */

document
  .querySelectorAll(
    ".nav a[data-category]"
  )
  .forEach(link => {

    link.addEventListener(
      "click",
      function(event) {

        const category =
          this.dataset.category;


        if (category === "Todos") {

          event.preventDefault();

        }


        const radio =
          document.querySelector(
            `input[name="category"][value="${category}"]`
          );


        if (radio) {

          radio.checked =
            true;

        }


        applyFilters();

      }
    );

  });


/* =====================================================
   RADIO FILTROS
===================================================== */

document
  .querySelectorAll(
    'input[name="category"], input[name="price"]'
  )
  .forEach(input => {

    input.addEventListener(
      "change",
      applyFilters
    );

  });


/* =====================================================
   LIMPIAR FILTROS
===================================================== */

if (clearFilters) {

  clearFilters.addEventListener(
    "click",
    function() {

      const allCategory =
        document.querySelector(
          'input[name="category"][value="Todos"]'
        );

      const allPrice =
        document.querySelector(
          'input[name="price"][value="all"]'
        );


      if (allCategory) {

        allCategory.checked =
          true;

      }


      if (allPrice) {

        allPrice.checked =
          true;

      }


      if (searchInput) {

        searchInput.value =
          "";

      }


      if (sortProducts) {

        sortProducts.value =
          "default";

      }


      applyFilters();

    }
  );

}


/* =====================================================
   BUSCADOR
===================================================== */

if (searchInput) {

  searchInput.addEventListener(
    "input",
    applyFilters
  );

}


if (searchButton) {

  searchButton.addEventListener(
    "click",
    applyFilters
  );

}


/* =====================================================
   ORDEN
===================================================== */

if (sortProducts) {

  sortProducts.addEventListener(
    "change",
    applyFilters
  );

}


/* =====================================================
   CARRITO
===================================================== */

function saveCart() {

  localStorage.setItem(
    "milashes_cart",
    JSON.stringify(cartData)
  );

}


function addToCart(id) {

  const product =
    products.find(
      item =>
        String(item.id) ===
        String(id)
    );


  if (!product) {

    alert(
      "No se encontró el producto."
    );

    return;

  }


  const existing =
    cartData.find(
      item =>
        String(item.id) ===
        String(id)
    );


  if (existing) {

    existing.quantity += 1;

  } else {

    cartData.push({

      id: product.id,

      name: product.name,

      price: Number(product.price) || 0,

      image: product.image || "",

      quantity: 1

    });

  }


  saveCart();

  updateCart();


  openCart();


}


/* =====================================================
   ACTUALIZAR CARRITO
===================================================== */

function updateCart() {

  const totalItems =
    cartData.reduce(
      (total, item) =>
        total + Number(item.quantity || 0),
      0
    );


  cartCount.textContent =
    totalItems;


  if (cartData.length === 0) {

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

    cartTotal.textContent =
      "$0";

    return;

  }


  cartItems.innerHTML =
    "";


  let total =
    0;


  cartData.forEach(item => {

    const quantity =
      Number(item.quantity) || 1;

    const price =
      Number(item.price) || 0;

    const subtotal =
      price * quantity;


    total +=
      subtotal;


    const element =
      document.createElement("div");

    element.className =
      "cart-item";


    element.innerHTML = `

      <img
        src="${escapeHTML(
          item.image ||
          "https://via.placeholder.com/150?text=Producto"
        )}"
        alt="${escapeHTML(item.name || "")}"
      >


      <div class="cart-item-info">

        <h4>
          ${escapeHTML(
            item.name ||
            "Producto"
          )}
        </h4>


        <div class="cart-item-price">
          ${formatPrice(price)}
        </div>


        <div class="quantity">

          <button
            class="decrease"
            data-id="${item.id}"
          >
            −
          </button>


          <span>
            ${quantity}
          </span>


          <button
            class="increase"
            data-id="${item.id}"
          >
            +
          </button>


          <button
            class="remove-item"
            data-id="${item.id}"
          >
            Eliminar
          </button>

        </div>

      </div>

    `;


    cartItems.appendChild(element);

  });


  cartTotal.textContent =
    formatPrice(total);


  /* -------------------------
     CANTIDAD -
  ------------------------- */

  cartItems
    .querySelectorAll(".decrease")
    .forEach(button => {

      button.addEventListener(
        "click",
        function() {

          changeQuantity(
            this.dataset.id,
            -1
          );

        }
      );

    });


  /* -------------------------
     CANTIDAD +
  ------------------------- */

  cartItems
    .querySelectorAll(".increase")
    .forEach(button => {

      button.addEventListener(
        "click",
        function() {

          changeQuantity(
            this.dataset.id,
            1
          );

        }
      );

    });


  /* -------------------------
     ELIMINAR
  ------------------------- */

  cartItems
    .querySelectorAll(".remove-item")
    .forEach(button => {

      button.addEventListener(
        "click",
        function() {

          removeFromCart(
            this.dataset.id
          );

        }
      );

    });

}


/* =====================================================
   CAMBIAR CANTIDAD
===================================================== */

function changeQuantity(id, amount) {

  const item =
    cartData.find(
      product =>
        String(product.id) ===
        String(id)
    );


  if (!item) return;


  item.quantity +=
    amount;


  if (item.quantity <= 0) {

    cartData =
      cartData.filter(
        product =>
          String(product.id) !==
          String(id)
      );

  }


  saveCart();

  updateCart();

}


/* =====================================================
   ELIMINAR DEL CARRITO
===================================================== */

function removeFromCart(id) {

  cartData =
    cartData.filter(
      product =>
        String(product.id) !==
        String(id)
    );


  saveCart();

  updateCart();

}


/* =====================================================
   ABRIR CARRITO
===================================================== */

function openCart() {

  cart.classList.add(
    "active"
  );

  cartOverlay.classList.add(
    "active"
  );

}


/* =====================================================
   CERRAR CARRITO
===================================================== */

function closeCartPanel() {

  cart.classList.remove(
    "active"
  );

  cartOverlay.classList.remove(
    "active"
  );

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
    closeCartPanel
  );

}


if (cartOverlay) {

  cartOverlay.addEventListener(
    "click",
    closeCartPanel
  );

}


if (continueShopping) {

  continueShopping.addEventListener(
    "click",
    closeCartPanel
  );

}


/* =====================================================
   MODAL PRODUCTO
===================================================== */

function openProductModal(id) {

  const product =
    products.find(
      item =>
        String(item.id) ===
        String(id)
    );


  if (!product) return;


  const image =
    getProductImage(product);


  const price =
    Number(product.price) || 0;


  const transferPrice =
    Number(product.transfer_price) || 0;


  modalContent.innerHTML = `

    <div class="modal-product">

      <div>

        <img
          src="${escapeHTML(image)}"
          alt="${escapeHTML(
            product.name || "Producto"
          )}"
        >

      </div>


      <div class="modal-info">

        <div class="product-category">

          ${escapeHTML(
            product.category ||
            "Sin categoría"
          )}

        </div>


        <h2>

          ${escapeHTML(
            product.name ||
            "Producto"
          )}

        </h2>


        <p>

          ${escapeHTML(
            product.description ||
            "Sin descripción."
          )}

        </p>


        <div class="modal-price">

          ${formatPrice(price)}

        </div>


        ${
          transferPrice > 0
            ? `
              <div class="transfer-price">

                Precio transferencia:
                ${formatPrice(transferPrice)}

              </div>
            `
            : ""
        }


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


  const modalAddCart =
    document.getElementById(
      "modalAddCart"
    );


  if (modalAddCart) {

    modalAddCart.addEventListener(
      "click",
      function() {

        addToCart(product.id);

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
    function(event) {

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
   TECLA ESC
===================================================== */

document.addEventListener(
  "keydown",
  function(event) {

    if (
      event.key === "Escape"
    ) {

      closeProductModal();

      closeCartPanel();

    }

  }
);


/* =====================================================
   CHECKOUT WHATSAPP
===================================================== */

if (checkoutButton) {

  checkoutButton.addEventListener(
    "click",
    function() {

      if (cartData.length === 0) {

        alert(
          "Tu carrito está vacío."
        );

        return;

      }


      let message =
        "Hola! Quiero realizar este pedido:%0A%0A";


      let total =
        0;


      cartData.forEach(item => {

        const quantity =
          Number(item.quantity) || 1;

        const price =
          Number(item.price) || 0;

        const subtotal =
          quantity * price;


        total +=
          subtotal;


        message +=
          `• ${item.name} x${quantity} - ${formatPrice(subtotal)}%0A`;

      });


      message +=
        `%0ATotal: ${formatPrice(total)}`;


      const url =
        `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;


      window.open(
        url,
        "_blank"
      );

    }
  );

}


/* =====================================================
   WHATSAPP CONTACTO
===================================================== */

if (whatsappContact) {

  whatsappContact.href =
    `https://wa.me/${WHATSAPP_NUMBER}`;

  whatsappContact.target =
    "_blank";

}


/* =====================================================
   MENÚ MOBILE
===================================================== */

if (mobileMenu) {

  mobileMenu.addEventListener(
    "click",
    function() {

      nav.classList.toggle(
        "active"
      );

    }
  );

}


/* =====================================================
   CERRAR MENÚ MOBILE
===================================================== */

document
  .querySelectorAll(".nav a")
  .forEach(link => {

    link.addEventListener(
      "click",
      function() {

        nav.classList.remove(
          "active"
        );

      }
    );

  });


/* =====================================================
   INICIAR TIENDA
===================================================== */

updateCart();

loadProducts();


/* =====================================================
   RECARGAR PRODUCTOS AUTOMÁTICAMENTE
   Cada 30 segundos consulta Supabase.
   Así los productos nuevos aparecen sin
   tener que modificar el código.
===================================================== */

setInterval(
  loadProducts,
  30000
);