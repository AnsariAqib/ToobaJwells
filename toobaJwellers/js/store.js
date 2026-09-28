/**
 * Tooba Jewellers - Storefront Application Engine
 * Handles rendering, filter/sort, cart drawer, wishlist, quick view, ring sizer, and checkout
 */

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Application State
  // Initialize Application State
  const state = {
    products: DB.getProducts(),
    trendingCategory: "Rings",
    catalogCategory: "All",
    catalogSort: "featured",
    catalogLimit: 8,
    catalogExpanded: false,
    cart: DB.getCart(),
    wishlist: DB.getWishlist(),
    selectedQuickViewProduct: null,
    selectedRingSize: "14"
  };

  // DOM Elements
  const trendingCardsGrid = document.getElementById("trending-cards-grid");
  const trendingStripBtns = document.querySelectorAll(".trending-strip-btn");
  const similarModal = document.getElementById("similar-modal");
  const closeSimilarBtn = document.getElementById("close-similar-btn");
  const similarProductsGrid = document.getElementById("similar-products-grid");
  const similarModalTitle = document.getElementById("similar-modal-title");
  const searchInput = document.getElementById("search-input");

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
  const checkoutBtn = document.getElementById("checkout-btn");

  // Wishlist DOM
  const wishlistBadge = document.getElementById("wishlist-badge-count");
  const openWishlistBtn = document.getElementById("open-wishlist-btn");

  // Mobile Application Bottom Bar DOM
  const mobileNavWishlist = document.getElementById("app-nav-wishlist-btn");
  const mobileNavCart = document.getElementById("app-nav-cart-btn");
  const mobileNavWishlistCount = document.getElementById("app-nav-wishlist-count");
  const mobileNavCartCount = document.getElementById("app-nav-cart-count");

  // Quick View Modal DOM
  const quickViewModal = document.getElementById("quickview-modal");
  const closeQuickViewBtn = document.getElementById("close-quickview-btn");
  const quickViewContent = document.getElementById("quickview-body");

  // Checkout Modal DOM
  const checkoutModal = document.getElementById("checkout-modal");
  const closeCheckoutBtn = document.getElementById("close-checkout-btn");
  const checkoutForm = document.getElementById("checkout-form");
  const checkoutItemsSummary = document.getElementById("checkout-items-summary");
  const checkoutTotalDisplay = document.getElementById("checkout-total-display");

  // Interactive Ring Sizer DOM
  const ringSlider = document.getElementById("ring-sizer-slider");
  const ringSizeValue = document.getElementById("ring-size-value");
  const ringDiameterValue = document.getElementById("ring-diameter-value");
  const ringCirclePreview = document.getElementById("ring-circle-preview");

  // ----------------------------------------------------
  // Everlite Hero Slider Logic (Auto-slide, Arrows, Dots, Swipe)
  // ----------------------------------------------------
  const sliderWrap = document.getElementById("hero-slider-wrap");
  const slides = document.querySelectorAll(".everlite-slide");
  const prevBtn = document.getElementById("slider-prev-btn");
  const nextBtn = document.getElementById("slider-next-btn");
  const dots = document.querySelectorAll(".slider-dot");

  let currentSlide = 0;
  let slideInterval = null;

  function showSlide(index) {
    if (slides.length === 0) return;
    if (index >= slides.length) currentSlide = 0;
    else if (index < 0) currentSlide = slides.length - 1;
    else currentSlide = index;

    slides.forEach((slide, i) => {
      slide.classList.toggle("active", i === currentSlide);
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === currentSlide);
    });
  }

  function nextSlide() {
    showSlide(currentSlide + 1);
  }

  function prevSlide() {
    showSlide(currentSlide - 1);
  }

  function startSlideShow() {
    stopSlideShow();
    slideInterval = setInterval(nextSlide, 2000);
  }

  function stopSlideShow() {
    if (slideInterval) {
      clearInterval(slideInterval);
      slideInterval = null;
    }
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      nextSlide();
      startSlideShow();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      prevSlide();
      startSlideShow();
    });
  }

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      showSlide(i);
      startSlideShow();
    });
  });

  if (sliderWrap) {
    sliderWrap.addEventListener("mouseenter", stopSlideShow);
    sliderWrap.addEventListener("mouseleave", startSlideShow);

    // Mobile Touch Swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    sliderWrap.addEventListener("touchstart", (e) => {
      touchStartX = e.changedTouches[0].screenX;
      stopSlideShow();
    }, { passive: true });

    sliderWrap.addEventListener("touchend", (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
      startSlideShow();
    }, { passive: true });

    function handleSwipe() {
      const swipeDistance = touchStartX - touchEndX;
      if (Math.abs(swipeDistance) > 40) {
        if (swipeDistance > 0) {
          nextSlide(); // Swiped left
        } else {
          prevSlide(); // Swiped right
        }
      }
    }
  }

  startSlideShow();

  // ----------------------------------------------------
  // Initialize Lenis Momentum Smooth Scroll Engine
  // ----------------------------------------------------
  let lenis = null;
  if (typeof Lenis !== "undefined") {
    lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.9,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    window.lenis = lenis;
  }

  // Smooth Scrolling for All In-Page Links with Header Offset
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (!targetId || targetId === "#" || targetId === "#!") return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const header = document.querySelector(".site-header");
        const headerOffset = header ? header.offsetHeight + 10 : 75;
        if (lenis) {
          lenis.scrollTo(targetElement, { offset: -headerOffset, duration: 1.15 });
        } else {
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
          });
        }
      }
    });
  });

  // ----------------------------------------------------
  // ----------------------------------------------------
  // Trending Now 4-Column Luxury Product Cards
  // ----------------------------------------------------
  function renderTrendingCards(categoryName) {
    if (!trendingCardsGrid) return;

    let items = state.products.filter(p => p.category.toLowerCase() === categoryName.toLowerCase());
    if (items.length < 4) {
      const others = state.products.filter(p => p.category.toLowerCase() !== categoryName.toLowerCase());
      items = [...items, ...others];
    }
    const displayItems = items.slice(0, 4);

    trendingCardsGrid.innerHTML = displayItems.map((product, idx) => {
      const isWishlisted = state.wishlist.some(w => w.id === product.id);
      const discountPercent = product.mrp > product.price 
        ? Math.round(((product.mrp - product.price) / product.mrp) * 100) 
        : 15;
      const badgeText = idx === 0 ? "🔥 Trending #1" : (product.tag || "✨ Trending");

      return `
        <article class="trending-card" data-id="${product.id}">
          <div class="trending-card-media" onclick="window.location.href='product.html?id=${product.id}'">
            <div class="trending-top-badge">${badgeText}</div>
            
            <button class="trending-wishlist-btn ${isWishlisted ? 'active' : ''}" data-wishlist-id="${product.id}" title="Save to Wishlist">
              <svg viewBox="0 0 24 24" fill="${isWishlisted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>

            <img src="${product.image}" alt="${product.title}" loading="lazy" />

            <div class="trending-hover-overlay">
              <button class="btn-view-similar" data-view-similar-id="${product.id}" data-category="${product.category}">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <span>View Similar</span>
              </button>
            </div>
          </div>

          <div class="trending-card-body">
            <div class="trending-purity-row">
              <span class="trending-purity-pill">${product.metal || '18K Solid Gold'}</span>
              <span>•</span>
              <span>${product.diamondCarat || 'Certified'}</span>
            </div>

            <h3 class="trending-card-title">
              <a href="product.html?id=${product.id}" style="color: inherit; text-decoration: none;" title="${product.title}">${product.title}</a>
            </h3>

            <div class="trending-rating-row">
              <span class="trending-rating-stars">★★★★★</span>
              <span>${product.rating || 4.9} (${product.reviewsCount || 28})</span>
            </div>

            <div class="trending-price-row">
              <span class="trending-current-price">${formatCurrency(product.price)}</span>
              ${product.mrp ? `<span class="trending-mrp-price">${formatCurrency(product.mrp)}</span>` : ""}
              ${discountPercent > 0 ? `<span class="trending-save-badge">Save ${discountPercent}%</span>` : ""}
            </div>

            <div class="trending-actions-row">
              <button class="btn-card-primary" data-cart-id="${product.id}" style="width: 100%;">
                <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <span>Add To Bag</span>
              </button>
            </div>
          </div>
        </article>
      `;
    }).join("");

    attachTrendingEventListeners();
  }

  // ----------------------------------------------------
  // Trending Event Listeners (Cart, Wishlist, Similar, QuickView)
  // ----------------------------------------------------
  function attachTrendingEventListeners() {
    // Add to Cart
    trendingCardsGrid.querySelectorAll("[data-cart-id]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-cart-id");
        addToCart(id);
      });
    });

    // Wishlist Toggle
    trendingCardsGrid.querySelectorAll("[data-wishlist-id]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-wishlist-id");
        toggleWishlist(id);
      });
    });

    // View Similar Designs Trigger
    trendingCardsGrid.querySelectorAll("[data-view-similar-id]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-view-similar-id");
        const cat = btn.getAttribute("data-category") || state.trendingCategory;
        openSimilarModal(id, cat);
      });
    });

    // Quick View
    trendingCardsGrid.querySelectorAll("[data-quickview-id]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-quickview-id");
        openQuickView(id);
      });
    });
  }

  // ----------------------------------------------------
  // Best Sellers Collection Logic
  // ----------------------------------------------------
  function renderBestsellers() {
    const container = document.getElementById("bestsellers-products-container");
    if (!container) return;

    let items = state.products.filter(p => p.tag === "Bestseller" || p.isFeatured);
    if (items.length < 4) {
      items = state.products;
    }
    const displayItems = items.slice(0, 4);

    container.innerHTML = displayItems.map(product => {
      const isWishlisted = state.wishlist.some(w => w.id === product.id);
      const discountPercent = product.mrp > product.price 
        ? Math.round(((product.mrp - product.price) / product.mrp) * 100) 
        : 15;

      return `
        <article class="catalog-product-card" data-id="${product.id}">
          <div class="catalog-media-box" onclick="window.location.href='product.html?id=${product.id}'">
            <span class="bestseller-ribbon">👑 Bestseller</span>
            
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
              <span>${product.rating || 4.9} (${product.reviewsCount || 42})</span>
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

    // Attach listeners for bestsellers
    container.querySelectorAll("[data-cart-id]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        addToCart(btn.getAttribute("data-cart-id"));
      });
    });

    container.querySelectorAll("[data-wishlist-id]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleWishlist(btn.getAttribute("data-wishlist-id"));
      });
    });

    container.querySelectorAll("[data-quickview-id]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        openQuickView(btn.getAttribute("data-quickview-id"));
      });
    });
  }

  // ----------------------------------------------------
  // Signature Products Catalog Logic (2 Rows / 8 Products Showcase)
  // ----------------------------------------------------
  function renderCatalogProducts() {
    const container = document.getElementById("catalog-products-container");
    const countDisplay = document.getElementById("catalog-count-display");
    const toggleWrap = document.getElementById("catalog-toggle-wrapper");
    const toggleBtn = document.getElementById("catalog-view-toggle-btn");
    const toggleText = document.getElementById("catalog-toggle-btn-text");
    const toggleHint = document.getElementById("catalog-pagination-hint");
    if (!container) return;

    let items = [...state.products];

    // Filter by Category
    if (state.catalogCategory && state.catalogCategory !== "All") {
      items = items.filter(p => p.category.toLowerCase() === state.catalogCategory.toLowerCase());
    }

    // Sort Items
    if (state.catalogSort === "price-low") {
      items.sort((a, b) => a.price - b.price);
    } else if (state.catalogSort === "price-high") {
      items.sort((a, b) => b.price - a.price);
    } else if (state.catalogSort === "rating") {
      items.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (state.catalogSort === "newest") {
      items.reverse();
    }

    const totalAvailable = items.length;

    if (totalAvailable === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem;">
          <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">💎</div>
          <h4 style="font-family: var(--font-heading); font-size: 1.4rem; margin-bottom: 0.5rem;">No Designs Found in "${state.catalogCategory}"</h4>
          <p style="color: var(--text-muted); font-size: 0.9rem;">Please choose another category pill above.</p>
        </div>
      `;
      if (toggleWrap) toggleWrap.style.display = "none";
      if (countDisplay) countDisplay.textContent = "Showing 0 Designs";
      return;
    }

    // 2-Lines limit (8 products) for index.html
    const displayItems = items.slice(0, 8);

    // Update count display
    if (countDisplay) {
      countDisplay.textContent = `Showing ${displayItems.length} of ${totalAvailable} Designs`;
    }

    // Update View All Products Button
    if (toggleWrap) {
      toggleWrap.style.display = "flex";
      if (toggleBtn && toggleText && toggleHint) {
        toggleText.textContent = "View All Products";
        const catParam = state.catalogCategory && state.catalogCategory !== "All" ? `?category=${encodeURIComponent(state.catalogCategory)}` : "";
        toggleBtn.href = `products.html${catParam}`;
        toggleHint.textContent = `Showing 2 lines (8 designs). Click to explore all ${totalAvailable} pieces.`;
      }
    }

    // Render cards (Without Quick View button)
    container.innerHTML = displayItems.map(product => {
      const isWishlisted = state.wishlist.some(w => w.id === product.id);
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

    attachCatalogEventListeners();
  }

  // ----------------------------------------------------
  // Catalog Filter Pills & Sort Select Controls
  // ----------------------------------------------------
  function setupCatalogControls() {
    const pillBtns = document.querySelectorAll("#catalog-filter-pills .catalog-pill-btn");
    const sortSelect = document.getElementById("catalog-sort-select");

    pillBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const cat = btn.getAttribute("data-catalog-category");
        pillBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        state.catalogCategory = cat;
        renderCatalogProducts();
      });
    });

    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        state.catalogSort = e.target.value;
        renderCatalogProducts();
      });
    }

    const toggleBtn = document.getElementById("catalog-view-toggle-btn");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => {
        state.catalogExpanded = !state.catalogExpanded;
        renderCatalogProducts();
        if (!state.catalogExpanded) {
          const target = document.getElementById("collection-section");
          if (target) target.scrollIntoView({ behavior: "smooth" });
        }
      });
    }
  }

  // ----------------------------------------------------
  // Catalog Event Listeners (Add to Bag, Wishlist, Quick View)
  // ----------------------------------------------------
  function attachCatalogEventListeners() {
    const container = document.getElementById("catalog-products-container");
    if (!container) return;

    // Add to Bag
    container.querySelectorAll("[data-cart-id]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-cart-id");
        addToCart(id);
      });
    });

    // Wishlist Toggle
    container.querySelectorAll("[data-wishlist-id]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-wishlist-id");
        toggleWishlist(id);
      });
    });

    // Quick View
    container.querySelectorAll("[data-quickview-id]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-quickview-id");
        openQuickView(id);
      });
    });
  }

  // ----------------------------------------------------
  // View Similar Designs Modal Logic
  // ----------------------------------------------------
  function openSimilarModal(productId, category) {
    if (!similarModal || !similarProductsGrid) return;

    let similarItems = state.products.filter(p => p.category.toLowerCase() === category.toLowerCase() && p.id !== productId);
    if (similarItems.length === 0) {
      similarItems = state.products.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    if (similarModalTitle) {
      similarModalTitle.textContent = `Similar Handcrafted ${category}`;
    }

    similarProductsGrid.innerHTML = similarItems.map(item => `
      <div class="similar-card-item">
        <img src="${item.image}" alt="${item.title}" class="similar-item-img" />
        <div class="similar-item-body">
          <div style="font-size: 0.72rem; color: var(--rose-gold-dark); font-weight: 700; text-transform: uppercase; margin-bottom: 0.25rem;">
            ${item.metal || '18K Gold'} • ${item.diamondCarat || 'Certified'}
          </div>
          <h4 class="similar-item-title">${item.title}</h4>
          <div class="similar-item-price">${formatCurrency(item.price)}</div>
          <div style="display: flex; gap: 0.5rem; margin-top: auto;">
            <button class="btn-card-primary" data-similar-cart-id="${item.id}" style="padding: 0.5rem 0.85rem; font-size: 0.8rem; width: 100%;">
              <span>Add to Bag</span>
            </button>
            <button class="btn-card-secondary" data-similar-view-id="${item.id}" style="padding: 0.5rem 0.75rem; font-size: 0.8rem;">
              <span>View</span>
            </button>
          </div>
        </div>
      </div>
    `).join("");

    similarModal.classList.add("open");
    document.body.style.overflow = "hidden";
    if (window.lenis) window.lenis.stop();

    // Attach listeners inside modal
    similarProductsGrid.querySelectorAll("[data-similar-cart-id]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-similar-cart-id");
        addToCart(id);
      });
    });

    similarProductsGrid.querySelectorAll("[data-similar-view-id]").forEach(btn => {
      btn.addEventListener("click", () => {
        closeSimilarModal();
        const id = btn.getAttribute("data-similar-view-id");
        window.location.href = `product.html?id=${id}`;
      });
    });
  }

  function closeSimilarModal() {
    if (similarModal) {
      similarModal.classList.remove("open");
      document.body.style.overflow = "";
      if (window.lenis) window.lenis.start();
    }
  }

  // ----------------------------------------------------
  // 4-Category Strip Controller (Smooth GSAP Transition)
  // ----------------------------------------------------
  function setupTrendingStrip() {
    trendingStripBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const newCat = btn.getAttribute("data-trending-category");
        if (newCat === state.trendingCategory) return;

        trendingStripBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        state.trendingCategory = newCat;

        const cards = trendingCardsGrid ? trendingCardsGrid.querySelectorAll(".trending-card") : [];

        if (typeof gsap !== "undefined" && cards.length > 0) {
          gsap.to(cards, {
            opacity: 0,
            y: 8,
            duration: 0.18,
            ease: "power2.in",
            onComplete: () => {
              renderTrendingCards(newCat);
              const newCards = trendingCardsGrid.querySelectorAll(".trending-card");
              if (newCards.length > 0) {
                gsap.fromTo(newCards,
                  { opacity: 0, y: 15 },
                  { opacity: 1, y: 0, duration: 0.45, stagger: 0.06, ease: "power2.out" }
                );
              }
            }
          });
        } else {
          renderTrendingCards(newCat);
        }
      });
    });
  }

  // ----------------------------------------------------
  // GSAP ScrollTrigger: Smooth Stagger Reveal for Product Cards
  // ----------------------------------------------------
  function initGSAPScrollAnimation() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    if (window.lenis) {
      window.lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => {
        window.lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    }

    ScrollTrigger.create({
      trigger: "#trending-section",
      start: "top 75%",
      once: true,
      onEnter: () => {
        const cards = document.querySelectorAll("#trending-cards-grid .trending-card");
        if (cards.length > 0) {
          gsap.fromTo(cards,
            { opacity: 0, y: 22 },
            { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: "power3.out" }
          );
        }
      }
    });

    ScrollTrigger.create({
      trigger: "#bestsellers-section",
      start: "top 75%",
      once: true,
      onEnter: () => {
        const bCards = document.querySelectorAll("#bestsellers-products-container .catalog-product-card");
        if (bCards.length > 0) {
          gsap.fromTo(bCards,
            { opacity: 0, y: 22 },
            { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: "power3.out" }
          );
        }
      }
    });
  }

  // ----------------------------------------------------
  // Cart Logic
  // ----------------------------------------------------
  function addToCart(productId, size = "Standard", qty = 1) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    const existingIndex = state.cart.findIndex(item => item.id === productId && item.size === size);
    if (existingIndex > -1) {
      state.cart[existingIndex].qty += qty;
    } else {
      state.cart.push({
        id: product.id,
        title: product.title,
        price: product.price,
        mrp: product.mrp,
        metal: product.metal,
        image: product.image,
        size: size,
        qty: qty
      });
    }

    DB.saveCart(state.cart);
    updateCartUI();
    if (window.innerWidth > 768) {
      openCartDrawer();
    }
    showToast(`Added "${product.title}" to your Bag! ✨`, "success");
  }

  function updateCartUI() {
    // Update Badge
    const totalItems = state.cart.reduce((sum, item) => sum + item.qty, 0);
    if (cartBadge) cartBadge.textContent = totalItems;
    if (mobileNavCartCount) mobileNavCartCount.textContent = totalItems;

    // Update Subtotal
    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    if (cartSubtotal) cartSubtotal.textContent = formatCurrency(subtotal);

    // Free Shipping Bar (Threshold ₹50,000)
    const threshold = 50000;
    if (freeShippingBar && freeShippingText) {
      const percentage = Math.min(100, (subtotal / threshold) * 100);
      freeShippingBar.style.width = `${percentage}%`;
      if (subtotal >= threshold) {
        freeShippingText.innerHTML = `🎉 <strong>Congratulations!</strong> You qualify for <strong>FREE Insured Express Shipping & Luxury Box</strong>!`;
      } else {
        const remaining = threshold - subtotal;
        freeShippingText.innerHTML = `Add <strong>${formatCurrency(remaining)}</strong> more to unlock <strong>FREE Luxury Gift Packaging & Insured Shipping</strong>`;
      }
    }

    // Render Drawer Items
    if (!cartItemsList) return;

    if (state.cart.length === 0) {
      cartItemsList.innerHTML = `
        <div style="text-align: center; padding: 4rem 1rem;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🛍️</div>
          <h4 style="font-family: var(--font-heading); font-size: 1.5rem; margin-bottom: 0.5rem;">Your Cart is Empty</h4>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.5rem;">Discover our latest solitaire & rose gold collections.</p>
          <button class="btn-primary" id="start-shopping-btn" style="font-size: 0.85rem; padding: 0.75rem 1.5rem;">Explore Jewellery</button>
        </div>
      `;
      const startShop = document.getElementById("start-shopping-btn");
      if (startShop) {
        startShop.addEventListener("click", () => {
          closeCartDrawer();
          const target = document.getElementById("collection-section");
          if (target) target.scrollIntoView({ behavior: "smooth" });
        });
      }
      return;
    }

    cartItemsList.innerHTML = state.cart.map((item, index) => `
      <div class="cart-item-card">
        <div class="cart-item-img">
          <img src="${item.image}" alt="${item.title}" />
        </div>
        <div class="cart-item-details">
          <h4>${item.title}</h4>
          <div class="cart-item-meta">Size: ${item.size} • ${item.metal || '18K Gold'}</div>
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

    // Attach Cart Item Listeners
    document.querySelectorAll("[data-qty-action]").forEach(btn => {
      btn.addEventListener("click", () => {
        const action = btn.getAttribute("data-qty-action");
        const idx = parseInt(btn.getAttribute("data-index"), 10);
        if (action === "inc") {
          state.cart[idx].qty += 1;
        } else if (action === "dec") {
          if (state.cart[idx].qty > 1) {
            state.cart[idx].qty -= 1;
          } else {
            state.cart.splice(idx, 1);
          }
        }
        DB.saveCart(state.cart);
        updateCartUI();
      });
    });

    document.querySelectorAll("[data-remove-index]").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.getAttribute("data-remove-index"), 10);
        state.cart.splice(idx, 1);
        DB.saveCart(state.cart);
        updateCartUI();
        showToast("Item removed from cart", "info");
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
    if (window.lenis) window.lenis.stop();
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
    if (window.lenis) window.lenis.start();
  }

  // ----------------------------------------------------
  // Wishlist Logic
  // ----------------------------------------------------
  function toggleWishlist(productId) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    const index = state.wishlist.findIndex(w => w.id === productId);
    if (index > -1) {
      state.wishlist.splice(index, 1);
      showToast(`Removed from Wishlist`, "info");
    } else {
      state.wishlist.push(product);
      showToast(`Saved to Wishlist ❤️`, "success");
    }

    DB.saveWishlist(state.wishlist);
    updateWishlistUI();
  }

  function updateWishlistUI() {
    if (wishlistBadge) {
      wishlistBadge.textContent = state.wishlist.length;
    }
    if (mobileNavWishlistCount) {
      mobileNavWishlistCount.textContent = state.wishlist.length;
    }
    document.querySelectorAll("[data-wishlist-id]").forEach(btn => {
      const id = btn.getAttribute("data-wishlist-id");
      const isWish = state.wishlist.some(w => w.id === id);
      btn.classList.toggle("active", isWish);
      const svg = btn.querySelector("svg");
      if (svg) {
        svg.setAttribute("fill", isWish ? "currentColor" : "none");
      }
    });
  }

  // ----------------------------------------------------
  // Quick View Modal
  // ----------------------------------------------------
  function openQuickView(productId) {
    const product = state.products.find(p => p.id === productId);
    if (!product || !quickViewContent) return;

    state.selectedQuickViewProduct = product;
    state.selectedRingSize = "14";

    const discountPercent = product.mrp > product.price 
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100) 
      : 0;

    quickViewContent.innerHTML = `
      <div class="quickview-layout">
        <div class="quickview-gallery">
          <img src="${product.image}" alt="${product.title}" id="quickview-main-image" />
        </div>
        <div class="quickview-details">
          <div style="font-size: 0.78rem; text-transform: uppercase; color: var(--rose-gold-dark); font-weight: 700; margin-bottom: 0.35rem;">
            ${product.category} • ${product.tag || 'Fine Jewellery'}
          </div>
          <h2>${product.title}</h2>
          <div class="product-rating" style="margin-bottom: 1rem;">
            <span class="stars">★★★★★</span>
            <span>${product.rating} | 100% Certified by BIS & IGI</span>
          </div>
          
          <div class="product-pricing" style="margin-bottom: 1.25rem;">
            <span class="product-price" style="font-size: 1.7rem;">${formatCurrency(product.price)}</span>
            ${product.mrp ? `<span class="product-mrp" style="font-size: 1.1rem;">${formatCurrency(product.mrp)}</span>` : ""}
            ${discountPercent > 0 ? `<span class="product-discount-badge" style="font-size: 0.82rem;">Save ${discountPercent}%</span>` : ""}
          </div>

          <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.7; margin-bottom: 1.25rem;">
            ${product.description || 'Indulge in flawless artistry, made with 18K solid gold and hand-set certified natural diamonds.'}
          </p>

          <div class="quickview-specs-box">
            <div class="spec-cell">
              <strong>Gold Purity</strong>
              <span>${product.metal || '18K Rose Gold'} (BIS 916)</span>
            </div>
            <div class="spec-cell">
              <strong>Diamond Weight</strong>
              <span>${product.diamondCarat || '0.75 Ct Natural Diamond'}</span>
            </div>
            <div class="spec-cell">
              <strong>Clarity / Color</strong>
              <span>${product.diamondClarity || 'VVS-VS / EF Color'}</span>
            </div>
            <div class="spec-cell">
              <strong>Certification</strong>
              <span>IGI Certificate Included</span>
            </div>
          </div>

          ${product.category === "Rings" ? `
            <div class="size-selector-group">
              <label>Select Indian Ring Size:</label>
              <div class="size-pills" id="modal-ring-size-pills">
                <button type="button" class="size-pill" data-size="10">10</button>
                <button type="button" class="size-pill" data-size="12">12</button>
                <button type="button" class="size-pill active" data-size="14">14</button>
                <button type="button" class="size-pill" data-size="16">16</button>
                <button type="button" class="size-pill" data-size="18">18</button>
              </div>
            </div>
          ` : ''}

          <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
            <button class="btn-primary" id="modal-add-cart-btn" style="flex-grow: 1;">
              <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              Add To Shopping Bag
            </button>
          </div>
        </div>
      </div>
    `;

    // Modal size pill handlers
    const sizePills = document.querySelectorAll("#modal-ring-size-pills .size-pill");
    sizePills.forEach(pill => {
      pill.addEventListener("click", () => {
        sizePills.forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        state.selectedRingSize = pill.dataset.size;
      });
    });

    // Modal Add To Cart
    const modalAddBtn = document.getElementById("modal-add-cart-btn");
    if (modalAddBtn) {
      modalAddBtn.addEventListener("click", () => {
        addToCart(product.id, product.category === "Rings" ? `Size ${state.selectedRingSize}` : "Standard");
        closeQuickView();
      });
    }

    if (quickViewModal) {
      quickViewModal.classList.add("open");
      document.body.style.overflow = "hidden";
      if (window.lenis) window.lenis.stop();
    }
  }

  function closeQuickView() {
    if (quickViewModal) {
      quickViewModal.classList.remove("open");
      document.body.style.overflow = "";
      if (window.lenis) window.lenis.start();
    }
  }

  // ----------------------------------------------------
  // Interactive Ring Sizer Widget
  // ----------------------------------------------------
  if (ringSlider) {
    const sizeMap = {
      10: { dia: 15.9, px: 75 },
      11: { dia: 16.2, px: 78 },
      12: { dia: 16.5, px: 82 },
      13: { dia: 16.8, px: 86 },
      14: { dia: 17.2, px: 90 },
      15: { dia: 17.5, px: 94 },
      16: { dia: 17.8, px: 98 },
      17: { dia: 18.1, px: 102 },
      18: { dia: 18.5, px: 106 },
      19: { dia: 18.8, px: 110 },
      20: { dia: 19.1, px: 114 }
    };

    ringSlider.addEventListener("input", (e) => {
      const val = parseInt(e.target.value, 10);
      const data = sizeMap[val] || { dia: 17.2, px: 90 };
      if (ringSizeValue) ringSizeValue.textContent = `Size ${val}`;
      if (ringDiameterValue) ringDiameterValue.textContent = `${data.dia} mm`;
      if (ringCirclePreview) {
        ringCirclePreview.style.width = `${data.px}px`;
        ringCirclePreview.style.height = `${data.px}px`;
        ringCirclePreview.querySelector("span").textContent = val;
      }
    });
  }

  // ----------------------------------------------------
  // Checkout Modal & Flow
  // ----------------------------------------------------
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      if (state.cart.length === 0) {
        showToast("Your cart is empty!", "info");
        return;
      }
      closeCartDrawer();
      openCheckoutModal();
    });
  }

  function openCheckoutModal() {
    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    if (checkoutTotalDisplay) checkoutTotalDisplay.textContent = formatCurrency(subtotal);

    if (checkoutItemsSummary) {
      checkoutItemsSummary.innerHTML = state.cart.map(item => `
        <div style="display: flex; justify-content: space-between; font-size: 0.84rem; margin-bottom: 0.5rem; color: var(--text-secondary);">
          <span>${item.qty}x ${item.title} (${item.size})</span>
          <span style="font-weight: 600; color: var(--text-primary);">${formatCurrency(item.price * item.qty)}</span>
        </div>
      `).join("");
    }

    if (checkoutModal) {
      checkoutModal.classList.add("open");
      document.body.style.overflow = "hidden";
      if (window.lenis) window.lenis.stop();
    }
  }

  function closeCheckoutModal() {
    if (checkoutModal) {
      checkoutModal.classList.remove("open");
      document.body.style.overflow = "";
      if (window.lenis) window.lenis.start();
    }
  }

  if (checkoutForm) {
    checkoutForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const formData = new FormData(checkoutForm);
      const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

      const orderPayload = {
        customerName: formData.get("fullname"),
        phone: formData.get("phone"),
        email: formData.get("email"),
        address: `${formData.get("address")}, ${formData.get("city")}, Pincode: ${formData.get("pincode")}`,
        paymentMethod: formData.get("paymentMethod") || "Prepaid UPI",
        items: [...state.cart],
        totalAmount: subtotal
      };

      const placedOrder = DB.createOrder(orderPayload);

      // Clear cart
      state.cart = [];
      DB.saveCart(state.cart);
      updateCartUI();

      closeCheckoutModal();

      // Show luxury order placed celebration
      showOrderConfirmation(placedOrder);
    });
  }

  function showOrderConfirmation(order) {
    const confModal = document.getElementById("order-success-modal");
    const confDetails = document.getElementById("order-success-details");
    if (confModal && confDetails) {
      confDetails.innerHTML = `
        <div style="font-size: 3.5rem; margin-bottom: 1rem; animation: float 3s infinite;">💎</div>
        <h3 style="font-family: var(--font-heading); font-size: 2.2rem; margin-bottom: 0.5rem; color: var(--text-primary);">Order Confirmed!</h3>
        <p style="font-size: 0.95rem; color: var(--text-secondary); margin-bottom: 1.5rem;">
          Thank you, <strong>${order.customerName}</strong>. Your luxury jewellery package is being crafted and prepared for insured express dispatch.
        </p>
        <div style="background: var(--bg-cream); border: 1px dashed var(--border-rose); border-radius: var(--radius-md); padding: 1.25rem; margin-bottom: 1.5rem;">
          <div style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">Order Number</div>
          <div style="font-size: 1.4rem; font-weight: 700; color: var(--rose-gold-dark);">${order.orderId}</div>
          <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.35rem;">Total Amount Paid: <strong>${formatCurrency(order.totalAmount)}</strong></div>
        </div>
        <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 1.5rem;">
          A digital invoice with BIS Hallmarking & IGI Diamond Guarantee card has been sent to your phone & email.
        </p>
        <button class="btn-primary" id="order-success-close-btn" style="width: 100%;">Continue Shopping</button>
      `;

      confModal.classList.add("open");
      document.body.style.overflow = "hidden";

      const closeSuccess = document.getElementById("order-success-close-btn");
      if (closeSuccess) {
        closeSuccess.addEventListener("click", () => {
          confModal.classList.remove("open");
          document.body.style.overflow = "";
        });
      }
    }
  }

  // ----------------------------------------------------
  // Global Event Listeners & Filter Handlers
  // ----------------------------------------------------
  // Category Quick Links from Category Carousel
  document.querySelectorAll("[data-nav-category]").forEach(item => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const cat = item.getAttribute("data-nav-category");

      // Sync Trending Strip
      const matchedStripBtn = Array.from(trendingStripBtns).find(btn => 
        btn.getAttribute("data-trending-category").toLowerCase() === cat.toLowerCase()
      );
      if (matchedStripBtn) {
        matchedStripBtn.click();
      } else {
        renderTrendingCards(cat);
      }

      // Sync Catalog Filter Pills
      const matchedCatalogPill = Array.from(document.querySelectorAll("#catalog-filter-pills .catalog-pill-btn")).find(btn => 
        btn.getAttribute("data-catalog-category").toLowerCase() === cat.toLowerCase()
      );
      if (matchedCatalogPill) {
        document.querySelectorAll("#catalog-filter-pills .catalog-pill-btn").forEach(b => b.classList.remove("active"));
        matchedCatalogPill.classList.add("active");
        state.catalogCategory = cat;
        renderCatalogProducts();
      }

      const target = document.getElementById("collection-section");
      if (target) {
        const header = document.querySelector(".site-header");
        const headerOffset = header ? header.offsetHeight + 10 : 75;
        if (lenis) {
          lenis.scrollTo(target, { offset: -headerOffset, duration: 1.15 });
        } else {
          const elementPosition = target.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
          });
        }
      }
    });
  });

  // Search input handler
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener("input", (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const query = e.target.value.toLowerCase().trim();
        if (!query) return;
        
        let foundCat = null;
        if (query.includes("ring")) foundCat = "Rings";
        else if (query.includes("neck") || query.includes("choker") || query.includes("pendant")) foundCat = "Necklaces";
        else if (query.includes("brace") || query.includes("bangle")) foundCat = "Bracelets";
        else if (query.includes("ear") || query.includes("stud")) foundCat = "Earrings";

        if (foundCat) {
          const btn = Array.from(trendingStripBtns).find(b => b.getAttribute("data-trending-category") === foundCat);
          if (btn) btn.click();

          const matchedCatalogPill = Array.from(document.querySelectorAll("#catalog-filter-pills .catalog-pill-btn")).find(btn => 
            btn.getAttribute("data-catalog-category").toLowerCase() === foundCat.toLowerCase()
          );
          if (matchedCatalogPill) {
            matchedCatalogPill.click();
          }
        }
      }, 300);
    });
  }

  // Similar modal close buttons
  if (closeSimilarBtn) closeSimilarBtn.addEventListener("click", closeSimilarModal);
  if (similarModal) {
    similarModal.addEventListener("click", (e) => {
      if (e.target === similarModal) closeSimilarModal();
    });
  }

  // Cart Drawer open/close
  if (openCartBtn) openCartBtn.addEventListener("click", openCartDrawer);
  if (closeCartBtn) closeCartBtn.addEventListener("click", closeCartDrawer);
  if (cartBackdrop) cartBackdrop.addEventListener("click", closeCartDrawer);

  // Quick View Close
  if (closeQuickViewBtn) closeQuickViewBtn.addEventListener("click", closeQuickView);
  if (quickViewModal) {
    quickViewModal.addEventListener("click", (e) => {
      if (e.target === quickViewModal) closeQuickView();
    });
  }

  // Checkout Close
  if (closeCheckoutBtn) closeCheckoutBtn.addEventListener("click", closeCheckoutModal);
  if (checkoutModal) {
    checkoutModal.addEventListener("click", (e) => {
      if (e.target === checkoutModal) closeCheckoutModal();
    });
  }

  // Toast Notification Helper
  function showToast(message, type = "info") {
    let container = document.querySelector(".toast-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span>💎</span>
      <span>${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(10px)";
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // Search input & Visual camera search redirect to products page
  if (searchInput) {
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        const q = searchInput.value.trim();
        if (q) {
          window.location.href = `products.html?search=${encodeURIComponent(q)}`;
        }
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
        showToast("📷 Analyzing jewellery photo with AI visual search...", "info");
        setTimeout(() => {
          window.location.href = "products.html?search=diamond";
        }, 1200);
      }
    });
  }

  // Mobile Bottom App Navigation Handlers
  if (mobileNavCart) {
    mobileNavCart.addEventListener("click", openCartDrawer);
  }
  if (mobileNavWishlist) {
    mobileNavWishlist.addEventListener("click", () => {
      showToast(`You have ${state.wishlist.length} heirloom item(s) in your Wishlist ❤️`, "info");
    });
  }
  if (openWishlistBtn) {
    openWishlistBtn.addEventListener("click", () => {
      showToast(`You have ${state.wishlist.length} heirloom item(s) in your Wishlist ❤️`, "info");
    });
  }

  // Make showToast accessible globally
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

  // Initial Boot
  renderTrendingCards(state.trendingCategory);
  setupTrendingStrip();
  renderBestsellers();
  renderCatalogProducts();
  setupCatalogControls();
  initGSAPScrollAnimation();
  updateCartUI();
  updateWishlistUI();
});
