/* =====================================================
   MILASHES INSUMOS
   TIENDA
   SUPABASE + CARRITO + FILTROS + STOCK
   Basado en la tienda original; solo se agrega la
   validación de stock.
===================================================== */

const SUPABASE_URL = "https://dnorgfrhhuclcgptgdqm.supabase.co";
const SUPABASE_KEY = "sb_publishable_BnnKBE7o9TJHWA-12CmVIw_vv3M5HJi";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const productGrid = document.getElementById("productGrid");
const featuredGrid = document.getElementById("featuredGrid");
const resultsCount = document.getElementById("resultsCount");
const noResults = document.getElementById("noResults");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const sortProducts = document.getElementById("sortProducts");
const clearFilters = document.getElementById("clearFilters");
const cartButton = document.getElementById("cartButton");
const cart = document.getElementById("cart");
const cartOverlay = document.getElementById("cartOverlay");
const closeCart = document.getElementById("closeCart");
const continueShopping = document.getElementById("continueShopping");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");
const checkoutButton = document.getElementById("checkoutButton");
const productModal = document.getElementById("productModal");
const modalContent = document.getElementById("modalContent");
const closeModal = document.getElementById("closeModal");
const mobileMenu = document.getElementById("mobileMenu");
const nav = document.getElementById("nav");
const whatsappContact = document.getElementById("whatsappContact");

/* =====================================================
   CONTROLES DE CATÁLOGO EN MÓVIL
===================================================== */

function setupMobileCatalogControls() {
  const sortButton = document.getElementById("mobileSortButton");
  const filterButton = document.getElementById("mobileFilterButton");
  const sortSelect = document.getElementById("sortProducts");
  const existingFilters = document.getElementById("filters");
  const mobilePanel = document.getElementById("mobileFilterPanel");
  const sideSort = document.getElementById("sortProductsSide");

  if (sideSort && sortSelect) {
    sideSort.value = sortSelect.value;
    sideSort.addEventListener("change", () => {
      sortSelect.value = sideSort.value;
      applyFilters();
    });
  }
  const closeMobileFilters = document.getElementById("closeMobileFilters");

  if (sortButton && sortSelect) {
    sortButton.addEventListener("click", () => {
      sortSelect.focus();
      if (typeof sortSelect.showPicker === "function") {
        try { sortSelect.showPicker(); } catch (e) {}
      }
    });
  }

  if (filterButton) {
    filterButton.addEventListener("click", () => {
      if (mobilePanel) {
        mobilePanel.classList.add("active");
        document.body.classList.add("mobile-filter-open");
      } else if (existingFilters) {
        existingFilters.classList.add("mobile-open");
        document.body.classList.add("mobile-filter-open");
      }
    });
  }

  const closePanel = () => {
    if (mobilePanel) mobilePanel.classList.remove("active");
    if (existingFilters) existingFilters.classList.remove("mobile-open");
    document.body.classList.remove("mobile-filter-open");
  };

  if (closeMobileFilters) closeMobileFilters.addEventListener("click", closePanel);

  document.addEventListener("click", event => {
    if (event.target.matches("#mobileFilterPanel .filter-group input")) {
      setTimeout(closePanel, 150);
    }
  });
}

setupMobileCatalogControls();


let products = [];
let cartData = JSON.parse(localStorage.getItem("milashes_cart") || "[]");
const WHATSAPP_NUMBER = "5491156348200";

if (whatsappContact) {
  whatsappContact.href = `https://wa.me/${WHATSAPP_NUMBER}`;
  whatsappContact.target = "_blank";
}

function formatPrice(price) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(Number(price) || 0);
}

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function getProductImage(product) {
  return product.image || "https://via.placeholder.com/600x600?text=MILASHES";
}

function getStock(product) {
  const stock = Number(product?.stock);
  return Number.isFinite(stock) && stock > 0 ? Math.floor(stock) : 0;
}

