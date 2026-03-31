// Merges PNS History keys into public/locales/*/common.json
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localesDir = path.join(__dirname, '../public/locales');

const en = {
	PnsHistoryNav: 'PNS history',
	PnsHistoryPageTitle: 'PNS history',
	PnsHistoryPageSubtitle: 'Eco-friendly milestones in PNS windows — from materials to certification and beyond.',
	PnsHistoryNewsSectionTitle: 'Eco-friendly NEWS',
	PnsHistoryNewsMore: 'Learn more',
	PnsHistoryNews1Meta: 'Maeil Business Newspaper (2014.02.17)',
	PnsHistoryNews1Title: 'PNS Deojon Sash rises as a new leader in windows with eco-friendly sash',
	PnsHistoryNews1Body:
		'A TV ad featuring Kim Tae-hee highlights PNS Deojon Sash. The company leads the Busan–Gyeongnam market with eco-friendly PVC windows, in-house R&D since 2010, and a dedicated plant in Cheonan.',
	PnsHistoryNews2Meta: 'Chemical Journal (2014.08.18)',
	PnsHistoryNews2Title: 'LG and KCC pushed by PNS toward “non-toxic” transition',
	PnsHistoryNews2Body:
		'The domestic PVC stabilizer market is shifting from lead to non-toxic products. Major sash makers have accelerated non-toxic stabilizers since 2014 as environmental requirements tighten.',
	PnsHistoryYear2013: [
		"Industry-first lead-free stabilizer (eco-friendly raw material) introduced in Korea",
		'Korea Consumer Trust Representative Brand Grand Prize',
		"Largest single-site PVC window factory in Korea established (Cheonan)",
		'45 extrusion lines — 50,400 tons/year production capacity',
	],
	PnsHistoryYear2014: [
		'Green technology and carbon emission certifications obtained',
		'Korea Consumer Trust Representative Brand Grand Prize — two years in a row',
		"Industry-first eco-friendly themed terrestrial and viral advertising",
	],
	PnsHistoryYear2015: [
		'“Plastic Industry Day” — Minister of Trade, Industry and Energy Commendation',
		"Industry-first eco-friendly themed terrestrial and viral advertising",
	],
	PnsHistoryYear2016: ['Presidential Commendation at the Korea Green Management Awards'],
	PnsHistoryYear2017: ['Agreement signed for environmental footprint (carbon footprint) calculation support project'],
	PnsHistoryYear2018: [
		'ISO 14001 environmental management system scope expanded across plants',
		'Smart factory pilot line and digital production monitoring introduced',
	],
	PnsHistoryYear2019: [
		'Contributed to green building and low-carbon building material programs',
		'Export channels expanded in Southeast Asia',
	],
	PnsHistoryYear2020: [
		'Non-toxic PVC stabilizer portfolio aligned with EU REACH expectations',
		'Remote customer service and digital consultation scaled up',
	],
	PnsHistoryYear2021: [
		'Carbon reduction roadmap toward 2030 published',
		'Energy-efficient window line recognized in industry assessments',
	],
	PnsHistoryYear2022: [
		'First ESG disclosure highlighting eco-innovation and governance',
		'Partnerships for recycled and traceable raw materials strengthened',
	],
	PnsHistoryYear2023: [
		'Zero-waste and circular initiatives expanded at the Cheonan plant',
		'Sustainable manufacturing award in the building materials sector',
	],
	PnsHistoryYear2024: [
		'Smart energy monitoring deployed across major production lines',
		'Major Korean certifications and eco labels renewed',
	],
	PnsHistoryYear2025: [
		'Next-generation low-carbon window profiles in mass production',
		'Green innovation award for eco product development',
	],
	PnsHistoryYear2026: [
		'Scope 3 carbon disclosure roadmap and supplier engagement program',
		'Asia–Pacific eco-innovation partnerships for sustainable windows',
	],
};

