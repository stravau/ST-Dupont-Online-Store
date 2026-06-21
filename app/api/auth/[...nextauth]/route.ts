// NextAuth route handlers — credentials login / sign-out / session
// endpoints all live under /api/auth/* and dispatch from here.
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
