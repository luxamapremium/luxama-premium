"use client";

import { useEffect, useState } from "react";
import { getAdmins } from "@/app/actions/public/adminAction";
import { deleteAdmin } from "@/app/actions/manageAdminsAction";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, Users } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Admin {
  _id: string;
  name: string;
  image?: string;
  email?: string;
}

export default function DisplayAdmin() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchAdmins = async () => {
    try {
      const result = await getAdmins();
      if (result.success && result.data) {
        setAdmins(result.data as unknown as Admin[]);
      } else {
        setError(result.error || "Failed to load admins.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleDelete = async (userId: string) => {
    setDeletingId(userId);
    try {
      const result = await deleteAdmin(userId);
      if (result.success) {
        setAdmins((prev) => prev.filter((admin) => admin._id !== userId));
      }
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4 font-sans">
        <Loader2 className="h-10 w-10 animate-spin text-gold-500" />
        <p className="text-muted-foreground font-medium animate-pulse font-sans">
          Synchronizing database...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full font-sans">
      <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-ice-50/70">
        <h3 className="font-bold text-navy-900 font-sans">Team</h3>
        <span className="text-xs font-bold text-navy-900 bg-ice-100 px-2.5 py-1 rounded-full border border-ice-200 font-sans">
          {admins.length} ACTIVE
        </span>
      </div>

      <Table>
        <TableHeader className="bg-ice-50/40">
          <TableRow>
            <TableHead className="pl-6 py-4 font-semibold text-navy-900 font-sans">
              Member
            </TableHead>
            <TableHead className="hidden md:table-cell font-semibold text-navy-900 font-sans">
              ID Reference
            </TableHead>
            <TableHead className="text-right pr-6 font-semibold text-navy-900 font-sans">
              Manage
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {admins.map((admin) => (
            <TableRow
              key={admin._id}
              className="group hover:bg-ice-50/50 transition-colors"
            >
              <TableCell className="pl-6 py-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10 border border-border shadow-sm group-hover:scale-105 transition-transform">
                    <AvatarImage
                      className="object-cover object-top"
                      src={admin.image}
                      alt={admin.name}
                    />
                    <AvatarFallback className="bg-ice-200 text-navy-900 font-bold font-sans">
                      {admin.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-bold text-navy-900 font-sans">
                      {admin.name}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <code className="text-[10px] bg-ice-100 px-2 py-1 rounded text-muted-foreground font-sans uppercase">
                  {admin._id.slice(-8)}
                </code>
              </TableCell>
              <TableCell className="text-right pr-6">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all rounded-full cursor-pointer"
                      disabled={deletingId === admin._id}
                    >
                      {deletingId === admin._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-2xl font-sans">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-sans text-navy-900">Revoke Access?</AlertDialogTitle>
                      <AlertDialogDescription className="font-sans">
                        This will permanently remove{" "}
                        <span className="font-bold text-navy-900 font-sans">
                          {admin.name}
                        </span>
                        . They will immediately lose all administrative
                        capabilities.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 sm:gap-0 md:gap-2">
                      <AlertDialogCancel className="rounded-xl cursor-pointer font-sans">
                        Keep Member
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(admin._id)}
                        className="bg-destructive hover:bg-destructive/90 rounded-xl cursor-pointer font-sans"
                      >
                        Revoke Access
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {admins.length === 0 && (
        <div className="p-20 text-center font-sans">
          <div className="inline-flex p-4 bg-ice-100 rounded-full mb-4">
            <Users className="w-8 h-8 text-ice-200" />
          </div>
          <p className="text-muted-foreground font-medium font-sans">No administrators found.</p>
          <p className="text-sm text-muted-foreground font-sans">
            Switch to the 'Add Member' tab to get started.
          </p>
        </div>
      )}
    </div>
  );
}
