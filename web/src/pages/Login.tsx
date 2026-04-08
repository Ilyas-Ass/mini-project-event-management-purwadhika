import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const login = useAuthStore(state => state.login);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/auth/login', { email, password });
            login(data.user, data.token);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 p-8 glass-panel shadow-2xl shadow-primary/10 border border-white/5 relative">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-2xl pointer-events-none"></div>
            <h2 className="text-3xl font-extrabold mb-8 text-center text-text">Welcome Back</h2>
            {error && <div className="bg-red-500/20 text-red-200 border border-red-500/30 p-3 rounded-lg mb-6 shadow-inner">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-semibold mb-1.5 text-muted">Email Address</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" placeholder="you@example.com" required />
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-1.5 text-muted">Password</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-field" placeholder="Enter your password" required />
                </div>
                <button type="submit" className="btn-primary w-full py-3 mt-4 text-lg">Log In</button>
            </form>
            <p className="mt-6 text-center text-muted font-medium text-sm">
                Don't have an account? <Link to="/register" className="text-primary hover:text-primary-100 hover:underline transition-all">Sign up</Link>
            </p>
        </div>
    );
};

export default Login;