function getCartQuantity(id) {
  const item = cartData.find(item => String(item.id) === String(id));
  return item ? Math.max(0, Number(item.quantity) || 0) : 0;
}

function saveCart() {
  localStorage.setItem("milashes_cart", JSON.stringify(cartData));
}

let featuredPage = 0;
let featuredProducts = [];

async function loadFeaturedProducts() {
  if (!featuredGrid) return;

  featuredGrid.innerHTML = `
    <div class="featured-loading">Cargando destacados...</div>
  `;

  const { data, error } = await supabaseClient
    .from("products")
    .select("*")
    .order("sales_count", { ascending: false })
    .order("id", { ascending: false })
    .limit(10);

  if (error) {
    console.error("Error cargando destacados:", error);
    featuredGrid.innerHTML = `
      <div class="featured-loading">
        No se pudieron cargar los destacados.
      </div>
    `;
    return;
  }

  featuredProducts = (data || [])
    .filter(product => product.active !== false)
    .slice(0, 10);

  featuredPage = 0;
  renderFeaturedProducts();
}

function renderFeaturedProducts() {
  if (!featuredGrid) return;

  if (!featuredProducts.length) {
    featuredGrid.innerHTML = `
      <div class="featured-loading">
        Todavía no hay productos destacados.
      </div>
    `;
    return;
  }

  const total = featuredProducts.length;
  featuredPage = ((featuredPage % total) + total) % total;

  /*
     Mostramos 5 a la vez, pero movemos el carrusel de a 1.
     Se agregan 4 copias al final para que el recorrido sea circular.
     Ejemplo:
       1 2 3 4 5
       2 3 4 5 6
       3 4 5 6 7
       ...
       10 1 2 3 4
  */
  const isMobile = window.matchMedia("(max-width: 750px)").matches;
  const visibleCount = isMobile ? 2 : 5;
  const displayProducts = [
    ...featuredProducts,
    ...featuredProducts.slice(0, visibleCount - 1)
  ];

  featuredGrid.innerHTML = `
    <div class="featured-carousel">
      <button class="featured-arrow" id="featuredPrev" type="button" aria-label="Anterior">←</button>

      <div class="featured-window">
        <div class="featured-track"></div>
      </div>

      <button class="featured-arrow" id="featuredNext" type="button" aria-label="Siguiente">→</button>
    </div>
  `;

  const track = featuredGrid.querySelector(".featured-track");

  displayProducts.forEach(product => {
    const card = document.createElement("article");
    card.className = "product-card featured-card";

    const stock = getStock(product);
    const cartQty = getCartQuantity(product.id);
    const available = Math.max(0, stock - cartQty);
    const price = Number(product.price) || 0;
    const transferPrice = Number(product.transfer_price) || 0;
    const discount = Number(product.discount) || 0;

    card.innerHTML = `
      <div class="product-image">
        <img src="${escapeHTML(getProductImage(product))}" alt="${escapeHTML(product.name || "Producto")}" loading="lazy">
        ${discount > 0 ? `<span class="discount">-${discount}%</span>` : ""}
      </div>

      <div class="product-info">
        <div class="product-category">${escapeHTML(product.category || "Sin categoría")}</div>
        <div class="product-name">${escapeHTML(product.name || "Producto sin nombre")}</div>
        <div class="product-description">${escapeHTML(product.description || "")}</div>
        <div class="price">${formatPrice(price)}</div>
        ${transferPrice > 0 ? `<div class="transfer-price">Transferencia: ${formatPrice(transferPrice)}</div>` : ""}

        <button class="add-cart" data-id="${product.id}" type="button" ${available <= 0 ? "disabled" : ""}>
          ${available <= 0 ? "SIN STOCK" : "AGREGAR AL CARRITO"}
        </button>

        <div class="view-product" data-id="${product.id}">Ver producto</div>
      </div>
    `;

    track.appendChild(card);
  });

  /*
     Hay 14 tarjetas en el track (10 reales + 4 copias).
     El track ocupa 280% del ancho de la ventana.
     Cada tarjeta ocupa 1/14 del track = 20% de la ventana.
     Por eso cada paso mueve exactamente una tarjeta.
  */
  track.style.width = `${displayProducts.length * (100 / visibleCount)}%`;
  track.style.transform = `translateX(-${featuredPage * (100 / displayProducts.length)}%)`;

  track.querySelectorAll(".add-cart").forEach(button => {
    button.addEventListener("click", () => addToCart(button.dataset.id));
  });

  track.querySelectorAll(".view-product").forEach(button => {
    button.addEventListener("click", () => openProductModal(button.dataset.id));
  });

  featuredGrid.querySelector("#featuredPrev").addEventListener("click", () => {
    featuredPage = (featuredPage - 1 + total) % total;
    renderFeaturedProducts();
  });

  featuredGrid.querySelector("#featuredNext").addEventListener("click", () => {
    featuredPage = (featuredPage + 1) % total;
    renderFeaturedProducts();
  });

  if (isMobile) {
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    const windowEl = featuredGrid.querySelector(".featured-window");
    const stepPercent = 100 / displayProducts.length;
    const baseOffset = -(featuredPage * stepPercent);

    const moveTrack = (x) => {
      const delta = x - startX;
      const deltaPercent = (delta / windowEl.clientWidth) * 100;
      track.style.transition = "none";
      track.style.transform = `translateX(${baseOffset + deltaPercent}%)`;
    };

    windowEl.addEventListener("touchstart", event => {
      const touch = event.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      currentX = startX;
      dragging = true;
      track.style.transition = "none";
    }, { passive: true });

    windowEl.addEventListener("touchmove", event => {
      if (!dragging) return;
      const touch = event.touches[0];
      currentX = touch.clientX;
      const deltaX = currentX - startX;
      const deltaY = touch.clientY - startY;
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        event.preventDefault();
        moveTrack(currentX);
      }
    }, { passive: false });

    windowEl.addEventListener("touchend", () => {
      if (!dragging) return;
      dragging = false;
      const delta = currentX - startX;
      const threshold = Math.min(80, windowEl.clientWidth * 0.18);
      if (Math.abs(delta) > threshold) {
        featuredPage = delta < 0
          ? (featuredPage + 1) % total
          : (featuredPage - 1 + total) % total;
      }
      renderFeaturedProducts();
    }, { passive: true });
  }
}

