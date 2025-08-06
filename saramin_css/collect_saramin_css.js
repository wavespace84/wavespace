const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

async function collectSaraminCSS() {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();

    const results = {
        cssFiles: new Set(),
        inlineStyles: [],
        componentStyles: {},
        colorPalette: new Set(),
        typography: {},
        buttons: [],
        cards: [],
        navigation: {},
        forms: [],
        layout: {}
    };

    // Pages to visit
    const pages = [
        { name: 'main', url: 'https://www.saramin.co.kr' },
        { name: 'jobs', url: 'https://www.saramin.co.kr/zf_user/jobs' },
        { name: 'company', url: 'https://www.saramin.co.kr/zf_user/company-info' },
        { name: 'talent', url: 'https://www.saramin.co.kr/zf_user/talent' },
        { name: 'job_detail', url: 'https://www.saramin.co.kr/zf_user/jobs/relay/view' }
    ];

    for (const pageInfo of pages) {
        console.log(`Visiting ${pageInfo.name}: ${pageInfo.url}`);
        
        try {
            // Navigate to page
            await page.goto(pageInfo.url, { 
                waitUntil: 'networkidle',
                timeout: 30000 
            });

            // Wait for content to load
            await page.waitForTimeout(3000);

            // Collect CSS file URLs
            const cssFiles = await page.evaluate(() => {
                const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
                return links.map(link => link.href);
            });
            cssFiles.forEach(url => results.cssFiles.add(url));

            // Collect inline styles
            const inlineStyles = await page.evaluate(() => {
                const styles = Array.from(document.querySelectorAll('style'));
                return styles.map(style => style.innerHTML);
            });
            results.inlineStyles.push({
                page: pageInfo.name,
                styles: inlineStyles
            });

            // Collect colors from computed styles
            const colors = await page.evaluate(() => {
                const colorSet = new Set();
                const elements = document.querySelectorAll('*');
                const sample = Array.from(elements).slice(0, 500); // Sample first 500 elements
                
                sample.forEach(el => {
                    const computed = window.getComputedStyle(el);
                    ['color', 'backgroundColor', 'borderColor'].forEach(prop => {
                        const value = computed[prop];
                        if (value && value !== 'rgba(0, 0, 0, 0)' && value !== 'transparent') {
                            colorSet.add(value);
                        }
                    });
                });
                
                return Array.from(colorSet);
            });
            colors.forEach(color => results.colorPalette.add(color));

            // Collect typography information
            const typography = await page.evaluate(() => {
                const fontInfo = {};
                const elements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, a, span');
                const sample = Array.from(elements).slice(0, 100);
                
                sample.forEach(el => {
                    const computed = window.getComputedStyle(el);
                    const tag = el.tagName.toLowerCase();
                    
                    if (!fontInfo[tag]) {
                        fontInfo[tag] = new Set();
                    }
                    
                    fontInfo[tag].add(JSON.stringify({
                        fontFamily: computed.fontFamily,
                        fontSize: computed.fontSize,
                        fontWeight: computed.fontWeight,
                        lineHeight: computed.lineHeight
                    }));
                });
                
                // Convert sets to arrays
                Object.keys(fontInfo).forEach(key => {
                    fontInfo[key] = Array.from(fontInfo[key]).map(item => JSON.parse(item));
                });
                
                return fontInfo;
            });
            
            // Merge typography info
            Object.entries(typography).forEach(([tag, styles]) => {
                if (!results.typography[tag]) {
                    results.typography[tag] = [];
                }
                results.typography[tag].push(...styles);
            });

            // Collect button styles
            const buttons = await page.evaluate(() => {
                const buttonElements = document.querySelectorAll('button, .btn, [class*="button"], input[type="submit"], input[type="button"]');
                const buttonStyles = [];
                
                Array.from(buttonElements).slice(0, 20).forEach(btn => {
                    const computed = window.getComputedStyle(btn);
                    buttonStyles.push({
                        selector: btn.className || btn.tagName.toLowerCase(),
                        styles: {
                            backgroundColor: computed.backgroundColor,
                            color: computed.color,
                            padding: computed.padding,
                            borderRadius: computed.borderRadius,
                            border: computed.border,
                            fontSize: computed.fontSize,
                            fontWeight: computed.fontWeight,
                            display: computed.display,
                            width: computed.width,
                            height: computed.height
                        }
                    });
                });
                
                return buttonStyles;
            });
            results.buttons.push(...buttons);

            // Collect card component styles
            const cards = await page.evaluate(() => {
                const cardElements = document.querySelectorAll('[class*="card"], [class*="item"], [class*="box"]');
                const cardStyles = [];
                
                Array.from(cardElements).slice(0, 10).forEach(card => {
                    const computed = window.getComputedStyle(card);
                    cardStyles.push({
                        selector: card.className,
                        styles: {
                            backgroundColor: computed.backgroundColor,
                            border: computed.border,
                            borderRadius: computed.borderRadius,
                            boxShadow: computed.boxShadow,
                            padding: computed.padding,
                            margin: computed.margin,
                            display: computed.display,
                            width: computed.width
                        }
                    });
                });
                
                return cardStyles;
            });
            results.cards.push(...cards);

            // Collect navigation styles
            if (pageInfo.name === 'main') {
                const navStyles = await page.evaluate(() => {
                    const nav = document.querySelector('nav, [class*="nav"], [class*="menu"], header');
                    if (nav) {
                        const computed = window.getComputedStyle(nav);
                        return {
                            backgroundColor: computed.backgroundColor,
                            color: computed.color,
                            height: computed.height,
                            display: computed.display,
                            position: computed.position,
                            zIndex: computed.zIndex,
                            boxShadow: computed.boxShadow
                        };
                    }
                    return null;
                });
                if (navStyles) {
                    results.navigation = navStyles;
                }
            }

            // Collect form styles
            const formStyles = await page.evaluate(() => {
                const inputs = document.querySelectorAll('input[type="text"], input[type="email"], textarea, select');
                const formElements = [];
                
                Array.from(inputs).slice(0, 10).forEach(input => {
                    const computed = window.getComputedStyle(input);
                    formElements.push({
                        type: input.tagName.toLowerCase() + (input.type ? `[type="${input.type}"]` : ''),
                        styles: {
                            backgroundColor: computed.backgroundColor,
                            border: computed.border,
                            borderRadius: computed.borderRadius,
                            padding: computed.padding,
                            fontSize: computed.fontSize,
                            height: computed.height,
                            width: computed.width
                        }
                    });
                });
                
                return formElements;
            });
            results.forms.push(...formStyles);

            // Collect layout structure
            if (pageInfo.name === 'main') {
                const layoutInfo = await page.evaluate(() => {
                    const body = document.body;
                    const main = document.querySelector('main, [role="main"], .main-content');
                    const container = document.querySelector('.container, .wrapper, [class*="container"]');
                    
                    const getLayoutInfo = (el) => {
                        if (!el) return null;
                        const computed = window.getComputedStyle(el);
                        return {
                            display: computed.display,
                            maxWidth: computed.maxWidth,
                            margin: computed.margin,
                            padding: computed.padding,
                            width: computed.width
                        };
                    };
                    
                    return {
                        body: getLayoutInfo(body),
                        main: getLayoutInfo(main),
                        container: getLayoutInfo(container)
                    };
                });
                results.layout = layoutInfo;
            }

            console.log(`Completed collecting from ${pageInfo.name}`);
            
        } catch (error) {
            console.error(`Error visiting ${pageInfo.name}:`, error.message);
        }

        // Add delay between pages
        await page.waitForTimeout(2000);
    }

    await browser.close();

    // Process and save results
    const outputDir = path.join(__dirname, 'collected');
    
    // Create output directory if it doesn't exist
    await fs.mkdir(outputDir, { recursive: true });
    
    // Save CSS file URLs
    await fs.writeFile(
        path.join(outputDir, 'css_files.json'),
        JSON.stringify(Array.from(results.cssFiles), null, 2)
    );

    // Save inline styles
    await fs.writeFile(
        path.join(outputDir, 'inline_styles.json'),
        JSON.stringify(results.inlineStyles, null, 2)
    );

    // Process and save color palette
    const colorPalette = Array.from(results.colorPalette).reduce((acc, color) => {
        // Group similar colors
        if (color.startsWith('rgb')) {
            acc.rgb.push(color);
        } else if (color.startsWith('#')) {
            acc.hex.push(color);
        } else {
            acc.named.push(color);
        }
        return acc;
    }, { rgb: [], hex: [], named: [] });

    await fs.writeFile(
        path.join(outputDir, 'color_palette.json'),
        JSON.stringify(colorPalette, null, 2)
    );

    // Save typography
    await fs.writeFile(
        path.join(outputDir, 'typography.json'),
        JSON.stringify(results.typography, null, 2)
    );

    // Save component styles
    const componentStyles = {
        buttons: results.buttons,
        cards: results.cards,
        navigation: results.navigation,
        forms: results.forms,
        layout: results.layout
    };

    await fs.writeFile(
        path.join(outputDir, 'component_styles.json'),
        JSON.stringify(componentStyles, null, 2)
    );

    console.log('CSS collection completed!');
}

// Run the collection
collectSaraminCSS().catch(console.error);