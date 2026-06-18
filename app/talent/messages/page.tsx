"use client";

import { Suspense } from "react";
import MessagesPage from "@/components/messages/MessagesPage";

export default function TalentMessagesPage() {
  return (
    <Suspense>
      <MessagesPage portal="talent" />
    </Suspense>
  );
}
