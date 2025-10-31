"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import MusicPlayer from "@/components/MusicPlayer";
import UserBadge from "@/components/UserBadge";

interface Song {
  id: string;
  title: string;
  artist: {
    id: string;
    name: string;
    displayName: string | null;
    role: string;
  };
  albumName: string | null;
  fileUrl: string;
  coverUrl: string | null;
  duration: number;
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchSongs();
    }
  }, [status]);

  const fetchSongs = async () => {
    try {
      const response = await fetch("/api/songs");
      if (response.ok) {
        const data = await response.json();
        setSongs(data);
      }
    } catch (error) {
      console.error("Failed to fetch songs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaySong = (song: Song) => {
    setCurrentSong(song);
  };

  const handleNext = () => {
    if (!currentSong || songs.length === 0) return;
    const currentIndex = songs.findIndex((s) => s.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % songs.length;
    setCurrentSong(songs[nextIndex]);
  };

  const handlePrevious = () => {
    if (!currentSong || songs.length === 0) return;
    const currentIndex = songs.findIndex((s) => s.id === currentSong.id);
    const previousIndex = currentIndex === 0 ? songs.length - 1 : currentIndex - 1;
    setCurrentSong(songs[previousIndex]);
  };

  if (status === "loading") {
    return (
      <div className="h-screen flex items-center justify-center bg-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-dark">
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">
              Welcome back, {session?.user?.displayName || session?.user?.name}
              {session?.user?.role && <UserBadge role={session.user.role} size={24} />}
            </h1>
            <p className="text-gray-400">Discover and enjoy your favorite music</p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-400">Loading songs...</p>
            </div>
          ) : songs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎵</div>
              <h2 className="text-2xl font-semibold mb-2">No songs available yet</h2>
              <p className="text-gray-400">
                {session?.user?.role === "DISTRIBUTOR"
                  ? "Upload your first song to get started!"
                  : "Check back later for new music"}
              </p>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-bold mb-4">All Songs</h2>
              <div className="grid grid-cols-1 gap-2">
                {songs.map((song) => (
                  <div
                    key={song.id}
                    onClick={() => handlePlaySong(song)}
                    className={`flex items-center p-4 rounded-lg hover:bg-lightGray transition cursor-pointer ${
                      currentSong?.id === song.id ? "bg-lightGray" : ""
                    }`}
                  >
                    <div className="w-12 h-12 bg-darkGray rounded flex items-center justify-center mr-4">
                      {song.coverUrl ? (
                        <img
                          src={song.coverUrl}
                          alt={song.title}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <span className="text-2xl">🎵</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{song.title}</p>
                      <p className="text-sm text-gray-400 truncate">
                        {song.artist.displayName || song.artist.name}
                        <UserBadge role={song.artist.role} size={12} />
                      </p>
                    </div>
                    <div className="text-sm text-gray-400">
                      {song.albumName && <span className="mr-4">{song.albumName}</span>}
                      <span>
                        {Math.floor(song.duration / 60)}:
                        {(song.duration % 60).toString().padStart(2, "0")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      <MusicPlayer
        currentSong={currentSong}
        onNext={handleNext}
        onPrevious={handlePrevious}
      />
    </div>
  );
}
