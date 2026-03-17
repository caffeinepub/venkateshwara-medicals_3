import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  Baby,
  CheckCircle,
  ChevronDown,
  Clock,
  Cpu,
  Droplets,
  HeadphonesIcon,
  Heart,
  Mail,
  MapPin,
  Menu,
  Phone,
  Pill,
  Search,
  Shield,
  ShoppingCart,
  Star,
  Truck,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Product } from "../backend.d";
import CartDrawer from "../components/CartDrawer";
import { useCart } from "../context/CartContext";
import {
  Category,
  useAllProducts,
  useSeedSampleProducts,
} from "../hooks/useQueries";

interface HomePageProps {
  onNavigateAdmin: () => void;
  onNavigateCheckout: () => void;
}

const CATEGORY_META: Record<
  Category,
  {
    label: string;
    icon: React.ReactNode;
    color: string;
    bg: string;
    image: string;
  }
> = {
  [Category.prescriptionMedicines]: {
    label: "Prescription Medicines",
    icon: <Pill className="w-6 h-6" />,
    color: "text-blue-700",
    bg: "bg-blue-50 hover:bg-blue-100",
    image: "/assets/generated/product-prescription-medicines.dim_400x300.jpg",
  },
  [Category.otcMedicines]: {
    label: "OTC Medicines",
    icon: <Activity className="w-6 h-6" />,
    color: "text-emerald-700",
    bg: "bg-emerald-50 hover:bg-emerald-100",
    image: "/assets/generated/product-otc-medicines.dim_400x300.jpg",
  },
  [Category.healthSupplements]: {
    label: "Health Supplements",
    icon: <Heart className="w-6 h-6" />,
    color: "text-rose-700",
    bg: "bg-rose-50 hover:bg-rose-100",
    image: "/assets/generated/product-health-supplements.dim_400x300.jpg",
  },
  [Category.personalCare]: {
    label: "Personal Care",
    icon: <Droplets className="w-6 h-6" />,
    color: "text-purple-700",
    bg: "bg-purple-50 hover:bg-purple-100",
    image: "/assets/generated/product-personal-care.dim_400x300.jpg",
  },
  [Category.babyCare]: {
    label: "Baby Care",
    icon: <Baby className="w-6 h-6" />,
    color: "text-pink-700",
    bg: "bg-pink-50 hover:bg-pink-100",
    image: "/assets/generated/product-baby-care.dim_400x300.jpg",
  },
  [Category.medicalDevices]: {
    label: "Medical Devices",
    icon: <Cpu className="w-6 h-6" />,
    color: "text-slate-700",
    bg: "bg-slate-50 hover:bg-slate-100",
    image: "/assets/generated/product-medical-devices.dim_400x300.jpg",
  },
};

const ALL_CATEGORIES = Object.values(Category);

