import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Clock, Tag, Share2, Sparkles, BookOpen, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import type { Article } from '@/lib/types';

export default function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>();

  const { data: article, isLoading, error } = useQuery<Article>({
    queryKey: ['article', slug],
    queryFn: () => api.getArticle(slug || ''),
    enabled: !!slug
  });

  const { data: allArticles } = useQuery<Article[]>({
    queryKey: ['articles'],
    queryFn: () => api.getArticles()
  });

  const relatedArticles = allArticles?.filter(a => a.slug !== slug).slice(0, 3) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0E1418] text-white flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-10 h-10 border-2 border-white/20 border-t-[#00E5FF] rounded-full animate-spin mx-auto" />
          <p className="font-mono text-xs uppercase tracking-widest text-white/50">LOADING ARTICLE TELEMETRY...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-[#0E1418] text-white flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-6">
          <h1 className="text-3xl font-extrabold uppercase font-heading">ARTICLE NOT FOUND</h1>
          <p className="text-white/60 text-sm">The requested article could not be located in the telemetry index.</p>
          <Link
            to="/articles"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-bold text-xs uppercase tracking-wider font-mono"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>RETURN TO ARTICLES</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0E1418] text-white">
      {/* Header Banner */}
      <div className="relative pt-12 pb-16 border-b border-white/10 overflow-hidden bg-black/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <Link
            to="/articles"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO ARTICLES ARCHIVE</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="tag-caps bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30 px-3 py-1 font-mono text-xs tracking-widest font-bold">
              {article.category}
            </span>
            <span className="text-white/30">/</span>
            <span className="text-xs font-mono text-white/50 tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {article.readTime}
            </span>
          </div>

          <h1 className="headline-section text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-white leading-tight">
            {article.title}
          </h1>

          <div className="flex items-center justify-between text-xs font-mono text-white/50 pt-4 border-t border-white/10">
            <div>
              <span>AUTHORED BY </span>
              <strong className="text-white font-semibold">{article.author}</strong>
            </div>
            <span>{article.date}</span>
          </div>
        </div>
      </div>

      {/* Featured Cover Image */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8">
        <div className="aspect-[21/9] overflow-hidden border border-white/20 bg-black">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Article Content Body */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="prose prose-invert prose-lg max-w-none space-y-6 text-white/80 leading-relaxed font-sans">
          {article.content.split('\n\n').map((paragraph, i) => {
            if (paragraph.startsWith('### ')) {
              return (
                <h3 key={i} className="text-xl sm:text-2xl font-bold font-heading text-white uppercase tracking-wide pt-6 pb-2 border-b border-white/10">
                  {paragraph.replace('### ', '')}
                </h3>
              );
            }
            if (paragraph.startsWith('```')) {
              const lines = paragraph.split('\n');
              const code = lines.slice(1, -1).join('\n');
              return (
                <pre key={i} className="bg-black/80 border border-white/20 p-5 font-mono text-sm text-[#00E5FF] overflow-x-auto my-6">
                  <code>{code}</code>
                </pre>
              );
            }
            if (paragraph.startsWith('|')) {
              return (
                <div key={i} className="overflow-x-auto my-6">
                  <div className="inline-block min-w-full text-xs font-mono border border-white/20 bg-white/[0.02] p-4">
                    {paragraph}
                  </div>
                </div>
              );
            }
            return <p key={i} className="text-base sm:text-lg">{paragraph}</p>;
          })}
        </div>

        {/* Tags */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-white/40 uppercase tracking-wider mr-2">TAGS:</span>
          {article.tags.map(tag => (
            <span key={tag} className="text-xs font-mono bg-white/5 border border-white/10 px-3 py-1 text-white/70">
              #{tag}
            </span>
          ))}
        </div>

        {/* CTA Banner inside Article */}
        <div className="mt-16 p-8 bg-gradient-to-r from-white/[0.05] to-white/[0.02] border border-white/20 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-heading font-bold text-lg text-white uppercase">TEST YOUR SKILLS UNDER PRESSURE</h4>
            <p className="text-sm text-white/60">Launch our interactive coding arena with 3,555+ company-tagged problems.</p>
          </div>
          <Link
            to="/compiler"
            className="btn-racing-primary shrink-0 px-6 py-3 bg-[#E02B20] text-white font-bold text-xs uppercase tracking-wider font-mono hover:bg-[#c9241a] transition-colors"
          >
            ENTER ARENA
          </Link>
        </div>

        {/* Related Articles Rail */}
        {relatedArticles.length > 0 && (
          <div className="mt-20 pt-12 border-t border-white/10 space-y-8">
            <h3 className="font-heading font-bold text-xl uppercase tracking-wider text-white">
              RELATED FIELD REPORTS
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map(rel => (
                <Link
                  key={rel.id}
                  to={`/articles/${rel.slug}`}
                  className="group block bg-white/[0.02] border border-white/10 hover:border-white/30 p-4 transition-all"
                >
                  <div className="aspect-[16/10] overflow-hidden mb-3 bg-black">
                    <img src={rel.image} alt={rel.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <span className="text-[10px] font-mono text-[#00E5FF] uppercase tracking-widest">{rel.category}</span>
                  <h5 className="font-heading font-bold text-sm text-white group-hover:text-[#00E5FF] transition-colors line-clamp-2 mt-1">
                    {rel.title}
                  </h5>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
