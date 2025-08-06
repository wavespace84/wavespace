import asyncio
from playwright.async_api import async_playwright
import json
import re
from urllib.parse import urljoin, urlparse
import os

class JobKoreaCSSCollector:
    def __init__(self):
        self.base_url = "https://www.jobkorea.co.kr"
        self.css_urls = set()
        self.inline_styles = []
        self.component_styles = {}
        self.color_palette = set()
        self.typography = {}
        
    async def extract_css_urls(self, page):
        """Extract all CSS file URLs from the page"""
        # Get <link> stylesheet URLs
        link_elements = await page.query_selector_all('link[rel="stylesheet"]')
        for link in link_elements:
            href = await link.get_attribute('href')
            if href:
                full_url = urljoin(self.base_url, href)
                self.css_urls.add(full_url)
        
        # Get @import URLs from style tags
        style_elements = await page.query_selector_all('style')
        for style in style_elements:
            content = await style.inner_text()
            import_matches = re.findall(r'@import\s+url\(["\']?([^"\']+)["\']?\)', content)
            for match in import_matches:
                full_url = urljoin(self.base_url, match)
                self.css_urls.add(full_url)
    
    async def extract_inline_styles(self, page):
        """Extract inline styles from style tags"""
        style_elements = await page.query_selector_all('style')
        for style in style_elements:
            content = await style.inner_text()
            if content.strip():
                self.inline_styles.append({
                    'url': page.url,
                    'content': content
                })
    
    async def extract_colors_from_styles(self, styles):
        """Extract color values from computed styles"""
        color_properties = ['color', 'background-color', 'border-color', 'border-top-color', 
                          'border-right-color', 'border-bottom-color', 'border-left-color']
        
        for prop in color_properties:
            if prop in styles and styles[prop] and styles[prop] != 'rgba(0, 0, 0, 0)':
                self.color_palette.add(styles[prop])
    
    async def extract_component_styles(self, page, component_name, selector):
        """Extract computed styles for a specific component"""
        try:
            elements = await page.query_selector_all(selector)
            if not elements:
                return
            
            # Get styles from first few instances
            component_styles = []
            for i, element in enumerate(elements[:3]):  # Limit to first 3 instances
                styles = await element.evaluate('''
                    (element) => {
                        const computed = window.getComputedStyle(element);
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
                            styles[prop] = computed.getPropertyValue(prop);
                        });
                        
                        return styles;
                    }
                ''')
                
                await self.extract_colors_from_styles(styles)
                
                # Extract typography info
                if 'font-family' in styles:
                    font_key = f"{styles.get('font-family', '')}_{styles.get('font-size', '')}_{styles.get('font-weight', '')}"
                    self.typography[font_key] = {
                        'font-family': styles.get('font-family', ''),
                        'font-size': styles.get('font-size', ''),
                        'font-weight': styles.get('font-weight', ''),
                        'line-height': styles.get('line-height', '')
                    }
                
                component_styles.append(styles)
            
            self.component_styles[component_name] = component_styles
            
        except Exception as e:
            print(f"Error extracting styles for {component_name}: {e}")
    
    async def collect_page_styles(self, page, page_name):
        """Collect all styles from a specific page"""
        print(f"\nCollecting styles from {page_name}...")
        
        # Extract CSS URLs and inline styles
        await self.extract_css_urls(page)
        await self.extract_inline_styles(page)
        
        # Define components to analyze based on page
        if page_name == "main":
            components = {
                'header': 'header, .header, #header',
                'navigation': 'nav, .nav, .navigation, .gnb',
                'search_box': '.search, .search-box, .search-form, input[type="search"]',
                'main_banner': '.banner, .main-banner, .visual',
                'job_card': '.job-card, .recruit-item, .list-item, .job-item',
                'button_primary': '.btn, .button, .btn-primary, button',
                'footer': 'footer, .footer, #footer'
            }
        elif page_name == "job_list":
            components = {
                'filter_sidebar': '.filter, .sidebar, .search-filter',
                'job_listing': '.list-item, .job-item, .recruit-info',
                'pagination': '.pagination, .paging, .page-nav',
                'sort_options': '.sort, .order, .sorting'
            }
        elif page_name == "company":
            components = {
                'company_card': '.company-item, .corp-item, .company-info',
                'company_logo': '.logo, .company-logo, .corp-logo',
                'info_section': '.info, .company-detail, .corp-detail'
            }
        elif page_name == "job_detail":
            components = {
                'job_header': '.detail-header, .job-header, .recruit-header',
                'job_content': '.content, .detail-content, .job-detail',
                'apply_button': '.apply, .btn-apply, .apply-btn',
                'company_info': '.company-info, .corp-info'
            }
        else:
            components = {
                'general_card': '.card, .box, .panel',
                'form_input': 'input, textarea, select',
                'table': 'table, .table'
            }
        
        # Extract component styles
        for component_name, selector in components.items():
            await self.extract_component_styles(page, f"{page_name}_{component_name}", selector)
    
    async def run(self):
        """Main collection process"""
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(
                viewport={'width': 1920, 'height': 1080},
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            )
            page = await context.new_page()
            
            # Pages to visit
            pages_to_visit = [
                ('main', '/'),
                ('job_list', '/recruit/joblist'),
                ('company', '/company/companylist'),
                ('talent', '/talent/talentlist'),
                # We'll try to find a job detail page from the job list
            ]
            
            for page_name, path in pages_to_visit:
                try:
                    url = urljoin(self.base_url, path)
                    print(f"\nVisiting {page_name}: {url}")
                    await page.goto(url, wait_until='networkidle', timeout=30000)
                    await page.wait_for_timeout(2000)  # Wait for dynamic content
                    
                    await self.collect_page_styles(page, page_name)
                    
                    # If on job list page, try to get a job detail URL
                    if page_name == 'job_list':
                        try:
                            # Find first job link
                            job_link = await page.query_selector('a[href*="/recruit/jobinfo"]')
                            if job_link:
                                job_url = await job_link.get_attribute('href')
                                if job_url:
                                    full_job_url = urljoin(self.base_url, job_url)
                                    print(f"\nVisiting job detail: {full_job_url}")
                                    await page.goto(full_job_url, wait_until='networkidle', timeout=30000)
                                    await page.wait_for_timeout(2000)
                                    await self.collect_page_styles(page, 'job_detail')
                        except Exception as e:
                            print(f"Could not visit job detail page: {e}")
                    
                except Exception as e:
                    print(f"Error visiting {page_name}: {e}")
            
            await browser.close()
        
        # Save results
        self.save_results()
    
    def save_results(self):
        """Save collected data to files"""
        output_dir = r"D:\wspace\jobkorea_css\collected"
        
        # Save CSS URLs
        with open(os.path.join(output_dir, 'css_urls.txt'), 'w', encoding='utf-8') as f:
            f.write("# CSS File URLs from JobKorea\n\n")
            for url in sorted(self.css_urls):
                f.write(f"{url}\n")
        
        # Save inline styles
        with open(os.path.join(output_dir, 'inline_styles.json'), 'w', encoding='utf-8') as f:
            json.dump(self.inline_styles, f, indent=2, ensure_ascii=False)
        
        # Save component styles
        with open(os.path.join(output_dir, 'component_styles.json'), 'w', encoding='utf-8') as f:
            json.dump(self.component_styles, f, indent=2, ensure_ascii=False)
        
        # Save color palette
        color_list = list(self.color_palette)
        color_data = {
            'all_colors': sorted(color_list),
            'rgb_colors': [c for c in color_list if c.startswith('rgb')],
            'hex_colors': [c for c in color_list if c.startswith('#')],
            'named_colors': [c for c in color_list if not c.startswith(('#', 'rgb'))]
        }
        
        with open(os.path.join(output_dir, 'color_palette.json'), 'w', encoding='utf-8') as f:
            json.dump(color_data, f, indent=2, ensure_ascii=False)
        
        # Save typography
        with open(os.path.join(output_dir, 'typography.json'), 'w', encoding='utf-8') as f:
            json.dump(self.typography, f, indent=2, ensure_ascii=False)
        
        # Create summary report
        with open(os.path.join(output_dir, 'summary.txt'), 'w', encoding='utf-8') as f:
            f.write("JobKorea CSS Collection Summary\n")
            f.write("==============================\n\n")
            f.write(f"Total CSS URLs found: {len(self.css_urls)}\n")
            f.write(f"Inline style blocks: {len(self.inline_styles)}\n")
            f.write(f"Components analyzed: {len(self.component_styles)}\n")
            f.write(f"Unique colors found: {len(self.color_palette)}\n")
            f.write(f"Typography variations: {len(self.typography)}\n")
            
            f.write("\n\nComponents analyzed:\n")
            for component in sorted(self.component_styles.keys()):
                f.write(f"  - {component}\n")
        
        print("\n\nCollection complete! Results saved to:")
        print(f"  - {output_dir}/css_urls.txt")
        print(f"  - {output_dir}/inline_styles.json")
        print(f"  - {output_dir}/component_styles.json")
        print(f"  - {output_dir}/color_palette.json")
        print(f"  - {output_dir}/typography.json")
        print(f"  - {output_dir}/summary.txt")

if __name__ == "__main__":
    collector = JobKoreaCSSCollector()
    asyncio.run(collector.run())