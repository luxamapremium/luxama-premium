"use client";

import { useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { timezoneSchema } from "@/lib/schemas/timezone.schema";
import { TIMEZONES } from "@/lib/constants/time-zones";
import {
  setAdminTimezone,
  getAdminTimezone,
} from "@/app/actions/timezoneAction";

import {
  Form,
  FormControl,
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
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type FormData = {
  timezone: string;
};

export function TimezoneForm() {
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormData>({
    resolver: zodResolver(timezoneSchema),
    defaultValues: {
      timezone: "",
    },
  });

  useEffect(() => {
    const fetchTimezone = async () => {
      try {
        const timezone = await getAdminTimezone();

        form.reset({ timezone });
      } catch (error) {
        console.log("No time yet");
      }
    };
    fetchTimezone();
  }, [form]);

  const onSubmit = (data: FormData) => {
    startTransition(async () => {
      try {
        const result = await setAdminTimezone(data.timezone);

        if (result.success) {
          toast.success("Timezone updated successfully");
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to update timezone");
      }
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 p-4 border border-border rounded-lg bg-card font-sans shadow-luxury-sm"
      >
        <FormField
          control={form.control}
          name="timezone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-sans text-navy-900">Select Timezone</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={isPending}
              >
                <FormControl>
                  <SelectTrigger className="cursor-pointer font-sans">
                    <SelectValue placeholder="Select a timezone" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent position="popper" className="font-sans">
                  {TIMEZONES.map((tz) => (
                    <SelectItem className="cursor-pointer font-sans" key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full bg-navy-900 cursor-pointer hover:bg-navy-800 text-gold-300 font-sans shadow-luxury-sm"
          disabled={isPending}
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </Form>
  );
}
