import * as React from "react";
import {
  UserCheck,
  Calculator,
  Stamp,
  Briefcase,
  Languages,
  FileText,
  FileSpreadsheet,
  Scale,
  Building2,
  Globe,
  BriefcaseBusiness,
} from "lucide-react";
import { createSlug } from "@/lib/slug";
import { MenuItem, NavbarLogoData, NavbarAuthData } from "./types";

export const DEFAULT_LOGO: NavbarLogoData = {
  url: "/",
  src: "/logo.png",
  alt: "Luxama Premium Group",
};

export const DEFAULT_AUTH: NavbarAuthData = {
  login: { text: "Log in", url: "/auth/sign-in" },
  signup: { text: "Sign up", url: "/auth/sign-up" },
};

export const DEFAULT_MENU: MenuItem[] = [
  {
    title: "Appointments",
    url: "#",
    items: [
      {
        title: "Immigration & USCIS Support",
        description: "Schedule a consultation for USCIS application guidance",
        icon: <UserCheck className="size-4 shrink-0 text-gold-600 dark:text-gold-400" />,
        url: `/admins/${createSlug("Immigration USCIS Support")}`,
      },
      {
        title: "Tax & Financial Services",
        description: "Book an appointment for tax prep and financial planning",
        icon: <Calculator className="size-4 shrink-0 text-gold-600 dark:text-gold-400" />,
        url: `/admins/${createSlug("Tax Financial Services")}`,
      },
      {
        title: "Notary & Document Services",
        description: "Set a time for official document notarization",
        icon: <Stamp className="size-4 shrink-0 text-gold-600 dark:text-gold-400" />,
        url: `/admins/${createSlug("Notary Document Services")}`,
      },
      {
        title: "Business & Administrative Services",
        description: "Consult with us regarding business setup and admin",
        icon: <Briefcase className="size-4 shrink-0 text-gold-600 dark:text-gold-400" />,
        url: `/admins/${createSlug("Business Administrative Services")}`,
      },
      {
        title: "Translation & Language Services",
        description: "Book a professional interpreter or translator",
        icon: <Languages className="size-4 shrink-0 text-gold-600 dark:text-gold-400" />,
        url: `/admins/${createSlug("Translation Language Services")}`,
      },
    ],
  },
  {
    title: "Forms",
    url: "#",
    items: [
      {
        title: "Immigration & USCIS Support",
        description: "Select a specific USCIS form to begin your application",
        icon: <FileText className="size-4 shrink-0 text-gold-600 dark:text-gold-400" />,
        url: "#",
        items: [
          {
            title: "Form I-90 – Green Card Replacement",
            url: "/forms/immigration-uscis-support?form=form-i-90",
          },
          {
            title: "Form I-129f – Fiancé(E) / K-1 Visa",
            url: "/forms/immigration-uscis-support?form=form-i-129f",
          },
          {
            title: "Form I-130 – Petition For Alien Relative",
            url: "/forms/immigration-uscis-support?form=form-i-130",
          },
          {
            title: "Form I-130a – Spouse Beneficiary Information",
            url: "/forms/immigration-uscis-support?form=form-i-130a",
          },
          {
            title: "Form I-131 – Travel Document / Advance Parole",
            url: "/forms/immigration-uscis-support?form=form-i-131",
          },
          {
            title: "Form I-485 – Adjustment Of Status",
            url: "/forms/immigration-uscis-support?form=form-i-485",
          },
          {
            title: "Form I-589 – Asylum Application",
            url: "/forms/immigration-uscis-support?form=form-i-589",
          },
          {
            title: "Form I-751 – Remove Conditions On Green Card",
            url: "/forms/immigration-uscis-support?form=form-i-751",
          },
          {
            title: "Form I-765 – Work Permit Application",
            url: "/forms/immigration-uscis-support?form=form-i-765",
          },
          {
            title: "Form I-821 – Temporary Protected Status (TPS)",
            url: "/forms/immigration-uscis-support?form=form-i-821",
          },
          {
            title: "Form I-864 – Affidavit Of Support (Sponsorship)",
            url: "/forms/immigration-uscis-support?form=form-i-864",
          },
          {
            title: "Form N-400 – U.S. Citizenship (Naturalization)",
            url: "/forms/immigration-uscis-support?form=form-n-400",
          },
          {
            title: "Form N-600 – Certificate Of Citizenship",
            url: "/forms/immigration-uscis-support?form=form-n-600",
          },
        ],
      },
      {
        title: "Tax & Financial Services",
        description: "Fill out necessary tax documents and financial forms",
        icon: <FileSpreadsheet className="size-4 shrink-0 text-gold-600 dark:text-gold-400" />,
        url: `/forms/${createSlug("Tax Financial Services")}`,
      },
      {
        title: "Notary & Document Services",
        description: "Prepare your documents for legal notarization",
        icon: <Scale className="size-4 shrink-0 text-gold-600 dark:text-gold-400" />,
        url: `/forms/${createSlug("Notary Document Services")}`,
      },
      {
        title: "Business & Administrative Services",
        description: "Business registration and administrative paperwork",
        icon: <Building2 className="size-4 shrink-0 text-gold-600 dark:text-gold-400" />,
        url: `/forms/${createSlug("Business Administrative Services")}`,
      },
      {
        title: "Translation & Language Services",
        description: "Submit documents for certified translation services",
        icon: <Globe className="size-4 shrink-0 text-gold-600 dark:text-gold-400" />,
        url: `/forms/${createSlug("Translation Language Services")}`,
      },
      {
        title: "Business Formation Intake Form LLC",
        description: "Submit documents for LLC business",
        icon: <BriefcaseBusiness className="size-4 shrink-0 text-gold-600 dark:text-gold-400" />,
        url: `/forms/${createSlug("Business Formation Intake Form LLC")}`,
      },
    ],
  },
  { title: "About", url: "/about" },
  { title: "Contact", url: "/contact" },
];
