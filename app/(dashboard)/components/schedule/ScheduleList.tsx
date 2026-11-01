"use client";

import { useState } from "react";
import { Edit2, Trash2, Power, PowerOff, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Schedule {
  _id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isEnabled: boolean;
}

interface ScheduleListProps {
  schedules: Schedule[];
  onEdit: (schedule: Schedule) => void;
  onDelete: (id: string) => Promise<void>;
  onToggle: (id: string, isEnabled: boolean) => Promise<void>;
  isLoading: boolean;
}

export function ScheduleList({ schedules, onEdit, onDelete, onToggle, isLoading }: ScheduleListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (deleteId) {
      await onDelete(deleteId);
      setDeleteId(null);
    }
  };

  const getStatusBadge = (isEnabled: boolean) => {
    return isEnabled ? (
      <Badge variant="default" className="bg-navy-900 text-gold-400 border border-gold-500/20 font-sans">
        Active
      </Badge>
    ) : (
      <Badge variant="secondary" className="font-sans">Disabled</Badge>
    );
  };

  if (schedules.length === 0) {
    return (
      <Card className="font-sans border-border bg-card shadow-luxury-sm">
        <CardContent className="flex flex-col items-center justify-center py-12 font-sans">
          <p className="text-muted-foreground mb-4 font-sans">No schedules set up yet</p>
          <p className="text-sm text-muted-foreground font-sans">
            Click the "Add Schedule" button to set your availability
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="font-sans border-border bg-card shadow-luxury-sm">
        <CardHeader>
          <CardTitle className="font-sans text-navy-900">Your Schedule</CardTitle>
          <CardDescription className="font-sans">
            Manage your weekly availability schedule
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Day</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>End Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.map((schedule) => (
                <TableRow key={schedule._id}>
                  <TableCell className="font-medium">
                    {schedule.dayOfWeek}
                  </TableCell>
                  <TableCell>{schedule.startTime}</TableCell>
                  <TableCell>{schedule.endTime}</TableCell>
                  <TableCell>{getStatusBadge(schedule.isEnabled)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onToggle(schedule._id, !schedule.isEnabled)}
                        disabled={isLoading}
                        title={schedule.isEnabled ? "Disable" : "Enable"}
                      >
                        {schedule.isEnabled ? (
                          <PowerOff className="h-4 w-4" />
                        ) : (
                          <Power className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(schedule)}
                        disabled={isLoading}
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(schedule._id)}
                        disabled={isLoading}
                        title="Delete"
                        className="text-destructive hover:text-destructive/80 font-sans"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="font-sans">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-sans text-navy-900">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="font-sans">
              This action cannot be undone. This will permanently delete the schedule
              for this day.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-sans">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 font-sans">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}