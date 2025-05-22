import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardWithReview } from "@shared/schema";
import { FileType2, PencilIcon, TrashIcon, SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format, formatDistanceToNow } from "date-fns";
import ReviewCardModal from "@/components/ReviewCardModal";

interface CardManagementProps {
  onAddCard: () => void;
}

export default function CardManagement({ onAddCard }: CardManagementProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("全部");
  const [selectedCard, setSelectedCard] = useState<CardWithReview | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const { data: cards = [], isLoading: isCardsLoading } = useQuery({
    queryKey: ['/api/cards'],
  });

  const { data: subjects = [], isLoading: isSubjectsLoading } = useQuery({
    queryKey: ['/api/subjects'],
  });
  
  const deleteCardMutation = useMutation({
    mutationFn: async (cardId: number) => {
      await apiRequest('DELETE', `/api/cards/${cardId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cards'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats/subject-distribution'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats/familiarity-distribution'] });
      toast({
        title: "卡片已刪除",
        description: "卡片已成功刪除",
      });
    },
    onError: () => {
      toast({
        title: "刪除失敗",
        description: "刪除卡片時發生錯誤",
        variant: "destructive",
      });
    }
  });

  const handleDeleteCard = (cardId: number) => {
    if (window.confirm("確定要刪除這張卡片嗎？此操作無法撤銷。")) {
      deleteCardMutation.mutate(cardId);
    }
  };

  const handleReviewCard = (card: CardWithReview) => {
    setSelectedCard(card);
    setIsReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    setIsReviewModalOpen(false);
    setSelectedCard(null);
  };

  // Filter cards based on search term and selected subject
  const filteredCards = cards.filter((card: CardWithReview) => {
    const matchesSearch = card.cardName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (card.note && card.note.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSubject = selectedSubject === "全部" || card.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const getFamiliarityClass = (score?: number) => {
    if (!score) return "";
    
    const colorClasses = {
      1: "bg-red-100 text-red-800",
      2: "bg-orange-100 text-orange-800",
      3: "bg-yellow-100 text-yellow-800",
      4: "bg-green-100 text-green-800",
      5: "bg-green-100 text-green-800",
    };
    
    return colorClasses[score as keyof typeof colorClasses] || "";
  };

  const isLoading = isCardsLoading || isSubjectsLoading;

  return (
    <main className="flex-1 py-6">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold text-gray-900">
            <FileType2 className="inline-block mr-2" size={20} /> 卡片管理
          </h1>
          
          <Button onClick={onAddCard}>
            <span className="ri-add-line mr-1">+</span> 新增卡片
          </Button>
        </div>
        
        {/* Search & Filters */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-4 w-4 text-gray-400" />
              </div>
              <Input 
                type="text" 
                className="pl-10" 
                placeholder="搜尋卡片名稱或備註..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-64">
              <Select 
                value={selectedSubject} 
                onValueChange={setSelectedSubject}
              >
                <SelectTrigger>
                  <SelectValue placeholder="選擇科目" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="全部">全部</SelectItem>
                  {subjects.map((subject: { id: number, name: string }) => (
                    <SelectItem key={subject.id} value={subject.name}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {/* Card Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  卡片名稱 <span className="ri-arrow-down-s-line">▼</span>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  科目 <span className="ri-arrow-down-s-line">▼</span>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  熟悉度 <span className="ri-arrow-down-s-line">▼</span>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  上次複習 <span className="ri-arrow-down-s-line">▼</span>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  下次複習 <span className="ri-arrow-down-s-line">▼</span>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  建立時間 <span className="ri-arrow-down-s-line">▼</span>
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  動作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    正在加載...
                  </td>
                </tr>
              ) : filteredCards.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    尚無卡片。請點擊「新增卡片」按鈕添加。
                  </td>
                </tr>
              ) : (
                filteredCards.map((card: CardWithReview) => (
                  <tr key={card.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{card.cardName}</div>
                      {card.note && <div className="text-xs text-gray-500">{card.note}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {card.subject}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {card.lastReview ? (
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getFamiliarityClass(card.lastReview.familiarityScore)}`}>
                          <span className="ri-fire-fill mr-1">🔥</span> {card.lastReview.familiarityScore}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">未評分</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {card.lastReview ? format(new Date(card.lastReview.reviewDate), 'yyyy-MM-dd') : '–'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {card.lastReview ? (
                        <>
                          <div className="text-sm text-primary-600">{format(new Date(card.lastReview.nextReviewDate), 'yyyy-MM-dd')}</div>
                          <div className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(card.lastReview.nextReviewDate), { addSuffix: true })}
                          </div>
                        </>
                      ) : (
                        <span className="text-xs text-gray-500">–</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(card.createdAt), 'yyyy-MM-dd')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary-600 hover:text-primary-900 mr-1"
                        onClick={() => handleReviewCard(card)}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDeleteCard(card.id)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {selectedCard && (
        <ReviewCardModal 
          isOpen={isReviewModalOpen} 
          onClose={closeReviewModal} 
          card={selectedCard} 
        />
      )}
    </main>
  );
}
