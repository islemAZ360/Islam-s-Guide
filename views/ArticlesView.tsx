import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, getDocs, addDoc } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { Article, UserProfile, ArticleCategory } from '../types';
import { BookOpen, Lightbulb, Heart, Stethoscope, X, ArrowRight, Plus, PenTool, Sparkles } from 'lucide-react';

// المكونات
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { LayoutContainer } from '../components/ui/LayoutContainer';
import { Badge } from '../components/ui/Badge';

import { useLanguage } from '../contexts/LanguageContext';

interface ArticlesViewProps {
    userProfile?: UserProfile | null;
}

export const ArticlesView = ({ userProfile }: ArticlesViewProps) => {
    const { t, language } = useLanguage();
    const [articles, setArticles] = useState<Article[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<'all' | ArticleCategory>('all');
    const [readingArticle, setReadingArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(true);

    // -- Create Mode State --
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newArticle, setNewArticle] = useState({ title: '', content: '', category: 'tip' as ArticleCategory });

    // -- Fetch Articles --
    const fetchArticles = async () => {
        setLoading(true);
        try {
            const q = query(
                collection(db, "articles"), 
                where("isPublished", "==", true),
                orderBy("createdAt", "desc")
            );
            const snapshot = await getDocs(q);
            const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article));
            setArticles(fetched);
        } catch (e) {
            console.error("Error fetching articles", e);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchArticles();
    }, []);

    // -- Publish Action --
    const handlePublish = async () => {
        const currentUser = auth?.currentUser;

        if (!currentUser || !userProfile) return;
        
        if (!newArticle.title.trim() || !newArticle.content.trim()) return;

        try {
            await addDoc(collection(db, "articles"), {
                title: newArticle.title,
                content: newArticle.content,
                category: newArticle.category,
                isPublished: true,
                createdAt: Date.now(),
                authorId: currentUser.uid, 
                authorName: userProfile.name,
                authorRole: userProfile.role 
            });
            
            setShowCreateModal(false);
            setNewArticle({ title: '', content: '', category: 'tip' });
            fetchArticles();
            alert(language === 'ar' ? "تم نشر المقال بنجاح!" : "Article published successfully!");
        } catch (e) {
            console.error("Error publishing article:", e);
            alert("Error publishing article.");
        }
    };

    // -- Helpers --
    const filteredArticles = selectedCategory === 'all' 
        ? articles 
        : articles.filter(a => a.category === selectedCategory);

    const getCategoryIcon = (cat: string) => {
        switch(cat) {
            case 'medical': return <Stethoscope size={16} />;
            case 'motivation': return <Heart size={16} />;
            default: return <Lightbulb size={16} />;
        }
    };

    const getCategoryColor = (cat: string) => {
        switch(cat) {
            case 'medical': return 'indigo';
            case 'motivation': return 'rose';
            default: return 'amber';
        }
    };

    const getCategoryGradient = (cat: string) => {
        switch(cat) {
            case 'medical': return 'from-indigo-500/20 to-blue-500/20 hover:from-indigo-500/30 hover:to-blue-500/30';
            case 'motivation': return 'from-rose-500/20 to-pink-500/20 hover:from-rose-500/30 hover:to-pink-500/30';
            default: return 'from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30';
        }
    };

    const canPublish = userProfile?.role === 'admin' || (userProfile?.role === 'doctor' && userProfile?.doctorData?.accountStatus === 'approved');

    return (
        <LayoutContainer>
            <PageHeader 
                title={t('knowledge_center')} 
                subtitle={t('knowledge_desc')}
                action={
                    canPublish && (
                        <Button onClick={() => setShowCreateModal(true)} variant="primary" className="!rounded-xl shadow-indigo-500/20">
                            <PenTool size={18} /> {t('new_article_btn')}
                        </Button>
                    )
                }
            />

            {/* Category Filters */}
            <div className="flex gap-3 overflow-x-auto pb-6 mb-2 scrollbar-hide">
                {[
                    { id: 'all', label: t('cat_all'), icon: BookOpen },
                    { id: 'medical', label: t('cat_medical'), icon: Stethoscope },
                    { id: 'motivation', label: t('cat_motivation'), icon: Heart },
                    { id: 'tip', label: t('cat_tip'), icon: Lightbulb },
                ].map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id as any)}
                        className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap border backdrop-blur-md ${
                            selectedCategory === cat.id 
                            ? 'bg-white text-slate-900 border-white shadow-lg shadow-white/20 scale-105' 
                            : 'bg-slate-900/40 text-slate-400 border-white/5 hover:border-white/20 hover:text-white'
                        }`}
                    >
                        <cat.icon size={18} />
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Articles Grid */}
            {loading ? (
                <div className="text-center py-24 text-indigo-400 animate-pulse flex flex-col items-center">
                    <Sparkles className="w-10 h-10 mb-4 animate-spin-slow"/>
                    <span className="font-bold tracking-widest text-sm">جاري تحميل المحتوى...</span>
                </div>
            ) : filteredArticles.length === 0 ? (
                <div className="text-center py-20 bg-slate-900/40 rounded-[2.5rem] border border-dashed border-slate-800 backdrop-blur-sm">
                    <BookOpen size={48} className="mx-auto text-slate-700 mb-4"/>
                    <p className="text-slate-500">{language === 'ar' ? 'لا توجد مقالات هنا.' : 'No articles found.'}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredArticles.map(article => (
                        <div 
                            key={article.id}
                            onClick={() => setReadingArticle(article)}
                            className={`group rounded-[2rem] p-6 cursor-pointer flex flex-col h-full relative overflow-hidden transition-all duration-300 hover:-translate-y-2 border border-white/5 bg-gradient-to-br ${getCategoryGradient(article.category)}`}
                        >
                            <div className="mb-4 relative z-10">
                                <Badge color={getCategoryColor(article.category) as any} className="mb-4 w-fit flex items-center gap-1.5 !text-[10px] !py-1 !px-2.5 shadow-none bg-black/20 border-transparent">
                                    {getCategoryIcon(article.category)} {article.category.toUpperCase()}
                                </Badge>
                                <h3 className="text-xl font-bold text-white leading-snug group-hover:text-white/90 transition-colors line-clamp-2">
                                    {article.title}
                                </h3>
                            </div>
                            
                            <p className="text-white/60 text-sm line-clamp-3 mb-6 flex-1 font-medium leading-relaxed">
                                {article.content}
                            </p>
                            
                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10 relative z-10">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-white/50 font-bold uppercase tracking-wider">
                                        {article.authorName} {article.authorRole === 'doctor' && '(Dr)'}
                                    </span>
                                    <span className="text-[10px] text-white/40 font-mono">
                                        {new Date(article.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:bg-white group-hover:text-slate-900 transition-all">
                                    <ArrowRight size={14} className={language === 'ar' ? 'rotate-180' : ''}/>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Article Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in">
                    <Card className="w-full max-w-2xl bg-slate-900 border-white/10 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                        <button onClick={() => setShowCreateModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 hover:bg-white/5 rounded-full transition-colors"><X size={20}/></button>
                        
                        <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400"><PenTool size={20}/></div>
                            {t('new_article_btn')}
                        </h2>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">{t('article_title_label')}</label>
                                <input 
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-indigo-500 transition-all placeholder-slate-700"
                                    value={newArticle.title}
                                    onChange={e => setNewArticle({...newArticle, title: e.target.value})}
                                    placeholder="عنوان جذاب..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">{t('article_cat_label')}</label>
                                <div className="flex gap-2">
                                    {[
                                        { id: 'medical', label: t('cat_medical'), color: 'indigo' },
                                        { id: 'motivation', label: t('cat_motivation'), color: 'rose' },
                                        { id: 'tip', label: t('cat_tip'), color: 'amber' },
                                    ].map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setNewArticle({...newArticle, category: cat.id as ArticleCategory})}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                                                newArticle.category === cat.id 
                                                ? `bg-${cat.color}-600 border-${cat.color}-500 text-white shadow-lg` 
                                                : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'
                                            }`}
                                        >
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">{t('article_content_label')}</label>
                                <textarea 
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-indigo-500 h-48 resize-none transition-all placeholder-slate-700 custom-scrollbar"
                                    value={newArticle.content}
                                    onChange={e => setNewArticle({...newArticle, content: e.target.value})}
                                    placeholder="اكتب محتوى المقال هنا..."
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                                <Button variant="secondary" onClick={() => setShowCreateModal(false)}>{t('cancel_btn')}</Button>
                                <Button variant="success" onClick={handlePublish} disabled={!newArticle.title || !newArticle.content}>
                                    {t('publish_now')}
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Reading Modal */}
            {readingArticle && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 animate-in fade-in">
                    <div className="w-full max-w-3xl max-h-[90vh] flex flex-col bg-slate-900 border border-white/10 shadow-2xl relative overflow-hidden rounded-[2.5rem]">
                        {/* Modal Header */}
                        <div className={`p-8 md:p-10 border-b border-white/5 relative bg-gradient-to-br ${getCategoryGradient(readingArticle.category)}`}>
                            <button 
                                onClick={() => setReadingArticle(null)}
                                className="absolute top-6 left-6 p-2 bg-black/20 rounded-full text-white/70 hover:text-white transition-colors backdrop-blur-md"
                            >
                                <X size={20} />
                            </button>
                            
                            <Badge color={getCategoryColor(readingArticle.category) as any} className="mb-4 bg-black/20 border-transparent text-white shadow-none">
                                {readingArticle.category.toUpperCase()}
                            </Badge>
                            <h2 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4 drop-shadow-lg">
                                {readingArticle.title}
                            </h2>
                            <div className="flex items-center gap-4 text-xs text-white/60 font-medium">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-bold text-white">
                                        {readingArticle.authorName.charAt(0)}
                                    </div>
                                    <span>{readingArticle.authorName}</span>
                                </div>
                                <span>•</span>
                                <span>{new Date(readingArticle.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar bg-slate-950/50">
                            <article className="prose prose-invert prose-lg max-w-none">
                                <p className="text-slate-300 leading-loose whitespace-pre-wrap text-lg">
                                    {readingArticle.content}
                                </p>
                            </article>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-white/5 bg-slate-950/80 backdrop-blur-md flex justify-between items-center">
                            <p className="text-xs text-slate-600 font-bold uppercase tracking-wider">Islam's Guide Knowledge Center</p>
                            <Button variant="secondary" onClick={() => setReadingArticle(null)} className="!py-2 !px-6 !text-xs !rounded-xl">
                                {t('close')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </LayoutContainer>
    );
};