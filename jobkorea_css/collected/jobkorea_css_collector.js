const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

class JobKoreaCSSCollector {
    constructor() {
        this.baseUrl = 'https://www.jobkorea.co.kr';
        this.cssUrls = new Set();
        this.inlineStyles = [];
        this.componentStyles = {};
        this.colorPalette = new Set();
        this.typography = {};
    }

    async extractCssUrls(page) {
        // Get <link> stylesheet URLs
        const linkElements = await page.$$('link[rel="stylesheet"]');
        for (const link of linkElements) {
            const href = await link.getAttribute('href');
            if (href) {
                const fullUrl = new URL(href, this.baseUrl).href;
                this.cssUrls.add(fullUrl);
            }
        }

        // Get @import URLs from style tags
        const styleElements = await page.$$('style');
        for (const style of styleElements) {
            const content = await style.innerText();
            const importMatches = content.match(/@import\s+url\(['"]\?([^'"]+)['"]\)/g) || [];
            for (const match of importMatches) {
                const url = match.match(/url\(['"]\?([^'"]+)['"]\)/)[1];
                const fullUrl = new URL(url, this.baseUrl).href;
                this.cssUrls.add(fullUrl);
            }
        }
    }

    async extractInlineStyles(page) {
        const styleElements = await page.$$('style');
        for (const style of styleElements) {
            const content = await style.innerText();
            if (content.trim()) {
                this.inlineStyles.push({
                    url: page.url(),
                    content: content
                });
            }
        }
    }

    extractColorsFromStyles(styles) {
        const colorProperties = ['color', 'backgroundColor', 'borderColor', 'borderTopColor',
                               'borderRightColor', 'borderBottomColor', 'borderLeftColor'];
        
        for (const prop of colorProperties) {
            if (styles[prop] && styles[prop] !== 'rgba(0, 0, 0, 0)' && styles[prop] !== 'transparent') {
                this.colorPalette.add(styles[prop]);
            }
        }
    }

    async extractComponentStyles(page, componentName, selector) {
        try {
            const elements = await page.$$(selector);
            if (!elements.length) return;

            const componentStyles = [];
            
            // Get styles from first few instances
            for (let i = 0; i < Math.min(3, elements.length); i++) {
                const element = elements[i];
                const styles = await element.evaluate((el) => {
                    const computed = window.getComputedStyle(el);
                    const styles = {};
                    
                    // Important style properties
                    const properties = [
                        'color', 'background-color', 'background-image',
                        'font-family', 'font-size', 'font-weight', 'line-height',
                        'padding', 'margin', 'border', 'border-radius',
                        'width', 'height', 'display', 'position',
                        'box-shadow', 'text-align', 'text-decoration'
                    ];
                    
                    properties.forEach(prop => {
                        const camelCase = prop.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
                        styles[camelCase] = computed.getPropertyValue(prop);
                    });
                    
                    return styles;
                });
                
                this.extractColorsFromStyles(styles);
                
                // Extract typography info
                if (styles.fontFamily) {
                    const fontKey = `${styles.fontFamily}_${styles.fontSize}_${styles.fontWeight}`;
                    this.typography[fontKey] = {
                        fontFamily: styles.fontFamily,
                        fontSize: styles.fontSize,
                        fontWeight: styles.fontWeight,
                        lineHeight: styles.lineHeight
                    };
                }
                
                componentStyles.push(styles);
            }
            
            this.componentStyles[componentName] = componentStyles;
            
        } catch (error) {
            console.error(`Error extracting styles for ${componentName}:`, error.message);
        }
    }

    async collectPageStyles(page, pageName) {
        console.log(`\nCollecting styles from ${pageName}...`);
        
        // Extract CSS URLs and inline styles
        await this.extractCssUrls(page);
        await this.extractInlineStyles(page);
        
        // Define components to analyze based on page
        let components = {};
        
        if (pageName === 'main') {
            components = {
                'header': 'header, .header, #header',
                'navigation': 'nav, .nav, .navigation, .gnb',
                'search_box': '.search, .search-box, .search-form, input[type="search"]',
                'main_banner': '.banner, .main-banner, .visual',
                'job_card': '.job-card, .recruit-item, .list-item, .job-item',
                'button_primary': '.btn, .button, .btn-primary, button',
                'footer': 'footer, .footer, #footer'
            };
        } else if (pageName === 'job_list') {
            components = {
                'filter_sidebar': '.filter, .sidebar, .search-filter',
                'job_listing': '.list-item, .job-item, .recruit-info',
                'pagination': '.pagination, .paging, .page-nav',
                'sort_options': '.sort, .order, .sorting'
            };
        } else if (pageName === 'company') {
            components = {
                'company_card': '.company-item, .corp-item, .company-info',
                'company_logo': '.logo, .company-logo, .corp-logo',
                'info_section': '.info, .company-detail, .corp-detail'
            };
        } else if (pageName === 'job_detail') {
            components = {
                'job_header': '.detail-header, .job-header, .recruit-header',
                'job_content': '.content, .detail-content, .job-detail',
                'apply_button': '.apply, .btn-apply, .apply-btn',
                'company_info': '.company-info, .corp-info'
            };
        } else {
            components = {
                'general_card': '.card, .box, .panel',
                'form_input': 'input, textarea, select',
                'table': 'table, .table'
            };
        }
        
        // Extract component styles
        for (const [componentName, selector] of Object.entries(components)) {
            await this.extractComponentStyles(page, `${pageName}_${componentName}`, selector);
        }
    }

