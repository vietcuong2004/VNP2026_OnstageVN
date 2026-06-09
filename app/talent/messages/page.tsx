"use client";

import React, { useState } from "react";
import { Send, Check, ShieldCheck, Search, MessageSquare, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function MessagesPage() {
  const router = useRouter();
  const [activeThreadId, setActiveThreadId] = useState("t1");
  const [inputText, setInputText] = useState("");
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [threads, setThreads] = useState([
    {
      id: "t1",
      brandName: "Glow Beauty Cosmetics",
      campaignTitle: "Mega Live Son Môi 06/2026",
      avatar: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=80&h=80&q=80",
      verified: true,
      lastMessage: "Bạn đã đặt cọc hợp đồng thành công.",
      time: "10:30",
      unread: true,
      messages: [
        { sender: "brand", text: "Chào Mai Anh, chúng tôi đã xem hồ sơ và điểm matching của bạn rất cao (94%).", time: "09:00" },
        { sender: "talent", text: "Em cảm ơn chị. Em đã nhận được lời mời và rất sẵn lòng tham gia chiến dịch son môi mới.", time: "09:15" },
        { sender: "brand", text: "Tốt quá, bên chị đã tiến hành chuyển khoản đặt cọc (Escrow) 8,000,000đ thành công vào ví hệ thống rồi nhé. Em check lịch để chuẩn bị dress code.", time: "10:28" },
        { sender: "brand", text: "Bạn đã đặt cọc hợp đồng thành công.", time: "10:30" }
      ]
    },
    {
      id: "t2",
      brandName: "VNDress Fashion",
      campaignTitle: "Summer Runway Show 2026",
      avatar: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=80&h=80&q=80",
      verified: true,
      lastMessage: "Hạn gửi portfolio là trước ngày 20/06.",
      time: "Hôm qua",
      unread: false,
      messages: [
        { sender: "brand", text: "Chào Mai Anh, em có thể diễn catwalk vào ngày 28/06 tại Gem Center không?", time: "Hôm qua 14:00" },
        { sender: "talent", text: "Dạ được chị ạ, lịch đó em đang trống.", time: "Hôm qua 14:30" },
        { sender: "brand", text: "Ok em, hạn gửi portfolio chi tiết là trước ngày 20/06 để stylist chuẩn bị fitting đồ nhé.", time: "Hôm qua 15:00" }
      ]
    }
  ]);

  const activeThread = threads.find(t => t.id === activeThreadId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeThread) return;

    const newMessage = {
      sender: "talent",
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setThreads(prevThreads => prevThreads.map(t => {
      if (t.id === activeThreadId) {
        return {
          ...t,
          lastMessage: inputText,
          time: newMessage.time,
          messages: [...t.messages, newMessage]
        };
      }
      return t;
    }));

    setInputText("");

    // Simulate mock auto-reply after 1.5 seconds to feel responsive
    setTimeout(() => {
      const replyMessage = {
        sender: "brand",
        text: `Cảm ơn bạn đã phản hồi! Đại diện phụ trách chiến dịch của chúng tôi sẽ phản hồi lại bạn ngay sau khi rà soát yêu cầu.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setThreads(prevThreads => prevThreads.map(t => {
        if (t.id === activeThreadId) {
          return {
            ...t,
            lastMessage: replyMessage.text,
            time: replyMessage.time,
            messages: [...t.messages, replyMessage]
          };
        }
        return t;
      }));
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-[calc(100vh-180px)] md:h-auto flex flex-col">
      
      {/* Page Header */}
      <div className={cn("flex items-center gap-4", showMobileChat && "hidden md:flex")}>
        <button 
          onClick={() => router.push("/talent/dashboard")} 
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#151b2d] bg-[#08090f] text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="font-display text-3xl font-black text-white tracking-tight uppercase leading-none">Tin Nhắn</h1>
          <p className="text-xs text-slate-400 mt-2 font-medium font-sans">Trao đổi thỏa thuận, bàn bạc chi tiết hợp đồng & nhận biên nhận đặt cọc từ Brands.</p>
        </div>
      </div>

      {/* Main chat window - styled like dashboard.htm */}
      <div className="flex flex-1 md:h-[72vh] flex-col rounded-3xl border border-[#151b2d] bg-[#08090f] overflow-hidden shadow-2xl relative">
        <div className="grid grid-cols-1 md:grid-cols-3 h-full md:divide-x divide-[#151b2d]">
          
          {/* Conversations Column */}
          <div className={cn("col-span-1 flex flex-col h-full bg-[#08090f]", showMobileChat ? "hidden md:flex" : "flex")}>
            <div className="p-4 border-b border-[#151b2d] flex gap-2">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Tìm tin nhắn..."
                  className="w-full rounded-xl border border-[#151b2d] bg-slate-950/40 py-2 pl-9 pr-4 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto divide-y divide-[#151b2d]/40 custom-scrollbar">
              {threads.map((thread) => {
                const isActive = thread.id === activeThreadId;
                return (
                  <div
                    key={thread.id}
                    onClick={() => {
                      setActiveThreadId(thread.id);
                      setShowMobileChat(true);
                    }}
                    className={cn(
                      "p-4 cursor-pointer flex gap-3.5 transition-all duration-300 relative",
                      isActive ? "bg-slate-950/60 border-l-2 border-amber-400" : "hover:bg-slate-950/30"
                    )}
                  >
                    <img src={thread.avatar} alt={thread.brandName} className="h-10 w-10 rounded-full object-cover shrink-0 border border-[#151b2d]" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-xs font-bold text-white truncate block">{thread.brandName}</span>
                          {thread.verified && <ShieldCheck className="h-4 w-4 text-amber-400 shrink-0" />}
                        </div>
                        <span className="text-[9px] text-slate-500 font-semibold shrink-0 ml-1">{thread.time}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-semibold truncate mt-0.5">{thread.campaignTitle}</p>
                      <p className="text-[10px] text-slate-500 truncate mt-1.5">{thread.lastMessage}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chat thread details Column */}
          <div className={cn("col-span-2 flex flex-col h-full bg-[#08090f]/30", showMobileChat ? "flex" : "hidden md:flex")}>
            {activeThread ? (
              <>
                {/* Thread Header */}
                <div className="p-4 border-b border-[#151b2d] flex items-center justify-between bg-slate-950/20">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowMobileChat(false)}
                      className="flex md:hidden h-8 w-8 items-center justify-center rounded-xl border border-[#151b2d] bg-slate-950 text-slate-400 mr-1"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <img src={activeThread.avatar} alt={activeThread.brandName} className="h-10 w-10 rounded-full object-cover border border-[#151b2d]" />
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        {activeThread.brandName}
                        {activeThread.verified && <ShieldCheck className="h-4 w-4 text-amber-400" />}
                      </h4>
                      <p className="text-[9px] text-slate-400 mt-0.5">{activeThread.campaignTitle}</p>
                    </div>
                  </div>
                </div>

                {/* Message bubbles list */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-950/10">
                  {activeThread.messages.map((msg, index) => {
                    const isTalentMessage = msg.sender === "talent";
                    return (
                      <div
                        key={index}
                        className={cn(
                          "flex flex-col max-w-[75%] rounded-2xl px-4.5 py-3 text-xs leading-relaxed",
                          isTalentMessage
                            ? "self-end ml-auto bg-[#f4c430] text-slate-950 font-bold rounded-tr-none shadow-[0_0_12px_rgba(244,196,48,0.1)]"
                            : "bg-slate-950 border border-[#151b2d] text-slate-200 rounded-tl-none"
                        )}
                      >
                        <p>{msg.text}</p>
                        <span className={cn(
                          "text-[8px] mt-2 self-end flex items-center gap-0.5 font-bold uppercase",
                          isTalentMessage ? "text-slate-800" : "text-slate-500"
                        )}>
                          {msg.time} {isTalentMessage && <Check className="h-2.5 w-2.5" />}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Message Input form */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-[#151b2d] bg-[#08090f] flex gap-3.5">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Nhập nội dung tin nhắn thỏa thuận..."
                    className="flex-1 rounded-xl border border-[#151b2d] bg-slate-950/40 px-4 py-3 text-xs text-white focus:border-amber-400 focus:outline-none transition-all"
                  />
                  <button
                    type="submit"
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-600 text-slate-950 shadow-md hover:shadow-lg hover:brightness-105 active:scale-95 transition-all shrink-0 cursor-pointer"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 text-slate-500 gap-3">
                <MessageSquare className="h-10 w-10 text-slate-600" />
                <p className="text-xs">Hãy chọn một thương hiệu đối tác ở danh sách bên trái để bắt đầu trò chuyện.</p>
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}
