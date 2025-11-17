
import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { useToast } from '../context/ToastContext';
import { Product, Warehouse, AdjustmentType } from '../types';
import { getProducts, getWarehouses, addAdjustment } from '../services/firebaseService';

const Adjustments: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [selectedSku, setSelectedSku] = useState('');
    const [quantity, setQuantity] = useState('');
    const [warehouseId, setWarehouseId] = useState('');
    const [type, setType] = useState<AdjustmentType>(AdjustmentType.Damage);
    const [notes, setNotes] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        const fetchData = async () => {
            setProducts(await getProducts());
            setWarehouses(await getWarehouses());
        };
        fetchData();
    }, []);
    
    const resetForm = () => {
        setSelectedSku('');
        setQuantity('');
        setWarehouseId('');
        setType(AdjustmentType.Damage);
        setNotes('');
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const selectedProduct = products.find(p => p.sku === selectedSku);
        if (!selectedProduct || !warehouseId || !quantity) {
            addToast('Please fill all required fields.', 'error');
            setIsLoading(false);
            return;
        }

        try {
            await addAdjustment({
                productId: selectedProduct.id,
                sku: selectedSku,
                quantity: Number(quantity),
                warehouseId,
                type,
                notes,
            });
            addToast('Stock adjustment recorded successfully!', 'success');
            resetForm();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to record adjustment.";
            addToast(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Stock Adjustments</h1>
            <Card title="Create New Stock Adjustment">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Select label="Product (SKU)" value={selectedSku} onChange={e => setSelectedSku(e.target.value)} required>
                            <option value="">Select a product</option>
                            {products.map(p => <option key={p.id} value={p.sku}>{p.name} ({p.sku})</option>)}
                        </Select>
                        <Input label="Quantity" type="number" value={quantity} onChange={e => setQuantity(e.target.value)} required placeholder="Use negative for reduction (e.g., -10)"/>
                         <Select label="Warehouse" value={warehouseId} onChange={e => setWarehouseId(e.target.value)} required>
                             <option value="">Select a warehouse</option>
                            {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                        </Select>
                        <Select label="Adjustment Type" value={type} onChange={e => setType(e.target.value as AdjustmentType)} required>
                            {Object.values(AdjustmentType).map(t => <option key={t} value={t}>{t}</option>)}
                        </Select>
                        <div className="md:col-span-2">
                           <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason / Notes</label>
                           <textarea id="notes" rows={3} value={notes} onChange={e => setNotes(e.target.value)} required className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 border-gray-300"></textarea>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <Button type="submit" isLoading={isLoading}>Submit Adjustment</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default Adjustments;
