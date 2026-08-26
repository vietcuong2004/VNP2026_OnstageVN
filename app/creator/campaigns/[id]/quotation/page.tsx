"use client";

import { useState, use } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  CreditCard,
  X
} from "lucide-react";
import { MOCK_CREATOR_CAMPAIGNS } from "@/app/creator/mock-data";
import { CreatorCampaignItem } from "@/app/creator/types";

export default function CreatorCampaignQuotationPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const campaign: CreatorCampaignItem = MOCK_CREATOR_CAMPAIGNS.find((c: CreatorCampaignItem) => c.id === resolvedParams.id) || MOCK_CREATOR_CAMPAIGNS[0];
  const quote = campaign.quotation || MOCK_CREATOR_CAMPAIGNS[0].quotation!;

  const [isApproved, setIsApproved] = useState(quote.status === 'approved');
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionNote, setRevisionNote] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const formatNumber = (val: number) => {
    return new Intl.NumberFormat('vi-VN').format(val);
  };

  const handleApproveAndPay = () => {
    setShowPaymentModal(true);
  };

  const handleConfirmDeposit = () => {
    setPaymentSuccess(true);
    setIsApproved(true);
    setTimeout(() => {
      setShowPaymentModal(false);
    }, 1500);
  };

  const handleSubmitRevision = () => {
    if (!revisionNote) return;
    alert("Đã gửi yêu cầu chỉnh sửa báo giá đến Onstage.");
    setShowRevisionModal(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Breadcrumb */}
      <div>
        <Link
          href={`/creator/campaigns/${campaign.id}`}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại chi tiết chiến dịch</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              Báo Giá Chính Thức Chiến Dịch
            </h1>
            <p className="text-zinc-500 text-sm mt-1">
              Mã chiến dịch: <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">{campaign.campaignCode}</span> • {campaign.title}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {isApproved ? (
              <span className="inline-flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                <CheckCircle2 className="w-4 h-4" />
                <span>Đã duyệt & Đặt cọc</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                <Clock className="w-4 h-4" />
                <span>Hạn duyệt: {quote.expiryDate} (Còn 3 ngày)</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Quotation Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
        {/* Cam kết gói kết quả */}
        <div>
          <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">
            Quyền Lợi & Cam Kết Đầu Ra
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
              <span className="text-xs text-zinc-500">Mục tiêu Cam kết</span>
              <div className="text-xl font-extrabold text-zinc-900 dark:text-white mt-1">
                {formatNumber(quote.targetViews)} Views
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
              <span className="text-xs text-zinc-500">Số Creator phân bổ</span>
              <div className="text-xl font-extrabold text-zinc-900 dark:text-white mt-1">
                {quote.creatorCount} Creators
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
              <span className="text-xs text-zinc-500">Hình thức sản xuất</span>
              <div className="text-base font-bold text-zinc-900 dark:text-white mt-1">
                {campaign.campaignType === 'review' ? 'Review trực tiếp' : 'Nhắc tên / Logo'}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
              <span className="text-xs text-zinc-500">Thời gian đo Views</span>
              <div className="text-base font-bold text-zinc-900 dark:text-white mt-1">
                14 ngày / video
              </div>
            </div>
          </div>
        </div>

        {/* Bảng tính chi phí chi tiết */}
        <div>
          <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">
            Chi Tiết Bảng Giá Trọn Gói
          </h2>
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-xs font-semibold text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="px-6 py-3.5">Hạng mục dịch vụ</th>
                  <th className="px-6 py-3.5 text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                <tr>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-zinc-900 dark:text-white">
                      Phí sản xuất nội dung & Cam kết {formatNumber(quote.targetViews)} Lượt xem
                    </div>
                    <div className="text-xs text-zinc-500 mt-0.5">
                      Bao gồm thù lao cho {quote.creatorCount} Creator, kiểm duyệt nội dung, theo dõi và bù view nếu thiếu.
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-zinc-900 dark:text-white">
                    {formatCurrency(quote.contentFee)}
                  </td>
                </tr>

                <tr>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-zinc-900 dark:text-white">
                      Phụ phí quyền sử dụng lại nội dung (30 ngày)
                    </div>
                    <div className="text-xs text-zinc-500 mt-0.5">
                      Được quyền tải về và đăng tải lại trên Fanpage, TikTok chính thức của Nhãn hàng.
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-zinc-900 dark:text-white">
                    {formatCurrency(quote.usageRightsFee)}
                  </td>
                </tr>

                <tr>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-zinc-900 dark:text-white">
                      Chi phí điều phối & Logistics gửi mẫu sản phẩm
                    </div>
                    <div className="text-xs text-zinc-500 mt-0.5">
                      Đóng gói, gửi hàng mẫu tới {quote.creatorCount} Creator và theo dõi vận đơn.
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-zinc-900 dark:text-white">
                    {formatCurrency(quote.logisticsFee)}
                  </td>
                </tr>

                {/* Subtotal */}
                <tr className="bg-zinc-50/50 dark:bg-zinc-800/30 font-medium">
                  <td className="px-6 py-3.5 text-zinc-600 dark:text-zinc-400">Tổng giá trị (Chưa VAT)</td>
                  <td className="px-6 py-3.5 text-right font-bold text-zinc-900 dark:text-white">
                    {formatCurrency(quote.subtotal)}
                  </td>
                </tr>

                <tr>
                  <td className="px-6 py-3.5 text-zinc-600 dark:text-zinc-400">Thuế GTGT (VAT 8%)</td>
                  <td className="px-6 py-3.5 text-right font-semibold text-zinc-700 dark:text-zinc-300">
                    {formatCurrency(quote.vatAmount)}
                  </td>
                </tr>

                {/* Total */}
                <tr className="bg-rose-50/40 dark:bg-rose-950/20 border-t-2 border-rose-500/20">
                  <td className="px-6 py-4">
                    <span className="text-base font-extrabold text-zinc-900 dark:text-white">
                      TỔNG GIÁ TRỊ THANH TOÁN
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400">
                      {formatCurrency(quote.totalAmount)}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Lịch thanh toán 2 đợt */}
        <div className="bg-zinc-50 dark:bg-zinc-800/50 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <h3 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-3">
            Tiến Độ Thanh Toán Hợp Đồng (2 Đợt)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
              <div className="text-xs text-zinc-500">Đợt 1: Đặt cọc khi duyệt báo giá (50%)</div>
              <div className="text-lg font-bold text-zinc-900 dark:text-white mt-1">
                {formatCurrency(quote.depositAmount)}
              </div>
              <div className="text-[11px] text-emerald-600 mt-1 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Bắt đầu phân bổ Creator ngay sau khi cọc</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
              <div className="text-xs text-zinc-500">Đợt 2: Quyết toán sau khi đạt views (50%)</div>
              <div className="text-lg font-bold text-zinc-900 dark:text-white mt-1">
                {formatCurrency(quote.remainingAmount)}
              </div>
              <div className="text-[11px] text-zinc-500 mt-1">
                Nghiệm thu sau 14 ngày đo lượt xem và xuất báo cáo
              </div>
            </div>
          </div>
        </div>

        {/* Thao tác nút bấm */}
        {!isApproved && (
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setShowRevisionModal(true)}
              className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl transition"
            >
              Yêu cầu Chỉnh sửa
            </button>

            <button
              type="button"
              onClick={handleApproveAndPay}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3 text-sm font-bold bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white rounded-xl shadow-md shadow-rose-600/30 transition transform active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Chấp Thuận & Đặt Cọc 50% ({formatCurrency(quote.depositAmount)})</span>
            </button>
          </div>
        )}
      </div>

      {/* Modal Yêu cầu Chỉnh sửa */}
      {showRevisionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Yêu cầu Chỉnh sửa Báo giá</h3>
              <button onClick={() => setShowRevisionModal(false)} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-zinc-500">
              Nhập chi tiết các điều khoản bạn muốn Onstage điều chỉnh (số lượng Creator, gói views hoặc quyền sử dụng video).
            </p>
            <textarea
              rows={4}
              placeholder="Ghi chú yêu cầu điều chỉnh..."
              value={revisionNote}
              onChange={(e) => setRevisionNote(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRevisionModal(false)}
                className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 rounded-xl transition"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSubmitRevision}
                className="px-5 py-2 text-sm font-bold bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl transition"
              >
                Gửi Yêu Cầu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Đặt cọc & Thanh toán */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-xl text-center">
            {paymentSuccess ? (
              <div className="py-6 space-y-3">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Đặt cọc thành công!</h3>
                <p className="text-xs text-zinc-500">Chiến dịch đã được kích hoạt. Đội ngũ Onstage đang gửi lời mời đến các Creator.</p>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 bg-rose-100 dark:bg-rose-950/60 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Xác nhận Đặt cọc 50%</h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    Số tiền cần thanh toán: <strong className="text-rose-600 text-sm">{formatCurrency(quote.depositAmount)}</strong>
                  </p>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-xl text-left text-xs space-y-1.5 font-medium text-zinc-600 dark:text-zinc-300">
                  <div>• Ngân hàng: <strong>MB Bank</strong></div>
                  <div>• Số tài khoản: <strong>8888.9999.6868</strong></div>
                  <div>• Chủ tài khoản: <strong>CONG TY CO PHAN ONSTAGE VN</strong></div>
                  <div>• Nội dung: <strong>{campaign.campaignCode} COC50</strong></div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 py-2.5 text-sm font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl transition"
                  >
                    Đóng
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDeposit}
                    className="flex-1 py-2.5 text-sm font-bold bg-gradient-to-r from-rose-600 to-amber-600 text-white rounded-xl shadow-md transition"
                  >
                    Xác nhận Đã Chuyển
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
