"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { EventCard } from "../../components/events/EventCard";
import { deleteEvent } from "../../../actions/eventAction";
import { toast } from "sonner";

interface EventsClientProps {
  initialEvents: any[];
}

export function EventsClient({ initialEvents }: EventsClientProps) {
  const router = useRouter();
  const [events, setEvents] = useState(initialEvents);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await deleteEvent(id);
      setEvents(events.filter((event) => event._id !== id));
      toast.success("Event deleted successfully");
      router.refresh();
    } catch (error) {
      toast.error("Failed to delete event");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 bg-background font-sans">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-navy-900 font-sans">Services</h1>
          <p className="text-muted-foreground mt-2 font-sans">
            Manage your service types
          </p>
        </div>
        <Button
          className="bg-navy-900 hover:bg-navy-800 text-gold-300 font-sans cursor-pointer shadow-luxury-sm"
          onClick={() => router.push("/admin/events/new")}
        >
          <Plus className="h-4 w-4 mr-1" />
          New Service
        </Button>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-border rounded-lg bg-card">
          <h3 className="text-lg font-semibold mb-2 text-navy-900 font-sans">No services yet</h3>
          <p className="text-muted-foreground mb-6 font-sans">
            Create your first service to start accepting bookings
          </p>
          <Button
            className="bg-navy-900 hover:bg-navy-800 text-gold-300 font-sans cursor-pointer shadow-luxury-sm"
            onClick={() => router.push("/admin/events/new")}
          >
            <Plus className="h-4 w-4 mr-1" />
            Create Service
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              onDelete={handleDelete}
              isDeleting={deletingId === event._id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
