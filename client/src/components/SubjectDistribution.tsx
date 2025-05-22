import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface SubjectDistributionProps {
  distribution: { subject: string; count: number }[];
  isLoading: boolean;
}

export default function SubjectDistribution({ distribution, isLoading }: SubjectDistributionProps) {
  // Calculate total cards across all subjects
  const totalCards = distribution.reduce((sum, item) => sum + item.count, 0);

  // Define colors for different subjects
  const subjectColors = [
    'bg-blue-500',
    'bg-green-500', 
    'bg-purple-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-lime-500',
  ];

  return (
    <Card className="bg-white shadow rounded-lg border border-gray-100">
      <CardHeader className="p-4 border-b border-gray-100">
        <h2 className="text-lg font-medium text-gray-900">科目分布</h2>
      </CardHeader>
      <CardContent className="p-4">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex items-center">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-2 flex-1 mx-2" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ) : totalCards === 0 ? (
          <div className="text-center text-gray-500 py-4">
            尚無卡片資料
          </div>
        ) : (
          <div className="space-y-3">
            {distribution
              .filter(item => item.count > 0)
              .map((item, index) => {
                const percentage = (item.count / totalCards) * 100;
                const colorClass = subjectColors[index % subjectColors.length];
                
                return (
                  <div key={item.subject} className="flex items-center">
                    <span className="text-sm text-gray-700 w-32 truncate">{item.subject}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2 mx-2">
                      <div 
                        className={`${colorClass} h-2 rounded-full transition-all duration-300`} 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500 w-24 text-right">
                      {item.count} 張 ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                );
              })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
