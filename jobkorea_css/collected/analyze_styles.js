const fs = require('fs').promises;
const path = require('path');

async function analyzeStyles() {
    const outputDir = path.join('D:', 'wspace', 'jobkorea_css', 'collected');
    
    // Load collected data
    const componentStyles = JSON.parse(await fs.readFile(path.join(outputDir, 'component_styles.json'), 'utf-8'));
    const colorPalette = JSON.parse(await fs.readFile(path.join(outputDir, 'color_palette.json'), 'utf-8'));
    const typography = JSON.parse(await fs.readFile(path.join(outputDir, 'typography.json'), 'utf-8'));
    
    // Analyze common patterns
    const analysis = {
        common_paddings: {},
        common_margins: {},
        border_styles: {},
        box_shadows: [],
        border_radius: {},
        z_index_values: [],
        widths: {},
        heights: {}
    };
    
    // Process each component
    for (const [componentName, styles] of Object.entries(componentStyles)) {
        for (const style of styles) {
            // Collect padding values
            if (style.padding && style.padding !== '0px') {
                analysis.common_paddings[style.padding] = (analysis.common_paddings[style.padding] || 0) + 1;
            }
            
            // Collect margin values
            if (style.margin && style.margin !== '0px') {
                analysis.common_margins[style.margin] = (analysis.common_margins[style.margin] || 0) + 1;
            }
            
            // Collect border styles
            if (style.border && style.border !== '0px none' && !style.border.includes('rgba(0, 0, 0, 0)')) {
                analysis.border_styles[style.border] = (analysis.border_styles[style.border] || 0) + 1;
            }
            
            // Collect box shadows
            if (style.boxShadow && style.boxShadow !== 'none') {
                analysis.box_shadows.push(style.boxShadow);
            }
            
            // Collect border radius
            if (style.borderRadius && style.borderRadius !== '0px') {
                analysis.border_radius[style.borderRadius] = (analysis.border_radius[style.borderRadius] || 0) + 1;
            }
            
            // Collect widths
            if (style.width) {
                analysis.widths[style.width] = (analysis.widths[style.width] || 0) + 1;
            }
            
            // Collect heights
            if (style.height) {
                analysis.heights[style.height] = (analysis.heights[style.height] || 0) + 1;
            }
        }
    }
    
    // Sort by frequency
    const sortByFrequency = (obj) => {
        return Object.entries(obj)
            .sort(([,a], [,b]) => b - a)
            .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});
    };
    
    analysis.common_paddings = sortByFrequency(analysis.common_paddings);
    analysis.common_margins = sortByFrequency(analysis.common_margins);
    analysis.border_styles = sortByFrequency(analysis.border_styles);
    analysis.border_radius = sortByFrequency(analysis.border_radius);
    
    // Create design tokens
    const designTokens = {
        colors: {
            primary: 'rgb(51, 153, 255)',
            text: {
                primary: 'rgb(0, 0, 0)',
                secondary: 'rgb(23, 23, 23)',
                tertiary: 'rgb(106, 106, 106)'
            },
            background: {
                primary: 'rgb(255, 255, 255)'
            }
        },
        typography: {
            fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif',
            sizes: {
                xs: '12px',
                sm: '14px',
                base: '16px',
                lg: '18px'
            },
            weights: {
                normal: '400',
                medium: '500'
            },
            lineHeights: {
                tight: '20px',
                normal: 'normal',
                relaxed: '26px'
            }
        },
        spacing: {
            xs: '8px',
            sm: '12px',
            md: '16px',
            lg: '20px',
            xl: '24px'
        },
        borderRadius: {
            sm: '4px',
            md: '8px',
            lg: '12px'
        }
    };
    
    // Save analysis results
    await fs.writeFile(
        path.join(outputDir, 'style_analysis.json'),
        JSON.stringify(analysis, null, 2),
        'utf-8'
    );
    
    await fs.writeFile(
        path.join(outputDir, 'design_tokens.json'),
        JSON.stringify(designTokens, null, 2),
        'utf-8'
    );
    
    // Create CSS variables file
    const cssVariables = `/* JobKorea Design System CSS Variables */
:root {
  /* Colors */
  --color-primary: rgb(51, 153, 255);
  --color-text-primary: rgb(0, 0, 0);
  --color-text-secondary: rgb(23, 23, 23);
  --color-text-tertiary: rgb(106, 106, 106);
  --color-background: rgb(255, 255, 255);
  
  /* Typography */
  --font-family: Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif;
  --font-size-xs: 12px;
  --font-size-sm: 14px;
  --font-size-base: 16px;
  --font-size-lg: 18px;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --line-height-tight: 20px;
  --line-height-normal: normal;
  --line-height-relaxed: 26px;
  
  /* Spacing */
  --spacing-xs: 8px;
  --spacing-sm: 12px;
  --spacing-md: 16px;
  --spacing-lg: 20px;
  --spacing-xl: 24px;
  
  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  
  /* Layout */
  --container-width: 1260px;
  --header-height: 146px;
}`;
    
    await fs.writeFile(
        path.join(outputDir, 'design_system_variables.css'),
        cssVariables,
        'utf-8'
    );
    
    console.log('Analysis complete!');
    console.log('Created files:');
    console.log('  - style_analysis.json');
    console.log('  - design_tokens.json');
    console.log('  - design_system_variables.css');
}

analyzeStyles().catch(console.error);