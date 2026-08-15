/* =====================================================
   MILASHES INSUMOS
   PANEL DE ADMINISTRACIÓN
   SUPABASE
===================================================== */


/* =====================================================
   CONFIGURACIÓN SUPABASE
===================================================== */

const SUPABASE_URL =
  "https://dnorgfrhhuclcgptgdqm.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_BnnKBE7o9TJHWA-12CmVIw_vv3M5HJi";


const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );


/* =====================================================
   ELEMENTOS
===================================================== */

const loginScreen =
  document.getElementById("loginScreen");

const adminScreen =
  document.getElementById("adminScreen");

const loginForm =
  document.getElementById("loginForm");

const loginEmail =
  document.getElementById("loginEmail");

const loginPassword =
  document.getElementById("loginPassword");

const loginError =
  document.getElementById("loginError");

const logoutButton =
  document.getElementById("logoutButton");

const productsList =
  document.getElementById("productsList");

const adminSearch =
  document.getElementById("adminSearch");

const totalProducts =
  document.getElementById("totalProducts");

const activeProducts =
  document.getElementById("activeProducts");

const totalCategories =
  document.getElementById("totalCategories");

const newProductButton =
  document.getElementById("newProductButton");

const productModal =
  document.getElementById("productModal");

const closeModal =
  document.getElementById("closeModal");

const cancelProduct =
  document.getElementById("cancelProduct");

const productForm =
  document.getElementById("productForm");

const modalTitle =
  document.getElementById("modalTitle");

const productId =
  document.getElementById("productId");

const productName =
  document.getElementById("productName");

const productCategory =
  document.getElementById("productCategory");

const productPrice =
  document.getElementById("productPrice");

const productTransferPrice =
  document.getElementById("productTransferPrice");

const productStock =
  document.getElementById("productStock");

const productDiscount =
  document.getElementById("productDiscount");

const productImage =
  document.getElementById("productImage");

const productDescription =
  document.getElementById("productDescription");

const productActive =
  document.getElementById("productActive");

const productOffer =
  document.getElementById("productOffer");

const catalogTabs =
  document.getElementById("catalogTabs");

const formMessage =
  document.getElementById("formMessage");

const toast =
  document.getElementById("toast");


/* =====================================================
   ESTADO
===================================================== */

let products = [];

let editingProductId = null;

let catalogView = "all";


/* =====================================================
   FORMATO PRECIO
===================================================== */

function formatPrice(price) {

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
  }).format(price || 0);

}


/* =====================================================
   TOAST
===================================================== */

function showToast(message) {

  toast.textContent = message;

  toast.classList.add("show");

  setTimeout(() => {

    toast.classList.remove("show");

  }, 3000);

}


/* =====================================================
   LOGIN
===================================================== */

loginForm.addEventListener(
  "submit",
  async function(event) {

    event.preventDefault();

    loginError.textContent = "";

    const email =
      loginEmail.value.trim();

    const password =
      loginPassword.value;

    if (!email || !password) {

      loginError.textContent =
        "Completá todos los campos.";

      return;

    }


    const {
      data,
      error
    } =
      await supabaseClient.auth.signInWithPassword({
        email,
        password
      });


    if (error) {

      console.error(error);

      loginError.textContent =
        "Email o contraseña incorrectos.";

      return;

    }


    if (data.session) {

      showAdmin();

    }

  }
);


/* =====================================================
   MOSTRAR ADMIN
===================================================== */

function showAdmin() {

  loginScreen.style.display =
    "none";

  adminScreen.classList.add(
    "active"
  );

  loadProducts();

}


/* =====================================================
   LOGOUT
===================================================== */

logoutButton.addEventListener(
  "click",
  async function() {

    await supabaseClient.auth.signOut();

    adminScreen.classList.remove(
      "active"
    );

    loginScreen.style.display =
      "flex";

    loginForm.reset();

  }
);


/* =====================================================
   COMPROBAR SESIÓN
===================================================== */

async function checkSession() {

  const {
    data
  } =
    await supabaseClient.auth.getSession();


  if (data.session) {

    showAdmin();

  } else {

    loginScreen.style.display =
      "flex";

    adminScreen.classList.remove(
      "active"
    );

  }

}


checkSession();


/* =====================================================
   CARGAR PRODUCTOS
===================================================== */

