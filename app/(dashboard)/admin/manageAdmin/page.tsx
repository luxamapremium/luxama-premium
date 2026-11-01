"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserPlus, Users, Settings } from "lucide-react";
import CreateAdminForm from "../../components/manageAdmin/CreateAdminForm";
import DisplayAdmin from "../../components/manageAdmin/DisplayAdmin";
import { useState } from "react";

export default function ManageAdmin() {

  const [tab, setTab] = useState("view");

  return (
    <div className="bg-background p-4 md:p-10 mx-auto w-full font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Section */}
        <header className="flex flex-col gap-2 border-b border-border pb-6">
          <div className="flex items-center gap-2 text-gold-600">
            <Settings className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-wider font-sans">
              System Auth
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-navy-900 font-sans">
            Team Management
          </h1>
          <p className="text-muted-foreground text-base md:text-lg font-sans">
            Create, monitor, and remove administrative privileges across your
            team.
          </p>
        </header>

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-2 shadow-luxury-sm border border-border">
              <TabsTrigger
                value="view"
                className="flex items-center gap-2 cursor-pointer font-sans"
              >
                <Users className="w-4 h-4" /> View List
              </TabsTrigger>
              <TabsTrigger
                value="create"
                className="flex items-center gap-2 cursor-pointer font-sans"
              >
                <UserPlus className="w-4 h-4" /> Add Member
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="view" className="mt-0 outline-none">
            <Card className="border border-border shadow-luxury-sm bg-card overflow-hidden font-sans">
              <CardContent className="p-0">
                <DisplayAdmin />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create" className="mt-0 outline-none">
            <Card className="max-w-2xl mx-auto border border-border shadow-luxury-sm bg-card font-sans">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-sans text-navy-900">Create Team Member</CardTitle>
                <CardDescription className="font-sans">
                  Setup a new profile. They will receive access immediately.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CreateAdminForm onSuccess={() => setTab("view")} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
