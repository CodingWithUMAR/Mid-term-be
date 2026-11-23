require("dotenv").config();
const { validateEnv } = require("../src/config/env");
const connectDatabase = require("../src/config/db");
const Product = require("../src/models/Product");

const products = [
  {
    name: "Turbo Core Oversized Tee", slug: "turbo-core-oversized-tee",
    description: "A heavyweight everyday tee with a relaxed silhouette, structured neckline and minimal TURBO chest mark.",
    category: "T-Shirts", price: 2490, compareAtPrice: 2990, featured: true,
    images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1100&q=85","https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1100&q=85"],
    variants: ["S","M","L","XL"].flatMap(size => [{size,color:"Jet Black",sku:`TRB-TEE-BLK-${size}`,stock:12},{size,color:"Stone",sku:`TRB-TEE-STN-${size}`,stock:8}])
  },
  {
    name: "Velocity Tech Hoodie", slug: "velocity-tech-hoodie",
    description: "A clean technical hoodie with a soft brushed interior, adjustable hood and a confident everyday fit.",
    category: "Hoodies", price: 5490, compareAtPrice: 6290, featured: true,
    images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1100&q=85","https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1100&q=85"],
    variants: ["S","M","L","XL"].flatMap(size => [{size,color:"Black",sku:`TRB-HOOD-BLK-${size}`,stock:8},{size,color:"Ash Grey",sku:`TRB-HOOD-GRY-${size}`,stock:8}])
  },
  {
    name: "Apex Utility Overshirt", slug: "apex-utility-overshirt",
    description: "A versatile layer with a structured shape, utility-inspired detailing and a premium casual finish.",
    category: "Shirts", price: 4290, compareAtPrice: 4890, featured: true,
    images: ["https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1100&q=85"],
    variants: ["S","M","L","XL"].map(size => ({size,color:"Olive",sku:`TRB-OVR-OLV-${size}`,stock:6}))
  },
  {
    name: "Motion Relaxed Cargo", slug: "motion-relaxed-cargo",
    description: "Relaxed-fit cargos with practical pocketing and a modern streetwear profile.",
    category: "Pants", price: 3990, compareAtPrice: 4490, featured: false,
    images: ["https://images.unsplash.com/photo-1517438476312-10d79c077509?auto=format&fit=crop&w=1100&q=85"],
    variants: ["S","M","L","XL"].map(size => ({size,color:"Graphite",sku:`TRB-CARGO-GPH-${size}`,stock:7}))
  },
  {
    name: "Turbo Track Jacket", slug: "turbo-track-jacket",
    description: "A lightweight track jacket designed for movement, layering and off-duty city wear.",
    category: "Jackets", price: 5990, compareAtPrice: 6990, featured: true,
    images: ["https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1100&q=85"],
    variants: ["S","M","L","XL"].map(size => ({size,color:"Midnight",sku:`TRB-TRACK-MID-${size}`,stock:5}))
  },
  {
    name: "Essential Rib Beanie", slug: "essential-rib-beanie",
    description: "A minimal rib-knit beanie that finishes a clean cold-weather fit.",
    category: "Accessories", price: 1290, compareAtPrice: 1590, featured: false,
    images: ["https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&w=1100&q=85"],
    variants: [{size:"OS",color:"Black",sku:"TRB-BEAN-BLK-OS",stock:20},{size:"OS",color:"Stone",sku:"TRB-BEAN-STN-OS",stock:15}]
  }
];

async function run() {
  validateEnv();
  await connectDatabase();
  for (const p of products) {
    await Product.updateOne({ slug: p.slug }, { $set: p }, { upsert: true, runValidators: true });
  }
  console.log(`Seeded ${products.length} TURBO demo products.`);
  await require("mongoose").disconnect();
}
run().catch(async err => {
  console.error(err);
  await require("mongoose").disconnect();
  process.exit(1);
});
