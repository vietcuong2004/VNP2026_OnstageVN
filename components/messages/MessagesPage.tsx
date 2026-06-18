"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, LoaderCircle, MessageSquare, Search, Send, ShieldCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { createInitialAvatarDataUrl, normalizeBackendAssetUrl } from "@/lib/avatar";
import { getStoredAuthUser } from "@/lib/api-client";
import {
  ChatMessage,
  Conversation,
  createConversation,
  loadConversations,
  loadMessages,
  markConversationRead,
  notifyNotificationsUpdated,
  sendMessage,
} from "@/lib/messaging-api";
import { getRealtimeClient } from "@/lib/realtime";

type Props = {
  portal: "brand" | "talent";
};

function formatTime(value?: string | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(value));
}

export default function MessagesPage({ portal }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const talentProfileId = searchParams.get("talentId");
  const conversationIdParam = searchParams.get("conversationId");
  const authUser = getStoredAuthUser<{ id: number; name?: string }>();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<number, ChatMessage[]>>({});
  const [activeId, setActiveId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [showMobileChat, setShowMobileChat] = useState(false);

  const refreshConversations = async () => {
    const response = await loadConversations();
    setConversations(response.data);
    setActiveId((current) => current ?? response.data[0]?.id ?? null);
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        if (portal === "brand" && talentProfileId) {
          const response = await createConversation({ profile_id: Number(talentProfileId) });
          if (!cancelled) {
            setActiveId(response.data.id);
            setShowMobileChat(true);
          }
        } else if (conversationIdParam) {
          const conversationId = Number(conversationIdParam);
          if (Number.isFinite(conversationId) && !cancelled) {
            setActiveId(conversationId);
            setShowMobileChat(true);
          }
        }
        await refreshConversations();
      } catch (reason) {
        if (!cancelled) setError(reason instanceof Error ? reason.message : "Không tải được tin nhắn.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [portal, talentProfileId, conversationIdParam]);

  useEffect(() => {
    if (!activeId) return;
    let cancelled = false;

    (async () => {
      try {
        const response = await loadMessages(activeId);
        if (!cancelled) {
          setMessages((current) => ({ ...current, [activeId]: response.data }));
          const readResponse = await markConversationRead(activeId);
          notifyNotificationsUpdated(readResponse.data.notifications_unread_count);
          setConversations((current) => current.map((item) => (
            item.id === activeId ? { ...item, unread_count: 0 } : item
          )));
        }
      } catch (reason) {
        if (!cancelled) setError(reason instanceof Error ? reason.message : "Không tải được hội thoại.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeId]);

  useEffect(() => {
    if (!authUser?.id) return;
    const echo = getRealtimeClient();
    if (!echo) return;

    const channel = echo.private(`users.${authUser.id}`);
    const handleMessageSent = (event: { message: ChatMessage }) => {
      const message = event.message;
      setMessages((current) => {
        const existing = current[message.conversation_id] ?? [];
        if (existing.some((item) => item.id === message.id)) return current;
        return { ...current, [message.conversation_id]: [...existing, message] };
      });
      refreshConversations().catch(() => undefined);
    };

    channel.listen(".message.sent", handleMessageSent);

    return () => {
      channel.stopListening(".message.sent", handleMessageSent);
    };
  }, [authUser?.id]);

  const activeConversation = conversations.find((item) => item.id === activeId) ?? null;
  const activeMessages = activeId ? messages[activeId] ?? [] : [];

  const filteredConversations = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("vi");
    if (!term) return conversations;
    return conversations.filter((conversation) => {
      const other = conversation.participants.find((user) => user.id !== authUser?.id);
      return `${other?.name ?? ""} ${conversation.campaign?.title ?? ""}`.toLocaleLowerCase("vi").includes(term);
    });
  }, [authUser?.id, conversations, search]);

  const handleSend = async (event: FormEvent) => {
    event.preventDefault();
    const body = input.trim();
    if (!activeId || !body || sending) return;

    try {
      setSending(true);
      const response = await sendMessage(activeId, body);
      setMessages((current) => {
        const existing = current[activeId] ?? [];
        if (existing.some((item) => item.id === response.data.id)) return current;
        return { ...current, [activeId]: [...existing, response.data] };
      });
      setInput("");
      await refreshConversations();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Không gửi được tin nhắn.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-180px)] flex-col space-y-5 animate-in fade-in duration-300 md:h-auto">
      <div className={cn("flex items-center gap-4", showMobileChat && "hidden md:flex")}>
        <button
          type="button"
          onClick={() => router.push(portal === "brand" ? "/brand/dashboard" : "/talent/dashboard")}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#151b2d] bg-[#08090f] text-slate-400 hover:text-white"
          aria-label="Quay lại"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="font-display text-2xl font-black uppercase tracking-tight text-white md:text-3xl">Tin nhắn</h1>
          <p className="mt-1 text-xs text-slate-400">Trao đổi trực tiếp giữa Brand và Talent.</p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-300">{error}</div>
      )}

      <div className="relative flex flex-1 flex-col overflow-hidden rounded-2xl border border-[#151b2d] bg-[#08090f] md:h-[72vh]">
        {loading ? (
          <div className="flex flex-1 items-center justify-center text-slate-500">
            <LoaderCircle className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="grid h-full grid-cols-1 md:grid-cols-3 md:divide-x md:divide-[#151b2d]">
            <aside className={cn("h-full flex-col", showMobileChat ? "hidden md:flex" : "flex")}>
              <div className="border-b border-[#151b2d] p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Tìm hội thoại..."
                    className="w-full rounded-xl border border-[#151b2d] bg-slate-950/40 py-2 pl-9 pr-3 text-xs text-white outline-none focus:border-amber-400"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {filteredConversations.map((conversation) => {
                  const other = conversation.participants.find((user) => user.id !== authUser?.id);
                  const avatar = normalizeBackendAssetUrl(other?.avatar_url || other?.external_avatar_url)
                    || createInitialAvatarDataUrl(other?.name, other?.email);
                  return (
                    <button
                      type="button"
                      key={conversation.id}
                      onClick={() => {
                        setActiveId(conversation.id);
                        setShowMobileChat(true);
                      }}
                      className={cn(
                        "flex w-full gap-3 border-b border-[#151b2d]/50 p-4 text-left transition-colors",
                        activeId === conversation.id ? "bg-slate-950/70" : "hover:bg-slate-950/40",
                      )}
                    >
                      <img src={avatar} alt="" className="h-10 w-10 rounded-full border border-white/10 object-cover" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-xs font-bold text-white">{other?.name || other?.email || "Người dùng"}</span>
                          <span className="shrink-0 text-[9px] text-slate-500">{formatTime(conversation.last_message_at)}</span>
                        </div>
                        <p className="mt-1 truncate text-[10px] text-slate-500">
                          {conversation.last_message?.body || conversation.campaign?.title || "Chưa có tin nhắn"}
                        </p>
                      </div>
                      {conversation.unread_count > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1 text-[9px] font-black text-slate-950">
                          {conversation.unread_count}
                        </span>
                      )}
                    </button>
                  );
                })}
                {!filteredConversations.length && (
                  <div className="p-8 text-center text-xs text-slate-500">Chưa có hội thoại nào.</div>
                )}
              </div>
            </aside>

            <section className={cn("col-span-2 h-full flex-col", showMobileChat ? "flex" : "hidden md:flex")}>
              {activeConversation ? (
                <>
                  <div className="flex items-center gap-3 border-b border-[#151b2d] p-4">
                    <button
                      type="button"
                      onClick={() => setShowMobileChat(false)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#151b2d] text-slate-400 md:hidden"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    {(() => {
                      const other = activeConversation.participants.find((user) => user.id !== authUser?.id);
                      return (
                        <>
                          <img
                            src={
                              normalizeBackendAssetUrl(other?.avatar_url || other?.external_avatar_url)
                                || createInitialAvatarDataUrl(other?.name, other?.email)
                            }
                            alt=""
                            className="h-10 w-10 rounded-full border border-white/10 object-cover"
                          />
                          <div>
                            <p className="flex items-center gap-1.5 text-xs font-bold text-white">
                              {other?.name || other?.email || "Người dùng"}
                              {other?.is_verified && <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />}
                            </p>
                            <p className="mt-0.5 text-[9px] text-slate-500">{activeConversation.campaign?.title || "Trao đổi trực tiếp"}</p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  <div className="flex-1 space-y-3 overflow-y-auto p-4 custom-scrollbar md:p-6">
                    {activeMessages.map((message) => {
                      const mine = message.sender_user_id === authUser?.id;
                      return (
                        <div
                          key={message.id}
                          className={cn(
                            "flex max-w-[82%] flex-col rounded-2xl px-4 py-3 text-xs leading-relaxed",
                            mine
                              ? "ml-auto rounded-tr-none bg-[#f4c430] font-semibold text-slate-950"
                              : "rounded-tl-none border border-[#151b2d] bg-slate-950 text-slate-200",
                          )}
                        >
                          <p className="whitespace-pre-wrap break-words">{message.body}</p>
                          <span className={cn("mt-2 flex items-center gap-1 self-end text-[8px]", mine ? "text-slate-700" : "text-slate-500")}>
                            {formatTime(message.created_at)} {mine && <Check className="h-2.5 w-2.5" />}
                          </span>
                        </div>
                      );
                    })}
                    {!activeMessages.length && (
                      <div className="flex h-full items-center justify-center text-xs text-slate-500">Hãy gửi tin nhắn đầu tiên.</div>
                    )}
                  </div>
                  <form onSubmit={handleSend} className="flex gap-3 border-t border-[#151b2d] p-4">
                    <input
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      placeholder="Nhập nội dung tin nhắn..."
                      className="min-w-0 flex-1 rounded-xl border border-[#151b2d] bg-slate-950/50 px-4 py-3 text-xs text-white outline-none focus:border-amber-400"
                    />
                    <button
                      type="submit"
                      disabled={sending || !input.trim()}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Gửi tin nhắn"
                    >
                      {sending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 text-xs text-slate-500">
                  <MessageSquare className="h-10 w-10" />
                  Chọn một hội thoại để bắt đầu.
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
