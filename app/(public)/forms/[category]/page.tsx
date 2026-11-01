import { FORMS_MAP } from "@/lib/form-category";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ form?: string }>;
}

export default async function FormCategoryPage({
  params,
  searchParams,
}: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const categorySlug = resolvedParams.category.toLowerCase();
  const formData = FORMS_MAP[categorySlug];

  if (!formData) {
    notFound();
  }

  // Determine which JotForm ID to use
  let activeJotformId: string | undefined;
  let activeTitle: string = formData.title;

  const hasSubForms =
    formData.subForms && Object.keys(formData.subForms).length > 0;

  if (hasSubForms) {
    const formKey = resolvedSearchParams.form;

    // If a specific form key is provided in the URL (e.g., ?form=form-i-90)
    if (formKey && formData.subForms?.[formKey]) {
      activeJotformId = formData.subForms[formKey].jotformId;
      activeTitle = formData.subForms[formKey].title;
    } else {
      // Default to the first sub-form if no query param is provided
      const firstKey = Object.keys(formData.subForms!);
      activeJotformId = formData.subForms![firstKey[0]].jotformId;
      activeTitle = formData.subForms![firstKey[0]].title;
    }
  } else {
    // Standard category with a single form
    activeJotformId = formData.jotformId;
  }

  if (!activeJotformId) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden py-12 md:py-20 px-4 sm:px-6 lg:px-8 border-b border-border/60">
      {/* Subtle decorative background glow accents matching Why-Choose-Us */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/5 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-navy-800/5 dark:bg-navy-800/20 blur-[120px] pointer-events-none rounded-full" />

      <div className="container max-w-5xl mx-auto relative z-10">
        <div className="mb-8">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold tracking-[0.2em] uppercase border border-border/80 bg-card/80 text-navy-800 dark:text-gold-400 shadow-xs mb-4">
            Forms & Paperwork
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-sans font-bold text-navy-900 dark:text-ice-50 tracking-tight leading-[1.2]">
            {activeTitle}
          </h1>
          <p className="mt-3 text-sm sm:text-base text-navy-700/80 dark:text-ice-200/80 font-normal leading-relaxed">
            Please complete the form below to proceed with your request.
          </p>
        </div>

        <div className="w-full overflow-hidden rounded-3xl border border-border/80 shadow-md bg-card">
          <iframe
            id={`jotform-iframe-${activeJotformId}`}
            title={activeTitle}
            src={`https://form.jotform.com/${activeJotformId}`}
            className="w-full"
            style={{
              minHeight: "800px",
              border: "none",
            }}
            allow="geolocation; microphone; camera; clipboard-read; clipboard-write"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
