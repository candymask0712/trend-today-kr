import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export async function generatePage(trends) {
  const trendSummary = buildTrendSummary(trends);

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8000,
    messages: [
      {
        role: 'user',
        content: `당신은 한국 트렌드를 반영한 인터랙티브 웹 페이지를 만드는 전문가입니다.

아래는 현재 한국에서 화제인 트렌드 데이터입니다:

${trendSummary}

이 데이터를 분석해서, 가장 핫한 이슈 1개를 선정하고 그 이슈를 주제로 한 **단일 HTML 파일** 웹 페이지를 만들어주세요.

요구사항:
1. 완전한 단일 HTML 파일 (CSS, JS 모두 인라인)
2. 한국어로 작성
3. 모바일 반응형
4. 시각적으로 매력적인 디자인 (그라데이션, 카드 UI 등)
5. 이슈에 대한 핵심 정보, 타임라인, 관련 키워드 등을 포함
6. 페이지 하단에 "이 페이지는 AI가 실시간 트렌드를 분석하여 자동 생성했습니다" 문구 포함
7. 생성 시각을 한국 시간(KST)으로 표시

HTML 코드만 출력하세요. 설명이나 마크다운 코드블록 없이 <!DOCTYPE html>부터 시작하세요.`
      }
    ]
  });

  return message.content[0].text;
}

function buildTrendSummary(trends) {
  let summary = '';

  if (trends.namuTrends.length > 0) {
    summary += '## 나무위키 실시간 인기 검색어\n';
    trends.namuTrends.forEach(t => {
      summary += `${t.rank}. ${t.keyword}\n`;
    });
    summary += '\n';
  }

  if (trends.yonhapNews.length > 0) {
    summary += '## 연합뉴스 주요 헤드라인\n';
    trends.yonhapNews.forEach(t => {
      summary += `- ${t.title}\n`;
    });
    summary += '\n';
  }

  if (trends.sbsNews.length > 0) {
    summary += '## SBS 뉴스 주요 헤드라인\n';
    trends.sbsNews.forEach(t => {
      summary += `- ${t.title}\n`;
    });
  }

  return summary;
}
