import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Calendar, Tag, FilterX } from 'lucide-react';
import api from '../services/api';
import { useDebounce } from '../hooks/useDebounce';

interface EventData {
    id: string;
    title: string;
    location: string;
    category: string;
    startDate: string;
    isFree: boolean;
    thumbnailUrl: string;
    organizer: { name: string };
}

const EventsPage = () => {
    const [events, setEvents] = useState<EventData[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [category, setCategory] = useState('');
    const [location, setLocation] = useState('');
    const [isFree, setIsFree] = useState('');
    const [loading, setLoading] = useState(true);

    const debouncedSearch = useDebounce(searchQuery, 400);

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            try {
                let url = '/events?';
                if (debouncedSearch) url += `q=${debouncedSearch}&`;
                if (category) url += `category=${category}&`;
                if (location) url += `location=${location}&`;
                if (isFree !== '') url += `isFree=${isFree}&`;

                const { data } = await api.get(url);
                setEvents(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, [debouncedSearch, category, location, isFree]);

    return (
        <div className="space-y-8">
            <div className="glass-panel p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
                <h1 className="text-3xl font-extrabold mb-6">Discover Events</h1>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm font-semibold mb-1.5 text-muted">Find Event</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-3 w-5 h-5 text-muted" />
                            <input
                                type="text"
                                placeholder="Search by title, artist..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="input-field pl-10 h-12"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1.5 text-muted">Category</label>
                        <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field h-12">
                            <option value="">All Categories</option>
                            <option value="Pop">Pop</option>
                            <option value="Rock">Rock</option>
                            <option value="Electronic">Electronic</option>
                            <option value="Jazz">Jazz</option>
                            <option value="Acoustic">Acoustic</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1.5 text-muted">Pricing</label>
                        <select value={isFree} onChange={(e) => setIsFree(e.target.value)} className="input-field h-12">
                            <option value="">Any Price</option>
                            <option value="false">Paid</option>
                            <option value="true">Free</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-3 text-center py-20 text-muted">Loading pulse...</div>
                ) : events.length > 0 ? (
                    events.map((evt) => (
                        <Link key={evt.id} to={`/events/${evt.id}`} className="group relative block rounded-2xl overflow-hidden glass-panel hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300">
                            <div className="aspect-[4/3] w-full overflow-hidden bg-surface relative">
                                <img
                                    src={evt.thumbnailUrl ? `http://localhost:5000${evt.thumbnailUrl}` : 'https://images.unsplash.com/photo-1540039155732-6752dc362709?auto=format&fit=crop&q=80'}
                                    alt={evt.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                {evt.isFree && (
                                    <div className="absolute top-4 right-4 bg-accent text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">FREE</div>
                                )}
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{evt.title}</h3>
                                <div className="space-y-2 text-sm text-muted">
                                    <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> {new Date(evt.startDate).toLocaleDateString()}</div>
                                    <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-secondary" /> {evt.location}</div>
                                    <div className="flex items-center gap-2"><Tag className="w-4 h-4 text-accent" /> {evt.category}</div>
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="col-span-3 text-center py-20 glass-panel">
                        <FilterX className="w-12 h-12 text-muted mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-semibold mb-2">No events found</h3>
                        <p className="text-muted">Try adjusting your filters or search query.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventsPage;
