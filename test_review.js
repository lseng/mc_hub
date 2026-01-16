const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  const reviewImgDir = '/Users/leoneng/Library/Mobile Documents/com~apple~CloudDocs/MC Hub/trees/f45c6e6a/agents/f45c6e6a/reviewer/review_img';

  console.log('Starting review tests...');

  try {
    // Test 1: Navigate to application and take initial screenshot
    console.log('Test 1: Loading application...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(reviewImgDir, '01_initial_app_state.png'), fullPage: true });
    console.log('✓ Initial state captured');

    // Test 2: Basic Resource Discovery - "What forms are available?"
    console.log('Test 2: Testing basic forms query...');
    await page.waitForSelector('input[type="text"]', { timeout: 5000 });
    await page.fill('input[type="text"]', 'What forms are available?');
    await page.screenshot({ path: path.join(reviewImgDir, '02_forms_query_input.png'), fullPage: true });

    const startTime = Date.now();
    await page.press('input[type="text"]', 'Enter');

    // Wait for AI response
    await page.waitForSelector('.chat-row', { timeout: 10000 });
    await page.waitForTimeout(3000); // Wait for resources to load
    const responseTime = Date.now() - startTime;

    await page.screenshot({ path: path.join(reviewImgDir, '03_forms_query_results.png'), fullPage: true });
    console.log(`✓ Forms query completed in ${responseTime}ms`);

    // Check for resources in the response
    const hasResources = await page.evaluate(() => {
      const resources = document.querySelectorAll('.chat-resources');
      return resources.length > 0;
    });
    console.log(`Resources displayed: ${hasResources}`);

    // Test 3: Role-based query - "Show me resources for leaders"
    console.log('Test 3: Testing role-based query...');
    await page.waitForTimeout(1000);
    await page.fill('input[type="text"]', 'Show me resources for leaders');
    await page.press('input[type="text"]', 'Enter');
    await page.waitForTimeout(4000);
    await page.screenshot({ path: path.join(reviewImgDir, '04_leader_resources_results.png'), fullPage: true });
    console.log('✓ Leader resources query completed');

    // Test 4: Specific form query - "Find the coach application"
    console.log('Test 4: Testing specific form query...');
    await page.waitForTimeout(1000);
    await page.fill('input[type="text"]', 'Find the coach application');
    await page.press('input[type="text"]', 'Enter');
    await page.waitForTimeout(4000);
    await page.screenshot({ path: path.join(reviewImgDir, '05_coach_application_result.png'), fullPage: true });
    console.log('✓ Coach application query completed');

    // Test 5: Check for offer_resources mode (should NOT exist)
    console.log('Test 5: Checking for offer_resources mode...');
    const hasOfferResourcesButtons = await page.evaluate(() => {
      const yesButton = Array.from(document.querySelectorAll('button')).find(btn =>
        btn.textContent.includes('Yes, show resources')
      );
      const noButton = Array.from(document.querySelectorAll('button')).find(btn =>
        btn.textContent.includes('Not now')
      );
      return yesButton !== undefined || noButton !== undefined;
    });

    if (hasOfferResourcesButtons) {
      console.log('✗ ISSUE: offer_resources mode buttons still present');
      await page.screenshot({ path: path.join(reviewImgDir, '06_offer_resources_issue.png'), fullPage: true });
    } else {
      console.log('✓ No offer_resources mode buttons found (as expected)');
    }

    console.log('\n=== Review Summary ===');
    console.log('All critical tests completed');
    console.log(`Total screenshots: 5-6`);
    console.log(`Review images saved to: ${reviewImgDir}`);

  } catch (error) {
    console.error('Error during review:', error);
    await page.screenshot({ path: path.join(reviewImgDir, 'error_screenshot.png'), fullPage: true });
  } finally {
    await browser.close();
  }
})();
