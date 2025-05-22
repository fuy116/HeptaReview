import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CardWithReview } from "@shared/schema";
import { ClockIcon } from "lucide-react";
import { calculateNextReview } from "@/lib/spaced-repetition";
import { useState } from "react";

interface ReviewCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: CardWithReview;
}

export default function ReviewCardModal({ isOpen, onClose, card }: ReviewCardModalProps) {
  const { toast } = useToast();
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  const createReviewMutation = useMutation({
    mutationFn: async (familiarityScore: number) => {
      const today = new Date();
      const { interval, nextReviewDate } = calculateNextReview(familiarityScore, card);
      
      const reviewData = {
        cardId: card.id,
        reviewDate: today.toISOString().split('T')[0],
        familiarityScore,
        interval,
        nextReviewDate: nextReviewDate.toISOString().split('T')[0]
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
    createReviewMutation.mutate(familiarityScore);
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 sm:mx-0 sm:h-10 sm:w-10 mb-4">
            <ClockIcon className="text-primary-600 h-6 w-6" />
          </div>
          <DialogTitle>複習卡片</DialogTitle>
        </DialogHeader>
        
        <div className="mt-2">
          <p className="text-sm text-gray-500">「{card.cardName}」科目：{card.subject}</p>
          {card.note && <p className="text-xs text-gray-400 mt-1">備註：{card.note}</p>}
        </div>
        
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">複習後熟悉度評價</h4>
          <div className="grid grid-cols-5 gap-2">
            <button
              type="button"
              className={getFamiliarityButtonStyle(1)}
              onClick={() => handleReview(1)}
              disabled={createReviewMutation.isPending}
            >
              <div className="text-center">
                <span className={`block text-xl font-medium ${getFamiliarityTextStyle(1)}`}>1</span>
                <span className="text-xs text-gray-500">不熟悉</span>
              </div>
            </button>
            
            <button
              type="button"
              className={getFamiliarityButtonStyle(2)}
              onClick={() => handleReview(2)}
              disabled={createReviewMutation.isPending}
            >
              <div className="text-center">
                <span className={`block text-xl font-medium ${getFamiliarityTextStyle(2)}`}>2</span>
                <span className="text-xs text-gray-500">略知一二</span>
              </div>
            </button>
            
            <button
              type="button"
              className={getFamiliarityButtonStyle(3)}
              onClick={() => handleReview(3)}
              disabled={createReviewMutation.isPending}
            >
              <div className="text-center">
                <span className={`block text-xl font-medium ${getFamiliarityTextStyle(3)}`}>3</span>
                <span className="text-xs text-gray-500">一般</span>
              </div>
            </button>
            
            <button
              type="button"
              className={getFamiliarityButtonStyle(4)}
              onClick={() => handleReview(4)}
              disabled={createReviewMutation.isPending}
            >
              <div className="text-center">
                <span className={`block text-xl font-medium ${getFamiliarityTextStyle(4)}`}>4</span>
                <span className="text-xs text-gray-500">熟悉</span>
              </div>
            </button>
            
            <button
              type="button"
              className={getFamiliarityButtonStyle(5)}
              onClick={() => handleReview(5)}
              disabled={createReviewMutation.isPending}
            >
              <div className="text-center">
                <span className={`block text-xl font-medium ${getFamiliarityTextStyle(5)}`}>5</span>
                <span className="text-xs text-gray-500">非常熟悉</span>
              </div>
            </button>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
          >
            取消
          </Button>
          <Button 
            type="button" 
            onClick={() => onClose()}
            disabled={createReviewMutation.isPending}
          >
            稍後複習
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
