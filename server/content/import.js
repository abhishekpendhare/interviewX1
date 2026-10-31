/**
 * CLI Tool: Import Articles into Store Database
 * Command: npm run content:import
 */

const { ContentImporter } = require('./contentImporter');
const db = require('../db/database');

function importArticles() {
    console.log("================================================================================");
    console.log("⚡ STRATA CONTENT IMPORTER");
    console.log("================================================================================");

    const articles = ContentImporter.loadAllArticles();
    console.log(`[+] Discovered ${articles.length} article(s) in content/articles/`);

    if (articles.length === 0) {
        console.warn("⚠️ No markdown articles found to import.");
        return;
    }

    db.setArticles(articles);
    console.log(`✅ Successfully imported ${articles.length} articles into the database.`);
    
    // Summary by category
    const categoryCounts = {};
    for (const a of articles) {
        categoryCounts[a.category] = (categoryCounts[a.category] || 0) + 1;
    }
    console.log("\n[+] Breakdown by Category:");
    for (const [cat, count] of Object.entries(categoryCounts)) {
        console.log(`    - ${cat}: ${count} article(s)`);
    }
}

if (require.main === module) {
    importArticles();
}

module.exports = { importArticles };
