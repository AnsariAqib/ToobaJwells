/**
 * Tooba Jewellers - All Products (Shop Catalog Page) Engine
 * Dynamic filtering by Category, Price, and Metal purity.
 * Real-time sorting, search filtering, URL query syncing,
 * shopping cart drawer, checkout modal, and wishlist sync.
 */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Load Products & Initialize Global State
  const allProducts = DB.getProducts();

  // Read URL query parameter: e.g. products.html?category=Rings or ?category=Necklaces
  const urlParams = new URLSearchParams(window.location.search);
  const initialCategoryParam = urlParams.get("category");
  const initialSearchParam = urlParams.get("search") || "";

  // Validate or normalize initial category
  let initialCategory = "All";
  if (initialCategoryParam) {
    const validCats = ["All", "Rings", "Necklaces", "Bracelets", "Earrings", "Mangalsutra", "Coins", "Kids"];
    const found = validCats.find(c => c.toLowerCase() === initialCategoryParam.toLowerCase());
    if (found) initialCategory = found;
  }

  const shopState = {
    allProducts: allProducts,
    cart: DB.getCart(),
    wishlist: DB.getWishlist(),
    filters: {
      category: initialCategory,
      price: "All",
      metal: "All",
      search: initialSearchParam
    },
    sort: "featured"
  };

  // DOM Elements
  const container = document.getElementById("all-products-container");
  const countDisplay = document.getElementById("shop-count-display");
  const activeTagsWrap = document.getElementById("active-filter-tags");
  const sortSelect = document.getElementById("shop-sort-select");
  const resetFiltersBtn = document.getElementById("reset-all-filters-btn");
  const breadcrumbCurrent = document.getElementById("breadcrumb-current");
  const pageHeading = document.getElementById("page-heading");
  const pageSubheading = document.getElementById("page-subheading");
  const searchInput = document.getElementById("search-input");
  const mobileFilterToggle = document.getElementById("mobile-filter-toggle");
  const shopSidebar = document.getElementById("shop-sidebar");

  // Category counts
  const countAll = document.getElementById("count-all");
  const countRings = document.getElementById("count-rings");
  const countNecklaces = document.getElementById("count-necklaces");
  const countBracelets = document.getElementById("count-bracelets");
  const countEarrings = document.getElementById("count-earrings");
  const countMangalsutra = document.getElementById("count-mangalsutra");
  const countCoins = document.getElementById("count-coins");
  const countKids = document.getElementById("count-kids");

  // Cart DOM
  const cartDrawer = document.getElementById("cart-drawer");
  const cartBackdrop = document.getElementById("cart-backdrop");
  const openCartBtn = document.getElementById("open-cart-btn");
  const closeCartBtn = document.getElementById("close-cart-btn");
  const cartItemsList = document.getElementById("cart-items-list");
  const cartBadge = document.getElementById("cart-badge-count");
  const cartSubtotal = document.getElementById("cart-subtotal-price");
  const freeShippingBar = document.getElementById("free-shipping-progress");
  const freeShippingText = document.getElementById("free-shipping-text");
  const wishlistBadge = document.getElementById("wishlist-badge-count");
  const openWishlistBtn = document.getElementById("open-wishlist-btn");

  // Mobile Bottom App Navigation DOM
  const mobileNavWishlist = document.getElementById("app-nav-wishlist-btn");
  const mobileNavCart = document.getElementById("app-nav-cart-btn");
  const mobileNavWishlistCount = document.getElementById("app-nav-wishlist-count");
  const mobileNavCartCount = document.getElementById("app-nav-cart-count");

  // Checkout DOM
  const checkoutBtn = document.getElementById("checkout-btn");
  const checkoutModal = document.getElementById("checkout-modal");
  const closeCheckoutBtn = document.getElementById("close-checkout-btn");
  const checkoutForm = document.getElementById("checkout-form");
  const checkoutItemsSummary = document.getElementById("checkout-items-summary");
  const checkoutTotalDisplay = document.getElementById("checkout-total-display");

  // Create Mobile Backdrop for Sidebar if not present
  let sidebarBackdrop = document.querySelector(".shop-sidebar-backdrop");
  if (!sidebarBackdrop) {
    sidebarBackdrop = document.createElement("div");
    sidebarBackdrop.className = "shop-sidebar-backdrop";
    document.body.appendChild(sidebarBackdrop);
  }

  // Initialize Smooth Scrolling (Lenis)
  if (typeof Lenis !== "undefined") {
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    window.lenis = lenis;
  }

  // ----------------------------------------------------
  // Update Category Counts in Sidebar
  // ----------------------------------------------------
  function updateCategoryCounts() {
    if (countAll) countAll.textContent = shopState.allProducts.length;
    if (countRings) countRings.textContent = shopState.allProducts.filter(p => p.category === "Rings").length;
    if (countNecklaces) countNecklaces.textContent = shopState.allProducts.filter(p => p.category === "Necklaces").length;
    if (countBracelets) countBracelets.textContent = shopState.allProducts.filter(p => p.category === "Bracelets").length;
    if (countEarrings) countEarrings.textContent = shopState.allProducts.filter(p => p.category === "Earrings").length;
    if (countMangalsutra) countMangalsutra.textContent = shopState.allProducts.filter(p => p.category === "Mangalsutra").length;
    if (countCoins) countCoins.textContent = shopState.allProducts.filter(p => p.category === "Coins").length;
    if (countKids) countKids.textContent = shopState.allProducts.filter(p => p.category === "Kids").length;
  }

  // ----------------------------------------------------
  // Filter & Sort Calculation
  // ----------------------------------------------------
  function getFilteredAndSortedProducts() {
    let list = [...shopState.allProducts];

    // Category Filter
    if (shopState.filters.category && shopState.filters.category !== "All") {
      list = list.filter(p => p.category.toLowerCase() === shopState.filters.category.toLowerCase());
    }

    // Price Filter
    if (shopState.filters.price && shopState.filters.price !== "All") {
      switch (shopState.filters.price) {
        case "under-30k":
          list = list.filter(p => p.price < 30000);
          break;
        case "30k-60k":
          list = list.filter(p => p.price >= 30000 && p.price <= 60000);
          break;
        case "60k-100k":
          list = list.filter(p => p.price > 60000 && p.price <= 100000);
          break;
        case "above-100k":
          list = list.filter(p => p.price > 100000);
          break;
      }
    }

    // Metal Filter
    if (shopState.filters.metal && shopState.filters.metal !== "All") {
      const metalVal = shopState.filters.metal.toLowerCase();
      list = list.filter(p => p.metal && p.metal.toLowerCase().includes(metalVal));
    }

    // Search Query Filter
    if (shopState.filters.search && shopState.filters.search.trim()) {
      const query = shopState.filters.search.toLowerCase().trim();
      list = list.filter(p => 
        p.title.toLowerCase().includes(query) ||
        (p.category && p.category.toLowerCase().includes(query)) ||
        (p.metal && p.metal.toLowerCase().includes(query)) ||
        (p.description && p.description.toLowerCase().includes(query))
      );
    }

    // Sorting
    switch (shopState.sort) {
      case "price-low":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        list.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        list.sort((a, b) => (b.rating || 4.9) - (a.rating || 4.9));
        break;
      case "newest":
        list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      case "featured":
      default:
        list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
    }

    return list;
  }

  // ----------------------------------------------------
  // Render Product Cards (NO Quick View)
  // ----------------------------------------------------
  function renderProducts() {
    const products = getFilteredAndSortedProducts();

    // Update Result Counter
    if (countDisplay) {
      countDisplay.textContent = `Showing ${products.length} of ${shopState.allProducts.length} Fine Pieces`;
    }

    // Update Active Filter Tags
    renderActiveFilterBadges();

    // Empty State Check
    if (products.length === 0) {
      container.innerHTML = `
        <div class="shop-empty-state">
          <div class="shop-empty-icon">💎</div>
          <h3 class="shop-empty-title">No Matching Jewels Found</h3>
          <p class="shop-empty-text">
            We couldn't find any piece matching your active filters. Try broadening your price range or exploring another category.
          </p>
          <button type="button" class="btn-primary" id="empty-reset-btn" style="font-size: 0.85rem; padding: 0.75rem 1.75rem; border-radius: 5px;">
            Reset All Filters
          </button>
        </div>
      `;

      const emptyReset = document.getElementById("empty-reset-btn");
      if (emptyReset) {
        emptyReset.addEventListener("click", resetAllFilters);
      }
      return;
    }

    // Render Cards
    container.innerHTML = products.map(product => {
      const isWishlisted = shopState.wishlist.some(w => w.id === product.id);
      const discountPercent = product.mrp > product.price 
        ? Math.round(((product.mrp - product.price) / product.mrp) * 100) 
        : 15;
      const tag = product.tag || (product.isFeatured ? "Bestseller" : "18K Gold");

      return `
        <article class="catalog-product-card" data-id="${product.id}">
          <div class="catalog-media-box" onclick="window.location.href='product.html?id=${product.id}'">
            ${tag ? `<span class="catalog-tag-pill">${tag}</span>` : ""}
            
            <button class="catalog-wishlist-btn ${isWishlisted ? 'active' : ''}" data-wishlist-id="${product.id}" title="Save to Wishlist">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="${isWishlisted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>

            <img src="${product.image}" alt="${product.title}" loading="lazy" />
          </div>

          <div class="catalog-card-body">
            <div class="catalog-meta-specs">
              <span>${product.metal || '18K Solid Gold'}</span>
              ${product.diamondCarat ? ` • <span>${product.diamondCarat}</span>` : ""}
            </div>

            <h3 class="catalog-card-title">
              <a href="product.html?id=${product.id}" style="color: inherit; text-decoration: none;" title="${product.title}">${product.title}</a>
            </h3>

            <div class="catalog-rating-row">
              <span class="catalog-stars">★★★★★</span>
              <span>${product.rating || 4.9} (${product.reviewsCount || 28})</span>
            </div>

            <div class="catalog-pricing-row">
              <span class="catalog-current-price">${formatCurrency(product.price)}</span>
              ${product.mrp ? `<span class="catalog-mrp-price">${formatCurrency(product.mrp)}</span>` : ""}
              ${discountPercent > 0 ? `<span class="catalog-discount-badge">${discountPercent}% OFF</span>` : ""}
            </div>

            <button class="catalog-add-bag-btn" data-cart-id="${product.id}">
              <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <span>Add to Bag</span>
            </button>
          </div>
        </article>
      `;
    }).join("");

    // Attach Event Listeners to rendered cards
    container.querySelectorAll("[data-cart-id]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-cart-id");
        addToCart(id);
      });
    });

    container.querySelectorAll("[data-wishlist-id]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-wishlist-id");
        toggleWishlist(id);
      });
    });
  }

  // ----------------------------------------------------
  // Active Filter Badges UI
  // ----------------------------------------------------
  function renderActiveFilterBadges() {
    if (!activeTagsWrap) return;
    const badges = [];

    if (shopState.filters.category && shopState.filters.category !== "All") {
      badges.push({
        label: `Category: ${shopState.filters.category}`,
        key: "category"
      });
    }

    if (shopState.filters.price && shopState.filters.price !== "All") {
      let priceLabel = shopState.filters.price;
      if (priceLabel === "under-30k") priceLabel = "< ₹30,000";
      if (priceLabel === "30k-60k") priceLabel = "₹30K - ₹60K";
      if (priceLabel === "60k-100k") priceLabel = "₹60K - ₹100K";
      if (priceLabel === "above-100k") priceLabel = "> ₹100,000";
      badges.push({
        label: `Price: ${priceLabel}`,
        key: "price"
      });
    }

    if (shopState.filters.metal && shopState.filters.metal !== "All") {
      badges.push({
        label: `Metal: ${shopState.filters.metal}`,
        key: "metal"
      });
    }

    if (shopState.filters.search && shopState.filters.search.trim()) {
      badges.push({
        label: `Search: "${shopState.filters.search}"`,
        key: "search"
      });
    }

    activeTagsWrap.innerHTML = badges.map(b => `
      <span class="active-filter-badge">
        <span>${b.label}</span>
        <button type="button" data-clear-filter="${b.key}" title="Remove filter">✕</button>
      </span>
    `).join("");

    activeTagsWrap.querySelectorAll("[data-clear-filter]").forEach(btn => {
      btn.addEventListener("click", () => {
        const key = btn.getAttribute("data-clear-filter");
        if (key === "category") setCategoryFilter("All");
        if (key === "price") setPriceFilter("All");
        if (key === "metal") setMetalFilter("All");
        if (key === "search") {
          shopState.filters.search = "";
          if (searchInput) searchInput.value = "";
          renderProducts();
        }
      });
    });
  }

  // ----------------------------------------------------
  // Filter Setter Helpers & Visual Sync
  // ----------------------------------------------------
  function setCategoryFilter(category) {
    shopState.filters.category = category;

    // Update active class on category buttons and mobile category chips
    document.querySelectorAll('[data-filter-type="category"]').forEach(btn => {
      if (btn.getAttribute("data-filter-value").toLowerCase() === category.toLowerCase()) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    // Update Page Headings & Breadcrumbs
    if (category === "All") {
      if (breadcrumbCurrent) breadcrumbCurrent.textContent = "All Fine Jewellery";
      if (pageHeading) pageHeading.textContent = "All Fine Jewellery";
      if (pageSubheading) {
        pageSubheading.textContent = "Every creation is crafted in 18K solid gold, laser-engraved with BIS hallmark, and accompanied by an authentic IGI diamond certificate.";
      }
      history.replaceState(null, "", "products.html");
    } else {
      if (breadcrumbCurrent) breadcrumbCurrent.textContent = category;
      if (pageHeading) pageHeading.textContent = `Certified Diamond ${category}`;
      if (pageSubheading) {
        pageSubheading.textContent = `Discover our curated heirloom collection of handcrafted ${category.toLowerCase()}, tailored in 18K pure gold with brilliant natural diamonds.`;
      }
      history.replaceState(null, "", `products.html?category=${encodeURIComponent(category)}`);
    }

    renderProducts();
  }

  function setPriceFilter(priceRange) {
    shopState.filters.price = priceRange;
    document.querySelectorAll('[data-filter-type="price"]').forEach(btn => {
      if (btn.getAttribute("data-filter-value") === priceRange) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
    renderProducts();
  }

  function setMetalFilter(metal) {
    shopState.filters.metal = metal;
    document.querySelectorAll('[data-filter-type="metal"]').forEach(btn => {
      if (btn.getAttribute("data-filter-value") === metal) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
    renderProducts();
  }

  function resetAllFilters() {
    shopState.filters.price = "All";
    shopState.filters.metal = "All";
    shopState.filters.search = "";
    if (searchInput) searchInput.value = "";
    setCategoryFilter("All");
    setPriceFilter("All");
    setMetalFilter("All");
  }

  // ----------------------------------------------------
  // Bind Sidebar Filter Buttons
  // ----------------------------------------------------
  document.querySelectorAll('[data-filter-type="category"]').forEach(btn => {
    btn.addEventListener("click", () => {
      const val = btn.getAttribute("data-filter-value");
      setCategoryFilter(val);
      // Close mobile drawer on selection if open
      closeMobileSidebar();
    });
  });

  document.querySelectorAll('[data-filter-type="price"]').forEach(btn => {
    btn.addEventListener("click", () => {
      const val = btn.getAttribute("data-filter-value");
      setPriceFilter(val);
      closeMobileSidebar();
    });
  });

  document.querySelectorAll('[data-filter-type="metal"]').forEach(btn => {
    btn.addEventListener("click", () => {
      const val = btn.getAttribute("data-filter-value");
      setMetalFilter(val);
      closeMobileSidebar();
    });
  });

  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener("click", resetAllFilters);
  }

  // ----------------------------------------------------
  // Bind Sorting Select
  // ----------------------------------------------------
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      shopState.sort = e.target.value;
      renderProducts();
    });
  }

  // ----------------------------------------------------
  // Live Search Input Handling
  // ----------------------------------------------------
  if (searchInput) {
    if (shopState.filters.search) {
      searchInput.value = shopState.filters.search;
    }

    searchInput.addEventListener("input", (e) => {
      shopState.filters.search = e.target.value;
      renderProducts();
    });
  }

  // Header Search Form & Visual Camera Search
  const headerSearchForm = document.getElementById("header-search-form");
  if (headerSearchForm) {
    headerSearchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (searchInput) {
        shopState.filters.search = searchInput.value.trim();
        renderProducts();
      }
    });
  }

  const visualSearchInput = document.getElementById("visual-search-input");
  const searchCameraBtn = document.getElementById("search-camera-btn");
  if (searchCameraBtn && visualSearchInput) {
    searchCameraBtn.addEventListener("click", () => {
      visualSearchInput.click();
    });
    visualSearchInput.addEventListener("change", (e) => {
      if (e.target.files && e.target.files[0]) {
        showToast("📷 Visual match: displaying matching diamond pieces", "info");
        shopState.filters.search = "Diamond";
        if (searchInput) searchInput.value = "Diamond";
        renderProducts();
      }
    });
  }

  // ----------------------------------------------------
  // Mobile Filter Drawer Toggle
  // ----------------------------------------------------
  function openMobileSidebar() {
    if (shopSidebar) shopSidebar.classList.add("mobile-open");
    if (sidebarBackdrop) sidebarBackdrop.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeMobileSidebar() {
    if (shopSidebar) shopSidebar.classList.remove("mobile-open");
    if (sidebarBackdrop) sidebarBackdrop.classList.remove("active");
    document.body.style.overflow = "";
  }

  if (mobileFilterToggle) {
    mobileFilterToggle.addEventListener("click", openMobileSidebar);
  }

  if (sidebarBackdrop) {
    sidebarBackdrop.addEventListener("click", closeMobileSidebar);
  }

  // ----------------------------------------------------
  // Shopping Cart Engine
  // ----------------------------------------------------
  function addToCart(productId, size = "Standard", metal = "18K Rose Gold", qty = 1, openDrawer = true) {
    const product = shopState.allProducts.find(p => p.id === productId);
    if (!product) return;

    const existingIndex = shopState.cart.findIndex(item => item.id === productId && item.size === size);
    if (existingIndex > -1) {
      shopState.cart[existingIndex].qty += qty;
    } else {
      shopState.cart.push({
        id: product.id,
        title: product.title,
        price: product.price,
        mrp: product.mrp,
        metal: product.metal || metal,
        image: product.image,
        size: size,
        qty: qty
      });
    }

    DB.saveCart(shopState.cart);
    updateCartUI();

    if (openDrawer) {
      if (window.innerWidth > 768) {
        openCartDrawer();
      }
      showToast(`Added "${product.title}" to your Shopping Bag! ✨`, "success");
    }
  }

  function updateCartUI() {
    const totalItems = shopState.cart.reduce((sum, item) => sum + item.qty, 0);
    if (cartBadge) cartBadge.textContent = totalItems;
    if (mobileNavCartCount) mobileNavCartCount.textContent = totalItems;

    const subtotal = shopState.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    if (cartSubtotal) cartSubtotal.textContent = formatCurrency(subtotal);

    // Free Shipping Progress
    const threshold = 50000;
    if (freeShippingBar && freeShippingText) {
      const percentage = Math.min(100, (subtotal / threshold) * 100);
      freeShippingBar.style.width = `${percentage}%`;
      if (subtotal >= threshold) {
        freeShippingText.innerHTML = `🎉 <strong>Congratulations!</strong> You unlocked <strong>FREE Insured Express Delivery & Luxury Velvet Box</strong>!`;
      } else {
        const remaining = threshold - subtotal;
        freeShippingText.innerHTML = `Add <strong>${formatCurrency(remaining)}</strong> more to unlock <strong>FREE Luxury Packaging & Insured Shipping</strong>`;
      }
    }

    if (!cartItemsList) return;

    if (shopState.cart.length === 0) {
      cartItemsList.innerHTML = `
        <div style="text-align: center; padding: 4rem 1rem;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🛍️</div>
          <h4 style="font-family: var(--font-heading); font-size: 1.5rem; margin-bottom: 0.5rem;">Your Cart is Empty</h4>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.5rem;">Explore our curated certified heirlooms.</p>
          <button type="button" class="btn-primary" onclick="closeCartDrawer();" style="font-size: 0.85rem; padding: 0.75rem 1.5rem; display: inline-block;">Browse Jewellery</button>
        </div>
      `;
      return;
    }

    cartItemsList.innerHTML = shopState.cart.map((item, index) => `
      <div class="cart-item-card">
        <div class="cart-item-img">
          <img src="${item.image}" alt="${item.title}" />
        </div>
        <div class="cart-item-details">
          <h4>${item.title}</h4>
          <div class="cart-item-meta">${item.size} • ${item.metal || '18K Gold'}</div>
          <div class="cart-item-qty">
            <button class="qty-btn" data-qty-action="dec" data-index="${index}">-</button>
            <span class="qty-display">${item.qty}</span>
            <button class="qty-btn" data-qty-action="inc" data-index="${index}">+</button>
          </div>
        </div>
        <div class="cart-item-price">
          <span class="price">${formatCurrency(item.price * item.qty)}</span>
          <div class="item-remove-btn" data-remove-index="${index}">Remove</div>
        </div>
      </div>
    `).join("");

    // Cart Quantity Buttons
    cartItemsList.querySelectorAll("[data-qty-action]").forEach(btn => {
      btn.addEventListener("click", () => {
        const action = btn.getAttribute("data-qty-action");
        const idx = parseInt(btn.getAttribute("data-index"), 10);
        if (action === "inc") {
          shopState.cart[idx].qty += 1;
        } else if (action === "dec") {
          if (shopState.cart[idx].qty > 1) {
            shopState.cart[idx].qty -= 1;
          } else {
            shopState.cart.splice(idx, 1);
          }
        }
        DB.saveCart(shopState.cart);
        updateCartUI();
      });
    });

    cartItemsList.querySelectorAll("[data-remove-index]").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.getAttribute("data-remove-index"), 10);
        const removed = shopState.cart.splice(idx, 1)[0];
        DB.saveCart(shopState.cart);
        updateCartUI();
        if (removed) {
          showToast(`Removed "${removed.title}" from bag`, "info");
        }
      });
    });
  }

  function openCartDrawer() {
    if (cartDrawer) {
      cartDrawer.classList.add("open");
      cartDrawer.classList.add("active");
    }
    if (cartBackdrop) {
      cartBackdrop.classList.add("active");
    }
    document.body.style.overflow = "hidden";
  }

  function closeCartDrawer() {
    if (cartDrawer) {
      cartDrawer.classList.remove("open");
      cartDrawer.classList.remove("active");
    }
    if (cartBackdrop) {
      cartBackdrop.classList.remove("active");
    }
    document.body.style.overflow = "";
  }

  window.closeCartDrawer = closeCartDrawer;

  if (openCartBtn) openCartBtn.addEventListener("click", openCartDrawer);
  if (closeCartBtn) closeCartBtn.addEventListener("click", closeCartDrawer);
  if (cartBackdrop) cartBackdrop.addEventListener("click", closeCartDrawer);

  // ----------------------------------------------------
  // Wishlist Handling
  // ----------------------------------------------------
  function toggleWishlist(productId) {
    const product = shopState.allProducts.find(p => p.id === productId);
    if (!product) return;

    const index = shopState.wishlist.findIndex(w => w.id === productId);
    if (index > -1) {
      shopState.wishlist.splice(index, 1);
      showToast(`Removed "${product.title}" from wishlist`, "info");
    } else {
      shopState.wishlist.push({
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        category: product.category
      });
      showToast(`Added "${product.title}" to wishlist! ❤️`, "success");
    }

    DB.saveWishlist(shopState.wishlist);
    updateWishlistUI();
    renderProducts();
  }

  function updateWishlistUI() {
    if (wishlistBadge) {
      wishlistBadge.textContent = shopState.wishlist.length;
    }
    if (mobileNavWishlistCount) {
      mobileNavWishlistCount.textContent = shopState.wishlist.length;
    }
  }

  // Mobile Bottom App Navigation Handlers
  if (mobileNavCart) {
    mobileNavCart.addEventListener("click", openCartDrawer);
  }
  if (mobileNavWishlist) {
    mobileNavWishlist.addEventListener("click", () => {
      showToast(`You have ${shopState.wishlist.length} heirloom items in your wishlist!`, "info");
    });
  }

  if (openWishlistBtn) {
    openWishlistBtn.addEventListener("click", () => {
      showToast(`You have ${shopState.wishlist.length} heirloom items in your wishlist!`, "info");
    });
  }

  // ----------------------------------------------------
  // Checkout Modal Engine
  // ----------------------------------------------------
  function openCheckout() {
    if (shopState.cart.length === 0) {
      showToast("Please add items to your shopping bag first!", "warning");
      return;
    }
    closeCartDrawer();
    populateCheckoutSummary();
    if (checkoutModal) checkoutModal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeCheckout() {
    if (checkoutModal) checkoutModal.classList.remove("active");
    document.body.style.overflow = "";
  }

  function populateCheckoutSummary() {
    const subtotal = shopState.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    if (checkoutTotalDisplay) checkoutTotalDisplay.textContent = formatCurrency(subtotal);

    if (checkoutItemsSummary) {
      checkoutItemsSummary.innerHTML = shopState.cart.map(item => `
        <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 0.4rem; color: var(--text-secondary);">
          <span>${item.title} (${item.qty}x)</span>
          <span style="font-weight: 600; color: var(--text-primary);">${formatCurrency(item.price * item.qty)}</span>
        </div>
      `).join("");
    }
  }

  if (checkoutBtn) checkoutBtn.addEventListener("click", openCheckout);
  if (closeCheckoutBtn) closeCheckoutBtn.addEventListener("click", closeCheckout);
  if (checkoutModal) {
    checkoutModal.addEventListener("click", (e) => {
      if (e.target === checkoutModal) closeCheckout();
    });
  }

  if (checkoutForm) {
    checkoutForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const formData = new FormData(checkoutForm);
      const subtotal = shopState.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

      const orderData = {
        customerName: formData.get("fullname"),
        phone: formData.get("phone"),
        email: formData.get("email"),
        address: formData.get("address"),
        city: formData.get("city"),
        pincode: formData.get("pincode"),
        paymentMethod: formData.get("paymentMethod"),
        items: [...shopState.cart],
        subtotal: subtotal,
        total: subtotal,
        orderDate: new Date().toISOString()
      };

      const placedOrder = DB.createOrder(orderData);

      // Clear Cart
      shopState.cart = [];
      DB.saveCart(shopState.cart);
      updateCartUI();
      closeCheckout();

      // Show Order Success Modal
      showOrderSuccess(placedOrder);
    });
  }

  function showOrderSuccess(order) {
    const successModal = document.getElementById("order-success-modal");
    const successDetails = document.getElementById("order-success-details");
    if (!successModal || !successDetails) return;

    successDetails.innerHTML = `
      <div style="font-size: 3.5rem; margin-bottom: 0.75rem;">🎉</div>
      <h3 style="font-family: var(--font-heading); font-size: 1.85rem; color: var(--text-primary); margin-bottom: 0.5rem;">Order Confirmed!</h3>
      <p style="font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 1.5rem;">
        Thank you, <strong>${order.customerName}</strong>. Your certified jewellery heirloom has been queued for insured priority dispatch.
      </p>

      <div style="background: var(--bg-cream); border: 1px solid var(--border-light); border-radius: 5px; padding: 1.25rem; text-align: left; margin-bottom: 1.5rem; font-size: 0.85rem;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.4rem;">
          <span style="color: var(--text-muted);">Order Tracking ID:</span>
          <strong style="color: var(--rose-gold-dark);">${order.id}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.4rem;">
          <span style="color: var(--text-muted);">Amount Paid:</span>
          <strong>${formatCurrency(order.total)}</strong>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: var(--text-muted);">Payment Mode:</span>
          <span>${order.paymentMethod}</span>
        </div>
      </div>

      <div style="display: flex; gap: 0.75rem; justify-content: center;">
        <button type="button" class="btn-primary" onclick="document.getElementById('order-success-modal').classList.remove('active'); document.body.style.overflow='';" style="padding: 0.75rem 1.5rem; border-radius: 5px;">
          Continue Shopping
        </button>
        <a href="admin.html" class="btn-secondary" style="padding: 0.75rem 1.5rem; border-radius: 5px; text-decoration: none; display: inline-block;">
          View in Admin
        </a>
      </div>
    `;

    successModal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  // ----------------------------------------------------
  // Toast Helper
  // ----------------------------------------------------
  function showToast(message, type = "info") {
    let toastWrap = document.querySelector(".toast-container");
    if (!toastWrap) {
      toastWrap = document.createElement("div");
      toastWrap.className = "toast-container";
      document.body.appendChild(toastWrap);
    }

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span>💎</span>
      <span>${message}</span>
    `;
    toastWrap.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(10px)";
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  window.showToast = showToast;

  // ----------------------------------------------------
  // Dynamic Scroll Header Transition (Category row hides, height reduces)
  // ----------------------------------------------------
  const siteHeader = document.querySelector(".site-header");
  const scrollSearchBtn = document.getElementById("scroll-search-toggle");
  const scrollSearchBar = document.getElementById("scroll-search-bar");
  const closeScrollSearchBtn = document.getElementById("close-scroll-search-btn");
  const scrollSearchInput = document.getElementById("scroll-search-input");

  function handleScrollHeader() {
    if (!siteHeader) return;
    if (window.scrollY > 15) {
      siteHeader.classList.add("header-scrolled");
    } else {
      siteHeader.classList.remove("header-scrolled");
      if (scrollSearchBar) scrollSearchBar.classList.remove("active");
    }
  }

  window.addEventListener("scroll", handleScrollHeader, { passive: true });
  handleScrollHeader();

  if (scrollSearchBtn && scrollSearchBar) {
    scrollSearchBtn.addEventListener("click", () => {
      scrollSearchBar.classList.toggle("active");
      if (scrollSearchBar.classList.contains("active") && scrollSearchInput) {
        setTimeout(() => scrollSearchInput.focus(), 100);
      }
    });
  }

  if (closeScrollSearchBtn && scrollSearchBar) {
    closeScrollSearchBtn.addEventListener("click", () => {
      scrollSearchBar.classList.remove("active");
    });
  }

  // ----------------------------------------------------
  // Initial Boot Execution
  // ----------------------------------------------------
  updateCategoryCounts();
  setCategoryFilter(initialCategory);
  updateCartUI();
  updateWishlistUI();
});