async function loadProducts() {
  productGrid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:#777;font-size:12px;">Cargando productos...</div>`;
  if (noResults) noResults.style.display = "none";

  const { data, error } = await supabaseClient.from("products").select("*").eq("active", true).order("id", { ascending: false });

  if (error) {
    console.error("Error cargando productos:", error);
    productGrid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:#c45b68;font-size:12px;">No se pudieron cargar los productos.<br><br>${escapeHTML(error.message)}</div>`;
    if (resultsCount) resultsCount.textContent = "0 productos";
    return;
  }

  products = data || [];

  // En la página de Ofertas solo mostramos los productos
  // marcados desde el administrador como "Mostrar en Ofertas".
  // El descuento es independiente y no activa la sección por sí solo.
  if (window.offersOnly) {
    products = products.filter(product =>
      product.is_offer === true || product.is_offer === "true"
    );
  }

  renderFeaturedProducts();

  /* Si el stock cambió mientras había un carrito guardado, nunca dejamos
     que el carrito conserve una cantidad superior al stock actual. */
  let cartChanged = false;
  cartData = cartData.filter(item => {
    const product = products.find(p => String(p.id) === String(item.id));
    if (!product) { cartChanged = true; return false; }
    const stock = getStock(product);
    const qty = Math.max(0, Number(item.quantity) || 0);
    if (stock === 0) { cartChanged = true; return false; }
    if (qty > stock) { item.quantity = stock; cartChanged = true; }
    return item.quantity > 0;
  });
  if (cartChanged) saveCart();
  updateCart();
  applyFilters();
}