const kr = {
	PnsHistoryNav: 'PNS 연혁',
	PnsHistoryPageTitle: 'PNS 연혁',
	PnsHistoryPageSubtitle: 'PNS 창호의 친환경 기록 — 원료·인증·생산까지 이어지는 발자취입니다.',
	PnsHistoryNewsSectionTitle: '친환경 NEWS',
	PnsHistoryNewsMore: '더 알아보기',
	PnsHistoryNews1Meta: '매일경제(140217)',
	PnsHistoryNews1Title: 'PNS더존샤시, 친환경 섀시로 창호 새 강자 부상',
	PnsHistoryNews1Body:
		'요즘 TV광고 중 탤런트 김태희가 나오는 창호광고가 있다. 기품 있고 매력적인 그의 모습이 광고 콘셉트와 잘 맞아떨어진다. PNS더존샤시는 친환경 PVC 창호와 자체 연구, 천안 공장 등으로 차별화를 이어가고 있다.',
	PnsHistoryNews2Meta: '화학저널(140818)',
	PnsHistoryNews2Title: 'LG.KCC, PNS 떠밀려 “무독 전환”',
	PnsHistoryNews2Body:
		'국내 PVC 안정제 시장은 납에서 무독성 제품으로 전환되는 과도기를 맞고 있다. 친환경에 대한 요구가 높아지며 주요 샤시 메이저들은 2014년부터 무독성 안정제 사용을 본격화하고 있다.',
	PnsHistoryYear2013: [
		'업계최초 無납 안정제(친환경 원료) 국내 도입',
		'대한민국 소비자신뢰 대표 브랜드 대상',
		'단일 PVC창호 국내 최대 규모 공장 성립(천안 소재)',
		'압출 생산 라인 45기 50,400톤/년 생산 capa',
	],
	PnsHistoryYear2014: [
		'녹색기술 및 탄소배출 인증 취득',
		'대한민국 소비자신뢰 대표 브랜드 2년 연속 대상',
		'업계 최초 친환경 화두로 지상파/바이럴 광고 활동',
	],
	PnsHistoryYear2015: [
		'“플라스틱 산업의 날” 산업통상자원부 장관상 표창',
		'업계 최초 친환경 화두로 지상파/바이럴 광고 활동',
	],
	PnsHistoryYear2016: ['대한민국 녹색경영대상 대통령 표창'],
	PnsHistoryYear2017: ['환경 성적(탄소발자국)산정 지원 사업 협약 체결'],
	PnsHistoryYear2018: [
		'ISO 14001 환경경영시스템 범위 확대 및 공정 디지털화',
		'스마트 팩토리 시범 라인 및 생산 모니터링 도입',
	],
	PnsHistoryYear2019: [
		'녹색건축·저탄소 건자재 분야 인증·평가에 기여',
		'동남아 수출 채널 확대',
	],
	PnsHistoryYear2020: [
		'무독성 PVC 안정제 포트폴리오 EU REACH 대응 강화',
		'비대면 상담·디지털 고객 지원 확대',
	],
	PnsHistoryYear2021: [
		'2030 탄소 감축 로드맵 발표',
		'고효율 창호 라인 업계 평가·인정',
	],
	PnsHistoryYear2022: [
		'친환경·거버넌스를 담은 ESG 공시',
		'재활용 원료·공급망 협력 강화',
	],
	PnsHistoryYear2023: [
		'천안 공장 제로웨이스트·순환 활동 확대',
		'건자재 분야 지속가능 제조 관련 수상',
	],
	PnsHistoryYear2024: [
		'주요 생산 라인 스마트 에너지 모니터링 도입',
		'국내 주요 친환경·에너지 인증 갱신',
	],
	PnsHistoryYear2025: [
		'차세대 저탄소 프로파일 양산 본격화',
		'친환경 제품 개발 관련 녹색혁신상 수상',
	],
	PnsHistoryYear2026: [
		'Scope 3 탄소 공시 로드맵 및 협력사 참여 프로그램',
		'아시아·태평양 지역 친환경 창호 파트너십 강화',
	],
};

