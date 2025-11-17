
import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { useToast } from '../context/ToastContext';
import { Product, Warehouse, OutwardDestination } from '../types';
import { getProducts, getWarehouses, addOutward } from '../services/firebaseService';

const Outward: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [selectedSku, setSelectedSku] = useState('');
    const [quantity, setQuantity] = useState('');
    const [warehouseId, setWarehouseId] = useState('');
    const [destination, setDestination] = useState<OutwardDestination>(OutwardDestination.AmazonFba);
    const [shipmentRef, setShipmentRef] = useState('');
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
        setDestination(OutwardDestination.AmazonFba);
        setShipmentRef('');
        setNotes('');
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const selectedProduct = products.find(p => p.sku === selectedSku);
        if (!selectedProduct || !warehouseId) {
            addToast('Please fill all required fields.', 'error');
            setIsLoading(false);
            return;
        }

        try {
            await addOutward({
                productId: selectedProduct.id,
                sku: selectedSku,
                quantity: Number(quantity),
                warehouseId,
                destination,
                shipmentRef,
                notes,
            });
            addToast('Outward stock recorded successfully!', 'success');
            resetForm();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to record outward stock.";
            addToast(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Outward Inventory</h1>
            <Card title="Create New Outward Shipment">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Select label="Product (SKU)" value={selectedSku} onChange={e => setSelectedSku(e.target.value)} required>
                            <option value="">Select a product</option>
                            {products.map(p => <option key={p.id} value={p.sku}>{p.name} ({p.sku})</option>)}
                        </Select>
                        <Input label="Quantity" type="number" value={quantity} onChange={e => setQuantity(e.target.value)} required placeholder="Current stock: 120"/>
                        <Select label="From Warehouse" value={warehouseId} onChange={e => setWarehouseId(e.target.value)} required>
                             <option value="">Select a warehouse</option>
                            {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                        </Select>
                         <Select label="Destination / Channel" value={destination} onChange={e => setDestination(e.target.value as OutwardDestination)} required>
                            {Object.values(OutwardDestination).map(d => <option key={d} value={d}>{d}</option>)}
                        </Select>
                        <Input label="Shipment Reference / AWB" value={shipmentRef} onChange={e => setShipmentRef(e.target.value)} />
                        <div className="md:col-span-2">
                           <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                           <textarea id="notes" rows={3} value={notes} onChange={e => setNotes(e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 border-gray-300"></textarea>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <Button type="submit" isLoading={isLoading}>Record Outward</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default Outward;
