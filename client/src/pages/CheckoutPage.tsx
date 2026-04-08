import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { Ticket, CreditCard, Tag } from 'lucide-react';

export default function CheckoutPage() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [event, setEvent] = useState<any>(null);
    const [selectedTicket, setSelectedTicket] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [voucherCode, setVoucherCode] = useState('');
    const [usePoints, setUsePoints] = useState(false);
    const [promoAmount, setPromoAmount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/events/${eventId}`).then(({ data }) => {
            setEvent(data);
            if (data.ticketTypes.length > 0) setSelectedTicket(data.ticketTypes[0].id);
            setLoading(false);
        }).catch(console.error);
    }, [eventId]);

    const handleValidatePromo = async () => {
        if (!voucherCode) return;
        try {
            const { data } = await api.post('/promotions/validate', { code: voucherCode, eventId });
            if (data.valid) {
                const tk = event.ticketTypes.find((t: any) => t.id === selectedTicket);
                const val = data.promotion.discountType === 'percent'
                    ? (tk.price * quantity * data.promotion.discountValue) / 100
                    : data.promotion.discountValue;
                setPromoAmount(val);
                alert('Promo applied!');
            }
        } catch (err: any) {
            alert(err.response?.data?.message || 'Invalid promo code');
        }
    };

    if (loading) return <div className="p-20 text-center">Loading checkout...</div>;

    const ticketObj = event.ticketTypes.find((t: any) => t.id === selectedTicket);
    const subtotal = ticketObj ? ticketObj.price * quantity : 0;
    let total = subtotal - promoAmount;
    if (total < 0) total = 0;

    const pointDiscount = usePoints ? Math.min(total, user?.points || 0) : 0;
    total -= pointDiscount;

    const handleCheckout = async () => {
        try {
            const payload = {
                eventId,
                ticketTypeId: selectedTicket,
                quantity,
                voucherCode: promoAmount > 0 ? voucherCode : undefined,
                pointsUsed: pointDiscount
            };
            await api.post('/transactions', payload);
            alert('Transaction created successfully!');
            navigate('/transactions');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Transaction failed');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold">Checkout</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="glass-panel p-6">
                        <h2 className="text-xl font-bold mb-4">{event.title}</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-muted">Select Ticket Type</label>
                                <select value={selectedTicket} onChange={e => setSelectedTicket(e.target.value)} className="input-field">
                                    {event.ticketTypes.map((t: any) => (
                                        <option key={t.id} value={t.id} disabled={t.availableSeats === 0}>
                                            {t.name} - Rp {t.price.toLocaleString('id-ID')} ({t.availableSeats} left)
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2 text-muted">Quantity</label>
                                <input type="number" min="1" max={ticketObj?.availableSeats || 1} value={quantity} onChange={e => setQuantity(Number(e.target.value))} className="input-field" />
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel p-6">
                        <h3 className="font-bold mb-4">Promotions & Points</h3>
                        <div className="flex gap-2 mb-4">
                            <input type="text" placeholder="Promo Code" value={voucherCode} onChange={e => setVoucherCode(e.target.value)} className="input-field" />
                            <button onClick={handleValidatePromo} className="btn-outline shrink-0">Apply</button>
                        </div>

                        <div className="flex items-center gap-3">
                            <input type="checkbox" id="pts" checked={usePoints} onChange={e => setUsePoints(e.target.checked)} className="w-5 h-5 rounded border-white/10 text-primary focus:ring-primary bg-surface" />
                            <label htmlFor="pts">Use EventMU Points (Balance: {user?.points})</label>
                        </div>
                    </div>
                </div>

                <div className="glass-panel p-6 h-fit sticky top-24">
                    <h3 className="text-xl font-bold border-b border-white/10 pb-4 mb-4">Order Summary</h3>
                    <div className="space-y-3 mb-6 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted">Ticket x {quantity}</span>
                            <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                        </div>
                        {promoAmount > 0 && (
                            <div className="flex justify-between text-secondary">
                                <span>Voucher Discount</span>
                                <span>- Rp {promoAmount.toLocaleString('id-ID')}</span>
                            </div>
                        )}
                        {pointDiscount > 0 && (
                            <div className="flex justify-between text-accent">
                                <span>Points Used</span>
                                <span>- Rp {pointDiscount.toLocaleString('id-ID')}</span>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-between items-center text-xl font-bold border-t border-white/10 pt-4 mb-6">
                        <span>Total</span>
                        <span className="text-primary-400">Rp {total.toLocaleString('id-ID')}</span>
                    </div>

                    <button onClick={handleCheckout} className="btn-primary w-full py-4 text-lg">Confirm Payment</button>
                </div>
            </div>
        </div>
    );
}
