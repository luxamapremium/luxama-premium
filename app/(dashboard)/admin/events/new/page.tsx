"use client";

import { useRouter } from "next/navigation";
import { EventForm } from "../../../components/events/EventForm";
import { createEvent } from "../../../../actions/eventAction";
import { toast } from "sonner";
import { useState } from "react";
import { EventFormData } from "@/lib/schemas/event.schema";

export default function NewEventPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: EventFormData) => {
    try {
      setIsSubmitting(true);
      await createEvent(data);
      toast.success("Event created successfully");
      router.push("/admin/events");
      router.refresh();
    } catch (error) {
      toast.error("Failed to create event");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 bg-background font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy-900 font-sans">Create New Event</h1>
        <p className="text-muted-foreground mt-2 font-sans">
          Create a new service type for your calendar
        </p>
      </div>
      <EventForm onSubmit={onSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}
