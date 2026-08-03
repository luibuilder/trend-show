# Trend Tower

루이빌더 마케팅 트렌드 관제실. 매일 아침 X(트위터)·인스타그램·스레드·홈쇼핑 트렌드를 자동으로 검색해서 GitHub Pages에 표시합니다.

## 배포 후 설정해야 할 것

1. **Secrets 등록**: Settings → Secrets and variables → Actions → New repository secret
   - Name: `ANTHROPIC_API_KEY`
   - Value: 본인의 Anthropic API 키 (https://console.anthropic.com 에서 발급)

2. **워크플로우 쓰기 권한 확인**: Settings → Actions → General → Workflow permissions → "Read and write permissions" 선택 후 저장

3. **GitHub Pages 활성화**: Settings → Pages → Source: "Deploy from a branch" → Branch: `main` / `(root)` 선택

4. **첫 데이터 생성**: Actions 탭 → "Daily Trend Scan" → "Run workflow" 클릭 (수동 실행)
   - 이후에는 매일 08:00(KST)에 자동 실행됩니다.

배포 완료 후 주소: `https://<GitHub 아이디>.github.io/<저장소 이름>/`
