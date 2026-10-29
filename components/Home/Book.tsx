"use client";

import { ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BookFeature() {
  return (
    <section className="relative bg-ice-100/60 dark:bg-navy-950 py-24 md:py-32 px-6 border-b border-border/60 overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/2 left-10 -translate-y-1/2 w-80 h-80 bg-gold-500/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Visual Side: Tactile Luxury Display */}
          <div className="w-full lg:w-1/2 flex justify-center">
            <div className="relative group cursor-pointer">
              {/* Subtle Ambient Shadow Layer */}
              <div className="absolute inset-0 bg-gold-500/10 blur-3xl rounded-full scale-75 translate-y-12" />

              {/* Book Cover */}
              <div className="relative w-64 md:w-80 lg:w-[380px] aspect-[3/4] transition-transform duration-500 ease-out group-hover:scale-[1.02]">
                <div className="w-full h-fit bg-card rounded-r-xl rounded-l-sm overflow-hidden shadow-luxury-lg border border-border/70 border-l-black/10">
                  <img
                    src="/book-cover.jpg"
                    alt="Book Cover"
                    className="w-full h-full object-contain"
                  />
                  {/* Spine Highlight for Realism */}
                  <div className="absolute inset-y-0 left-0 w-[5px] bg-gradient-to-r from-navy-950/25 to-transparent" />
                </div>
              </div>

              {/* Trust Badge */}
              <div className="absolute -bottom-4 -right-4 bg-card/95 backdrop-blur-md border border-gold-500/30 px-4 py-3 rounded-xl shadow-luxury flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-3.5 h-3.5 fill-gold-500 text-gold-500"
                    />
                  ))}
                </div>
                <span className="text-[11px] font-bold text-navy-900 dark:text-ice-50 uppercase tracking-widest">
                  Top Rated
                </span>
              </div>
            </div>
          </div>

          {/* Content Side: High-End Typography */}
          <div className="w-full lg:w-1/2">
            <div className="max-w-lg">
              <span className="text-gold-600 dark:text-gold-400 font-bold text-xs uppercase tracking-[0.25em] mb-4 block">
                Now Available on Amazon
              </span>

              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-navy-900 dark:text-ice-50 leading-tight tracking-tight mb-6">
                Sonje w se imigran
              </h2>

              <p className="text-navy-700/80 dark:text-ice-200/80 text-base sm:text-lg leading-relaxed mb-8 font-normal">
                Sonje’w Se Imigran se yon liv ki fèt pou bay fòs, kouraj, ak
                direksyon tout imigran k ap chèche bati lavi yo Ozetazini.
                Atravè eksperyans pèsonèl otè a, w ap jwenn konsèy sou travay,
                biznis, relasyon, ak devlopman pèsonèl. Liv sa a se yon gid pou
                w kenbe lafwa, pran bon desizyon, epi aprann kijan pou w reyisi
                san w pa pèdi idantite w kòm imigran.
              </p>

              {/* CTA Section */}
              <div className="flex flex-col sm:flex-row items-center gap-5">
                <Button
                  asChild
                  variant="gold"
                  size="xl"
                  className="rounded-full shadow-gold hover:shadow-gold-lg w-full sm:w-auto uppercase text-xs tracking-wider font-semibold"
                >
                  <a
                    href="https://a.co/d/034sAwXg"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Purchase on Amazon
                  </a>
                </Button>
              </div>

              {/* Format Availability */}
              <div className="mt-12 pt-8 border-t border-border/70 flex gap-10">
                <div>
                  <p className="text-[10px] text-navy-700/60 dark:text-ice-200/60 uppercase font-bold tracking-wider mb-1">
                    Format
                  </p>
                  <p className="text-sm font-serif font-bold text-navy-900 dark:text-ice-50">
                    Hardcover, Digital
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-navy-700/60 dark:text-ice-200/60 uppercase font-bold tracking-wider mb-1">
                    Shipping
                  </p>
                  <p className="text-sm font-serif font-bold text-navy-900 dark:text-ice-50">
                    Worldwide Delivery
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
