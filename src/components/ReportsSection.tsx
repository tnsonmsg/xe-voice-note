import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import { BarChart3, TrendingUp, Calendar, Fuel, Gauge } from 'lucide-react';
import type { FuelTransaction } from '@/pages/Index';

interface ReportsSectionProps {
  transactions: FuelTransaction[];
}

const ReportsSection = ({ transactions }: ReportsSectionProps) => {
  const [activeTab, setActiveTab] = useState('month');

  // Helper functions for date calculations
  const getDateRanges = (period: string) => {
    const now = new Date();
    const ranges: Date[] = [];
    
    switch (period) {
      case 'day':
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          ranges.push(date);
        }
        break;
      case 'week':
        for (let i = 7; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - (i * 7));
          ranges.push(date);
        }
        break;
      case 'month':
        for (let i = 11; i >= 0; i--) {
          const date = new Date(now);
          date.setMonth(date.getMonth() - i);
          ranges.push(date);
        }
        break;
      case 'year':
        for (let i = 4; i >= 0; i--) {
          const date = new Date(now);
          date.setFullYear(date.getFullYear() - i);
          ranges.push(date);
        }
        break;
    }
    return ranges;
  };

  const getReportData = (period: string) => {
    const ranges = getDateRanges(period);
    
    return ranges.map(date => {
      let filteredTransactions: FuelTransaction[] = [];
      const dateStr = date.toISOString().split('T')[0];
      
      switch (period) {
        case 'day':
          filteredTransactions = transactions.filter(t => t.date === dateStr);
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          filteredTransactions = transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate >= weekStart && transactionDate <= weekEnd;
          });
          break;
        case 'month':
          filteredTransactions = transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate.getMonth() === date.getMonth() && 
                   transactionDate.getFullYear() === date.getFullYear();
          });
          break;
        case 'year':
          filteredTransactions = transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate.getFullYear() === date.getFullYear();
          });
          break;
      }

      const totalCost = filteredTransactions.reduce((sum, t) => sum + t.totalCost, 0);
      const totalLiters = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
      const transactionCount = filteredTransactions.length;
      const avgPrice = totalLiters > 0 ? totalCost / totalLiters : 0;

      // Calculate KM data
      const transactionsWithKm = filteredTransactions.filter(t => t.kmReading && t.lastKmReading);
      const totalKmDriven = transactionsWithKm.reduce((sum, t) => 
        sum + (t.kmReading! - t.lastKmReading!), 0
      );
      const avgKmPerTransaction = transactionsWithKm.length > 0 ? 
        totalKmDriven / transactionsWithKm.length : 0;

      let label = '';
      switch (period) {
        case 'day':
          label = date.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' });
          break;
        case 'week':
          label = `Tuần ${Math.ceil(date.getDate() / 7)}/${date.getMonth() + 1}`;
          break;
        case 'month':
          label = date.toLocaleDateString('vi-VN', { month: 'short', year: '2-digit' });
          break;
        case 'year':
          label = date.getFullYear().toString();
          break;
      }

      return {
        period: label,
        totalCost,
        totalLiters,
        transactionCount,
        avgPrice,
        totalKmDriven,
        avgKmPerTransaction,
        transactions: filteredTransactions
      };
    });
  };

  const chartConfig = {
    totalCost: {
      label: "Tổng chi phí",
      theme: {
        light: "#3b82f6",
        dark: "#60a5fa"
      }
    },
    totalLiters: {
      label: "Tổng lít",
      theme: {
        light: "#10b981",
        dark: "#34d399"
      }
    },
    totalKmDriven: {
      label: "Tổng KM",
      theme: {
        light: "#f59e0b",
        dark: "#fbbf24"
      }
    },
  };

  const renderTabContent = (period: string) => {
    const data = getReportData(period);
    const totalStats = data.reduce((acc, item) => ({
      totalCost: acc.totalCost + item.totalCost,
      totalLiters: acc.totalLiters + item.totalLiters,
      transactionCount: acc.transactionCount + item.transactionCount,
      totalKmDriven: acc.totalKmDriven + item.totalKmDriven
    }), { totalCost: 0, totalLiters: 0, transactionCount: 0, totalKmDriven: 0 });

    const avgPrice = totalStats.totalLiters > 0 ? totalStats.totalCost / totalStats.totalLiters : 0;
    const avgKmPerTransaction = totalStats.transactionCount > 0 ? 
      totalStats.totalKmDriven / totalStats.transactionCount : 0;

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {totalStats.totalCost.toLocaleString('vi-VN')} ₫
              </div>
              <p className="text-sm text-muted-foreground">Tổng chi phí</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {totalStats.totalLiters.toFixed(1)} L
              </div>
              <p className="text-sm text-muted-foreground">Tổng lít xăng</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">
                {totalStats.transactionCount}
              </div>
              <p className="text-sm text-muted-foreground">Số lần đổ</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">
                {avgPrice.toLocaleString('vi-VN')} ₫
              </div>
              <p className="text-sm text-muted-foreground">Giá TB/L</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">
                {avgKmPerTransaction.toFixed(0)} km
              </div>
              <p className="text-sm text-muted-foreground">TB KM/lần</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                Chi phí theo {period === 'day' ? 'ngày' : period === 'week' ? 'tuần' : period === 'month' ? 'tháng' : 'năm'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ChartContainer config={chartConfig} className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis 
                      dataKey="period" 
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                      tickLine={{ stroke: "hsl(var(--border))" }}
                    />
                    <YAxis 
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                      tickLine={{ stroke: "hsl(var(--border))" }}
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                    />
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                      cursor={{ fill: "hsl(var(--muted))", opacity: 0.1 }}
                    />
                    <Bar 
                      dataKey="totalCost" 
                      fill="var(--color-totalCost)"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={60}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Gauge className="w-5 h-5 text-orange-500" />
                KM theo {period === 'day' ? 'ngày' : period === 'week' ? 'tuần' : period === 'month' ? 'tháng' : 'năm'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ChartContainer config={chartConfig} className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis 
                      dataKey="period" 
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                      tickLine={{ stroke: "hsl(var(--border))" }}
                    />
                    <YAxis 
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                      tickLine={{ stroke: "hsl(var(--border))" }}
                    />
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                      cursor={{ stroke: "hsl(var(--muted-foreground))", strokeWidth: 1, strokeDasharray: "3 3" }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="totalKmDriven" 
                      stroke="var(--color-totalKmDriven)"
                      strokeWidth={3}
                      dot={{ fill: "var(--color-totalKmDriven)", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: "var(--color-totalKmDriven)", strokeWidth: 2, fill: "white" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Combined Chart */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Biểu đồ tổng hợp - Chi phí & Lượng xăng
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ChartContainer config={chartConfig} className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis 
                    dataKey="period" 
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <YAxis 
                    yAxisId="cost"
                    orientation="left"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickLine={{ stroke: "hsl(var(--border))" }}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                  />
                  <YAxis 
                    yAxisId="liters"
                    orientation="right"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickLine={{ stroke: "hsl(var(--border))" }}
                    tickFormatter={(value) => `${value.toFixed(0)}L`}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    cursor={{ fill: "hsl(var(--muted))", opacity: 0.1 }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: "20px" }}
                    iconType="rect"
                  />
                  <Bar 
                    yAxisId="cost"
                    dataKey="totalCost" 
                    name="Chi phí (₫)"
                    fill="var(--color-totalCost)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                  <Bar 
                    yAxisId="liters"
                    dataKey="totalLiters" 
                    name="Lượng xăng (L)"
                    fill="var(--color-totalLiters)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Chi tiết báo cáo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[120px]">Khoảng thời gian</TableHead>
                    <TableHead className="text-right min-w-[80px]">Số lần đổ</TableHead>
                    <TableHead className="text-right min-w-[80px]">Tổng lít</TableHead>
                    <TableHead className="text-right min-w-[120px]">Tổng chi phí</TableHead>
                    <TableHead className="text-right min-w-[100px]">Giá TB/L</TableHead>
                    <TableHead className="text-right min-w-[80px]">Tổng KM</TableHead>
                    <TableHead className="text-right min-w-[80px]">TB KM/lần</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((row, index) => (
                    <TableRow key={index} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{row.period}</TableCell>
                      <TableCell className="text-right">{row.transactionCount}</TableCell>
                      <TableCell className="text-right">{row.totalLiters.toFixed(1)} L</TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        {row.totalCost.toLocaleString('vi-VN')} ₫
                      </TableCell>
                      <TableCell className="text-right">{row.avgPrice.toLocaleString('vi-VN')} ₫</TableCell>
                      <TableCell className="text-right">{row.totalKmDriven.toFixed(0)} km</TableCell>
                      <TableCell className="text-right">{row.avgKmPerTransaction.toFixed(0)} km</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-500" />
          Báo cáo thống kê
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="day">Theo ngày</TabsTrigger>
            <TabsTrigger value="week">Theo tuần</TabsTrigger>
            <TabsTrigger value="month">Theo tháng</TabsTrigger>
            <TabsTrigger value="year">Theo năm</TabsTrigger>
          </TabsList>
          
          <TabsContent value="day" className="mt-6">
            {renderTabContent('day')}
          </TabsContent>
          
          <TabsContent value="week" className="mt-6">
            {renderTabContent('week')}
          </TabsContent>
          
          <TabsContent value="month" className="mt-6">
            {renderTabContent('month')}
          </TabsContent>
          
          <TabsContent value="year" className="mt-6">
            {renderTabContent('year')}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ReportsSection;
