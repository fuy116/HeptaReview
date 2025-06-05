import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CardWithReview } from "@shared/schema";
import { ClockIcon, CalendarIcon, StarIcon, NotebookIcon } from "lucide-react";

interface ReviewHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: CardWithReview;
}

export default function ReviewHistoryModal({
  isOpen,
  onClose,
  card,
}: ReviewHistoryModalProps) {
  // Get review history for this card
  const { data: reviewHistory = [], isLoading } = useQuery({
    queryKey: ["/api/cards", card.id, "reviews"],
    queryFn: async () => {
      const res = await fetch(`/api/cards/${card.id}/reviews`);
      return res.json(); // <- 確保你的 API 回傳 JSON 陣列，包含 reviewDate, reviewNotes 等欄位
    },
    enabled: isOpen,
  });

  const getFamiliarityColor = (score: number) => {
    const colors = {
      1: "text-red-600 bg-red-100",
      2: "text-orange-600 bg-orange-100",
      3: "text-yellow-600 bg-yellow-100",
      4: "text-blue-600 bg-blue-100",
      5: "text-green-600 bg-green-100",
    };
    return colors[score as keyof typeof colors] || "text-gray-600 bg-gray-100";
  };

  const getFamiliarityText = (score: number) => {
    const texts = {
      1: "不熟悉",
      2: "略知一二",
      3: "一般",
      4: "熟悉",
      5: "非常熟悉",
    };
    return texts[score as keyof typeof texts] || "未知";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2" />
            複習歷史：{card.cardName}
          </DialogTitle>
          <p className="text-sm text-gray-500">科目：{card.subject}</p>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[60vh]">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                      <Skeleton className="h-8 w-20" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : reviewHistory.length === 0 ? (
            <div className="text-center py-12">
              <NotebookIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">尚無複習記錄</p>
              <p className="text-sm text-gray-400 mt-1">
                開始複習這張卡片來建立學習歷史
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {(reviewHistory as any[]).map((review: any, index: number) => (
                <Card
                  key={review.id || index}
                  className="border-l-4 border-l-blue-500"
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          {review.reviewDate
                            ? new Date(review.reviewDate).toLocaleDateString(
                                "zh-TW",
                                {
                                  year: "numeric",
                                  month: "2-digit",
                                  day: "2-digit",
                                },
                              )
                            : "未知日期"}
                        </div>

                        {review.reviewTimeMinutes && (
                          <div className="flex items-center text-sm text-gray-600">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            {review.reviewTimeMinutes} 分鐘
                          </div>
                        )}
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getFamiliarityColor(review.familiarityScore || 1)}`}
                      >
                        <div className="flex items-center">
                          <StarIcon className="h-4 w-4 mr-1" />
                          {review.familiarityScore || 1}/5{" "}
                          {getFamiliarityText(review.familiarityScore || 1)}
                        </div>
                      </div>
                    </div>

                    {review.reviewNotes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700 font-medium mb-1">
                          複習心得：
                        </p>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {review.reviewNotes}
                        </p>
                      </div>
                    )}

                    {/* Debug info - temporary */}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose}>關閉</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
