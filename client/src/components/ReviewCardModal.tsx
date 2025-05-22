import { useMutation, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CardWithReview } from "@shared/schema";
import { ClockIcon, HistoryIcon } from "lucide-react";
import { calculateNextReview } from "@/lib/spaced-repetition";
import { useState } from "react";
import { format } from "date-fns";

interface ReviewCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: CardWithReview;
}

export default function ReviewCardModal({ isOpen, onClose, card }: ReviewCardModalProps) {
  const { toast } = useToast();
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [reviewTime, setReviewTime] = useState<string>("");
  const [reviewNotes, setReviewNotes] = useState<string>("");
  const [showHistory, setShowHistory] = useState(false);

  // Get review history for this card
  const { data: reviewHistory = [] } = useQuery({
    queryKey: ['/api/cards', card.id, 'reviews'],
    enabled: isOpen && showHistory,
  });

  const createReviewMutation = useMutation({
    mutationFn: async (data: { familiarityScore: number; reviewTimeMinutes?: number; reviewNotes?: string }) => {
      const today = new Date();
      const { interval, nextReviewDate } = calculateNextReview(data.familiarityScore, card);
      
      const reviewData = {
        cardId: card.id,
        reviewDate: today.toISOString().split('T')[0],
        familiarityScore: data.familiarityScore,
        interval,
        nextReviewDate: nextReviewDate.toISOString().split('T')[0],
        reviewTimeMinutes: data.reviewTimeMinutes,
        reviewNotes: data.reviewNotes
      };
      
      const response = await apiRequest('POST', '/api/reviews', reviewData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cards'] });
      queryClient.invalidateQueries({ queryKey: ['/api/reviews/today'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats/familiarity-distribution'] });
      toast({
        title: "複習已更新",
        description: "卡片複習狀態已成功更新",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "更新失敗",
        description: "更新複習狀態時發生錯誤",
        variant: "destructive",
      });
    }
  });

  const handleReview = (familiarityScore: number) => {
    setSelectedRating(familiarityScore);
    const reviewTimeMinutes = reviewTime ? parseInt(reviewTime) : undefined;
    createReviewMutation.mutate({ 
      familiarityScore, 
      reviewTimeMinutes,
      reviewNotes: reviewNotes.trim() || undefined
    });
  };

  const resetForm = () => {
    setSelectedRating(null);
    setReviewTime("");
    setReviewNotes("");
    setShowHistory(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const getFamiliarityButtonStyle = (rating: number) => {
    const isSelected = rating === selectedRating;
    
    const baseStyle = "p-3 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent transition-colors";
    const colorStyles = {
      1: `${isSelected ? "bg-red-50 border-red-500 ring-red-500" : "border-gray-300 hover:bg-red-50 focus:ring-red-500"}`,
      2: `${isSelected ? "bg-orange-50 border-orange-500 ring-orange-500" : "border-gray-300 hover:bg-orange-50 focus:ring-orange-500"}`,
      3: `${isSelected ? "bg-yellow-50 border-yellow-500 ring-yellow-500" : "border-gray-300 hover:bg-yellow-50 focus:ring-yellow-500"}`,
      4: `${isSelected ? "bg-green-50 border-green-500 ring-green-500" : "border-gray-300 hover:bg-green-50 focus:ring-green-500"}`,
      5: `${isSelected ? "bg-green-50 border-green-500 ring-green-500" : "border-gray-300 hover:bg-green-50 focus:ring-green-500"}`,
    };
    
    return `${baseStyle} ${colorStyles[rating as keyof typeof colorStyles]}`;
  };

  const getFamiliarityTextStyle = (rating: number) => {
    const colorStyles = {
      1: "text-red-600",
      2: "text-orange-600",
      3: "text-yellow-600",
      4: "text-green-600",
      5: "text-green-600",
    };
    
    return colorStyles[rating as keyof typeof colorStyles];
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-primary-100 mr-3">
                <ClockIcon className="text-primary-600 h-6 w-6" />
              </div>
              <DialogTitle>複習卡片</DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
            >
              <HistoryIcon className="h-4 w-4 mr-1" />
              歷史記錄
            </Button>
          </div>
        </DialogHeader>
        
        <div className="mt-2">
          <p className="text-sm text-gray-500">「{card.cardName}」科目：{card.subject}</p>
          {card.note && <p className="text-xs text-gray-400 mt-1">備註：{card.note}</p>}
        </div>

        {showHistory && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-3">複習歷史</h4>
            {reviewHistory.length === 0 ? (
              <p className="text-sm text-gray-500">尚無複習記錄</p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {reviewHistory.map((review: any, index: number) => (
                  <div key={index} className="flex justify-between items-start text-sm p-2 bg-white rounded border">
                    <div>
                      <p className="font-medium">{format(new Date(review.reviewDate), 'yyyy-MM-dd')}</p>
                      <p className="text-gray-600">熟悉度: {review.familiarityScore}/5</p>
                      {review.reviewTimeMinutes && (
                        <p className="text-gray-600">用時: {review.reviewTimeMinutes} 分鐘</p>
                      )}
                      {review.reviewNotes && (
                        <p className="text-gray-600 mt-1">{review.reviewNotes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">複習後熟悉度評價</h4>
          <div className="grid grid-cols-5 gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                className={getFamiliarityButtonStyle(rating)}
                onClick={() => handleReview(rating)}
                disabled={createReviewMutation.isPending}
              >
                <div className="text-center">
                  <span className={`block text-xl font-medium ${getFamiliarityTextStyle(rating)}`}>{rating}</span>
                  <span className="text-xs text-gray-500">
                    {rating === 1 && "不熟悉"}
                    {rating === 2 && "略知一二"}
                    {rating === 3 && "一般"}
                    {rating === 4 && "熟悉"}
                    {rating === 5 && "非常熟悉"}
                  </span>
                </div>
              </button>
            ))}
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                複習時間（分鐘）
              </label>
              <Input
                type="number"
                placeholder="請輸入複習所花費的時間"
                value={reviewTime}
                onChange={(e) => setReviewTime(e.target.value)}
                min="1"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                複習心得
              </label>
              <Textarea
                placeholder="記錄本次複習的心得和狀況..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClose}
          >
            取消
          </Button>
          <Button 
            type="button" 
            variant="outline"
            onClick={handleClose}
            disabled={createReviewMutation.isPending}
          >
            稍後複習
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
