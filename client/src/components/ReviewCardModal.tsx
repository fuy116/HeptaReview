import { useMutation } from "@tanstack/react-query";
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
import { Label } from "@/components/ui/label";
import ReviewHistoryModal from "./ReviewHistoryModal";

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
  const [showHistoryModal, setShowHistoryModal] = useState(false);

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

  const handleRatingSelect = (familiarityScore: number) => {
    setSelectedRating(familiarityScore);
  };

  const handleSubmitReview = () => {
    if (selectedRating === null) return;
    
    const reviewTimeMinutes = reviewTime ? parseInt(reviewTime) : undefined;
    createReviewMutation.mutate({ 
      familiarityScore: selectedRating, 
      reviewTimeMinutes,
      reviewNotes: reviewNotes.trim() || undefined
    });
  };

  const resetForm = () => {
    setSelectedRating(null);
    setReviewTime("");
    setReviewNotes("");
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
              onClick={() => setShowHistoryModal(true)}
            >
              <HistoryIcon className="h-4 w-4 mr-1" />
              查看歷史
            </Button>
          </div>
        </DialogHeader>
        
        <div className="mt-2">
          <p className="text-sm text-gray-500">「{card.cardName}」科目：{card.subject}</p>
          {card.note && <p className="text-xs text-gray-400 mt-1">備註：{card.note}</p>}
        </div>
        
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">複習後熟悉度評價</h4>
          <div className="grid grid-cols-5 gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                className={getFamiliarityButtonStyle(rating)}
                onClick={() => handleRatingSelect(rating)}
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
              <Label htmlFor="reviewTime" className="text-sm font-medium text-gray-700">
                複習時間（分鐘）
              </Label>
              <Input
                id="reviewTime"
                type="number"
                placeholder="請輸入複習所花費的時間"
                value={reviewTime}
                onChange={(e) => setReviewTime(e.target.value)}
                min="1"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="reviewNotes" className="text-sm font-medium text-gray-700">
                複習心得
              </Label>
              <Textarea
                id="reviewNotes"
                placeholder="記錄本次複習的心得和狀況..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={3}
                className="mt-1"
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
            稍後複習
          </Button>
          <Button 
            type="button" 
            onClick={handleSubmitReview}
            disabled={selectedRating === null || createReviewMutation.isPending}
          >
            {createReviewMutation.isPending ? "處理中..." : "完成複習"}
          </Button>
        </DialogFooter>
      </DialogContent>
      
      <ReviewHistoryModal 
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        card={card}
      />
    </Dialog>
  );
}
