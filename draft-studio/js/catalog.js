/*
 * DRAFT STUDIO — CONTENT CATALOG
 * ==============================
 * This is the only file you need to edit to add, change or remove content.
 *
 * HOW TO ADD A DESIGN
 *   1. Upload the design file(s) to the right folder:
 *        files/templates/   ← PSD, AI, PDF, SVG templates
 *        files/logos/       ← logo files
 *        files/icons/       ← SVG icons
 *   2. (Templates & logos) Upload a preview image (JPG/PNG/WEBP) to previews/.
 *      PSD and AI files can't be shown in a browser, so they need a preview.
 *      If an item has an SVG file and no preview, the SVG is used as the preview.
 *   3. Copy an entry below, paste it at the TOP of its list and fill it in.
 *
 * FIELDS
 *   id          unique, lowercase, no spaces (used in share links)
 *   title       name shown on the card
 *   category    used for the category filter (any text, e.g. "Flyers")
 *   description short sentence shown in the detail view
 *   tags        search words
 *   preview     path to preview image (optional if the item has an SVG file)
 *   files       one entry per downloadable format:
 *                 { format: "PSD", path: "files/templates/name.psd", size: "24 MB" }
 *               format can be PSD, AI, PDF, SVG, EPS, PNG, ZIP… (size is optional)
 *   date        YYYY-MM-DD (newest items are shown first)
 *   featured    true = show on the home page
 *
 * Icons only need: id, name, category, tags, file.
 */