async function loadProducts() {

  productsList.innerHTML = `
    <div class="empty-products">
      Cargando productos...
    </div>
  `;


  const {
    data,
    error
  } =
    await supabaseClient
      .from("products")
      .select("*")
      .order("id", {
        ascending: false
      });


  if (error) {

    console.error(error);

    productsList.innerHTML = `
      <div class="empty-products">
        No se pudieron cargar los productos.
        <br><br>
        ${error.message}
      </div>
    `;

    return;

  }


  products = data || [];

  renderProducts();

  updateStats();

}


/* =====================================================
   MOSTRAR PRODUCTOS
===================================================== */

function renderProducts() {

  const search =
    adminSearch.value
      .trim()
      .toLowerCase();


  let filtered =
    [...products];


  if (catalogView === "offers") {

    filtered = filtered.filter(product =>
      product.is_offer === true
    );

  }


  if (catalogView === "featured") {

    // Destacados = los 10 productos activos con más ventas.
    // No depende de marcar featured manualmente.
    filtered = filtered
      .filter(product => product.active !== false)
      .sort((a, b) => {
        const salesA = Number(a.sales_count) || 0;
        const salesB = Number(b.sales_count) || 0;

        if (salesB !== salesA) {
          return salesB - salesA;
        }

        return Number(b.id) - Number(a.id);
      })
      .slice(0, 10);

  }


  if (search) {

    filtered =
      filtered.filter(product => {

        return (

          String(product.name || "")
            .toLowerCase()
            .includes(search)

          ||

          String(product.category || "")
            .toLowerCase()
            .includes(search)

        );

      });

  }


  if (filtered.length === 0) {

    productsList.innerHTML = `
      <div class="empty-products">
        No hay productos para mostrar.
      </div>
    `;

    return;

  }


  productsList.innerHTML = "";


  filtered.forEach(product => {

    const row =
      document.createElement("div");

    row.className =
      "product-row";


    const image =
      product.image ||
      "https://via.placeholder.com/150?text=Sin+imagen";


    const active =
      product.active !== false;


    row.innerHTML = `

      <img
        src="${image}"
        alt="${escapeHTML(product.name || "")}"
      >

      <div class="product-row-info">

        <span>
          ${escapeHTML(product.category || "Sin categoría")}
        </span>

        <h3>
          ${escapeHTML(product.name || "Sin nombre")}
        </h3>

      </div>

      <div class="product-row-price">

        ${formatPrice(product.price)}

      </div>

      <div class="product-row-status">

        ${
          active
            ? `<span class="status-active">● ACTIVO</span>`
            : `<span class="status-inactive">● INACTIVO</span>`
        }

        <div style="margin-top:5px;font-size:10px;color:#777;font-weight:600;">
          STOCK: ${Math.max(0, Number(product.stock) || 0)}
        </div>
        <div style="margin-top:4px;font-size:10px;color:#777;font-weight:600;">
          VENDIDOS: ${Math.max(0, Number(product.sales_count) || 0)}
        </div>

        <div class="product-tags">
          ${product.is_offer ? '<span class="admin-tag offer">OFERTA</span>' : ''}
          ${product.featured ? '<span class="admin-tag featured">DESTACADO</span>' : ''}
        </div>

      </div>

      <div class="product-actions">

        <button
          class="edit"
          data-id="${product.id}"
        >
          Editar
        </button>

        <button
          class="delete"
          data-id="${product.id}"
        >
          Eliminar
        </button>

      </div>

    `;


    productsList.appendChild(row);

  });


  /* EDITAR */

  document
    .querySelectorAll(".edit")
    .forEach(button => {

      button.addEventListener(
        "click",
        function() {

          const id =
            Number(this.dataset.id);

          editProduct(id);

        }
      );

    });


  /* ELIMINAR */

  document
    .querySelectorAll(".delete")
    .forEach(button => {

      button.addEventListener(
        "click",
        function() {

          const id =
            Number(this.dataset.id);

          deleteProduct(id);

        }
      );

    });

}


/* =====================================================
   ESTADÍSTICAS
===================================================== */

function updateStats() {

  totalProducts.textContent =
    products.length;


  activeProducts.textContent =
    products.filter(product =>
      product.active !== false
    ).length;


  const categories =
    new Set(
      products.map(product =>
        product.category
      )
    );


  totalCategories.textContent =
    categories.size;

}


/* =====================================================
   NUEVO PRODUCTO
===================================================== */

newProductButton.addEventListener(
  "click",
  function() {

    openNewProduct();

  }
);


function openNewProduct() {

  editingProductId = null;

  productForm.reset();

  productId.value = "";

  productDiscount.value = "0";

  productStock.value = "0";

  productActive.checked = true;

  modalTitle.textContent =
    "Nuevo producto";

  formMessage.textContent = "";

  productModal.classList.add(
    "active"
  );

  productName.focus();

}


