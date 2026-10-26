"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, X } from "lucide-react";
import { groupSocialAccounts, type SocialAccountInput } from "@/lib/social-account-groups";

function shortCount(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return value.toLocaleString("vi-VN");
}

export default function ProfileSocialSummary({ accounts }: { accounts: SocialAccountInput[] }) {
  const groups = groupSocialAccounts(accounts);
  const [selected, setSelected] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const activeGroup = groups.find((group) => group.platform === selected);

  useEffect(() => {
    if (!selected || !dialogRef.current) return;
    const dialog = dialogRef.current;
    dialog.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [selected]);

  const itemClass = "flex min-w-0 flex-col items-center justify-center px-1 text-center transition active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#8F0709]";

  return (
    <>
      <div className="grid grid-cols-4 divide-x divide-slate-200 rounded-3xl bg-white py-2 shadow-sm">
        {groups.map((group) => {
          const content = (
            <>
              <img src={`/social/${group.key}.png`} alt={group.platform} className="mb-1 h-8 w-8 shrink-0 object-contain" />
              <strong className="text-sm font-black leading-tight text-[#10122f]">{shortCount(group.followers)}</strong>
              <span className="text-[10px] font-semibold leading-tight text-[#888aa5]">{group.channels.length ? group.label : "Chưa cập nhật"}</span>
            </>
          );
          if (group.channels.length === 1) {
            return <a key={group.platform} href={group.channels[0].href} target="_blank" rel="noopener noreferrer" className={itemClass} title={`Mở ${group.platform}`}>{content}</a>;
          }
          return (
            <button
              key={group.platform}
              type="button"
              disabled={!group.channels.length}
              onClick={() => setSelected(group.platform)}
              className={`${itemClass} disabled:opacity-35 disabled:grayscale`}
              aria-haspopup="dialog"
              title={group.channels.length ? `Xem ${group.channels.length} kênh ${group.platform}` : `${group.platform} chưa cập nhật`}
            >{content}</button>
          );
        })}
      </div>

      <dialog
        ref={dialogRef}
        aria-labelledby="social-channels-title"
        onClose={() => setSelected(null)}
        onClick={(event) => {
          if (event.target !== event.currentTarget) return;
          const rect = event.currentTarget.getBoundingClientRect();
          if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) setSelected(null);
        }}
        className="fixed inset-0 m-auto max-h-[85dvh] w-[calc(100%_-_2rem)] max-w-md overflow-y-auto rounded-lg border border-[#F0D7D3] bg-white p-0 text-[#191116] shadow-2xl backdrop:bg-black/50 dark:border-white/15 dark:bg-[#171717] dark:text-white"
      >
        {activeGroup && (
          <>
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 p-5 dark:border-white/10">
              <div className="min-w-0">
                <h2 id="social-channels-title" className="text-base font-bold">Danh sách kênh {activeGroup.platform}</h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{activeGroup.channels.length} kênh · {activeGroup.followers.toLocaleString("vi-VN")} {activeGroup.label}</p>
              </div>
              <button type="button" autoFocus onClick={() => setSelected(null)} title="Đóng" aria-label="Đóng danh sách kênh" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#8F0709] hover:bg-red-50 dark:text-white dark:hover:bg-white/10"><X className="h-5 w-5" /></button>
            </div>
            <ul className="divide-y divide-slate-200 px-5 dark:divide-white/10">
              {activeGroup.channels.map((channel) => (
                <li key={channel.href} className="flex items-center justify-between gap-3 py-4">
                  <div className="min-w-0">
                    <p className="break-all text-sm font-semibold">{channel.name}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{channel.followers.toLocaleString("vi-VN")} {activeGroup.label}</p>
                  </div>
                  <a href={channel.href} target="_blank" rel="noopener noreferrer" title={`Xem kênh ${channel.name}`} aria-label={`Xem kênh ${channel.name}`} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#F0D7D3] text-[#8F0709] hover:bg-red-50 dark:border-white/15 dark:text-white dark:hover:bg-white/10"><ExternalLink className="h-4 w-4" /></a>
                </li>
              ))}
            </ul>
          </>
        )}
      </dialog>
    </>
  );
}
