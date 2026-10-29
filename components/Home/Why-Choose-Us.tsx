import {
  ShieldCheck,
  Globe,
  MessageSquare,
  FileCheck,
  CreditCard,
} from "lucide-react";

const features = [
  {
    title: "Professional & Confidential",
    description:
      "Your privacy is our priority. We maintain the highest standards of integrity and security in every interaction.",
    icon: ShieldCheck,
  },
  {
    title: "Nationwide Service",
    description:
      "No matter where you are located, Luxama Premium Group provides seamless support across the entire country.",
    icon: Globe,
  },
  {
    title: "Clear Communication",
    description:
      "We believe in transparency. Stay informed with consistent updates and direct access to our expert team.",
    icon: MessageSquare,
  },
  {
    title: "Organized & Accurate Documentation",
    description:
      "Detail-oriented processing ensures your records are precise, compliant, and easy to manage.",
    icon: FileCheck,
  },
  {
    title: "Transparent Fees",
    description:
      "Straightforward pricing with no hidden costs. We provide clear value for premium professional services.",
    icon: CreditCard,
  },
];

export default function WhyChooseUs() {
  return (
    <div className="bg-background">
      <section
        id="features"
        className="relative block px-6 py-20 md:py-28 md:px-10 border-b border-border/60 overflow-hidden"
      >
        {/* Subtle decorative background gradient accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/5 blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-navy-800/5 dark:bg-navy-800/20 blur-[120px] pointer-events-none rounded-full" />

        <div className="relative mx-auto max-w-5xl text-center z-10">
          <span className="text-gold-600 dark:text-gold-400 my-3 flex items-center justify-center font-bold uppercase tracking-[0.25em] text-xs">
            Trust & Excellence
          </span>
          <h2 className="block w-full font-serif font-bold text-navy-900 dark:text-ice-50 text-3xl sm:text-5xl tracking-tight leading-tight">
            Why Clients Choose{" "}
            <span className="text-gold-gradient">Luxama Premium Group</span>
          </h2>
          <p className="mx-auto my-4 w-full max-w-xl text-center font-normal leading-relaxed text-navy-700/80 dark:text-ice-200/80 text-base sm:text-lg">
            We combine industry expertise with a client-first approach to
            deliver exceptional results with total reliability.
          </p>
        </div>

        <div className="relative mx-auto max-w-7xl z-10 grid grid-cols-1 gap-8 pt-12 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group cursor-pointer rounded-2xl border border-border/70 bg-card p-8 text-center shadow-luxury-sm transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-luxury hover:border-gold-500/40 active:scale-[0.98]"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-navy-900 text-gold-400 dark:bg-navy-800 shadow-luxury-sm transition-all duration-500 ease-out group-hover:scale-110 group-hover:bg-gold-gradient group-hover:text-navy-950">
                  <Icon className="w-6 h-6 text-inherit transition-colors" />
                </div>
                <h3 className="mt-6 text-xl font-serif font-bold text-navy-900 dark:text-ice-50 transition-colors duration-300 group-hover:text-gold-600 dark:group-hover:text-gold-400">
                  {feature.title}
                </h3>
                <p className="my-4 mb-0 font-normal leading-relaxed text-navy-700/80 dark:text-ice-200/80 text-sm sm:text-base">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
