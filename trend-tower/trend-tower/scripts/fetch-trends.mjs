import { writeFile, mkdir, readFile } from 'fs/promises';

const API_KEY = process.env.ANTHROPIC_API_KEY;
if (!API_KEY) {
  console.error('ANTHROPIC_API_KEY 환경변수가 없습니다. 저장소 Secrets에 등록해주세요.');
  process.exit(1);
}

function todayStr() {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000); // KST 보정
  return kst.toISOString().slice(0, 10);
}

const dateStr = todayStr();

const prompt = `오늘(${dateStr}) 기준 한국 소셜/커머스 트렌드를 웹 검색으로 조사해줘. 아래 JSON 스키마로만 응답해. 마크다운, 코드펜스, 설명 문구 없이 순수 JSON만 출력해.

스키마:
{
  "date": "${dateStr}",
  "channels": [
    {"platform":"X(트위터)","focus":"실시간 이슈·덕질 문화","items":[{"title":"(12자 이내)","summary":"(30자 이내 한국어 요약)","link":"실제 검색된 출처 URL"}] (2개)},
    {"platform":"인스타그램","focus":"시각적 유행·라이프스타일","items":[...동일 형식 2개]},
    {"platform":"스레드","focus":"대중 여론·텍스트 이슈","items":[...동일 형식 2개]},
    {"platform":"홈쇼핑","focus":"대중적 소비 흐름","items":[...동일 형식 2개]}
  ],
  "insight":"오늘 흐름을 관통하는 한 줄 인사이트 (40자 이내)"
}`;

async function main() {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
      tools: [{ type: 'web_search_20250305', name: 'web_search' }]
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`API 요청 실패 (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const text = data.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim();

  let report;
  try {
    report = JSON.parse(text);
  } catch (e) {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('JSON 파싱 실패: ' + text.slice(0, 300));
    report = JSON.parse(match[0]);
  }

  await mkdir('data/history', { recursive: true });
  await writeFile('data/latest.json', JSON.stringify(report, null, 2));
  await writeFile(`data/history/${dateStr}.json`, JSON.stringify(report, null, 2));

  let index = [];
  try {
    const raw = await readFile('data/index.json', 'utf-8');
    index = JSON.parse(raw);
  } catch (e) {
    index = [];
  }
  if (!index.includes(dateStr)) index.push(dateStr);
  index.sort().reverse();
  await writeFile('data/index.json', JSON.stringify(index.slice(0, 60), null, 2));

  console.log('저장 완료:', dateStr);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
