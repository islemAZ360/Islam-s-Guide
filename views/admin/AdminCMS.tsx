import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
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

    return (
        <div className="animate-in fade-in space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">{t('tab_cms')}</h2>
                <Button onClick={() => setShowArticleModal(true)} variant="primary" className="!py-2 !px-4 !text-sm">
                    <Plus size={16}/> {t('new_article_btn')}
                </Button>
            </div>

            {showArticleModal && (
                 <Card className="bg-slate-900 border-indigo-500/30 mb-6">
                     <div className="space-y-4">
                         <input 
                             className="w-full bg-slate-950 p-3 rounded-lg text-white border border-white/10 outline-none focus:border-indigo-500" 
                             placeholder={t('article_title_label')}
                             value={newArticle.title} 
                             onChange={e => setNewArticle({...newArticle, title: e.target.value})} 
                         />
                         
                         <div>
                             <label className="text-xs text-slate-500 mb-2 block font-bold uppercase">{t('article_cat_label')}</label>
                             <div className="flex gap-2">
                                 {(['medical', 'motivation', 'tip', 'news'] as const).map(cat => (
                                     <button 
                                        key={cat}
                                        onClick={() => setNewArticle({...newArticle, category: cat})}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${newArticle.category === cat ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
                                     >
                                         {cat.toUpperCase()}
                                     </button>
                                 ))}
                             </div>
                         </div>

                         <textarea 
                             className="w-full bg-slate-950 p-3 rounded-lg text-white border border-white/10 h-32 outline-none focus:border-indigo-500" 
                             placeholder={t('article_content_label')}
                             value={newArticle.content} 
                             onChange={e => setNewArticle({...newArticle, content: e.target.value})} 
                         />
                         
                         <div className="flex justify-end gap-2">
                             <Button variant="secondary" onClick={() => setShowArticleModal(false)}>{t('cancel_btn')}</Button>
                             <Button variant="success" onClick={handlePublish}>{t('publish_now')}</Button>
                         </div>
                     </div>
                 </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {articles.map(art => (
                    <div key={art.id} className="bg-slate-900 p-5 rounded-xl border border-white/5 hover:border-indigo-500/30 transition-all group relative">
                        <button 
                            onClick={() => art.id && deleteArticle(art.id)}
                            className="absolute top-4 left-4 text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 size={16}/>
                        </button>

                        <Badge color="blue" className="mb-3">{art.category}</Badge>
                        <h3 className="font-bold text-white mb-2 line-clamp-1">{art.title}</h3>
                        <p className="text-xs text-slate-500 line-clamp-3 mb-4">{art.content}</p>
                        <div className="text-[10px] text-slate-600 font-mono">
                            {new Date(art.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};