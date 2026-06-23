// Auth.js v5 — admin-only credentials login.
//
// The schema's User table already carries (email, passwordHash, role).
// Customers register through the storefront (not yet wired); the only
// flow this file unlocks today is admin login so `npm run admin:bootstrap`
// can create the first ADMIN and `/admin/*` can gate on session.role.

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { lockoutExpiresAt, recordAttempt } from "@/lib/login-lockout";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // JWT session — no DB session table writes per request, faster on
  // serverless. The session payload carries id + role so middleware
  // can authorise without an extra DB roundtrip. 8h maxAge — boutique
  // shifts run a working day; admins idle past then re-authenticate.
  // Default was 30 days, which is too long for a shared admin laptop.
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60,
    updateAge: 60 * 60, // refresh JWT once an hour while the admin is active
  },
  // Explicit cookie config — relying on defaults is brittle as Auth.js
  // versions drift. httpOnly + SameSite=Lax + Secure-in-production
  // matches what we want for an admin-only flow.
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production"
        ? "__Secure-authjs.session-token"
        : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  pages: { signIn: "/admin/login" },
  providers: [
    Credentials({
      name: "Admin",
      credentials: {
        email:    { label: "Email",    type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        const email = String(creds?.email ?? "").toLowerCase().trim();
        const password = String(creds?.password ?? "");
        if (!email || !password) return null;

        // Lockout shield — once an email has failed N times in the
        // last M minutes we refuse further attempts for L minutes.
        // Returning null here makes Auth.js raise the standard
        // "Invalid credentials" error; the lockout window will keep
        // refusing until it expires regardless of password correctness.
        const locked = await lockoutExpiresAt(email);
        if (locked) {
          await recordAttempt(email, false);
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email },
          select: { id: true, email: true, name: true, role: true, passwordHash: true },
        });
        if (!user || !user.passwordHash) {
          await recordAttempt(email, false);
          return null;
        }
        const ok = await bcrypt.compare(password, user.passwordHash);
        await recordAttempt(email, ok);
        if (!ok) return null;
        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as { id: string }).id;
        token.role = (user as { role: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string | undefined;
        (session.user as { role?: string }).role = token.role as string | undefined;
      }
      return session;
    },
    // Authorisation gate — middleware.ts delegates here. Returns true
    // when the route should be allowed, false to redirect to signIn.
    async authorized({ auth: session, request }) {
      const { pathname } = request.nextUrl;
      const isAdminPath = pathname.startsWith("/admin");
      const isLoginPath = pathname === "/admin/login";
      if (!isAdminPath || isLoginPath) return true;
      // /admin/* requires an ADMIN session
      return Boolean(session?.user && (session.user as { role?: string }).role === "ADMIN");
    },
  },
});
