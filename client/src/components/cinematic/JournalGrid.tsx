import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Clock, Tag, Sparkles } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Article } from '@/lib/types';
import { ScrollRevealLeft } from '@/components/ui/ScrollRevealLeft';

export const JournalGrid: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const { data: articles, isLoading } = useQuery<Article[]>({
    queryKey: ['articles'],
    queryFn: () => api.getArticles()
  });

  const categories = [
    'ALL',
    'SYSTEMS & RUNTIMES',
    'ALGORITHMS & DSA',
    'LEADERSHIP & BEHAVIORAL',
    'SYSTEM ARCHITECTURE',
    'ROADMAPS'
  ];

  const filteredArticles = articles?.filter(article => {
    if (selectedCategory === 'ALL') return true;
    return article.category.toUpperCase() === selectedCategory;
  }) || [];

  return (
    <section id="section-journal" className="py-20 lg:py-28 bg-[#0E1418] text-white border-b border-white/10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <ScrollRevealLeft className="space-y-3">
            <div className="inline-flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E02B20]" />
              <span className="font-mono text-xs uppercase tracking-widest text-[#E02B20] font-bold">
                TELEMETRY & FIELD REPORTS
              </span>
            </div>
            <h2 className="headline-section text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-white">
              LATEST FROM <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/60">
                TECHNICAL ARTICLES.
              </span>
            </h2>
          </ScrollRevealLeft>

          {/* Category Filter Pills */}
          <ScrollRevealLeft delay={0.1} className="flex flex-wrap items-center gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-all duration-200 border ${
                  selectedCategory === cat
                    ? 'bg-white text-black border-white font-bold shadow-sm'
                    : 'bg-white/5 text-white/70 border-white/10 hover:border-white/30 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </ScrollRevealLeft>
        </div>

        {/* Articles Grid (Porsche Motorsport News Layout) */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} className="h-96 bg-white/5 animate-pulse rounded-none border border-white/10" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.slice(0, 9).map((article, idx) => (
              <ScrollRevealLeft
                key={article.id}
                staggerIndex={idx}
                className="group flex flex-col bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 hover:border-white/30 transition-all duration-300"
              >

                {/* Image Container with Hover Zoom */}
                <Link to={`/articles/${article.slug}`} className="relative aspect-[16/10] overflow-hidden block bg-black">
                  <img
                    src={article.image}
                    alt={article.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="tag-caps bg-black/80 backdrop-blur-md px-2.5 py-1 text-[11px] font-mono text-[#00E5FF] border border-white/10 tracking-widest font-bold">
                      {article.category}
                    </span>
                  </div>
                </Link>

                {/* Content Box */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono text-white/40 tracking-wider">
                      <span>{article.date}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {article.readTime}
                      </span>
                    </div>

                    <h3 className="font-heading font-bold text-lg sm:text-xl text-white group-hover:text-[#00E5FF] transition-colors line-clamp-2 leading-snug">
                      <Link to={`/articles/${article.slug}`}>
                        {article.title}
                      </Link>
                    </h3>

                    <p className="text-sm text-white/65 line-clamp-2 leading-relaxed">
                      {article.excerpt}
                    </p>
                  </div>

                  {/* Tags and Link */}
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <div className="flex flex-wrap gap-1.5">
                      {article.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-[10px] font-mono text-white/50 bg-white/5 px-2 py-0.5">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <Link
                      to={`/articles/${article.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-mono uppercase font-bold text-white group-hover:text-[#00E5FF] tracking-wider transition-colors"
                    >
                      <span>READ</span>
                      <ArrowRight className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </ScrollRevealLeft>
            ))}
          </div>

        )}

        {/* View All Articles Link */}
        <div className="mt-12 text-center">
          <Link
            to="/articles"
            className="inline-flex items-center gap-3 px-8 py-4 border border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 text-white font-mono font-bold tracking-wider text-xs uppercase transition-all duration-200"
          >
            <span>VIEW COMPLETE ARTICLES ARCHIVE</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
};