// Per-product image map keyed by exact product name from seed data
const PRODUCT_IMAGE_MAP: Record<string, string> = {
  "Metformin 500mg Tablet (Glycomet)":
    "/assets/generated/metformin-500mg.dim_400x400.jpg",
  "Atorvastatin 10mg Tablet (Atorva)":
    "/assets/generated/atorvastatin-10mg.dim_400x400.jpg",
  "Amlodipine 5mg Tablet (Amlokind)":
    "/assets/generated/amlodipine-5mg.dim_400x400.jpg",
  "Pantoprazole 40mg Tablet (Pan D)":
    "/assets/generated/pantoprazole-40mg.dim_400x400.jpg",
  "Azithromycin 500mg Tablet (Azithral)":
    "/assets/generated/azithromycin-500mg.dim_400x400.jpg",
  "Cetirizine 10mg Tablet (Cetzine)":
    "/assets/generated/cetirizine-10mg.dim_400x400.jpg",
  "Crocin Advance 500mg Tablet":
    "/assets/generated/crocin-advance-500mg.dim_400x400.jpg",
  "Vicks VapoRub 50ml": "/assets/generated/vicks-vaporub-50ml.dim_400x400.jpg",
  "Gelusil MPS Antacid Tablet":
    "/assets/generated/gelusil-antacid.dim_400x400.jpg",
  "Dettol Antiseptic Liquid 250ml":
    "/assets/generated/dettol-antiseptic-100ml.dim_400x400.jpg",
  "Volini Pain Relief Gel 30g": "/assets/generated/volini-gel.dim_400x400.jpg",
  "Electral ORS Powder Orange 21.8g":
    "/assets/generated/ors-electral.dim_400x400.jpg",
  "Revital H for Men (30 Capsules)":
    "/assets/generated/revital-multivitamin.dim_400x400.jpg",
  "Vitamin D3 1000 IU Tablet (60s)":
    "/assets/generated/vitamin-d3-1000iu.dim_400x400.jpg",
  "Calcium Sandoz Forte 500mg (30 Tablets)":
    "/assets/generated/calcium-vitamin-d3.dim_400x400.jpg",
  "Omega-3 Fish Oil 1000mg (60 Softgels)":
    "/assets/generated/omega3-fish-oil-1000mg.dim_400x400.jpg",
  "Protinex Original Powder 400g":
    "/assets/generated/protinex-powder.dim_400x400.jpg",
  "Centrum Adults Multivitamin (30 Tablets)":
    "/assets/generated/centrum-multivitamin.dim_400x400.jpg",
  "Himalaya Purifying Neem Face Wash 150ml":
    "/assets/generated/himalaya-neem-facewash.dim_400x400.jpg",
  "Dove Beauty Cream Bar 100g (Pack of 3)":
    "/assets/generated/dove-cream-bar.dim_400x400.jpg",
  "Colgate Strong Teeth Toothpaste 200g":
    "/assets/generated/colgate-toothpaste.dim_400x400.jpg",
  "Head & Shoulders Anti-Dandruff Shampoo 340ml":
    "/assets/generated/head-shoulders-shampoo.dim_400x400.jpg",
  "Dettol Original Hand Wash 250ml":
    "/assets/generated/dettol-handwash.dim_400x400.jpg",
  "Nivea Soft Moisturising Cream 200ml":
    "/assets/generated/nivea-soft-cream.dim_400x400.jpg",
  "Johnson's Baby Powder 200g":
    "/assets/generated/johnsons-baby-powder.dim_400x400.jpg",
  "Pampers Active Baby Pants Large (42 Count)":
    "/assets/generated/pampers-active-baby.dim_400x400.jpg",
  "Nestle Cerelac Baby Cereal Wheat 300g":
    "/assets/generated/cerelac-baby-cereal.dim_400x400.jpg",
  "Nan Pro 1 Infant Formula 400g":
    "/assets/generated/infant-formula-nan.dim_400x400.jpg",
  "Himalaya Baby Massage Oil 200ml":
    "/assets/generated/himalaya-baby-oil.dim_400x400.jpg",
  "Omron HEM-7120 Blood Pressure Monitor":
    "/assets/generated/omron-bp-monitor.dim_400x400.jpg",
  "Dr. Morepen BG-03 Glucometer Kit":
    "/assets/generated/accu-chek-glucometer.dim_400x400.jpg",
  "Dr. Trust Digital Thermometer":
    "/assets/generated/digital-thermometer.dim_400x400.jpg",
  "Dr. Trust Pulse Oximeter":
    "/assets/generated/pulse-oximeter.dim_400x400.jpg",
  "Omron NE-C28 Nebulizer": "/assets/generated/omron-nebulizer.dim_400x400.jpg",
  "Vissco Knee Cap Support (Medium)":
    "/assets/generated/vissco-knee-support.dim_400x400.jpg",
};

