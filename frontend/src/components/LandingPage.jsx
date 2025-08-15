import React, { useEffect, useRef, Suspense } from "react";
import gsap from "gsap";
import { useTheme } from "../contexts/ThemeContext";
import { Link } from "react-router-dom";
const SplineAnim = React.lazy(() => import("./SplineAnim"));

const LandingPage = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const heroRefs = useRef([]);
  const featureRefs = useRef([]);
  const newspaperRef = useRef(null);

  useEffect(() => {
    // Reset animations
    gsap.set(heroRefs.current, { opacity: 0, y: 40, scale: 0.98 });
    gsap.set(featureRefs.current, { opacity: 0, y: 30 });
    gsap.set(newspaperRef.current, { opacity: 0, scale: 0.85, rotation: -5 });

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    // Hero section
    tl.to(heroRefs.current, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.8,
      stagger: 0.15
    })
      .to(newspaperRef.current, {
        opacity: 1,
        scale: 1,
        rotation: 0,
        duration: 1.2,
        ease: "back.out(1.7)"
      }, "-=0.4")
      .to(featureRefs.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.2
      }, "-=0.3")
      .add(() => {
        gsap.to(newspaperRef.current, {
          y: -10,
          rotation: 2,
          duration: 4,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true
        });
      });
  }, []);

  const features = [
    { icon: "📰", title: "Breaking News", description: "Real-time campus updates as they unfold.", color: "red" },
    { icon: "✍️", title: "Expert Journalism", description: "In-depth analysis from student journalists.", color: "blue" },
    { icon: "🎯", title: "Campus Focus", description: "Dedicated to university life and events.", color: "green" },
    { icon: "📊", title: "Data-Driven", description: "Fact-based stories with verified sources.", color: "purple" }
  ];

  const stats = [
    { number: "50K+", label: "Monthly Readers", icon: "👥" },
    { number: "500+", label: "Stories Published", icon: "📝" },
    { number: "25+", label: "Student Journalists", icon: "✍️" }
  ];

  const getColorClasses = (color) => {
    const colors = {
      red: "border-red-500 hover:border-red-400 hover:shadow-red-500/30",
      blue: "border-blue-500 hover:border-blue-400 hover:shadow-blue-500/30",
      green: "border-green-500 hover:border-green-400 hover:shadow-green-500/30",
      purple: "border-purple-500 hover:border-purple-400 hover:shadow-purple-500/30"
    };
    return colors[color] || colors.blue;
  };

  return (
    <div
      className={`min-h-screen antialiased selection:bg-red-500/20 selection:text-red-700 transition-colors duration-500 ${
        darkMode
          ? "dark bg-slate-950 text-slate-200"
          : "bg-white text-slate-900"
      }`}
    >
      {/* Top Bar */}
      <div className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/50 border-b border-slate-200/60 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 font-extrabold tracking-wide">
            <span className="inline-grid place-items-center h-8 w-8 rounded-md bg-red-600 text-white shadow-sm shadow-red-600/30">📰</span>
            <span className="text-slate-900 dark:text-white">Daily Juggernaut</span>
          </div>
          <button
            onClick={toggleDarkMode}
            title={darkMode ? "Switch to light" : "Switch to dark"}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/80 dark:bg-slate-800/80 ring-1 ring-slate-900/10 dark:ring-white/10 shadow-sm hover:shadow-md transition-all duration-300 group"
            aria-label="Toggle dark mode"
          >
            <span className="absolute inset-px rounded-full bg-gradient-to-br from-white/60 to-white/20 dark:from-white/10 dark:to-white/0 pointer-events-none" />
            <span className="transition-transform duration-300 group-active:scale-95 text-lg">
              {darkMode ? "☀️" : "🌙"}
            </span>
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-[88vh] flex items-center justify-center px-4 overflow-hidden">
        {/* Decorative background */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {/* radial spotlight (dark only) */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-[42rem] w-[42rem] rounded-full opacity-0 dark:opacity-100 dark:bg-red-400/10 blur-3xl" />
          {/* grid */}
          <div className="absolute inset-0 opacity-0 dark:opacity-10" style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            color: darkMode ? "#94a3b8" : "#0f172a",
          }} />
          {/* noise */}
          <div className="absolute inset-0 mix-blend-overlay opacity-0 dark:opacity-10 [background-image:radial-gradient(#000_1px,transparent_1px)] [background-size:6px_6px]" />
          {/* Spline background */}
          <div ref={newspaperRef} className="absolute inset-0">
            <div className="h-full w-full opacity-60 dark:opacity-80 dark:[mask-image:linear-gradient(to bottom,rgba(0,0,0,0.7),rgba(0,0,0,0.9))]">
              <Suspense fallback={null}>
                <SplineAnim />
              </Suspense>
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div className="text-center lg:text-left">
            <div
              ref={(el) => (heroRefs.current[0] = el)}
              className="inline-flex items-center bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold mb-6 shadow shadow-red-600/30"
            >
              📰 DAILY JUGGERNAUT
            </div>

            <h1
              ref={(el) => (heroRefs.current[1] = el)}
              className="text-5xl lg:text-7xl font-extrabold mb-6 leading-tight tracking-tight"
            >
              <span className="text-slate-900 dark:text-white">Your Campus</span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 dark:from-red-400 dark:via-rose-400 dark:to-amber-300 drop-shadow-sm">News Hub</span>
            </h1>

            <p
              ref={(el) => (heroRefs.current[2] = el)}
              className="text-2xl lg:text-3xl mb-8 font-medium text-slate-950 dark:text-slate-800/100"
            >
              Where Stories Matter
            </p>

            <p
              ref={(el) => (heroRefs.current[3] = el)}
              className="text-lg lg:text-xl mb-12 max-w-2xl leading-relaxed text-slate-950 dark:text-slate-800/100"
            >
              Delivering breaking news and in-depth journalism that keeps the
              campus community informed and engaged.
            </p>

            <div
              ref={(el) => (heroRefs.current[4] = el)}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link to="/login">
              <button
                className={`relative overflow-hidden font-semibold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-[1.03] flex items-center  justify-center gap-2 ring-1 ring-inset ${
                  darkMode
                    ? "bg-gradient-to-r from-red-500 to-rose-500 text-white ring-white/10 shadow-[0_10px_30px_-10px_rgba(244,63,94,0.6)]"
                    : "bg-gradient-to-r from-red-600 to-orange-500 text-black ring-red-500/20 shadow-lg "
                }`}
              >
                📖 Read Latest News / Sign-in
              </button>
              </Link>
              <Link to="/login">
              <button
                className={`font-semibold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-[1.03] flex items-center justify-center gap-2 ring-1 ring-inset ${
                  darkMode
                    ? "bg-white/5 text-slate-100 ring-white/10 hover:bg-white/10"
                    : "bg-white text-slate-900 ring-slate-900/10 hover:ring-slate-900/20 hover:shadow-md"
                }`}
              >
                ✍️ Submit a Story
              </button>
              </Link>
            </div>
          </div>

          {/* Right */}
          <div className="flex justify-center lg:justify-end">
            {/* Background Spline replaces right column content */}
            <div className="hidden lg:block w-[28rem]" aria-hidden />
          </div>
        </div>
      </section>

      {/* Features (glassy cards) */}
      <section
        ref={(el) => (featureRefs.current[0] = el)}
        className="py-20 px-4 bg-white dark:bg-slate-900"
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {features.map((feature, i) => (
            <div
              key={i}
              className={`p-7 rounded-2xl transition-all duration-300 hover:translate-y-[-2px] hover:shadow-2xl ${
                darkMode
                  ? "bg-slate-800/50 ring-1 ring-white/10 shadow-black/100"
                  : "bg-white ring-1 ring-slate-200 shadow-slate-900/5"
              } ${getColorClasses(feature.color)}`}
            >
              <div className="text-5xl mb-4 text-center">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-center tracking-tight text-slate-900 dark:text-slate-600/100">
                {feature.title}
              </h3>
              <p className="text-center text-slate-800/100 dark:text-slate-600/90">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats (subtle glow) */}
      <section
        ref={(el) => (featureRefs.current[1] = el)}
        className="py-20 px-4 ${darkMode ? '' : ''}"
      >
        <div className={`max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 text-center ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          {stats.map((stat, i) => (
            <div key={i} className={`${darkMode ? 'p-6 rounded-2xl bg-white/5 ring-1 ring-white/10 shadow-xl shadow-black/20' : 'p-6 rounded-2xl bg-white ring-1 ring-slate-200 shadow-slate-900/5'}`}>
              <div className="text-4xl mb-2">{stat.icon}</div>
              <div className={`${darkMode ? 'text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-rose-300 drop-shadow' : 'text-4xl font-extrabold text-slate-900'}`}>{stat.number}</div>
              <div className={`${darkMode ? 'text-lg text-slate-300' : 'text-lg text-slate-600'}`}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA (vibrant) */}
      <section
        ref={(el) => (featureRefs.current[2] = el)}
        className="relative py-24 px-4 text-white"
      >
        <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-red-600 via-rose-500 to-orange-500" />
        <div aria-hidden className="absolute inset-0 opacity-20 [background-image:radial-gradient(transparent,rgba(0,0,0,0.5))]" />
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-extrabold mb-6 tracking-tight">Stay Informed, Stay Connected</h2>
          <p className="text-xl/relaxed mb-12 opacity-95">Join thousands who rely on Daily Juggernaut for campus news</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-rose-600 font-semibold py-4 px-12 rounded-xl hover:scale-[1.03] transition-all ring-1 ring-white/30">
              📧 Subscribe
            </button>
            <button className="bg-white/10 text-white font-semibold py-4 px-12 rounded-xl hover:bg-white/15 transition-all ring-1 ring-white/30">
              📱 Stay Logged In
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
