"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// The WebGL hero (three.js) loads after the page instead of blocking it. The placeholder
// has the component's exact height, so nothing shifts when it swaps in, and the preloader
// covers it until it reports its first frame (onReady).
const ScrollDissolveReveal = dynamic(
  () => import("@/components/ui/scroll-dissolve-reveal").then((m) => m.ScrollDissolveReveal),
  { ssr: false, loading: () => <div className="relative h-[300vh] w-full" aria-hidden="true" /> }
);

// Longest the preloader waits for the hero before revealing the page anyway (seconds)
const HERO_READY_TIMEOUT = 2.5;

const techCategories = [
  {
    title: "Frontend",
    skills: ["React", "Next.js", "TypeScript", "JavaScript", "Tailwind CSS", "Shadcn UI", "HTML/CSS"]
  },
  {
    title: "Backend",
    skills: ["Node.js", "Express.js", "Hono", "REST APIs", "GraphQL", "PostgreSQL", "MongoDB", "Redis", "Prisma ORM", "Supabase", "JWT & Clerk", "API Design"]
  },
  {
    title: "Tools & DevOps",
    skills: ["Git & GitHub", "Docker", "Vercel", "Cloudflare (Workers, R2, Hyperdrive)", "Neon", "Turborepo", "VS Code", "Groq AI", "AI Tooling (Cursor, Copilot)"]
  }
];

const projects: {
  title: string;
  subtitle: string;
  tags: string[];
  image: string;
  liveUrl: string;
  githubUrl?: string;
}[] = [
  {
    title: "PartyMan",
    subtitle: "A production-grade event and invitation platform with draft/publish lifecycles, RSVP workflows, and access-protected guest data, running on Cloudflare's edge.",
    tags: ["Next.js", "TypeScript", "Hono", "Cloudflare Workers", "PostgreSQL"],
    image: "/projects/partyman.png",
    liveUrl: "https://party-man.vercel.app/"
  },
  {
    title: "The Interviewer",
    subtitle: "An AI mock interview platform that parses resumes, generates personalized technical interviews, and delivers scored, topic-level feedback.",
    tags: ["Next.js", "TypeScript", "Supabase", "Groq AI", "Tailwind CSS"],
    image: "/projects/interviewer.png",
    liveUrl: "https://major-project-oq5o.vercel.app/",
    githubUrl: "https://github.com/sh-bhatt/majorProject"
  },
  {
    title: "MeterFlow",
    subtitle: "An API metering and billing platform with API-key authentication, Redis-backed rate limiting, request logging, and usage-based Razorpay billing.",
    tags: ["React", "Node.js", "Express", "Redis", "MongoDB"],
    image: "/projects/meterflow.png",
    liveUrl: "https://api-bar.vercel.app/",
    githubUrl: "https://github.com/sh-bhatt/ApiBar"
  },
  {
    title: "ACRA",
    subtitle: "An intelligent code analysis platform that combines static analysis, AI-driven reviews, complexity metrics, and security scanning to improve software quality.",
    tags: ["Next.js", "TypeScript", "Supabase", "Groq AI"],
    image: "/projects/acra.png",
    liveUrl: "https://acra-web-kappa.vercel.app/",
    githubUrl: "https://github.com/sh-bhatt/ACRA"
  }
];

