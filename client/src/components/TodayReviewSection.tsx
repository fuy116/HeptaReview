import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CardWithReview } from "@shared/schema";
import { ClockIcon, CheckIcon } from "lucide-react";
import { useState } from "react";
import ReviewCardModal from "./ReviewCardModal";

interface TodayReviewSectionProps {
  cards: CardWithReview[];
  isLoading: boolean;
}

export default function TodayReviewSection({ cards, isLoading }: TodayReviewSectionProps) {
  const [selectedCard, setSelectedCard] = useState<CardWithReview | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const handleReviewCard = (card: CardWithReview) => {
    setSelectedCard(card);
    setIsReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    setIsReviewModalOpen(false);
    setSelectedCard(null);
  };

  return (
    <Card className="bg-white shadow rounded-lg mb-8 border border-gray-100">
      <CardHeader className="p-4 border-b border-gray-100">
        <div className="flex items-center">
          <ClockIcon className="text-gray-400 mr-2 h-4 w-4" />
          <h2 className="text-lg font-medium text-gray-900">今日待複習卡片</h2>
          <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
            {isLoading ? "..." : cards.length} 張
          </span>
        </div>
      </CardHeader>
      
      {isLoading ? (
        <div className="p-6">
          <Skeleton className="h-32 w-full" />
        </div>
      ) : cards.length === 0 ? (
        // Review Complete Message
        <div className="flex flex-col items-center justify-center py-12">
          <div className="bg-success-500 bg-opacity-10 rounded-full p-4 mb-4">
            <CheckIcon className="text-success-500 h-8 w-8" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-1">太棒了！今日所有卡片都已複習完畢</h3>
          <p className="text-gray-500 text-sm">明天還有 0 張卡片等待複習</p>
        </div>
      ) : (
        <div className="p-4">
          {cards.map((card) => (
            <div 
              key={card.id} 
              className="border border-gray-200 rounded-md p-4 mb-2 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{card.cardName}</h3>
                  <div className="mt-1 flex space-x-2">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {card.subject}
                    </span>
                    {card.lastReview && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                        上次熟悉度: {card.lastReview.familiarityScore}
                      </span>
                    )}
                  </div>
                  {card.note && (
                    <p className="text-sm text-gray-500 mt-1">{card.note}</p>
                  )}
                </div>
                <Button 
                  size="sm" 
                  onClick={() => handleReviewCard(card)}
                >
                  複習
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedCard && (
        <ReviewCardModal 
          isOpen={isReviewModalOpen} 
          onClose={closeReviewModal} 
          card={selectedCard} 
        />
      )}
    </Card>
  );
}
