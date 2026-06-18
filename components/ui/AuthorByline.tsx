import Link from "next/link";
import Image from "next/image";

interface AuthorBylineProps {
  authorName?: string;
  authorSlug?: string | null;
  authorAvatar?: string | null;
  showAvatar?: boolean;
  className?: string;
}

export default function AuthorByline({
  authorName = "Editorial Staff",
  authorSlug,
  authorAvatar,
  showAvatar = true,
  className = "",
}: AuthorBylineProps) {
  // If no avatar is provided, default to a standard placeholder
  const avatarSrc = authorAvatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80";

  const renderContent = () => (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {showAvatar && (
        <div className="relative w-5 h-5 rounded-full overflow-hidden shrink-0 border border-border">
          <Image
            src={avatarSrc}
            alt={authorName}
            fill
            sizes="20px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}
      <span className="font-medium text-foreground transition-colors group-hover:text-primary border-b border-transparent group-hover:border-primary">
        {authorName}
      </span>
    </span>
  );

  if (!authorSlug) {
    return (
      <span className={`inline-flex items-center gap-2 select-none ${className}`}>
        {showAvatar && (
          <div className="relative w-5 h-5 rounded-full overflow-hidden shrink-0 border border-border">
            <Image
              src={avatarSrc}
              alt={authorName}
              fill
              sizes="20px"
              className="object-cover"
            />
          </div>
        )}
        <span className="font-medium text-foreground">{authorName}</span>
      </span>
    );
  }

  return (
    <Link href={`/author/${authorSlug}`} className="group inline-flex items-center">
      {renderContent()}
    </Link>
  );
}