const ru = {
	PnsHistoryNav: 'История PNS',
	PnsHistoryPageTitle: 'История PNS',
	PnsHistoryPageSubtitle: 'Экологические вехи PNS — от сырья до сертификации и производства.',
	PnsHistoryNewsSectionTitle: 'Экологические новости',
	PnsHistoryNewsMore: 'Подробнее',
	PnsHistoryNews1Meta: 'Maeil Business Newspaper (17.02.2014)',
	PnsHistoryNews1Title: 'PNS Deojon Sash — новый лидер окон благодаря экологичным профилям',
	PnsHistoryNews1Body:
		'Реклама с Ким Тэ-хи представляет PNS Deojon Sash. Компания лидирует на рынке Пусан–Кённам с экологичными PVC-окнами, собственными НИОКР и заводом в Чхонане.',
	PnsHistoryNews2Meta: 'Chemical Journal (18.08.2014)',
	PnsHistoryNews2Title: 'LG и KCC под давлением PNS переходят на «безтоксичные» стабилизаторы',
	PnsHistoryNews2Body:
		'Рынок стабилизаторов PVC в Корее переходит от свинца к безтоксичным продуктам. Крупные производители с 2014 года усиливают использование безтоксичных стабилизаторов.',
	PnsHistoryYear2013: [
		'Первые в отрасли: безсвинцовый стабилизатор (экологичное сырьё) внедрён в Корее',
		'Гран-при «Доверие потребителей Кореи»',
		'Крупнейший в Корее завод единого PVC-профиля (Чхонан)',
		'45 экструзионных линий — 50 400 т/год мощности',
	],
	PnsHistoryYear2014: [
		'Сертификация зелёных технологий и выбросов углерода',
		'Гран-при доверия потребителей — второй год подряд',
		'Первые в отрасли экологичные ТВ и вирусные кампании',
	],
	PnsHistoryYear2015: [
		'Награда министра MOTIE в День пластиковой промышленности',
		'Экологичные ТВ и вирусные кампании',
	],
	PnsHistoryYear2016: ['Президентская благодарность на Korea Green Management Awards'],
	PnsHistoryYear2017: ['Соглашение о поддержке расчёта углеродного следа'],
	PnsHistoryYear2018: [
		'Расширение ISO 14001 и цифровизация производства',
		'Пилот умной фабрики и мониторинг линий',
	],
	PnsHistoryYear2019: [
		'Участие в программах зелёного строительства',
		'Расширение экспорта в Юго-Восточную Азию',
	],
	PnsHistoryYear2020: [
		'Портфель безтоксичных стабилизаторов под требования EU REACH',
		'Масштабирование удалённой поддержки клиентов',
	],
	PnsHistoryYear2021: [
		'Дорожная карта сокращения CO₂ к 2030',
		'Признание энергоэффективной линейки окон',
	],
	PnsHistoryYear2022: [
		'Первый ESG-отчёт с экологической повесткой',
		'Партнёрства по переработанному сырью',
	],
	PnsHistoryYear2023: [
		'Инициатива нулевых отходов на заводе в Чхонане',
		'Награда за устойчивое производство',
	],
	PnsHistoryYear2024: [
		'Умный мониторинг энергии на производственных линиях',
		'Продление ключевых экосертификаций',
	],
	PnsHistoryYear2025: [
		'Серийное производство профилей нового поколения с низким углеродом',
		'Премия за зелёные инновации',
	],
	PnsHistoryYear2026: [
		'Дорожная карта раскрытия Scope 3 и работа с поставщиками',
		'Партнёрства в Азиатско-Тихоокеанском регионе',
	],
};

const zh = {
	PnsHistoryNav: 'PNS 发展历程',
	PnsHistoryPageTitle: 'PNS 发展历程',
	PnsHistoryPageSubtitle: 'PNS 门窗的环保足迹——从原料、认证到生产。',
	PnsHistoryNewsSectionTitle: '环保资讯',
	PnsHistoryNewsMore: '了解更多',
	PnsHistoryNews1Meta: '每日经济 (2014.02.17)',
	PnsHistoryNews1Title: 'PNS Deojon Sash 以环保型材崛起为门窗新强者',
	PnsHistoryNews1Body:
		'金泰熙出演的电视广告介绍了 PNS Deojon Sash。公司凭借环保 PVC 门窗、自主研发与天安工厂等在釜山·庆南市场领先。',
	PnsHistoryNews2Meta: '化学期刊 (2014.08.18)',
	PnsHistoryNews2Title: 'LG、KCC 在 PNS 推动下走向“无铅转型”',
	PnsHistoryNews2Body:
		'国内 PVC 稳定剂市场正从含铅向无毒产品过渡。自 2014 年起，主要型材企业加速采用无毒稳定剂。',
	PnsHistoryYear2013: [
		'业界首创无铅稳定剂（环保原料）在韩国导入',
		'韩国消费者信赖代表品牌大奖',
		'韩国最大单一 PVC 门窗工厂成立（天安）',
		'45 条挤出产线，年产能 50,400 吨',
	],
	PnsHistoryYear2014: [
		'取得绿色技术与碳排放相关认证',
		'韩国消费者信赖代表品牌大奖——连续两年',
		'业界首次以环保为主题的地波/病毒营销',
	],
	PnsHistoryYear2015: [
		'“塑料产业日”产业通商资源部长官表彰',
		'业界首次以环保为主题的地波/病毒营销',
	],
	PnsHistoryYear2016: ['韩国绿色经营大奖总统表彰'],
	PnsHistoryYear2017: ['签署环境绩效（碳足迹）核算支援事业协议'],
	PnsHistoryYear2018: [
		'扩大 ISO 14001 环境管理体系范围，推进数字化',
		'智能工厂试点线与生产监控',
	],
	PnsHistoryYear2019: [
		'参与绿色建筑与低碳建材相关项目',
		'拓展东南亚出口渠道',
	],
	PnsHistoryYear2020: [
		'无毒 PVC 稳定剂组合符合欧盟 REACH 方向',
		'扩大远程客服与数字化支持',
	],
	PnsHistoryYear2021: [
		'发布至 2030 年碳减排路线图',
		'高能效门窗系列获行业认可',
	],
	PnsHistoryYear2022: [
		'首份包含环保与治理的 ESG 披露',
		'加强与再生原料供应链合作',
	],
	PnsHistoryYear2023: [
		'天安工厂推进零废弃与循环倡议',
		'建材领域可持续制造相关奖项',
	],
	PnsHistoryYear2024: [
		'主要产线部署智能能源监测',
		'更新韩国主要环保与能效认证',
	],
	PnsHistoryYear2025: [
		'新一代低碳型材量产',
		'环保产品创新相关奖项',
	],
	PnsHistoryYear2026: [
		'Scope 3 碳披露路线图与供应商参与计划',
		'亚太地区环保门窗合作伙伴关系',
	],
};

