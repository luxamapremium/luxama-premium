import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import client, { getAuthDb } from "../db-client";
import { verificationEmail } from "../email/Better-auth/verificationEmail";
import { resetPasswordEmail } from "../email/Better-auth/resetPasswordEmail";
import { admin as adminPlugin } from "better-auth/plugins";
import { ac, userRole, adminRole, superAdminRole } from "./permission";

export const auth = betterAuth({
  database: mongodbAdapter(getAuthDb()),
  plugins: [
    adminPlugin({
      ac,
      roles: {
        user: userRole,
        admin: adminRole,
        "super-admin": superAdminRole,
      },
      adminRoles: ["admin", "super-admin"],
      defaultRole: "user",
    }),
  ],

  session: {
    cookieCache: {
      enabled: true,
      strategy: "jwt",
      maxAge: 7 * 24 * 60 * 60,
    },
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
      },
    },
    deleteUser: {
      enabled: true,
    },
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await resetPasswordEmail({ user, url });
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      await verificationEmail({ user, url });
    },
  },

  passwordReset: {
    enabled: true,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
});
