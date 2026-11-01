"use client";

import Link from "next/link";
import { FiFacebook } from "react-icons/fi";
import { FaInstagram } from "react-icons/fa";
import { LuPhoneCall } from "react-icons/lu";
import { MdOutlineMail } from "react-icons/md";
import { IoLocationOutline } from "react-icons/io5";

export const Footer = () => {
  return (
    <footer className="relative bg-navy-950 text-ice-100 border-t border-navy-800 overflow-hidden">
      {/* Top subtle gold ambient glow */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-500/40 to-transparent" />

      {/* Background ambient radial highlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-48 bg-gold-500/5 blur-3xl pointer-events-none rounded-full" />

      <div className="container relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Brand Column (5 cols on lg) */}
          <div className="lg:col-span-5 flex flex-col gap-5 items-start text-left">
            <Link href="/" className="inline-block transition-opacity hover:opacity-90">
              <img
                src="/logo.png"
                alt="Luxama Premium Group"
                className="h-10 w-auto object-contain"
              />
            </Link>

            <p className="text-sm text-ice-200/80 leading-relaxed max-w-sm">
             Delivering expert USCIS guidance, corporate structuring, tax preparation, certified translation,
             and premium administrative services to support your journey with confidence and distinction.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <Link
                target="_blank"
                href="https://www.instagram.com/kingson_ksa?igsh=MWRocjUwdzBqeDA2dw%3D%3D&utm_source=qr"
                aria-label="Instagram"
                className="p-2.5 rounded-full border border-navy-800 bg-navy-900 text-ice-200 hover:text-gold-400 hover:border-gold-500/40 hover:bg-navy-800/80 transition-all shadow-xs"
              >
                <FaInstagram className="size-4" />
              </Link>
              <Link
                target="_blank"
                href="https://www.facebook.com/share/1B2bGGQBpW/?mibextid=wwXIfr"
                aria-label="Facebook"
                className="p-2.5 rounded-full border border-navy-800 bg-navy-900 text-ice-200 hover:text-gold-400 hover:border-gold-500/40 hover:bg-navy-800/80 transition-all shadow-xs"
              >
                <FiFacebook className="size-4" />
              </Link>
            </div>
          </div>

          {/* Quick Links (2 cols on lg) */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <h3 className="font-sans text-sm font-semibold uppercase tracking-wider text-gold-400">
              Company
            </h3>
            <ul className="flex flex-col gap-3 text-sm text-ice-200/80">
              <li>
                <Link href="/about" className="hover:text-gold-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-gold-400 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/admins/immigration-uscis-support" className="hover:text-gold-400 transition-colors">
                  Appointments
                </Link>
              </li>
              <li>
                <Link href="/forms/immigration-uscis-support" className="hover:text-gold-400 transition-colors">
                  Forms Catalog
                </Link>
              </li>
            </ul>
          </div>

          {/* Services (2 cols on lg) */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <h3 className="font-sans text-sm font-semibold uppercase tracking-wider text-gold-400">
              Services
            </h3>
            <ul className="flex flex-col gap-3 text-sm text-ice-200/80">
              <li>
                <Link href="/admins/immigration-uscis-support" className="hover:text-gold-400 transition-colors">
                  Immigration & USCIS
                </Link>
              </li>
              <li>
                <Link href="/admins/tax-financial-services" className="hover:text-gold-400 transition-colors">
                  Tax & Financial
                </Link>
              </li>
              <li>
                <Link href="/admins/notary-document-services" className="hover:text-gold-400 transition-colors">
                  Notary Services
                </Link>
              </li>
              <li>
                <Link href="/admins/business-administrative-services" className="hover:text-gold-400 transition-colors">
                  Business Admin
                </Link>
              </li>
              <li>
                <Link href="/admins/translation-language-services" className="hover:text-gold-400 transition-colors">
                  Certified Translation
                </Link>
              </li>
            </ul>
          </div>

          {/* Concierge & Support (3 cols on lg) */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <h3 className="font-sans text-sm font-semibold uppercase tracking-wider text-gold-400">
              Concierge
            </h3>
            <ul className="flex flex-col gap-3.5 text-sm text-ice-200/80">
              <li>
                <a
                  href="tel:+14073254909"
                  className="flex items-center gap-3 hover:text-gold-400 transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-navy-900 border border-navy-800 text-gold-400 group-hover:border-gold-500/40 transition-colors shrink-0">
                    <LuPhoneCall className="size-4" />
                  </div>
                  <span>+1 (000) 000-0000</span>
                </a>
              </li>

              <li>
                <a
                  href="mailto:ksglobalservicesllc1@gmail.com"
                  className="flex items-center gap-3 hover:text-gold-400 transition-colors group break-all"
                >
                  <div className="p-2 rounded-lg bg-navy-900 border border-navy-800 text-gold-400 group-hover:border-gold-500/40 transition-colors shrink-0">
                    <MdOutlineMail className="size-4" />
                  </div>
                  <span>info@luxamapremiumgroup.com</span>
                </a>
              </li>

              <li>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-navy-900 border border-navy-800 text-gold-400 shrink-0 mt-0.5">
                    <IoLocationOutline className="size-4" />
                  </div>
                  <span className="leading-relaxed">
                     2331 E Irlo Bronson Memorial Hwy, Kissimmee, FL 34744, United States.
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Gold Divider */}
        <div className="gold-divider my-10 opacity-70" />

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ice-200/60">
          <p>© {new Date().getFullYear()} Luxama Premium Group. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/about" className="hover:text-gold-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/contact" className="hover:text-gold-400 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
