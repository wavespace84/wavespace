const fs = require('fs').promises;
const path = require('path');

async function analyzeCollectedCSS() {
    const collectedDir = path.join(__dirname, 'collected');
    
    // Read collected data
    const cssFiles = JSON.parse(await fs.readFile(path.join(collectedDir, 'css_files.json'), 'utf8'));
    const colorPalette = JSON.parse(await fs.readFile(path.join(collectedDir, 'color_palette.json'), 'utf8'));
    const typography = JSON.parse(await fs.readFile(path.join(collectedDir, 'typography.json'), 'utf8'));
    const componentStyles = JSON.parse(await fs.readFile(path.join(collectedDir, 'component_styles.json'), 'utf8'));
    const inlineStyles = JSON.parse(await fs.readFile(path.join(collectedDir, 'inline_styles.json'), 'utf8'));
    
    // Create analysis report
    const report = {
        summary: {
            totalCSSFiles: cssFiles.length,
            totalColors: colorPalette.rgb.length + colorPalette.hex.length + colorPalette.named.length,
            totalButtonStyles: componentStyles.buttons.length,
            totalCardStyles: componentStyles.cards.length,
            totalFormStyles: componentStyles.forms.length,
            pagesAnalyzed: inlineStyles.length
        },
        
        cssFileCategories: categorizeCSSFiles(cssFiles),
        
        colorAnalysis: analyzeColors(colorPalette),
        
        typographyAnalysis: analyzeTypography(typography),
        
        buttonAnalysis: analyzeButtons(componentStyles.buttons),
        
        layoutSystem: componentStyles.layout,
        
        navigationStyle: componentStyles.navigation,
        
        designSystemFindings: {
            primaryFont: "Pretendard, \"Malgun Gothic\", dotum, gulim, sans-serif",
            fallbackFont: "\"Malgun Gothic\", arial, sans-serif",
            primaryColors: extractPrimaryColors(colorPalette),
            commonBorderRadius: extractCommonBorderRadius(componentStyles),
            commonSpacing: extractCommonSpacing(componentStyles)
        }
    };
    
    // Save analysis report
    await fs.writeFile(
        path.join(collectedDir, 'css_analysis_report.json'),
        JSON.stringify(report, null, 2)
    );
    
    // Create human-readable report
    const readableReport = createReadableReport(report);
    await fs.writeFile(
        path.join(collectedDir, 'css_analysis_report.md'),
        readableReport
    );
    
    console.log('Analysis complete! Check css_analysis_report.md for the results.');
}

function categorizeCSSFiles(files) {
    const categories = {
        layout: [],
        components: [],
        pages: [],
        utilities: [],
        vendor: []
    };
    
    files.forEach(file => {
        if (file.includes('layout') || file.includes('header') || file.includes('gnb')) {
            categories.layout.push(file);
        } else if (file.includes('component') || file.includes('pattern')) {
            categories.components.push(file);
        } else if (file.includes('main') || file.includes('jobs') || file.includes('login')) {
            categories.pages.push(file);
        } else if (file.includes('common') || file.includes('help')) {
            categories.utilities.push(file);
        } else if (file.includes('swiper') || file.includes('libs')) {
            categories.vendor.push(file);
        }
    });
    
    return categories;
}

function analyzeColors(palette) {
    const colors = palette.rgb;
    
    // Extract unique base colors (ignoring complex border definitions)
    const uniqueColors = new Set();
    colors.forEach(color => {
        // Skip complex border color definitions
        if (!color.includes(' rgb')) {
            uniqueColors.add(color);
        }
    });
    
    // Group similar colors
    const colorGroups = {
        blacks: [],
        whites: [],
        blues: [],
        grays: [],
        others: []
    };
    
    Array.from(uniqueColors).forEach(color => {
        const matches = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (matches) {
            const [_, r, g, b] = matches.map(Number);
            
            if (r === 0 && g === 0 && b === 0) {
                colorGroups.blacks.push(color);
            } else if (r === 255 && g === 255 && b === 255) {
                colorGroups.whites.push(color);
            } else if (b > r && b > g) {
                colorGroups.blues.push(color);
            } else if (Math.abs(r - g) < 20 && Math.abs(g - b) < 20 && Math.abs(r - b) < 20) {
                colorGroups.grays.push(color);
            } else {
                colorGroups.others.push(color);
            }
        }
    });
    
    return colorGroups;
}

function analyzeTypography(typography) {
    const fontSizes = new Set();
    const fontWeights = new Set();
    const lineHeights = new Set();
    
    Object.values(typography).forEach(styles => {
        styles.forEach(style => {
            fontSizes.add(style.fontSize);
            fontWeights.add(style.fontWeight);
            lineHeights.add(style.lineHeight);
        });
    });
    
    return {
        fontSizes: Array.from(fontSizes).sort(),
        fontWeights: Array.from(fontWeights).sort(),
        lineHeights: Array.from(lineHeights).sort(),
        tagSpecific: Object.keys(typography).reduce((acc, tag) => {
            acc[tag] = {
                count: typography[tag].length,
                commonSize: getMostCommon(typography[tag].map(s => s.fontSize)),
                commonWeight: getMostCommon(typography[tag].map(s => s.fontWeight))
            };
            return acc;
        }, {})
    };
}

