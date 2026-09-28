/**
 * Tooba Jewellers - Initial Seed Product Data & Database Handlers
 * Fine Diamonds & Luxury Jewellery Catalog
 */

const DEFAULT_PRODUCTS = [
  {
    id: "tj-101",
    title: "Aura Rose Solitaire Diamond Ring",
    category: "Rings",
    price: 42500,
    mrp: 49999,
    metal: "18K Rose Gold",
    diamondCarat: "0.75 Ct",
    diamondClarity: "VVS-VS / EF Color",
    stock: 8,
    tag: "Bestseller",
    rating: 4.9,
    reviewsCount: 42,
    image: "assets/images/solitaire-ring.jpg",
    description: "Crafted in 18K lustrous rose gold, the Aura Solitaire features a breathtaking hand-selected 0.75 Ct brilliant round solitaire diamond held in a classic 6-prong crown. Hallmarked BIS 916 with an authentic IGI diamond certificate.",
    isFeatured: true
  },
  {
    id: "tj-102",
    title: "Celeste Diamond Tennis Bracelet",
    category: "Bracelets",
    price: 89000,
    mrp: 105000,
    metal: "18K Rose Gold",
    diamondCarat: "2.10 Ct",
    diamondClarity: "VS-SI / GH Color",
    stock: 5,
    tag: "Trending",
    rating: 4.9,
    reviewsCount: 28,
    image: "assets/images/tennis-bracelet.jpg",
    description: "An iconic luxury staple, the Celeste Tennis Bracelet features continuous bezel-set round cut brilliant diamonds linked seamlessly in flexible 18K rose gold for everyday sophistication and red-carpet glam.",
    isFeatured: true
  },
  {
    id: "tj-103",
    title: "Seraphina Cascading Diamond Choker",
    category: "Necklaces",
    price: 145000,
    mrp: 172000,
    metal: "18K Rose & White Gold",
    diamondCarat: "3.50 Ct",
    diamondClarity: "VVS / E-F Color",
    stock: 3,
    tag: "Bridal Pick",
    rating: 5.0,
    reviewsCount: 19,
    image: "assets/images/editorial-model.jpg",
    description: "A show-stopping bridal masterpiece featuring delicate cascading diamond drops accented with lustrous pearls and dual-tone 18K rose and white gold. An heirloom created for life's most precious celebrations.",
    isFeatured: true
  },
  {
    id: "tj-104",
    title: "Lumina Solitaire Drop Pendant",
    category: "Necklaces",
    price: 28900,
    mrp: 34000,
    metal: "18K Yellow Gold",
    diamondCarat: "0.50 Ct",
    diamondClarity: "VVS-VS / FG Color",
    stock: 12,
    tag: "Daily Luxury",
    rating: 4.8,
    reviewsCount: 35,
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop",
    description: "Timeless simplicity defined. A 0.50 Ct brilliant solitaire suspended in a delicate 18K gold bail, accompanied by an adjustable Italian box chain.",
    isFeatured: true
  },
  {
    id: "tj-105",
    title: "Elysian Bloom Diamond Floral Studs",
    category: "Earrings",
    price: 32000,
    mrp: 38500,
    metal: "18K Rose Gold",
    diamondCarat: "0.60 Ct",
    diamondClarity: "VS-SI / GH Color",
    stock: 14,
    tag: "New Arrival",
    rating: 4.9,
    reviewsCount: 51,
    image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=800&auto=format&fit=crop",
    description: "Inspired by morning dew on flower petals, the Elysian Bloom studs feature six round diamonds clustered around a center solitaire with secure screw-back clasps.",
    isFeatured: false
  },
  {
    id: "tj-106",
    title: "Noor Heritage Polki & Emerald Choker",
    category: "Necklaces",
    price: 210000,
    mrp: 245000,
    metal: "22K Yellow Gold",
    diamondCarat: "4.20 Ct Polki",
    diamondClarity: "Natural Uncut Diamonds",
    stock: 2,
    tag: "Royal Heritage",
    rating: 5.0,
    reviewsCount: 14,
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800&auto=format&fit=crop",
    description: "Regal Indian wedding choker set in 22K yellow gold with open-cut Polki diamonds, hand-carved Zambian emerald drops, and intricate meenakari enamel work on the reverse.",
    isFeatured: true
  },
  {
    id: "tj-107",
    title: "Infinity Petite Micro-Pave Diamond Band",
    category: "Rings",
    price: 19800,
    mrp: 23500,
    metal: "18K Rose Gold",
    diamondCarat: "0.35 Ct",
    diamondClarity: "VVS / GH Color",
    stock: 16,
    tag: "Bestseller",
    rating: 4.8,
    reviewsCount: 63,
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop",
    description: "Delicate and stackable, this eternity-style curved band sparkles with micro-pave hand-set diamonds. Ideal for anniversary stacking or modern everyday elegance.",
    isFeatured: false
  },
  {
    id: "tj-108",
    title: "Starlight Chandelier Drop Earrings",
    category: "Earrings",
    price: 64000,
    mrp: 76000,
    metal: "18K White Gold",
    diamondCarat: "1.80 Ct",
    diamondClarity: "VS / F-G Color",
    stock: 6,
    tag: "Trending",
    rating: 4.9,
    reviewsCount: 22,
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop",
    description: "Dazzling chandelier earrings with articulating diamond links that catch the light with every movement. Designed for gala evenings and bridal receptions.",
    isFeatured: true
  },
  {
    id: "tj-109",
    title: "Zephyr Diamond Open Contour Bangle",
    category: "Bracelets",
    price: 56000,
    mrp: 65000,
    metal: "18K Rose Gold",
    diamondCarat: "1.20 Ct",
    diamondClarity: "VVS-VS / EF Color",
    stock: 7,
    tag: "New Arrival",
    rating: 4.7,
    reviewsCount: 18,
    image: "https://images.unsplash.com/photo-1611591475810-7e446ef4709d?q=80&w=800&auto=format&fit=crop",
    description: "Contemporary open cuff silhouette with tapered baguette and round diamonds at both tips. Effortless snap-on comfort for the modern connoisseur.",
    isFeatured: false
  },
  {
    id: "tj-110",
    title: "Aamira Diamond Modern Mangalsutra",
    category: "Mangalsutra",
    price: 48500,
    mrp: 55000,
    metal: "18K Yellow Gold",
    diamondCarat: "0.45 Ct",
    diamondClarity: "VVS / GH Color",
    stock: 9,
    tag: "Modern Bride",
    rating: 4.9,
    reviewsCount: 39,
    image: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=800&auto=format&fit=crop",
    description: "A chic reimagining of sacred tradition. Minimalist black beads paired with a brilliant cluster pendant that seamlessly transitions from office wear to evening dinners.",
    isFeatured: true
  },
  {
    id: "tj-111",
    title: "Riviera Oval Cut Halo Diamond Ring",
    category: "Rings",
    price: 58000,
    mrp: 69000,
    metal: "Platinum 950",
    diamondCarat: "1.00 Ct",
    diamondClarity: "VVS1 / D Color",
    stock: 4,
    tag: "Signature",
    rating: 5.0,
    reviewsCount: 47,
    image: "https://images.unsplash.com/photo-1603561596112-0a132b757442?q=80&w=800&auto=format&fit=crop",
    description: "Certified Platinum 950 ring with an elongated oval brilliant solitaire encircled by a hidden micro-halo for maximum fire, brilliance, and finger coverage.",
    isFeatured: true
  },
  {
    id: "tj-112",
    title: "Bella Diamond Huggie Hoops",
    category: "Earrings",
    price: 22500,
    mrp: 26000,
    metal: "18K Rose Gold",
    diamondCarat: "0.40 Ct",
    diamondClarity: "VS / GH Color",
    stock: 15,
    tag: "Daily Wear",
    rating: 4.8,
    reviewsCount: 54,
    image: "https://images.unsplash.com/photo-1635767798638-3e25273a8236?q=80&w=800&auto=format&fit=crop",
    description: "Snug, secure, and supremely comfortable to sleep in. Channel-set natural diamonds that deliver understated sparkle with every glance.",
    isFeatured: false
  },
  {
    id: "tj-113",
    title: "24K 999 Purity Laxmi Gold Coin (5g)",
    category: "Coins",
    price: 38500,
    mrp: 41000,
    metal: "24K Yellow Gold (999)",
    diamondCarat: "N/A",
    diamondClarity: "Pure 999 Investment Grade",
    stock: 20,
    tag: "Investment Gold",
    rating: 5.0,
    reviewsCount: 88,
    image: "https://images.unsplash.com/photo-1610375461246-83df859d849d?q=80&w=800&auto=format&fit=crop",
    description: "Certified 24 Karat 999.9 Purity Swiss-minted Gold Coin embossed with Goddess Laxmi for prosperity and auspicious gifting. Comes in tamper-proof certicard packaging with BIS Hallmark.",
    isFeatured: true
  },
  {
    id: "tj-114",
    title: "Little Stars 18K Gold Nazariya Diamond Bracelet",
    category: "Kids",
    price: 16800,
    mrp: 19500,
    metal: "18K Yellow Gold",
    diamondCarat: "0.15 Ct",
    diamondClarity: "VS / GH Color",
    stock: 11,
    tag: "Kids Special",
    rating: 4.9,
    reviewsCount: 31,
    image: "https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?q=80&w=800&auto=format&fit=crop",
    description: "Handcrafted protective Nazariya bracelet for children featuring auspicious black beads, smooth child-safe rounded edges, and an adorable sparkling diamond star charm in 18K hallmarked gold.",
    isFeatured: true
  }
];

