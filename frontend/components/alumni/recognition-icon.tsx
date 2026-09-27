"use client";

import {
  Activity,
  Award,
  BookOpen,
  Briefcase,
  Building2,
  Coins,
  Compass,
  Crown,
  Flame,
  Globe,
  GraduationCap,
  Heart,
  HeartHandshake,
  Lightbulb,
  Medal,
  Rocket,
  Sprout,
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

  const normalized = icon.toLowerCase().trim().replace(/_/g, "-");

  switch (normalized) {
    case "crown":
    case "supreme":
    case "qardu-iftixori":
      return <Crown className={className} size={size} aria-hidden="true" />;

    case "astrolabe":
    case "compass":
    case "ilm-fan-fidoyisi":
      return <Compass className={className} size={size} aria-hidden="true" />;

    case "torch":
    case "flame":
    case "ziyo-mashali":
      return <Flame className={className} size={size} aria-hidden="true" />;

    case "wing":
    case "trending-up":
    case "yuksak-parvoz":
      return <TrendingUp className={className} size={size} aria-hidden="true" />;

    case "example":
    case "heart-handshake":
    case "ibrat":
      return <HeartHandshake className={className} size={size} aria-hidden="true" />;

    case "rocket":
    case "istiqbol-yoshlari":
      return <Rocket className={className} size={size} aria-hidden="true" />;

    case "heart":
    case "hand-heart":
    case "ezgulik":
      return <Heart className={className} size={size} aria-hidden="true" />;

    case "coins":
    case "shield-check":
    case "oliyhimmat":
      return <Coins className={className} size={size} aria-hidden="true" />;

    case "seedling":
    case "sprout":
    case "istedodlar-tayanchi":
      return <Sprout className={className} size={size} aria-hidden="true" />;

    case "book":
    case "book-open":
    case "library":
    case "marifat-hadyasi":
      return <BookOpen className={className} size={size} aria-hidden="true" />;

    case "lamp":
    case "lightbulb":
    case "yolchiroq":
      return <Lightbulb className={className} size={size} aria-hidden="true" />;

    case "bridge":
    case "network":
    case "briefcase":
    case "career":
    case "kelajakka-koprik":
      return <Briefcase className={className} size={size} aria-hidden="true" />;

    case "building":
    case "building-2":
    case "ona-dargoh-qadrdoni":
      return <Building2 className={className} size={size} aria-hidden="true" />;

    case "globe":
    case "qardu-elchisi":
      return <Globe className={className} size={size} aria-hidden="true" />;

    case "medal":
    case "medal-silver":
    case "kumush-bitiruvchi":
      return <Medal className={className} size={size} aria-hidden="true" />;

    case "trophy":
    case "medal-gold":
    case "oltin-bitiruvchi":
      return <Trophy className={className} size={size} aria-hidden="true" />;

    case "users":
    case "community":
    case "qardu-sulolasi":
      return <Users className={className} size={size} aria-hidden="true" />;

    case "graduation-cap":
    case "graduation":
    case "education":
      return <GraduationCap className={className} size={size} aria-hidden="true" />;

    case "activity":
    case "active":
      return <Activity className={className} size={size} aria-hidden="true" />;

    case "award":
    default:
      return <Award className={className} size={size} aria-hidden="true" />;
  }
}


