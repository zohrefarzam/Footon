"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { AnimatePresence } from "motion/react";

import { Splash } from "./splash";

const SplashDone = createContext(true);

/** False while the launch splash is covering the screen. Use it to hold entrance animations. */
export function useSplashDone() {
  return useContext(SplashDone);
}

/**
 * Plays the brand splash every time the app is opened (each full page load,
 * on any route). It lives in the root layout, so in-app navigation keeps it
 * dismissed. The page underneath is inert until the splash has finished.
 */
export function SplashGate({ children }: { children: React.ReactNode }) {
  const [done, setDone] = useState(false);
  const finish = useCallback(() => setDone(true), []);

  return (
    <SplashDone.Provider value={done}>
      <div inert={!done} className="contents">
        {children}
      </div>
      <AnimatePresence>{!done && <Splash key="splash" onDone={finish} />}</AnimatePresence>
    </SplashDone.Provider>
  );
}
