const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  page.on('console', (msg) => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('pageerror', (err) => console.log('PAGE ERROR:', err.message));

  console.log('Navigating to login page...');
  await page.goto('http://localhost:5000/login.html', { waitUntil: 'networkidle2' });

  console.log('Filling form...');
  await page.type('#loginIdentifier', 'sudalai');
  await page.type('#loginPassword', 'Password123');

  console.log('Submitting form...');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2' }),
    page.click('#submitBtn'),
  ]);

  console.log('Arrived at:', page.url());
  await page.waitForSelector('.post-card', { timeout: 10000 });
  console.log('Posts rendered!');

  // Take screenshot of feed
  await page.screenshot({ path: 'C:/Users/sudal/.gemini/antigravity/scratch/connecthub/home_feed.png' });
  console.log('Saved home_feed.png');

  // Go to profile
  await page.goto('http://localhost:5000/profile.html?user=sudalai', { waitUntil: 'networkidle2' });
  await page.waitForSelector('.profile-card', { timeout: 10000 });
  console.log('Profile rendered!');
  await page.screenshot({ path: 'C:/Users/sudal/.gemini/antigravity/scratch/connecthub/profile_page.png' });
  console.log('Saved profile_page.png');

  await browser.close();
  console.log('All browser validations succeeded!');
})().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
