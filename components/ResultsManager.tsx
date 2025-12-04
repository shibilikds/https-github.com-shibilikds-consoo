import React, { useState } from 'react';
import { TeamResult } from '../types';
import { Save, Plus, Trash2, Trophy, School } from 'lucide-react';
import { db, ref, set, remove } from '../firebase';

interface ResultsManagerProps {
    teams: TeamResult[];
    setTeams: React.Dispatch<React.SetStateAction<TeamResult[]>>;
}

const ResultsManager: React.FC<ResultsManagerProps> = ({ teams, setTeams }) => {
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<TeamResult>>({});

    // Firebase Update Function
    const updateFirebase = (newTeams: TeamResult[]) => {
        set(ref(db, 'teams'), newTeams);
    };

    const handleEdit = (team: TeamResult) => {
        setIsEditing(team.id);
        setEditForm(team);
    };

    const handleSave = () => {
        if (!isEditing) return;
        const updatedTeams = teams.map(t => t.id === isEditing ? { ...t, ...editForm } as TeamResult : t);
        setTeams(updatedTeams); // Update local state for immediate feedback
        updateFirebase(updatedTeams); // Update Firebase
        setIsEditing(null);
    };

    const handleDelete = (id: string) => {
        if(confirm('Are you sure you want to delete this team?')) {
            const updatedTeams = teams.filter(t => t.id !== id);
            setTeams(updatedTeams);
            updateFirebase(updatedTeams);
        }
    };

    const handleAdd = (campus: string) => {
        const newTeam: TeamResult = {
            id: Date.now().toString(),
            name: 'New Team',
            points: 0,
            campus: campus
        };
        const updatedTeams = [...teams, newTeam];
        setTeams(updatedTeams);
        updateFirebase(updatedTeams);
        handleEdit(newTeam);
    };

    const CampusSection = ({ title, campusId, colorClass }: { title: string, campusId: string, colorClass: string }) => {
         const campusTeams = teams.filter(t => t.campus === campusId).sort((a,b) => b.points - a.points);
         
         return (
            <div className="bg-brand-charcoal border border-brand-light/5 rounded-2xl overflow-hidden flex flex-col h-full shadow-xl">
                <div className="p-6 border-b border-brand-light/5 flex justify-between items-center bg-brand-light/5">
                    <div className="flex items-center gap-3">
                         <div className={`p-2 rounded-lg ${colorClass} bg-opacity-10 bg-current`}>
                            <School size={24} className={colorClass} />
                         </div>
                         <h3 className="text-xl font-bold text-brand-light">{title}</h3>
                    </div>
                     <button 
                        onClick={() => handleAdd(campusId)} 
                        className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${colorClass} bg-opacity-10 bg-current hover:bg-opacity-20 text-sm`}
                    >
                        <Plus size={16} /> Add Team
                    </button>
                </div>
                
                <div className="p-6 space-y-4 flex-1">
                     {campusTeams.length === 0 ? (
                        <div className="text-center py-8 text-brand-light/30 border-2 border-dashed border-brand-light/5 rounded-xl">
                            No teams in {title}
                        </div>
                    ) : (
                        campusTeams.map((team, index) => (
                            <div key={team.id} className={`group relative bg-brand-dark/50 border ${isEditing === team.id ? 'border-brand-yellow' : 'border-brand-light/5'} p-4 rounded-xl transition-all hover:border-brand-light/20 shadow-sm`}>
                                {isEditing === team.id ? (
                                    <div className="flex flex-col gap-3">
                                        <div className="flex gap-2">
                                            <input 
                                                autoFocus
                                                type="text" 
                                                value={editForm.name} 
                                                onChange={e => setEditForm({...editForm, name: e.target.value})}
                                                className="flex-1 bg-brand-charcoal border border-brand-teal/30 rounded px-3 py-2 text-brand-light focus:outline-none focus:border-brand-yellow"
                                                placeholder="Team Name"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <input 
                                                type="number" 
                                                value={editForm.points} 
                                                onChange={e => setEditForm({...editForm, points: parseInt(e.target.value)})}
                                                className="flex-1 bg-brand-charcoal border border-brand-teal/30 rounded px-3 py-2 text-brand-light focus:outline-none focus:border-brand-yellow font-pixel tracking-widest"
                                                placeholder="Points"
                                            />
                                            <button onClick={handleSave} className="px-4 bg-brand-teal text-white rounded hover:bg-brand-teal/80 transition-colors">
                                                <Save size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-brand-light/5 flex items-center justify-center font-pixel text-xl text-brand-light/30 border border-brand-light/5 shadow-inner">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-lg leading-tight">{team.name}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Trophy size={14} className={colorClass} />
                                                    <span className={`font-pixel text-xl ${colorClass}`}>{team.points}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                             <button onClick={() => handleEdit(team)} className="p-2 hover:bg-brand-light/10 rounded text-brand-light/60 hover:text-brand-light transition-colors">
                                                Edit
                                            </button>
                                            <button onClick={() => handleDelete(team.id)} className="p-2 hover:bg-brand-pink/10 rounded text-brand-light/30 hover:text-brand-pink transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
         );
    }

    return (
        <div className="space-y-8 h-full flex flex-col">
            <div>
                <h2 className="text-3xl font-bold text-brand-light">Live Results Manager</h2>
                <p className="text-brand-light/60 mt-2">Manage leaderboards for each campus independently.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
                <CampusSection 
                    title="Campus 1" 
                    campusId="Campus 1" 
                    colorClass="text-brand-teal" 
                />
                <CampusSection 
                    title="Campus 2" 
                    campusId="Campus 2" 
                    colorClass="text-brand-pink" 
                />
            </div>
        </div>
    );
};

export default ResultsManager;