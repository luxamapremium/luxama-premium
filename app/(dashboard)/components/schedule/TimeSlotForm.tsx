"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { timeSlotSchema, TimeSlotFormValues } from "@/lib/schemas/timeSlot.schema";

interface TimeSlotFormProps {
  onSubmit: (data: TimeSlotFormValues) => Promise<void>;
  onCancel?: () => void;
  initialData?: TimeSlotFormValues;
  isLoading: boolean;
}

export function TimeSlotForm({ onSubmit, onCancel, initialData, isLoading }: TimeSlotFormProps) {
  const form = useForm<TimeSlotFormValues>({
    resolver: zodResolver(timeSlotSchema),
    defaultValues: initialData || {
      startTime: "09:00",
      endTime: "17:00",
      isEnabled: true,
    },
  });

  const handleSubmit = async (data: TimeSlotFormValues) => {
    console.log("Submitting time slot data:", data);
    await onSubmit(data);
    if (!initialData) {
      form.reset({
        startTime: "09:00",
        endTime: "17:00",
        isEnabled: true,
      });
    }
  };

  return (
    <Card className="border border-border font-sans bg-card">
      <CardContent className="pt-6 font-sans">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-sans text-navy-900">Start Time</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="time"
                          className="pl-9 font-sans"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-sans text-navy-900">End Time</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="time"
                          className="pl-9 font-sans"
                          {...field}
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
              name="isEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-3 font-sans">
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm font-sans text-navy-900">Enable this time slot</FormLabel>
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

            <div className="flex justify-end space-x-2 pt-2">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                  className="font-sans"
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-navy-900 hover:bg-navy-800 text-gold-300 font-sans shadow-luxury-sm cursor-pointer"
              >
                {isLoading ? "Saving..." : initialData ? "Update" : "Add Slot"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}