import { eq } from 'drizzle-orm';
import { getDb } from '../../db/client';
import { properties, propertyDocuments } from '../../db/schema';
import { StorageService } from '../../services/storage';
import { ChainService } from './service';
import { samplePdf } from './sample-pdf';

interface DemoDoc { slot: string; filename: string; title: string; lines: string[] }
interface DemoProperty {
  id: string;
  row: typeof properties.$inferInsert;
  owner: string;
  docs: DemoDoc[];
}

const SAMPLE = 'SAMPLE DOCUMENT - Realdha demo data, not a legal record';

/** The two demo properties the UI twins show (plot Gat 112/2 and apartment A-1804). Ids are fixed so the UI can link to them. */
export const DEMO_PROPERTIES: DemoProperty[] = [
  {
    id: 'prop_demo_kusgaon_112_2',
    owner: 'Prakash Kulkarni',
    row: { id: 'prop_demo_kusgaon_112_2', type: 'plot', gat: '112/2', village: 'Kusgaon', taluka: 'Maval', district: 'Pune', address: 'Gat 112/2, Kusgaon, Maval, Pune', lat: 18.7546, lng: 73.4062, area: '418', area_unit: 'sq m', stage: 'checked' },
    docs: [
      { slot: 'extract', filename: '7-12-kusgaon.pdf', title: '7/12 extract', lines: ['Village Kusgaon, Taluka Maval, District Pune', 'Gat No. 112/2   Area 418 sq m', 'Owner: Prakash Kulkarni', 'Land use: Non-agricultural'] },
      { slot: 'card', filename: 'property-card.pdf', title: 'Property card', lines: ['Gat 112/2, Kusgaon', 'Holder: Prakash Kulkarni'] },
      { slot: 'na', filename: 'na-order.pdf', title: 'NA order', lines: ['Non-agricultural use permission', 'Gat 112/2, Kusgaon, Maval'] },
      { slot: 'mutation', filename: 'mutation-2291.pdf', title: 'Mutation entry 2291', lines: ['Mutation entry 2291', 'Transferred to Prakash Kulkarni'] },
      { slot: 'deed', filename: 'sale-deed.pdf', title: 'Sale deed', lines: ['Sale deed dated 12 March 2015', 'Buyer: Prakash Kulkarni', 'Gat 112/2, Kusgaon, Maval, Pune'] },
    ],
  },
  {
    id: 'prop_demo_baner_a1804',
    owner: 'Sample Owner',
    row: { id: 'prop_demo_baner_a1804', type: 'apartment', village: 'Baner', taluka: 'Haveli', district: 'Pune', address: 'A-1804, Baner Heights, Baner, Pune', lat: 18.559, lng: 73.7868, area: '1450', area_unit: 'sq ft', stage: 'checked' },
    docs: [
      { slot: 'agreement', filename: 'agreement-for-sale.pdf', title: 'Agreement for sale', lines: ['Flat A-1804, Baner Heights, Baner, Pune', 'Owner: Sample Owner'] },
      { slot: 'deed', filename: 'conveyance-deed.pdf', title: 'Conveyance deed', lines: ['Flat A-1804, Baner Heights', 'Owner: Sample Owner'] },
      { slot: 'card', filename: 'property-card.pdf', title: 'Property card', lines: ['Flat A-1804, Baner Heights', 'Holder: Sample Owner'] },
    ],
  },
];

/** Creates the demo property rows and documents if missing, then runs the normal lawyer approval to mint their tokens. */
export async function seedDemoTokens(approvedBy = 'Adv. Meera Joshi (demo lawyer)') {
  const db = getDb();
  const results = [];
  for (const demo of DEMO_PROPERTIES) {
    const [existing] = await db.select({ id: properties.id }).from(properties).where(eq(properties.id, demo.id));
    if (!existing) {
      await db.insert(properties).values(demo.row);
      for (const d of demo.docs) {
        const content = samplePdf([d.title, SAMPLE, ...d.lines]);
        const gcsPath = `properties/${demo.id}/${d.slot}/demo-${d.filename}`;
        await StorageService.uploadFile({ filename: gcsPath, content, contentType: 'application/pdf' });
        await db.insert(propertyDocuments).values({
          id: `doc_demo_${demo.id.slice(10)}_${d.slot}`, property_id: demo.id, slot: d.slot, filename: d.filename, mime: 'application/pdf',
          size: content.length, gcs_path: gcsPath, status: 'processed', pages: 1, detected_lang: 'en',
          fields: { owner: demo.owner, ownerEn: demo.owner },
        });
      }
    }
    results.push({ propertyId: demo.id, ...(await ChainService.approve(demo.id, { approvedBy })) });
  }
  return results;
}
