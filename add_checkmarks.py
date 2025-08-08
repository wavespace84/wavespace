import os
import re

def add_checkmarks_to_nav_items(file_path):
    """HTML 파일의 nav-item에 체크마크 추가"""
    
    # 체크마크를 추가해야 할 메뉴 아이템들
    nav_items_to_update = [
        # 구인구직 섹션
        ('분양기획', 'fas fa-briefcase'),
        ('분양영업', 'fas fa-briefcase'),
        ('헤드헌팅', 'fas fa-user-tie'),
        # 분양자료 섹션
        ('Data Center', 'fas fa-database'),
        ('시장조사서', 'fas fa-book'),
        ('제안서', 'fas fa-file-signature'),
        ('교육자료', 'fas fa-graduation-cap'),
        ('정책자료', 'fas fa-file-alt'),
        ('기타자료', 'fas fa-folder'),
        ('AI 보고서', 'fas fa-robot'),
        # 포인트 섹션
        ('포인트정책', 'fas fa-gem'),
        ('전체랭킹', 'fas fa-chart-bar'),
        ('충전하기', 'fas fa-credit-card'),
        ('상점', 'fas fa-store'),
    ]
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        modified = False
        
        for item_text, icon_class in nav_items_to_update:
            # 패턴: nav-item 클래스가 있고, 해당 텍스트가 있으며, check-mark가 없는 경우
            pattern = rf'(<a href="[^"]*" class="nav-item[^"]*">\s*<i class="{icon_class}"></i>\s*<span>{re.escape(item_text)}</span>)(\s*</a>)'
            
            # check-mark가 이미 있는지 확인
            check_pattern = rf'<a href="[^"]*" class="nav-item[^"]*">\s*<i class="{icon_class}"></i>\s*<span>{re.escape(item_text)}</span>\s*<span class="check-mark"></span>'
            
            if not re.search(check_pattern, content):
                # check-mark 추가
                replacement = r'\1\n                                    <span class="check-mark"></span>\2'
                new_content = re.sub(pattern, replacement, content)
                
                if new_content != content:
                    content = new_content
                    modified = True
                    print(f"  - Added check-mark for: {item_text}")
        
        if modified:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ Updated: {file_path}")
        else:
            print(f"⏭️  Skipped (no changes): {file_path}")
            
    except Exception as e:
        print(f"❌ Error processing {file_path}: {e}")

def main():
    # 모든 HTML 파일 찾기
    html_files = [f for f in os.listdir('.') if f.endswith('.html')]
    
    print("Adding check-marks to nav items in all HTML files...")
    print("-" * 50)
    
    for html_file in html_files:
        add_checkmarks_to_nav_items(html_file)
    
    print("-" * 50)
    print("✅ Complete!")

if __name__ == "__main__":
    main()