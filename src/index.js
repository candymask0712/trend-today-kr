import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { fetchAllTrends } from './fetch-trends.js';
import { generatePage } from './generate-page.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = resolve(__dirname, '../docs/index.html');

async function main() {
  console.log('🔍 한국 트렌드 수집 중...');
  const trends = await fetchAllTrends();

  const totalItems = trends.namuTrends.length + trends.yonhapNews.length + trends.sbsNews.length;
  console.log(`📊 수집 완료: ${totalItems}개 항목`);

  if (totalItems === 0) {
    console.error('❌ 트렌드 데이터를 수집하지 못했습니다.');
    process.exit(1);
  }

  console.log('🤖 AI로 웹 페이지 생성 중...');
  const html = await generatePage(trends);

  writeFileSync(OUTPUT_PATH, html, 'utf-8');
  console.log(`✅ 생성 완료: ${OUTPUT_PATH}`);
}

main().catch(err => {
  console.error('❌ 에러:', err.message);
  process.exit(1);
});
