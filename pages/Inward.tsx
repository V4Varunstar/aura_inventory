
import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { useToast } from '../context/ToastContext';
import { Product, InwardSource } from '../types';
import { getProducts, addInward } from '../services/firebaseService';

const Inward: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedSku, setSelectedSku] = useState('');
    const [quantity, setQuantity] = useState('');
    const [batchNo, setBatchNo] = useState('');
    const [mfgDate, setMfgDate] = useState('');
    const [expDate, setExpDate] = useState('');
    const [costPrice, setCostPrice] = useState('');
    const [source, setSource] = useState<InwardSource>(InwardSource.Factory);
    const [notes, setNotes] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        const fetchProducts = async () => {
            const productsData = await getProducts();
            setProducts(productsData);
        };
        fetchProducts();
    }, []);

    const resetForm = () => {
        setSelectedSku('');
        setQuantity('');
        setBatchNo('');
        setMfgDate('');
        setExpDate('');
        setCostPrice('');
        setSource(InwardSource.Factory);
        setNotes('');
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const selectedProduct = products.find(p => p.sku === selectedSku);

        if (!selectedProduct) {
            addToast('Please select a valid product.', 'error');
            setIsLoading(false);
            return;
        }

        try {
            await addInward({
                productId: selectedProduct.id,
                sku: selectedSku,
                quantity: Number(quantity),
                batchNo,
                mfgDate: new Date(mfgDate),
                expDate: new Date(expDate),
                costPrice: Number(costPrice),
                source,
                notes,
            });
            addToast('Inward stock recorded successfully!', 'success');
            resetForm();
        } catch (error) {
            addToast('Failed to record inward stock.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Inward Inventory</h1>
            <Card title="Add New Inward Stock">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Select label="Product (SKU)" value={selectedSku} onChange={e => setSelectedSku(e.target.value)} required>
                            <option value="">Select a product</option>
                            {products.map(p => <option key={p.id} value={p.sku}>{p.name} ({p.sku})</option>)}
                        </Select>
                        <Input label="Batch No." value={batchNo} onChange={e => setBatchNo(e.target.value)} required />
                        <Input label="Quantity" type="number" value={quantity} onChange={e => setQuantity(e.target.value)} required />
                        <Input label="Manufacturing Date" type="date" value={mfgDate} onChange={e => setMfgDate(e.target.value)} required />
                        <Input label="Expiry Date" type="date" value={expDate} onChange={e => setExpDate(e.target.value)} required />
                        <Input label="Cost Price (₹)" type="number" value={costPrice} onChange={e => setCostPrice(e.target.value)} required />
                        <Select label="Source" value={source} onChange={e => setSource(e.target.value as InwardSource)} required>
                            {Object.values(InwardSource).map(s => <option key={s} value={s}>{s}</option>)}
                        </Select>
                        <div className="md:col-span-2 lg:col-span-3">
                           <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                           <textarea id="notes" rows={3} value={notes} onChange={e => setNotes(e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 border-gray-300"></textarea>
                        </div>
                         <div className="md:col-span-2 lg:col-span-3">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Attachment (Invoice/Photo)</label>
                            <input type="file" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"/>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <Button type="submit" isLoading={isLoading}>Record Inward</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default Inward;
