import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Article } from '../types';
import { PageHeader, LayoutContainer, Card, Badge, Button } from '../components/UI';
import { BookOpen, Lightbulb, Heart, Stethoscope, X, ArrowRight } from 'lucide-react';

export const ArticlesView = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<'all' | 'tip' | 'medical' | 'motivation'>('all');
    const [readingArticle, setReadingArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                // جلب المقالات المنشورة فقط
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
        fetchArticles();
    }, []);

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

    return (
        <LayoutContainer>
            <PageHeader 
                title="مركز المعرفة" 
                subtitle="مقالات طبية ونصائح يومية لمساعدتك في رحلة التعافي." 
            />

            {/* Category Filters */}
            <div className="flex gap-3 overflow-x-auto pb-4 mb-2 scrollbar-hide">
                {[
                    { id: 'all', label: 'الكل', icon: BookOpen },
                    { id: 'medical', label: 'طبي وعلمي', icon: Stethoscope },
                    { id: 'motivation', label: 'دعم نفسي', icon: Heart },
                    { id: 'tip', label: 'نصائح عملية', icon: Lightbulb },
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
                <div className="text-center py-20 text-slate-500 animate-pulse">جاري تحميل المحتوى...</div>
            ) : filteredArticles.length === 0 ? (
                <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-dashed border-slate-800">
                    <BookOpen size={48} className="mx-auto text-slate-700 mb-4"/>
                    <p className="text-slate-500">لا توجد مقالات في هذا القسم حالياً.</p>
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
                                <span className="text-[10px] text-slate-600 font-mono">
                                    {new Date(article.createdAt).toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-1 text-xs font-bold text-indigo-400 group-hover:translate-x-1 transition-transform">
                                    قراءة <ArrowRight size={14} />
                                </span>
                            </div>
                        </div>
                    ))}
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
                                <span>بقلم: {readingArticle.authorName}</span>
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
                            <p className="text-xs text-slate-600">مركز المعرفة - Islam's Guide</p>
                            <Button variant="secondary" onClick={() => setReadingArticle(null)} className="!py-2 !px-4 !text-xs">
                                إغلاق
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </LayoutContainer>
    );
};