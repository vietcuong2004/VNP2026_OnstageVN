"use client";

import React from "react";
import QRCodeContainer from "@/components/QR_Code";

interface QrDonateProps {
  campaignLink?: string;
  qrCodeSvg?: string;
  qrPayload?: string;
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
  qrPayload,
  onCopyLink,
  onDownloadQr,
  onShareFacebook,
  onShareInstagram,
  onShareZalo,
}: QrDonateProps) {
  return (
    <QRCodeContainer
      campaignLink={campaignLink}
      qrPayload={qrPayload}
      qrCodeSvg={qrCodeSvg}
      qrImageUrl={undefined}
      title="Mã QR nhận ủng hộ (Donate)"
      subtitle={qrPayload ? "Quét mã để mở luồng thu hộ của campaign" : "Campaign chưa có QR thu hộ, đang dùng link chia sẻ dự phòng"}
      badgeText={qrPayload ? "QR Thu Hộ Mock" : "Link Chia Sẻ Dự Phòng"}
      onCopyLink={onCopyLink}
      onDownloadQr={onDownloadQr}
      onShareFacebook={onShareFacebook}
      onShareInstagram={onShareInstagram}
      onShareZalo={onShareZalo}
      className="lg:col-span-4"
    />
  );
}
