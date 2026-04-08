import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Tag, Users, Clock } from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../store/useAuthStore';

interface TicketType {
    id: string;
    name: string;
    price: number;
    availableSeats: number;
}

interface EventData {
    id: string;
    title: string;
    description: string;
    location: string;
    category: string;
    startDate: string;
    endDate: string;
    isFree: boolean;
    thumbnailUrl: string;
    organizer: { name: string };
    ticketTypes: TicketType[];
}

const EventDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState<EventData | null>(null);
    const [loading, setLoading] = useState(true);
    const { isAuthenticated, user } = useAuthStore();

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const { data } = await api.get(`/events/${id}`);
                setEvent(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id]);

    if (loading) return <div className="text-center py-20 text-muted">Loading details...</div>;
    if (!event) return <div className="text-center py-20 text-red-400">Event not found.</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            <div className="relative h-96 rounded-3xl overflow-hidden glass-panel border border-white/5 shadow-2xl">
                <img
                    src={event.thumbnailUrl ? `http://localhost:5000${event.thumbnailUrl}` : 'https://images.unsplash.com/photo-1540039155732-6752dc362709?auto=format&fit=crop&q=80'}
                    alt={event.title}
                    className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full">
                    <div className="flex flex-wrap gap-2 mb-4">
                        <span className="badge bg-primary/20 text-primary-200 border-primary/30 uppercase">{event.category}</span>
                        {event.isFree && <span className="badge bg-accent/20 text-accent uppercase">FREE EVENT</span>}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-2">{event.title}</h1>
                    <p className="text-lg text-muted font-medium">by {event.organizer.name}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="col-span-2 space-y-8">
                    <section className="glass-panel p-8">
                        <h2 className="text-2xl font-bold mb-4">About this event</h2>
                        <p className="text-muted leading-relaxed whitespace-pre-wrap">{event.description}</p>
                    </section>
                </div>

                <div className="space-y-6">
                    <section className="glass-panel p-6 space-y-4">
                        <h3 className="font-bold text-lg border-b border-white/10 pb-2">Event Info</h3>
                        <div className="flex items-start gap-4">
                            <Calendar className="w-6 h-6 text-primary shrink-0" />
                            <div>
                                <p className="font-semibold">{new Date(event.startDate).toLocaleDateString()}</p>
                                <p className="text-sm text-muted">{new Date(event.startDate).toLocaleTimeString()} - {new Date(event.endDate).toLocaleTimeString()}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <MapPin className="w-6 h-6 text-secondary shrink-0" />
                            <div>
                                <p className="font-semibold">{event.location}</p>
                                <p className="text-sm text-muted">Venue Details</p>
                            </div>
                        </div>
                    </section>

                    <section className="glass-panel p-6 space-y-4">
                        <h3 className="font-bold text-lg border-b border-white/10 pb-2">Tickets</h3>
                        {event.ticketTypes.map(ticket => (
                            <div key={ticket.id} className="p-4 rounded-xl border border-white/5 bg-surface/50 hover:border-primary/50 transition-colors flex justify-between items-center group">
                                <div>
                                    <h4 className="font-bold text-primary-50 group-hover:text-primary transition-colors">{ticket.name}</h4>
                                    <p className="text-sm text-muted">{ticket.availableSeats} remaining</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-xl">{ticket.price === 0 ? 'FREE' : `Rp ${ticket.price.toLocaleString('id-ID')}`}</p>
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={() => {
                                if (!isAuthenticated) return navigate('/login');
                                if (user?.role === 'eo') return alert('EO cannot purchase tickets');
                                navigate(`/checkout/${event.id}`);
                            }}
                            className="btn-primary w-full py-4 text-lg font-bold mt-4 shadow-xl shadow-primary/20"
                            disabled={event.ticketTypes.every(t => t.availableSeats === 0)}
                        >
                            {event.ticketTypes.every(t => t.availableSeats === 0) ? 'Sold Out' : 'Grab Tickets Now'}
                        </button>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default EventDetailsPage;
