import { useQuery } from "@tanstack/react-query";
import StatisticsCards from "@/components/StatisticsCards";
import TodayReviewSection from "@/components/TodayReviewSection";
import SubjectDistribution from "@/components/SubjectDistribution";
import FamiliarityDistribution from "@/components/FamiliarityDistribution";
import { BarChartIcon } from "lucide-react";

export default function Dashboard() {
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/stats'],
  });

  const { data: cardsForReview, isLoading: reviewsLoading } = useQuery({
    queryKey: ['/api/reviews/today'],
  });

  const { data: subjectDistribution, isLoading: subjectsLoading } = useQuery({
    queryKey: ['/api/stats/subject-distribution'],
  });

  const { data: familiarityDistribution, isLoading: familiarityLoading } = useQuery({
    queryKey: ['/api/stats/familiarity-distribution'],
  });

  const isLoading = statsLoading || reviewsLoading || subjectsLoading || familiarityLoading;

  return (
    <main className="flex-1 py-6" id="dashboard">
      <div className="container mx-auto px-4">
        <h1 className="text-xl font-semibold text-gray-900 mb-6">
          <BarChartIcon className="inline-block mr-2" size={20} /> 概覽
        </h1>
        
        <StatisticsCards 
          stats={statsData || {
            completedToday: 0,
            cardsToReviewToday: 0,
            dueSoon: 0,
            avgFamiliarity: 0
          }} 
          isLoading={isLoading}
        />
        
        <TodayReviewSection 
          cards={cardsForReview || []} 
          isLoading={isLoading} 
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SubjectDistribution 
            distribution={subjectDistribution || []} 
            isLoading={isLoading} 
          />
          
          <FamiliarityDistribution 
            distribution={familiarityDistribution || []} 
            isLoading={isLoading} 
          />
        </div>
      </div>
    </main>
  );
}