function getSelectedCategory() {
  const selected = document.querySelector('input[name="category"]:checked');
  return selected ? selected.value : "Todos";
}

function getSelectedPrice() {
  const selected = document.querySelector('input[name="price"]:checked');
  return selected ? selected.value : "all";
}

function applyFilters() {
  let filtered = [...products];
  const category = getSelectedCategory();
  if (category && category !== "Todos") filtered = filtered.filter(product => String(product.category || "").toLowerCase() === category.toLowerCase());

  const priceFilter = getSelectedPrice();
  if (priceFilter === "under10000") filtered = filtered.filter(product => Number(product.price) < 10000);
  if (priceFilter === "10000-20000") filtered = filtered.filter(product => Number(product.price) >= 10000 && Number(product.price) <= 20000);
  if (priceFilter === "over20000") filtered = filtered.filter(product => Number(product.price) > 20000);

  const search = searchInput ? searchInput.value.trim().toLowerCase() : "";
  if (search) {
    filtered = filtered.filter(product => {
      const name = String(product.name || "").toLowerCase();
      const categoryText = String(product.category || "").toLowerCase();
      const description = String(product.description || "").toLowerCase();
      return name.includes(search) || categoryText.includes(search) || description.includes(search);
    });
  }

  const sort = sortProducts ? sortProducts.value : "default";
  if (sort === "price-low") filtered.sort((a,b) => Number(a.price||0) - Number(b.price||0));
  if (sort === "price-high") filtered.sort((a,b) => Number(b.price||0) - Number(a.price||0));
  if (sort === "name") filtered.sort((a,b) => String(a.name||"").localeCompare(String(b.name||""), "es"));

  renderProducts(filtered);
}

function renderProducts(list) {
  productGrid.innerHTML = "";
  if (resultsCount) resultsCount.textContent = `${list.length} ${list.length === 1 ? "producto" : "productos"}`;
  if (!list.length) { if (noResults) noResults.style.display = "block"; return; }
  if (noResults) noResults.style.display = "none";

  list.forEach(product => {
    const card = document.createElement("article");
    card.className = "product-card";
    const image = getProductImage(product);
    const price = Number(product.price) || 0;
    const transferPrice = Number(product.transfer_price) || 0;
    const discount = Number(product.discount) || 0;
    const stock = getStock(product);
    const cartQty = getCartQuantity(product.id);
    const availableForCart = Math.max(0, stock - cartQty);
    const outOfStock = stock <= 0 || availableForCart <= 0;

    card.innerHTML = `
      <div class="product-image">
        <img src="${escapeHTML(image)}" alt="${escapeHTML(product.name || "Producto")}" loading="lazy">
        ${discount > 0 ? `<span class="discount">-${discount}%</span>` : ""}
      </div>
      <div class="product-info">
        <div class="product-category">${escapeHTML(product.category || "Sin categoría")}</div>
        <div class="product-name">${escapeHTML(product.name || "Producto sin nombre")}</div>
        <div class="product-description">${escapeHTML(product.description || "")}</div>
        <div class="price">${formatPrice(price)}</div>
        ${transferPrice > 0 ? `<div class="transfer-price">Transferencia: ${formatPrice(transferPrice)}</div>` : ""}
        <button class="add-cart" data-id="${product.id}" type="button" ${outOfStock ? "disabled" : ""}>
          ${stock <= 0 ? "SIN STOCK" : availableForCart <= 0 ? "STOCK AGOTADO" : "AGREGAR AL CARRITO"}
        </button>
        <div class="view-product" data-id="${product.id}">Ver producto</div>
      </div>`;
    productGrid.appendChild(card);
  });

  productGrid.querySelectorAll(".add-cart").forEach(button => button.addEventListener("click", function(){ addToCart(this.dataset.id); }));
  productGrid.querySelectorAll(".view-product").forEach(button => button.addEventListener("click", function(){ openProductModal(this.dataset.id); }));
}

