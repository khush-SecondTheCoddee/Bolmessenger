"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isActive = (path: string) => pathname === path;

  return (
    <div className="w-64 bg-secondary h-full flex flex-col p-6">
      <Link href="/" className="mb-8">
        <h1 className="text-2xl font-bold text-primary">Bharat Music</h1>
      </Link>

      <nav className="flex-1 space-y-2">
        <Link
          href="/"
          className={`block px-4 py-3 rounded-md transition ${
            isActive("/")
              ? "bg-lightGray text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Home
        </Link>

        <Link
          href="/search"
          className={`block px-4 py-3 rounded-md transition ${
            isActive("/search")
              ? "bg-lightGray text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Search
        </Link>

        {session?.user.role === "ADMIN" && (
          <Link
            href="/admin"
            className={`block px-4 py-3 rounded-md transition ${
              isActive("/admin")
                ? "bg-lightGray text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Admin Panel
          </Link>
        )}

        {session?.user.role === "DISTRIBUTOR" && (
          <Link
            href="/distributor"
            className={`block px-4 py-3 rounded-md transition ${
              isActive("/distributor")
                ? "bg-lightGray text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Distributor Panel
          </Link>
        )}
      </nav>

      <div className="border-t border-gray-700 pt-4">
        {session ? (
          <>
            <Link
              href="/settings"
              className={`block px-4 py-3 rounded-md transition ${
                isActive("/settings")
                  ? "bg-lightGray text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Settings
            </Link>
            <Link
              href="/api/auth/signout"
              className="block px-4 py-3 rounded-md text-gray-400 hover:text-white transition"
            >
              Sign Out
            </Link>
          </>
        ) : (
          <Link
            href="/login"
            className="block px-4 py-3 rounded-md text-gray-400 hover:text-white transition"
          >
            Sign In
          </Link>
        )}
      </div>
    </div>
  );
}
