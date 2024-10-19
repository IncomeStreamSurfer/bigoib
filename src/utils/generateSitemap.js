import fs from 'fs';
import { SitemapStream, streamToPromise } from 'sitemap';
import counties from '../data/counties.json';
import trades from '../data/trades.json';

const baseUrl = 'https://findatradespersonireland.com'; // Replace with your actual domain

async function generateSitemap() {
  const smStream = new SitemapStream({ hostname: baseUrl });

  // Add static pages
  smStream.write({ url: '/', changefreq: 'daily', priority: 1 });
  smStream.write({ url: '/trades', changefreq: 'weekly', priority: 0.8 });
  smStream.write({ url: '/counties', changefreq: 'weekly', priority: 0.8 });

  // Add trade pages
  trades.forEach((trade) => {
    smStream.write({ url: `/trades/${trade.slug}`, changefreq: 'weekly', priority: 0.8 });
  });

  // Add county pages
  counties.forEach((county) => {
    smStream.write({ url: `/counties/${county.slug}`, changefreq: 'weekly', priority: 0.8 });
    
    // Add town pages
    county.towns.forEach((town) => {
      smStream.write({ url: `/counties/${county.slug}/${town}`, changefreq: 'weekly', priority: 0.7 });
    });
  });

  // Add trade in county pages
  trades.forEach((trade) => {
    counties.forEach((county) => {
      smStream.write({ url: `/trades/${trade.slug}/${county.slug}`, changefreq: 'weekly', priority: 0.7 });
    });
  });

  // Add trade in town pages
  trades.forEach((trade) => {
    counties.forEach((county) => {
      county.towns.forEach((town) => {
        smStream.write({ url: `/trades/${trade.slug}/${county.slug}/${town}`, changefreq: 'daily', priority: 0.9 });
      });
    });
  });

  // End sitemap stream
  smStream.end();

  // Generate sitemap and save to file
  const sitemap = await streamToPromise(smStream);
  fs.writeFileSync('./public/sitemap.xml', sitemap.toString());
}

generateSitemap().catch(console.error);