document.querySelectorAll(".category-card").forEach(button => button.addEventListener("click", function(){
  const radio = document.querySelector(`input[name="category"][value="${this.dataset.category}"]`);
  if (radio) radio.checked = true;
  applyFilters();
  const section = document.getElementById("productos");
  if (section) section.scrollIntoView({behavior:"smooth"});
}));

document.querySelectorAll(".nav a[data-category]").forEach(link => link.addEventListener("click", function(event){
  const category = this.dataset.category;
  if (category === "Todos") event.preventDefault();
  const radio = document.querySelector(`input[name="category"][value="${category}"]`);
  if (radio) radio.checked = true;
  applyFilters();
}));

document.querySelectorAll('input[name="category"], input[name="price"]').forEach(input => input.addEventListener("change", applyFilters));

if (clearFilters) clearFilters.addEventListener("click", function(){
  const allCategory = document.querySelector('input[name="category"][value="Todos"]');
  const allPrice = document.querySelector('input[name="price"][value="all"]');
  if (allCategory) allCategory.checked = true;
  if (allPrice) allPrice.checked = true;
  if (searchInput) searchInput.value = "";
  if (sortProducts) sortProducts.value = "default";
  applyFilters();
});
if (searchInput) searchInput.addEventListener("input", applyFilters);
if (searchButton) searchButton.addEventListener("click", applyFilters);
if (sortProducts) sortProducts.addEventListener("change", applyFilters);

function showCartMessage(productName) {
  let message = document.getElementById("cartMessage");
  if (!message) {
    message = document.createElement("div");
    message.id = "cartMessage";
    message.innerHTML = `<div style="width:30px;height:30px;min-width:30px;border-radius:50%;background:#e8f7ed;display:flex;align-items:center;justify-content:center;color:#2e9b55;font-size:18px;font-weight:700;">✓</div><div style="display:flex;flex-direction:column;gap:2px;min-width:0;"><strong style="font-size:14px;line-height:1.2;color:#333;">Producto agregado</strong><span id="cartMessageProduct" style="font-size:12px;line-height:1.3;color:#777;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:230px;"></span></div>`;
    Object.assign(message.style,{position:"fixed",top:"85px",right:"20px",zIndex:"999999",display:"flex",alignItems:"center",gap:"10px",minWidth:"250px",maxWidth:"calc(100vw - 40px)",padding:"12px 16px",background:"#fff",border:"1px solid rgba(0,0,0,0.08)",borderRadius:"12px",boxShadow:"0 8px 30px rgba(0,0,0,0.18)",opacity:"0",visibility:"hidden",transform:"translateY(-15px)",transition:"opacity .25s ease, transform .25s ease, visibility .25s ease",pointerEvents:"none"});
    document.body.appendChild(message);
  }
  const productText = document.getElementById("cartMessageProduct");
  if (productText) productText.textContent = productName || "Producto";
  message.style.visibility="visible"; message.style.opacity="1"; message.style.transform="translateY(0)";
  clearTimeout(window.cartMessageTimer);
  window.cartMessageTimer=setTimeout(()=>{message.style.opacity="0";message.style.visibility="hidden";message.style.transform="translateY(-15px)";},2500);
}

function addToCart(id) {
  const product = products.find(item => String(item.id) === String(id));
  if (!product) return alert("No se encontró el producto.");
  const stock = getStock(product);
  if (stock <= 0) { alert("Este producto está sin stock."); renderProducts(products); return; }
  const existing = cartData.find(item => String(item.id) === String(id));
  const currentQty = existing ? Number(existing.quantity) || 0 : 0;
  if (currentQty >= stock) { alert(`No hay más unidades disponibles de ${product.name}.`); return; }
  if (existing) existing.quantity = currentQty + 1;
  else cartData.push({id:product.id,name:product.name,price:Number(product.price)||0,image:product.image||"",quantity:1});
  saveCart(); updateCart(); applyFilters(); showCartMessage(product.name || "Producto");
}

