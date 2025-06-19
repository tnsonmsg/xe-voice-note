
import { Card, CardContent } from '@/components/ui/card';
import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  gradient: string;
}

const StatsCard = ({ title, value, icon, gradient }: StatsCardProps) => {
  return (
    <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow">
      <CardContent className="p-0">
        <div className={`bg-gradient-to-r ${gradient} p-4 text-white`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium">{title}</p>
              <p className="text-2xl font-bold">{value}</p>
            </div>
            <div className="bg-white/20 p-2 rounded-full">
              {icon}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
