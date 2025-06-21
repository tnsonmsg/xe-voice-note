import { useState, useEffect } from 'react';
import { Car, Fuel, Mic, Plus, TrendingUp, History, BarChart3, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import VoiceRecorder from '@/components/VoiceRecorder';
import TransactionList from '@/components/TransactionList';
import StatsCard from '@/components/StatsCard';
import AddTransactionModal from '@/components/AddTransactionModal';
import ReportsSection from '@/components/ReportsSection';
import UserModeSelector from '@/components/UserModeSelector';
import ExportButtons from '@/components/ExportButtons';
import { UserProvider } from '@/contexts/UserContext';

export interface FuelTransaction {
  id: string;
  date: string;
  amount: number;
  pricePerLiter: number;
  totalCost: number;
  location?: string;
  notes?: string;
  kmReading?: number;
  lastKmReading?: number;
}

// Giả sử bạn có biến xác định chế độ người dùng đăng ký (online)
var isOnlineUser = false; // Thay bằng logic thực tế của bạn
const savedMode = localStorage.getItem('userMode');
    //const savedUser = localStorage.getItem('googleUser');
    
    if (savedMode === 'registered') {
      isOnlineUser = true;
    }

function useEffectOnline(setTransactions: (txs: FuelTransaction[]) => void) {
  useEffect(() => {
    if (!isOnlineUser) return;
    const fetchData = async () => {
      try {
        const res = await fetch('https://seventoursvietnam.com/rest-api/api/readobject_meta.php?pagenumber=1&limit=100&sortcolumn=&orderby=asc&query=fuel&_=');
        const data = await res.json();
        // Map dữ liệu từ API về FuelTransaction[]
        
          
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
        const transactions: FuelTransaction[] = apiTransactions.map(tx => ({
          ...tx,
          date: new Date(tx.date).toISOString().split('T')[0], // Định dạng lại ngày
        }));
        // Cập nhật state và localStorage

        setTransactions(transactions);
        localStorage.setItem('fuelTransactions', JSON.stringify(transactions));
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu từ API:', error);
      }
    };
    fetchData();
    // eslint-disable-next-line
  }, [setTransactions]);
}

const Index = () => {
  const [transactions, setTransactions] = useState<FuelTransaction[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<FuelTransaction | null>(null);
  const [activeTab, setActiveTab] = useState('history');

  // Load transactions from localStorage
  useEffect(() => {
    if (isOnlineUser === true) {
      useEffectOnline(setTransactions);
      return; // Skip localStorage loading if online user
    }
    const savedTransactions = localStorage.getItem('fuelTransactions');
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
  }, []);

  // Save transactions to localStorage
  useEffect(() => {
    localStorage.setItem('fuelTransactions', JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (transaction: Omit<FuelTransaction, 'id'>) => {
    const newTransaction: FuelTransaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setTransactions([newTransaction, ...transactions]);
  };

  const handleImportTransactions = (importedTransactions: FuelTransaction[]) => {
    // Add imported transactions to the existing ones, even if the current list is empty
    setTransactions(prevTransactions => [...importedTransactions, ...prevTransactions]);
  };

  const updateTransaction = (id: string, transaction: Omit<FuelTransaction, 'id'>) => {
    setTransactions(transactions.map(t => 
      t.id === id ? { ...transaction, id } : t
    ));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const handleEditTransaction = (transaction: FuelTransaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleDuplicateTransaction = (transaction: FuelTransaction) => {
    const duplicatedTransaction = {
      ...transaction,
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
    };
    setTransactions([duplicatedTransaction, ...transactions]);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  // Calculate total cost
  const totalCost = transactions.reduce((sum, t) => sum + t.totalCost, 0);
  // Calculate total liters
  const totalLiters = transactions.reduce((sum, t) => sum + t.amount, 0);
  // Calculate average price
  const averagePrice = totalLiters > 0 ? totalCost / totalLiters : 0;
  
  // Calculate average KM
  const transactionsWithKm = transactions.filter(t => t.kmReading && t.lastKmReading);
  const totalKmDriven = transactionsWithKm.reduce((sum, t) => 
    sum + (t.kmReading! - t.lastKmReading!), 0
  );
  const averageKmPerTransaction = transactionsWithKm.length > 0 ? 
    totalKmDriven / transactionsWithKm.length : 0;

  useEffectOnline(setTransactions);

  return (
    <UserProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 relative">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-orange-500 rounded-full">
                <Car className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent">
                Fuel Tracker
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Ghi chép chi phí nhiên liệu bằng giọng nói
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <StatsCard
              title="Tổng chi phí"
              value={`${totalCost.toLocaleString('vi-VN')} ₫`}
              icon={<TrendingUp className="w-5 h-5" />}
              gradient="from-green-500 to-emerald-500"
            />
            <StatsCard
              title="Tổng lít xăng"
              value={`${totalLiters.toFixed(1)} L`}
              icon={<Fuel className="w-5 h-5" />}
              gradient="from-blue-500 to-cyan-500"
            />
            <StatsCard
              title="Giá trung bình"
              value={`${averagePrice.toLocaleString('vi-VN')} ₫/L`}
              icon={<Car className="w-5 h-5" />}
              gradient="from-orange-500 to-red-500"
            />
            <StatsCard
              title="TB KM/lần"
              value={`${averageKmPerTransaction.toFixed(0)} km`}
              icon={<TrendingUp className="w-5 h-5" />}
              gradient="from-purple-500 to-pink-500"
            />
          </div>

          {/* Voice Recorder and Utilities */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center">
            <VoiceRecorder 
              onTransactionParsed={addTransaction}
              isListening={isListening}
              setIsListening={setIsListening}
            />
            
            {/* Utilities Dropdown Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline"
                  className="flex items-center gap-2 text-gray-600 border-gray-300 hover:bg-gray-50"
                  size="lg"
                >
                  <Settings className="w-5 h-5" />
                  Tiện ích
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem className="p-0">
                  <div className="w-full">
                    <ExportButtons 
                      transactions={transactions} 
                      onImportTransactions={handleImportTransactions}
                    />
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="w-4 h-4" />
                Lịch sử đổ xăng
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Báo cáo thống kê
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Cài đặt
              </TabsTrigger>
            </TabsList>

            <TabsContent value="history">
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Fuel className="w-5 h-5 text-orange-500" />
                    Lịch sử đổ xăng
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TransactionList 
                    transactions={transactions}
                    onDelete={deleteTransaction}
                    onEdit={handleEditTransaction}
                    onDuplicate={handleDuplicateTransaction}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports">
              <ReportsSection transactions={transactions} />
            </TabsContent>

            <TabsContent value="settings">
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-blue-500" />
                    Cài đặt ứng dụng
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <UserModeSelector />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <AddTransactionModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onAdd={addTransaction}
            onUpdate={updateTransaction}
            editingTransaction={editingTransaction}
          />
        </div>

        {/* Floating Action Button */}
        <Button
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 z-50"
          size="icon"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>
    </UserProvider>
  );
};

export default Index;
