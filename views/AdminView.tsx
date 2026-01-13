import React, { useState } from 'react';
import { 
    Activity, Users, FileText, Stethoscope, MessageSquare, LifeBuoy, ShieldAlert 
} from 'lucide-react';

// Components
import { LayoutContainer } from '../components/ui/LayoutContainer';
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher';

// Sub-views (Modules) - Now independent
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
        <LayoutContainer className="max-w-full px-4 md:px-8">
            {/* Header / Top Bar */}
            <header className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-slate-900 border-b border-white/10 pb-6 pt-2">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3">
                        <ShieldAlert className="text-rose-500" size={32} />
                        {language === 'ar' ? 'غرفة التحكم المركزية' : 'Admin Command Center'}
                    </h1>
                    <p className="text-slate-500 font-mono text-xs mt-1 tracking-widest uppercase">
                        System Status: <span className="text-emerald-500">ONLINE</span>
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <LanguageSwitcher />
                </div>
            </header>

            {/* Navigation Tabs */}
            <div 
                className="flex p-1 bg-slate-900 rounded-lg border border-white/10 mb-8 w-full overflow-x-auto scrollbar-hide shadow-lg relative z-10"
                role="tablist"
                aria-label="Admin Sections"
            >
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        role="tab"
                        aria-selected={activeTab === tab.id}
                        aria-controls={`panel-${tab.id}`}
                        id={`tab-${tab.id}`}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-md text-sm font-bold transition-all whitespace-nowrap outline-none focus:ring-2 focus:ring-rose-500 min-w-[120px] ${
                            activeTab === tab.id 
                            ? 'bg-slate-800 text-white shadow-md border border-white/10' 
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                        }`}
                    >
                        <tab.icon size={16} aria-hidden="true" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Main Content Area - Components fetch their own data now */}
            <main 
                id={`panel-${activeTab}`} 
                role="tabpanel" 
                aria-labelledby={`tab-${activeTab}`}
                className="animate-in slide-in-from-bottom-4 relative z-10 outline-none"
                tabIndex={-1}
            >
                {activeTab === 'overview' && <AdminOverview setActiveTab={setActiveTab} />}
                {activeTab === 'doctors' && <AdminDoctors />}
                {activeTab === 'users' && <AdminUsers />}
                {activeTab === 'cms' && <AdminCMS />}
                {activeTab === 'community' && userProfile && <CommunityView currentUser={userProfile} />}
                {activeTab === 'support' && userProfile && <SupportView user={userProfile} />}
            </main>
        </LayoutContainer>
    );
};