export default function Home() {


  const worksSectionRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // The hero can finish loading before or after the preloader timeline is set up
  const heroReadyRef = useRef(false);
  const onHeroReadyRef = useRef<(() => void) | null>(null);
  const handleHeroReady = useCallback(() => {
    heroReadyRef.current = true;
    onHeroReadyRef.current?.();
  }, []);

  useGSAP(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Initial load state: Centered, but invisible and shifted down slightly
    gsap.set('#hero-text-block', { xPercent: -50, yPercent: -40, opacity: 0 });

    if (reduceMotion) {
      // No preloader and no intro: show the hero text immediately
      gsap.set('#hero-text-block', { yPercent: -50, opacity: 1 });
      setIsLoading(false);
    } else {
      // ─── MASTER INITIALIZATION TIMELINE ───
      // Same choreography as before at twice the speed (3.8s → 1.9s). The curtain only
      // rises once the WebGL hero has drawn its first frame (or after HERO_READY_TIMEOUT).
      const introTl = gsap.timeline();
      introTl.to('#loader-logo', { opacity: 1, duration: 0.5, ease: 'power2.out' })
        // Progress line fills smoothly from left to right
        .to('#loader-progress', { x: '0%', duration: 0.75, ease: 'power3.inOut' }, '<0.1');

      const revealTl = gsap.timeline({
        paused: true,
        onComplete: () => {
          setIsLoading(false); // Tells React to safely destroy the preloader node
        }
      });
      // The entire black preloader screen slides up and out of the way
      revealTl.to('#preloader', { yPercent: -100, duration: 0.6, ease: 'power4.inOut', delay: 0.1 })
        // Hero text floats up and fades in EXACTLY as the curtain rises over it
        .to('#hero-text-block', {
          yPercent: -50,
          opacity: 1,
          duration: 0.75,
          ease: 'power3.out'
        }, '-=0.4'); // The negative offset overlaps this with the curtain rise

      let introDone = false;
      const tryReveal = () => {
        if (introDone && heroReadyRef.current && revealTl.progress() === 0 && !revealTl.isActive()) revealTl.play();
      };
      introTl.eventCallback('onComplete', () => { introDone = true; tryReveal(); });
      onHeroReadyRef.current = tryReveal;
      gsap.delayedCall(HERO_READY_TIMEOUT, () => { heroReadyRef.current = true; tryReveal(); });
    }

    // Left hand (Adam): Move down (positive Y), tilt up (negative rotation)
    gsap.set('#char-left', { rotation: 0, yPercent: 0, scale: 0.6 });

    // Right hand (God): Move up (negative Y), tilt down (positive rotation)
    gsap.set('#char-right', { rotation: 0, yPercent: 0, scale: 1 });

    // Set initial state for the cosmic name
    gsap.set('#cosmic-name', { y: '60vh', opacity: 0, scale: 0.8 });

    // With reduced motion there's no scroll scrub: the hero is shown in its finished composition
    const heroTl = gsap.timeline(reduceMotion ? { paused: true } : {
      scrollTrigger: {
        trigger: '#hero-container',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.5,
      }
    });

    const mm = gsap.matchMedia();

    mm.add({
      isDesktop: "(min-width: 1024px)",
      isMobile: "(max-width: 1023px)"
    }, (context) => {
      const isDesktop = context?.conditions?.isDesktop as boolean;

      // Phase 1: Hands glide together while maintaining their new inverted heights and tilts
      // Movement (full duration)
      heroTl.to('#char-left', {
        x: isDesktop ? '35vw' : '9vw',
        yPercent: 0,
        scale: isDesktop ? 1.1 : 0.7,
        duration: 4
      }, 0);

      // Fade (shorter duration = finishes earlier)
      heroTl.to('#char-left', {
        opacity: 0,
        filter: 'blur(8px)',
        duration: 1.5,
      }, 0);

      heroTl.to('#char-right', {
        x: isDesktop ? '-35vw' : '-9vw',
        yPercent: isDesktop ? -32 : -8,
        scale: isDesktop ? 1.1 : 0.7,
        duration: 4
      }, 0);

      heroTl.to('#char-right', {
        opacity: 0,
        filter: 'blur(8px)',
        duration: 1.5,
      }, 0);

      // Text acts as an editorial anchor: it shifts down and left smoothly
      heroTl.to('#hero-text-block', {
        x: isDesktop ? '-35vw' : '0vw', // Centered on mobile
        y: isDesktop ? '35vh' : '15vh',
        scale: isDesktop ? 0.5 : 0.85,
        duration: 2.3,
        ease: 'power2.inOut'
      }, 0);

      // Phase 3: Cosmic Name Rise (MOVED INSIDE MATCHMEDIA)
      // On mobile, it stops lower down (35vh) so the stacked text doesn't hit the header
      heroTl.to('#cosmic-name', {
        y: isDesktop ? '22vh' : '40vh',
        opacity: 1,
        scale: 1,
        duration: 3.3,
        ease: 'none'
      }, 1.5);

      if (reduceMotion) heroTl.progress(1);
    });

    // Note: the old clip-path "burn-container" reveal tween has been removed.
    // The background dissolve (landscape -> cosmic bg) is now handled entirely
    // by the ScrollDissolveReveal component's own scroll-linked shader.

    return () => { onHeroReadyRef.current = null; };
  }, []);

  // ── Cinematic Scroll Animations ─────────────────────────────
  useGSAP(() => {
    // Reduced motion: content is simply shown, with no scroll-reveal
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Scroll Animations for About & Projects
    const scrollElements = gsap.utils.toArray<Element>(['.fade-up-element', '.project-card']);
    scrollElements.forEach((el) => {
      gsap.fromTo(el,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            // Footer elements sit too close to the page end to ever reach 85%, so reveal them on entry
            start: el.closest('footer') ? 'top bottom' : 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });
  }, []);

  // ── Mobile menu keyboard support ────────────────────────────
  // While open: focus moves into the menu, Tab cycles inside it, Escape closes it and
  // returns focus to the toggle. While closed the menu is `inert`, so it can't be tabbed to.
  useEffect(() => {
    const menu = mobileMenuRef.current;
    if (!isMobileMenuOpen || !menu) return;
    const items = () => [...menu.querySelectorAll<HTMLElement>("a[href], button")];
    items()[0]?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setIsMobileMenuOpen(false);
        menuButtonRef.current?.focus();
        return;
      }
      if (e.key !== "Tab") return;
      const list = items();
      const first = list[0], last = list[list.length - 1];
      if (!menu.contains(document.activeElement)) { e.preventDefault(); first?.focus(); }
      else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isMobileMenuOpen]);

  // ── Tech Stack pinning ──────────────────────────────────────
  // When the content fits centred in a full-height column with the heading clear of the
  // fixed header, keep the original layout (h-screen, centred, pinned at top 0).
  // Otherwise switch to a content-height column ("compact") whose sticky top is
  // min(headerHeight, viewportHeight - columnHeight): pinned just below the header if it
  // fits, or pinned once its last pill is fully visible ("sticky bottom") if it doesn't.
  useEffect(() => {
    const col = leftColRef.current;
    const header = document.querySelector("header");
    if (!col || !header) return;
    const desktop = window.matchMedia("(min-width: 1024px)");

    const update = () => {
      const reset = () => { delete col.dataset.fit; col.style.top = ""; };
      if (!desktop.matches) return reset();

      const kids = col.children;
      const contentHeight = kids[kids.length - 1].getBoundingClientRect().bottom - kids[0].getBoundingClientRect().top;
      const headerHeight = header.getBoundingClientRect().height;
      const viewportHeight = window.innerHeight;
      if ((viewportHeight - contentHeight) / 2 >= headerHeight) return reset();

      col.dataset.fit = "compact";
      const style = getComputedStyle(col);
      const columnHeight = contentHeight + parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
      col.style.top = `${Math.min(headerHeight, viewportHeight - columnHeight)}px`;
    };

    update();
    // Children change size on font load / text wrap; the header and viewport on resize
    const observer = new ResizeObserver(update);
    [...col.children, header].forEach((el) => observer.observe(el));
    window.addEventListener("resize", update, { passive: true });
    desktop.addEventListener("change", update);
    document.fonts?.ready.then(update);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
      desktop.removeEventListener("change", update);
    };
  }, []);

  return (
    <>
      <main className="w-full relative z-10">
        {/* ─── CINEMATIC PRELOADER ─── */}
        {isLoading && (
          <div id="preloader" className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-zinc-950 will-change-transform motion-reduce:hidden">
            <div id="loader-logo" className="text-4xl md:text-5xl font-bold tracking-tighter text-zinc-100 mb-8 opacity-0">SB.</div>
            <div className="w-64 h-[1px] bg-zinc-800 overflow-hidden">
              <div id="loader-progress" className="w-full h-full bg-zinc-100 -translate-x-full will-change-transform"></div>
            </div>
          </div>
        )}

        {/* ─── GLASSMORPHIC HEADER ─── */}
        <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-12 py-4 bg-zinc-950/60 backdrop-blur-lg border-b border-zinc-800/50">
          <div className="text-xl font-bold tracking-tighter text-zinc-100">SB.</div>
          <nav className="hidden md:flex items-center gap-6">
            {["About", "Experience", "Leadership", "Work", "Services", "Contact"].map((item) => (
              <a
                key={item}
                href={item === "Leadership" ? "#achievements" : `#${item.toLowerCase()}`}
                className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                {item}
              </a>
            ))}

            {/* Desktop Resume Button */}
            <a
              href="https://drive.google.com/file/d/1SnHC4wde-7Q9hf2234QMJIX1SK2KiC-A/view?usp=drive_link"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium px-5 py-2 rounded-full border border-zinc-700 text-zinc-300 hover:bg-zinc-100 hover:text-zinc-950 hover:border-transparent transition-all duration-300"
            >
              Resume
            </a>
          </nav>
          <button
            ref={menuButtonRef}
            type="button"
            className="block md:hidden text-zinc-100"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open mobile menu"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </header>
        {/* ─── COMPACT DROPDOWN MENU ─── */}
        {/* 1. Invisible click-away backdrop */}
        <div
          className={`fixed inset-0 z-[55] md:hidden ${isMobileMenuOpen ? "pointer-events-auto" : "pointer-events-none"}`}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* 2. The Small Dropdown Box */}
        <div
          id="mobile-menu"
          ref={mobileMenuRef}
          inert={!isMobileMenuOpen}
          className={`fixed top-20 right-6 z-[60] w-48 flex flex-col bg-zinc-950/65 backdrop-blur-2xl border border-zinc-800/60 rounded-2xl p-2 shadow-2xl transition-all duration-300 origin-top-right md:hidden ${isMobileMenuOpen ? "scale-100 opacity-100 pointer-events-auto" : "scale-95 opacity-0 pointer-events-none"
            }`}
        >
          {/* Refined, Minimalist Links */}
          <nav className="flex flex-col">
            {["About", "Experience", "Leadership", "Work", "Services", "Contact"].map((item) => (
              <a
                key={item}
                href={item === "Leadership" ? "#achievements" : `#${item.toLowerCase()}`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-sm font-medium tracking-wide text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-all px-4 py-3 rounded-xl flex justify-between items-center group"
              >
                <span>{item}</span>
                <span aria-hidden="true" className="text-zinc-600 group-hover:text-zinc-400 transition-colors text-xs font-light">↗</span>
              </a>
            ))}

            {/* Separator Line */}
            <div className="h-px bg-zinc-800/60 my-1 mx-2"></div>

            {/* Mobile Resume Link */}
            <a
              href="https://drive.google.com/file/d/1SnHC4wde-7Q9hf2234QMJIX1SK2KiC-A/view?usp=drive_link"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-sm font-medium tracking-wide text-zinc-200 hover:text-zinc-100 hover:bg-zinc-800/50 transition-all px-4 py-3 rounded-xl flex justify-between items-center group"
            >
              <span>Resume</span>
              <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500 group-hover:text-zinc-300 transition-colors">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </a>
          </nav>
        </div>

        {/* ─── HERO ─── */}
        <section id="hero-container" className="relative w-full">
          {/* Scroll-linked dissolve reveal: Renaissance landscape dissolves into the cosmic background as the user scrolls */}
          <ScrollDissolveReveal
            imageFront="/bg-layer-1.webp"
            imageBack="/space-bg.webp"
            onReady={handleHeroReady}
          />

          {/* Overlay layer: characters, cosmic name, and hero text — pinned over the dissolve canvas */}
          <div className="absolute inset-0 z-10">
            <div id="hero-sticky" className="sticky top-0 left-0 w-full h-screen overflow-hidden pointer-events-none">

              {/* Left Character */}
              <div id="char-left" className="absolute top-[10%] -left-[10%] w-[50vw] max-w-[800px] aspect-square">
                <img src="/character-left-new.PNG" alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-contain" />
              </div>

              {/* Right Character */}
              <div id="char-right" className="absolute top-[20%] -right-[10%] w-[50vw] max-w-[800px] aspect-square">
                <img src="/character-right-new.PNG" alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-contain" />
              </div>

              {/* Cosmic Name Reveal */}
              <div className="absolute inset-0 flex items-center justify-center">
                <h1 id="cosmic-name" className="text-7xl lg:text-9xl font-semibold tracking-tighter text-white drop-shadow-[0_10px_40px_rgba(0,0,0,0.9)] will-change-transform">
                  Shubham Bhatt
                </h1>
              </div>

              {/* Text Content (Stays on top of everything) */}
              <div id="hero-text-block" className="absolute top-1/2 left-1/2 z-20 flex flex-col items-center text-center whitespace-nowrap will-change-transform">
                <h2 className="text-6xl lg:text-8xl font-semibold tracking-tighter text-white drop-shadow-[0_10px_40px_rgba(0,0,0,0.9)]">
                  The<br />
                  <span className="italic font-serif font-light bg-zinc-800">Renaissance</span><br />
                  Portfolio
                </h2>
              </div>

            </div>
          </div>
        </section>

        {/* ─── ABOUT ─── */}
        <section id="about" className="relative z-20 bg-zinc-950 w-full py-32 px-6 lg:px-12 max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
          {/* Left Column: Editorial Text */}
          <div className="fade-up-element w-full lg:w-3/5 space-y-8 will-change-transform">
            <h2 className="text-4xl lg:text-5xl font-medium tracking-tight text-zinc-100">
              Engineering with intent.
            </h2>
            <div className="space-y-6 text-lg lg:text-xl text-zinc-400 leading-relaxed max-w-2xl">
              <p>
                I&apos;m Shubham Bhatt, a full-stack developer based in Uttar Pradesh. Currently wrapping up my B.Tech in Computer Science, I specialize in architecting high-performance web applications using React, Next.js, TypeScript, and Node.js.
              </p>
              <p>
                My workflow bridges clean, scalable architecture with modern AI — both in the tools I use, like Cursor and Copilot, and in the products I build, from AI-powered interview platforms to intelligent code analysis tools. I am strictly focused on core software engineering roles where I can solve complex problems and build products that actually matter.
              </p>
              <p>
                When I&apos;m not pushing code, I&apos;m usually traveling, and throwing myself into new adventures just to see where the experience takes me.
              </p>
            </div>
          </div>

          {/* Right Column: Glassmorphic Portrait Slot */}
          <div className="fade-up-element w-full lg:w-2/5 will-change-transform">
            <div className="aspect-[4/5] w-full max-w-md mx-auto bg-zinc-900/30 rounded-3xl border border-zinc-800/50 overflow-hidden relative group p-2">
              <div className="w-full h-full rounded-2xl bg-zinc-900 relative overflow-hidden">
                <Image src="/portrait-new-1.PNG" alt="Shubham Bhatt" fill sizes="(min-width: 496px) 432px, calc(100vw - 64px)" className="object-cover transition-transform duration-1000 group-hover:scale-105 grayscale hover:grayscale-0" />
              </div>
            </div>
          </div>
        </section>

        {/* ─── EXPERIENCE ─── */}
        <section id="experience" className="relative z-10 w-full py-32 px-6 lg:px-12 max-w-7xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-medium tracking-tight text-zinc-100 mb-16 fade-up-element will-change-transform">
            Experience
          </h2>
          <div className="flex flex-col gap-8 fade-up-element will-change-transform">
            <div className="group relative flex flex-col p-8 rounded-3xl bg-zinc-900/30 border border-zinc-800/50 transition-colors duration-500 hover:bg-zinc-800/40 hover:border-zinc-700 fade-up-element will-change-transform">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                  <h3 className="text-2xl font-medium text-zinc-100 mb-1">Web Development Intern</h3>
                  <p className="text-lg text-zinc-400">Explorin Academy</p>
                </div>
                <div className="mt-4 md:mt-0 text-left md:text-right">
                  <span className="inline-block px-4 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/50 text-sm font-medium tracking-wider text-zinc-300">
                    Jul 2025 — Aug 2025
                  </span>
                </div>
              </div>

              <p className="text-zinc-200 leading-relaxed mb-6 font-medium">
                Contributed to production-grade full-stack applications with a focus on scalability and performance.
              </p>

              <ul className="list-disc list-outside ml-5 text-zinc-400 space-y-4 mb-8 leading-relaxed max-w-4xl">
                <li>
                  Built full-stack applications using Next.js, TypeScript, React, and Tailwind CSS, with reusable component architectures and responsive workflows.
                </li>
                <li>
                  Integrated GraphQL APIs and Prisma ORM for type-safe database access and relational modeling, and optimized API workflows with caching strategies alongside engineering teams.
                </li>
              </ul>

              {/* Metrics */}
              <div className="flex flex-wrap gap-4 mb-8">
                <span className="px-3 py-1.5 rounded-md border border-zinc-700/50 bg-zinc-800/30 text-sm font-medium text-zinc-300 tracking-wide">
                  API over-fetching ↓35%
                </span>
                <span className="px-3 py-1.5 rounded-md border border-zinc-700/50 bg-zinc-800/30 text-sm font-medium text-zinc-300 tracking-wide">
                  Response time ↓30%
                </span>
              </div>

              {/* Tech Stack */}
              <div className="pt-6 border-t border-zinc-800/50 text-sm font-medium text-zinc-400 tracking-wide">
                Next.js · TypeScript · React · Tailwind CSS · GraphQL · Prisma ORM · SQL Databases
              </div>
            </div>
          </div>
        </section>

        {/* ─── LEADERSHIP & ACHIEVEMENTS ─── */}
        <section id="achievements" className="relative z-10 w-full py-32 px-6 lg:px-12 max-w-7xl mx-auto border-t border-zinc-900/50">
          <h2 className="text-4xl lg:text-5xl font-medium tracking-tight text-zinc-100 mb-16 fade-up-element will-change-transform">
            Leadership & Achievements
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 fade-up-element will-change-transform">
            {/* Card 1: Utkarsh */}
            <div className="group relative flex flex-col p-8 rounded-3xl bg-zinc-900/30 border border-zinc-800/50 will-change-transform transition-colors duration-500 hover:bg-zinc-800/40 hover:border-zinc-700">
              <h3 className="text-2xl font-medium text-zinc-100 mb-2">Lead Event Manager</h3>
              <p className="text-lg text-zinc-400 mb-6">Utkarsh Cultural Fest</p>
              <p className="text-zinc-400 leading-relaxed font-medium">
                Orchestrated logistics, managed cross-functional teams, and executed large-scale events for MIT Moradabad&apos;s annual fest. Developed razor-sharp communication and time management skills under high-pressure scenarios.
              </p>
            </div>

            {/* Card 2: Football */}
            <div className="group relative flex flex-col p-8 rounded-3xl bg-zinc-900/30 border border-zinc-800/50 will-change-transform transition-colors duration-500 hover:bg-zinc-800/40 hover:border-zinc-700">
              <h3 className="text-2xl font-medium text-zinc-100 mb-2">Elite Athletic Training</h3>
              <p className="text-lg text-zinc-400 mb-6">Baichung Bhutia Football Academy</p>
              <p className="text-zinc-400 leading-relaxed font-medium">
                Cultivated relentless physical discipline and teamwork. While the early ambition was to turn professional on the pitch, the high-performance execution and tactical mindset learned there translate directly into my approach to software architecture today.
              </p>
            </div>
          </div>
        </section>

        {/* ─── SELECTED WORKS ─── */}
        <section
          id="work"
          ref={worksSectionRef}
          className="relative w-full bg-zinc-950"
        >
          <div className="flex flex-col lg:flex-row max-w-7xl mx-auto min-h-screen items-start">
            {/* Left column — pinned */}
            <div
              ref={leftColRef}
              className="lg:w-1/2 w-full lg:sticky lg:top-0 lg:self-start flex flex-col justify-center px-8 py-16 min-h-screen lg:h-screen lg:data-[fit=compact]:h-auto lg:data-[fit=compact]:min-h-0 short:py-6"
            >
              <h2 className="text-4xl sm:text-5xl font-medium tracking-tight text-zinc-100 mb-6 short:mb-3">
                Tech Stack
              </h2>

              <p className="text-lg text-zinc-400 mb-12 short:mb-5 leading-relaxed max-w-md font-medium">
                A curated architecture of modern tooling designed for scalable infrastructure, high-performance rendering, and a seamless developer experience.
              </p>

              <div className="flex flex-col gap-10 short:gap-5">
                {techCategories.map((category, index) => (
                  <div key={index} className="flex flex-col gap-4 short:gap-2">
                    <h3 className="text-sm font-semibold tracking-widest text-zinc-400 uppercase">
                      {category.title}
                    </h3>
                    <div className="flex flex-wrap gap-2.5 short:gap-y-1.5">
                      {category.skills.map((tech) => (
                        <span
                          key={tech}
                          className="px-4 py-1.5 border border-zinc-800 bg-zinc-900/50 text-zinc-300 text-sm tracking-wide rounded-full transition-colors hover:border-zinc-600 hover:text-zinc-100"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right column — scrollable cards */}
            <div
              ref={rightColRef}
              className="lg:w-1/2 w-full flex flex-col gap-8 px-8 py-16"
            >
              {/* Existing Completed Projects */}
              {projects.map((project, i) => (
                <div
                  key={i}
                  className="project-card flex flex-col p-8 rounded-3xl bg-zinc-900/30 border border-zinc-800/50 transition-colors duration-500 hover:bg-zinc-800/40 hover:border-zinc-700 will-change-transform group"
                >
                  {/* Image Container */}
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-8 bg-zinc-900 border border-zinc-800/50">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      sizes="(min-width: 1280px) 508px, (min-width: 1024px) calc(50vw - 128px), calc(100vw - 128px)"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                    />
                  </div>

                  <h3 className="text-3xl lg:text-4xl font-medium tracking-tight text-zinc-100 mb-4">
                    {project.title}
                  </h3>
                  <p className="text-zinc-400 leading-relaxed text-lg mb-8 max-w-xl">
                    {project.subtitle}
                  </p>

                  <div className="flex flex-wrap gap-3 mb-8">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-4 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/50 text-xs font-medium tracking-wider text-zinc-300 uppercase"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Action Links */}
                  <div className="flex items-center gap-4 mt-auto">
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 rounded-full bg-zinc-100 text-zinc-950 text-sm font-semibold tracking-wide transition-transform hover:scale-105"
                    >
                      Live Site ↗
                    </a>
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 rounded-full border border-zinc-700 text-zinc-300 text-sm font-medium tracking-wide transition-colors hover:bg-zinc-800 hover:text-zinc-100"
                      >
                        GitHub ↗
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── SERVICES ─── */}
        <section id="services" className="relative z-10 bg-zinc-950 w-full py-32 px-6 lg:px-12 max-w-7xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-medium tracking-tight text-zinc-100 mb-16 fade-up-element will-change-transform">
            Services
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="flex flex-col p-8 rounded-3xl bg-zinc-900/30 border border-zinc-800/50 fade-up-element will-change-transform transition-colors duration-500 hover:bg-zinc-800/40 hover:border-zinc-700">
              <h3 className="text-xl font-medium text-zinc-100 mb-4">Full-Stack Development</h3>
              <p className="text-zinc-400 leading-relaxed">End-to-end web applications built with modern frameworks, clean architecture, and scalable infrastructure.</p>
            </div>

            {/* Card 2 */}
            <div className="flex flex-col p-8 rounded-3xl bg-zinc-900/30 border border-zinc-800/50 fade-up-element will-change-transform transition-colors duration-500 hover:bg-zinc-800/40 hover:border-zinc-700 delay-100">
              <h3 className="text-xl font-medium text-zinc-100 mb-4">API Design & Integration</h3>
              <p className="text-zinc-400 leading-relaxed">RESTful and GraphQL APIs designed for performance, security, and maintainability.</p>
            </div>

            {/* Card 3 */}
            <div className="flex flex-col p-8 rounded-3xl bg-zinc-900/30 border border-zinc-800/50 fade-up-element will-change-transform transition-colors duration-500 hover:bg-zinc-800/40 hover:border-zinc-700 delay-200">
              <h3 className="text-xl font-medium text-zinc-100 mb-4">System Architecture</h3>
              <p className="text-zinc-400 leading-relaxed">Database schema design, cloud deployment strategies, and system-level optimizations.</p>
            </div>
          </div>
        </section>

        {/* ─── CONTACT / FOOTER ─── */}
        <footer id="contact" className="relative z-10 bg-zinc-950 w-full pt-32 pb-16 px-6 lg:px-12 border-t border-zinc-800/50 mt-32 max-w-7xl mx-auto">
          <div className="flex flex-col gap-12">
            <h2 className="text-6xl lg:text-8xl font-medium tracking-tighter text-zinc-100 leading-none">
              Let&apos;s architect<br />
              <span className="text-zinc-500">scalable software.</span>
            </h2>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mt-12">
              <div className="space-y-2">
                <p className="text-zinc-400 text-lg">Currently available for core development roles.</p>
                <a href="mailto:bhattsibbu@gmail.com" className="text-2xl font-medium text-zinc-100 hover:text-white transition-colors border-b border-zinc-800 hover:border-zinc-400 pb-1 inline-block">
                  bhattsibbu@gmail.com ↗
                </a>
              </div>

              {/* Social & Resume Links */}
              <div className="flex flex-wrap gap-4 mt-8 md:mt-0">
                {/* LinkedIn */}
                <a
                  href="https://linkedin.com/in/bhattshubham/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 rounded-full border border-zinc-800 bg-zinc-900/30 text-zinc-300 text-sm font-medium tracking-wide transition-all hover:bg-zinc-100 hover:text-zinc-950 hover:border-transparent group"
                >
                  <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:scale-110"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>
                  LinkedIn
                </a>

                {/* GitHub */}
                <a
                  href="https://github.com/sh-bhatt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 rounded-full border border-zinc-800 bg-zinc-900/30 text-zinc-300 text-sm font-medium tracking-wide transition-all hover:bg-zinc-100 hover:text-zinc-950 hover:border-transparent group"
                >
                  <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:scale-110"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg>
                  GitHub
                </a>

                {/* Resume */}
                <a
                  href="https://drive.google.com/file/d/1SnHC4wde-7Q9hf2234QMJIX1SK2KiC-A/view?usp=drive_link"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 rounded-full border border-zinc-800 bg-zinc-900/30 text-zinc-300 text-sm font-medium tracking-wide transition-all hover:bg-zinc-100 hover:text-zinc-950 hover:border-transparent group"
                >
                  <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:scale-110"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" x2="8" y1="13" y2="13" /><line x1="16" x2="8" y1="17" y2="17" /><line x1="10" x2="8" y1="9" y2="9" /></svg>
                  Resume
                </a>
              </div>
            </div>
          </div>

          {/* ─── PROFESSIONAL SIGNATURE BAR ─── */}
          <div className="mt-32 pt-8 border-t border-zinc-900/50 flex flex-col gap-6 fade-up-element will-change-transform pb-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
              <p className="text-zinc-400 tracking-wide">
                Architected with precision by <span className="text-zinc-200 font-medium">Shubham Bhatt</span>
              </p>
              <p className="text-zinc-400 tracking-widest uppercase text-xs font-medium">
                SCULPTED LOGIC • ENDURING ARCHITECTURE
              </p>
            </div>
            <div className="text-center md:text-left text-zinc-400 text-xs tracking-wider font-medium flex items-center justify-center md:justify-start gap-1.5">
              &copy; {new Date().getFullYear()} Shubham Bhatt. All rights reserved.
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
