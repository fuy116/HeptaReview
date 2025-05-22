import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface FamiliarityDistributionProps {
  distribution: { level: number; count: number }[];
  isLoading: boolean;
}

export default function FamiliarityDistribution({ distribution, isLoading }: FamiliarityDistributionProps) {
  const getFamiliarityClass = (level: number) => {
    const classes = {
      1: "familiarity-1 bg-red-100",
      2: "familiarity-2 bg-orange-100",
      3: "familiarity-3 bg-yellow-100",
      4: "familiarity-4 bg-green-100",
      5: "familiarity-5 bg-green-100",
    };
    
    return classes[level as keyof typeof classes] || "";
  };

  return (
    <Card className="bg-white shadow rounded-lg border border-gray-100">
      <CardHeader className="p-4 border-b border-gray-100">
        <h2 className="text-lg font-medium text-gray-900">熟悉度分布</h2>
      </CardHeader>
      <CardContent className="p-4">
        {isLoading ? (
          <div className="grid grid-cols-5 gap-4 mb-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="text-center">
                <Skeleton className="h-12 w-full mb-2 rounded-md" />
                <Skeleton className="h-4 w-4 mx-auto" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-4 mb-4">
            {distribution.map((item) => (
              <div key={item.level} className="text-center">
                <div className={`rounded-md p-3 ${getFamiliarityClass(item.level)} mb-2`}>
                  <span className="font-medium text-gray-800">{item.level}級</span>
                </div>
                <span className="text-sm text-gray-600">{item.count}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
