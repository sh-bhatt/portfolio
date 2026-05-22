# Project Context: Portfolio Site
We are building a highly interactive, cinematic Next.js web application using 2.5D deep-parallax scrolling.

## Tech Stack
* Framework: Next.js (App Router)
* Styling: Tailwind CSS
* Animation: GSAP (ScrollTrigger & @gsap/react)
* Smooth Scrolling: @studio-freight/react-lenis

## Agent Instructions
1. All components using GSAP or Lenis MUST include `'use client'` at the top.
2. Use the `useGSAP` hook for all animations to prevent React Strict Mode memory leaks.
3. Build the DOM layout and GSAP scroll logic first. Do not add WebGL/React Three Fiber yet.