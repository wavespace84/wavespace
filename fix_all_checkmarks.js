const fs = require('fs');
const path = require('path');

// 체크마크를 추가해야 할 항목들
const itemsToUpdate = [
    // 구인구직
    { icon: 'fas fa-briefcase', text: '분양기획' },
    { icon: 'fas fa-briefcase', text: '분양영업' },
    { icon: 'fas fa-user-tie', text: '헤드헌팅' },
    // 분양자료
    { icon: 'fas fa-database', text: 'Data Center' },
    { icon: 'fas fa-book', text: '시장조사서' },
    { icon: 'fas fa-file-signature', text: '제안서' },
    { icon: 'fas fa-graduation-cap', text: '교육자료' },
    { icon: 'fas fa-file-alt', text: '정책자료' },
    { icon: 'fas fa-folder', text: '기타자료' },
    { icon: 'fas fa-robot', text: 'AI 보고서' },
    // 포인트
    { icon: 'fas fa-gem', text: '포인트정책' },
    { icon: 'fas fa-chart-bar', text: '전체랭킹' },
    { icon: 'fas fa-credit-card', text: '충전하기' },
    { icon: 'fas fa-store', text: '상점' }
];

// HTML 파일 목록
const htmlFiles = [
    'attendance.html', 'events.html', 'hall-of-fame.html', 
    'humor.html', 'index.html', 'notice.html', 
    'plus-membership.html', 'qna.html', 'support.html', 
    'updates.html'
];

htmlFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    
    if (!fs.existsSync(filePath)) {
        console.log(`Skipping ${file} - not found`);
        return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    itemsToUpdate.forEach(item => {
        // 패턴: 아이콘과 텍스트가 있고 check-mark가 없는 경우
        const pattern = new RegExp(
            `(<i class="${item.icon}"></i>\\s*<span>${item.text}</span>)(\\s*</a>)`,
            'g'
        );
        
        // check-mark가 이미 있는지 확인
        const checkPattern = new RegExp(
            `<i class="${item.icon}"></i>\\s*<span>${item.text}</span>\\s*<span class="check-mark"></span>`,
            'g'
        );
        
        if (!checkPattern.test(content)) {
            content = content.replace(pattern, '$1\n                                    <span class="check-mark"></span>$2');
            modified = true;
        }
    });
    
    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Updated: ${file}`);
    } else {
        console.log(`⏭️ Skipped: ${file} (no changes or already updated)`);
    }
});

console.log('All files processed!');