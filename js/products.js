/**
 * ═══════════════════════════════════════════════════════════════════
 *  CUT & CURATED KEEPSAKES — Product Catalog
 * ═══════════════════════════════════════════════════════════════════
 *
 * HOW TO ADD A NEW PRODUCT:
 *   1. Go to stripe.com → Dashboard → Products → "+ Add product"
 *   2. Fill in name, description, price (one-time)
 *   3. After saving, click the price → copy the "API ID" (looks like price_1AbCd...)
 *   4. Copy an existing product block below, paste at the end of the array
 *   5. Replace priceId with your new price_xxxx
 *   6. Add your product photo to /images/products/
 *   7. Save + push to Git → Netlify redeploys automatically
 *
 * HOW TO REMOVE A PRODUCT:
 *   1. Delete (or comment out) its block from the array below
 *   2. In Stripe Dashboard, archive the price so it can't be purchased
 *
 * HOW TO CHANGE A PRICE:
 *   In Stripe, you cannot edit an existing price — create a new one,
 *   copy its new price_xxxx, and update priceId here.
 * ═══════════════════════════════════════════════════════════════════
 */

const PRODUCTS = [

  // ─── RESIN KEEPSAKES ───────────────────────────────────────────
  {
    id: 'birth-stat-plaque',
    name: 'Baby Birth-Stat Plaque',
    priceId: 'price_REPLACE_BIRTH_STAT_PLAQUE',       // ← Your Stripe Price ID
    price: 5500,                                        // in cents ($55.00)
    displayPrice: '$55.00',
    category: 'resin',
    categoryLabel: 'Resin Keepsakes',
    shortDescription: 'A hand-poured resin plaque capturing every precious detail of baby\'s arrival — their name, stats, and a moment you\'ll treasure forever.',
    description: `Welcome your little one with something as beautiful as they are. Each Birth-Stat Plaque is individually hand-poured in resin and set with shimmering accents that catch the light just right.

Personalize it with baby's name, birth date and time, weight, length, and your names as parents. No two are ever exactly alike — just like your baby.

✦ Approximately 5" × 7" (custom sizes available — just ask!)
✦ High-gloss, durable resin finish
✦ Soft pastel or neutral color options
✦ Gift-wrapped with tissue paper and ribbon
✦ Please allow 5–7 business days for creation`,
    image: 'images/products/birth-stat-plaque.jpg',
    imageAlt: 'Custom baby birth stat resin plaque with name, date, weight and length in soft blush and gold',
    processingTime: '5–7 business days',
    featured: true,
    hasPersonalization: true,
    personalizationFields: [
      { key: 'baby_name',     label: "Baby's Name",              placeholder: 'e.g., Sophia Grace',                          required: true  },
      { key: 'birth_details', label: 'Birth Date, Time & Stats', placeholder: 'e.g., June 15 2024 • 3:42 AM • 7lb 4oz • 20in', required: true  },
      { key: 'parent_names',  label: "Parent Name(s)",           placeholder: 'e.g., Mama & Dada — or leave blank',          required: false },
    ],
  },

  {
    id: 'memorial-piece',
    name: 'Memorial Resin Keepsake',
    priceId: 'price_REPLACE_MEMORIAL_PIECE',           // ← Your Stripe Price ID
    price: 6500,
    displayPrice: '$65.00',
    category: 'resin',
    categoryLabel: 'Resin Keepsakes',
    shortDescription: 'A tender, lasting tribute — hand-poured with love and infused with meaningful details to honor someone irreplaceable.',
    description: `Some memories deserve to be held forever. Our Memorial Resin Keepsakes are crafted with deep care, and can be made to incorporate a name, date, a meaningful symbol, or even dried florals from a funeral arrangement.

Reach out through our Custom Orders page if you'd like to include special items — we handle every piece with gentleness and respect.

✦ Approximately 4" × 6" or round 5" disc (your choice)
✦ Soft, muted color palette — cream, sage, or soft purple
✦ Optional gold foil lettering
✦ Gift-wrapped with care
✦ Please allow 7–10 business days`,
    image: 'images/products/memorial-piece.jpg',
    imageAlt: 'Handmade memorial resin keepsake with name and dates in soft cream and gold',
    processingTime: '7–10 business days',
    featured: false,
    hasPersonalization: true,
    personalizationFields: [
      { key: 'honoree_name', label: 'Name to Honor',     placeholder: 'e.g., Margaret Rose',             required: true  },
      { key: 'dates',        label: 'Dates (optional)',  placeholder: 'e.g., 1942 – 2023',               required: false },
      { key: 'color_notes',  label: 'Color Preference',  placeholder: 'e.g., soft purple, cream, or sage', required: false },
    ],
  },

  // ─── PLANNERS & BINDERS ───────────────────────────────────────
  {
    id: 'personalized-planner',
    name: 'Personalized Planner / Binder',
    priceId: 'price_REPLACE_PERSONALIZED_PLANNER',     // ← Your Stripe Price ID
    price: 3800,
    displayPrice: '$38.00',
    category: 'planners',
    categoryLabel: 'Planners & Binders',
    shortDescription: 'Stay organized in style. A custom-decorated planner or binder with your name, colors, and a look that\'s 100% you.',
    description: `Because staying organized should feel as good as it looks. Choose your planner style and let us deck it out with your name, favorite colors, and any custom vinyl accents.

Perfect for school, work, business planning, or gifting to the most organized person you know.

✦ Standard 8.5" × 11" 3-ring binder or spiral planner
✦ Vinyl name decal included
✦ Choice of base colors (contact us for current options)
✦ Optional glitter, floral, or minimal aesthetic
✦ 3–5 business days`,
    image: 'images/products/personalized-planner.jpg',
    imageAlt: 'Custom personalized planner with vinyl name decal in blush and gold',
    processingTime: '3–5 business days',
    featured: true,
    hasPersonalization: true,
    personalizationFields: [
      { key: 'name_text',     label: 'Name or Text for Decal',  placeholder: 'e.g., Sarah\'s Planner',         required: true  },
      { key: 'color_choice',  label: 'Color / Aesthetic',       placeholder: 'e.g., blush & gold, black & white', required: false },
      { key: 'special_notes', label: 'Any Other Requests',      placeholder: 'e.g., add a floral border',      required: false },
    ],
  },

  // ─── GLITTER PENS & BOOKMARKS ─────────────────────────────────
  {
    id: 'glitter-pen-set',
    name: 'Glitter Pen Set (Set of 3)',
    priceId: 'price_REPLACE_GLITTER_PEN_SET',          // ← Your Stripe Price ID
    price: 2200,
    displayPrice: '$22.00',
    category: 'pens-bookmarks',
    categoryLabel: 'Glitter Pens & Bookmarks',
    shortDescription: 'Writing just got a whole lot sparklier. Hand-dipped glitter pens that make every note feel special.',
    description: `These aren't your average pens. Each one is hand-dipped in layers of fine glitter and sealed for a sparkle that actually lasts. They write smoothly and look absolutely stunning on a desk or in a gift.

Set of 3 pens in coordinating glitter shades. Choose from our current color collections or request custom colors.

✦ Smooth-writing ballpoint ink
✦ Sealed glitter — won't flake or shed
✦ Tied with satin ribbon
✦ Ready to gift as-is
✦ 2–3 business days`,
    image: 'images/products/glitter-pen-set.jpg',
    imageAlt: 'Set of three hand-dipped glitter pens in blush, gold, and lavender tied with ribbon',
    processingTime: '2–3 business days',
    featured: false,
    hasPersonalization: false,
    personalizationFields: [
      { key: 'color_choice', label: 'Color Preference', placeholder: 'e.g., blush + gold + lavender, or all neutrals', required: false },
    ],
  },

  {
    id: 'glitter-bookmark',
    name: 'Custom Glitter Bookmark',
    priceId: 'price_REPLACE_GLITTER_BOOKMARK',         // ← Your Stripe Price ID
    price: 1200,
    displayPrice: '$12.00',
    category: 'pens-bookmarks',
    categoryLabel: 'Glitter Pens & Bookmarks',
    shortDescription: 'Mark your page in style with a hand-dipped glitter bookmark that\'s as pretty as the books you love.',
    description: `A bookmark that's too pretty to lose. Hand-dipped in fine glitter and sealed, with an optional tassel or charm. Makes a sweet add-on to any gift or a treat for yourself.

✦ Laminated cardstock base
✦ Optional name or quote printed on reverse (just ask!)
✦ Tassel or ribbon charm included
✦ 1–2 business days`,
    image: 'images/products/glitter-bookmark.jpg',
    imageAlt: 'Hand-dipped glitter bookmark with tassel in rose gold and blush',
    processingTime: '1–2 business days',
    featured: false,
    hasPersonalization: false,
    personalizationFields: [
      { key: 'color_choice', label: 'Color / Glitter Preference', placeholder: 'e.g., rose gold, holographic, purple', required: false },
      { key: 'custom_text',  label: 'Name or Quote on Back (optional)', placeholder: 'e.g., "She believed she could"', required: false },
    ],
  },

  // ─── KEYCHAINS & LETTER CHARMS ────────────────────────────────
  {
    id: 'initial-keychain',
    name: 'Personalized Initial Keychain',
    priceId: 'price_REPLACE_INITIAL_KEYCHAIN',         // ← Your Stripe Price ID
    price: 1500,
    displayPrice: '$15.00',
    category: 'keychains',
    categoryLabel: 'Keychains & Letter Charms',
    shortDescription: 'Carry a little sparkle everywhere you go. Custom initial keychains handcrafted in resin with gold accents.',
    description: `Small enough to go everywhere, pretty enough to show off. Our resin initial keychains are poured by hand with shimmering inclusions and a gold initial letter. They clip right onto your keys, bag, or backpack.

✦ Approximately 1.5" × 1.5"
✦ Gold letter acrylic or resin initial
✦ Lobster-claw clip keyring
✦ Choice of base color
✦ 2–4 business days`,
    image: 'images/products/initial-keychain.jpg',
    imageAlt: 'Custom resin initial keychain in blush pink with gold letter',
    processingTime: '2–4 business days',
    featured: true,
    hasPersonalization: true,
    personalizationFields: [
      { key: 'initial',      label: 'Initial / Letter',    placeholder: 'e.g., S',                        required: true  },
      { key: 'color_choice', label: 'Color Preference',    placeholder: 'e.g., blush, lavender, clear',   required: false },
    ],
  },

  {
    id: 'letter-charm',
    name: 'Letter Charm (Bag or Zipper)',
    priceId: 'price_REPLACE_LETTER_CHARM',             // ← Your Stripe Price ID
    price: 1200,
    displayPrice: '$12.00',
    category: 'keychains',
    categoryLabel: 'Keychains & Letter Charms',
    shortDescription: 'A darling little charm to personalize your bag, planner, or luggage. Handmade with resin and gold details.',
    description: `Dress up any bag, planner, or zipper pull with a handmade charm featuring your initial or a special word. Made from hand-poured resin with glitter and gold accents.

✦ Approximately 1" diameter
✦ Lobster-claw clip attaches anywhere
✦ 2–3 business days`,
    image: 'images/products/letter-charm.jpg',
    imageAlt: 'Handmade resin letter charm with gold details on a bag zipper',
    processingTime: '2–3 business days',
    featured: false,
    hasPersonalization: true,
    personalizationFields: [
      { key: 'letter_text',  label: 'Letter or Short Word', placeholder: 'e.g., M, Love, Joy',     required: true  },
      { key: 'color_choice', label: 'Color Preference',     placeholder: 'e.g., gold, blush, clear', required: false },
    ],
  },

  // ─── TRINKET TRAYS & DISHES ───────────────────────────────────
  {
    id: 'trinket-tray-pressed-flowers',
    name: 'Trinket Tray with Pressed Flowers',
    priceId: 'price_REPLACE_TRINKET_TRAY',             // ← Your Stripe Price ID
    price: 3200,
    displayPrice: '$32.00',
    category: 'trays',
    categoryLabel: 'Trinket Trays & Dishes',
    shortDescription: 'A stunning hand-poured resin tray with real pressed flowers — perfect for your jewelry, rings, or bedside vignette.',
    description: `Part functional, part art. These resin trinket trays are poured by hand with real dried and pressed flowers preserved inside — no two are ever identical.

Perfect for rings, earrings, hair clips, or simply as a beautiful accent piece on a dresser or vanity.

✦ Approximately 4" × 4" square or 4" round (your choice)
✦ Real pressed botanicals: florals, leaves, ferns
✦ Ultra-clear, high-gloss resin
✦ Gold leaf accents optional
✦ 4–6 business days`,
    image: 'images/products/trinket-tray.jpg',
    imageAlt: 'Handmade clear resin trinket tray with pressed flowers and gold leaf',
    processingTime: '4–6 business days',
    featured: true,
    hasPersonalization: false,
    personalizationFields: [
      { key: 'shape_choice',  label: 'Shape Preference',   placeholder: 'Square or round',                         required: false },
      { key: 'color_notes',   label: 'Color / Floral Notes', placeholder: 'e.g., pink flowers, white botanicals', required: false },
    ],
  },

  // ─── TIERED SERVING STANDS ────────────────────────────────────
  {
    id: 'tiered-serving-stand',
    name: 'Tiered Serving / Dessert Stand',
    priceId: 'price_REPLACE_TIERED_STAND',             // ← Your Stripe Price ID
    price: 6800,
    displayPrice: '$68.00',
    category: 'serving-stands',
    categoryLabel: 'Tiered Serving Stands',
    shortDescription: 'Elevate any table setting with a beautifully decorated tiered stand. Perfect for parties, holidays, and everyday elegance.',
    description: `Whether it's brunch, a birthday, Eid, or just a pretty Tuesday, our tiered serving stands make every spread look like a celebration. Hand-decorated with vinyl, ribbon, and seasonal accents.

✦ 2-tier (10" + 7") or 3-tier (10" + 7" + 5") — your choice
✦ Painted or natural wood tiers
✦ Custom vinyl text or name plate
✦ Seasonal and holiday options available
✦ 5–7 business days`,
    image: 'images/products/tiered-serving-stand.jpg',
    imageAlt: 'Decorated two-tier serving stand with vinyl name decal and ribbon in blush and gold',
    processingTime: '5–7 business days',
    featured: false,
    hasPersonalization: true,
    personalizationFields: [
      { key: 'tier_count',   label: '2-Tier or 3-Tier?',   placeholder: '2-tier or 3-tier',              required: true  },
      { key: 'name_text',    label: 'Name or Text (optional)', placeholder: 'e.g., The Johnson Family',  required: false },
      { key: 'color_theme',  label: 'Color Theme / Occasion', placeholder: 'e.g., blush & gold, Ramadan, Christmas', required: false },
    ],
  },

  // ─── GIFT BASKETS ─────────────────────────────────────────────
  {
    id: 'gift-basket-birthday',
    name: 'Birthday Keepsake Gift Basket',
    priceId: 'price_REPLACE_GIFT_BASKET_BIRTHDAY',     // ← Your Stripe Price ID
    price: 5500,
    displayPrice: '$55.00',
    category: 'gift-baskets',
    categoryLabel: 'Gift Baskets',
    shortDescription: 'The birthday girl (or guy!) deserves something truly special. A curated basket of handcrafted keepsakes wrapped with love.',
    description: `Give a gift that says "I really thought about you." Each birthday basket is curated by hand and packed with a selection of our handmade keepsakes — a glitter pen, personalized keychain, trinket tray, and more — plus sweet treats and a handwritten note.

Contents vary slightly by availability, but the thought is always the same: 100% made-with-love.

✦ Wrapped in a handled gift basket or box
✦ Tissue paper, ribbon, and custom gift tag
✦ Personalized name tag included
✦ Optional add-ons available — just ask
✦ 3–5 business days`,
    image: 'images/products/gift-basket-birthday.jpg',
    imageAlt: 'Curated birthday gift basket with handmade keepsakes wrapped in blush tissue and gold ribbon',
    processingTime: '3–5 business days',
    featured: true,
    hasPersonalization: true,
    personalizationFields: [
      { key: 'recipient_name', label: "Recipient's Name",   placeholder: 'e.g., Sarah',                required: true  },
      { key: 'gift_message',   label: 'Gift Message',       placeholder: 'e.g., Happy Birthday, love!', required: false },
      { key: 'color_theme',    label: 'Color / Theme',      placeholder: 'e.g., blush & gold, purple',  required: false },
    ],
  },

  {
    id: 'gift-basket-valentines',
    name: "Valentine's Day Gift Basket",
    priceId: 'price_REPLACE_GIFT_BASKET_VALENTINES',   // ← Your Stripe Price ID
    price: 6000,
    displayPrice: '$60.00',
    category: 'gift-baskets',
    categoryLabel: 'Gift Baskets',
    shortDescription: 'Say it with something handmade. A romantic, rosy basket filled with keepsakes and sweet treats for the one you love.',
    description: `Skip the generic box of chocolates. Our Valentine's basket is a collection of heartfelt, handcrafted keepsakes wrapped up in ribbons of red and rose.

Includes a personalized item, glitter pen, trinket dish, and chocolates or confections — plus a love note card.

✦ 3–5 business days
✦ Local pickup or shipped with care`,
    image: 'images/products/gift-basket-valentines.jpg',
    imageAlt: "Valentine's Day gift basket with handmade keepsakes in red, blush and gold",
    processingTime: '3–5 business days',
    featured: false,
    hasPersonalization: true,
    personalizationFields: [
      { key: 'recipient_name', label: "Recipient's Name",  placeholder: 'e.g., My Love',              required: false },
      { key: 'gift_message',   label: 'Love Note Message', placeholder: 'e.g., You mean everything to me', required: false },
    ],
  },

  {
    id: 'gift-basket-ramadan',
    name: 'Ramadan / Eid Gift Basket',
    priceId: 'price_REPLACE_GIFT_BASKET_RAMADAN',      // ← Your Stripe Price ID
    price: 6500,
    displayPrice: '$65.00',
    category: 'gift-baskets',
    categoryLabel: 'Gift Baskets',
    shortDescription: 'Celebrate the blessed month with a thoughtfully curated basket of handmade keepsakes and Ramadan treats.',
    description: `A beautifully curated basket to celebrate Ramadan and Eid with someone special. Filled with handmade keepsakes — a personalized tray, charm, and more — plus traditional sweets and dates, all wrapped in elegant gold and green.

Ramadan Mubarak.

✦ Available seasonally (order early — these sell out!)
✦ Custom Arabic name options available
✦ Elegant packaging with gold crescent details
✦ 3–5 business days`,
    image: 'images/products/gift-basket-ramadan.jpg',
    imageAlt: 'Ramadan and Eid gift basket with handmade keepsakes in gold and green',
    processingTime: '3–5 business days',
    featured: false,
    hasPersonalization: true,
    personalizationFields: [
      { key: 'recipient_name', label: "Recipient's Name",  placeholder: 'e.g., Aisha',                  required: false },
      { key: 'gift_message',   label: 'Gift Message',      placeholder: 'e.g., Ramadan Mubarak!',       required: false },
      { key: 'language_pref',  label: 'Name in Arabic? (optional)', placeholder: 'Type name in Arabic if desired', required: false },
    ],
  },

];

// ─── Category definitions ────────────────────────────────────────
const CATEGORIES = [
  { id: 'all',            label: 'All Products'            },
  { id: 'resin',          label: 'Resin Keepsakes'         },
  { id: 'planners',       label: 'Planners & Binders'      },
  { id: 'pens-bookmarks', label: 'Pens & Bookmarks'        },
  { id: 'keychains',      label: 'Keychains & Charms'      },
  { id: 'trays',          label: 'Trinket Trays'           },
  { id: 'serving-stands', label: 'Serving Stands'          },
  { id: 'gift-baskets',   label: 'Gift Baskets'            },
];

// ─── Helpers ────────────────────────────────────────────────────
function getProductById(id) {
  return PRODUCTS.find((p) => p.id === id) || null;
}

function getProductsByCategory(categoryId) {
  if (categoryId === 'all') return PRODUCTS;
  return PRODUCTS.filter((p) => p.category === categoryId);
}

function getFeaturedProducts() {
  return PRODUCTS.filter((p) => p.featured);
}
