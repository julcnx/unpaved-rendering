// Renders the link preview card article/og.html to article/img/og.jpg (1200 x 630, used by og:image in article/template.html).
import puppeteer from 'puppeteer-core';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 630 });
await page.goto('file://' + path.join(root, 'article/og.html'), { waitUntil: 'load' });
await page.screenshot({ path: path.join(root, 'article/img/og.jpg'), type: 'jpeg', quality: 88 });
await browser.close();
console.log('article/img/og.jpg');
