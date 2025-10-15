import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { supabaseServer } from "@/lib/supabase-server";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    async signIn({ user, account }) {
      try {
        const supabase = supabaseServer();
        const googleId =
          account?.provider === "google" ? account.providerAccountId : null;

        if (!user?.email) {
          console.error("No email provided for user");
          return false;
        }

        // Check if user exists by email
        const { data: existing, error: selectErr } = await supabase
          .from("users")
          .select("id")
          .eq("email", user.email)
          .maybeSingle();

        if (selectErr) {
          console.error("Supabase select user error:", selectErr.message);
          return false; // Block sign in on database error
        }

        if (!existing) {
          // Create new user
          const insertPayload = {
            email: user.email,
            name: user.name ?? null,
            image: (user.image as string | null | undefined) ?? null,
            google_id: googleId,
          };

          const { error: insertErr } = await supabase
            .from("users")
            .insert(insertPayload);

          if (insertErr) {
            console.error("Supabase insert user error:", insertErr.message);
            return false; // Block sign in if user creation fails
          }

          console.log("New user created:", user.email);
        }

        return true; // Allow sign in to proceed
      } catch (err) {
        console.error("Unexpected error in signIn callback:", err);
        return false; // Block sign in on unexpected errors
      }
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnSignIn = nextUrl.pathname.startsWith("/signin");

      if (isOnSignIn) {
        if (isLoggedIn) return Response.redirect(new URL("/", nextUrl));
        return true;
      }

      return isLoggedIn;
    },
  },
});
