import React, { useState } from 'react';
import { 
    Activity, Users, FileText, Stethoscope, MessageSquare, LifeBuoy, ShieldAlert 
} from 'lucide-react';

// Components
import { LayoutContainer } from '../components/ui/LayoutContainer';
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher';

// Sub-views (Modules)
import { AdminOverview } from './admin/AdminOverview';
import { AdminDoctors } from './admin/AdminDoctors';
import { AdminUsers } from './admin/AdminUsers';
import { AdminCMS } from './admin/AdminCMS';
import { CommunityView } from './CommunityView';
import { SupportView } from './SupportView';

// Contexts
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';

export const AdminView = () => {
    const { t, language } = useLanguage();
    const { userProfile } = useData();

    // -- State --
    const [activeTab, setActiveTab] = useState<'overview' | 'doctors' | 'users' | 'cms' | 'community' | 'support'>('overview');

    // Tabs Configuration
    const tabs = [
        { id: 'overview', icon: Activity, label: t('tab_overview') },
        { id: 'doctors', icon: Stethoscope, label: t('tab_doctors') },
        { id: 'users', icon: Users, label: t('tab_users') },
        { id: 'cms', icon: FileText, label: t('tab_cms') },
        { id: 'community', icon: MessageSquare, label: language === 'ar' ? 'الرقابة' : 'Chat Mod' },
        { id: 'support', icon: LifeBuoy, label: t('nav_support') },
    ];

    return (
        <LayoutContainer className="max-w-full px-4 md:px-8 pb-20">
            {/* Header / Top Bar */}
            <header className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10 bg-[#0f172a]/60 backdrop-blur-xl border border-white/5 p-6 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 pointer-events-none"></div>
                
                <div className="relative z-10 flex items-center gap-4">
                    <div className="p-4 bg-rose-500/10 rounded-2xl border border-rose-500/20 text-rose-500 shadow-lg shadow-rose-900/20">
                        <ShieldAlert size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight">
                            {language === 'ar' ? 'غرفة التحكم المركزية' : 'Admin Command Center'}
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <p className="text-slate-400 font-mono text-xs tracking-widest uppercase">
                                System Status: <span className="text-emerald-400 font-bold">OPERATIONAL</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 relative z-10">
                    <LanguageSwitcher />
                </div>
            </header>

            {/* Navigation Tabs (Floating Dock Style) */}
            <div className="sticky top-4 z-50 mb-8 mx-auto max-w-fit">
                <div 
                    className="flex p-2 bg-[#020617]/80 backdrop-blur-2xl rounded-full border border-white/10 shadow-2xl overflow-x-auto scrollbar-hide ring-1 ring-white/5"
                    role="tablist"
                    aria-label="Admin Sections"
                >
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                role="tab"
                                aria-selected={isActive}
                                aria-controls={`panel-${tab.id}`}
                                id={`tab-${tab.id}`}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`
                                    relative flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all duration-500 whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
                                    ${isActive ? 'text-white shadow-lg' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}
                                `}
                            >
                                {isActive && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full -z-10 animate-in zoom-in duration-300"></div>
                                )}
                                <tab.icon size={18} className={isActive ? 'animate-pulse' : ''} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Main Content Area */}
            <main 
                id={`panel-${activeTab}`} 
                role="tabpanel" 
                aria-labelledby={`tab-${activeTab}`}
                className="animate-in slide-in-from-bottom-8 duration-700 relative z-10 min-h-[600px]"
                tabIndex={-1}
            >
                {/* Background Decor */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl opacity-50 pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px]"></div>
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-rose-500/5 rounded-full blur-[100px]"></div>
                </div>

                <div className="relative z-10">
                    {activeTab === 'overview' && <AdminOverview setActiveTab={setActiveTab} />}
                    {activeTab === 'doctors' && <AdminDoctors />}
                    {activeTab === 'users' && <AdminUsers />}
                    {activeTab === 'cms' && <AdminCMS />}
                    {activeTab === 'community' && userProfile && <CommunityView currentUser={userProfile} />}
                    {activeTab === 'support' && userProfile && <SupportView user={userProfile} />}
                </div>
            </main>
        </LayoutContainer>
    );
};