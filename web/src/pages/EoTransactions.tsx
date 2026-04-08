import { useState, useEffect } from 'react';
import api from '../services/api';
import { CheckCircle, XCircle } from 'lucide-react';

export default function EoTransactions() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const fetchTxns = () => {
        api.get('/transactions/eo').then(({ data }) => setTransactions(data)).finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchTxns();
    }, []);

    const handleAction = async (id: string, action: 'confirm' | 'reject') => {
        try {
            await api.patch(`/transactions/${id}/${action}`);
            alert(`Transaction ${action}ed`);
            fetchTxns();
        } catch (err) {
            alert('Action failed');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8 relative">
            <h1 className="text-3xl font-bold">Manage Transactions</h1>

            {previewUrl && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 transition-all" onClick={() => setPreviewUrl(null)}>
                    <div className="relative max-w-4xl max-h-[90vh] w-full flex justify-center backdrop-blur-sm" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setPreviewUrl(null)} className="absolute -top-12 right-0 md:-right-12 md:top-0 text-white/50 hover:text-red-400 transition-colors"><XCircle size={40} /></button>
                        <img src={`http://localhost:5000${previewUrl}`} alt="Payment Proof" className="max-w-full max-h-[85vh] rounded-xl border border-white/10 shadow-2xl" />
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {transactions.map(txn => (
                    <div key={txn.id} className="glass-panel p-6 flex justify-between items-center">
                        <div>
                            <p className="font-bold text-xl">{txn.event.title} - {txn.attendee.name}</p>
                            <p className="text-sm text-muted">{txn.ticketType.name} &bull; Qty {txn.quantity} &bull; Rp {txn.totalPrice.toLocaleString('id-ID')}</p>
                            <div className="mt-2">Status: <span className="badge text-primary">{txn.status}</span></div>
                            {txn.paymentProofUrl && (
                                <button onClick={() => setPreviewUrl(txn.paymentProofUrl)} className="text-secondary font-bold hover:text-white transition-colors text-sm flex items-center gap-1 mt-3">
                                    <CheckCircle size={16} className="text-secondary" /> View Uploaded Proof
                                </button>
                            )}
                        </div>

                        {txn.status === 'waiting_confirmation' && (
                            <div className="flex gap-2">
                                <button onClick={() => handleAction(txn.id, 'confirm')} className="btn-primary bg-green-600 hover:bg-green-700 from-green-500 to-green-600 border-none shadow-green-500/20 py-2 px-4 shadow-xl mb-0 !block flex-row items-center justify-center gap-1"><CheckCircle className="w-5 h-5 inline mr-1" />Confirm</button>
                                <button onClick={() => handleAction(txn.id, 'reject')} className="btn-primary bg-red-600 hover:bg-red-700 from-red-500 to-red-600 border-none shadow-red-500/20 py-2 px-4 shadow-xl mb-0 !block"><XCircle className="w-5 h-5 inline mr-1" />Reject</button>
                            </div>
                        )}
                    </div>
                ))}
                {transactions.length === 0 && <div className="text-muted p-10 text-center glass-panel">No transactions yet.</div>}
            </div>
        </div>
    );
}