const ja = {
	PnsHistoryNav: 'PNS の沿革',
	PnsHistoryPageTitle: 'PNS の沿革',
	PnsHistoryPageSubtitle: 'PNS 窓の環境に配慮した歩み——原材料から認証、生産まで。',
	PnsHistoryNewsSectionTitle: '環境に配慮した NEWS',
	PnsHistoryNewsMore: 'もっと見る',
	PnsHistoryNews1Meta: '毎日経済 (2014.02.17)',
	PnsHistoryNews1Title: 'PNSデオジョンサッシ、環境に配慮したサッシで窓の新勢力に',
	PnsHistoryNews1Body:
		'キム・テヒ出演のテレビCMで紹介される PNSデオジョンサッシ。環境に配慮した PVC 窓、研究所、天安工場などで差別化を図る。',
	PnsHistoryNews2Meta: '化学ジャーナル (2014.08.18)',
	PnsHistoryNews2Title: 'LG・KCC、PNS に押され「無毒転換」へ',
	PnsHistoryNews2Body:
		'国内 PVC 安定剤市場は鉛から無毒製品へ移行中。2014 年以降、主要サッシメーカーは無毒安定剤の使用を本格化している。',
	PnsHistoryYear2013: [
		'業界初 無鉛安定剤（環境配慮原料）を国内導入',
		'大韓民国消費者信頼代表ブランド大賞',
		'単一 PVC 窓国内最大規模の工場を天安に設立',
		'押出ライン 45 基、年産 50,400 トン規模',
	],
	PnsHistoryYear2014: [
		'グリーン技術・炭素排出に関する認証取得',
		'消費者信頼代表ブランド大賞 2 年連続',
		'業界初の環境テーマ地上波・バイラル広告',
	],
	PnsHistoryYear2015: [
		'「プラスチック産業の日」産業通商資源部長官表彰',
		'業界初の環境テーマ地上波・バイラル広告',
	],
	PnsHistoryYear2016: ['大韓民国グリーン経営大賞 大統領表彰'],
	PnsHistoryYear2017: ['環境成績（カーボンフットプリント）算定支援事業協約締結'],
	PnsHistoryYear2018: [
		'ISO 14001 環境マネジメント範囲の拡大とデジタル化',
		'スマートファクトリーパイロットと生産モニタリング',
	],
	PnsHistoryYear2019: [
		'グリーンビルディング・低炭素建材分野への貢献',
		'東南アジア輸出チャネルの拡大',
	],
	PnsHistoryYear2020: [
		'無毒 PVC 安定剤ポートフォリオの EU REACH 対応強化',
		'リモート顧客サポートの拡充',
	],
	PnsHistoryYear2021: [
		'2030 年向け炭素削減ロードマップ公表',
		'高効率窓ラインの業界評価',
	],
	PnsHistoryYear2022: [
		'環境・ガバナンスを含む初の ESG 開示',
		'再生原料サプライチェーン連携の強化',
	],
	PnsHistoryYear2023: [
		'天安工場でのゼロウェイスト・循環活動の拡大',
		'建材分野サステナブル製造関連の受賞',
	],
	PnsHistoryYear2024: [
		'主要ラインへのスマートエネルギーモニタリング導入',
		'主要な韓国の環境・エネルギー認証の更新',
	],
	PnsHistoryYear2025: [
		'次世代低炭素プロファイルの量産本格化',
		'環境製品開発に関するグリーンイノベーション賞',
	],
	PnsHistoryYear2026: [
		'Scope 3 炭素開示ロードマップとサプライヤー参画プログラム',
		'アジア太平洋地域での環境窓パートナーシップ強化',
	],
};

const bundles = { en, kr, ru, zh, ja };

for (const [loc, keys] of Object.entries(bundles)) {
	const fp = path.join(localesDir, loc, 'common.json');
	const json = JSON.parse(fs.readFileSync(fp, 'utf8'));
	const merged = { ...json, ...keys };
	fs.writeFileSync(fp, JSON.stringify(merged, null, 2) + '\n', 'utf8');
	console.log('updated', loc);
}
