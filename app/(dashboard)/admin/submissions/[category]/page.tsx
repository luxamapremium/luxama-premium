import { FORMS_MAP } from "@/lib/form-category";
import { getFormSubmissions } from "@/lib/submissions-jotform";
import { notFound } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PageProps {
  params: Promise<{ category: string }>;
}

export default async function AdminFormPage({ params }: PageProps) {
  const { category } = await params;
  const formData = FORMS_MAP[category.toLowerCase()];

  if (!formData || !formData.jotformId) notFound();

  const submissions = await getFormSubmissions(formData.jotformId);
  return (
    <div className="p-6 space-y-6 bg-background font-sans">
      <div>
        <h1 className="text-2xl font-bold font-sans text-navy-900">{formData.title} Submissions</h1>
        <p className="text-muted-foreground font-sans">
          View all entries submitted via Jotform.
        </p>
      </div>

      <div className="rounded-md border border-border bg-card shadow-luxury-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-sans text-navy-900">Submission ID</TableHead>
              <TableHead className="font-sans text-navy-900">Date</TableHead>
              <TableHead className="font-sans text-navy-900">Status</TableHead>
              <TableHead className="text-right font-sans text-navy-900">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.map((sub: any) => (
              <TableRow key={sub.id}>
                <TableCell className="font-medium font-sans">{sub.id}</TableCell>
                <TableCell className="font-sans">
                  {new Date(sub.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <span className="px-2 py-1 rounded-full text-xs bg-navy-900 text-gold-400 border border-gold-500/20 font-sans">
                    {sub.status || "Completed"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <a
                    href={`https://www.jotform.com/submission/${sub.id}`}
                    target="_blank"
                    className="text-gold-600 hover:text-gold-700 hover:underline text-sm font-semibold font-sans"
                  >
                    View Details
                  </a>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