function updateCart() {
  const totalItems = cartData.reduce((total,item)=>total + Number(item.quantity||0),0);
  if (cartCount) cartCount.textContent = totalItems;
  if (!cartData.length) {
    cartItems.innerHTML = `<div class="empty-cart"><div>🛒</div><h3>Tu carrito está vacío</h3><p>Agregá productos para comenzar.</p></div>`;
    cartTotal.textContent="$0"; return;
  }
  cartItems.innerHTML="";
  let total=0;
  cartData.forEach(item=>{
    const product = products.find(p=>String(p.id)===String(item.id));
    const stock = product ? getStock(product) : Number(item.quantity)||0;
    const quantity = Math.min(Number(item.quantity)||1, stock);
    if (quantity !== Number(item.quantity)) item.quantity = quantity;
    const price=Number(item.price)||0; total += price*quantity;
    const element=document.createElement("div"); element.className="cart-item";
    element.innerHTML=`<img src="${escapeHTML(item.image||"https://via.placeholder.com/150?text=Producto")}" alt="${escapeHTML(item.name||"")}"><div class="cart-item-info"><h4>${escapeHTML(item.name||"Producto")}</h4><div class="cart-item-price">${formatPrice(price)}</div><div class="quantity"><button class="decrease" data-id="${item.id}" type="button">−</button><span>${quantity}</span><button class="increase" data-id="${item.id}" type="button" ${quantity>=stock?"disabled":""}>+</button><button class="remove-item" data-id="${item.id}" type="button">Eliminar</button></div></div>`;
    cartItems.appendChild(element);
  });
  cartData=cartData.filter(item=>(Number(item.quantity)||0)>0); saveCart(); cartTotal.textContent=formatPrice(total);
  cartItems.querySelectorAll(".decrease").forEach(b=>b.addEventListener("click",()=>changeQuantity(b.dataset.id,-1)));
  cartItems.querySelectorAll(".increase").forEach(b=>b.addEventListener("click",()=>changeQuantity(b.dataset.id,1)));
  cartItems.querySelectorAll(".remove-item").forEach(b=>b.addEventListener("click",()=>removeFromCart(b.dataset.id)));
}

function changeQuantity(id, amount) {
  const item=cartData.find(product=>String(product.id)===String(id)); if(!item)return;
  const product=products.find(p=>String(p.id)===String(id)); const stock=product?getStock(product):0;
  const next=(Number(item.quantity)||0)+amount;
  if(next>stock){ alert("No hay más unidades disponibles de este producto."); return; }
  item.quantity=next;
  if(item.quantity<=0) cartData=cartData.filter(product=>String(product.id)!==String(id));
  saveCart(); updateCart(); applyFilters();
}

function removeFromCart(id){cartData=cartData.filter(product=>String(product.id)!==String(id));saveCart();updateCart();applyFilters();}
function openCart(){if(cart)cart.classList.add("active");if(cartOverlay)cartOverlay.classList.add("active");}
function closeCartPanel(){if(cart)cart.classList.remove("active");if(cartOverlay)cartOverlay.classList.remove("active");}
if(cartButton)cartButton.addEventListener("click",openCart); if(closeCart)closeCart.addEventListener("click",closeCartPanel); if(cartOverlay)cartOverlay.addEventListener("click",closeCartPanel); if(continueShopping)continueShopping.addEventListener("click",closeCartPanel);

