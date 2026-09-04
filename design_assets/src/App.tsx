import { useEffect, useState } from "react"
import ScrollPath from "./components/ScrollPath"

function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-base/88 backdrop-blur-md border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-16 h-20 flex items-center justify-between">
        <div className="font-display font-bold text-xl text-ink tracking-tight">
          Lokate.
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-ink/80">
          <a href="#" className="hover:text-ink transition-colors">Network</a>
          <a href="#" className="hover:text-ink transition-colors">Cold Storage</a>
          <a href="#" className="hover:text-ink transition-colors">Inventory</a>
          <a href="#" className="hover:text-ink transition-colors">Dashboard</a>
          <button className="bg-accent text-base px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-accent/90 transition-colors ml-2">
            Get Access
          </button>
        </div>
      </div>
    </nav>
  )
}

function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="max-w-[1440px] mx-auto w-full px-16">
        <div className="grid grid-cols-12 gap-6 items-center">
          {/* Left content column — clear negative space for text */}
          <div className="col-span-12 md:col-span-5 flex flex-col justify-center pt-28 pb-24">
            {/* Status pill */}
            <div className="flex items-center gap-2.5 mb-8 self-start">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
              </span>
              <span className="text-[13px] text-muted font-medium tracking-[0.06em] uppercase">
                Real-time inventory visibility
              </span>
            </div>

            <h1 className="font-display text-[72px] leading-[1.05] tracking-[-0.025em] text-ink mb-6 text-balance">
              Know Where Every&nbsp;Product&nbsp;Is.
            </h1>

            <p className="text-[16px] leading-[1.65] text-muted max-w-[400px] mb-10">
              Track inventory across every warehouse, row, and bin. Lokate gives your team live visibility across your entire storage network — cold chain to ambient — updated continuously.
            </p>

            <div className="flex items-center gap-4 flex-wrap">
              <button className="bg-accent text-base px-8 py-4 rounded-xl font-semibold text-[15px] hover:bg-accent/90 active:scale-[0.98] transition-all">
                Explore Inventory
              </button>
              <button className="border border-[rgba(242,239,233,0.18)] text-ink px-8 py-4 rounded-xl font-semibold text-[15px] hover:border-[rgba(242,239,233,0.36)] hover:bg-[rgba(242,239,233,0.04)] transition-all">
                View Demo
              </button>
            </div>
          </div>

          {/* Right side — open space; path + terrain patch (waypoint 1) visible here */}
          <div className="col-span-7 hidden md:block" aria-hidden="true" />
        </div>
      </div>
    </section>
  )
}

