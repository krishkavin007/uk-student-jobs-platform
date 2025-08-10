// src/app/[...slug]/page.tsx
"use client"

import NotFoundContent from '@/components/ui/not-found-content'

export default function CatchAllPage() {
  // This will catch any URL that doesn't match existing routes
  // and show the NotFoundContent component while preserving the original URL
  return <NotFoundContent />
}
