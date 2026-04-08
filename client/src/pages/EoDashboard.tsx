import { useState, useEffect } from 'react';
import api from '../services/api';
import { PlusCircle } from 'lucide-react';

export default function EoDashboard() {
    const [events, setEvents] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);

    // form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [category, setCategory] = useState('Pop');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [totalSeats, setTotalSeats] = useState(100);
    const [isFree, setIsFree] = useState(false);
    const [thumbnail, setThumbnail] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
    const [ticketPrice, setTicketPrice] = useState(100000);

    const fetchEvents = () => {
        api.get('/events').then(({ data }) => setEvents(data)).finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('location', location);
        formData.append('category', category);
        formData.append('startDate', startDate);
        formData.append('endDate', endDate);
        formData.append('totalSeats', String(totalSeats));
        formData.append('isFree', String(isFree));

        const finalTicketTypes = [{ name: 'Regular', price: isFree ? 0 : ticketPrice, availableSeats: totalSeats }];
        formData.append('ticketTypes', JSON.stringify(finalTicketTypes));
        if (thumbnail) formData.append('thumbnail', thumbnail);

        try {
            await api.post('/events', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            alert('Event Created Successfully');
            setShowForm(false);
            fetchEvents();
        } catch (err) {
            alert('Failed to create event');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">EO Dashboard - My Events</h1>
                <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
                    <PlusCircle className="w-5 h-5" /> {showForm ? 'Cancel' : 'Create Event'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleCreate} className="glass-panel p-8 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold mb-1.5 text-muted">Event Title</label>
                            <input placeholder="Ex: Summer Music Fest" value={title} onChange={e => setTitle(e.target.value)} className="input-field" required />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1.5 text-muted">Location</label>
                            <input placeholder="Jakarta / Online" value={location} onChange={e => setLocation(e.target.value)} className="input-field" required />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1.5 text-muted">Start Date & Time</label>
                            <input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} className="input-field" required />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1.5 text-muted">End Date & Time</label>
                            <input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} className="input-field" required />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1.5 text-muted">Category</label>
                            <select value={category} onChange={e => setCategory(e.target.value)} className="input-field relative z-10 !bg-surface text-white">
                                <option value="Pop">Pop</option>
                                <option value="Rock">Rock</option>
                                <option value="Jazz">Jazz</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1.5 text-muted">Total Seats Available</label>
                            <input type="number" placeholder="100" value={totalSeats} onChange={e => setTotalSeats(Number(e.target.value))} className="input-field" required />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1.5 text-muted">Ticket Price (Rp)</label>
                            <input type="number" placeholder="150000" disabled={isFree} value={isFree ? 0 : ticketPrice} onChange={e => setTicketPrice(Number(e.target.value))} className="input-field disabled:opacity-50" required={!isFree} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1.5 text-muted">Event Description</label>
                        <textarea placeholder="Tell everyone about your amazing event..." value={description} onChange={e => setDescription(e.target.value)} className="input-field" rows={4} required />
                    </div>
                    <div className="flex items-center gap-6 mt-4">
                        <label className="flex items-center gap-2 text-sm font-semibold text-text cursor-pointer">
                            <input type="checkbox" checked={isFree} onChange={e => setIsFree(e.target.checked)} className="w-5 h-5 accent-primary" /> Free Event
                        </label>
                        <div className="flex-1">
                            <label className="block text-sm font-semibold mb-1.5 text-muted">Thumbnail Image (Optional)</label>
                            <input type="file" onChange={e => {
                                const file = e.target.files?.[0] || null;
                                setThumbnail(file);
                                if (file) setThumbnailPreview(URL.createObjectURL(file));
                                else setThumbnailPreview(null);
                            }} className="input-field" accept="image/*" />
                            {thumbnailPreview && <img src={thumbnailPreview} alt="Preview" className="mt-3 h-24 rounded-lg border border-white/10 object-cover shadow-lg" />}
                        </div>
                    </div>
                    <button type="submit" className="btn-primary w-full py-3 mt-8">Publish Event</button>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {events.map((evt: any) => (
                    <div key={evt.id} className="glass-panel p-6">
                        <h3 className="font-bold text-xl">{evt.title}</h3>
                        <p className="text-muted">{evt.location} &bull; {new Date(evt.startDate).toLocaleDateString()}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
