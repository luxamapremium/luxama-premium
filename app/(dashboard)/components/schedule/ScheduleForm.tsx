"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { DAYS_OF_WEEK } from "@/lib/constants/days_of_week";
import { scheduleSchema, type ScheduleFormData } from "@/lib/schemas/schedule.schema";

interface ScheduleFormProps {
  initialData?: ScheduleFormData & { id?: string };
  onSubmit: (data: ScheduleFormData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export function ScheduleForm({ initialData, onSubmit, onCancel, isLoading }: ScheduleFormProps) {
  const form = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      dayOfWeek: initialData?.dayOfWeek || DAYS_OF_WEEK[0],
      timeSlots: initialData?.timeSlots || [
        {
          startTime: "09:00",
          endTime: "17:00",
          isEnabled: true,
        },
      ],
    },
  });

  const handleSubmit = async (data: ScheduleFormData) => {
    console.log("Submitting schedule data:", data); // Debug log
    await onSubmit(data);
    if (!initialData) {
      form.reset({
        dayOfWeek: DAYS_OF_WEEK[0],
        timeSlots: [
          {
            startTime: "09:00",
            endTime: "17:00",
            isEnabled: true,
          },
        ],
      });
    }
  };

  const startTime = form.watch("timeSlots.0.startTime");
  const endTime = form.watch("timeSlots.0.endTime");

  return (
    <Card className="w-full font-sans border-border bg-card shadow-luxury-sm">
      <CardHeader>
        <CardTitle className="font-sans text-navy-900">{initialData ? "Edit Schedule" : "Add New Schedule"}</CardTitle>
        <CardDescription className="font-sans">
          {initialData 
            ? "Update your availability for this day" 
            : "Set your availability for a specific day of the week"}
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="dayOfWeek"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Day of Week</FormLabel>
                  <Select
                    disabled={!!initialData}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a day" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DAYS_OF_WEEK.map((day) => (
                        <SelectItem key={day} value={day}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {initialData && "Day cannot be changed after creation"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="timeSlots.0.startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                       <Input
                        type="time"
                        className="pl-9"
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timeSlots.0.endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                        type="time"
                        className="pl-9"
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="timeSlots.0.isEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Enable Schedule</FormLabel>
                    <FormDescription>
                      When disabled, this time slot won't be available for bookings
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="font-sans"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-navy-900 hover:bg-navy-800 text-gold-300 font-sans shadow-luxury-sm cursor-pointer"
            >
              {isLoading ? "Saving..." : initialData ? "Update" : "Create"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}