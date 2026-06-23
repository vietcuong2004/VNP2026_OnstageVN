"use client";

import React, { createContext, useContext } from "react";

export interface ToastContextType {
  addToast: (message: string, type?: "success" | "info") => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useCrownfundingToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useCrownfundingToast must be used within a ToastProvider");
  }
  return context;
}