const STORAGE_KEYS = {
  PRODUCTS: "tooba_jewellers_products_v2",
  CART: "tooba_jewellers_cart_v1",
  WISHLIST: "tooba_jewellers_wishlist_v1",
  ORDERS: "tooba_jewellers_orders_v1",
};

// Database Service for Tooba Jewellers
const DB = {
  getProducts: function() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (!data) {
        const oldData = localStorage.getItem("tooba_jewellers_products_v1");
        if (oldData) {
          try {
            const oldList = JSON.parse(oldData);
            const defaultIds = new Set(DEFAULT_PRODUCTS.map(p => p.id));
            const userCustom = oldList.filter(p => !defaultIds.has(p.id));
            const merged = [...DEFAULT_PRODUCTS, ...userCustom];
            this.saveProducts(merged);
            return merged;
          } catch(e) {}
        }
        this.saveProducts(DEFAULT_PRODUCTS);
        return DEFAULT_PRODUCTS;
      }
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_PRODUCTS;
    } catch (e) {
      console.warn("Storage error, returning defaults:", e);
      return DEFAULT_PRODUCTS;
    }
  },

  saveProducts: function(products) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },

  addProduct: function(product) {
    const products = this.getProducts();
    const newProduct = {
      ...product,
      id: "tj-" + Date.now(),
      rating: 5.0,
      reviewsCount: 1,
      createdAt: new Date().toISOString()
    };
    products.unshift(newProduct);
    this.saveProducts(products);
    return newProduct;
  },

  updateProduct: function(id, updatedFields) {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      products[index] = { ...products[index], ...updatedFields };
      this.saveProducts(products);
      return products[index];
    }
    return null;
  },

  deleteProduct: function(id) {
    let products = this.getProducts();
    products = products.filter(p => p.id !== id);
    this.saveProducts(products);
    return true;
  },

  resetDefaults: function() {
    this.saveProducts(DEFAULT_PRODUCTS);
    return DEFAULT_PRODUCTS;
  },

  // Cart Management
  getCart: function() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CART);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveCart: function(cart) {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  },

  // Wishlist Management
  getWishlist: function() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WISHLIST);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveWishlist: function(wishlist) {
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist));
  },

  // Orders Management
  getOrders: function() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (!data) {
        const sampleOrders = [
          {
            orderId: "TJ-ORD-9801",
            customerName: "Ayesha Siddiqui",
            phone: "+91 98201 44521",
            email: "ayesha.s@example.com",
            address: "402, Royal Palms, Bandra West, Mumbai, 400050",
            items: [
              { title: "Aura Rose Solitaire Diamond Ring", qty: 1, price: 42500, size: "12" }
            ],
            totalAmount: 42500,
            status: "Delivered",
            paymentMethod: "Prepaid UPI",
            date: "2026-09-22 11:30 AM"
          },
          {
            orderId: "TJ-ORD-9802",
            customerName: "Meera Kapoor",
            phone: "+91 98110 99872",
            email: "meera.kapoor@example.com",
            address: "B-14, Defence Colony, New Delhi, 110024",
            items: [
              { title: "Celeste Diamond Tennis Bracelet", qty: 1, price: 89000, size: "Standard 7 inch" },
              { title: "Bella Diamond Huggie Hoops", qty: 1, price: 22500, size: "Standard" }
            ],
            totalAmount: 111500,
            status: "Shipped",
            paymentMethod: "Credit Card (EMI)",
            date: "2026-09-23 04:15 PM"
          }
        ];
        this.saveOrders(sampleOrders);
        return sampleOrders;
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveOrders: function(orders) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  },

  createOrder: function(orderData) {
    const orders = this.getOrders();
    const newOrder = {
      ...orderData,
      orderId: "TJ-ORD-" + Math.floor(1000 + Math.random() * 9000),
      date: new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
      status: "Processing"
    };
    orders.unshift(newOrder);
    this.saveOrders(orders);
    return newOrder;
  }
};

// Currency Formatter Utility
function formatCurrency(amount) {
  return "₹" + Number(amount).toLocaleString("en-IN");
}
