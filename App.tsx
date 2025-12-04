import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import StatsCard from './components/StatsCard';
import ResultsManager from './components/ResultsManager';
import NewsManager from './components/NewsManager';
import PublicSite from './components/PublicSite'; // Import the frontend
import { TeamResult, NewsItem, FestivalStats } from './types';
import { Users, Calendar, Trophy, Zap, ArrowLeft, Lock, X } from 'lucide-react';
import { db, ref, onValue } from './firebase';

const App: React.FC = () => {
    // view state: 'public' (website) or 'admin' (dashboard)
    const [view, setView] = useState<'public' | 'admin'>('public');
    const [activeTab, setActiveTab] = useState('dashboard');
    
    // Auth State
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [loginPassword, setLoginPassword] = useState('');
    const [loginError, setLoginError] = useState('');

    const [stats] = useState<FestivalStats>({
        daysLeft: 40,
        totalEvents: 300,
        totalCompetitors: 600
    });

    const [teams, setTeams] = useState<TeamResult[]>([]);
    const [news, setNews] = useState<NewsItem[]>([]);

    // Fetch Data from Firebase on Load (Single source of truth)
    useEffect(() => {
        const teamsRef = ref(db, 'teams');
        const unsubscribeTeams = onValue(teamsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const teamsArray = Array.isArray(data) ? data : Object.values(data);
                setTeams(teamsArray as TeamResult[]);
            } else {
                setTeams([]);
            }
        });

        const newsRef = ref(db, 'news');
        const unsubscribeNews = onValue(newsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const newsArray = Object.values(data) as NewsItem[];
                newsArray.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                setNews(newsArray);
            } else {
                setNews([]);
            }
        });

        return () => {
            unsubscribeTeams();
            unsubscribeNews();
        };
    }, []);

    // Login Handler
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Hardcoded password for demonstration
        if (loginPassword === 'admin123') {
            setIsAuthenticated(true);
            setView('admin');
            setShowLoginModal(false);
            setLoginPassword('');
            setLoginError('');
        } else {
            setLoginError('Invalid password. Try "admin123"');
        }
    };

    // Logout Handler
    const handleLogout = () => {
        setIsAuthenticated(false);
        setView('public');
        setActiveTab('dashboard');
    };

    // Helper to calculate leading team
    const leadingTeam = teams.length > 0 
        ? [...teams].sort((a, b) => b.points - a.points)[0] 
        : { name: 'No Data', points: 0 };

    // --- RENDER ADMIN PANEL ---
    const renderAdminPanel = () => {
        const renderContent = () => {
            switch(activeTab) {
                case 'dashboard':
                    return (
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-3xl font-bold text-brand-light mb-2">Dashboard Overview</h2>
                                <p className="text-brand-light/60">Welcome back, Admin. Here's what's happening at Consoulium.</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatsCard title="Days Remaining" value={stats.daysLeft} icon={Calendar} colorClass="text-brand-yellow" trend="On Schedule" />
                                <StatsCard title="Active Events" value={stats.totalEvents} icon={Zap} colorClass="text-brand-teal" />
                                <StatsCard title="Total Competitors" value={stats.totalCompetitors} icon={Users} colorClass="text-brand-pink" trend="+12% this week" />
                                <StatsCard title="Leading Team" value={leadingTeam.name} icon={Trophy} colorClass="text-brand-orange" trend={`${leadingTeam.points} Pts`} />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Campus 1 Leaderboard */}
                                <div className="bg-brand-charcoal border border-brand-teal/20 rounded-2xl p-6">
                                    <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                                        <Trophy size={20} className="text-brand-teal" /> Campus 1 Leaderboard
                                    </h3>
                                    <div className="space-y-4">
                                        {teams.filter(t => t.campus === 'Campus 1').length === 0 ? (
                                            <p className="text-brand-light/50 text-center py-4">No data available...</p>
                                        ) : (
                                            [...teams].filter(t => t.campus === 'Campus 1').sort((a,b) => b.points - a.points).slice(0, 3).map((team, idx) => (
                                                <div key={team.id} className="flex items-center justify-between p-4 bg-brand-dark/50 rounded-xl border border-brand-light/5">
                                                    <div className="flex items-center gap-4">
                                                        <span className="font-pixel text-2xl text-brand-light/30 w-8">#{idx + 1}</span>
                                                        <span className="font-medium text-lg">{team.name}</span>
                                                    </div>
                                                    <span className="font-pixel text-xl text-brand-teal">{team.points} pts</span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                                {/* Campus 2 Leaderboard */}
                                <div className="bg-brand-charcoal border border-brand-pink/20 rounded-2xl p-6">
                                    <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                                        <Trophy size={20} className="text-brand-pink" /> Campus 2 Leaderboard
                                    </h3>
                                    <div className="space-y-4">
                                        {teams.filter(t => t.campus === 'Campus 2').length === 0 ? (
                                            <p className="text-brand-light/50 text-center py-4">No data available...</p>
                                        ) : (
                                            [...teams].filter(t => t.campus === 'Campus 2').sort((a,b) => b.points - a.points).slice(0, 3).map((team, idx) => (
                                                <div key={team.id} className="flex items-center justify-between p-4 bg-brand-dark/50 rounded-xl border border-brand-light/5">
                                                    <div className="flex items-center gap-4">
                                                        <span className="font-pixel text-2xl text-brand-light/30 w-8">#{idx + 1}</span>
                                                        <span className="font-medium text-lg">{team.name}</span>
                                                    </div>
                                                    <span className="font-pixel text-xl text-brand-pink">{team.points} pts</span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                case 'results': return <ResultsManager teams={teams} setTeams={setTeams} />;
                case 'news': return <NewsManager news={news} setNews={setNews} />;
                default: return <div className="p-10 text-center text-brand-light/50">Feature Coming Soon</div>;
            }
        };

        return (
            <div className="min-h-screen bg-brand-dark flex font-sans text-brand-light">
                <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
                <main className="ml-64 flex-1 p-8 md:p-12 overflow-y-auto h-screen relative">
                    {/* Back to Website Button */}
                    <button 
                        onClick={() => setView('public')}
                        className="absolute top-8 right-8 bg-brand-charcoal border border-brand-light/10 text-brand-light px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-brand-light/10 transition-colors z-50"
                    >
                        <ArrowLeft size={16} /> Back to Website
                    </button>

                    <div className="max-w-7xl mx-auto animate-[fadeIn_0.5s_ease-out]">
                        {renderContent()}
                    </div>
                </main>
            </div>
        );
    };

    return (
        <>
            {/* If view is public, render the website component */}
            {view === 'public' ? (
                <PublicSite 
                    teams={teams} 
                    news={news} 
                    onLoginClick={() => {
                        if (isAuthenticated) {
                            setView('admin');
                        } else {
                            setShowLoginModal(true);
                        }
                    }} 
                />
            ) : (
                renderAdminPanel()
            )}

            {/* Login Modal */}
            {showLoginModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-charcoal/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-brand-dark border border-brand-teal/30 rounded-2xl w-full max-w-md p-8 shadow-2xl relative transform scale-100 transition-transform">
                        <button 
                            onClick={() => { setShowLoginModal(false); setLoginPassword(''); setLoginError(''); }} 
                            className="absolute top-4 right-4 text-brand-light/50 hover:text-brand-light p-2"
                        >
                            <X size={20} />
                        </button>
                        
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 rounded-full bg-brand-teal/10 flex items-center justify-center mx-auto mb-6 text-brand-teal border border-brand-teal/20 shadow-[0_0_15px_rgba(42,157,143,0.2)]">
                                <Lock size={32} />
                            </div>
                            <h2 className="text-3xl font-bold text-brand-light mb-2">Admin Access</h2>
                            <p className="text-brand-light/60">Enter password to manage festival</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2">
                                <input 
                                    type="password" 
                                    autoFocus
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                    className="w-full bg-brand-charcoal border border-brand-light/10 rounded-xl px-4 py-4 text-center text-xl tracking-widest focus:border-brand-teal focus:outline-none transition-colors placeholder:text-brand-light/10"
                                    placeholder="••••••••"
                                />
                                {loginError && (
                                    <p className="text-brand-pink text-sm text-center font-medium animate-pulse">{loginError}</p>
                                )}
                            </div>
                            <button 
                                type="submit" 
                                className="w-full bg-brand-teal text-white font-bold py-4 rounded-xl hover:bg-brand-teal/90 transition-all shadow-lg shadow-brand-teal/20 hover:shadow-brand-teal/40 hover:-translate-y-0.5 active:translate-y-0"
                            >
                                Login
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default App;