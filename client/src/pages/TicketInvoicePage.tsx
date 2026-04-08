import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, Ticket, MapPin, Calendar, User, ChevronLeft, Loader2 } from 'lucide-react';
import api from '../services/api';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import QRCode from 'react-qr-code';

const QRComponent = (QRCode as any).default || QRCode;

export default function TicketInvoicePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [txn, setTxn] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        api.get(`/transactions/${id}`).then(({ data }) => setTxn(data)).catch(console.error).finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="text-center py-20">Loading Ticket Data...</div>;
    if (!txn || txn.status !== 'done') return <div className="text-center py-20 text-red-500 font-bold">Invalid or Unconfirmed Ticket.</div>;

    const handleDownload = async () => {
        const element = document.getElementById('pdf-ticket');
        if (!element) return;

        try {
            setIsDownloading(true);
            const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
            const imgData = canvas.toDataURL('image/png');

            const pdfWidth = canvas.width;
            const pdfHeight = canvas.height;

            // Create PDF with exactly the element's dynamic dimensions
            const pdf = new jsPDF({
                orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
                unit: 'px',
                format: [pdfWidth, pdfHeight]
            });

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`E-Ticket-${txn.event.title.replace(/\s+/g, '-')}-${txn.id.substring(0, 6)}.pdf`);
        } catch (error) {
            console.error('Download failed', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-10 print:py-0 px-4 min-h-screen">
            {/* Header / Actions - Hidden while printing */}
            <div className="flex justify-between items-center mb-8 print:hidden">
                <button onClick={() => navigate('/transactions')} className="text-muted hover:text-white transition-colors flex items-center gap-1">
                    <ChevronLeft size={20} /> Back
                </button>
                <button onClick={handleDownload} disabled={isDownloading} className="btn-primary flex items-center gap-2 !py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-none shadow-blue-500/20 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed">
                    {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                    {isDownloading ? 'Generating PDF...' : 'Download PDF directly'}
                </button>
            </div>

            {/* The Actual Ticket Layout */}
            <div id="pdf-ticket" style={{
                backgroundColor: '#f8f9fa',
                color: '#111827',
                border: '1px solid #e5e7eb',
                borderRadius: '24px',
                overflow: 'hidden',
                width: '800px',
                position: 'relative',
                fontFamily: 'sans-serif'
            }}>
                {/* Header Strip */}
                <div style={{ backgroundColor: '#4f46e5', color: '#ffffff', padding: '32px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: '32px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>{txn.event.title}</h2>
                        <p style={{ opacity: 0.8, marginTop: '8px', fontSize: '16px', margin: '4px 0 0 0' }}>E-Ticket / Admission Pass</p>
                    </div>
                    <Ticket size={56} style={{ opacity: 0.5 }} />
                </div>

                {/* Inner Content */}
                <div style={{ padding: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '32px', borderBottom: '1px solid #e5e7eb', marginBottom: '32px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div>
                                <p style={{ fontSize: '14px', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '1px', color: '#6b7280', margin: '0 0 8px 0' }}>Attendee</p>
                                <p style={{ fontSize: '22px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', color: '#1f2937', margin: 0 }}><User size={24} style={{ color: '#4f46e5' }} /> {txn.attendee?.name || 'Valued Guest'}</p>
                            </div>
                            <div style={{ marginTop: '24px' }}>
                                <p style={{ fontSize: '14px', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '1px', color: '#6b7280', margin: '0 0 8px 0' }}>When & Where</p>
                                <p style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', color: '#1f2937', fontSize: '18px', margin: 0 }}><Calendar size={20} style={{ color: '#4f46e5' }} /> {new Date(txn.event.startDate).toLocaleString('en-GB', { dateStyle: 'full', timeStyle: 'short' })}</p>
                                <p style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', color: '#1f2937', fontSize: '18px', margin: '8px 0 0 0' }}><MapPin size={20} style={{ color: '#4f46e5' }} /> {txn.event.location}</p>
                            </div>
                        </div>

                        {/* Local SVG QR Code Block */}
                        <div style={{ padding: '16px', backgroundColor: '#ffffff', border: '1px solid #f3f4f6', borderRadius: '16px', textAlign: 'center', minWidth: '140px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                            <QRComponent value={txn.id} size={120} level="M" />
                            <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '12px', fontFamily: 'monospace', margin: 0 }}>{txn.id.split('-')[0].toUpperCase()}</p>
                        </div>
                    </div>

                    <div style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', padding: '32px', borderRadius: '16px' }}>
                        <h3 style={{ fontSize: '16px', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '1px', color: '#6b7280', borderBottom: '1px solid #e5e7eb', paddingBottom: '12px', margin: '0 0 24px 0' }}>Order Details</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '18px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div style={{ color: '#6b7280' }}>Ticket Category</div>
                                <div style={{ fontWeight: 'bold', color: '#1f2937' }}>{txn.ticketType.name}</div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div style={{ color: '#6b7280' }}>Quantity admitting</div>
                                <div style={{ fontWeight: 'bold', color: '#1f2937' }}>{txn.quantity} Persons</div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div style={{ color: '#6b7280' }}>Purchase Date</div>
                                <div style={{ fontWeight: 'bold', color: '#1f2937' }}>{new Date(txn.createdAt).toLocaleDateString()}</div>
                            </div>

                            <div style={{ borderTop: '2px solid #e5e7eb', margin: '8px 0' }}></div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontWeight: 'bold', textTransform: 'uppercase', color: '#6b7280' }}>Total Paid</div>
                                <div style={{ fontWeight: '900', fontSize: '24px', color: '#4f46e5' }}>Rp {txn.totalPrice.toLocaleString('id-ID')}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Tear-line */}
                <div style={{ backgroundColor: '#1f2937', color: '#9ca3af', textAlign: 'center', padding: '24px', fontSize: '14px', letterSpacing: '3px', textTransform: 'uppercase', borderTop: '4px dashed #4b5563' }}>
                    EVENTMU.COM - NOT TRANSFERABLE - VALID FOR EXACT DATE ONLY
                </div>
            </div>

            {/* Print Override CSS (Global tailwind print modifiers usually work but let's be sure) */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #pdf-ticket, #pdf-ticket * {
                        visibility: visible;
                    }
                    #pdf-ticket {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        margin: 0;
                        box-shadow: none;
                        border: none;
                    }
                }
            `}} />
        </div>
    );
}
