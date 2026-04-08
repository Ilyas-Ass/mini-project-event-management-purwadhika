import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Upload, Clock, Ticket } from 'lucide-react';
import api from '../services/api';

const Countdown = ({ targetDate }: { targetDate: string }) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            const distance = new Date(targetDate).getTime() - new Date().getTime();
            if (distance < 0) {
                setTimeLeft('EXPIRED');
                clearInterval(interval);
                return;
            }
            const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((distance % (1000 * 60)) / 1000);
            setTimeLeft(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
        }, 1000);
        return () => clearInterval(interval);
    }, [targetDate]);

    return (
        <div className="flex flex-col items-center text-center">
            <p className="text-sm text-secondary/80 font-semibold mb-3">
                ⚠️ Upload payment proof before 2 hours to prevent order expiration.
            </p>
            <div className="flex items-center gap-2.5 text-secondary text-2xl md:text-3xl font-black bg-secondary/15 px-6 py-3 rounded-xl border border-secondary/30 tracking-widest shadow-lg shadow-secondary/10">
                <Clock className="w-6 h-6 md:w-8 md:h-8" /> {timeLeft || '--:--:--'}
            </div>
        </div>
    );
};

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [previews, setPreviews] = useState<Record<string, { file: File, url: string }>>({});

    const fetchTxns = () => {
        api.get('/transactions').then(({ data }) => {
            setTransactions(data);
            setLoading(false);
        }).catch(console.error);
    };

    useEffect(() => {
        fetchTxns();
    }, []);

    const handleUpload = async (id: string, file: File) => {
        const formData = new FormData();
        formData.append('proof', file);
        try {
            await api.post(`/transactions/${id}/payment-proof`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Proof uploaded successfully');
            const p = { ...previews }; delete p[id]; setPreviews(p);
            fetchTxns();
        } catch (err) {
            alert('Upload failed');
        }
    };

    if (loading) return <div className="text-center py-20">Loading...</div>;

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold">My Tickets & Transactions</h1>

            {transactions.length === 0 ? (
                <div className="glass-panel p-12 text-center text-muted">No transactions found.</div>
            ) : (
                <div className="space-y-4">
                    {transactions.map(txn => (
                        <div key={txn.id} className="glass-panel p-6 flex flex-col md:flex-row gap-6 items-center">
                            <div className="w-full md:w-48 h-32 bg-surface rounded-xl overflow-hidden shrink-0">
                                <img src={`http://localhost:5000${txn.event.thumbnailUrl}`} alt={txn.event.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-xl">{txn.event.title}</h3>
                                    <span className="badge uppercase bg-surface border-white/20">{txn.status.replace('_', ' ')}</span>
                                </div>
                                <p className="text-muted text-sm">{txn.ticketType.name} &bull; Qty: {txn.quantity}</p>
                                <p className="font-bold text-primary">Rp {txn.totalPrice.toLocaleString('id-ID')}</p>
                                <p className="text-xs text-muted">Order Date: {new Date(txn.createdAt).toLocaleDateString()}</p>

                                {txn.status === 'done' && (
                                    <Link to={`/ticket/${txn.id}`} className="inline-flex mt-4 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:scale-105 transition-transform items-center justify-center gap-2">
                                        <Ticket size={20} /> View E-Ticket
                                    </Link>
                                )}
                            </div>

                            {txn.status === 'waiting_payment' && (
                                <div className="flex flex-col items-center gap-3">
                                    {txn.paymentDeadline && <Countdown targetDate={txn.paymentDeadline} />}

                                    {previews[txn.id] ? (
                                        <div className="flex flex-col items-center p-4 border border-dashed border-primary/40 rounded-xl bg-surface/50">
                                            <img src={previews[txn.id].url} alt="Proof Preview" className="h-28 w-28 object-cover rounded-lg shadow-2xl mb-3" />
                                            <div className="flex gap-3">
                                                <button onClick={() => {
                                                    const p = { ...previews }; delete p[txn.id]; setPreviews(p);
                                                }} className="px-4 py-1.5 text-sm font-semibold rounded-lg text-red-300 hover:bg-red-500/10 transition-colors">Cancel</button>
                                                <button onClick={() => handleUpload(txn.id, previews[txn.id].file)} className="px-4 py-1.5 text-sm font-bold rounded-lg bg-green-500 text-white shadow-lg shadow-green-500/20 hover:bg-green-600 transition-colors">Upload Proof</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="border border-dashed border-white/20 px-8 py-3 rounded-xl flex items-center justify-center relative cursor-pointer hover:bg-surface/50 transition-colors">
                                            <input type="file" onChange={(e) => {
                                                if (e.target.files?.[0]) {
                                                    const file = e.target.files[0];
                                                    setPreviews(prev => ({ ...prev, [txn.id]: { file, url: URL.createObjectURL(file) } }));
                                                }
                                            }} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                                            <div className="text-center text-sm text-secondary flex flex-col items-center">
                                                <Upload className="w-5 h-5 mb-1" />
                                                <span className="font-semibold whitespace-nowrap">Select Proof Image</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
