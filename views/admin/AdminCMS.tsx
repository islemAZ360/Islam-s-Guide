import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, FileText, Image, X, Clock, AlertCircle } from 'lucide-react';
import { Article, ArticleCategory } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useLanguage } from '../../contexts/LanguageContext';

interface AdminCMSProps {
    articles: Article[];
    publishArticle: (article: any) => void;
    deleteArticle: (id: string) => void;
}

export const AdminCMS = ({ articles, publishArticle, deleteArticle }: AdminCMSProps) => {
    const { t, language } = useLanguage();
    const [showArticleModal, setShowArticleModal] = useState(false);
    const [newArticle, setNewArticle] = useState({ title: '', content: '', category: 'tip' as ArticleCategory });
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Focus management refs
    const modalRef = useRef<HTMLDivElement>(null);
    const titleInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (showArticleModal) {
            setTimeout(() => titleInputRef.current?.focus(), 100);
        }
        setErrorMsg(null);
    }, [showArticleModal]);

    const handlePublish = () => {
        if (!newArticle.title.trim() || newArticle.title.length < 5) {
            setErrorMsg(language === 'ar' ? "العنوان قصير جداً (5 أحرف على الأقل)." : "Title too short (min 5 chars).");
            return;
        }
        if (!newArticle.content.trim() || newArticle.content.length < 20) {
            setErrorMsg(language === 'ar' ? "المحتوى قصير جداً." : "Content too short.");
            return;
        }

        publishArticle(newArticle);
        setShowArticleModal(false);
        setNewArticle({ title: '', content: '', category: 'tip' });
    };

    const getCategoryColor = (cat: string) => {
        switch(cat) {
            case 'medical': return 'indigo';
            case 'motivation': return 'rose';
            case 'news': return 'blue';
            case 'announcement': return 'red';
            case 'tip': return 'amber';
            default: return 'slate';
        }
    };

    const categories: ArticleCategory[] = ['medical', 'motivation', 'tip', 'news', 'announcement'];

    return (
        <section aria-labelledby="cms-heading" className="animate-in fade-in space-y-8">
            {/* Header Action */}
            <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                <h2 id="cms-heading" className="text-xl font-bold text-white flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
                        <FileText size={20} className="text-indigo-400" aria-hidden="true"/>
                    </div>
                    {t('tab_cms')}
                </h2>
                <Button onClick={() => setShowArticleModal(true)} variant="primary" className="!py-2.5 !px-5 !text-sm !rounded-xl shadow-lg shadow-indigo-500/20" aria-label={t('new_article_btn')}>
                    <Plus size={18} className="mr-2" aria-hidden="true"/> {t('new_article_btn')}
                </Button>
            </div>

            {/* Create Article Modal */}
            {showArticleModal && (
                 <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4 animate-in zoom-in"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-title"
                 >
                     {/* Wrapper div for ref to avoid functional component issue */}
                     <div className="w-full max-w-2xl relative outline-none" tabIndex={-1} ref={modalRef}>
                         <Card className="!bg-slate-900 border-white/10 shadow-2xl rounded-[2rem] overflow-hidden">
                             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                             
                             <div className="p-8">
                                 <div className="flex justify-between items-start mb-8">
                                    <h3 id="modal-title" className="text-2xl font-black text-white">{t('new_article_btn')}</h3>
                                    <button 
                                        onClick={() => setShowArticleModal(false)} 
                                        className="p-2 rounded-full hover:bg-white/10 transition-colors text-slate-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        aria-label={t('close')}
                                    >
                                        <X size={24} />
                                    </button>
                                 </div>

                                 {errorMsg && (
                                     <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-300 text-sm font-bold" role="alert">
                                         <AlertCircle size={20} />
                                         {errorMsg}
                                     </div>
                                 )}

                                 <div className="space-y-6">
                                     <div className="group">
                                         <label htmlFor="art-title" className="text-xs font-bold text-slate-500 uppercase mb-2 block ml-1 group-focus-within:text-indigo-400 transition-colors">{t('article_title_label')}</label>
                                         <div className="relative">
                                             <FileText className="absolute top-4 right-4 text-slate-600 group-focus-within:text-indigo-500 transition-colors pointer-events-none" size={18} />
                                             <input 
                                                 id="art-title"
                                                 ref={titleInputRef}
                                                 className="w-full bg-slate-950/50 p-4 pr-12 rounded-xl text-white border border-white/10 outline-none focus:border-indigo-500 transition-all placeholder-slate-700 font-bold text-lg focus:ring-1 focus:ring-indigo-500" 
                                                 placeholder={t('article_title_placeholder')}
                                                 value={newArticle.title} 
                                                 onChange={e => setNewArticle({...newArticle, title: e.target.value})} 
                                                 maxLength={100}
                                             />
                                         </div>
                                     </div>
                                     
                                     <div role="group" aria-labelledby="cat-label">
                                         <label id="cat-label" className="text-xs font-bold text-slate-500 uppercase mb-3 block ml-1">{t('article_cat_label')}</label>
                                         <div className="flex gap-3 flex-wrap">
                                             {categories.map(cat => (
                                                 <button 
                                                    key={cat}
                                                    onClick={() => setNewArticle({...newArticle, category: cat})}
                                                    aria-pressed={newArticle.category === cat}
                                                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                                        newArticle.category === cat 
                                                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/30 scale-105' 
                                                        : 'bg-slate-950 border-white/10 text-slate-500 hover:bg-slate-800 hover:text-white'
                                                    }`}
                                                 >
                                                     {/* Using translation keys if available or fallback to uppercase */}
                                                     {t(`cat_${cat}` as any) || cat.toUpperCase()}
                                                 </button>
                                             ))}
                                         </div>
                                     </div>

                                     <div className="group">
                                         <label htmlFor="art-content" className="text-xs font-bold text-slate-500 uppercase mb-2 block ml-1 group-focus-within:text-indigo-400 transition-colors">{t('article_content_label')}</label>
                                         <textarea 
                                             id="art-content"
                                             className="w-full bg-slate-950/50 p-4 rounded-xl text-white border border-white/10 h-40 outline-none focus:border-indigo-500 transition-all resize-none placeholder-slate-700 custom-scrollbar focus:ring-1 focus:ring-indigo-500" 
                                             placeholder={t('article_content_placeholder')}
                                             value={newArticle.content} 
                                             onChange={e => setNewArticle({...newArticle, content: e.target.value})} 
                                             maxLength={5000}
                                         />
                                         <p className="text-right text-[10px] text-slate-600 mt-1">{newArticle.content.length}/5000</p>
                                     </div>
                                     
                                     <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                                         <Button variant="secondary" onClick={() => setShowArticleModal(false)}>{t('cancel_btn')}</Button>
                                         <Button variant="success" onClick={handlePublish}>
                                             {t('publish_now')}
                                         </Button>
                                     </div>
                                 </div>
                             </div>
                         </Card>
                     </div>
                 </div>
            )}

            {/* Articles Grid */}
            {articles.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl text-slate-600">
                    <Image size={48} className="mx-auto mb-4 opacity-20" aria-hidden="true"/>
                    <p>{t('no_articles')}</p>
                </div>
            ) : (
                <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
                    {articles.map(art => (
                        <li key={art.id} className="group relative bg-slate-900/60 backdrop-blur-md border border-white/5 p-6 rounded-[2rem] hover:border-indigo-500/30 transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-indigo-500/10 flex flex-col h-full focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-slate-950">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem] pointer-events-none"></div>
                            
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <Badge color={getCategoryColor(art.category) as any} className="shadow-none bg-slate-950/50 border-white/10">
                                    {t(`cat_${art.category}` as any) || art.category.toUpperCase()}
                                </Badge>
                                <button 
                                    onClick={() => art.id && deleteArticle(art.id)}
                                    className="text-slate-600 hover:text-rose-500 p-2 hover:bg-rose-500/10 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 outline-none focus:ring-2 focus:ring-rose-500"
                                    title="Delete Article"
                                    aria-label={`Delete article: ${art.title}`}
                                >
                                    <Trash2 size={16} aria-hidden="true"/>
                                </button>
                            </div>

                            <h3 className="font-bold text-white text-lg mb-3 line-clamp-2 leading-snug group-hover:text-indigo-300 transition-colors">
                                {art.title}
                            </h3>
                            
                            <div className="flex-1 mb-4">
                                <p className="text-xs text-slate-400 line-clamp-4 leading-relaxed bg-slate-950/30 p-3 rounded-xl border border-white/5">
                                    {art.content}
                                </p>
                            </div>
                            
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-auto pt-4 border-t border-white/5">
                                <Clock size={12} aria-hidden="true"/>
                                {new Date(art.createdAt).toLocaleDateString()}
                                <span className="mx-1" aria-hidden="true">•</span>
                                <span className="text-slate-400 font-bold">{art.authorName}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
};