export default function HomePage({
  onNavigateAdmin,
  onNavigateCheckout,
}: HomePageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">(
    "all",
  );
  const [cartOpen, setCartOpen] = useState(false);
  const productsRef = useRef<HTMLElement>(null);
  const aboutRef = useRef<HTMLElement>(null);
  const servicesRef = useRef<HTMLElement>(null);
  const contactRef = useRef<HTMLElement>(null);

  const { data: products = [], isLoading } = useAllProducts();
  const seedMutation = useSeedSampleProducts();
  const { cartCount } = useCart();

  // Seed sample products on first load if empty
  useEffect(() => {
    if (!isLoading && products.length === 0 && !seedMutation.isPending) {
      seedMutation.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, products.length, seedMutation.isPending, seedMutation.mutate]);

  const scrollTo = (ref: React.RefObject<HTMLElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMobileMenuOpen(false);
  };

  const filteredProducts = products.filter((p: Product) => {
    const matchSearch =
      searchTerm === "" ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory =
      selectedCategory === "all" || p.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-background font-body">
      {/* ── Navbar ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border shadow-xs">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <a
            href="/"
            className="flex items-center gap-2 shrink-0"
            data-ocid="nav.home.link"
          >
            <img
              src="/assets/generated/venkateshwara-logo-transparent.dim_300x120.png"
              alt="Venkateshwara Medicals Logo"
              className="h-10 w-auto object-contain"
            />
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 font-ui text-sm font-medium">
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="text-foreground/70 hover:text-medical-blue transition-colors"
              data-ocid="nav.home.button"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => scrollTo(productsRef)}
              className="text-foreground/70 hover:text-medical-blue transition-colors"
              data-ocid="nav.products.button"
            >
              Products
            </button>
            <button
              type="button"
              onClick={() => scrollTo(aboutRef)}
              className="text-foreground/70 hover:text-medical-blue transition-colors"
              data-ocid="nav.about.button"
            >
              About
            </button>
            <button
              type="button"
              onClick={() => scrollTo(servicesRef)}
              className="text-foreground/70 hover:text-medical-blue transition-colors"
              data-ocid="nav.services.button"
            >
              Services
            </button>
            <button
              type="button"
              onClick={() => scrollTo(contactRef)}
              className="text-foreground/70 hover:text-medical-blue transition-colors"
              data-ocid="nav.contact.button"
            >
              Contact
            </button>
          </nav>

          <div className="flex items-center gap-3">
            {/* Cart button */}
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative flex items-center justify-center w-10 h-10 rounded-xl hover:bg-blue-50 text-foreground/70 hover:text-medical-blue transition-colors"
              data-ocid="nav.cart.button"
              aria-label="Open cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-medical-blue text-white text-[10px] font-ui font-bold flex items-center justify-center px-1">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>

            <Button
              variant="default"
              size="sm"
              className="hidden md:flex bg-medical-blue hover:bg-medical-blue-dark text-white font-ui"
              onClick={onNavigateAdmin}
              data-ocid="nav.admin.button"
            >
              Admin Login
            </Button>
            <button
              type="button"
              className="md:hidden text-foreground p-1"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-ocid="nav.mobile_menu.toggle"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border bg-white overflow-hidden"
            >
              <nav className="container mx-auto px-4 py-4 flex flex-col gap-3 font-ui text-sm">
                <button
                  type="button"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                    setMobileMenuOpen(false);
                  }}
                  className="text-left py-2 text-foreground/70 hover:text-medical-blue"
                  data-ocid="nav.mobile.home.button"
                >
                  Home
                </button>
                <button
                  type="button"
                  onClick={() => scrollTo(productsRef)}
                  className="text-left py-2 text-foreground/70 hover:text-medical-blue"
                  data-ocid="nav.mobile.products.button"
                >
                  Products
                </button>
                <button
                  type="button"
                  onClick={() => scrollTo(aboutRef)}
                  className="text-left py-2 text-foreground/70 hover:text-medical-blue"
                  data-ocid="nav.mobile.about.button"
                >
                  About
                </button>
                <button
                  type="button"
                  onClick={() => scrollTo(servicesRef)}
                  className="text-left py-2 text-foreground/70 hover:text-medical-blue"
                  data-ocid="nav.mobile.services.button"
                >
                  Services
                </button>
                <button
                  type="button"
                  onClick={() => scrollTo(contactRef)}
                  className="text-left py-2 text-foreground/70 hover:text-medical-blue"
                  data-ocid="nav.mobile.contact.button"
                >
                  Contact
                </button>
                <Button
                  variant="default"
                  size="sm"
                  className="mt-2 bg-medical-blue hover:bg-medical-blue-dark text-white w-full"
                  onClick={onNavigateAdmin}
                  data-ocid="nav.mobile.admin.button"
                >
                  Admin Login
                </Button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Cart Drawer */}
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={() => {
          setCartOpen(false);
          onNavigateCheckout();
        }}
      />

      <main>
        {/* ── Hero Section ──────────────────────────────────────────────────── */}
        <section
          className="relative min-h-[540px] flex items-center overflow-hidden"
          style={{
            backgroundImage:
              "url('/assets/generated/pharmacy-hero.dim_1200x500.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 hero-overlay" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-medical-blue-dark/30" />

          <div className="container mx-auto px-4 py-20 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="max-w-2xl"
            >
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/30 rounded-full px-4 py-1.5 mb-5">
                <CheckCircle className="w-4 h-4 text-green-300" />
                <span className="text-white/90 text-sm font-ui font-medium">
                  Licensed & Certified Pharmacy
                </span>
              </div>

              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
                VENKATESHWARA
                <span className="block text-blue-200">MEDICALS</span>
              </h1>

              <p className="text-white/85 text-lg md:text-xl font-body mb-8 max-w-lg">
                Your Trusted Health Partner — Quality medicines, genuine
                products, and compassionate care for your family's wellbeing.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  className="bg-white text-medical-blue hover:bg-blue-50 font-ui font-semibold shadow-medical"
                  onClick={() => scrollTo(productsRef)}
                  data-ocid="hero.browse_medicines.button"
                >
                  Browse Medicines
                </Button>
                <Button
                  size="lg"
                  className="bg-white text-medical-blue hover:bg-blue-50 font-ui font-semibold shadow-medical"
                  onClick={() => scrollTo(contactRef)}
                  data-ocid="hero.contact.button"
                >
                  Contact Us
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 animate-bounce">
            <ChevronDown className="w-6 h-6" />
          </div>
        </section>

        {/* ── Category Cards ────────────────────────────────────────────────── */}
        <section className="py-16 section-surface">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-10"
            >
              <h2 className="font-display text-3xl font-bold text-foreground mb-3">
                Browse by Category
              </h2>
              <p className="text-muted-foreground font-body max-w-lg mx-auto">
                Explore our wide range of healthcare products organized for easy
                navigation
              </p>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {ALL_CATEGORIES.map((cat, idx) => {
                const meta = CATEGORY_META[cat];
                return (
                  <motion.button
                    key={cat}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.07 }}
                    whileHover={{ y: -4, scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setSelectedCategory(cat);
                      scrollTo(productsRef);
                    }}
                    className={`flex flex-col items-center gap-3 p-5 rounded-xl border border-border/60 transition-all duration-200 cursor-pointer ${meta.bg} shadow-xs hover:shadow-card ${selectedCategory === cat ? "ring-2 ring-medical-blue border-medical-blue" : ""}`}
                    data-ocid={`category.card.${idx + 1}`}
                  >
                    <div className={`${meta.color}`}>{meta.icon}</div>
                    <span
                      className={`text-xs font-ui font-semibold text-center leading-tight ${meta.color}`}
                    >
                      {meta.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Products Section ──────────────────────────────────────────────── */}
        <section
          ref={productsRef}
          className="py-16 bg-background"
          id="products"
        >
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-10"
            >
              <h2 className="font-display text-3xl font-bold text-foreground mb-3">
                Our Products
              </h2>
              <p className="text-muted-foreground font-body max-w-lg mx-auto">
                Genuine medicines and healthcare products at the best prices
              </p>
            </motion.div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search medicines, supplements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 font-body h-11 border-border focus-visible:ring-medical-blue"
                  data-ocid="products.search_input"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("all")}
                  className={
                    selectedCategory === "all"
                      ? "bg-medical-blue hover:bg-medical-blue-dark text-white font-ui"
                      : "font-ui border-border hover:border-medical-blue hover:text-medical-blue"
                  }
                  data-ocid="products.filter.all.tab"
                >
                  All
                </Button>
                {ALL_CATEGORIES.map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat)}
                    className={
                      selectedCategory === cat
                        ? "bg-medical-blue hover:bg-medical-blue-dark text-white font-ui text-xs"
                        : "font-ui text-xs border-border hover:border-medical-blue hover:text-medical-blue"
                    }
                    data-ocid={`products.filter.${cat}.tab`}
                  >
                    {CATEGORY_META[cat].label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            {isLoading || seedMutation.isPending ? (
              <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
                data-ocid="products.loading_state"
              >
                {(["a", "b", "c", "d", "e", "f", "g", "h"] as const).map(
                  (id) => (
                    <div
                      key={`skeleton-${id}`}
                      className="bg-card rounded-xl border border-border overflow-hidden"
                    >
                      <Skeleton className="h-40 w-full rounded-none" />
                      <div className="p-4 space-y-3">
                        <Skeleton className="h-4 w-3/4 rounded" />
                        <Skeleton className="h-3 w-1/2 rounded" />
                        <Skeleton className="h-3 w-full rounded" />
                        <div className="flex justify-between items-center pt-2">
                          <Skeleton className="h-5 w-16 rounded" />
                          <Skeleton className="h-8 w-24 rounded" />
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div
                className="text-center py-20 text-muted-foreground"
                data-ocid="products.empty_state"
              >
                <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="font-ui font-medium text-lg mb-1">
                  No products found
                </p>
                <p className="text-sm">Try adjusting your search or filter</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredProducts.map((product: Product, idx: number) => (
                  <ProductCard
                    key={String(product.id)}
                    product={product}
                    index={idx}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── Services Section ──────────────────────────────────────────────── */}
        <section
          ref={servicesRef}
          className="py-16 section-surface"
          id="services"
        >
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-3xl font-bold text-foreground mb-3">
                Our Services
              </h2>
              <p className="text-muted-foreground font-body max-w-lg mx-auto">
                We go beyond just selling medicines — we care about your health
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: <Truck className="w-8 h-8" />,
                  title: "Home Delivery",
                  desc: "Get medicines delivered right to your doorstep within 2-4 hours in the local area.",
                  color: "text-medical-blue",
                  bg: "bg-blue-50",
                  ocid: "services.delivery.card",
                },
                {
                  icon: <Shield className="w-8 h-8" />,
                  title: "Genuine Medicines",
                  desc: "All products sourced directly from licensed manufacturers and authorized distributors.",
                  color: "text-medical-green",
                  bg: "bg-emerald-50",
                  ocid: "services.genuine.card",
                },
                {
                  icon: <HeadphonesIcon className="w-8 h-8" />,
                  title: "24/7 Support",
                  desc: "Our trained pharmacists are available around the clock to answer your health queries.",
                  color: "text-purple-600",
                  bg: "bg-purple-50",
                  ocid: "services.support.card",
                },
                {
                  icon: <Activity className="w-8 h-8" />,
                  title: "Prescription Upload",
                  desc: "Coming soon — upload your prescription and get medicines ready for pick-up instantly.",
                  color: "text-amber-600",
                  bg: "bg-amber-50",
                  comingSoon: true,
                  ocid: "services.prescription.card",
                },
              ].map((service, idx) => (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="bg-card rounded-xl border border-border p-6 shadow-xs hover:shadow-card transition-shadow relative"
                  data-ocid={service.ocid}
                >
                  {service.comingSoon && (
                    <span className="absolute top-4 right-4 text-xs bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-ui font-medium">
                      Coming Soon
                    </span>
                  )}
                  <div
                    className={`inline-flex p-3 rounded-xl ${service.bg} ${service.color} mb-4`}
                  >
                    {service.icon}
                  </div>
                  <h3 className="font-ui font-bold text-lg text-foreground mb-2">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {service.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── About Section ─────────────────────────────────────────────────── */}
        <section ref={aboutRef} className="py-16 bg-background" id="about">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="font-display text-3xl font-bold text-foreground mb-5">
                  About Venkateshwara Medicals
                </h2>
                <p className="text-foreground/75 font-body leading-relaxed mb-4">
                  Venkateshwara Medicals has been serving the community as a
                  trusted neighborhood pharmacy for over a decade. Founded with
                  a commitment to healthcare accessibility, we provide a
                  comprehensive range of prescription medicines,
                  over-the-counter drugs, health supplements, and personal care
                  products.
                </p>
                <p className="text-foreground/75 font-body leading-relaxed mb-6">
                  Our team of qualified pharmacists ensures that every product
                  dispensed meets the highest quality standards. We maintain
                  direct partnerships with reputable pharmaceutical
                  manufacturers, guaranteeing the authenticity of every medicine
                  we sell.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: "10+", label: "Years of Service" },
                    { value: "5000+", label: "Happy Customers" },
                    { value: "2000+", label: "Products Available" },
                    { value: "100%", label: "Genuine Medicines" },
                  ].map((stat, idx) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: idx * 0.1 }}
                      className="bg-secondary rounded-xl p-4 text-center"
                      data-ocid={`about.stat.${idx + 1}`}
                    >
                      <div className="font-display text-2xl font-bold text-medical-blue">
                        {stat.value}
                      </div>
                      <div className="text-xs text-muted-foreground font-ui mt-1">
                        {stat.label}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-gradient-to-br from-medical-blue/5 to-medical-green/10 rounded-2xl p-8 border border-border"
              >
                <h3 className="font-ui font-bold text-xl text-foreground mb-6">
                  Why Choose Us?
                </h3>
                <div className="space-y-4">
                  {[
                    {
                      icon: (
                        <CheckCircle className="w-5 h-5 text-medical-green" />
                      ),
                      title: "Licensed Pharmacy",
                      desc: "Fully licensed and regulated by health authorities",
                    },
                    {
                      icon: <Star className="w-5 h-5 text-amber-500" />,
                      title: "Expert Pharmacists",
                      desc: "Qualified professionals to guide your health decisions",
                    },
                    {
                      icon: <Shield className="w-5 h-5 text-medical-blue" />,
                      title: "Quality Guarantee",
                      desc: "All products verified for authenticity and quality",
                    },
                    {
                      icon: <Truck className="w-5 h-5 text-purple-600" />,
                      title: "Fast Delivery",
                      desc: "Quick and reliable home delivery service",
                    },
                    {
                      icon: <Clock className="w-5 h-5 text-rose-600" />,
                      title: "Extended Hours",
                      desc: "Open 6 days a week with extended working hours",
                    },
                  ].map((item, idx) => (
                    <div
                      key={item.title}
                      className="flex gap-3 items-start"
                      data-ocid={`about.feature.${idx + 1}`}
                    >
                      <div className="mt-0.5 shrink-0">{item.icon}</div>
                      <div>
                        <p className="font-ui font-semibold text-foreground text-sm">
                          {item.title}
                        </p>
                        <p className="text-muted-foreground text-xs mt-0.5">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Contact Section ───────────────────────────────────────────────── */}
        <section
          ref={contactRef}
          className="py-16 section-surface"
          id="contact"
        >
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-3xl font-bold text-foreground mb-3">
                Get in Touch
              </h2>
              <p className="text-muted-foreground font-body max-w-lg mx-auto">
                We're here to help — reach out to us anytime
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {[
                {
                  icon: <MapPin className="w-6 h-6" />,
                  title: "Store Address",
                  lines: [
                    "123 Health Street",
                    "Near Government Hospital",
                    "Your City, State - 500001",
                  ],
                  color: "text-medical-blue",
                  bg: "bg-blue-50",
                  ocid: "contact.address.card",
                },
                {
                  icon: <Phone className="w-6 h-6" />,
                  title: "Phone",
                  lines: ["+91 9876543210", "+91 9876543211"],
                  color: "text-medical-green",
                  bg: "bg-emerald-50",
                  ocid: "contact.phone.card",
                },
                {
                  icon: <Mail className="w-6 h-6" />,
                  title: "Email",
                  lines: ["venkateshwaramedicals@gmail.com"],
                  color: "text-purple-600",
                  bg: "bg-purple-50",
                  ocid: "contact.email.card",
                },
                {
                  icon: <Clock className="w-6 h-6" />,
                  title: "Working Hours",
                  lines: ["Mon – Sat: 8 AM – 9 PM", "Sun: 9 AM – 6 PM"],
                  color: "text-amber-600",
                  bg: "bg-amber-50",
                  ocid: "contact.hours.card",
                },
              ].map((item, idx) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  className="bg-card rounded-xl border border-border p-6 shadow-xs hover:shadow-card transition-shadow"
                  data-ocid={item.ocid}
                >
                  <div
                    className={`inline-flex p-3 rounded-xl ${item.bg} ${item.color} mb-4`}
                  >
                    {item.icon}
                  </div>
                  <h3 className="font-ui font-bold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <div className="space-y-1">
                    {item.lines.map((line) => (
                      <p
                        key={line}
                        className="text-muted-foreground text-sm font-body"
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="medical-gradient text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <img
                src="/assets/generated/venkateshwara-logo-transparent.dim_300x120.png"
                alt="Venkateshwara Medicals"
                className="h-10 w-auto mb-3 brightness-0 invert opacity-90"
              />
              <p className="text-white/70 text-sm font-body leading-relaxed max-w-xs">
                Your trusted neighborhood pharmacy committed to your health and
                wellbeing.
              </p>
            </div>

            <div>
              <h4 className="font-ui font-bold text-white mb-4">Quick Links</h4>
              <div className="flex flex-col gap-2 text-sm font-body">
                <button
                  type="button"
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                  className="text-white/70 hover:text-white text-left transition-colors"
                  data-ocid="footer.home.link"
                >
                  Home
                </button>
                <button
                  type="button"
                  onClick={() => scrollTo(productsRef)}
                  className="text-white/70 hover:text-white text-left transition-colors"
                  data-ocid="footer.products.link"
                >
                  Products
                </button>
                <button
                  type="button"
                  onClick={() => scrollTo(servicesRef)}
                  className="text-white/70 hover:text-white text-left transition-colors"
                  data-ocid="footer.services.link"
                >
                  Services
                </button>
                <button
                  type="button"
                  onClick={() => scrollTo(aboutRef)}
                  className="text-white/70 hover:text-white text-left transition-colors"
                  data-ocid="footer.about.link"
                >
                  About Us
                </button>
                <button
                  type="button"
                  onClick={() => scrollTo(contactRef)}
                  className="text-white/70 hover:text-white text-left transition-colors"
                  data-ocid="footer.contact.link"
                >
                  Contact
                </button>
              </div>
            </div>

            <div>
              <h4 className="font-ui font-bold text-white mb-4">
                Contact Info
              </h4>
              <div className="space-y-2 text-sm font-body text-white/70">
                <p>+91 9876543210</p>
                <p>venkateshwaramedicals@gmail.com</p>
                <p>Mon–Sat 8 AM–9 PM, Sun 9 AM–6 PM</p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/20 pt-6 text-center text-white/60 text-sm font-body">
            <p>
              © {currentYear} VENKATESHWARA MEDICALS. Built with love using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/80 hover:text-white underline"
                data-ocid="footer.caffeine.link"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ── Product Card Component ─────────────────────────────────────────────────
function ProductCard({ product, index }: { product: Product; index: number }) {
  const meta = CATEGORY_META[product.category];
  const { addToCart } = useCart();
  const productImage = PRODUCT_IMAGE_MAP[product.name] ?? meta.image;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.3) }}
      whileHover={{ y: -3 }}
      className="bg-card rounded-xl border border-border shadow-xs hover:shadow-card transition-all duration-200 flex flex-col overflow-hidden"
      data-ocid={`products.item.${index + 1}`}
    >
      {/* Product image thumbnail */}
      <div className="relative h-40 overflow-hidden bg-white flex items-center justify-center">
        <img
          src={productImage}
          alt={product.name}
          className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {/* Stock / featured badges overlaid on image */}
        <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
          {product.inStock ? (
            <span className="green-badge text-xs px-2 py-0.5 rounded-full font-ui font-medium shadow-sm">
              In Stock
            </span>
          ) : (
            <span className="text-xs px-2 py-0.5 rounded-full font-ui font-medium bg-red-50 text-red-600 border border-red-200 shadow-sm">
              Out of Stock
            </span>
          )}
          {product.featured && (
            <span className="blue-badge text-xs px-2 py-0.5 rounded-full font-ui font-medium flex items-center gap-1 shadow-sm">
              <Star className="w-3 h-3" />
              Featured
            </span>
          )}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-ui font-bold text-foreground mb-1 leading-tight line-clamp-2 text-sm">
          {product.name}
        </h3>

        <Badge
          variant="outline"
          className={`self-start text-xs mb-2 ${meta.color} border-current/30 bg-current/5`}
        >
          {meta.label}
        </Badge>

        <p className="text-muted-foreground text-xs leading-relaxed mb-4 flex-1 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
          <span className="font-display text-xl font-bold text-medical-blue">
            ₹{product.price.toFixed(2)}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={!product.inStock}
            onClick={() => product.inStock && addToCart(product)}
            className="text-xs font-ui border-medical-blue text-medical-blue hover:bg-medical-blue hover:text-white transition-colors disabled:opacity-40"
            data-ocid={`products.buy.button.${index + 1}`}
          >
            {product.inStock ? "Add to Cart" : "Unavailable"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
