"use client";

import { apiJson } from "@/lib/api-client";

export type MessagingUser = {
  id: number;
  name: string | null;
  email: string | null;
  type: "brand" | "talent" | "admin";
  is_verified?: boolean;
  external_avatar_url?: string | null;
  avatar_url?: string | null;
};

export type ChatMessage = {
  id: number;
  conversation_id: number;
  sender_user_id: number;
  body: string;
  created_at: string;
  sender: MessagingUser;
};

export type Conversation = {
  id: number;
  campaign?: { id: number; title: string } | null;
  participants: MessagingUser[];
  last_message?: ChatMessage | null;
  last_message_at?: string | null;
  unread_count: number;
};

export type UserNotification = {
  id: string;
  type: string;
  data: {
    type?: string;
    title?: string;
    body?: string;
    conversation_id?: number;
    message_id?: number;
    campaign_id?: number;
    campaign_talent_id?: number;
    brand_user_id?: number;
    brand_talent_id?: number;
    [key: string]: unknown;
  };
  read_at: string | null;
  created_at: string;
};

export async function loadConversations() {
  return apiJson<{ data: Conversation[] }>("/conversations");
}

export async function createConversation(input: {
  participant_user_id?: number;
  profile_id?: number;
  campaign_id?: number;
}) {
  return apiJson<{ data: Conversation }>("/conversations", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function loadMessages(conversationId: number) {
  return apiJson<{ data: ChatMessage[] }>(`/conversations/${conversationId}/messages`);
}

export async function sendMessage(conversationId: number, body: string) {
  return apiJson<{ data: ChatMessage }>(`/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify({ body }),
  });
}

export async function markConversationRead(conversationId: number) {
  return apiJson<{ data: { conversation_id: number; unread_count: number; notifications_unread_count?: number } }>(
    `/conversations/${conversationId}/read`,
    { method: "POST" },
  );
}

export async function loadNotifications() {
  return apiJson<{ data: UserNotification[]; unread_count: number }>("/notifications");
}

export async function markNotificationRead(notificationId: string) {
  return apiJson<{ data: UserNotification; unread_count: number }>(
    `/notifications/${notificationId}/read`,
    { method: "POST" },
  );
}

export async function markAllNotificationsRead() {
  return apiJson<{ unread_count: number }>("/notifications/read-all", { method: "POST" });
}

export async function deleteNotification(notificationId: string) {
  return apiJson<{ unread_count: number }>(
    `/notifications/${notificationId}`,
    { method: "DELETE" },
  );
}

export const NOTIFICATIONS_UPDATED_EVENT = "onstagevn_notifications_updated";

export function notifyNotificationsUpdated(unreadCount?: number) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(new CustomEvent(NOTIFICATIONS_UPDATED_EVENT, {
    detail: { unreadCount },
  }));
}
