import { ArrowLeft, Clock, Calendar, Star, BookOpen, Target, TrendingUp } from "lucide-react";
import { useMemo } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { CardWithReview } from "@shared/schema";

function generateStars(rating: number, maxRating: number) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxRating }, (_, i) => (
        <Star 
          key={i}
          className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );
}

export default function ReviewHistoryPage() {
  const { id } = useParams();
  const [, navigate] = useLocation();

  // 取得卡片資訊
  const { data: card, isLoading: isCardLoading } = useQuery<CardWithReview>({
    queryKey: ["/api/cards", id],
    queryFn: async () => {
      const res = await fetch(`/api/cards/${id}`);
      if (!res.ok) throw new Error("Failed to fetch card");
      return res.json();
    },
    enabled: !!id,
  });

  // 取得複習紀錄
  const { data: reviewsRaw = [], isLoading } = useQuery({
    queryKey: [`/api/cards/${id}/reviews`],
    queryFn: async () => {
      const res = await fetch(`/api/cards/${id}/reviews`);
      if (!res.ok) throw new Error("Failed to fetch reviews");
      return res.json();
    },
    enabled: !!id,
  });
  const reviews: any[] = Array.isArray(reviewsRaw) ? reviewsRaw : [];

  // 進度概覽計算
  const overview = useMemo(() => {
    if (!reviews.length) return { total: 0, avg: 0, last: '-', trend: 0 };
    const total = reviews.length;
    const avg = (reviews.reduce((sum, r) => sum + (r.familiarityScore || 0), 0) / total).toFixed(1);
    // 計算趨勢 (最近3次 vs 之前的平均)
    const recent = reviews.slice(0, 3);
    const older = reviews.slice(3);
    const recentAvg = recent.length ? recent.reduce((sum, r) => sum + (r.familiarityScore || 0), 0) / recent.length : 0;
    const olderAvg = older.length ? older.reduce((sum, r) => sum + (r.familiarityScore || 0), 0) / older.length : recentAvg;
    const trend = recentAvg - olderAvg;
    // 取最新一筆的 reviewDate
    const lastDate = reviews[0]?.reviewDate;
    let last = '-';
    if (lastDate) {
      const lastD = new Date(lastDate);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - lastD.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      last = diffDays === 0 ? '今天' : `${diffDays}天前`;
    }
    return { total, avg, last, trend };
  }, [reviews]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 px-4">
        {/* Header 區域 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
          <div className="p-6">
            {/* 返回按鈕和標題 */}
            <div className="flex items-center justify-between mb-6">
              <button 
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
                onClick={() => navigate("/cards")}
              >
                <ArrowLeft className="w-4 h-4" />
                返回卡片管理
              </button>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <BookOpen className="w-4 h-4" />
                複習歷史
              </div>
            </div>

            {/* 卡片資訊 */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {isCardLoading ? '載入中...' : card?.cardName || '找不到卡片'}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  科目：{card?.subject || '--'}
                </div>
                {card?.note && (
                  <div className="text-gray-500">
                    備註：{card.note}
                  </div>
                )}
              </div>
            </div>

            {/* 進度概覽 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">{overview.total}</div>
                <div className="text-sm text-blue-700 font-medium">複習次數</div>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">{overview.avg}</div>
                <div className="text-sm text-green-700 font-medium">平均分數</div>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">{overview.last}</div>
                <div className="text-sm text-purple-700 font-medium">最後複習</div>
              </div>
              <div className="bg-orange-50 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <span className="text-2xl font-bold text-orange-600">
                    {overview.trend > 0 ? '+' : ''}{overview.trend.toFixed(1)}
                  </span>
                  <TrendingUp className={`w-4 h-4 ${overview.trend >= 0 ? 'text-green-500' : 'text-red-500 rotate-180'}`} />
                </div>
                <div className="text-sm text-orange-700 font-medium">進步趨勢</div>
              </div>
            </div>
          </div>
        </div>

        {/* 複習時間軸 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
              <Calendar className="w-5 h-5 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">複習時間軸</h2>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">載入中...</span>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-gray-400" />
                </div>
                <div className="text-gray-600 font-medium mb-2">還沒有複習紀錄</div>
                <div className="text-sm text-gray-400">開始複習這張卡片吧！</div>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review, idx) => (
                  <div key={review.id}>
                    <div className={`p-4 rounded-xl border-2 ${
                      idx === 0 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      {/* 日期和時間 */}
                      <div className="flex flex-wrap items-center gap-4 mb-3">
                        <div className="flex items-center gap-2 text-gray-700 font-medium">
                          <Calendar className="w-4 h-4" />
                          {review.reviewDate}
                        </div>
                        {review.reviewTimeMinutes && (
                          <div className="flex items-center gap-2 text-gray-600 text-sm">
                            <Clock className="w-4 h-4" />
                            {review.reviewTimeMinutes} 分鐘
                          </div>
                        )}
                      </div>

                      {/* 評分和詳細資訊 */}
                      <div className="flex flex-wrap items-center gap-4 mb-3">
                        <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border">
                          {generateStars(review.familiarityScore, 5)}
                          <span className="font-semibold text-gray-700 ml-1">
                            {review.familiarityScore}/5
                          </span>
                        </div>
                        
                        {review.interval && (
                          <div className="text-sm text-gray-600 bg-white rounded-lg px-3 py-2 border">
                            間隔：{review.interval} 天
                          </div>
                        )}
                        
                        {review.nextReviewDate && (
                          <div className="text-sm text-gray-600 bg-white rounded-lg px-3 py-2 border">
                            下次複習：{review.nextReviewDate}
                          </div>
                        )}
                      </div>

                      {/* 複習心得 */}
                      {review.reviewNotes && (
                        <div className="bg-white rounded-lg p-3 border-l-4 border-blue-400">
                          <div className="text-sm font-medium text-gray-700 mb-1">複習心得</div>
                          <div className="text-sm text-gray-600 leading-relaxed">
                            {review.reviewNotes}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 