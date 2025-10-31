import Image from "next/image";

interface UserBadgeProps {
  role: string;
  size?: number;
}

export default function UserBadge({ role, size = 16 }: UserBadgeProps) {
  const badges = {
    ADMIN: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsWZWOa20Hpq8_jC0mSQYmRwgJub7WGwk3kwBldGMRbQ&s=10",
    DISTRIBUTOR: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSmXMNrzXFSzg1m07uPHUO5v87i6ug3A1jPC65y2tiB7g&s=10",
    ARTIST: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkQIUlcTuoeM4L-49b2ngZZcwB7I34Gx5BfzFYG3sS2g&s=10",
  };

  if (role === "LISTENER") return null;

  const badgeUrl = badges[role as keyof typeof badges];
  if (!badgeUrl) return null;

  return (
    <Image
      src={badgeUrl}
      alt={`${role} badge`}
      width={size}
      height={size}
      className="inline-block ml-1"
    />
  );
}
