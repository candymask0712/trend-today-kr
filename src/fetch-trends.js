import Parser from 'rss-parser';

const parser = new Parser();

// 나무위키 실시간 인기 검색어 (무료, 키 불필요)
async function fetchNamuWikiTrends() {
  try {
    const res = await fetch('https://search.namu.wiki/api/ranking');
    const data = await res.json();
    return data.slice(0, 10).map((item, i) => ({
      rank: i + 1,
      keyword: item.keyword || item.name || item,
      source: '나무위키'
    }));
  } catch (e) {
    console.error('나무위키 트렌드 수집 실패:', e.message);
    return [];
  }
}

// 연합뉴스 RSS (무료, 키 불필요)
async function fetchYonhapNews() {
  try {
    const feed = await parser.parseURL('https://www.yna.co.kr/rss/news.xml');
    return feed.items.slice(0, 10).map(item => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      source: '연합뉴스'
    }));
  } catch (e) {
    console.error('연합뉴스 RSS 수집 실패:', e.message);
    return [];
  }
}

// SBS 뉴스 RSS
async function fetchSBSNews() {
  try {
    const feed = await parser.parseURL('https://news.sbs.co.kr/news/SectionRssFeed.do?sectionId=01&plink=RSSREADER');
    return feed.items.slice(0, 10).map(item => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      source: 'SBS'
    }));
  } catch (e) {
    console.error('SBS 뉴스 RSS 수집 실패:', e.message);
    return [];
  }
}

export async function fetchAllTrends() {
  const [namuTrends, yonhapNews, sbsNews] = await Promise.all([
    fetchNamuWikiTrends(),
    fetchYonhapNews(),
    fetchSBSNews()
  ]);

  return { namuTrends, yonhapNews, sbsNews };
}
