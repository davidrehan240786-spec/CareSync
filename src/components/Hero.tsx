"use client";

import { motion } from "motion/react";
import { useEffect } from "react";
import { renderCanvas, ShineBorder, TypeWriter } from "./ui/hero-designali";
import { Plus } from "lucide-react"; 
import { Button } from "./ui/button"; 

// Using a standard <a> tag or a button if routing is not needed, 
// since 'next/link' might not be available in a non-Next.js environment.
// Actually, I'll check if react-router-dom is used.

export const Hero = () => {
  const talkAbout = [
    "Medical Analysis",
    "Health Timelines",
    "Insurance Optimization",
    "Record Extraction",
    "Risk Assessment",
    "AI Diagnostics",
    "Patient Wellness",
  ];

  useEffect(() => {
    // Small delay to ensure canvas is in DOM
    const timer = setTimeout(() => {
      renderCanvas();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="overflow-hidden relative min-h-screen">
      <section id="home" className="relative z-10 flex flex-col items-center justify-center min-h-screen pt-20">
        <div className="absolute inset-0 max-md:hidden top-[400px] -z-10 h-[400px] w-full bg-transparent bg-[linear-gradient(to_right,#57534e_1px,transparent_1px),linear-gradient(to_bottom,#57534e_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-20 [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] dark:bg-[linear-gradient(to_right,#a8a29e_1px,transparent_1px),linear-gradient(to_bottom,#a8a29e_1px,transparent_1px)]"></div>
        
        <div className="flex flex-col items-center justify-center px-6 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 mt-10 sm:justify-center md:mb-4 md:mt-10"
          >
            <div className="relative flex items-center rounded-full border bg-white/50 backdrop-blur-sm px-3 py-1 text-xs text-black/60">
              Introducing CareSync 2.0
              <a
                href="#"
                className="ml-1 flex items-center font-semibold text-blue-600"
              >
                Explore <span className="ml-1">→</span>
              </a>
            </div>
          </motion.div>

          <div className="mx-auto max-w-5xl">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative mx-auto h-full border py-12 p-6 [mask-image:radial-gradient(800rem_96rem_at_center,white,transparent)]"
            >
              <h1 className="flex flex-col text-center text-5xl font-semibold leading-tight tracking-tight md:text-8xl">
                <Plus
                  strokeWidth={4}
                  className="text-blue-500 absolute -left-5 -top-5 h-10 w-10"
                />
                <Plus
                  strokeWidth={4}
                  className="text-blue-500 absolute -bottom-5 -left-5 h-10 w-10"
                />
                <Plus
                  strokeWidth={4}
                  className="text-blue-500 absolute -right-5 -top-5 h-10 w-10"
                />
                <Plus
                  strokeWidth={4}
                  className="text-blue-500 absolute -bottom-5 -right-5 h-10 w-10"
                />
                <span>
                  The complete platform for your{" "}
                  <span className="text-blue-600">Health.</span>
                </span>
              </h1>
              <div className="flex items-center mt-4 justify-center gap-1">
                <span className="relative flex h-3 w-3 items-center justify-center">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                </span>
                <p className="text-xs text-green-500">System Online</p>
              </div>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8 text-2xl md:text-2xl"
            >
              Turn complex reports into{" "}
              <span className="text-blue-600 font-bold">Actionable Insights</span>
            </motion.h1>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-xl md:text-2xl py-4 text-black/70 max-w-2xl mx-auto"
            >
              We build intelligent systems for patient-first care. Specialized in{" "}
              <span className="text-blue-600 font-bold inline-block min-w-[200px]">
                <TypeWriter strings={talkAbout} />
              </span>.
            </motion.div>
          </div>
        </div>

        <canvas
          className="pointer-events-none absolute inset-0 mx-auto -z-10"
          id="canvas"
        ></canvas>
      </section>

      {/* Decorative Gradient Background */}
      <motion.img
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 1.5 }}
        className="absolute left-1/2 top-0 -z-20 -translate-x-1/2 w-full max-w-[1512px]"
        src="https://raw.githubusercontent.com/designali-in/designali/refs/heads/main/apps/www/public/images/gradient-background-top.png"
        alt=""
        role="presentation"
      />
    </main>
  );
};
