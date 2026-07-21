/**
 * Seed script — populates the real Kria Tech "Polaroid Fridge Magnet
 * Frames" catalogue (K1-K12), plus starter FAQ/content. No fake orders
 * or customers. Run with: npx prisma db seed
 *
 * Source: acrylic_frames_Sizes_and_shapes.pdf, supplied by the client.
 * Every price/size below is taken directly from that PDF.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const INCH_TO_MM = 25.4;
const inch = (n: number) => Math.round(n * INCH_TO_MM);
const rupeesToPaise = (r: number) => r * 100;

interface Product {
  code: string;
  name: string;
  slug: string;
  shape: string; // broad filter bucket
  shapeStyle: string; // precise render key for FrameShapePreview
  widthIn: number;
  heightIn: number;
  priceRupees: number;
  photoSlots?: number;
  weightGrams?: number;
  description: string;
}

const PRODUCTS: Product[] = [
  {
    code: "K1",
    name: "K1 — Rounded Square",
    slug: "k1-rounded-square",
    shape: "Square",
    shapeStyle: "rounded-square",
    widthIn: 2.75,
    heightIn: 2.75,
    priceRupees: 35,
    weightGrams: 20,
    description: "A compact square acrylic fridge magnet frame — perfect for a single close-up shot.",
  },
  {
    code: "K2",
    name: "K2 — Rounded Rectangle Landscape",
    slug: "k2-rounded-rectangle-landscape",
    shape: "Rectangle",
    shapeStyle: "rounded-rect",
    widthIn: 3.5,
    heightIn: 2.5,
    priceRupees: 38,
    weightGrams: 22,
    description: "A landscape acrylic frame with softly rounded corners.",
  },
  {
    code: "K3",
    name: "K3 — Rounded Rectangle",
    slug: "k3-rounded-rectangle",
    shape: "Rectangle",
    shapeStyle: "rounded-rect",
    widthIn: 3,
    heightIn: 4,
    priceRupees: 42,
    weightGrams: 24,
    description: "Our classic portrait acrylic frame — the everyday favourite.",
  },
  {
    code: "K4",
    name: "K4 — Rounded Rectangle Large",
    slug: "k4-rounded-rectangle-large",
    shape: "Rectangle",
    shapeStyle: "rounded-rect",
    widthIn: 3.5,
    heightIn: 4.25,
    priceRupees: 45,
    weightGrams: 26,
    description: "A slightly larger take on our classic portrait acrylic frame.",
  },
  {
    code: "K5",
    name: "K5 — Scalloped Cloud",
    slug: "k5-scalloped-cloud",
    shape: "Rectangle",
    shapeStyle: "scalloped-rect",
    widthIn: 3.2,
    heightIn: 4,
    priceRupees: 52,
    weightGrams: 26,
    description: "A playful scalloped-edge frame with a soft cloud-like silhouette.",
  },
  {
    code: "K6",
    name: "K6 — Arch Top",
    slug: "k6-arch-top",
    shape: "Rectangle",
    shapeStyle: "arch",
    widthIn: 3,
    heightIn: 4,
    priceRupees: 42,
    weightGrams: 24,
    description: "A rounded arch top gives this frame a timeless, monument-like feel.",
  },
  {
    code: "K7",
    name: "K7 — Photo Strip (3 photos)",
    slug: "k7-photo-strip",
    shape: "Strip",
    shapeStyle: "strip-3",
    widthIn: 2.25,
    heightIn: 6,
    priceRupees: 60,
    photoSlots: 3,
    weightGrams: 30,
    description: "A vertical strip holding three of your favourite photos in one frame — photobooth style.",
  },
  {
    code: "K8",
    name: "K8 — Photo Strip Large (3 photos)",
    slug: "k8-photo-strip-large",
    shape: "Strip",
    shapeStyle: "strip-3",
    widthIn: 3,
    heightIn: 7,
    priceRupees: 70,
    photoSlots: 3,
    weightGrams: 36,
    description: "A larger vertical strip holding three of your favourite photos in one frame.",
  },
  {
    code: "K9",
    name: "K9 — Rounded Rectangle XL",
    slug: "k9-rounded-rectangle-xl",
    shape: "Rectangle",
    shapeStyle: "rounded-rect",
    widthIn: 4,
    heightIn: 6,
    priceRupees: 68,
    weightGrams: 34,
    description: "Our largest single-photo acrylic frame, for the shot that deserves more space.",
  },
  {
    code: "K10",
    name: "K10 — Heart",
    slug: "k10-heart",
    shape: "Heart",
    shapeStyle: "heart",
    widthIn: 4,
    heightIn: 4,
    priceRupees: 46,
    weightGrams: 24,
    description: "A heart-shaped acrylic frame — the go-to for a sentimental gift.",
  },
  {
    code: "K11",
    name: "K11 — Circle",
    slug: "k11-circle",
    shape: "Circle",
    shapeStyle: "circle",
    widthIn: 4,
    heightIn: 4,
    priceRupees: 46,
    weightGrams: 24,
    description: "A clean circular acrylic frame with a soft, modern silhouette.",
  },
  {
    code: "K12",
    name: "K12 — Scalloped Circle Cloud",
    slug: "k12-scalloped-circle-cloud",
    shape: "Circle",
    shapeStyle: "scalloped-circle",
    widthIn: 4,
    heightIn: 4,
    priceRupees: 48,
    weightGrams: 25,
    description: "A circular acrylic frame with a scalloped, flower-like edge.",
  },
];

async function main() {
  for (const [i, p] of PRODUCTS.entries()) {
    const style = await prisma.frameStyle.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        shape: p.shape,
        shapeStyle: p.shapeStyle,
        photoSlots: p.photoSlots ?? 1,
        material: "Acrylic",
        basePrice: rupeesToPaise(p.priceRupees),
        isActive: true,
        sortOrder: i + 1,
        sizes: {
          create: [
            {
              label: `${p.widthIn} × ${p.heightIn} in`,
              widthMm: inch(p.widthIn),
              heightMm: inch(p.heightIn),
              thicknessMm: 3,
              priceDelta: 0,
              weightGrams: p.weightGrams ?? 25,
              trackInventory: false, // off by default — turn on per size in admin when you want stock enforced
              stockQuantity: 0,
              sortOrder: 1,
            },
          ],
        },
        finishes: {
          create: [{ name: "Clear Acrylic", hexSwatch: "#eef0f2", priceDelta: 0, sortOrder: 1 }],
        },
      },
    });
    console.log(`Seeded ${p.code}: ${style.name}`);
  }

  const faqItems = [
    {
      question: "How does the magnetic backing work?",
      answer:
        "Each frame has a strong magnet built into the back. It holds firmly to any painted or bare metal surface — fridges, steel doors, lockers — and lifts off without residue.",
    },
    {
      question: "How long does delivery take?",
      answer:
        "Every frame is made to order. Production takes 2-3 days, delivery 5-7 more, so plan for about a week across India.",
    },
    {
      question: "Can I order a custom shape not shown here?",
      answer:
        "Yes — share any frame image or your own idea through our Contact page and we'll make it in acrylic.",
    },
  ];

  for (const [i, item] of faqItems.entries()) {
    await prisma.faqItem.upsert({
      where: { id: `seed-faq-${i}` },
      update: {},
      create: { id: `seed-faq-${i}`, ...item, sortOrder: i, isActive: true },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
