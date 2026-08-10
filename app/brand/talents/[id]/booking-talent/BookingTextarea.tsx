"use client";

import React, { useLayoutEffect, useRef } from "react";

export type BookingTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export default function BookingTextarea({ className = "", onChange, value, ...props }: BookingTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const resize = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  useLayoutEffect(() => {
    resize();
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(event) => {
        onChange?.(event);
        requestAnimationFrame(resize);
      }}
      className={`${className} overflow-hidden`}
      {...props}
    />
  );
}
