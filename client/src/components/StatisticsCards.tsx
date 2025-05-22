import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarIcon, ClockIcon, BookOpenIcon, TrendingUpIcon, TrendingDownIcon } from "lucide-react";

interface StatisticsCardsProps {
  stats: {
    completedToday: number;
    cardsToReviewToday: number;
    dueSoon: number;
    avgFamiliarity: number;
  };
  isLoading: boolean;
}

export default function StatisticsCards({ stats, isLoading }: StatisticsCardsProps) {
  const progressPercentage = stats.cardsToReviewToday > 0
    ? Math.round((stats.completedToday / stats.cardsToReviewToday) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Today's Review Card */}
      <Card className="bg-white shadow rounded-lg p-4 border border-gray-100">
        <div className="flex items-center mb-2">
          <h2 className="text-sm text-gray-500 font-medium">今日複習進度</h2>
          <CalendarIcon className="ml-auto text-primary-500 h-4 w-4" />
        </div>
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-24 mb-3" />
            <Skeleton className="h-2 w-full mb-3" />
            <Skeleton className="h-4 w-32" />
          </>
        ) : (
          <>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-gray-900">{stats.completedToday}</span>
              <span className="text-3xl font-bold text-gray-400">/</span>
              <span className="text-3xl font-bold text-gray-400">{stats.cardsToReviewToday}</span>
              <span className="text-sm text-gray-500 ml-1">已完成</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div 
                className="bg-primary-500 h-2 rounded-full" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              <TrendingUpIcon className="inline-block h-3 w-3 text-success-500 mr-1" /> 較上週增加 +18 張
            </div>
          </>
        )}
      </Card>
      
      {/* Due Soon Card */}
      <Card className="bg-white shadow rounded-lg p-4 border border-gray-100">
        <div className="flex items-center mb-2">
          <h2 className="text-sm text-gray-500 font-medium">即將到期卡片</h2>
          <ClockIcon className="ml-auto text-warning-500 h-4 w-4" />
        </div>
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-24 mb-6" />
            <Skeleton className="h-4 w-32" />
          </>
        ) : (
          <>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-gray-900">{stats.dueSoon}</span>
              <span className="text-sm text-gray-500 ml-1">未來7天</span>
            </div>
            <div className="text-xs text-gray-500 mt-6">
              <TrendingUpIcon className="inline-block h-3 w-3 text-warning-500 mr-1" /> 較上週增加 +18 張
            </div>
          </>
        )}
      </Card>
      
      {/* Average Score Card */}
      <Card className="bg-white shadow rounded-lg p-4 border border-gray-100">
        <div className="flex items-center mb-2">
          <h2 className="text-sm text-gray-500 font-medium">平均熟悉度</h2>
          <BookOpenIcon className="ml-auto text-success-500 h-4 w-4" />
        </div>
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-24 mb-6" />
            <Skeleton className="h-4 w-32" />
          </>
        ) : (
          <>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-gray-900">{stats.avgFamiliarity.toFixed(1)}</span>
              <span className="text-sm text-gray-500 ml-1">/ 5.0</span>
            </div>
            <div className="text-xs text-gray-500 mt-6">
              <TrendingDownIcon className="inline-block h-3 w-3 text-danger-500 mr-1" /> 較上月降低 -3.1 分
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
