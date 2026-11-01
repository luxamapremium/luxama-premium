"use client";

import { useState } from "react";
import { Mail, PhoneCall, MapPin, Send, Clock, ArrowRight } from "lucide-react";
import { handleContactForm } from "@/app/actions/public/contactAction";
import { toast as sonnerToast } from "sonner";
import { toast as toastifyToast } from "react-toastify";

export default function Contact() {
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    const result = await handleContactForm(formData);
    setIsPending(false);

    if (result.success) {
      sonnerToast.success("Message sent successfully!");
      toastifyToast.success("Message sent successfully!");
      (document.getElementById("contact-form") as HTMLFormElement)?.reset();
    } else {
      sonnerToast.error("Something went wrong. Please try again.");
      toastifyToast.error("Something went wrong. Please try again.");
    }
  }

  const contactDetails = [
    {
      icon: MapPin,
      label: "Visit Our Office",
      value: "2331 E Irlo Bronson Memorial Hwy, Kissimmee, FL 34744",
      href: "https://maps.google.com/?q=2331+E+Irlo+Bronson+Memorial+Hwy+Kissimmee+FL+34744",
      hint: "Appointments welcome, or stop by our Kissimmee office",
    },
    {
      icon: Clock,
      label: "Working Hours",
      value: "Monday – Saturday: 8:00 AM – 6:00 PM EST",
      href: null,
      hint: "Closed Sundays",
    }
  ];

  return (
    <div className="bg-background text-foreground overflow-hidden">
      <main className="relative px-6 py-20 md:py-28 md:px-10 border-b border-border/60 overflow-hidden">
        {/* Subtle decorative background glow accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/5 blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-navy-800/5 dark:bg-navy-800/20 blur-[120px] pointer-events-none rounded-full" />

        <div className="relative mx-auto max-w-7xl z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            {/* Left Column: Direct Info & Header */}
            <div className="lg:col-span-5 flex flex-col justify-start">
              <div className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold tracking-[0.2em] uppercase border border-border/80 bg-card/80 text-navy-800 dark:text-gold-400 shadow-xs mb-5 self-start">
                Get in Touch
              </div>

              <h1 className="font-sans font-bold text-3xl sm:text-5xl lg:text-6xl text-navy-900 dark:text-ice-50 tracking-tight leading-[1.15] mb-6">
                We're Here to Help. <br />
                <span className="text-gold-gradient">Get in Touch with Us.</span>
              </h1>

              <p className="text-navy-700/80 dark:text-ice-200/85 text-base sm:text-lg leading-relaxed font-sans font-normal mb-10 max-w-lg">
                Have a question about a form, need help filing your taxes, or need a document stamped? Reach out anytime—we’re always happy to help.
              </p>

              {/* Contact Info Items matching Why-Choose-Us cards */}
              <div className="space-y-4">
                {contactDetails.map((item, index) => {
                  const Icon = item.icon;
                  const Wrapper = item.href ? "a" : "div";
                  const wrapperProps = item.href
                    ? {
                        href: item.href,
                        target: item.href.startsWith("http") ? "_blank" : undefined,
                        rel: item.href.startsWith("http") ? "noopener noreferrer" : undefined,
                      }
                    : {};

                  return (
                    <Wrapper
                      key={index}
                      {...wrapperProps}
                      className="group rounded-2xl border border-border/80 bg-card/90 dark:bg-card/40 p-4 sm:p-5 shadow-xs hover:shadow-sm hover:border-gold-500/40 transition-all duration-300 flex items-start gap-4"
                    >
                      <div className="w-11 h-11 rounded-full border border-border/80 dark:border-navy-700/80 bg-background/80 dark:bg-navy-900/60 flex items-center justify-center text-navy-900 dark:text-gold-400 shrink-0 shadow-xs group-hover:scale-105 group-hover:border-gold-500/50 group-hover:text-gold-600 dark:group-hover:text-gold-300 transition-all">
                        <Icon className="w-4 h-4 text-inherit" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs uppercase tracking-wider font-semibold text-gold-600 dark:text-gold-400 block mb-0.5">
                          {item.label}
                        </span>
                        <p className="text-sm sm:text-base font-semibold text-navy-900 dark:text-ice-50 break-words group-hover:text-gold-600 dark:group-hover:text-gold-300 transition-colors">
                          {item.value}
                        </p>
                        <p className="text-xs text-navy-700/70 dark:text-ice-200/70 mt-0.5">
                          {item.hint}
                        </p>
                      </div>
                    </Wrapper>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Contact Form */}
            <div className="lg:col-span-7">
              <div className="group rounded-3xl border border-border/80 bg-card/90 dark:bg-card/40 p-7 sm:p-10 shadow hover:shadow-md hover:border-gold-500/40 transition-all duration-300 relative overflow-hidden">
                {/* Subtle top ambient lighting inside card */}
                <div className="absolute -top-16 -right-16 w-48 h-48 bg-gold-500/10 blur-[60px] pointer-events-none rounded-full" />

                <div className="relative z-10 mb-8">
                  <h2 className="font-sans font-bold text-2xl sm:text-3xl text-navy-900 dark:text-ice-50 mb-2">
                    Send Us a Message
                  </h2>
                  <p className="text-navy-700/80 dark:text-ice-200/80 text-sm sm:text-base font-normal leading-relaxed">
                    Fill in the short form below and someone from our team will contact you soon.
                  </p>
                </div>

                <form id="contact-form" action={handleSubmit} className="relative z-10 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-navy-800 dark:text-ice-200/90 ml-1">
                        Full Name
                      </label>
                      <input
                        name="name"
                        required
                        type="text"
                        placeholder="Your name"
                        className="w-full px-4 py-3.5 rounded-2xl border border-border/80 bg-background/80 dark:bg-navy-900/60 text-navy-900 dark:text-ice-50 placeholder:text-navy-700/40 dark:placeholder:text-ice-200/40 focus:outline-none focus:border-gold-500/80 focus:ring-2 focus:ring-gold-500/20 transition-all text-sm font-sans"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-navy-800 dark:text-ice-200/90 ml-1">
                        Email Address
                      </label>
                      <input
                        name="email"
                        required
                        type="email"
                        placeholder="Your email address"
                        className="w-full px-4 py-3.5 rounded-2xl border border-border/80 bg-background/80 dark:bg-navy-900/60 text-navy-900 dark:text-ice-50 placeholder:text-navy-700/40 dark:placeholder:text-ice-200/40 focus:outline-none focus:border-gold-500/80 focus:ring-2 focus:ring-gold-500/20 transition-all text-sm font-sans"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-navy-800 dark:text-ice-200/90 ml-1">
                      Subject
                    </label>
                    <input
                      name="subject"
                      required
                      type="text"
                      placeholder="What do you need help with?"
                      className="w-full px-4 py-3.5 rounded-2xl border border-border/80 bg-background/80 dark:bg-navy-900/60 text-navy-900 dark:text-ice-50 placeholder:text-navy-700/40 dark:placeholder:text-ice-200/40 focus:outline-none focus:border-gold-500/80 focus:ring-2 focus:ring-gold-500/20 transition-all text-sm font-sans"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-navy-800 dark:text-ice-200/90 ml-1">
                      Message
                    </label>
                    <textarea
                      name="message"
                      required
                      rows={5}
                      placeholder="Tell us a little about what you need..."
                      className="w-full px-4 py-3.5 rounded-2xl border border-border/80 bg-background/80 dark:bg-navy-900/60 text-navy-900 dark:text-ice-50 placeholder:text-navy-700/40 dark:placeholder:text-ice-200/40 focus:outline-none focus:border-gold-500/80 focus:ring-2 focus:ring-gold-500/20 transition-all text-sm font-sans resize-none"
                    />
                  </div>

                  <button
                    disabled={isPending}
                    type="submit"
                    className="w-full cursor-pointer py-4 px-7 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-950 font-semibold text-xs uppercase tracking-wider shadow-gold hover:shadow-gold-lg transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group/btn"
                  >
                    <span>{isPending ? "Sending..." : "Send Message"}</span>
                    <Send className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-0.5" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