window.DRAFT_STUDIO = {
  site: {
    name: "Draft Studio",
    tagline: "Free design templates, icons and logos",
    email: "hello@draftstudio.com",           // ← replace with your details
    whatsapp: "",                              // e.g. "27780000000" (leave empty to hide)
    instagram: "",                             // e.g. "https://instagram.com/draftstudio"
    license:
      "Free for personal and commercial projects. Credit is appreciated but not required. " +
      "You may not resell or redistribute the files as-is."
  },

  templates: [
    {
      id: "event-flyer",
      title: "Live Music Event Flyer",
      category: "Flyers",
      description: "A4 portrait flyer for concerts, parties and live events. Edit the date, venue and call to action.",
      tags: ["event", "poster", "music", "a4", "party"],
      files: [
        { format: "SVG", path: "files/templates/event-flyer.svg" }
      ],
      date: "2026-09-25",
      featured: true
    },
    {
      id: "social-post-sale",
      title: "Weekend Sale Social Post",
      category: "Social Media",
      description: "1080×1080 Instagram/Facebook post for sales and promotions.",
      tags: ["instagram", "facebook", "sale", "promo", "square"],
      files: [
        { format: "SVG", path: "files/templates/social-post-sale.svg" }
      ],
      date: "2026-09-22",
      featured: true
    },
    {
      id: "business-card-minimal",
      title: "Minimal Business Card",
      category: "Business Cards",
      description: "Clean two-column business card at 3.5×2 in with a bold brand panel.",
      tags: ["business card", "stationery", "print", "minimal"],
      files: [
        { format: "SVG", path: "files/templates/business-card-minimal.svg" }
      ],
      date: "2026-09-20",
      featured: true
    }
    /* Example of a template with several formats (copy, then remove the comment marks):
    ,{
      id: "restaurant-menu",
      title: "Restaurant Menu",
      category: "Menus",
      description: "Two-page A4 menu with editable prices.",
      tags: ["menu", "food", "restaurant"],
      preview: "previews/restaurant-menu.jpg",
      files: [
        { format: "PSD", path: "files/templates/restaurant-menu.psd", size: "38 MB" },
        { format: "AI",  path: "files/templates/restaurant-menu.ai",  size: "12 MB" },
        { format: "PDF", path: "files/templates/restaurant-menu.pdf", size: "4 MB" }
      ],
      date: "2026-10-01",
      featured: false
    }
    */
  ],

  logos: [
    {
      id: "summit-coffee",
      title: "Summit Coffee Co.",
      category: "Food & Drink",
      description: "Badge-style mountain logo for cafés and coffee brands.",
      tags: ["coffee", "cafe", "mountain", "badge"],
      files: [{ format: "SVG", path: "files/logos/summit-coffee.svg" }],
      date: "2026-09-24",
      featured: true
    },
    {
      id: "nova-tech",
      title: "Nova Tech",
      category: "Technology",
      description: "Geometric hexagon mark for tech startups and IT companies.",
      tags: ["tech", "startup", "hexagon", "it"],
      files: [{ format: "SVG", path: "files/logos/nova-tech.svg" }],
      date: "2026-09-21"
    },
    {
      id: "bloom-florist",
      title: "Bloom Florist",
      category: "Beauty & Lifestyle",
      description: "Elegant flower logo for florists, salons and boutiques.",
      tags: ["flower", "florist", "feminine", "boutique"],
      files: [{ format: "SVG", path: "files/logos/bloom-florist.svg" }],
      date: "2026-09-19"
    }
  ],

  icons: [
    { id: "home",     name: "Home",     category: "Interface",     tags: ["house", "main"],            file: "files/icons/home.svg" },
    { id: "search",   name: "Search",   category: "Interface",     tags: ["find", "magnifier"],        file: "files/icons/search.svg" },
    { id: "settings", name: "Settings", category: "Interface",     tags: ["gear", "cog", "options"],   file: "files/icons/settings.svg" },
    { id: "bell",     name: "Bell",     category: "Interface",     tags: ["notification", "alert"],    file: "files/icons/bell.svg" },
    { id: "download", name: "Download", category: "Interface",     tags: ["save", "arrow"],            file: "files/icons/download.svg" },
    { id: "upload",   name: "Upload",   category: "Interface",     tags: ["send", "arrow"],            file: "files/icons/upload.svg" },
    { id: "share",    name: "Share",    category: "Interface",     tags: ["network", "send"],          file: "files/icons/share.svg" },
    { id: "heart",    name: "Heart",    category: "Social",        tags: ["love", "like", "favourite"], file: "files/icons/heart.svg" },
    { id: "star",     name: "Star",     category: "Social",        tags: ["rating", "favourite"],      file: "files/icons/star.svg" },
    { id: "user",     name: "User",     category: "Social",        tags: ["profile", "account", "person"], file: "files/icons/user.svg" },
    { id: "mail",     name: "Mail",     category: "Communication", tags: ["email", "envelope"],        file: "files/icons/mail.svg" },
    { id: "phone",    name: "Phone",    category: "Communication", tags: ["call", "contact"],          file: "files/icons/phone.svg" },
    { id: "map-pin",  name: "Map Pin",  category: "Communication", tags: ["location", "address"],      file: "files/icons/map-pin.svg" },
    { id: "calendar", name: "Calendar", category: "Communication", tags: ["date", "event", "schedule"], file: "files/icons/calendar.svg" },
    { id: "cart",     name: "Cart",     category: "Commerce",      tags: ["shop", "basket", "buy"],    file: "files/icons/cart.svg" },
    { id: "camera",   name: "Camera",   category: "Media",         tags: ["photo", "picture"],         file: "files/icons/camera.svg" },
    { id: "image",    name: "Image",    category: "Media",         tags: ["photo", "picture", "gallery"], file: "files/icons/image.svg" },
    { id: "pen-tool", name: "Pen Tool", category: "Design",        tags: ["vector", "bezier", "draw"], file: "files/icons/pen-tool.svg" },
    { id: "layers",   name: "Layers",   category: "Design",        tags: ["stack", "arrange"],         file: "files/icons/layers.svg" },
    { id: "palette",  name: "Palette",  category: "Design",        tags: ["colour", "color", "paint"], file: "files/icons/palette.svg" }
  ]
};
