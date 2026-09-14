import React from "react";
import { ArrowLeft, ArrowRight, Image as ImageIcon, X } from "lucide-react";

type MediaImage = {
  url: string;
  caption?: string;
};

type JobImagesSectionProps = {
  images: MediaImage[];
  jobTitle: string;
  previewImageIndex: number | null;
  bannerCarouselRef: React.RefObject<HTMLDivElement | null>;
  onBannerScroll: (event: React.UIEvent<HTMLDivElement>) => void;
  onOpenPreview: (index: number) => void;
  onClosePreview: () => void;
  onBannerPrev: (event: React.MouseEvent) => void;
  onBannerNext: (event: React.MouseEvent) => void;
  onPreviewPrev: () => void;
  onPreviewNext: () => void;
  onTouchStart: (event: React.TouchEvent) => void;
  onTouchMove: (event: React.TouchEvent) => void;
  onTouchEnd: () => void;
};

export default function JobImagesSection({
  images,
  jobTitle,
  previewImageIndex,
  bannerCarouselRef,
  onBannerScroll,
  onOpenPreview,
  onClosePreview,
  onBannerPrev,
  onBannerNext,
  onPreviewPrev,
  onPreviewNext,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
}: JobImagesSectionProps) {
  const previewImage = previewImageIndex !== null ? images[previewImageIndex] : null;

  return (
    <>
      <div className="relative w-full h-64 sm:h-80 bg-white shrink-0 overflow-hidden border-b border-[#F0D6D0] dark:bg-[#050711] dark:border-[#151b2d]">
        {images.length > 0 ? (
          <div
            ref={bannerCarouselRef}
            onScroll={onBannerScroll}
            className="flex h-full w-full overflow-x-auto snap-x snap-mandatory scrollbar-none"
          >
            {images.map((img, idx) => (
              <div
                key={`${img.url}-${idx}`}
                onClick={() => onOpenPreview(idx)}
                className="w-full h-full shrink-0 snap-center relative cursor-pointer group"
              >
                <img
                  src={img.url}
                  alt={img.caption || jobTitle}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/brand_cover_default.png";
                  }}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#FFF7F6] to-white text-[#8D8088] p-4 dark:from-[#0e1322] dark:to-[#080a12] dark:text-slate-500">
            <ImageIcon className="h-10 w-10 text-slate-600 mb-2" />
            <span className="text-xs font-semibold">Chưa có hình ảnh chiến dịch</span>
          </div>
        )}

        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 rounded-full bg-black/40 backdrop-blur-md p-1 border border-white/10 shadow-lg opacity-70 hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={onBannerPrev}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 hover:bg-white/25 active:scale-95 text-white/80 hover:text-white transition-all cursor-pointer"
              title="Hình trước"
            >
              <ArrowLeft className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={onBannerNext}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 hover:bg-white/25 active:scale-95 text-white/80 hover:text-white transition-all cursor-pointer"
              title="Hình tiếp theo"
            >
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>

      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 p-3 animate-in fade-in duration-200"
          onClick={onClosePreview}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <button
            type="button"
            onClick={onClosePreview}
            style={{
              backgroundColor: "rgba(18, 18, 22, 0.85)",
              borderColor: "rgba(255, 255, 255, 0.35)",
              color: "#ffffff",
            }}
            className="light-keep-white light-force-white absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border shadow-xl transition-all duration-200 hover:bg-black hover:scale-110 active:scale-95 cursor-pointer animate-in fade-in duration-200"
            title="Đóng ảnh"
          >
            <X className="h-5 w-5 !text-white text-white" style={{ stroke: "#ffffff", color: "#ffffff" }} strokeWidth={2.5} />
          </button>

          <div className="relative max-h-[70vh] max-w-full flex items-center justify-center">
            <img
              src={previewImage.url}
              alt={previewImage.caption || "Preview"}
              className="max-h-[70vh] max-w-full object-contain rounded-lg select-none transition-all duration-300 animate-in zoom-in-95"
              onClick={(e) => e.stopPropagation()}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/brand_cover_default.png";
              }}
            />
          </div>

          {images.length > 1 && (
            <div
              className="flex items-center gap-1.5 mt-4 shrink-0 bg-black/40 border border-white/10 rounded-full p-1 backdrop-blur-md opacity-70 hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={onPreviewPrev}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white/80 hover:text-white active:scale-95 transition-all cursor-pointer"
                title="Ảnh trước"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                onClick={onPreviewNext}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white/80 hover:text-white active:scale-95 transition-all cursor-pointer"
                title="Ảnh sau"
              >
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