function Features() {
  const features = [
    {
      num: "01",
      title: "Live Network, Every Node",
      desc: "Monitor all warehouse nodes in real time — capacity, throughput, and lane status. No stale data, no manual syncs.",
      color: "text-accent",
      glowColor: "bg-accent/8",
    },
    {
      num: "02",
      title: "Exact Bin-Level Tracking",
      desc: "Know the row, bay, and bin for every SKU. Row A3, Bay 12, Bin 4 — resolved in milliseconds across your entire network.",
      color: "text-success",
      glowColor: "bg-success/8",
    },
    {
      num: "03",
      title: "Cold Chain Support",
      desc: "Continuous temperature monitoring mapped directly to stored SKUs, ensuring full regulatory compliance at every step.",
      color: "text-accent",
      glowColor: "bg-accent/8",
    },
    {
      num: "04",
      title: "Fast Order Lookup",
      desc: "Find any SKU across your entire network in under three seconds. Built for ops teams that cannot afford to wait.",
      color: "text-success",
      glowColor: "bg-success/8",
    },
  ]

  return (
    <section className="relative py-36">
      <div className="max-w-[1440px] mx-auto px-16">
        {/* Section header — right-aligned since path runs left at this scroll depth */}
        <div className="flex justify-end mb-16">
          <div className="max-w-[480px]">
            <span className="text-[12px] font-semibold tracking-[0.14em] uppercase text-muted mb-3 block">
              Features
            </span>
            <h2 className="font-display text-[40px] leading-[1.15] tracking-[-0.025em] text-ink">
              Built for how warehouses actually work.
            </h2>
          </div>
        </div>

        {/* Staggered 2-column card grid, right-weighted layout */}
        <div className="grid grid-cols-2 gap-5 max-w-[680px] ml-auto">
          {features.map((feat, i) => (
            <div
              key={feat.num}
              className={`bg-card border border-border rounded-2xl p-7 flex flex-col transition-colors hover:border-[rgba(242,239,233,0.14)] ${
                i === 1
                  ? "mt-10"
                  : i === 2
                  ? "mt-5"
                  : i === 3
                  ? "mt-14"
                  : ""
              }`}
            >
              <div className={`font-display text-[54px] leading-none tracking-[-0.03em] ${feat.color} mb-5`}>
                {feat.num}
              </div>
              <h3 className="font-display text-[21px] leading-[1.25] tracking-[-0.02em] text-ink mb-3">
                {feat.title}
              </h3>
              <p className="text-[14px] leading-[1.65] text-muted">
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function WarehouseShowcase() {
  return (
    <section className="relative py-28">
      <div className="max-w-[1440px] mx-auto px-16">
        <div className="grid grid-cols-12 gap-8 items-center">
          {/* Left: text content — path/terrain on right from SVG */}
          <div className="col-span-12 md:col-span-5 flex flex-col justify-center">
            <span className="text-[12px] font-semibold tracking-[0.14em] uppercase text-muted mb-4 block">
              Network
            </span>
            <h2 className="font-display text-[40px] leading-[1.15] tracking-[-0.025em] text-ink mb-5">
              One unified map, every facility.
            </h2>
            <p className="text-[16px] leading-[1.65] text-muted mb-10 max-w-[360px]">
              From flagship distribution centers to last-mile cold rooms, every facility on a single live network. Drill into any node to see bin-level occupancy, inbound lanes, and active picks in real time.
            </p>

            {/* Highlight list */}
            <div className="flex flex-col gap-3.5">
              {[
                { dot: "bg-success", label: "248 warehouses connected across 28 states" },
                { dot: "bg-accent", label: "Live bin-level occupancy per node" },
                { dot: "bg-success", label: "Cross-facility inventory search in <3s" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${item.dot}`} />
                  <span className="text-[14px] text-ink/75">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right 7 cols: open space for SVG waypoint 3 terrain + path */}
          <div className="col-span-7 hidden md:block" aria-hidden="true" />
        </div>
      </div>
    </section>
  )
}

function StatsBand() {
  const stats = [
    { value: "14,200+", label: "SKUs tracked live" },
    { value: "248", label: "Warehouses connected" },
    { value: "99.4%", label: "Network uptime" },
    { value: "<3s", label: "Average lookup time" },
  ]

  return (
    <section className="relative py-24 bg-card border-y border-border overflow-hidden">
      {/* Subtle path behind at very low opacity — data-focused section */}
      <div className="max-w-[1440px] mx-auto px-16">
        <div className="grid grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col">
              <span className="font-display text-[60px] leading-none tracking-[-0.03em] text-accent mb-3">
                {stat.value}
              </span>
              <span className="text-[12px] uppercase tracking-[0.10em] text-muted font-medium">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ColdStorage() {
  const cards = [
    {
      tag: "2°C – 8°C",
      tagAccent: "success",
      title: "Cold Chain Monitoring",
      desc: "Continuous temperature logging for every cell. Alerts fire the instant any zone drifts from target range — before product is compromised.",
    },
    {
      tag: "End-to-End",
      tagAccent: "accent",
      title: "Freezer-to-Door Visibility",
      desc: "Track temperature-sensitive goods from storage through transit to delivery confirmation. Full chain of custody, every handoff.",
    },
    {
      tag: "FSSAI Ready",
      tagAccent: "success",
      title: "Compliance-Ready Logs",
      desc: "Automatically generated audit trails and FSSAI-compliant logs, exportable for regulatory review at any point in time.",
    },
  ]

  return (
    <section className="relative py-36">
      <div className="max-w-[1440px] mx-auto px-16">
        {/* Section header — right-biased, path is LEFT here */}
        <div className="mb-16 max-w-[500px] ml-auto">
          <span className="text-[12px] font-semibold tracking-[0.14em] uppercase text-muted mb-3 block">
            Cold Chain
          </span>
          <h2 className="font-display text-[40px] leading-[1.15] tracking-[-0.025em] text-ink">
            Precision tracking for temperature-sensitive goods.
          </h2>
        </div>

        {/* 3-column card grid, right-weighted */}
        <div className="grid grid-cols-3 gap-5 max-w-[860px] ml-auto">
          {cards.map((card, i) => (
            <div
              key={i}
              className={`bg-card border border-border rounded-2xl p-7 flex flex-col hover:border-[rgba(242,239,233,0.14)] transition-colors ${
                i === 1 ? "mt-8" : ""
              }`}
            >
              <div
                className={`text-[11px] font-semibold tracking-[0.12em] uppercase px-3 py-1.5 rounded-full self-start mb-6 ${
                  card.tagAccent === "success"
                    ? "bg-success/10 text-success"
                    : "bg-accent/10 text-accent"
                }`}
              >
                {card.tag}
              </div>
              <h3 className="font-display text-[20px] leading-[1.3] tracking-[-0.02em] text-ink mb-3">
                {card.title}
              </h3>
              <p className="text-[14px] leading-[1.65] text-muted">
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function PartnerStrip() {
  const names = ["COLDEX", "SNOWMAN", "MAHINDRA LOG", "RIVIGO", "DELHIVERY", "SAFEXPRESS"]
  return (
    <section className="py-12 border-t border-border">
      <div className="max-w-[1440px] mx-auto px-16">
        <p className="text-[11px] uppercase tracking-[0.14em] text-muted mb-8 text-center">
          Trusted across India's leading warehouse operators
        </p>
        <div className="flex items-center justify-between gap-8 opacity-40">
          {names.map((name) => (
            <span key={name} className="text-[13px] font-bold tracking-[0.08em] text-ink/60 whitespace-nowrap">
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="relative pt-20 pb-14 border-t border-border">
      <div className="max-w-[1440px] mx-auto px-16">
        {/* Delivery complete — matches SVG destination marker */}
        <div className="flex items-center gap-3 mb-16">
          <span className="relative flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-30 animate-ping" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-success/20 items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-success" />
            </span>
          </span>
          <span className="text-[13px] text-muted font-medium">Delivery complete — every product located.</span>
        </div>

        <div className="grid grid-cols-12 gap-8 mb-16">
          <div className="col-span-4">
            <div className="font-display font-bold text-[28px] mb-4 text-ink">Lokate.</div>
            <p className="text-[14px] leading-[1.65] text-muted max-w-xs">
              Warehouse intelligence for India's supply chain. Know where every product is, always.
            </p>
          </div>

          <div className="col-span-2 col-start-7 flex flex-col gap-3">
            <h4 className="text-[12px] font-semibold text-ink uppercase tracking-[0.1em] mb-2">Platform</h4>
            {["Network Map", "Cold Storage API", "Inventory Search", "Pricing"].map((link) => (
              <a key={link} href="#" className="text-[14px] text-muted hover:text-ink transition-colors">
                {link}
              </a>
            ))}
          </div>

          <div className="col-span-2 flex flex-col gap-3">
            <h4 className="text-[12px] font-semibold text-ink uppercase tracking-[0.1em] mb-2">Company</h4>
            {["About Us", "Careers", "Blog", "Contact"].map((link) => (
              <a key={link} href="#" className="text-[14px] text-muted hover:text-ink transition-colors">
                {link}
              </a>
            ))}
          </div>

          <div className="col-span-2 flex flex-col gap-3">
            <h4 className="text-[12px] font-semibold text-ink uppercase tracking-[0.1em] mb-2">Resources</h4>
            {["Documentation", "API Reference", "System Status", "Support"].map((link) => (
              <a key={link} href="#" className="text-[14px] text-muted hover:text-ink transition-colors">
                {link}
              </a>
            ))}
          </div>
        </div>

        <div className="pt-8 border-t border-border flex items-center justify-between text-[13px] text-muted">
          <span>© {new Date().getFullYear()} Lokate Technologies Pvt. Ltd. All rights reserved.</span>
          <div className="flex gap-8">
            <a href="#" className="hover:text-ink transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-ink transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-ink transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default function App() {
  return (
    <div className="w-full min-h-screen relative overflow-x-hidden bg-base selection:bg-accent/20">
      {/* Subtle ambient radial gradients — fixed, behind everything */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 0,
          background:
            "radial-gradient(ellipse 55% 35% at 72% 18%, rgba(224,143,94,0.045) 0%, transparent 60%), radial-gradient(ellipse 40% 28% at 22% 72%, rgba(95,163,116,0.03) 0%, transparent 55%)",
        }}
      />

      {/* Scroll path SVG layer — sits behind content */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 1 }}
      >
        <ScrollPath />
      </div>

      {/* Foreground scrolling content */}
      <div className="relative" style={{ zIndex: 10 }}>
        <Navbar />
        <Hero />
        <Features />
        <WarehouseShowcase />
        <StatsBand />
        <ColdStorage />
        <PartnerStrip />
        <Footer />
      </div>
    </div>
  )
}
