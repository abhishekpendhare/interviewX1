/**
 * STRATA / InterviewX Content Ingestion & Import Pipeline
 * Loads Markdown articles with YAML front matter from content/articles/
 */

const fs = require('fs');
const path = require('path');
const {
    parseFrontMatter,
    renderMarkdownToHtml,
    calculateReadTime,
    extractHeadings,
    extractCodeBlocks
} = require('./markdownParser');

const ARTICLES_DIR = path.resolve(__dirname, '../../content/articles');

const VALID_CATEGORIES = [
    'Prep Guides',
    'Interview Guides',
    'Career',
    'Tech Explainers',
    'Placement and Hiring Updates',
    'Platform Updates'
];

class ContentImporter {
    static getArticlesDir() {
        return ARTICLES_DIR;
    }

    static loadAllArticles() {
        if (!fs.existsSync(ARTICLES_DIR)) {
            fs.mkdirSync(ARTICLES_DIR, { recursive: true });
            return [];
        }

        const files = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.md'));
        const articles = [];

        for (const file of files) {
            const filePath = path.join(ARTICLES_DIR, file);
            const rawContent = fs.readFileSync(filePath, 'utf-8');
            const { frontMatter, body } = parseFrontMatter(rawContent);

            if (!frontMatter.slug) {
                frontMatter.slug = file.replace(/\.md$/, '');
            }

            const headings = extractHeadings(body);
            const codeBlocks = extractCodeBlocks(body);
            const readTime = frontMatter.readTime || calculateReadTime(body);
            const wordCount = body.trim().split(/\s+/).filter(Boolean).length;
            const html = renderMarkdownToHtml(body);

            // Freshness check relative to 31 October 2026
            const baselineDate = new Date('2026-10-31T00:00:00Z');
            const reviewedDate = frontMatter.reviewedAt ? new Date(frontMatter.reviewedAt) : new Date(frontMatter.publishedAt || '2026-01-01');
            const sixMonthsMs = 180 * 24 * 60 * 60 * 1000;
            const needsReview = (baselineDate - reviewedDate) > sixMonthsMs;

            const article = {
                id: frontMatter.id || `art-${frontMatter.slug}`,
                slug: frontMatter.slug,
                title: frontMatter.title || 'Untitled Article',
                summary: frontMatter.summary || '',
                excerpt: frontMatter.summary || '',
                category: frontMatter.category || 'Prep Guides',
                tags: Array.isArray(frontMatter.tags) ? frontMatter.tags : [],
                author: frontMatter.author || 'InterviewX Editorial Team',
                coverImage: frontMatter.coverImage || '/assets/articles/covers/default.svg',
                coverAlt: frontMatter.coverAlt || frontMatter.title,
                image: frontMatter.coverImage || '/assets/articles/covers/default.svg',
                date: frontMatter.publishedAt || '2026-10-31',
                publishedAt: frontMatter.publishedAt || '2026-10-31',
                updatedAt: frontMatter.updatedAt || frontMatter.publishedAt || '2026-10-31',
                reviewedAt: frontMatter.reviewedAt || '2026-10-31',
                status: frontMatter.status || 'published',
                sources: Array.isArray(frontMatter.sources) ? frontMatter.sources : [],
                relatedModules: Array.isArray(frontMatter.relatedModules) ? frontMatter.relatedModules : [],
                readTime,
                wordCount,
                headings,
                codeBlocks,
                needsReview,
                content: body,
                html
            };

            articles.push(article);
        }

        // Sort descending by publishedAt / updatedAt
        articles.sort((a, b) => new Date(b.publishedAt || b.date) - new Date(a.publishedAt || a.date));

        return articles;
    }
}

module.exports = {
    ContentImporter,
    VALID_CATEGORIES,
    ARTICLES_DIR
};
