import { useEffect, useState } from 'react';
import { Calendar, MapPin, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

interface EventData {
    id: string;
    title: string;
    location: string;
    category: string;
    startDate: string;
    isFree: boolean;
    thumbnailUrl: string;
}

const LandingPage = () => {
    const [events, setEvents] = useState<EventData[]>([]);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const { data } = await api.get('/events');
                setEvents(data.slice(0, 6)); // First 6
            } catch (err) {
                console.error(err);
            }
        };
        fetchEvents();
    }, []);

    return (
        <div className="space-y-16 pb-16">
            {/* Hero Section */}
            <section className="relative pt-24 pb-32 flex flex-col items-center justify-center text-center px-4 overflow-hidden rounded-3xl mt-4 bg-gradient-to-br from-surface/50 to-primary/10 border border-white/5 shadow-2xl">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
                    Experience the <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Beats</span>.
                </h1>
                <p className="text-lg md:text-xl text-muted max-w-2xl mb-10 leading-relaxed">
                    The finest platform for electronic, acoustic, and live concert discoveries. Grab your tickets before they sell out.
                </p>
                <div className="flex gap-4">
                    <Link to="/events" className="btn-primary text-lg px-8 py-3">Find Concerts</Link>
                </div>
            </section>

            {/* Featured Events */}
            <section>
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-3xl font-bold">Upcoming Highlights</h2>
                        <p className="text-muted mt-2">Don't miss these top-rated performances.</p>
                    </div>
                    <Link to="/events" className="text-primary hover:text-primary-100 font-medium hidden md:block">View All</Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((evt) => (
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
                    ))}
                    {events.length === 0 && (
                        <div className="col-span-3 text-center py-12 text-muted border border-dashed border-white/10 rounded-xl">No events coming up soon.</div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
