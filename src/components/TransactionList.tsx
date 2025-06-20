import { useEffect, useState } from 'react';
import { Trash2, Calendar, MapPin, FileText, Edit, Copy, Gauge } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { FuelTransaction } from '@/pages/Index';

interface TransactionListProps {
  transactions: FuelTransaction[];
  onDelete: (id: string) => void;
  onEdit: (transaction: FuelTransaction) => void;
  onDuplicate: (transaction: FuelTransaction) => void;
}

const TransactionList = ({ transactions: localTransactions, onDelete, onEdit, onDuplicate }: TransactionListProps) => {
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState(localTransactions);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (localTransactions.length === 0) {
        setLoading(true);
        try {
          const res = await fetch('https://seventoursvietnam.com/rest-api/api/readobject_meta.php?pagenumber=1&limit=10&sortcolumn=&orderby=asc&query=&_=');
          const data = await res.json();
          
          const apiTransactions = data.body
            .filter(item => item.meta_key === 'fuel')
            .map(item => {
              const fuelData = JSON.parse(item.meta_value);
              return {
                id: item.meta_id,
                date: fuelData.date,
                amount: parseFloat(fuelData.liters),
                pricePerLiter: fuelData.price_per_liter,
                totalCost: fuelData.total_cost,
                lastKmReading: fuelData.last_km,
                kmReading: fuelData.current_km,
                location: fuelData.location,
                notes: fuelData.note
              };
            });
            
          setTransactions(apiTransactions);
        } catch (error) {
          console.error('Error fetching transactions:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchTransactions();
  }, [localTransactions]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground text-lg mb-2">
          Đang tải dữ liệu...
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground text-lg mb-2">
          Chưa có giao dịch nào
        </div>
        <p className="text-sm text-muted-foreground">
          Hãy thêm giao dịch đầu tiên bằng cách ghi âm hoặc nhập thủ công
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <Card key={transaction.id} className="border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <div className="text-lg font-semibold text-blue-600">
                    {transaction.amount.toFixed(1)} L
                  </div>
                  <div className="text-lg font-bold text-green-600">
                    {transaction.totalCost.toLocaleString('vi-VN')} ₫
                  </div>
                  {transaction.kmReading && transaction.lastKmReading && (
                    <div className="text-lg font-medium text-purple-600">
                      {(transaction.kmReading - transaction.lastKmReading).toLocaleString('vi-VN')} km
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(transaction.date).toLocaleDateString('vi-VN')}
                  </div>
                  <div>
                    Giá: {transaction.pricePerLiter.toLocaleString('vi-VN')} ₫/L
                  </div>
                  
                  {transaction.kmReading && (
                    <div className="flex items-center gap-1">
                      <Gauge className="w-4 h-4" />
                      KM: {transaction.lastKmReading?.toLocaleString('vi-VN')} → {transaction.kmReading.toLocaleString('vi-VN')}
                    </div>
                  )}
                  
                  {transaction.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {transaction.location}
                    </div>
                  )}
                  
                  {transaction.notes && (
                    <div className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      {transaction.notes}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(transaction)}
                  className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                  title="Sửa giao dịch"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDuplicate(transaction)}
                  className="text-green-500 hover:text-green-700 hover:bg-green-50"
                  title="Nhân bản giao dịch"
                >
                  <Copy className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(transaction.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  title="Xóa giao dịch"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TransactionList;