function openProductModal(id) {
  const product=products.find(item=>String(item.id)===String(id)); if(!product || !productModal || !modalContent)return;
  const image=getProductImage(product), price=Number(product.price)||0, transferPrice=Number(product.transfer_price)||0, stock=getStock(product), cartQty=getCartQuantity(product.id);
  const unavailable=stock<=0 || cartQty>=stock;
  modalContent.innerHTML=`<div class="modal-product"><div><img src="${escapeHTML(image)}" alt="${escapeHTML(product.name||"Producto")}"></div><div class="modal-info"><div class="product-category">${escapeHTML(product.category||"Sin categoría")}</div><h2>${escapeHTML(product.name||"Producto")}</h2><p>${escapeHTML(product.description||"Sin descripción.")}</p><div class="modal-price">${formatPrice(price)}</div>${transferPrice>0?`<div class="transfer-price">Precio transferencia: ${formatPrice(transferPrice)}</div>`:""}<button class="add-cart" id="modalAddCart" type="button" ${unavailable?"disabled":""}>${stock<=0?"SIN STOCK":"AGREGAR AL CARRITO"}</button></div></div>`;
  productModal.classList.add("active");
  const modalAddCart=document.getElementById("modalAddCart"); if(modalAddCart)modalAddCart.addEventListener("click",()=>{addToCart(product.id);closeProductModal();});
}
function closeProductModal(){if(productModal)productModal.classList.remove("active");}
if(closeModal)closeModal.addEventListener("click",closeProductModal); if(productModal)productModal.addEventListener("click",e=>{if(e.target===productModal)closeProductModal();});

document.addEventListener("keydown",event=>{if(event.key==="Escape"){closeProductModal();closeCartPanel();}});

/* Checkout: descuenta stock de forma atómica mediante la función de Supabase.
   La función se incluye en stock.sql dentro del ZIP. */
if(checkoutButton)checkoutButton.addEventListener("click",async function(){
  if(!cartData.length){alert("Tu carrito está vacío.");return;}
  checkoutButton.disabled=true;
  checkoutButton.textContent="PROCESANDO...";
  try{
    const items=cartData.map(item=>({id:Number(item.id),quantity:Number(item.quantity)||1}));
    const {data,error}=await supabaseClient.rpc("decrement_product_stock",{items});
    if(error) throw error;
    if(data && data.success===false) throw new Error(data.message||"No hay stock suficiente.");

    let message="Hola! Quiero realizar este pedido:%0A%0A"; let total=0;
    cartData.forEach(item=>{const quantity=Number(item.quantity)||1;const price=Number(item.price)||0;const subtotal=quantity*price;total+=subtotal;message+=`• ${item.name} x${quantity} - ${formatPrice(subtotal)}%0A`;});
    message+=`%0ATotal: ${formatPrice(total)}`;
    const url=`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
    cartData=[];saveCart();updateCart();await loadProducts();closeCartPanel();window.open(url,"_blank");
  }catch(error){
    console.error(error);
    alert(error.message||"No se pudo confirmar el pedido. El stock no fue modificado.");
    await loadProducts();
  }finally{checkoutButton.disabled=false;checkoutButton.textContent="FINALIZAR PEDIDO";}
});

if(whatsappContact){whatsappContact.href=`https://wa.me/${WHATSAPP_NUMBER}`;whatsappContact.target="_blank";}
if(mobileMenu)mobileMenu.addEventListener("click",()=>{if(nav)nav.classList.toggle("active");});
document.querySelectorAll(".nav a").forEach(link=>link.addEventListener("click",()=>{if(nav)nav.classList.remove("active");}));

function applyCategoryFromURL(){const params=new URLSearchParams(window.location.search);const category=params.get("categoria");if(!category)return;const radio=document.querySelector(`input[name="category"][value="${category}"]`);if(radio){radio.checked=true;applyFilters();}}

updateCart();
loadProducts();
loadFeaturedProducts();
setInterval(loadProducts,300000);
setTimeout(applyCategoryFromURL,500);
window.addEventListener("scroll",function(){if(window.scrollY>50)document.body.classList.add("header-scrolled");else document.body.classList.remove("header-scrolled");});
