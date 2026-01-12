import React, { useState } from 'react';
// تمت إضافة Clock إلى الاستيراد هنا 👇
import { Plus, Trash2, FileText, Image, Tag, AlignLeft, X, Clock } from 'lucide-react';
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
    const { t } = useLanguage();
    const [showArticleModal, setShowArticleModal] = useState(false);
    const [newArticle, setNewArticle] = useState({ title: '', content: '', category: 'tip' as ArticleCategory });

    const handlePublish = () => {
        publishArticle(newArticle);
        setShowArticleModal(false);
        setNewArticle({ title: '', content: '', category: 'tip' });
    };

    const getCategoryColor = (cat: string) => {
        switch(cat) {
            case 'medical': return 'indigo';
            case 'motivation': return 'rose';
            case 'news': return 'blue';
            default: return 'amber';
        }
    };

    return (
        <div className="animate-in fade-in space-y-8">
            {/* Header Action */}
            <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
                        <FileText size={20} className="text-indigo-400"/>
                    </div>
                    {t('tab_cms')}
                </h2>
                <Button onClick={() => setShowArticleModal(true)} variant="primary" className="!py-2.5 !px-5 !text-sm !rounded-xl shadow-lg shadow-indigo-500/20">
                    <Plus size={18} className="mr-2"/> {t('new_article_btn')}
                </Button>
            </div>

            {/* Create Article Modal (Inline for quick access or Overlay) */}
            {showArticleModal && (
                 <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4 animate-in zoom-in">
                     <Card className="w-full max-w-2xl bg-slate-900 border-white/10 shadow-2xl relative rounded-[2rem] overflow-hidden">
                         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                         
                         <div className="p-8">
                             <div className="flex justify-between items-start mb-8">
                                <h3 className="text-2xl font-black text-white">{t('new_article_btn')}</h3>
                                <button onClick={() => setShowArticleModal(false)} className="p-2 rounded-full hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
                                    <X size={24} />
                                </button>
                             </div>

                             <div className="space-y-6">
                                 <div className="group">
                                     <label className="text-xs font-bold text-slate-500 uppercase mb-2 block ml-1 group-focus-within:text-indigo-400 transition-colors">{t('article_title_label')}</label>
                                     <div className="relative">
                                         <FileText className="absolute top-4 right-4 text-slate-600 group-focus-within:text-indigo-500 transition-colors" size={18}/>
                                         <input 
                                             className="w-full bg-slate-950/50 p-4 pr-12 rounded-xl text-white border border-white/10 outline-none focus:border-indigo-500 transition-all placeholder-slate-700 font-bold text-lg" 
                                             placeholder="Article Title..."
                                             value={newArticle.title} 
                                             onChange={e => setNewArticle({...newArticle, title: e.target.value})} 
                                             autoFocus
                                         />
                                     </div>
                                 </div>
                                 
                                 <div>
                                     <label className="text-xs font-bold text-slate-500 uppercase mb-3 block ml-1">{t('article_cat_label')}</label>
                                     <div className="flex gap-3 flex-wrap">
                                         {(['medical', 'motivation', 'tip', 'news'] as const).map(cat => (
                                             <button 
                                                key={cat}
                                                onClick={() => setNewArticle({...newArticle, category: cat})}
                                                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-300 ${
                                                    newArticle.category === cat 
                                                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/30 scale-105' 
                                                    : 'bg-slate-950 border-white/10 text-slate-500 hover:bg-slate-800 hover:text-white'
                                                }`}
                                             >
                                                 {cat.toUpperCase()}
                                             </button>
                                         ))}
                                     </div>
                                 </div>

                                 <div className="group">
                                     <label className="text-xs font-bold text-slate-500 uppercase mb-2 block ml-1 group-focus-within:text-indigo-400 transition-colors">{t('article_content_label')}</label>
                                     <textarea 
                                         className="w-full bg-slate-950/50 p-4 rounded-xl text-white border border-white/10 h-40 outline-none focus:border-indigo-500 transition-all resize-none placeholder-slate-700 custom-scrollbar" 
                                         placeholder="Write something amazing..."
                                         value={newArticle.content} 
                                         onChange={e => setNewArticle({...newArticle, content: e.target.value})} 
                                     />
                                 </div>
                                 
                                 <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                                     <Button variant="secondary" onClick={() => setShowArticleModal(false)}>{t('cancel_btn')}</Button>
                                     <Button variant="success" onClick={handlePublish} disabled={!newArticle.title || !newArticle.content}>
                                         {t('publish_now')}
                                     </Button>
                                 </div>
                             </div>
                         </div>
                     </Card>
                 </div>
            )}

            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.length === 0 && (
                    <div className="col-span-full text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl text-slate-600">
                        <Image size={48} className="mx-auto mb-4 opacity-20"/>
                        <p>No articles published yet.</p>
                    </div>
                )}
                
                {articles.map(art => (
                    <div key={art.id} className="group relative bg-slate-900/60 backdrop-blur-md border border-white/5 p-6 rounded-[2rem] hover:border-indigo-500/30 transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-indigo-500/10 flex flex-col h-full">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem] pointer-events-none"></div>
                        
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <Badge color={getCategoryColor(art.category) as any} className="shadow-none bg-slate-950/50 border-white/10">
                                {art.category.toUpperCase()}
                            </Badge>
                            <button 
                                onClick={() => art.id && deleteArticle(art.id)}
                                className="text-slate-600 hover:text-rose-500 p-2 hover:bg-rose-500/10 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                title="Delete Article"
                            >
                                <Trash2 size={16}/>
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
                            <Clock size={12}/>
                            {new Date(art.createdAt).toLocaleDateString()}
                            <span className="mx-1">•</span>
                            <span className="text-slate-400 font-bold">{art.authorName}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};