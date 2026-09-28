/**
 * Tooba Jewellers - Admin Panel Engine
 * Product Catalog CRUD, Live Image Preview, Base64 File Upload, Orders Tracking, and Metrics
 */

document.addEventListener("DOMContentLoaded", () => {
  // Navigation tabs
  const navItems = document.querySelectorAll(".menu-item[data-tab]");
  const tabContents = document.querySelectorAll(".tab-content");

  // Metrics DOM
  const metricRevenue = document.getElementById("metric-revenue");
  const metricProducts = document.getElementById("metric-products");
  const metricOrders = document.getElementById("metric-orders");
  const metricLowStock = document.getElementById("metric-low-stock");

  // Product Form DOM
  const productForm = document.getElementById("add-product-form");
  const formImageInput = document.getElementById("form-image-url");
  const formFileInput = document.getElementById("form-image-file");
  const formTitleInput = document.getElementById("form-title");
  const formCategoryInput = document.getElementById("form-category");
  const formPriceInput = document.getElementById("form-price");
  const formMrpInput = document.getElementById("form-mrp");
  const formMetalInput = document.getElementById("form-metal");
  const formCaratInput = document.getElementById("form-carat");
  const formTagInput = document.getElementById("form-tag");

  // Live Preview DOM
  const previewImage = document.getElementById("preview-card-img");
  const previewTitle = document.getElementById("preview-card-title");
  const previewMetal = document.getElementById("preview-card-metal");
  const previewPrice = document.getElementById("preview-card-price");
  const previewMrp = document.getElementById("preview-card-mrp");
  const previewTag = document.getElementById("preview-card-tag");

  // Tables
  const productsTableBody = document.getElementById("products-table-body");
  const ordersTableBody = document.getElementById("orders-table-body");
  const searchProductInput = document.getElementById("admin-search-products");
  const resetDemoBtn = document.getElementById("btn-reset-demo");

  let currentImageData = "assets/images/solitaire-ring.jpg";

  // ----------------------------------------------------
  // Tab Switching
  // ----------------------------------------------------
  navItems.forEach(item => {
    item.addEventListener("click", () => {
      const targetTab = item.getAttribute("data-tab");
      navItems.forEach(i => i.classList.remove("active"));
      tabContents.forEach(c => c.classList.remove("active"));

      item.classList.add("active");
      const targetContent = document.getElementById(`tab-${targetTab}`);
      if (targetContent) targetContent.classList.add("active");
    });
  });

  // ----------------------------------------------------
  // Refresh Metrics
  // ----------------------------------------------------
  function refreshMetrics() {
    const products = DB.getProducts();
    const orders = DB.getOrders();

    const totalRevenue = orders.reduce((sum, ord) => sum + (ord.totalAmount || 0), 0);
    const lowStockCount = products.filter(p => (p.stock || 0) <= 5).length;

    if (metricRevenue) metricRevenue.textContent = formatCurrency(totalRevenue);
    if (metricProducts) metricProducts.textContent = products.length;
    if (metricOrders) metricOrders.textContent = orders.length;
    if (metricLowStock) metricLowStock.textContent = lowStockCount;
  }

  // ----------------------------------------------------
  // Live Preview Handlers for New Product
  // ----------------------------------------------------
  function updateLivePreview() {
    if (previewTitle) previewTitle.textContent = formTitleInput.value.trim() || "Sample Solitaire Ring";
    if (previewMetal) previewMetal.textContent = `${formMetalInput.value} • ${formCaratInput.value || '0.75 Ct'}`;
    if (previewPrice) previewPrice.textContent = formatCurrency(formPriceInput.value || 45000);
    if (previewMrp) previewMrp.textContent = formMrpInput.value ? formatCurrency(formMrpInput.value) : "";
    if (previewTag) {
      previewTag.textContent = formTagInput.value.trim() || "New Arrival";
      previewTag.style.display = formTagInput.value.trim() ? "inline-block" : "none";
    }
    if (previewImage) {
      previewImage.src = currentImageData;
    }
  }

  [formTitleInput, formCategoryInput, formPriceInput, formMrpInput, formMetalInput, formCaratInput, formTagInput].forEach(inp => {
    if (inp) inp.addEventListener("input", updateLivePreview);
  });

  // Image URL Input
  if (formImageInput) {
    formImageInput.addEventListener("input", () => {
      if (formImageInput.value.trim()) {
        currentImageData = formImageInput.value.trim();
        updateLivePreview();
      }
    });
  }

  // Image Local File Picker (converts to Base64)
  if (formFileInput) {
    formFileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(evt) {
          currentImageData = evt.target.result;
          if (formImageInput) formImageInput.value = "";
          updateLivePreview();
          showAdminToast("Image loaded from local computer successfully! 📸", "success");
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // ----------------------------------------------------
  // Add Product Form Submission
  // ----------------------------------------------------
  if (productForm) {
    productForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const newProduct = {
        title: formTitleInput.value.trim(),
        category: formCategoryInput.value,
        price: parseFloat(formPriceInput.value),
        mrp: formMrpInput.value ? parseFloat(formMrpInput.value) : parseFloat(formPriceInput.value) * 1.15,
        metal: formMetalInput.value,
        diamondCarat: formCaratInput.value.trim() || "Natural Certified",
        diamondClarity: document.getElementById("form-clarity").value.trim() || "VVS-VS / EF Color",
        stock: parseInt(document.getElementById("form-stock").value, 10) || 10,
        tag: formTagInput.value.trim() || "New Arrival",
        description: document.getElementById("form-description").value.trim() || "Handcrafted by master artisans at Tooba Jewellers.",
        image: currentImageData,
        isFeatured: document.getElementById("form-featured").checked
      };

      DB.addProduct(newProduct);
      showAdminToast(`Product "${newProduct.title}" added to store! 💎`, "success");

      // Reset Form
      productForm.reset();
      currentImageData = "assets/images/solitaire-ring.jpg";
      updateLivePreview();

      // Refresh Tables & Stats
      refreshMetrics();
      renderProductsTable();

      // Switch to Products Tab
      const prodTab = document.querySelector('.menu-item[data-tab="products"]');
      if (prodTab) prodTab.click();
    });
  }

  // ----------------------------------------------------
  // Render Products Management Table
  // ----------------------------------------------------
  function renderProductsTable() {
    if (!productsTableBody) return;

    let products = DB.getProducts();
    const query = searchProductInput ? searchProductInput.value.toLowerCase().trim() : "";

    if (query) {
      products = products.filter(p => 
        p.title.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.metal.toLowerCase().includes(query)
      );
    }

    if (products.length === 0) {
      productsTableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 2rem; color: var(--admin-text-muted);">
            No products found matching your search.
          </td>
        </tr>
      `;
      return;
    }

    productsTableBody.innerHTML = products.map(prod => `
      <tr>
        <td>
          <img src="${prod.image}" alt="${prod.title}" class="table-product-thumb" />
        </td>
        <td>
          <strong style="color: var(--admin-text-dark);">${prod.title}</strong>
          <div style="font-size: 0.75rem; color: var(--admin-text-muted);">${prod.metal} • ${prod.diamondCarat || ''}</div>
        </td>
        <td><span class="status-badge" style="background: #F1F5F9; color: #475569;">${prod.category}</span></td>
        <td>
          <strong style="color: var(--admin-text-dark);">${formatCurrency(prod.price)}</strong>
          ${prod.mrp ? `<div style="font-size: 0.75rem; text-decoration: line-through; color: var(--admin-text-muted);">${formatCurrency(prod.mrp)}</div>` : ''}
        </td>
        <td>
          <span class="status-badge ${prod.stock > 5 ? 'in-stock' : 'low-stock'}">
            ${prod.stock > 0 ? `${prod.stock} in stock` : 'Out of Stock'}
          </span>
        </td>
        <td>
          ${prod.tag ? `<span class="status-badge" style="background: #FEF3C7; color: #B45309;">${prod.tag}</span>` : '—'}
        </td>
        <td>
          <div class="table-actions">
            <button class="btn-icon-action delete" data-delete-id="${prod.id}" title="Delete Product">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </td>
      </tr>
    `).join("");

    // Attach delete listeners
    document.querySelectorAll("[data-delete-id]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-delete-id");
        if (confirm("Are you sure you want to remove this piece from the catalog?")) {
          DB.deleteProduct(id);
          showAdminToast("Product deleted from store", "info");
          refreshMetrics();
          renderProductsTable();
        }
      });
    });
  }

  if (searchProductInput) {
    searchProductInput.addEventListener("input", renderProductsTable);
  }

  // ----------------------------------------------------
  // Render Customer Orders Table
  // ----------------------------------------------------
  function renderOrdersTable() {
    if (!ordersTableBody) return;

    const orders = DB.getOrders();

    if (orders.length === 0) {
      ordersTableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 2.5rem; color: var(--admin-text-muted);">
            No customer orders placed yet. Orders made on the storefront will appear here instantly!
          </td>
        </tr>
      `;
      return;
    }

    ordersTableBody.innerHTML = orders.map((order, index) => {
      const itemsText = order.items.map(i => `${i.qty}x ${i.title} (${i.size})`).join(", ");
      const statusClass = (order.status || "Processing").toLowerCase();

      return `
        <tr>
          <td><strong style="color: var(--admin-primary-dark);">${order.orderId}</strong></td>
          <td>
            <strong>${order.customerName}</strong>
            <div style="font-size: 0.75rem; color: var(--admin-text-muted);">${order.phone}</div>
          </td>
          <td style="max-width: 240px; font-size: 0.8rem; color: var(--admin-text-dark);">${itemsText}</td>
          <td><strong>${formatCurrency(order.totalAmount)}</strong></td>
          <td><span style="font-size: 0.78rem; color: var(--admin-text-muted);">${order.date}</span></td>
          <td>
            <select class="order-status-select" data-order-idx="${index}" style="padding: 0.35rem 0.6rem; border-radius: 6px; font-size: 0.78rem; font-weight: 600; border: 1px solid var(--admin-border);">
              <option value="Processing" ${order.status === 'Processing' ? 'selected' : ''}>⏳ Processing</option>
              <option value="Shipped" ${order.status === 'Shipped' ? 'selected' : ''}>🚚 Shipped</option>
              <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>✅ Delivered</option>
            </select>
          </td>
          <td>
            <span class="status-badge ${statusClass}">${order.status || 'Processing'}</span>
          </td>
        </tr>
      `;
    }).join("");

    // Status change listener
    document.querySelectorAll(".order-status-select").forEach(sel => {
      sel.addEventListener("change", (e) => {
        const idx = parseInt(sel.getAttribute("data-order-idx"), 10);
        const orders = DB.getOrders();
        orders[idx].status = e.target.value;
        DB.saveOrders(orders);
        showAdminToast(`Order ${orders[idx].orderId} updated to ${e.target.value}!`, "success");
        renderOrdersTable();
      });
    });
  }

  // ----------------------------------------------------
  // Reset Demo Catalog
  // ----------------------------------------------------
  if (resetDemoBtn) {
    resetDemoBtn.addEventListener("click", () => {
      if (confirm("Reset the entire jewellery catalog to factory sample items? Any custom products will be restored to defaults.")) {
        DB.resetDefaults();
        refreshMetrics();
        renderProductsTable();
        showAdminToast("Catalogue reset to default luxury demo collection!", "info");
      }
    });
  }

  // Admin Toast Notifications
  function showAdminToast(msg, type = "info") {
    let box = document.getElementById("admin-toast-box");
    if (!box) {
      box = document.createElement("div");
      box.id = "admin-toast-box";
      box.style.position = "fixed";
      box.style.bottom = "20px";
      box.style.right = "20px";
      box.style.zIndex = "999";
      box.style.display = "flex";
      box.style.flexDirection = "column";
      box.style.gap = "8px";
      document.body.appendChild(box);
    }

    const toast = document.createElement("div");
    toast.style.background = "#1E293B";
    toast.style.color = "#FFFFFF";
    toast.style.padding = "10px 18px";
    toast.style.borderRadius = "8px";
    toast.style.fontSize = "13px";
    toast.style.fontWeight = "500";
    toast.style.boxShadow = "0 6px 20px rgba(0,0,0,0.15)";
    toast.style.borderLeft = type === "success" ? "4px solid #10B981" : "4px solid #C58963";
    toast.textContent = msg;

    box.appendChild(toast);
    setTimeout(() => toast.remove(), 3200);
  }

  // Initialize
  refreshMetrics();
  updateLivePreview();
  renderProductsTable();
  renderOrdersTable();
});
