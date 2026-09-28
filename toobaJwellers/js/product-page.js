/**
 * Tooba Jewellers - Product Detail Page Engine
 * Handles dynamic product loading, gallery, size/metal selection,
 * cart drawer, checkout, and category-managed Similar Products.
 */

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Page State
  const allProducts = DB.getProducts();
  const urlParams = new URLSearchParams(window.location.search);
  const requestedId = urlParams.get("id");

  // Locate Product or Fallback to Premier Piece
  let currentProduct = allProducts.find(p => p.id === requestedId);
  if (!currentProduct && allProducts.length > 0) {
    currentProduct = allProducts[0];
  }

  const pageState = {
    product: currentProduct,
    selectedMetal: currentProduct ? currentProduct.metal || "18K Rose Gold" : "18K Rose Gold",
    selectedSize: "14",
    quantity: 1,
    cart: DB.getCart(),
    wishlist: DB.getWishlist()
  };

  // DOM Elements
  const primaryImg = document.getElementById("product-primary-img");
  const mainView = document.getElementById("product-main-view");
  const thumbsStrip = document.getElementById("product-thumbs-strip");
  const badgeDisplay = document.getElementById("product-badge-display");
  const skuDisplay = document.getElementById("product-sku-display");
  const categoryTag = document.getElementById("product-category-tag");
  const titleDisplay = document.getElementById("product-title-display");
  const ratingText = document.getElementById("product-rating-text");
  const priceDisplay = document.getElementById("product-price-display");
  const mrpDisplay = document.getElementById("product-mrp-display");
  const saveBadge = document.getElementById("product-save-badge");
  const descDisplay = document.getElementById("product-description-display");
  const specMetal = document.getElementById("spec-metal");
  const specCarat = document.getElementById("spec-carat");
  const specClarity = document.getElementById("spec-clarity");
  const ringSizeBlock = document.getElementById("ring-size-block");
  const selectedSizeLabel = document.getElementById("selected-size-label");
  const selectedMetalName = document.getElementById("selected-metal-name");
  const metalPills = document.querySelectorAll(".metal-pill-btn");
  const ringSizeBtns = document.querySelectorAll(".ring-size-btn");
  const qtyInput = document.getElementById("qty-input");
  const qtyMinusBtn = document.getElementById("qty-minus-btn");
  const qtyPlusBtn = document.getElementById("qty-plus-btn");
  const addCartBtn = document.getElementById("page-add-cart-btn");
  const buyNowBtn = document.getElementById("page-buy-now-btn");
  const wishlistBtn = document.getElementById("product-page-wishlist-btn");
  const breadcrumbCategory = document.getElementById("breadcrumb-category");
  const breadcrumbTitle = document.getElementById("breadcrumb-product-title");
  const pageTitle = document.getElementById("page-title");

  // Cart & Wishlist DOM
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

  // Checkout DOM
  const checkoutBtn = document.getElementById("checkout-btn");
  const checkoutModal = document.getElementById("checkout-modal");
  const closeCheckoutBtn = document.getElementById("close-checkout-btn");
  const checkoutForm = document.getElementById("checkout-form");
  const checkoutItemsSummary = document.getElementById("checkout-items-summary");
  const checkoutTotalDisplay = document.getElementById("checkout-total-display");

  // Mobile Sticky Buy Bar & App Nav DOM
  const mobileBarPrice = document.getElementById("mobile-bar-price");
  const mobileBarAddCart = document.getElementById("mobile-bar-add-cart");
  const mobileBarBuyNow = document.getElementById("mobile-bar-buy-now");
  const mobileNavWishlist = document.getElementById("app-nav-wishlist-btn");
  const mobileNavCart = document.getElementById("app-nav-cart-btn");
  const mobileNavWishlistCount = document.getElementById("app-nav-wishlist-count");
  const mobileNavCartCount = document.getElementById("app-nav-cart-count");

  // Initialize Smooth Scrolling (Lenis)
  if (typeof Lenis !== "undefined") {
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    window.lenis = lenis;
  }

  // ----------------------------------------------------
  // Populate Product Details
  // ----------------------------------------------------
  function populateProductDetails() {
    if (!currentProduct) return;

    // Document Titles & Breadcrumbs
    if (pageTitle) pageTitle.textContent = `${currentProduct.title} | Tooba Jewellers`;
    if (breadcrumbCategory) {
      breadcrumbCategory.textContent = currentProduct.category;
      breadcrumbCategory.href = `products.html?category=${encodeURIComponent(currentProduct.category)}`;
    }
    if (breadcrumbTitle) breadcrumbTitle.textContent = currentProduct.title;

    // Media
    if (primaryImg) {
      primaryImg.src = currentProduct.image;
      primaryImg.alt = currentProduct.title;
    }

    if (badgeDisplay) {
      badgeDisplay.textContent = currentProduct.tag 
        ? `★ ${currentProduct.tag}` 
        : (currentProduct.isFeatured ? "★ Bestseller" : "✨ Certified 18K");
    }

    // Header info
    if (categoryTag) categoryTag.textContent = currentProduct.category;
    if (skuDisplay) skuDisplay.textContent = `SKU: TJ-${currentProduct.id.replace("tj-", "")}`;
    if (titleDisplay) titleDisplay.textContent = currentProduct.title;
    if (ratingText) {
      ratingText.textContent = `${currentProduct.rating || 4.9} (${currentProduct.reviewsCount || 38} Verified Reviews)`;
    }

    // Pricing
    const discountPercent = currentProduct.mrp > currentProduct.price 
      ? Math.round(((currentProduct.mrp - currentProduct.price) / currentProduct.mrp) * 100) 
      : 15;

    if (priceDisplay) priceDisplay.textContent = formatCurrency(currentProduct.price);
    if (mobileBarPrice) mobileBarPrice.textContent = formatCurrency(currentProduct.price);
    if (mrpDisplay) mrpDisplay.textContent = currentProduct.mrp ? formatCurrency(currentProduct.mrp) : "";
    if (saveBadge) {
      saveBadge.textContent = `Save ${discountPercent}%`;
      saveBadge.style.display = discountPercent > 0 ? "inline-block" : "none";
    }

    // Description & Specs
    if (descDisplay) descDisplay.textContent = currentProduct.description || "Crafted in 18K lustrous gold with hand-set certified diamonds.";
    if (specMetal) specMetal.textContent = `${currentProduct.metal || "18K Solid Gold"} (BIS 916)`;
    if (specCarat) specCarat.textContent = `${currentProduct.diamondCarat || "0.75 Ct"} Natural Diamond`;
    if (specClarity) specClarity.textContent = currentProduct.diamondClarity || "VVS-VS / EF Color";

    // Ring Size selector visibility
    if (ringSizeBlock) {
      if (currentProduct.category.toLowerCase() === "rings") {
        ringSizeBlock.style.display = "block";
      } else {
        ringSizeBlock.style.display = "none";
      }
    }

    // Populate Thumbnails (Main + 3 elegant variations)
    if (thumbsStrip) {
      const thumbs = [
        currentProduct.image,
        "assets/images/solitaire-ring.jpg",
        "assets/images/tennis-bracelet.jpg",
        "assets/images/editorial-model.jpg"
      ];

      thumbsStrip.innerHTML = thumbs.map((imgUrl, i) => `
        <div class="product-thumb ${i === 0 ? 'active' : ''}" data-thumb-src="${imgUrl}">
          <img src="${imgUrl}" alt="Thumbnail View ${i + 1}" />
        </div>
      `).join("");

      thumbsStrip.querySelectorAll(".product-thumb").forEach(thumb => {
        thumb.addEventListener("click", () => {
          thumbsStrip.querySelectorAll(".product-thumb").forEach(t => t.classList.remove("active"));
          thumb.classList.add("active");
          const targetSrc = thumb.getAttribute("data-thumb-src");
          if (primaryImg) {
            primaryImg.style.opacity = "0.4";
            setTimeout(() => {
              primaryImg.src = targetSrc;
              primaryImg.style.opacity = "1";
            }, 150);
          }
        });
      });
    }

    // Check wishlist state
    updateWishlistUI();
  }

  // ----------------------------------------------------
  // Metal Selection Handlers
  // ----------------------------------------------------
  metalPills.forEach(pill => {
    pill.addEventListener("click", () => {
      metalPills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      const metal = pill.getAttribute("data-metal");
      pageState.selectedMetal = metal;
      if (selectedMetalName) selectedMetalName.textContent = metal;
      if (specMetal) specMetal.textContent = `${metal} (BIS 916)`;
    });
  });

  // ----------------------------------------------------
  // Ring Size Selection Handlers
  // ----------------------------------------------------
  ringSizeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      ringSizeBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const size = btn.getAttribute("data-size");
      pageState.selectedSize = size;
      if (selectedSizeLabel) selectedSizeLabel.textContent = `Size ${size}`;
    });
  });

  // ----------------------------------------------------
  // Quantity Stepper Handlers
  // ----------------------------------------------------
  if (qtyMinusBtn && qtyInput) {
    qtyMinusBtn.addEventListener("click", () => {
      let cur = parseInt(qtyInput.value, 10) || 1;
      if (cur > 1) {
        cur--;
        qtyInput.value = cur;
        pageState.quantity = cur;
      }
    });
  }

  if (qtyPlusBtn && qtyInput) {
    qtyPlusBtn.addEventListener("click", () => {
      let cur = parseInt(qtyInput.value, 10) || 1;
      if (cur < 10) {
        cur++;
        qtyInput.value = cur;
        pageState.quantity = cur;
      }
    });
  }

  // ----------------------------------------------------
  // Add to Cart from Product Page
  // ----------------------------------------------------
  if (addCartBtn) {
    addCartBtn.addEventListener("click", () => {
      if (!currentProduct) return;
      const sizeLabel = currentProduct.category.toLowerCase() === "rings" 
        ? `Size ${pageState.selectedSize}` 
        : "Standard";

      addToCart(currentProduct.id, sizeLabel, pageState.selectedMetal, pageState.quantity);
    });
  }

  // ----------------------------------------------------
  // Buy Now (Direct Checkout)
  // ----------------------------------------------------
  if (buyNowBtn) {
    buyNowBtn.addEventListener("click", () => {
      if (!currentProduct) return;
      const sizeLabel = currentProduct.category.toLowerCase() === "rings" 
        ? `Size ${pageState.selectedSize}` 
        : "Standard";

      // Add to cart if not already present
      addToCart(currentProduct.id, sizeLabel, pageState.selectedMetal, pageState.quantity, false);
      openCheckoutModal();
    });
  }

  // Mobile Sticky Bottom Action Bar Handlers
  if (mobileBarAddCart) {
    mobileBarAddCart.addEventListener("click", () => {
      if (addCartBtn) addCartBtn.click();
    });
  }

  if (mobileBarBuyNow) {
    mobileBarBuyNow.addEventListener("click", () => {
      if (buyNowBtn) buyNowBtn.click();
    });
  }

  // Mobile Bottom App Navigation Handlers
  if (mobileNavCart) {
    mobileNavCart.addEventListener("click", openCartDrawer);
  }

  if (mobileNavWishlist) {
    mobileNavWishlist.addEventListener("click", () => {
      showToast(`You have ${pageState.wishlist.length} heirloom items in your wishlist!`, "info");
    });
  }

  // ----------------------------------------------------
  // Pincode Delivery Estimator
  // ----------------------------------------------------
  const pincodeForm = document.getElementById("pincode-check-form");
  const pincodeInput = document.getElementById("pincode-input");
  const pincodeResult = document.getElementById("pincode-result");
  const pincodeResultText = document.getElementById("pincode-result-text");

  if (pincodeForm) {
    pincodeForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const code = pincodeInput.value.trim();
      if (code.length === 6) {
        // Calculate estimated delivery: 3 business days from now
        const d = new Date();
        d.setDate(d.getDate() + 3);
        const dateStr = d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });

        if (pincodeResult && pincodeResultText) {
          pincodeResult.style.display = "flex";
          pincodeResultText.innerHTML = `Guaranteed Insured Delivery by <strong>${dateStr}</strong> to <strong>${code}</strong> (Express BlueDart / Sequel). COD & EMI Available!`;
        }
      }
    });
  }

  // ----------------------------------------------------
  // Accordion Handlers
  // ----------------------------------------------------
  document.querySelectorAll(".product-accordion-item").forEach(item => {
    const trigger = item.querySelector(".accordion-trigger");
    if (trigger) {
      trigger.addEventListener("click", () => {
        const isOpen = item.classList.contains("open");
        document.querySelectorAll(".product-accordion-item").forEach(other => {
          if (other !== item) other.classList.remove("open");
        });
        item.classList.toggle("open", !isOpen);
      });
    }
  });

  // ----------------------------------------------------
  // Similar Products Section (Category-Managed)
  // ----------------------------------------------------
  function renderSimilarProducts() {
    const container = document.getElementById("similar-products-container");
    const titleEl = document.getElementById("similar-section-title");
    const subtitleEl = document.getElementById("similar-section-subtitle");
    if (!container || !currentProduct) return;

    // Filter products matching current category (excluding current piece)
    let similar = allProducts.filter(p => 
      p.category.toLowerCase() === currentProduct.category.toLowerCase() && 
      p.id !== currentProduct.id
    );

    // If fewer than 4 items, backfill from other premier pieces
    if (similar.length < 4) {
      const others = allProducts.filter(p => p.id !== currentProduct.id && !similar.some(s => s.id === p.id));
      similar = [...similar, ...others];
    }
    const displayItems = similar.slice(0, 4);

    if (titleEl) {
      titleEl.textContent = `Similar Handcrafted ${currentProduct.category}`;
    }
    if (subtitleEl) {
      subtitleEl.textContent = `Explore matching 18K solid gold and certified diamond designs from our ${currentProduct.category} collection.`;
    }

    container.innerHTML = displayItems.map(product => {
      const isWishlisted = pageState.wishlist.some(w => w.id === product.id);
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

            <button class="catalog-add-bag-btn" data-similar-cart-id="${product.id}">
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

    // Attach listeners on similar cards
    container.querySelectorAll("[data-similar-cart-id]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-similar-cart-id");
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
  // Shopping Cart Engine
  // ----------------------------------------------------
  function addToCart(productId, size = "Standard", metal = "18K Rose Gold", qty = 1, openDrawer = true) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    const existingIndex = pageState.cart.findIndex(item => item.id === productId && item.size === size && item.metal === metal);
    if (existingIndex > -1) {
      pageState.cart[existingIndex].qty += qty;
    } else {
      pageState.cart.push({
        id: product.id,
        title: product.title,
        price: product.price,
        mrp: product.mrp,
        metal: metal || product.metal,
        image: product.image,
        size: size,
        qty: qty
      });
    }

    DB.saveCart(pageState.cart);
    updateCartUI();
    if (openDrawer) {
      if (window.innerWidth > 768) {
        openCartDrawer();
      }
      showToast(`Added "${product.title}" to your Shopping Bag! ✨`, "success");
    }
  }

  function updateCartUI() {
    const totalItems = pageState.cart.reduce((sum, item) => sum + item.qty, 0);
    if (cartBadge) cartBadge.textContent = totalItems;
    if (mobileNavCartCount) mobileNavCartCount.textContent = totalItems;

    const subtotal = pageState.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
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

    if (pageState.cart.length === 0) {
      cartItemsList.innerHTML = `
        <div style="text-align: center; padding: 4rem 1rem;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🛍️</div>
          <h4 style="font-family: var(--font-heading); font-size: 1.5rem; margin-bottom: 0.5rem;">Your Cart is Empty</h4>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.5rem;">Discover our latest solitaire & rose gold collections.</p>
          <a href="index.html#collection-section" class="btn-primary" style="font-size: 0.85rem; padding: 0.75rem 1.5rem; display: inline-block; text-decoration: none;">Explore Jewellery</a>
        </div>
      `;
      return;
    }

    cartItemsList.innerHTML = pageState.cart.map((item, index) => `
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
          pageState.cart[idx].qty += 1;
        } else if (action === "dec") {
          if (pageState.cart[idx].qty > 1) {
            pageState.cart[idx].qty -= 1;
          } else {
            pageState.cart.splice(idx, 1);
          }
        }
        DB.saveCart(pageState.cart);
        updateCartUI();
      });
    });

    cartItemsList.querySelectorAll("[data-remove-index]").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.getAttribute("data-remove-index"), 10);
        pageState.cart.splice(idx, 1);
        DB.saveCart(pageState.cart);
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

  if (openCartBtn) openCartBtn.addEventListener("click", openCartDrawer);
  if (closeCartBtn) closeCartBtn.addEventListener("click", closeCartDrawer);
  if (cartBackdrop) cartBackdrop.addEventListener("click", closeCartDrawer);

  // ----------------------------------------------------
  // Wishlist Logic
  // ----------------------------------------------------
  function toggleWishlist(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    const index = pageState.wishlist.findIndex(w => w.id === productId);
    if (index > -1) {
      pageState.wishlist.splice(index, 1);
      showToast(`Removed from Wishlist`, "info");
    } else {
      pageState.wishlist.push(product);
      showToast(`Saved to Wishlist ❤️`, "success");
    }

    DB.saveWishlist(pageState.wishlist);
    updateWishlistUI();
  }

  function updateWishlistUI() {
    if (wishlistBadge) {
      wishlistBadge.textContent = pageState.wishlist.length;
    }
    if (mobileNavWishlistCount) {
      mobileNavWishlistCount.textContent = pageState.wishlist.length;
    }

    if (wishlistBtn && currentProduct) {
      const isWish = pageState.wishlist.some(w => w.id === currentProduct.id);
      wishlistBtn.classList.toggle("active", isWish);
      const svg = wishlistBtn.querySelector("svg");
      if (svg) svg.setAttribute("fill", isWish ? "currentColor" : "none");
    }

    document.querySelectorAll("[data-wishlist-id]").forEach(btn => {
      const id = btn.getAttribute("data-wishlist-id");
      const isWish = pageState.wishlist.some(w => w.id === id);
      btn.classList.toggle("active", isWish);
      const svg = btn.querySelector("svg");
      if (svg) svg.setAttribute("fill", isWish ? "currentColor" : "none");
    });
  }

  if (wishlistBtn && currentProduct) {
    wishlistBtn.addEventListener("click", () => {
      toggleWishlist(currentProduct.id);
    });
  }

  // ----------------------------------------------------
  // Checkout Modal
  // ----------------------------------------------------
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      if (pageState.cart.length === 0) {
        showToast("Your cart is empty!", "info");
        return;
      }
      closeCartDrawer();
      openCheckoutModal();
    });
  }

  function openCheckoutModal() {
    if (!checkoutModal) return;
    const subtotal = pageState.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    if (checkoutItemsSummary) {
      checkoutItemsSummary.innerHTML = pageState.cart.map(item => `
        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.4rem;">
          <span>${item.qty}x ${item.title} (${item.size})</span>
          <span style="font-weight: 600;">${formatCurrency(item.price * item.qty)}</span>
        </div>
      `).join("");
    }

    if (checkoutTotalDisplay) {
      checkoutTotalDisplay.textContent = formatCurrency(subtotal);
    }

    checkoutModal.classList.add("open");
    document.body.style.overflow = "hidden";
    if (window.lenis) window.lenis.stop();
  }

  function closeCheckoutModal() {
    if (checkoutModal) {
      checkoutModal.classList.remove("open");
      document.body.style.overflow = "";
      if (window.lenis) window.lenis.start();
    }
  }

  if (closeCheckoutBtn) closeCheckoutBtn.addEventListener("click", closeCheckoutModal);
  if (checkoutModal) {
    checkoutModal.addEventListener("click", (e) => {
      if (e.target === checkoutModal) closeCheckoutModal();
    });
  }

  // Order submission
  if (checkoutForm) {
    checkoutForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const formData = new FormData(checkoutForm);
      const totalAmount = pageState.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

      const orderData = {
        customerName: formData.get("fullname"),
        phone: formData.get("phone"),
        email: formData.get("email"),
        address: `${formData.get("address")}, ${formData.get("city")} - ${formData.get("pincode")}`,
        paymentMethod: formData.get("paymentMethod"),
        items: [...pageState.cart],
        totalAmount: totalAmount
      };

      const createdOrder = DB.createOrder(orderData);

      // Clear cart
      pageState.cart = [];
      DB.saveCart([]);
      updateCartUI();

      closeCheckoutModal();

      // Show Order Success Modal
      const successModal = document.getElementById("order-success-modal");
      const successDetails = document.getElementById("order-success-details");
      if (successModal && successDetails) {
        successDetails.innerHTML = `
          <div style="font-size: 3.5rem; margin-bottom: 1rem;">👑</div>
          <h3 style="font-family: var(--font-heading); font-size: 2rem; color: var(--text-primary); margin-bottom: 0.5rem;">Order Confirmed!</h3>
          <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 1.5rem;">
            Thank you, <strong>${createdOrder.customerName}</strong>! Your jewellery piece has been reserved with order number:
          </p>
          <div style="background: var(--bg-cream); border: 1px dashed var(--border-rose); padding: 1rem; border-radius: 5px; font-weight: 700; font-size: 1.15rem; color: var(--rose-gold-dark); margin-bottom: 1.5rem;">
            ${createdOrder.orderId}
          </div>
          <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1.5rem;">
            Our Master Jeweller is preparing your BIS hallmarked box and IGI certificate folder. A tracking link will be sent to <strong>${createdOrder.email}</strong>.
          </p>
          <button class="btn-primary" onclick="window.location.href='index.html'" style="padding: 0.75rem 2rem; font-size: 0.9rem;">
            Return to Boutique
          </button>
        `;
        successModal.classList.add("open");
      }
    });
  }

  // ----------------------------------------------------
  // Live Search Input & Visual Camera Search
  // ----------------------------------------------------
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        const query = searchInput.value.trim();
        if (query) {
          window.location.href = `products.html?search=${encodeURIComponent(query)}`;
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

  // ----------------------------------------------------
  // Toast Notification Helper
  // ----------------------------------------------------
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
  // Initial Boot
  // ----------------------------------------------------
  populateProductDetails();
  renderSimilarProducts();
  updateCartUI();
  updateWishlistUI();
});
