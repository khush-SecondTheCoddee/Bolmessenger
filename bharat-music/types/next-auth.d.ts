import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: string;
    displayName?: string | null;
    status: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      displayName?: string | null;
      status: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    displayName?: string | null;
    status: string;
  }
}
