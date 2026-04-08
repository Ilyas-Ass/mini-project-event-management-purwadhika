import { useState, useEffect } from 'react';
import api from '../services/api';

export default function EoPromotions() {
    const [promotions, setPromotions] = useState<any[]>([]);
    const [code, setCode] = useState('');
    const [discountType, setDiscountType] = useState('flat');
    const [discountValue, setDiscountValue] = useState(0);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const fetchPromos = () => {
        api.get('/promotions').then(({ data }) => setPromotions(data));
    };

    useEffect(() => {
        fetchPromos();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/promotions', { code, discountType, discountValue, startDate, endDate });
            alert('Promotion created');
            fetchPromos();
        } catch (err) {
            alert('Failed to create promotion');
        }
    };

    return (
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 glass-panel p-6">
                <h2 className="text-2xl font-bold mb-4">Create Voucher</h2>
                <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold mb-1.5 text-muted">Promo Code Name</label>
                        <input placeholder="e.g. SUMMER20" value={code} onChange={e => setCode(e.target.value)} className="input-field uppercase" required />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1.5 text-muted">Discount Format</label>
                        <select value={discountType} onChange={e => setDiscountType(e.target.value)} className="input-field !bg-surface text-white relative z-10 py-3">
                            <option value="flat">Flat Amount Deduction (Rp)</option>
                            <option value="percent">Percentage (%)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1.5 text-muted">Discount Value</label>
                        <input type="number" placeholder="Value (e.g., 20 or 50000)" value={discountValue} onChange={e => setDiscountValue(Number(e.target.value))} className="input-field" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold mb-1.5 text-muted">Valid From</label>
                            <input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} className="input-field" required />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1.5 text-muted">Valid Until</label>
                            <input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} className="input-field" required />
                        </div>
                    </div>
                    <button type="submit" className="btn-primary w-full">Create</button>
                </form>
            </div>

            <div className="md:col-span-2 space-y-4">
                <h2 className="text-2xl font-bold">My Promotions</h2>
                {promotions.map(promo => (
                    <div key={promo.id} className="glass-panel p-4 flex justify-between items-center">
                        <div>
                            <p className="font-bold text-xl text-primary">{promo.code}</p>
                            <p className="text-muted text-sm">{promo.discountType === 'percent' ? `${promo.discountValue}% off` : `Rp ${promo.discountValue.toLocaleString()} off`}</p>
                            <p className="text-xs mt-1 text-muted">Valid: {new Date(promo.startDate).toLocaleDateString()} - {new Date(promo.endDate).toLocaleDateString()}</p>
                        </div>
                        <button onClick={async () => {
                            if (window.confirm('Delete this promo?')) {
                                await api.delete(`/promotions/${promo.id}`);
                                fetchPromos();
                            }
                        }} className="text-red-400 hover:underline">Delete</button>
                    </div>
                ))}
            </div>
        </div>
    );
}
