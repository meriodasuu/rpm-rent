"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { getShowcaseScrollDistance } from "@/lib/showcase";
import type { Car } from "@/types/domain";

export function CarShowcase({ cars }: { cars: Car[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(cars.length <= 1);

  const updateEdges = () => {
    const track = trackRef.current;
    if (!track) return;
    setAtStart(track.scrollLeft <= 4);
    setAtEnd(track.scrollLeft + track.clientWidth >= track.scrollWidth - 4);
  };

  const move = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * getShowcaseScrollDistance(track.clientWidth), behavior: "smooth" });
  };

  if (!cars.length) return <div className="showcase-empty">Автомобили скоро появятся в каталоге.</div>;

  return (
    <section className="car-showcase" aria-label="Автомобили RPM Rent">
      <div className="showcase-controls">
        <button aria-label="Предыдущие автомобили" disabled={atStart} onClick={() => move(-1)} type="button"><ArrowLeft size={18} /></button>
        <span aria-live="polite">Листайте подборку</span>
        <button aria-label="Следующие автомобили" disabled={atEnd} onClick={() => move(1)} type="button"><ArrowRight size={18} /></button>
      </div>
      <div className="showcase-track" onScroll={updateEdges} ref={trackRef} tabIndex={0}>
        {cars.map((car, index) => {
          const image = car.images[0];
          const specs = [car.bodyType, car.horsepower ? `${car.horsepower} л.с.` : null, car.driveType].filter(Boolean);
          return (
            <article className={`showcase-card ${index === 0 ? "showcase-card-featured" : ""}`} key={car.id}>
              <Link href={`/cars/${car.slug}`} aria-label={`Открыть ${car.title}`}>
                {image ? <Image alt={image.alt} fill loading={index < 2 ? "eager" : "lazy"} sizes="(max-width: 760px) 86vw, 48vw" src={image.url} /> : <span className="showcase-image-missing">Фото готовится</span>}
                <span className="showcase-gradient" />
                <span className="showcase-meta">
                  <span className="showcase-index">{String(index + 1).padStart(2, "0")}</span>
                  <strong>{car.title}</strong>
                  <span className="showcase-specs">{specs.map((spec) => <span key={spec}>{spec}</span>)}</span>
                </span>
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
