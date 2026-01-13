import React, { useEffect, useState, useRef } from 'react';
import { collection, query, where, orderBy, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { Article, UserProfile, ArticleCategory } from '../types';
import { BookOpen, Lightbulb, Heart, Stethoscope, X, ArrowRight, PenTool, Sparkles, Clock, CheckCircle, Trash2 } from 'lucide-react';

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

// Internal Component: Article Skeleton Loader
const ArticleSkeleton = () => (
    <div className="rounded-[2rem] p-6 border border-white/5 bg-slate-900/40 animate-pulse h-full flex flex-col">
        <div className="w-24 h-6 bg-slate-800 rounded-full mb-4"></div>
        <div className="w-3/4 h-8 bg-slate-800 rounded-lg mb-2"></div>
        <div className="w-1/2 h-8 bg-slate-800 rounded-lg mb-6"></div>
        <div className="space-y-2 flex-1">
            <div className="w-full h-4 bg-slate-800/50 rounded"></div>
            <div className="w-full h-4 bg-slate-800/50 rounded"></div>
            <div className="w-2/3 h-4 bg-slate-800/50 rounded"></div>
        </div>
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/5">
            <div className="w-20 h-4 bg-slate-800 rounded"></div>
            <div className="w-8 h-8 bg-slate-800 rounded-full"></div>
        </div>
    </div>
);

export const ArticlesView = ({ userProfile }: ArticlesViewProps) => {
    const { t, language, dir } = useLanguage();
    const [articles, setArticles] = useState<Article[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<'all' | ArticleCategory>('all');
    const [readingArticle, setReadingArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(true);

    // -- Create Mode State --
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newArticle, setNewArticle] = useState({ title: '', content: '', category: 'tip' as ArticleCategory });

    // Focus Management Refs
    const modalRef = useRef<HTMLDivElement>(null);

    // -- Helpers --
    const calculateReadingTime = (text: string) => {
        const wordsPerMinute = 200;
        const words = text.trim().split(/\s+/).length;
        return Math.ceil(words / wordsPerMinute);
    };

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

    // Manage Focus for Reading Modal
    useEffect(() => {
        if (readingArticle) {
            setTimeout(() => modalRef.current?.focus(), 100);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [readingArticle]);

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

    // -- Delete Action --
    const handleDelete = async (e: React.MouseEvent, article: Article) => {
        e.stopPropagation(); // Prevent opening the article
        if (!article.id) return;
        
        const confirmMsg = language === 'ar' 
            ? "هل أنت متأكد من حذف هذا المقال؟" 
            : "Are you sure you want to delete this article?";

        if (window.confirm(confirmMsg)) {
            try {
                await deleteDoc(doc(db, "articles", article.id));
                setArticles(prev => prev.filter(a => a.id !== article.id));
            } catch (err) {
                console.error("Failed to delete article", err);
                alert("Error deleting article");
            }
        }
    };

    // -- UI Helpers --
    const filteredArticles = selectedCategory === 'all' 
        ? articles 
        : articles.filter(a => a.category === selectedCategory);

    const getCategoryIcon = (cat: string) => {
        switch(cat) {
            case 'medical': return <Stethoscope size={14} aria-hidden="true" />;
            case 'motivation': return <Heart size={14} aria-hidden="true" />;
            default: return <Lightbulb size={14} aria-hidden="true" />;
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
            case 'medical': return 'from-indigo-500/20 to-blue-500/20 hover:from-indigo-500/30 hover:to-blue-500/30 border-indigo-500/20';
            case 'motivation': return 'from-rose-500/20 to-pink-500/20 hover:from-rose-500/30 hover:to-pink-500/30 border-rose-500/20';
            default: return 'from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border-amber-500/20';
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
                        <Button onClick={() => setShowCreateModal(true)} variant="primary" className="!rounded-xl shadow-indigo-500/20" aria-label={t('new_article_btn')}>
                            <PenTool size={18} aria-hidden="true" /> {t('new_article_btn')}
                        </Button>
                    )
                }
            />

            {/* Category Filters */}
            <div className="flex gap-3 overflow-x-auto pb-6 mb-2 scrollbar-hide" role="tablist" aria-label="Article Categories">
                {[
                    { id: 'all', label: t('cat_all'), icon: BookOpen },
                    { id: 'medical', label: t('cat_medical'), icon: Stethoscope },
                    { id: 'motivation', label: t('cat_motivation'), icon: Heart },
                    { id: 'tip', label: t('cat_tip'), icon: Lightbulb },
                ].map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id as any)}
                        role="tab"
                        aria-selected={selectedCategory === cat.id}
                        className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap border backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                            selectedCategory === cat.id 
                            ? 'bg-white text-slate-900 border-white shadow-lg shadow-white/20 scale-105' 
                            : 'bg-slate-900/40 text-slate-400 border-white/5 hover:border-white/20 hover:text-white'
                        }`}
                    >
                        <cat.icon size={18} aria-hidden="true" />
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    // Show 3 Skeletons while loading
                    Array.from({ length: 3 }).map((_, i) => <ArticleSkeleton key={i} />)
                ) : filteredArticles.length === 0 ? (
                    <div className="col-span-full text-center py-20 bg-slate-900/40 rounded-[2.5rem] border border-dashed border-slate-800 backdrop-blur-sm">
                        <BookOpen size={48} className="mx-auto text-slate-700 mb-4" aria-hidden="true"/>
                        <p className="text-slate-500">{language === 'ar' ? 'لا توجد مقالات في هذا القسم حالياً.' : 'No articles found in this category.'}</p>
                    </div>
                ) : (
                    filteredArticles.map(article => {
                        const canDelete = userProfile?.role === 'admin' || (userProfile?.uid && userProfile.uid === article.authorId);
                        
                        return (
                            <article 
                                key={article.id}
                                className={`group rounded-[2rem] p-6 flex flex-col h-full relative overflow-hidden transition-all duration-300 hover:-translate-y-2 border bg-gradient-to-br ${getCategoryGradient(article.category)}`}
                            >
                                <button 
                                    onClick={() => setReadingArticle(article)}
                                    className="absolute inset-0 z-10 w-full h-full focus:outline-none focus:ring-4 focus:ring-indigo-500/50 rounded-[2rem]"
                                    aria-label={`Read article: ${article.title}`}
                                ></button>

                                <div className="mb-4 relative z-20 pointer-events-none">
                                    <div className="flex justify-between items-start mb-4 pointer-events-auto">
                                        <Badge color={getCategoryColor(article.category) as any} className="flex items-center gap-1.5 !text-[10px] !py-1 !px-2.5 shadow-none bg-black/20 border-transparent backdrop-blur-md">
                                            {getCategoryIcon(article.category)} {article.category.toUpperCase()}
                                        </Badge>
                                        
                                        <div className="flex gap-2">
                                            <span className="text-[10px] font-bold text-white/40 flex items-center gap-1 bg-black/20 px-2 py-1 rounded-full">
                                                <Clock size={10} /> {calculateReadingTime(article.content)} min
                                            </span>
                                            {canDelete && (
                                                <button 
                                                    onClick={(e) => handleDelete(e, article)}
                                                    className="bg-black/20 hover:bg-rose-500 text-white/60 hover:text-white p-1.5 rounded-full transition-all"
                                                    aria-label="Delete Article"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-white leading-snug group-hover:text-white/90 transition-colors line-clamp-2">
                                        {article.title}
                                    </h3>
                                </div>
                                
                                <p className="text-white/60 text-sm line-clamp-3 mb-6 flex-1 font-medium leading-relaxed relative z-0 pointer-events-none">
                                    {article.content}
                                </p>
                                
                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10 relative z-0 pointer-events-none">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-white/50 font-bold uppercase tracking-wider flex items-center gap-1">
                                            {article.authorRole === 'doctor' && <CheckCircle size={10} className="text-blue-400" />}
                                            {article.authorName}
                                        </span>
                                        <span className="text-[10px] text-white/40 font-mono">
                                            {new Date(article.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:bg-white group-hover:text-slate-900 transition-all">
                                        <ArrowRight size={14} className={dir === 'rtl' ? 'rotate-180' : ''}/>
                                    </div>
                                </div>
                            </article>
                        );
                    })
                )}
            </div>

            {/* Create Article Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in" role="dialog" aria-modal="true" aria-labelledby="create-title">
                    <Card className="w-full max-w-2xl bg-slate-900 border-white/10 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                        <button onClick={() => setShowCreateModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 hover:bg-white/5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500" aria-label={t('close')}><X size={20}/></button>
                        
                        <h2 id="create-title" className="text-2xl font-black text-white mb-8 flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400"><PenTool size={20} aria-hidden="true"/></div>
                            {t('new_article_btn')}
                        </h2>

                        <div className="space-y-5">
                            <div>
                                <label htmlFor="art-title" className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">{t('article_title_label')}</label>
                                <input 
                                    id="art-title"
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-indigo-500 transition-all placeholder-slate-700"
                                    value={newArticle.title}
                                    onChange={e => setNewArticle({...newArticle, title: e.target.value})}
                                    placeholder="عنوان جذاب..."
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label id="art-cat-label" className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">{t('article_cat_label')}</label>
                                <div className="flex gap-2" role="radiogroup" aria-labelledby="art-cat-label">
                                    {[
                                        { id: 'medical', label: t('cat_medical'), color: 'indigo' },
                                        { id: 'motivation', label: t('cat_motivation'), color: 'rose' },
                                        { id: 'tip', label: t('cat_tip'), color: 'amber' },
                                    ].map(cat => (
                                        <button
                                            key={cat.id}
                                            role="radio"
                                            aria-checked={newArticle.category === cat.id}
                                            onClick={() => setNewArticle({...newArticle, category: cat.id as ArticleCategory})}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-slate-900 focus:ring-${cat.color}-500 ${
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
                                <label htmlFor="art-content" className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">{t('article_content_label')}</label>
                                <textarea 
                                    id="art-content"
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
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 animate-in fade-in"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="read-title"
                >
                    <div 
                        ref={modalRef}
                        tabIndex={-1}
                        className="w-full max-w-3xl max-h-[90vh] flex flex-col bg-slate-900 border border-white/10 shadow-2xl relative overflow-hidden rounded-[2.5rem] outline-none"
                    >
                        {/* Modal Header */}
                        <div className={`p-8 md:p-10 border-b border-white/5 relative bg-gradient-to-br ${getCategoryGradient(readingArticle.category)}`}>
                            <button 
                                onClick={() => setReadingArticle(null)}
                                className="absolute top-6 left-6 p-2 bg-black/20 rounded-full text-white/70 hover:text-white transition-colors backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-white"
                                aria-label={t('close')}
                            >
                                <X size={20} />
                            </button>
                            
                            <div className="flex gap-2 mb-4">
                                <Badge color={getCategoryColor(readingArticle.category) as any} className="bg-black/20 border-transparent text-white shadow-none">
                                    {readingArticle.category.toUpperCase()}
                                </Badge>
                                {readingArticle.authorRole === 'doctor' && (
                                    <Badge color="blue" className="bg-blue-500/20 border-blue-500/30 text-blue-100 shadow-none">
                                        <CheckCircle size={12} className="mr-1" /> VERIFIED DOCTOR
                                    </Badge>
                                )}
                            </div>

                            <h2 id="read-title" className="text-3xl md:text-5xl font-black text-white leading-tight mb-4 drop-shadow-lg">
                                {readingArticle.title}
                            </h2>
                            <div className="flex items-center gap-4 text-xs text-white/60 font-medium">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-bold text-white">
                                        {readingArticle.authorName.charAt(0)}
                                    </div>
                                    <span>{readingArticle.authorName}</span>
                                </div>
                                <span aria-hidden="true">•</span>
                                <span className="flex items-center gap-1"><Clock size={12}/> {calculateReadingTime(readingArticle.content)} min read</span>
                                <span aria-hidden="true">•</span>
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