"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { eventSchema, EventFormData } from "@/lib/schemas/event.schema";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { EVENTS_CATEGORIES } from "@/lib/constants/event-categories";

interface EventFormProps {
  initialData?: EventFormData & { _id?: string };
  onSubmit: (data: EventFormData) => Promise<void>;
  isSubmitting: boolean;
}

export function EventForm({
  initialData,
  onSubmit,
  isSubmitting,
}: EventFormProps) {
  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: initialData?.name ?? "Immigration & USCIS Support",
      description: initialData?.description ?? "",
      isFree: initialData?.isFree ?? false,
      price: initialData?.price ?? 0,
      durationMinutes: initialData?.durationMinutes ?? 30,
      bufferMinutes: initialData?.bufferMinutes ?? 10,
      minimumNoticeMinutes: initialData?.minimumNoticeMinutes ?? 60,
      isActive: initialData?.isActive ?? true,
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-3xl mx-auto space-y-4"
      >
        <Card className="overflow-hidden border-border font-sans">
          <CardHeader className="bg-ice-50 pb-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg font-semibold font-sans text-navy-900">
                  Service Details
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Configure your meeting availability and pricing.
                </p>
              </div>

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center space-y-0 bg-background px-2 py-1.5 rounded-full border shadow-sm">
                    <FormLabel className="text-[10px] uppercase tracking-wider font-bold">
                      Active
                    </FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="scale-75 cursor-pointer data-[state=checked]:bg-emerald-500"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </CardHeader>

          <CardContent className="grid gap-4 pt-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent position="popper" align="start">
                      {EVENTS_CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What is this meeting about?"
                      className="resize-none min-h-20 bg-background"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isFree"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-dashed">
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm font-medium">
                      Free Consultation
                    </FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Clients won&apos;t be charged for this service
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        if (checked) {
                          form.setValue("price", 0);
                        }
                      }}
                      className="cursor-pointer data-[state=checked]:bg-emerald-500"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder={form.watch("isFree") ? "Free" : "0.00"}
                      {...field}
                      value={field.value as number | string}
                      disabled={form.watch("isFree")}
                      className={form.watch("isFree") ? "opacity-50" : ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-3 p-3 rounded-lg bg-muted/20 border border-dashed">
              <FormField
                control={form.control}
                name="durationMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Duration (min)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value as number | string}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bufferMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Buffer (min)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value as number | string}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="minimumNoticeMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Notice (min)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value as number | string}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-navy-900 hover:bg-navy-800 text-gold-300 font-sans shadow-luxury-sm cursor-pointer"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : initialData ? (
                  "Save Changes"
                ) : (
                  "Create Event"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
