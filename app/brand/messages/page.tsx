"use client";

import { Suspense } from "react";
import MessagesPage from "@/components/messages/MessagesPage";

export default function BrandMessagesPage() {
  return (
    <Suspense>
      <MessagesPage portal="brand" />
    </Suspense>
  );
}
