import { getDb, closeDb } from '../db/client';
import { scrapeRuns } from '../db/schema';
import { crawlList, crawlProjects, crawlOsm, runBuild, type StageCounts } from './magicbricks/crawl';
import { getCityConfig } from './cities';

interface ScrapeArgs {
  city: string;
  stage: 'list' | 'projects' | 'osm' | 'build' | 'all';
  pages?: number;
  limit?: number;
}

function parseCliArgs(): ScrapeArgs {
  const args = process.argv.slice(2);
  let city = 'pune';
  let stage: ScrapeArgs['stage'] = 'all';
  let pages: number | undefined;
  let limit: number | undefined;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--stage' && args[i + 1]) {
      stage = args[++i] as ScrapeArgs['stage'];
    } else if (arg === '--pages' && args[i + 1]) {
      pages = parseInt(args[++i], 10);
    } else if (arg === '--limit' && args[i + 1]) {
      limit = parseInt(args[++i], 10);
    } else if (!arg.startsWith('-')) {
      city = arg.toLowerCase();
    }
  }

  return { city, stage, pages, limit };
}

async function main() {
  const { city, stage, pages, limit } = parseCliArgs();
  const cityConfig = getCityConfig(city);

  console.log(`====================================================`);
  console.log(`Realdha Flat Finder Scraper`);
  console.log(`City:    ${cityConfig.name} (${cityConfig.slug})`);
  console.log(`Stage:   ${stage}`);
  if (pages) console.log(`Pages:   ${pages}`);
  if (limit) console.log(`Limit:   ${limit}`);
  console.log(`====================================================`);

  const runId = `run_${Date.now()}`;
  const db = getDb();
  const counts: Record<string, number> = {};
  const startedAt = new Date();

  // Log run start
  await db.insert(scrapeRuns).values({
    id: runId,
    city: cityConfig.slug,
    stage,
    started_at: startedAt,
  });

  try {
    if (stage === 'list' || stage === 'all') {
      const listRes = await crawlList(cityConfig.slug, { pages });
      counts.list_pages = listRes.pagesScraped;
      counts.projects_listed = listRes.totalListed;
    }

    if (stage === 'projects' || stage === 'all') {
      const projRes = await crawlProjects(cityConfig.slug, { limit });
      counts.projects_scraped = projRes.scrapedCount;
    }

    if (stage === 'osm' || stage === 'all') {
      const osmRes = await crawlOsm(cityConfig.slug);
      counts.pois_collected = osmRes.poisCount;
    }

    if (stage === 'build' || stage === 'all') {
      const buildRes = await runBuild(cityConfig.slug);
      counts.societies_built = buildRes.builtCount;
    }

    // Log run completion
    await db
      .update(scrapeRuns)
      .set({
        finished_at: new Date(),
        counts,
      })
      .where(sql`id = ${runId}`);

    console.log(`[scraper] Run ${runId} completed successfully.`);
    console.log(`Counts:`, JSON.stringify(counts, null, 2));
  } catch (err: any) {
    console.error(`[scraper] Run ${runId} failed:`, err);
    try {
      await db
        .update(scrapeRuns)
        .set({
          finished_at: new Date(),
          counts,
          error: String(err?.message || err),
        })
        .where(sql`id = ${runId}`);
    } catch {}
    process.exit(1);
  } finally {
    await closeDb();
  }
}

// sql helper import for run.ts
import { sql } from 'drizzle-orm';

if (import.meta.main) {
  main();
}
