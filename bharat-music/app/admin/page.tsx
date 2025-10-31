"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import UserBadge from "@/components/UserBadge";

interface User {
  id: string;
  email: string;
  name: string;
  displayName: string | null;
  role: string;
  status: string;
  createdAt: string;
}

interface Song {
  id: string;
  title: string;
  artist: {
    name: string;
    displayName: string | null;
  };
  albumName: string | null;
  status: string;
  uploadedBy: {
    name: string;
    email: string;
  };
  createdAt: string;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"distributors" | "songs">("distributors");
  const [distributors, setDistributors] = useState<User[]>([]);
  const [pendingSongs, setPendingSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "ADMIN") {
      fetchData();
    }
  }, [status, session]);

  const fetchData = async () => {
    try {
      const [distResponse, songsResponse] = await Promise.all([
        fetch("/api/admin/distributors"),
        fetch("/api/admin/songs/pending"),
      ]);

      if (distResponse.ok) {
        const data = await distResponse.json();
        setDistributors(data);
      }

      if (songsResponse.ok) {
        const data = await songsResponse.json();
        setPendingSongs(data);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDistributorAction = async (userId: string, action: "APPROVED" | "REJECTED") => {
    try {
      const response = await fetch("/api/admin/distributors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status: action }),
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Failed to update distributor:", error);
    }
  };

  const handleSongAction = async (songId: string, action: "APPROVED" | "REJECTED") => {
    try {
      const response = await fetch("/api/admin/songs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ songId, status: action }),
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Failed to update song:", error);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (session?.user?.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="h-screen flex bg-dark">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Admin Panel
            <UserBadge role="ADMIN" size={28} />
          </h1>
          <p className="text-gray-400">Manage distributors and approve songs</p>
        </div>

        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab("distributors")}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === "distributors"
                ? "bg-primary text-white"
                : "bg-lightGray text-gray-400 hover:text-white"
            }`}
          >
            Distributor Requests ({distributors.filter(d => d.status === "PENDING").length})
          </button>
          <button
            onClick={() => setActiveTab("songs")}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === "songs"
                ? "bg-primary text-white"
                : "bg-lightGray text-gray-400 hover:text-white"
            }`}
          >
            Pending Songs ({pendingSongs.length})
          </button>
        </div>

        {activeTab === "distributors" && (
          <div className="space-y-4">
            {distributors.filter(d => d.status === "PENDING").length === 0 ? (
              <div className="text-center py-12 bg-darkGray rounded-lg">
                <p className="text-gray-400">No pending distributor requests</p>
              </div>
            ) : (
              distributors
                .filter(d => d.status === "PENDING")
                .map((distributor) => (
                  <div
                    key={distributor.id}
                    className="bg-darkGray p-6 rounded-lg flex items-center justify-between"
                  >
                    <div>
                      <h3 className="text-lg font-semibold">{distributor.name}</h3>
                      <p className="text-sm text-gray-400">{distributor.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Requested: {new Date(distributor.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleDistributorAction(distributor.id, "APPROVED")}
                        className="px-6 py-2 bg-primary hover:bg-green-500 text-white rounded-lg transition"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleDistributorAction(distributor.id, "REJECTED")}
                        className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        )}

        {activeTab === "songs" && (
          <div className="space-y-4">
            {pendingSongs.length === 0 ? (
              <div className="text-center py-12 bg-darkGray rounded-lg">
                <p className="text-gray-400">No pending songs to review</p>
              </div>
            ) : (
              pendingSongs.map((song) => (
                <div
                  key={song.id}
                  className="bg-darkGray p-6 rounded-lg flex items-center justify-between"
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{song.title}</h3>
                    <p className="text-sm text-gray-400">
                      Artist: {song.artist.displayName || song.artist.name}
                    </p>
                    {song.albumName && (
                      <p className="text-sm text-gray-400">Album: {song.albumName}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Uploaded by: {song.uploadedBy.name} ({song.uploadedBy.email})
                    </p>
                    <p className="text-xs text-gray-500">
                      Submitted: {new Date(song.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleSongAction(song.id, "APPROVED")}
                      className="px-6 py-2 bg-primary hover:bg-green-500 text-white rounded-lg transition"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleSongAction(song.id, "REJECTED")}
                      className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