    async run() {
        const browser = await chromium.launch({ headless: true });
        const context = await browser.newContext({
            viewport: { width: 1920, height: 1080 },
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        });
        const page = await context.newPage();
        
        // Pages to visit
        const pagesToVisit = [
            ['main', '/'],
            ['job_list', '/recruit/joblist'],
            ['company', '/company/companylist'],
            ['talent', '/talent/talentlist']
        ];
        
        for (const [pageName, pagePath] of pagesToVisit) {
            try {
                const url = new URL(pagePath, this.baseUrl).href;
                console.log(`\nVisiting ${pageName}: ${url}`);
                await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
                await page.waitForTimeout(2000); // Wait for dynamic content
                
                await this.collectPageStyles(page, pageName);
                
                // If on job list page, try to get a job detail URL
                if (pageName === 'job_list') {
                    try {
                        const jobLink = await page.$('a[href*="/recruit/jobinfo"]');
                        if (jobLink) {
                            const jobUrl = await jobLink.getAttribute('href');
                            if (jobUrl) {
                                const fullJobUrl = new URL(jobUrl, this.baseUrl).href;
                                console.log(`\nVisiting job detail: ${fullJobUrl}`);
                                await page.goto(fullJobUrl, { waitUntil: 'networkidle', timeout: 30000 });
                                await page.waitForTimeout(2000);
                                await this.collectPageStyles(page, 'job_detail');
                            }
                        }
                    } catch (error) {
                        console.error('Could not visit job detail page:', error.message);
                    }
                }
                
            } catch (error) {
                console.error(`Error visiting ${pageName}:`, error.message);
            }
        }
        
        await browser.close();
        
        // Save results
        await this.saveResults();
    }

    async saveResults() {
        const outputDir = path.join('D:', 'wspace', 'jobkorea_css', 'collected');
        
        // Save CSS URLs
        const cssUrlsContent = '# CSS File URLs from JobKorea\n\n' + 
                             Array.from(this.cssUrls).sort().join('\n');
        await fs.writeFile(path.join(outputDir, 'css_urls.txt'), cssUrlsContent, 'utf-8');
        
        // Save inline styles
        await fs.writeFile(
            path.join(outputDir, 'inline_styles.json'),
            JSON.stringify(this.inlineStyles, null, 2),
            'utf-8'
        );
        
        // Save component styles
        await fs.writeFile(
            path.join(outputDir, 'component_styles.json'),
            JSON.stringify(this.componentStyles, null, 2),
            'utf-8'
        );
        
        // Save color palette
        const colorList = Array.from(this.colorPalette);
        const colorData = {
            all_colors: colorList.sort(),
            rgb_colors: colorList.filter(c => c.startsWith('rgb')),
            hex_colors: colorList.filter(c => c.startsWith('#')),
            named_colors: colorList.filter(c => !c.startsWith('#') && !c.startsWith('rgb'))
        };
        
        await fs.writeFile(
            path.join(outputDir, 'color_palette.json'),
            JSON.stringify(colorData, null, 2),
            'utf-8'
        );
        
        // Save typography
        await fs.writeFile(
            path.join(outputDir, 'typography.json'),
            JSON.stringify(this.typography, null, 2),
            'utf-8'
        );
        
        // Create summary report
        const summary = `JobKorea CSS Collection Summary
==============================

Total CSS URLs found: ${this.cssUrls.size}
Inline style blocks: ${this.inlineStyles.length}
Components analyzed: ${Object.keys(this.componentStyles).length}
Unique colors found: ${this.colorPalette.size}
Typography variations: ${Object.keys(this.typography).length}

Components analyzed:
${Object.keys(this.componentStyles).sort().map(c => `  - ${c}`).join('\n')}
`;
        
        await fs.writeFile(path.join(outputDir, 'summary.txt'), summary, 'utf-8');
        
        console.log('\n\nCollection complete! Results saved to:');
        console.log(`  - ${outputDir}/css_urls.txt`);
        console.log(`  - ${outputDir}/inline_styles.json`);
        console.log(`  - ${outputDir}/component_styles.json`);
        console.log(`  - ${outputDir}/color_palette.json`);
        console.log(`  - ${outputDir}/typography.json`);
        console.log(`  - ${outputDir}/summary.txt`);
    }
}

// Run the collector
const collector = new JobKoreaCSSCollector();
collector.run().catch(console.error);