"use client";

import React from "react";
import QRCodeContainer from "@/components/QR_Code";

interface QrDonateProps {
  campaignLink?: string;
  qrCodeSvg?: string;
  showShareMenu?: boolean;
  setShowShareMenu?: (show: boolean) => void;
  onCopyLink?: () => void;
  onDownloadQr?: () => void;
  onShareFacebook?: () => void;
  onShareInstagram?: () => void;
  onShareZalo?: () => void;
}

export function QrDonate({
  campaignLink,
  qrCodeSvg,
  onCopyLink,
  onDownloadQr,
  onShareFacebook,
  onShareInstagram,
  onShareZalo,
}: QrDonateProps) {
  return (
    <QRCodeContainer
      campaignLink={campaignLink}
      qrCodeSvg={qrCodeSvg}
      onCopyLink={onCopyLink}
      onDownloadQr={onDownloadQr}
      onShareFacebook={onShareFacebook}
      onShareInstagram={onShareInstagram}
      onShareZalo={onShareZalo}
      className="lg:col-span-4"
    />
  );
}
