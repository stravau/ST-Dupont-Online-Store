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

export const { handlers, auth, signIn, signOut } = NextAuth({
  // JWT session — no DB session table writes per request, faster on
  // serverless. The session payload carries id + role so middleware
  // can authorise without an extra DB roundtrip.
  session: { strategy: "jwt" },
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
        const user = await prisma.user.findUnique({
          where: { email },
          select: { id: true, email: true, name: true, role: true, passwordHash: true },
        });
        if (!user || !user.passwordHash) return null;
        const ok = await bcrypt.compare(password, user.passwordHash);
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
