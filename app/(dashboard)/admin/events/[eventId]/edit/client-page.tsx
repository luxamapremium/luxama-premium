"use client";

import { useRouter } from "next/navigation";
import { EventForm } from "../../../../components/events/EventForm";
import { updateEvent } from "../../../../../actions/eventAction";
import { toast } from "sonner";
import { useState } from "react";
import { EventFormData } from "@/lib/schemas/event.schema";

interface EditEventClientProps {
  initialData: any;
  eventId: string;
}

export function EditEventClient({
  initialData,
  eventId,
}: EditEventClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: EventFormData) => {
    try {
      setIsSubmitting(true);
      await updateEvent(eventId, data);
      toast.success("Event updated successfully");
      router.push("/admin/events");
      router.refresh();
    } catch (error) {
      toast.error("Failed to update event");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 bg-background font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy-900 font-sans">Edit Service</h1>
        <p className="text-muted-foreground mt-2 font-sans">
          Update your service settings
        </p>
      </div>
      <EventForm
        initialData={initialData}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
