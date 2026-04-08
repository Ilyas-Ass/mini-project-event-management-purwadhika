import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('attendee');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const login = useAuthStore(state => state.login);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/auth/register', { name, email, password, role });
            login(data.user, data.token);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 p-8 glass-panel shadow-2xl shadow-primary/10 border border-white/5 relative">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-secondary/20 rounded-full blur-2xl pointer-events-none"></div>
            <h2 className="text-3xl font-extrabold mb-8 text-center text-text">Create Account</h2>
            {error && <div className="bg-red-500/20 text-red-200 border border-red-500/30 p-3 rounded-lg mb-6 shadow-inner">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-semibold mb-1.5 text-muted">Full Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-field" placeholder="John Doe" required />
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-1.5 text-muted">Email Address</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" placeholder="you@example.com" required />
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-1.5 text-muted">Password</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-field" placeholder="Choose a secure password" required />
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-1.5 text-muted">Join As</label>
                    <select value={role} onChange={e => setRole(e.target.value)} className="input-field appearance-none bg-surface border-white/10 text-white !py-3">
                        <option value="attendee">Attendee (Buy Tickets & Explore)</option>
                        <option value="eo">Event Organizer (Create & Manage Events)</option>
                    </select>
                </div>
                <button type="submit" className="btn-primary w-full py-3 mt-4 text-lg">Sign Up</button>
            </form>
            <p className="mt-6 text-center text-muted font-medium text-sm">
                Already have an account? <Link to="/login" className="text-primary hover:text-primary-100 hover:underline transition-all">Log in</Link>
            </p>
        </div>
    );
};

export default Register;
