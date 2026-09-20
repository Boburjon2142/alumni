"use client";

import React from "react";

interface PageSkeletonProps {
  type?: "default" | "directory" | "profile" | "simple";
}

export function PageSkeleton({ type = "default" }: PageSkeletonProps) {
  if (type === "profile") {
    return (
      <div className="container section page-skeleton-container" aria-label="Profil yuklanmoqda" role="status">
        <div className="profile-grid">
          <div className="skeleton-card profile-card-skeleton">
            <div className="skeleton-avatar" />
            <div className="skeleton-line" style={{ width: "70%", height: 24, marginTop: 16 }} />
            <div className="skeleton-line" style={{ width: "90%", height: 16, marginTop: 8 }} />
            <div className="skeleton-line" style={{ width: "50%", height: 14, marginTop: 16 }} />
          </div>
          <div className="profile-details-skeleton">
            <div className="skeleton-line" style={{ width: "40%", height: 28, marginBottom: 20 }} />
            <div className="skeleton-line" style={{ width: "100%", height: 16, marginBottom: 8 }} />
            <div className="skeleton-line" style={{ width: "95%", height: 16, marginBottom: 8 }} />
            <div className="skeleton-line" style={{ width: "80%", height: 16, marginBottom: 24 }} />
            <div className="skeleton-cards-grid">
              <div className="skeleton-card" style={{ height: 160 }} />
              <div className="skeleton-card" style={{ height: 160 }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container section page-skeleton-container" aria-label="Sahifa yuklanmoqda" role="status">
      {/* Header / Hero placeholder */}
      <div className="skeleton-hero">
        <div className="skeleton-line" style={{ width: "30%", height: 14, marginBottom: 12 }} />
        <div className="skeleton-line" style={{ width: "60%", height: 38, marginBottom: 16 }} />
        <div className="skeleton-line" style={{ width: "45%", height: 18 }} />
      </div>

      {/* Filter / Controls placeholder */}
      <div className="skeleton-controls">
        <div className="skeleton-input" />
        <div className="skeleton-button" />
      </div>

      {/* Card Grid placeholders */}
      <div className="cards-grid">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="skeleton-card alumni-card-skeleton">
            <div className="skeleton-card-top">
              <div className="skeleton-avatar" />
              <div className="skeleton-badge" />
            </div>
            <div className="skeleton-line" style={{ width: "75%", height: 20, marginTop: 16 }} />
            <div className="skeleton-line" style={{ width: "50%", height: 14, marginTop: 8 }} />
            <div className="skeleton-line" style={{ width: "90%", height: 14, marginTop: 12 }} />
            <div className="skeleton-tags">
              <div className="skeleton-tag" />
              <div className="skeleton-tag" />
              <div className="skeleton-tag" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

