"use client";

interface JobPosterData {
  title?: string;
  startDate?: string | null;
  endDate?: string | null;
  applicationDeadline?: string | null;
  budgetMin?: number | string | null;
  budgetMax?: number | string | null;
  budget?: string | null;
  budgetUnit?: string | null;
  referralLink?: string;
}

function parseDateTimePoint(val?: string | null): { dateStr: string; timeStr: string } | null {
  if (!val) return null;
  const raw = String(val).trim();
  if (!raw) return null;

  // Extract time if present (ignore 00:00)
  const timeMatch = raw.match(/T(\d{2}:\d{2})/i) || raw.match(/\s+(\d{2}:\d{2})/);
  let timeStr = timeMatch ? timeMatch[1] : "";
  if (timeStr === "00:00") {
    timeStr = "";
  }

  // Extract date
  let dateStr = "";
  const dateMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})/) || raw.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (dateMatch) {
    if (dateMatch[1].length === 4) {
      dateStr = `${dateMatch[3]}/${dateMatch[2]}/${dateMatch[1]}`;
    } else {
      dateStr = `${dateMatch[1]}/${dateMatch[2]}/${dateMatch[3]}`;
    }
  } else {
    const d = new Date(raw);
    if (!Number.isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      dateStr = `${day}/${month}/${year}`;
    }
  }

  return { dateStr, timeStr };
}

function formatDateRangeWithTime(startDate?: string | null, endDate?: string | null): string {
  const start = parseDateTimePoint(startDate);
  const end = parseDateTimePoint(endDate);

  if (start && end) {
    if (start.dateStr === end.dateStr) {
      if (start.timeStr && end.timeStr) {
        return `${start.dateStr} (${start.timeStr} - ${end.timeStr})`;
      }
      if (start.timeStr) {
        return `${start.dateStr} (${start.timeStr})`;
      }
      return start.dateStr;
    }
    const startPart = start.timeStr ? `${start.dateStr} (${start.timeStr})` : start.dateStr;
    const endPart = end.timeStr ? `${end.dateStr} (${end.timeStr})` : end.dateStr;
    return `${startPart} - ${endPart}`;
  }

  if (start) {
    return start.timeStr ? `${start.dateStr} (${start.timeStr})` : start.dateStr;
  }

  if (end) {
    return end.timeStr ? `${end.dateStr} (${end.timeStr})` : end.dateStr;
  }

  return "Theo lịch sự kiện";
}

function formatDeadlineWithTime(val?: string | null): string {
  if (!val) return "-";
  const pt = parseDateTimePoint(val);
  if (!pt || !pt.dateStr) return "-";
  const time = pt.timeStr ? ` (${pt.timeStr})` : " (23:59)";
  return `${pt.dateStr}${time}`;
}

function formatBudgetUnitText(unit?: string | null): string {
  if (!unit) return "/ngày";
  const u = String(unit).toLowerCase().trim();
  switch (u) {
    case "hour":
    case "h":
    case "gio":
    case "giờ":
      return "/giờ";
    case "day":
    case "ngay":
    case "ngày":
      return "/ngày";
    case "session":
    case "buoi":
    case "buổi":
      return "/buổi";
    case "post":
    case "bai":
    case "bài":
      return "/bài";
    case "video":
      return "/video";
    case "job":
    case "trọn gói":
    case "tron goi":
      return "/job";
    case "month":
    case "thang":
    case "tháng":
      return "/tháng";
    default:
      return u.startsWith("/") ? u : `/${u}`;
  }
}