function analyzeButtons(buttons) {
    const borderRadiuses = new Set();
    const heights = new Set();
    const displays = new Set();
    
    buttons.forEach(btn => {
        borderRadiuses.add(btn.styles.borderRadius);
        heights.add(btn.styles.height);
        displays.add(btn.styles.display);
    });
    
    return {
        totalButtons: buttons.length,
        borderRadiuses: Array.from(borderRadiuses),
        heights: Array.from(heights),
        displays: Array.from(displays),
        commonPatterns: {
            transparentBackground: buttons.filter(b => b.styles.backgroundColor === 'rgba(0, 0, 0, 0)').length,
            withBorder: buttons.filter(b => b.styles.border !== '0px none').length,
            rounded: buttons.filter(b => parseInt(b.styles.borderRadius) > 0).length
        }
    };
}

function extractPrimaryColors(palette) {
    const blues = analyzeColors(palette).blues;
    // Sort blues by frequency in original array
    const blueFrequency = {};
    palette.rgb.forEach(color => {
        if (blues.includes(color)) {
            blueFrequency[color] = (blueFrequency[color] || 0) + 1;
        }
    });
    
    return Object.entries(blueFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([color]) => color);
}

function extractCommonBorderRadius(styles) {
    const radii = new Set();
    
    styles.buttons.forEach(btn => radii.add(btn.styles.borderRadius));
    styles.cards.forEach(card => radii.add(card.styles.borderRadius));
    
    return Array.from(radii)
        .filter(r => r !== '0px')
        .sort();
}

function extractCommonSpacing(styles) {
    const spacing = new Set();
    
    styles.buttons.forEach(btn => spacing.add(btn.styles.padding));
    styles.cards.forEach(card => spacing.add(card.styles.padding));
    styles.forms.forEach(form => spacing.add(form.styles.padding));
    
    return Array.from(spacing)
        .filter(s => s && s !== '0px')
        .sort();
}

function getMostCommon(arr) {
    const counts = {};
    arr.forEach(item => {
        counts[item] = (counts[item] || 0) + 1;
    });
    
    return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])[0]?.[0];
}

function createReadableReport(report) {
    return `# 사람인(Saramin) CSS 분석 보고서

## 요약
- 분석된 페이지 수: ${report.summary.pagesAnalyzed}
- 총 CSS 파일 수: ${report.summary.totalCSSFiles}
- 발견된 색상 수: ${report.summary.totalColors}
- 버튼 스타일 수: ${report.summary.totalButtonStyles}
- 카드 스타일 수: ${report.summary.totalCardStyles}
- 폼 스타일 수: ${report.summary.totalFormStyles}

## CSS 파일 구조
### 레이아웃 관련 (${report.cssFileCategories.layout.length}개)
${report.cssFileCategories.layout.map(f => `- ${f.split('/').pop()}`).join('\n')}

### 컴포넌트 관련 (${report.cssFileCategories.components.length}개)
${report.cssFileCategories.components.map(f => `- ${f.split('/').pop()}`).join('\n')}

### 페이지별 스타일 (${report.cssFileCategories.pages.length}개)
${report.cssFileCategories.pages.map(f => `- ${f.split('/').pop()}`).join('\n')}

## 디자인 시스템 분석

### 주요 폰트
- **Primary Font**: ${report.designSystemFindings.primaryFont}
- **Fallback Font**: ${report.designSystemFindings.fallbackFont}

### 색상 팔레트
#### 주요 블루 계열 (Primary Colors)
${report.designSystemFindings.primaryColors.map((c, i) => `${i + 1}. ${c}`).join('\n')}

#### 색상 그룹
- **블루 계열**: ${report.colorAnalysis.blues.length}개
- **그레이 계열**: ${report.colorAnalysis.grays.length}개
- **기타**: ${report.colorAnalysis.others.length}개

### 타이포그래피
#### 폰트 크기
${report.typographyAnalysis.fontSizes.join(', ')}

#### 폰트 굵기
${report.typographyAnalysis.fontWeights.join(', ')}

#### 태그별 스타일
${Object.entries(report.typographyAnalysis.tagSpecific).map(([tag, info]) => 
    `- **${tag}**: ${info.count}개 변형, 주요 크기: ${info.commonSize}, 주요 굵기: ${info.commonWeight}`
).join('\n')}

### 버튼 스타일 분석
- **총 버튼 스타일**: ${report.buttonAnalysis.totalButtons}개
- **투명 배경**: ${report.buttonAnalysis.commonPatterns.transparentBackground}개
- **보더 있음**: ${report.buttonAnalysis.commonPatterns.withBorder}개
- **둥근 모서리**: ${report.buttonAnalysis.commonPatterns.rounded}개

#### Border Radius 사용
${report.buttonAnalysis.borderRadiuses.join(', ')}

### 레이아웃 시스템
${report.layoutSystem ? JSON.stringify(report.layoutSystem, null, 2) : '레이아웃 정보 없음'}

### 네비게이션 스타일
${report.navigationStyle ? JSON.stringify(report.navigationStyle, null, 2) : '네비게이션 정보 없음'}

### 공통 Border Radius
${report.designSystemFindings.commonBorderRadius.join(', ')}

### 공통 Spacing (Padding)
${report.designSystemFindings.commonSpacing.join(', ')}

## 주요 발견사항
1. 사람인은 Pretendard 폰트를 주요 폰트로 사용하며, Malgun Gothic을 폴백으로 사용
2. 주요 색상은 파란색 계열 (rgb(45, 103, 255), rgb(72, 118, 239) 등)
3. 버튼은 대부분 투명 배경에 보더를 사용하는 스타일
4. Grid 디스플레이를 적극적으로 활용
5. 다양한 border-radius 값 사용 (0px, 16px, 28px 등)
`;
}

// Run the analysis
analyzeCollectedCSS().catch(console.error);