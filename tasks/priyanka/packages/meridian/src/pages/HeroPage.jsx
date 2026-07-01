import { useEffect, useRef } from "react";
import { useGoto } from "@/App";
import globeVideoPath from "@assets/green_1782326045458.mp4";

export default function HeroPage() {
  const goto = useGoto();
  const videoRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;
      if (contentRef.current) {
        const progress = Math.min(scrollY / (vh * 0.6), 1);
        contentRef.current.style.opacity = String(1 - progress * 1.4);
        contentRef.current.style.transform = `translateY(${-progress * 60}px)`;
      }
      if (videoRef.current) {
        videoRef.current.style.transform = `translateY(${scrollY * 0.4}px)`;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="page-enter relative h-[100dvh] w-full flex flex-col items-center justify-between overflow-hidden bg-black">
      {/* Globe video — hue-rotated to vibrant realistic earth tones */}
      <video
        ref={videoRef}
        src={globeVideoPath}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-90"
        style={{
          willChange: "transform",
          filter:
            "hue-rotate(130deg) saturate(1.4) brightness(0.85) contrast(1.1)",
        }}
      />

      {/* ── COSMIC GLOW OVERLAYS ── */}
      {/* Soft vignette overlay */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, transparent 40%, rgba(0, 0, 0, 0.75) 100%)",
        }}
      />

      {/* Center-bottom cyan/blue horizon glow */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(0, 229, 255, 0.12) 0%, transparent 70%)",
        }}
      />

      {/* Warm purple ambient glow - top right */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 80% 20%, rgba(138, 43, 226, 0.18) 0%, transparent 60%)",
        }}
      />

      {/* Bottom fade to black */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-black via-black/25 to-transparent" />

      {/* ── MAIN CONTENT ── */}
      <div
        ref={contentRef}
        className="relative z-20 w-full flex flex-col items-center justify-center flex-1 px-4"
        style={{ paddingTop: "6vh" }}
      >
        {/* Eyebrow badge */}
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-[rgba(0,255,216,0.35)] bg-[rgba(0,255,216,0.04)] backdrop-blur-md mb-6 shadow-[0_0_15px_rgba(0,255,216,0.1)]">
          <span className="font-mono text-[9px] md:text-xs tracking-[0.3em] font-semibold text-[#00E5FF] drop-shadow-[0_0_6px_rgba(0,229,255,0.4)]">
            GEOSPATIAL INTELLIGENCE
          </span>
        </div>

        {/* Wordmark */}
        <div
          className="relative flex items-center justify-center w-full max-w-[96vw] mb-4"
          style={{ lineHeight: 0.9 }}
        >
          <h1
            className="font-serif italic font-medium tracking-wide leading-none relative w-full text-center text-white"
            style={{
              fontSize: "clamp(4rem, 12vw, 8.5rem)",
              background:
                "linear-gradient(to bottom, #ffffff 30%, #FFEFC6 85%, #FFD700 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter:
                "drop-shadow(0 0 15px rgba(255, 215, 0, 0.25)) drop-shadow(0 4px 12px rgba(0, 0, 0, 0.6))",
            }}
          >
            Meridian
          </h1>
        </div>

        {/* Vibrant Tagline */}
        <div className="flex items-center gap-4 md:gap-6 mb-10">
          <span
            className="font-mono text-xs md:text-sm tracking-[0.25em] font-semibold text-[#FFA726]"
            style={{ textShadow: "0 0 8px rgba(255,167,38,0.35)" }}
          >
            LOCATE
          </span>
          <span className="text-white/20">•</span>
          <span
            className="font-mono text-xs md:text-sm tracking-[0.25em] font-semibold text-[#00E5FF]"
            style={{ textShadow: "0 0 8px rgba(0,229,255,0.35)" }}
          >
            CONNECT
          </span>
          <span className="text-white/20">•</span>
          <span
            className="font-mono text-xs md:text-sm tracking-[0.25em] font-semibold text-[#D18CF2]"
            style={{ textShadow: "0 0 8px rgba(209,140,242,0.35)" }}
          >
            VISUALIZE
          </span>
        </div>

        {/* CTA button */}
        <button
          onClick={() => goto("/compare")}
          data-testid="button-compare-locations"
          className="group flex items-center gap-3 px-8 py-3.5 rounded-full font-sans text-xs tracking-widest uppercase font-bold transition-all duration-300 bg-white/5 hover:bg-[#00FFD8] text-white hover:text-black border border-[rgba(0,255,216,0.3)] hover:border-[#00FFD8] shadow-[0_0_20px_rgba(0,255,216,0.15)] hover:shadow-[0_0_35px_rgba(0,255,216,0.45)] cursor-pointer"
        >
          {/* Crosshair icon - color-shifting with hover */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 18 18"
            fill="none"
            className="shrink-0 transition-colors duration-300 stroke-[#00FFD8] group-hover:stroke-black"
          >
            <circle cx="9" cy="9" r="3.5" strokeWidth="1.5" />
            <line x1="9" y1="0" x2="9" y2="4.5" strokeWidth="1.5" />
            <line x1="9" y1="13.5" x2="9" y2="18" strokeWidth="1.5" />
            <line x1="0" y1="9" x2="4.5" y2="9" strokeWidth="1.5" />
            <line x1="13.5" y1="9" x2="18" y2="9" strokeWidth="1.5" />
          </svg>
          Compare Locations →
        </button>
      </div>

      {/* ── BOTTOM SPACER ── */}
      <div className="h-12 w-full z-20" />
    </div>
  );
}