function formatBudgetDisplay(data: JobPosterData): string {
  const parseNum = (v: any): number => {
    if (v === null || v === undefined || v === "") return 0;
    if (typeof v === "number") return v;
    const str = String(v).trim();
    // Check if string contains "triệu"
    const trieuMatch = str.match(/([0-9]+([.,][0-9]+)?)\s*triệu/i);
    if (trieuMatch) {
      const num = parseFloat(trieuMatch[1].replace(",", "."));
      return Math.round(num * 1_000_000);
    }
    // Check if string contains "k"
    const kMatch = str.match(/([0-9]+([.,][0-9]+)?)\s*k\b/i);
    if (kMatch) {
      const num = parseFloat(kMatch[1].replace(",", "."));
      return Math.round(num * 1_000);
    }
    // Pure digits
    const digits = str.replace(/[^0-9]/g, "");
    return digits ? parseInt(digits, 10) : 0;
  };

  const unitText = formatBudgetUnitText(data.budgetUnit);
  const min = parseNum(data.budgetMin);
  const max = parseNum(data.budgetMax);

  if (min > 0 && max > 0) {
    if (min === max) {
      return `${min.toLocaleString("vi-VN")} VND${unitText}`;
    }
    return `${min.toLocaleString("vi-VN")} - ${max.toLocaleString("vi-VN")} VND${unitText}`;
  }

  if (min > 0) {
    return `${min.toLocaleString("vi-VN")} VND${unitText}`;
  }

  if (max > 0) {
    return `${max.toLocaleString("vi-VN")} VND${unitText}`;
  }

  if (data.budget) {
    const raw = String(data.budget).trim();
    if (raw) return raw;
  }

  return "Thoả thuận";
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

function slugifyVietnamese(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function downloadJobPoster(
  data: JobPosterData,
  qrCanvasOrElement?: HTMLCanvasElement | null
) {
  // Slim, sleek card aspect ratio: 520 x 680
  const width = 520;
  const height = 680;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Background
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, width, height);

  // Outer Card Border
  ctx.strokeStyle = "#fed7aa";
  ctx.lineWidth = 1.5;
  drawRoundedRect(ctx, 10, 10, width - 20, height - 20, 20);
  ctx.stroke();

  // Load favicon icon
  let faviconImg: HTMLImageElement | null = null;
  try {
    faviconImg = await loadImage("/favicon.png");
  } catch (e) {
    console.warn("Could not load favicon.png:", e);
  }

  // Top Accent lines
  ctx.strokeStyle = "#fed7aa";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(30, 42);
  ctx.lineTo(228, 42);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(292, 42);
  ctx.lineTo(490, 42);
  ctx.stroke();

  // Top Favicon Icon
  const topIconSize = 32;
  const topIconX = (width - topIconSize) / 2;
  const topIconY = 26;

  if (faviconImg) {
    ctx.drawImage(faviconImg, topIconX, topIconY, topIconSize, topIconSize);
  } else {
    // Fallback crown
    ctx.fillStyle = "#881337";
    ctx.fillRect(topIconX, topIconY, topIconSize, topIconSize);
  }

  // 4-pointed gold star below top icon
  const starX = width / 2;
  const starY = 66;
  const starSize = 4.5;
  ctx.fillStyle = "#d97706";
  ctx.beginPath();
  ctx.moveTo(starX, starY - starSize);
  ctx.quadraticCurveTo(starX, starY, starX + starSize, starY);
  ctx.quadraticCurveTo(starX, starY, starX, starY + starSize);
  ctx.quadraticCurveTo(starX, starY, starX - starSize, starY);
  ctx.quadraticCurveTo(starX, starY, starX, starY - starSize);
  ctx.closePath();
  ctx.fill();

  // Title (Centered)
  const titleText = (data.title || "TUYỂN DỤNG JOB SỰ KIỆN").toUpperCase();
  ctx.fillStyle = "#0f172a";
  ctx.textAlign = "center";
  ctx.font = "bold 18px Inter, -apple-system, sans-serif";

  const titleLines = wrapText(ctx, titleText, width - 80);
  let currentY = 92;
  for (const line of titleLines.slice(0, 2)) {
    ctx.fillText(line, width / 2, currentY);
    currentY += 23;
  }

  // Subtitle (Centered)
  ctx.fillStyle = "#64748b";
  ctx.font = "500 12px Inter, -apple-system, sans-serif";
  ctx.fillText("Quét mã để ứng tuyển ngay", width / 2, currentY);

  // QR Code Box (Center)
  const qrBoxSize = 250;
  const qrBoxX = (width - qrBoxSize) / 2;
  const qrBoxY = currentY + 12;

  ctx.strokeStyle = "#fde68a";
  ctx.lineWidth = 1.6;
  ctx.fillStyle = "#FFFFFF";
  drawRoundedRect(ctx, qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 16);
  ctx.fill();
  ctx.stroke();

  // Draw QR code content
  const qrInnerSize = 220;
  const qrInnerX = qrBoxX + (qrBoxSize - qrInnerSize) / 2;
  const qrInnerY = qrBoxY + (qrBoxSize - qrInnerSize) / 2;

  let qrDrawn = false;
  if (qrCanvasOrElement) {
    try {
      ctx.drawImage(qrCanvasOrElement, qrInnerX, qrInnerY, qrInnerSize, qrInnerSize);
      qrDrawn = true;
    } catch {
      qrDrawn = false;
    }
  }

  if (!qrDrawn && data.referralLink) {
    try {
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&ecc=H&data=${encodeURIComponent(data.referralLink)}`;
      const qrImg = await loadImage(qrApiUrl);
      ctx.drawImage(qrImg, qrInnerX, qrInnerY, qrInnerSize, qrInnerSize);
      qrDrawn = true;
    } catch (e) {
      console.warn("Could not load external QR image:", e);
    }
  }

  // Draw Center Logo inside QR code with Solid White circle background cutout
  const logoCenterX = qrBoxX + qrBoxSize / 2;
  const logoCenterY = qrBoxY + qrBoxSize / 2;
  const whiteDiskRadius = 28;
  const logoImageRadius = 23;

  // 1. Solid White Disk to clear QR pixels
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.arc(logoCenterX, logoCenterY, whiteDiskRadius, 0, Math.PI * 2);
  ctx.fill();

  // 2. White outline border
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(logoCenterX, logoCenterY, whiteDiskRadius, 0, Math.PI * 2);
  ctx.stroke();

  // 3. Draw Logo Image inside
  try {
    const centerLogoImg = faviconImg || (await loadImage("/favicon.png"));
    ctx.drawImage(
      centerLogoImg,
      logoCenterX - logoImageRadius,
      logoCenterY - logoImageRadius,
      logoImageRadius * 2,
      logoImageRadius * 2
    );
  } catch {
    ctx.fillStyle = "#881337";
    ctx.beginPath();
    ctx.arc(logoCenterX, logoCenterY, logoImageRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Information Box (Bottom) - Clean, borderless / subtle border
  const infoBoxX = 24;
  const infoBoxY = qrBoxY + qrBoxSize + 14;
  const infoBoxWidth = width - 48;
  const infoBoxHeight = 160;

  ctx.fillStyle = "#FFFFFF";
  ctx.strokeStyle = "#f1f5f9";
  ctx.lineWidth = 1;
  drawRoundedRect(ctx, infoBoxX, infoBoxY, infoBoxWidth, infoBoxHeight, 14);
  ctx.fill();
  ctx.stroke();

  // Helper to draw row
  const drawRow = (
    rowY: number,
    iconType: "calendar" | "clock" | "money",
    label: string,
    value: string,
    isValueRed = false
  ) => {
    const iconCenterX = infoBoxX + 30;
    const iconCenterY = rowY;
    const badgeRadius = 16;

    // Icon Circle Badge
    ctx.fillStyle = "#fff1f2";
    ctx.strokeStyle = "#fecdd3";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(iconCenterX, iconCenterY, badgeRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Draw Icon Symbol inside Badge
    ctx.strokeStyle = "#881337";
    ctx.fillStyle = "#881337";
    ctx.lineWidth = 1.5;

    if (iconType === "calendar") {
      // Calendar icon
      ctx.strokeRect(iconCenterX - 7, iconCenterY - 6, 14, 12);
      ctx.fillRect(iconCenterX - 7, iconCenterY - 6, 14, 3);
      ctx.fillRect(iconCenterX - 4, iconCenterY - 8.5, 1.8, 2.5);
      ctx.fillRect(iconCenterX + 2, iconCenterY - 8.5, 1.8, 2.5);
    } else if (iconType === "clock") {
      // Clock icon
      ctx.beginPath();
      ctx.arc(iconCenterX, iconCenterY, 7, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(iconCenterX, iconCenterY - 3.5);
      ctx.lineTo(iconCenterX, iconCenterY);
      ctx.lineTo(iconCenterX + 2.5, iconCenterY);
      ctx.stroke();
    } else {
      // Money icon
      ctx.strokeRect(iconCenterX - 8, iconCenterY - 5.5, 16, 11);
      ctx.beginPath();
      ctx.arc(iconCenterX, iconCenterY, 2.2, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Text Label & Value
    ctx.textAlign = "left";
    ctx.fillStyle = "#64748b";
    ctx.font = "500 11px Inter, -apple-system, sans-serif";
    ctx.fillText(label, infoBoxX + 56, rowY - 4);

    ctx.fillStyle = isValueRed ? "#b91c1c" : "#0f172a";
    ctx.font = isValueRed ? "bold 14px Inter, -apple-system, sans-serif" : "bold 13.5px Inter, -apple-system, sans-serif";
    ctx.fillText(value, infoBoxX + 56, rowY + 11);
  };

  // 1. Date Range with Time
  const dateRangeText = formatDateRangeWithTime(data.startDate, data.endDate);
  drawRow(infoBoxY + 28, "calendar", "Thời gian", dateRangeText);

  // Divider 1
  ctx.strokeStyle = "#f8fafc";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(infoBoxX + 14, infoBoxY + 54);
  ctx.lineTo(infoBoxX + infoBoxWidth - 14, infoBoxY + 54);
  ctx.stroke();

  // 2. Application Deadline with Time
  const deadlineText = formatDeadlineWithTime(data.applicationDeadline);
  drawRow(infoBoxY + 80, "clock", "Hạn ứng tuyển", deadlineText);

  // Divider 2
  ctx.strokeStyle = "#f8fafc";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(infoBoxX + 14, infoBoxY + 107);
  ctx.lineTo(infoBoxX + infoBoxWidth - 14, infoBoxY + 107);
  ctx.stroke();

  // 3. Budget / Thù lao with budgetUnit
  const budgetText = formatBudgetDisplay(data);
  drawRow(infoBoxY + 133, "money", "Thù lao", budgetText, true);

  // Footer Section (Vertically and Horizontally Centered!)
  const cardBottomY = height - 10;
  const footerAreaTop = infoBoxY + infoBoxHeight;
  const footerCenterY = footerAreaTop + (cardBottomY - footerAreaTop) / 2;

  const line1 = "Quét mã để ứng tuyển và nhận phản hồi sớm nhất";
  const line2 = "ONSTAGE – KẾT NỐI TÀI NĂNG, KIẾN TẠO CƠ HỘI";

  ctx.font = "500 11px Inter, -apple-system, sans-serif";
  const line1Width = ctx.measureText(line1).width;
  ctx.font = "bold 11px Inter, -apple-system, sans-serif";
  const line2Width = ctx.measureText(line2).width;
  const maxTextWidth = Math.max(line1Width, line2Width);

  const footerIconSize = 24;
  const gap = 8;
  const totalBlockWidth = footerIconSize + gap + maxTextWidth;
  const blockStartX = (width - totalBlockWidth) / 2;

  // Icon (Vertically centered)
  const footerIconX = blockStartX;
  const footerIconY = footerCenterY - footerIconSize / 2;

  if (faviconImg) {
    ctx.drawImage(faviconImg, footerIconX, footerIconY, footerIconSize, footerIconSize);
  }

  // Footer Text (Left-aligned relative to icon, vertically centered)
  const textStartX = blockStartX + footerIconSize + gap;

  ctx.textAlign = "left";
  ctx.fillStyle = "#475569";
  ctx.font = "500 11px Inter, -apple-system, sans-serif";
  ctx.fillText(line1, textStartX, footerCenterY - 3);

  ctx.fillStyle = "#881337";
  ctx.font = "bold 11px Inter, -apple-system, sans-serif";
  ctx.fillText(line2, textStartX, footerCenterY + 12);

  // Trigger Download
  const slug = slugifyVietnamese(data.title || "Job") || "job";
  const filename = `QR-Tuyen-Dung-${slug}.png`;
  const blobUrl = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
