#!/bin/bash

# 모든 HTML 파일 업데이트
for file in attendance.html events.html hall-of-fame.html humor.html index.html notice.html plus-membership.html qna.html support.html updates.html; do
    echo "Processing $file..."
    
    # 구인구직 섹션
    sed -i 's|<i class="fas fa-briefcase"></i>\s*<span>분양기획</span>\s*</a>|<i class="fas fa-briefcase"></i>\n                                    <span>분양기획</span>\n                                    <span class="check-mark"></span>\n                                </a>|g' "$file"
    
    sed -i 's|<i class="fas fa-briefcase"></i>\s*<span>분양영업</span>\s*</a>|<i class="fas fa-briefcase"></i>\n                                    <span>분양영업</span>\n                                    <span class="check-mark"></span>\n                                </a>|g' "$file"
    
    sed -i 's|<i class="fas fa-user-tie"></i>\s*<span>헤드헌팅</span>\s*</a>|<i class="fas fa-user-tie"></i>\n                                    <span>헤드헌팅</span>\n                                    <span class="check-mark"></span>\n                                </a>|g' "$file"
    
    # 분양자료 섹션
    sed -i 's|<i class="fas fa-database"></i>\s*<span>Data Center</span>\s*</a>|<i class="fas fa-database"></i>\n                                    <span>Data Center</span>\n                                    <span class="check-mark"></span>\n                                </a>|g' "$file"
    
    sed -i 's|<i class="fas fa-book"></i>\s*<span>시장조사서</span>\s*</a>|<i class="fas fa-book"></i>\n                                    <span>시장조사서</span>\n                                    <span class="check-mark"></span>\n                                </a>|g' "$file"
    
    sed -i 's|<i class="fas fa-file-signature"></i>\s*<span>제안서</span>\s*</a>|<i class="fas fa-file-signature"></i>\n                                    <span>제안서</span>\n                                    <span class="check-mark"></span>\n                                </a>|g' "$file"
    
    sed -i 's|<i class="fas fa-graduation-cap"></i>\s*<span>교육자료</span>\s*</a>|<i class="fas fa-graduation-cap"></i>\n                                    <span>교육자료</span>\n                                    <span class="check-mark"></span>\n                                </a>|g' "$file"
    
    sed -i 's|<i class="fas fa-file-alt"></i>\s*<span>정책자료</span>\s*</a>|<i class="fas fa-file-alt"></i>\n                                    <span>정책자료</span>\n                                    <span class="check-mark"></span>\n                                </a>|g' "$file"
    
    sed -i 's|<i class="fas fa-folder"></i>\s*<span>기타자료</span>\s*</a>|<i class="fas fa-folder"></i>\n                                    <span>기타자료</span>\n                                    <span class="check-mark"></span>\n                                </a>|g' "$file"
    
    sed -i 's|<i class="fas fa-robot"></i>\s*<span>AI 보고서</span>\s*</a>|<i class="fas fa-robot"></i>\n                                    <span>AI 보고서</span>\n                                    <span class="check-mark"></span>\n                                </a>|g' "$file"
    
    # 포인트 섹션
    sed -i 's|<i class="fas fa-gem"></i>\s*<span>포인트정책</span>\s*</a>|<i class="fas fa-gem"></i>\n                                    <span>포인트정책</span>\n                                    <span class="check-mark"></span>\n                                </a>|g' "$file"
    
    sed -i 's|<i class="fas fa-chart-bar"></i>\s*<span>전체랭킹</span>\s*</a>|<i class="fas fa-chart-bar"></i>\n                                    <span>전체랭킹</span>\n                                    <span class="check-mark"></span>\n                                </a>|g' "$file"
    
    sed -i 's|<i class="fas fa-credit-card"></i>\s*<span>충전하기</span>\s*</a>|<i class="fas fa-credit-card"></i>\n                                    <span>충전하기</span>\n                                    <span class="check-mark"></span>\n                                </a>|g' "$file"
    
    sed -i 's|<i class="fas fa-store"></i>\s*<span>상점</span>\s*</a>|<i class="fas fa-store"></i>\n                                    <span>상점</span>\n                                    <span class="check-mark"></span>\n                                </a>|g' "$file"
    
    echo "Done with $file"
done

echo "All files updated!"