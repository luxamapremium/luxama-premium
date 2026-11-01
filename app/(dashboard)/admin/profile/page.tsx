"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, ProfileType } from "@/lib/schemas/profile.schema";
import { useForm, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/auth-client";
import { useEffect, useState } from "react";
import {
  FiEdit2,
  FiX,
  FiCamera,
  FiTrash2,
  FiUser,
  FiMail,
  FiLock,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { CldUploadWidget } from "next-cloudinary";
import { useRouter } from "next/navigation";

export default function UpdateProfile() {
  const { data: session, isPending, refetch } = authClient.useSession();
  const [editingField, setEditingField] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  const form = useForm<ProfileType>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      image: "",
      currentPassword: "",
      newPassword: "",
    },
  });

  useEffect(() => {
    if (session?.user) {
      const [fName, ...lNames] = (session.user.name || "").split(" ");
      form.reset({
        firstName: fName || "",
        lastName: lNames.join(" ") || "",
        email: session.user.email || "",
        image: session.user.image || "",
        currentPassword: "",
        newPassword: "",
      });
    }
  }, [session, form]);

  async function onSubmit(values: ProfileType) {
    try {
      setIsUpdating(true);

      // 1. Update Profile Info
      const { error: profileError } = await authClient.updateUser({
        name: `${values.firstName} ${values.lastName}`,
        image: values.image,
      });

      if (profileError) throw new Error(profileError.message);

      // 2. Handle Password Change if fields are filled
      if (values.currentPassword && values.newPassword) {
        const { error: passError } = await authClient.changePassword({
          newPassword: values.newPassword,
          currentPassword: values.currentPassword,
          revokeOtherSessions: true,
        });

        if (passError) throw new Error(passError.message);
        toast.success("Password updated successfully!");
      }

      await refetch();

      // Clear password fields after success
      form.setValue("currentPassword", "");
      form.setValue("newPassword", "");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setIsUpdating(false);
    }
  }

  const handleDeleteProfile = async () => {
    if (!confirm("Are you sure? This action is permanent.")) return;
    try {
      const { error } = await authClient.deleteUser();
      if (error) throw error;
      toast.success("Account deleted");
      router.push("/auth/sign-in");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete profile");
    }
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-navy-900 font-sans">Account Settings</h1>
        <p className="text-muted-foreground mt-1 font-sans">
          Manage your profile information and account security.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 font-sans">
        {/* AVATAR SECTION */}
        <section className="bg-card border border-border rounded-2xl p-6 shadow-luxury-sm">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Controller
              control={form.control}
              name="image"
              render={({ field }) => (
                <div className="relative group">
                  <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-background ring-1 ring-border shadow-inner bg-muted flex items-center justify-center">
                    {field.value ? (
                      <img
                        src={field.value}
                        alt="Profile"
                        className="w-full h-full object-contain transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <FiUser className="w-10 h-10 text-muted-foreground" />
                    )}
                  </div>

                  <CldUploadWidget
                    signatureEndpoint="/api/upload-image"
                    onSuccess={(result: any) => {
                      const url = result?.info?.secure_url;
                      if (url)
                        form.setValue("image", url, { shouldDirty: true });
                    }}
                  >
                    {({ open }) => (
                      <button
                        type="button"
                        onClick={() => open()}
                        className="absolute bottom-0 right-0 p-2.5 bg-navy-900 text-gold-300 rounded-full shadow-luxury-sm hover:bg-navy-800 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                      >
                        <FiCamera className="w-4 h-4" />
                      </button>
                    )}
                  </CldUploadWidget>
                </div>
              )}
            />
            <div className="text-center sm:text-left">
              <h3 className="font-semibold text-lg font-sans text-navy-900">Profile Photo</h3>
              <p className="text-sm text-muted-foreground font-sans">
                JPG, GIF or PNG. Max size of 2MB.
              </p>
            </div>
          </div>
        </section>

        {/* PROFILE FIELDS SECTION */}
        <section className="bg-card border border-border rounded-2xl p-6 shadow-luxury-sm space-y-6">
          <h3 className="font-semibold text-lg border-b border-border pb-2 font-sans text-navy-900">
            Personal Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <ProfileField
              name="firstName"
              label="First Name"
              control={form.control}
              isEditing={editingField === "firstName"}
              setEditing={setEditingField}
              icon={<FiUser className="w-4 h-4" />}
            />
            <ProfileField
              name="lastName"
              label="Last Name"
              control={form.control}
              isEditing={editingField === "lastName"}
              setEditing={setEditingField}
              icon={<FiUser className="w-4 h-4" />}
            />
          </div>

          <div className="pt-2">
            <label className="text-sm font-medium mb-1.5 block font-sans text-navy-900">
              Email Address
            </label>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-ice-50/50 border border-border text-muted-foreground cursor-not-allowed font-sans">
              <FiMail className="w-4 h-4" />
              <span className="text-sm">{form.getValues("email")}</span>
            </div>
          </div>
        </section>

        {/* PASSWORD SECTION */}
        <section className="bg-card border border-border rounded-2xl p-6 shadow-luxury-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <FiLock className="text-gold-600" />
            <h3 className="font-semibold text-lg font-sans text-navy-900">Security</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-medium font-sans text-navy-900">Current Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                {...form.register("currentPassword")}
                className="h-10 shadow-sm font-sans"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium font-sans text-navy-900">New Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                {...form.register("newPassword")}
                className="h-10 shadow-sm font-sans"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground italic font-sans">
            Leave password fields blank if you don't want to change it.
          </p>
        </section>

        {/* ACTION BAR */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 py-4 border-t border-border">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              className="flex-1 sm:flex-none font-sans"
              onClick={() => {
                form.reset();
                setEditingField(null);
              }}
            >
              Reset
            </Button>
            <Button
              type="submit"
              className="flex-1 sm:flex-none min-w-[120px] bg-navy-900 hover:bg-navy-800 text-gold-300 font-sans shadow-luxury-sm cursor-pointer"
              disabled={isUpdating || !form.formState.isDirty}
            >
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

function ProfileField({
  name,
  label,
  control,
  isEditing,
  setEditing,
  icon,
}: any) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className="space-y-1.5 font-sans">
          <label className="text-sm font-medium font-sans text-navy-900">{label}</label>
          {isEditing ? (
            <div className="flex gap-2 animate-in fade-in zoom-in-95 duration-200">
              <Input {...field} autoFocus className="h-10 shadow-sm font-sans" />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="shrink-0 border border-border"
                onClick={() => setEditing(null)}
              >
                <FiX className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div
              onClick={() => setEditing(name)}
              className="flex items-center justify-between px-3 h-10 rounded-lg border border-border bg-background hover:border-gold-500/50 hover:bg-ice-50/50 transition-all cursor-pointer group font-sans"
            >
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground group-hover:text-gold-600">
                  {icon}
                </span>
                <span className="text-sm font-medium text-navy-900 font-sans">
                  {field.value || "Not set"}
                </span>
              </div>
              <FiEdit2 className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
          {fieldState.invalid && (
            <p className="text-xs text-destructive mt-1">
              {fieldState.error?.message}
            </p>
          )}
        </div>
      )}
    />
  );
}
