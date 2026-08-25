"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { DirectLeadForm } from "./direct-lead-form";

const useDirectTraffic = (directOnEntry: boolean) => {
  const [isDirect, setIsDirect] = useState(directOnEntry);
  useEffect(() => {
    if (!directOnEntry && window.sessionStorage.getItem("rpm-yandex-direct") !== "1") return;
    const frame = window.requestAnimationFrame(() => setIsDirect(true));
    return () => window.cancelAnimationFrame(frame);
  }, [directOnEntry]);
  return isDirect;
};

export function DirectTrafficBookingPanel({ directOnEntry, car, initialStart, children }: {
  directOnEntry: boolean;
  car: { id: string; title: string; pricePerDay: number };
  initialStart: string;
  children: ReactNode;
}) {
  const isDirect = useDirectTraffic(directOnEntry);
  return isDirect ? <DirectLeadForm car={car} initialStart={initialStart} /> : children;
}

export function DirectTrafficMobileCta({ directOnEntry, fallbackHref, fallbackEvent, fallbackLabel, fallbackText }: {
  directOnEntry: boolean;
  fallbackHref: string;
  fallbackEvent: string;
  fallbackLabel: string;
  fallbackText: string;
}) {
  const isDirect = useDirectTraffic(directOnEntry);
  return <div className="mobile-cta"><Link className="button red" href={isDirect ? "#direct-lead" : fallbackHref} data-event={isDirect ? "direct_lead_open" : fallbackEvent} data-event-label={fallbackLabel}>{isDirect ? "Оставить заявку" : fallbackText}</Link></div>;
}
