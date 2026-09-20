"use client";

import {
  Activity,
  Award,
  BookOpen,
  Briefcase,
  GraduationCap,
  Lightbulb,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";

interface RecognitionIconProps {
  icon?: string;
  className?: string;
  size?: number;
}

export function RecognitionIcon({
  icon = "award",
  className = "",
  size = 14,
}: RecognitionIconProps) {
  if (!icon) {
    return <Award className={className} size={size} aria-hidden="true" />;
  }

  // If icon is an emoji (e.g. 🏅, 🎖️, 🚀, 🏆)
  if (/\p{Extended_Pictographic}/u.test(icon)) {
    return (
      <span className={`recognition-emoji-icon ${className}`} aria-hidden="true">
        {icon}
      </span>
    );
  }

  const normalized = icon.toLowerCase().trim().replace(/_/g, "-");

  switch (normalized) {
    case "graduation-cap":
    case "graduation":
    case "education":
      return <GraduationCap className={className} size={size} aria-hidden="true" />;

    case "briefcase":
    case "career":
      return <Briefcase className={className} size={size} aria-hidden="true" />;

    case "activity":
    case "active":
      return <Activity className={className} size={size} aria-hidden="true" />;

    case "users":
    case "community":
      return <Users className={className} size={size} aria-hidden="true" />;

    case "book-open":
    case "book":
    case "science":
      return <BookOpen className={className} size={size} aria-hidden="true" />;

    case "lightbulb":
    case "innovation":
      return <Lightbulb className={className} size={size} aria-hidden="true" />;

    case "trending-up":
    case "business":
    case "entrepreneur":
      return <TrendingUp className={className} size={size} aria-hidden="true" />;

    case "trophy":
      return <Trophy className={className} size={size} aria-hidden="true" />;

    case "award":
    case "medal":
    default:
      return <Award className={className} size={size} aria-hidden="true" />;
  }
}

