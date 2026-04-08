import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { LogOut, User, Menu } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
    const { isAuthenticated, user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-white/5">
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">EventMU</Link>

                <div className="md:hidden">
                    <button onClick={() => setMenuOpen(!menuOpen)} className="text-text hover:text-primary transition-colors">
                        <Menu className="w-6 h-6" />
                    </button>
                </div>

                <nav className={`absolute md:relative top-full left-0 w-full md:w-auto bg-surface md:bg-transparent p-4 md:p-0 border-b border-white/5 md:border-none flex flex-col md:flex-row md:items-center gap-4 transition-all duration-300 ${menuOpen ? 'flex' : 'hidden md:flex'}`}>
                    <Link to="/events" className="text-muted hover:text-primary font-medium transition-colors">Discover</Link>

                    {isAuthenticated && user ? (
                        <div className="flex flex-col md:flex-row md:items-center gap-4 mt-4 md:mt-0">
                            <span className="text-sm font-semibold text-accent">{user.points} Pts</span>
                            {user.role === 'eo' && (
                                <>
                                    <Link to="/eo/dashboard" className="text-muted hover:text-primary font-medium transition-colors">Events</Link>
                                    <Link to="/eo/transactions" className="text-muted hover:text-primary font-medium transition-colors">Transactions</Link>
                                    <Link to="/eo/promotions" className="text-muted hover:text-primary font-medium transition-colors">Promos</Link>
                                </>
                            )}
                            {user.role === 'attendee' && (
                                <Link to="/transactions" className="text-muted hover:text-primary font-medium transition-colors">My Tickets</Link>
                            )}
                            <button onClick={handleLogout} className="flex flex-row items-center gap-2 text-red-400 hover:text-red-300 transition-colors">
                                <LogOut className="w-4 h-4" /> Logout
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
                            <Link to="/login" className="btn-outline text-center">Log In</Link>
                            <Link to="/register" className="btn-primary text-center">Sign Up</Link>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Navbar;
