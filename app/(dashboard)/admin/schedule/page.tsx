"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { DayScheduleGrid } from "@/app/(dashboard)/components/schedule/DayScheduleGrid";
import {
  getAdminSchedules,
  addTimeSlot,
  removeTimeSlot,
  updateTimeSlot,
  toggleTimeSlotStatus,
} from "@/app/actions/scheduleAction";
import { DAYS_OF_WEEK } from "@/lib/constants/days_of_week";
import { TimezoneForm } from "../../components/timezone/TimezoneForm";

interface TimeSlot {
  startTime: string;
  endTime: string;
  isEnabled: boolean;
}

interface Schedule {
  _id: string;
  dayOfWeek: string;
  timeSlots: TimeSlot[];
}

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<Map<string, Schedule>>(new Map());
  const [isLoading, setIsLoading] = useState(false);

  const loadSchedules = async () => {
    setIsLoading(true);
    try {
      const result = await getAdminSchedules();
      if (result.success && result.data) {
        const scheduleMap = new Map();

        result.data.forEach((schedule: any) => {
          // Ensure timeSlots is always an array
          const timeSlots = Array.isArray(schedule.timeSlots)
            ? schedule.timeSlots
            : [];

          scheduleMap.set(schedule.dayOfWeek, {
            _id: schedule._id,
            dayOfWeek: schedule.dayOfWeek,
            timeSlots: timeSlots.map((slot: any) => ({
              startTime: slot.startTime,
              endTime: slot.endTime,
              isEnabled: slot.isEnabled ?? true,
            })),
          });
        });

        setSchedules(scheduleMap);
      } else {
        toast.error(result.error || "Failed to load schedules");
      }
    } catch (error) {
      console.error("Error loading schedules:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, []);

  const handleAddSlot = async (dayOfWeek: string, timeSlot: TimeSlot) => {
    setIsLoading(true);
    try {
      const result = await addTimeSlot(dayOfWeek, timeSlot);
      if (result.success) {
        toast.success("Time slot added successfully");
        await loadSchedules();
      } else {
        toast.error(result.error || "Failed to add time slot");
      }
    } catch (error) {
      console.error("Error adding slot:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSlot = async (
    dayOfWeek: string,
    index: number,
    timeSlot: TimeSlot,
  ) => {
    setIsLoading(true);
    try {
      const result = await updateTimeSlot(dayOfWeek, index, timeSlot);
      if (result.success) {
        toast.success("Time slot updated successfully");
        await loadSchedules();
      } else {
        toast.error(result.error || "Failed to update time slot");
      }
    } catch (error) {
      console.error("Error updating slot:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveSlot = async (dayOfWeek: string, index: number) => {
    setIsLoading(true);
    try {
      const result = await removeTimeSlot(dayOfWeek, index);
      if (result.success) {
        toast.success("Time slot removed successfully");
        await loadSchedules();
      } else {
        toast.error(result.error || "Failed to remove time slot");
      }
    } catch (error) {
      console.error("Error removing slot:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSlot = async (
    dayOfWeek: string,
    index: number,
    isEnabled: boolean,
  ) => {
    setIsLoading(true);
    try {
      const result = await toggleTimeSlotStatus(dayOfWeek, index, isEnabled);
      if (result.success) {
        toast.success(
          `Time slot ${isEnabled ? "enabled" : "disabled"} successfully`,
        );
        await loadSchedules();
      } else {
        toast.error(result.error || "Failed to toggle time slot");
      }
    } catch (error) {
      console.error("Error toggling slot:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && schedules.size === 0) {
    return (
      <div className="flex items-center justify-center mx-auto min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 bg-background font-sans">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-navy-900 font-sans">Schedule Management</h1>
          <p className="text-muted-foreground mt-1 font-sans">
            Manage your availability by adding multiple time slots for each day
          </p>
        </div>
        <TimezoneForm />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {DAYS_OF_WEEK.map((day) => {
          const schedule = schedules.get(day);
          const timeSlots = schedule?.timeSlots || [];

          return (
            <DayScheduleGrid
              key={day}
              dayOfWeek={day}
              timeSlots={timeSlots}
              onAddSlot={(slot) => handleAddSlot(day, slot)}
              onUpdateSlot={(index, slot) => handleUpdateSlot(day, index, slot)}
              onRemoveSlot={(index) => handleRemoveSlot(day, index)}
              onToggleSlot={(index, isEnabled) =>
                handleToggleSlot(day, index, isEnabled)
              }
              isLoading={isLoading}
            />
          );
        })}
      </div>
    </div>
  );
}
