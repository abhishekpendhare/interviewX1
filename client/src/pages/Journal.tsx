import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Clock, Search, Sparkles, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Article } from '@/lib/types';

export default function Journal() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const { data: articles = [], isLoading, isError, refetch } = useQuery<Article[]>({
    queryKey: ['articles'],
    queryFn: () => api.getArticles(),
  });

  const categories = useMemo(
    () => ['ALL', ...Array.from(new Set(articles.map(article => article.category))).sort((a, b) => a.localeCompare(b))],
    [articles],
  );

  const filtered = articles.filter(article => {
    const matchesCategory = selectedCategory === 'ALL' || article.category === selectedCategory;
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || [article.title, article.excerpt, ...article.tags]
      .some(value => value.toLowerCase().includes(query));
    return matchesCategory && matchesSearch;
  });

  const showFeatured = filtered.length > 0 && !search.trim() && selectedCategory === 'ALL';
  const featured = showFeatured ? filtered[0] : null;
  const gridArticles = featured ? filtered.slice(1) : filtered;

  return (
    <section className="relative flex-1 overflow-hidden bg-[#0B1020] px-4 pb-32 pt-6 text-slate-100 sm:px-6 sm:pt-8 lg:px-8" aria-labelledby="journal-title">
      <div aria-hidden="true" className="pointer-events-none absolute -left-48 -top-40 h-[30rem] w-[30rem] rounded-full bg-violet-600/10 blur-[110px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-48 top-32 h-[28rem] w-[28rem] rounded-full bg-cyan-500/[0.07] blur-[120px]" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-7">
        <header className="border-b border-white/10 pb-6">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-400/[0.08] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-200">
            <Sparkles aria-hidden="true" className="h-3.5 w-3.5 text-cyan-300" />
            InterviewX Articles
          </div>
          <h1 id="journal-title" className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Engineering Articles & Dispatches
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
            Practical guides on algorithms, system design, technical interviews, and building your engineering career.
          </p>

          <div className="mt-6 flex flex-col gap-4">
            <div className="relative w-full max-w-2xl">
              <label htmlFor="journal-search" className="sr-only">Search articles</label>
              <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                id="journal-search"
                type="search"
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="Search articles, topics, or tags"
                className="min-h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-11 pr-11 text-sm text-white placeholder:text-slate-500 focus:border-cyan-300/50 focus:outline-none focus:ring-2 focus:ring-cyan-300/15"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                >
                  <X aria-hidden="true" className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label="Filter articles by category">
              {categories.map(category => {
                const selected = selectedCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    aria-pressed={selected}
                    className={`min-h-10 shrink-0 rounded-full border px-3.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${
                      selected
                        ? 'border-violet-300/30 bg-violet-400/[0.12] text-violet-100'
                        : 'border-white/10 bg-white/[0.03] text-slate-400 hover:border-violet-300/25 hover:bg-white/[0.05] hover:text-white'
                    }`}
                  >
                    {category === 'ALL' ? 'All articles' : category}
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        {featured && (
          <article className="group grid overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#151C35] via-[#10172D] to-[#101D30] shadow-[0_20px_70px_rgba(0,0,0,0.2)] lg:grid-cols-[1.05fr_0.95fr]">
            <Link to={`/articles/${featured.slug}`} className="relative block aspect-[16/10] overflow-hidden bg-[#0B1020] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-300 lg:aspect-auto lg:min-h-[22rem]">
              <img src={featured.image} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
              <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-[#0B1020]/80 px-3 py-1.5 text-[11px] font-semibold text-cyan-100 backdrop-blur">
                Featured article
              </span>
            </Link>

            <div className="flex flex-col justify-between gap-6 p-5 sm:p-7 lg:p-8">
              <div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                  <span className="font-medium text-cyan-200">{featured.category}</span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <time>{featured.date}</time>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span className="inline-flex items-center gap-1"><Clock aria-hidden="true" className="h-3.5 w-3.5" />{featured.readTime}</span>
                </div>
                <h2 className="mt-4 text-2xl font-semibold leading-tight tracking-tight text-white transition-colors group-hover:text-cyan-100 sm:text-3xl">
                  <Link to={`/articles/${featured.slug}`} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">{featured.title}</Link>
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-400">{featured.excerpt}</p>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
                <span className="text-xs text-slate-500">By {featured.author}</span>
                <Link to={`/articles/${featured.slug}`} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-4 text-sm font-semibold text-[#080e1d] transition-[filter,transform] hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                  Read article <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </article>
        )}

        <section aria-labelledby="article-list-title">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-2 border-b border-white/10 pb-4">
            <div>
              <h2 id="article-list-title" className="text-lg font-semibold text-white">{search || selectedCategory !== 'ALL' ? 'Search results' : 'Latest articles'}</h2>
              <p className="mt-1 text-sm text-slate-500" aria-live="polite">{filtered.length} {filtered.length === 1 ? 'article' : 'articles'}</p>
            </div>
          </div>

          {isLoading ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-label="Loading articles" aria-busy="true">
              {[1, 2, 3, 4, 5, 6].map(item => <div key={item} className="h-80 animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]" />)}
            </div>
          ) : isError ? (
            <div role="alert" className="rounded-2xl border border-rose-300/20 bg-rose-300/[0.06] p-6 text-sm text-rose-100">
              <p className="font-medium">We couldn’t load the Journal right now.</p>
              <button type="button" onClick={() => refetch()} className="mt-3 rounded-lg border border-rose-200/20 px-3 py-2 text-rose-100 hover:bg-rose-200/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">Try again</button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-[#10172D]/70 px-5 py-12 text-center">
              <BookOpen aria-hidden="true" className="mx-auto h-9 w-9 text-slate-500" />
              <h3 className="mt-4 font-semibold text-white">No articles found</h3>
              <p className="mt-1 text-sm text-slate-400">Try a different search or choose another category.</p>
              {(search || selectedCategory !== 'ALL') && <button type="button" onClick={() => { setSearch(''); setSelectedCategory('ALL'); }} className="mt-4 text-sm font-medium text-cyan-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">Clear filters</button>}
            </div>
          ) : gridArticles.length === 0 ? (
            <p className="rounded-2xl border border-white/10 bg-[#10172D]/70 p-5 text-sm text-slate-400">That’s the featured article. Choose a category or search to find more.</p>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {gridArticles.map((article, index) => (
                <motion.article
                  key={article.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: Math.min(index * 0.035, 0.14) }}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#10172D]/70 transition-colors hover:border-violet-300/25 hover:bg-[#10172D]"
                >
                  <Link to={`/articles/${article.slug}`} aria-label={`Read ${article.title}`} className="relative block aspect-[16/9] overflow-hidden bg-[#0B1020] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-300">
                    <img src={article.image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                    <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-[#0B1020]/80 px-2.5 py-1 text-[11px] font-medium text-cyan-100 backdrop-blur">{article.category}</span>
                  </Link>

                  <div className="flex flex-1 flex-col justify-between gap-5 p-5">
                    <div>
                      <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
                        <time>{article.date}</time>
                        <span className="inline-flex shrink-0 items-center gap-1"><Clock aria-hidden="true" className="h-3.5 w-3.5" />{article.readTime}</span>
                      </div>
                      <h3 className="mt-3 line-clamp-2 text-lg font-semibold leading-snug text-white transition-colors group-hover:text-cyan-100">
                        <Link to={`/articles/${article.slug}`} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">{article.title}</Link>
                      </h3>
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-400">{article.excerpt}</p>
                    </div>

                    <div className="flex items-end justify-between gap-3 border-t border-white/10 pt-4">
                      <div className="flex flex-wrap gap-1.5">
                        {article.tags.slice(0, 2).map(tag => <span key={tag} className="rounded-full bg-white/[0.05] px-2.5 py-1 text-[11px] text-slate-400">#{tag}</span>)}
                      </div>
                      <Link to={`/articles/${article.slug}`} className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-slate-300 transition-colors hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">
                        Read <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
