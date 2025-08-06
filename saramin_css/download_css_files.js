const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const http = require('http');

async function downloadCSSFiles() {
    const collectedDir = path.join(__dirname, 'collected');
    const cssFilesPath = path.join(collectedDir, 'css_files.json');
    const cssFiles = JSON.parse(await fs.readFile(cssFilesPath, 'utf8'));
    
    // Create directory for CSS files
    const cssDir = path.join(collectedDir, 'css_files');
    await fs.mkdir(cssDir, { recursive: true });
    
    console.log(`Downloading ${cssFiles.length} CSS files...`);
    
    for (const cssUrl of cssFiles) {
        try {
            const fileName = cssUrl.split('/').pop().split('?')[0];
            const filePath = path.join(cssDir, fileName);
            
            console.log(`Downloading: ${fileName}`);
            
            await downloadFile(cssUrl, filePath);
            
            // Add small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
            console.error(`Failed to download ${cssUrl}:`, error.message);
        }
    }
    
    console.log('Download complete!');
    
    // Create a combined CSS file for easy viewing
    await combineCSSFiles(cssDir);
}

function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        const file = require('fs').createWriteStream(dest);
        
        protocol.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            require('fs').unlinkSync(dest);
            reject(err);
        });
    });
}

async function combineCSSFiles(cssDir) {
    const files = await fs.readdir(cssDir);
    const cssFiles = files.filter(f => f.endsWith('.css'));
    
    let combinedCSS = '';
    
    for (const file of cssFiles) {
        const content = await fs.readFile(path.join(cssDir, file), 'utf8');
        combinedCSS += `\n\n/* ========== ${file} ========== */\n\n`;
        combinedCSS += content;
    }
    
    await fs.writeFile(
        path.join(cssDir, '..', 'combined_saramin.css'),
        combinedCSS
    );
    
    console.log('Created combined CSS file: combined_saramin.css');
}

// Run the download
downloadCSSFiles().catch(console.error);