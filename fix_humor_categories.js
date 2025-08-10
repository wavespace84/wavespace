// 유머재미 페이지 카테고리 수정 스크립트
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'humor.html');
let content = fs.readFileSync(filePath, 'utf8');

// 카테고리 매핑 규칙
// fa-image -> meme (짤방)
// fa-book-open -> story (썰)
// fa-video -> video (영상)
// 만화는 일단 스킵 (해당 콘텐츠 없음)

// 각 humor-item을 찾아서 아이콘에 따라 카테고리 설정
const lines = content.split('\n');
let modifiedLines = [];
let currentCategory = '';

for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // humor-item 시작 감지
    if (line.includes('class="humor-item post-item"')) {
        // 다음 몇 줄에서 아이콘 타입 찾기
        for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
            if (lines[j].includes('fa-image')) {
                currentCategory = 'meme';
                break;
            } else if (lines[j].includes('fa-book-open')) {
                currentCategory = 'story';
                break;
            } else if (lines[j].includes('fa-video')) {
                currentCategory = 'video';
                break;
            }
        }
        
        // 카테고리 설정
        if (currentCategory) {
            line = line.replace(/data-category="[^"]*"/, `data-category="${currentCategory}"`);
            if (!line.includes('data-category=')) {
                line = line.replace('class="humor-item post-item"', `class="humor-item post-item" data-category="${currentCategory}"`);
            }
        }
    }
    
    modifiedLines.push(line);
}

content = modifiedLines.join('\n');

// 파일 저장
fs.writeFileSync(filePath, content, 'utf8');

console.log('유머재미 페이지 카테고리 수정 완료!');

// 카테고리별 개수 확인
const memeCount = (content.match(/data-category="meme"/g) || []).length;
const storyCount = (content.match(/data-category="story"/g) || []).length;  
const videoCount = (content.match(/data-category="video"/g) || []).length;

console.log(`- 짤방(meme): ${memeCount}개`);
console.log(`- 썰(story): ${storyCount}개`);
console.log(`- 영상(video): ${videoCount}개`);
console.log(`- 전체: ${memeCount + storyCount + videoCount}개`);