/* =====================================================
   EDITAR PRODUCTO
===================================================== */

function editProduct(id) {

  const product =
    products.find(
      item => Number(item.id) === Number(id)
    );


  if (!product) return;


  editingProductId =
    product.id;


  productId.value =
    product.id;


  productName.value =
    product.name || "";


  productCategory.value =
    product.category || "";


  productPrice.value =
    product.price || "";


  productTransferPrice.value =
    product.transfer_price || "";


  productDiscount.value =
    product.discount || 0;


  productOffer.checked =
    product.is_offer === true;


  productStock.value =
    Math.max(0, Number(product.stock) || 0);


  productImage.value =
    product.image || "";


  productDescription.value =
    product.description || "";


  productActive.checked =
    product.active !== false;


  modalTitle.textContent =
    "Editar producto";


  formMessage.textContent = "";


  productModal.classList.add(
    "active"
  );

}


/* =====================================================
   GUARDAR PRODUCTO
===================================================== */

productForm.addEventListener(
  "submit",
  async function(event) {

    event.preventDefault();

    formMessage.textContent =
      "Guardando...";


    const productData = {

      name:
        productName.value.trim(),

      category:
        productCategory.value,

      price:
        Number(productPrice.value),

      transfer_price:
        Number(productTransferPrice.value),

      discount:
        Number(productDiscount.value || 0),

      is_offer:
        productOffer.checked,

      stock:
        Math.max(0, Math.floor(Number(productStock.value) || 0)),

      image:
        productImage.value.trim(),

      description:
        productDescription.value.trim(),

      active:
        productActive.checked

    };


    if (
      !productData.name ||
      !productData.category ||
      !productData.price
    ) {

      formMessage.textContent =
        "Completá nombre, categoría y precio.";

      return;

    }


    let result;


    if (editingProductId) {

      result =
        await supabaseClient
          .from("products")
          .update(productData)
          .eq("id", editingProductId);

    } else {

      result =
        await supabaseClient
          .from("products")
          .insert([
            productData
          ]);

    }


    if (result.error) {

      console.error(result.error);

      formMessage.textContent =
        "Error: " +
        result.error.message;

      return;

    }


    closeProductModal();

    showToast(
      editingProductId
        ? "Producto actualizado."
        : "Producto creado."
    );


    await loadProducts();

  }
);


/* =====================================================
   ELIMINAR PRODUCTO
===================================================== */

async function deleteProduct(id) {

  const product =
    products.find(
      item => Number(item.id) === Number(id)
    );


  if (!product) return;


  const confirmed =
    confirm(
      `¿Querés eliminar "${product.name}"?`
    );


  if (!confirmed) return;


  const {
    error
  } =
    await supabaseClient
      .from("products")
      .delete()
      .eq("id", id);


  if (error) {

    console.error(error);

    showToast(
      "No se pudo eliminar el producto."
    );

    return;

  }


  showToast(
    "Producto eliminado."
  );


  await loadProducts();

}


/* =====================================================
   CERRAR MODAL
===================================================== */

function closeProductModal() {

  productModal.classList.remove(
    "active"
  );

  productForm.reset();

  editingProductId = null;

}


closeModal.addEventListener(
  "click",
  closeProductModal
);


cancelProduct.addEventListener(
  "click",
  closeProductModal
);


productModal.addEventListener(
  "click",
  function(event) {

    if (
      event.target === productModal
    ) {

      closeProductModal();

    }

  }
);


/* =====================================================
   APARTADOS OFERTAS / DESTACADOS
===================================================== */

if (catalogTabs) {

  catalogTabs.querySelectorAll(".catalog-tab").forEach(button => {

    button.addEventListener("click", function() {

      catalogView = this.dataset.view || "all";

      catalogTabs.querySelectorAll(".catalog-tab").forEach(tab => {
        tab.classList.remove("active");
      });

      this.classList.add("active");

      renderProducts();

    });

  });

}


/* =====================================================
   BUSCADOR ADMIN
===================================================== */

adminSearch.addEventListener(
  "input",
  renderProducts
);


/* =====================================================
   ESCAPE
===================================================== */

document.addEventListener(
  "keydown",
  function(event) {

    if (
      event.key === "Escape" &&
      productModal.classList.contains("active")
    ) {

      closeProductModal();

    }

  }
);


/* =====================================================
   ESCAPAR HTML
===================================================== */

function escapeHTML(value) {

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}