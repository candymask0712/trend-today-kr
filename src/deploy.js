import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const REPO_NAME = 'trend-today-kr';

function run(cmd) {
  console.log(`$ ${cmd}`);
  return execSync(cmd, { cwd: ROOT, stdio: 'inherit' });
}

async function deploy() {
  const htmlPath = resolve(ROOT, 'docs/index.html');
  if (!existsSync(htmlPath)) {
    console.error('❌ docs/index.html이 없습니다. 먼저 npm run generate를 실행하세요.');
    process.exit(1);
  }

  // Git 초기화 (아직 안 되어 있으면)
  if (!existsSync(resolve(ROOT, '.git'))) {
    run('git init');
    run('git branch -M main');
  }

  // GitHub 리포 생성 (없으면)
  try {
    execSync(`gh repo view ${REPO_NAME}`, { cwd: ROOT, stdio: 'pipe' });
    console.log(`📦 리포지토리 ${REPO_NAME} 이미 존재`);
  } catch {
    console.log(`📦 리포지토리 ${REPO_NAME} 생성 중...`);
    run(`gh repo create ${REPO_NAME} --public --source=. --remote=origin`);
  }

  // 커밋 & 푸시
  run('git add docs/');
  try {
    const date = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
    run(`git commit -m "🔄 트렌드 업데이트: ${date}"`);
  } catch {
    console.log('ℹ️  변경사항 없음, 기존 커밋 유지');
  }

  // remote 설정
  try {
    execSync('git remote get-url origin', { cwd: ROOT, stdio: 'pipe' });
  } catch {
    run(`gh repo view ${REPO_NAME} --json url -q .url | xargs git remote add origin`);
  }

  run('git push -u origin main');

  // GitHub Pages 활성화 (docs/ 폴더 기반)
  try {
    run(`gh api repos/{owner}/${REPO_NAME}/pages -X POST -f source.branch=main -f source.path=/docs 2>/dev/null || true`);
  } catch {
    // 이미 활성화되어 있을 수 있음
  }

  const user = execSync('gh api user -q .login', { encoding: 'utf-8' }).trim();
  console.log(`\n🌐 배포 완료! https://${user}.github.io/${REPO_NAME}/`);
}

deploy().catch(err => {
  console.error('❌ 배포 에러:', err.message);
  process.exit(1);
});
