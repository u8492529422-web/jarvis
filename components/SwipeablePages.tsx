"use client";

import { motion, PanInfo } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";

const SWIPE_ORDER = ["/history", "/", "/chat"];
const SWIPE_THRESHOLD = 80;
const VELOCITY_THRESHOLD = 500;

export default function SwipeablePages({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const idx = useMemo(() => {
    if (pathname === "/") return 1;
    return SWIPE_ORDER.indexOf(pathname);
  }, [pathname]);

  const enabled = idx !== -1;

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (!enabled) return;
    const target = document.activeElement;
    if (target && (target.tagName === "TEXTAREA" || target.tagName === "INPUT")) return;

    const { offset, velocity } = info;
    const goLeft = offset.x < -SWIPE_THRESHOLD || velocity.x < -VELOCITY_THRESHOLD;
    const goRight = offset.x > SWIPE_THRESHOLD || velocity.x > VELOCITY_THRESHOLD;

    if (goLeft && idx < SWIPE_ORDER.length - 1) {
      router.push(SWIPE_ORDER[idx + 1]);
    } else if (goRight && idx > 0) {
      router.push(SWIPE_ORDER[idx - 1]);
    }
  };

  if (!enabled) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.15}
      onDragEnd={onDragEnd}
      className="min-h-screen touch-pan-y"
    >
      {children}
    </motion.div>
  );
}
