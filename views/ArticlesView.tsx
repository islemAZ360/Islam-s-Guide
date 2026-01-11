import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, getDocs, addDoc } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { Article, UserProfile, ArticleCategory } from '../types';
import { BookOpen, Lightbulb, Heart, Stethoscope, X, ArrowRight, Plus, PenTool } from 'lucide-react';

// 👇 تحديث المسارات للمكونات الجديدة
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

    const canPublish = userProfile?.role === 'admin' || (userProfile?.role === 'doctor' && userProfile?.doctorData?.accountStatus === 'approved');

    return (
        <LayoutContainer>
            <PageHeader 
                title={t('knowledge_center')} 
                subtitle={t('knowledge_desc')}
                action={
                    canPublish && (
                        <Button onClick={() => setShowCreateModal(true)} variant="primary" className="!py-2 !px-4 !text-sm">
                            <PenTool size={16} /> {t('new_article_btn')}
                        </Button>
                    )
                }
            />

            {/* Category Filters */}
            <div className="flex gap-3 overflow-x-auto pb-4 mb-2 scrollbar-hide">
                {[
                    { id: 'all', label: t('cat_all'), icon: BookOpen },
                    { id: 'medical', label: t('cat_medical'), icon: Stethoscope },
                    { id: 'motivation', label: t('cat_motivation'), icon: Heart },
                    { id: 'tip', label: t('cat_tip'), icon: Lightbulb },
                ].map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id as any)}
                        className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap border ${
                            selectedCategory === cat.id 
                            ? 'bg-white text-slate-900 border-white shadow-lg shadow-white/10' 
                            : 'bg-slate-900 text-slate-500 border-white/5 hover:border-white/10 hover:text-white'
                        }`}
                    >
                        <cat.icon size={16} />
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Articles Grid */}
            {loading ? (
                <div className="text-center py-20 text-slate-500 animate-pulse">Loading...</div>
            ) : filteredArticles.length === 0 ? (
                <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-dashed border-slate-800">
                    <BookOpen size={48} className="mx-auto text-slate-700 mb-4"/>
                    <p className="text-slate-500">{language === 'ar' ? 'لا توجد مقالات هنا.' : 'No articles found.'}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredArticles.map(article => (
                        <div 
                            key={article.id}
                            onClick={() => setReadingArticle(article)}
                            className="group bg-slate-900 border border-white/5 rounded-[2rem] p-6 hover:border-indigo-500/30 hover:bg-slate-800 transition-all cursor-pointer flex flex-col h-full relative overflow-hidden"
                        >
                            <div className={`absolute top-0 right-0 w-24 h-24 bg-${getCategoryColor(article.category)}-500/10 rounded-bl-[4rem] -mr-4 -mt-4 transition-transform group-hover:scale-110`}></div>
                            
                            <div className="mb-4 relative z-10">
                                <Badge color={getCategoryColor(article.category) as any} className="mb-3 w-fit flex items-center gap-1">
                                    {getCategoryIcon(article.category)} {article.category.toUpperCase()}
                                </Badge>
                                <h3 className="text-xl font-bold text-white leading-tight group-hover:text-indigo-400 transition-colors">
                                    {article.title}
                                </h3>
                            </div>
                            
                            <p className="text-slate-500 text-sm line-clamp-3 mb-6 flex-1">
                                {article.content}
                            </p>
                            
                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-400 font-bold">
                                        {article.authorName} {article.authorRole === 'doctor' && '(Dr)'}
                                    </span>
                                    <span className="text-[9px] text-slate-600 font-mono">
                                        {new Date(article.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <span className="flex items-center gap-1 text-xs font-bold text-indigo-400 group-hover:translate-x-1 transition-transform">
                                    {t('read_more')} <ArrowRight size={14} />
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Article Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in">
                    <Card className="w-full max-w-2xl bg-slate-900 border-white/10 shadow-2xl relative">
                        <button onClick={() => setShowCreateModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={20}/></button>
                        
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <PenTool className="text-indigo-400"/> {t('new_article_btn')}
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('article_title_label')}</label>
                                <input 
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-indigo-500"
                                    value={newArticle.title}
                                    onChange={e => setNewArticle({...newArticle, title: e.target.value})}
                                    placeholder="..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('article_cat_label')}</label>
                                <div className="flex gap-2">
                                    {[
                                        { id: 'medical', label: t('cat_medical') },
                                        { id: 'motivation', label: t('cat_motivation') },
                                        { id: 'tip', label: t('cat_tip') },
                                    ].map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setNewArticle({...newArticle, category: cat.id as ArticleCategory})}
                                            className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${
                                                newArticle.category === cat.id 
                                                ? 'bg-indigo-600 border-indigo-500 text-white' 
                                                : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'
                                            }`}
                                        >
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('article_content_label')}</label>
                                <textarea 
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-indigo-500 h-40 resize-none"
                                    value={newArticle.content}
                                    onChange={e => setNewArticle({...newArticle, content: e.target.value})}
                                    placeholder="..."
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
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
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in">
                    <Card className="w-full max-w-3xl max-h-[90vh] flex flex-col bg-slate-900 border-white/10 shadow-2xl relative overflow-hidden !p-0">
                        {/* Modal Header */}
                        <div className="p-6 md:p-8 bg-slate-950 border-b border-white/5 relative">
                            <button 
                                onClick={() => setReadingArticle(null)}
                                className="absolute top-6 left-6 p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                            
                            <Badge color={getCategoryColor(readingArticle.category) as any} className="mb-4">
                                {readingArticle.category.toUpperCase()}
                            </Badge>
                            <h2 className="text-2xl md:text-4xl font-black text-white leading-tight mb-2">
                                {readingArticle.title}
                            </h2>
                            <div className="flex items-center gap-3 text-xs text-slate-500">
                                <span>{t('author_by')}: {readingArticle.authorName}</span>
                                {readingArticle.authorRole === 'doctor' && <Badge color="blue" className="!py-0 !px-1.5 !text-[9px]">Dr</Badge>}
                                {readingArticle.authorRole === 'admin' && <Badge color="rose" className="!py-0 !px-1.5 !text-[9px]">Admin</Badge>}
                                <span>•</span>
                                <span>{new Date(readingArticle.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar bg-slate-900">
                            <article className="prose prose-invert prose-lg max-w-none">
                                <p className="text-slate-300 leading-loose whitespace-pre-wrap">
                                    {readingArticle.content}
                                </p>
                            </article>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-white/5 bg-slate-950 flex justify-between items-center">
                            <p className="text-xs text-slate-600">Islam's Guide Knowledge Center</p>
                            <Button variant="secondary" onClick={() => setReadingArticle(null)} className="!py-2 !px-4 !text-xs">
                                {t('close')}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </LayoutContainer>
    );
};