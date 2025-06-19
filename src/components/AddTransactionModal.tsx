import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import VoiceInput from '@/components/VoiceInput';
import type { FuelTransaction } from '@/pages/Index';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (transaction: Omit<FuelTransaction, 'id'>) => void;
  onUpdate?: (id: string, transaction: Omit<FuelTransaction, 'id'>) => void;
  editingTransaction?: FuelTransaction | null;
}

const AddTransactionModal = ({ 
  isOpen, 
  onClose, 
  onAdd, 
  onUpdate, 
  editingTransaction 
}: AddTransactionModalProps) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    pricePerLiter: '',
    location: '',
    notes: '',
    kmReading: '',
    lastKmReading: '',
  });

  const isEditing = !!editingTransaction;

  // Load editing transaction data when modal opens
  useEffect(() => {
    if (editingTransaction) {
      setFormData({
        date: editingTransaction.date,
        amount: editingTransaction.amount.toString(),
        pricePerLiter: editingTransaction.pricePerLiter.toString(),
        location: editingTransaction.location || '',
        notes: editingTransaction.notes || '',
        kmReading: editingTransaction.kmReading?.toString() || '',
        lastKmReading: editingTransaction.lastKmReading?.toString() || '',
      });
    } else {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        pricePerLiter: '',
        location: '',
        notes: '',
        kmReading: '',
        lastKmReading: '',
      });
    }
  }, [editingTransaction, isOpen]);

  const saveFuelMeta = async (transaction: any) => {
    const metaValue = {
      date: transaction.date,
      liters: transaction.amount,
      price_per_liter: transaction.pricePerLiter,
      total_cost: transaction.totalCost,
      last_km: transaction.lastKmReading,
      current_km: transaction.kmReading,
      distance: transaction.kmReading - transaction.lastKmReading,
      location: transaction.location || '',
      note: transaction.notes || ''
    };

    // try {
    //   const response = await fetch('http://localhost/tourviet/rest-api/api/addobject_meta.php', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //   },
    //     body: JSON.stringify({
    //       tokenkey: "1234567890",
    //       object_id: editingTransaction?.id,
    //       meta_key: "fuel",
    //       meta_value: JSON.stringify(metaValue)
    //     })
    //   });

    //   if (!response.ok) {
    //     throw new Error(`HTTP error! status: ${response.status}`);
    //   }
    //   const data = await response.json();
    //   console.log('API Response:', data);
    // } catch (error) {
    //   console.error('Error saving fuel meta:', error);
    // }

    try {
      const response = await fetch('https://seventoursvietnam.com/rest-api/api/addobject_meta.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
      },
        body: JSON.stringify({
          tokenkey: "1234567890",
          object_id: editingTransaction?.id,
          meta_key: "fuel",
          meta_value: JSON.stringify(metaValue)
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('API Response:', data);
    } catch (error) {
      console.error('Error saving fuel meta:', error);
    }

  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(formData.amount);
    const pricePerLiter = parseFloat(formData.pricePerLiter);
    
    if (!amount || !pricePerLiter) {
      return;
    }

    const transaction = {
      date: formData.date,
      amount,
      pricePerLiter,
      totalCost: amount * pricePerLiter,
      location: formData.location || undefined,
      notes: formData.notes || undefined,
      kmReading: formData.kmReading ? parseFloat(formData.kmReading) : undefined,
      lastKmReading: formData.lastKmReading ? parseFloat(formData.lastKmReading) : undefined,
    };

    if (isEditing && editingTransaction && onUpdate) {
      await saveFuelMeta(transaction);
      onUpdate(editingTransaction.id, transaction);
    } else {
      onAdd(transaction);
    }

    setFormData({
      date: new Date().toISOString().split('T')[0],
      amount: '',
      pricePerLiter: '',
      location: '',
      notes: '',
      kmReading: '',
      lastKmReading: '',
    });
    onClose();
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Sửa giao dịch nhiên liệu' : 'Thêm giao dịch nhiên liệu'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
        <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600">
              {isEditing ? 'Cập nhật' : 'Thêm'}
            </Button>
          <div>
            <Label htmlFor="date">Ngày</Label>
            <VoiceInput
              id="date"
              type="date"
              value={formData.date}
              onChange={(value) => handleChange('date', value)}
              placeholder=""
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Số lít</Label>
              <VoiceInput
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(value) => handleChange('amount', value)}
                placeholder="30.5"
              />
            </div>
            
            <div>
              <Label htmlFor="pricePerLiter">Giá (₫/L)</Label>
              <VoiceInput
                id="pricePerLiter"
                type="number"
                value={formData.pricePerLiter}
                onChange={(value) => handleChange('pricePerLiter', value)}
                placeholder="23500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lastKmReading">Số KM cuối (trước)</Label>
              <VoiceInput
                id="lastKmReading"
                type="number"
                value={formData.lastKmReading}
                onChange={(value) => handleChange('lastKmReading', value)}
                placeholder="12000"
              />
            </div>
            
            <div>
              <Label htmlFor="kmReading">Số KM hiện tại</Label>
              <VoiceInput
                id="kmReading"
                type="number"
                value={formData.kmReading}
                onChange={(value) => handleChange('kmReading', value)}
                placeholder="12500"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="location">Địa điểm (tùy chọn)</Label>
            <VoiceInput
              id="location"
              value={formData.location}
              onChange={(value) => handleChange('location', value)}
              placeholder="Cửa hàng xăng dầu ABC"
            />
          </div>
          
          <div>
            <Label htmlFor="notes">Ghi chú (tùy chọn)</Label>
            <Textarea
              id="notes"
              placeholder="Ghi chú thêm..."
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={2}
            />
          </div>
          
          {formData.amount && formData.pricePerLiter && (
            <div className="bg-muted p-3 rounded-lg space-y-2">
              <div>
                <div className="text-sm text-muted-foreground">Tổng tiền:</div>
                <div className="text-lg font-bold text-green-600">
                  {(parseFloat(formData.amount) * parseFloat(formData.pricePerLiter)).toLocaleString('vi-VN')} ₫
                </div>
              </div>
              {formData.kmReading && formData.lastKmReading && (
                <div>
                  <div className="text-sm text-muted-foreground">Quãng đường:</div>
                  <div className="text-lg font-bold text-blue-600">
                    {(parseFloat(formData.kmReading) - parseFloat(formData.lastKmReading)).toLocaleString('vi-VN')} km
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Hủy
            </Button>
            <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600">
              {isEditing ? 'Cập nhật' : 'Thêm'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTransactionModal;
