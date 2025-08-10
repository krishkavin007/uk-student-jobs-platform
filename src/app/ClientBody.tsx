"use client";

import { useEffect } from "react";

export default function ClientBody({
  children,
}: {
  children: React.ReactNode;
}) {
  // Clean up body classes during hydration
  useEffect(() => {
    // This runs only on the client after hydration
    document.body.className = "antialiased";
  }, []);

  return <div className="antialiased">{children}</div>;
}
