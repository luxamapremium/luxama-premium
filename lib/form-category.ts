export const FORMS_MAP: Record<
  string,
  {
    title: string;
    jotformId?: string;
    subForms?: Record<string, { title: string; jotformId: string }>;
  }
> = {
  "immigration-uscis-support": {
    title: "Immigration & USCIS Support",
    subForms: {
      "form-i-90": {
        title: "Form I-90 – Green Card Replacement",
        jotformId: "261075833484058",
      },
      "form-i-129f": {
        title: "Form I-129f – Fiancé(E) / K-1 Visa",
        jotformId: "261075267473057",
      },
      "form-i-130": {
        title: "Form I-130 – Petition For Alien Relative",
        jotformId: "261076531195053",
      },
      "form-i-130a": {
        title: "Form I-130a – Petition For Alien Relative",
        jotformId: "261075836935062",
      },
      "form-i-131": {
        title: "Form I-131 – Travel Document / Advance Parole",
        jotformId: "261076800347051",
      },
      "form-i-485": {
        title: "Form I-485 – Adjustment Of Status",
        jotformId: "261076485063055",
      },
      "form-i-589": {
        title: "Form I-589 – Asylum Application",
        jotformId: "261076018544051",
      },
      "form-i-751": {
        title: "Form I-751 – Remove Conditions On Green Card",
        jotformId: "261076832238055",
      },
      "form-i-765": {
        title: "Form I-765 – Work Permit Application",
        jotformId: "261076297739066",
      },
      "form-i-821": {
        title: "Form I-821 – Temporary Protected Status (TPS)",
        jotformId: "261076346067055",
      },
      "form-i-864": {
        title: "Form I-864 – Affidavit Of Support (Sponsorship)",
        jotformId: "261076421017044",
      },
      "form-n-400": {
        title: "Form N-400 – U.S. Citizenship (Naturalization)",
        jotformId: "261076262158053",
      },
      "form-n-600": {
        title: "Form N-600 – Certificate Of Citizenship",
        jotformId: "261076840604051",
      },
    },
  },
  "tax-preparation-questionnaire": {
    title: "Tax Preparation Questionnaire",
    jotformId: "263134585864062",
  },
  "notary-request-form": {
    title: "Notary Request Form",
    jotformId: "263134953872060",
  },
  "business-administration-questionnaire": {
    title: "Business Administration Questionnaire",
    jotformId: "263134982899071",
  },
  "certified-translation": {
    title: "Translation & Interpretation Request",
    jotformId: "263135269087059",
  }
};
