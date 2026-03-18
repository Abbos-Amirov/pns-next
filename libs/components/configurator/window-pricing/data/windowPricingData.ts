/**
 * Window pricing data – typed model for PNS Direct style configuration
 */

export type ApartmentSizeKey = '20' | '30' | '40' | '50';

export interface WindowProduct {
  index: number;
  location: string;
  productName: string;
  frame: string;
  type: string;
  glassThickness: string;
  glassSpec: string;
  w: number;
  h: number;
  form: string;
  mosquitoScreen: string;
  handle: string;
}

export interface ApartmentSizeData {
  key: ApartmentSizeKey;
  label: string;
  externalPrice: number;
  fullPrice: number;
  fullWindowProducts: WindowProduct[];
  externalWindowProducts: WindowProduct[];
}

export interface ColorOption {
  name: string;
  priceModifier: string;
}

export interface DoorOption {
  name: string;
  priceModifier: string;
}

export interface ExtraOption {
  name: string;
  priceModifier: string;
}

export const WINDOW_PRICING_TITLE = '와이드뷰';
export const WINDOW_PRICING_SUBTITLE = '에너지 성능은 기본 리모델링 최적화 시스템';
export const PRICE_NOTICE = '창호기준표 창호수량과 사이즈변동에 따라 가격이 상이할 수 있음';
export const VAT_NOTE = '(VAT포함, 변동금액)';
export const BOTTOM_NOTE = '평균 금액으로 실측 후 현장 상황에 따라 비용이 변동될 수 있습니다.';

export const COLOR_OPTIONS: ColorOption[] = [
  { name: 'White', priceModifier: '기본' },
  { name: 'US201', priceModifier: '+1,000,000' },
  { name: 'MQ808', priceModifier: '+1,000,000' },
];

export const GLASS_SPEC = {
  default: '26T 로이',
  note: '아르곤 가스등의 기타 사양은 옵션으로 추가할 수 있음.',
};

export const DOOR_OPTIONS: DoorOption[] = [
  { name: '없음', priceModifier: '기본' },
  { name: '3연동 중문 블랙', priceModifier: '+900,000' },
  { name: '3연동 중문 화이트', priceModifier: '+900,000' },
  { name: '3연동 중문 그레이', priceModifier: '+900,000' },
  { name: '3연동 중문 ㄱ자 파티션 블랙', priceModifier: '+1,500,000' },
  { name: '3연동 중문 ㄱ자 파티션 화이트', priceModifier: '+1,500,000' },
  { name: '3연동 중문 ㄱ자 파티션 그레이', priceModifier: '+1,500,000' },
  { name: '원슬라이딩 블랙', priceModifier: '+1,200,000' },
  { name: '원슬라이딩 화이트', priceModifier: '+1,200,000' },
  { name: '원슬라이딩 그레이', priceModifier: '+1,500,000' },
];

export const HANDLE_SPEC = {
  default: '리네아핸들',
  note: '핸들디자인, 크리센트 디자인 등 부속들은 사전 통지없이 변경될 수 있습니다.',
};

export const MOSQUITO_SCREEN = ['SUS 방충망', '이탈방지구'];

export const FUNCTIONAL_MATERIAL = '클린범퍼';

export const EXTRA_OPTIONS: ExtraOption[] = [
  { name: '루버창', priceModifier: '상담시문의' },
  { name: '윈드클로저', priceModifier: '+7,000' },
  { name: '방충망 그립핸들', priceModifier: '+5,000' },
  { name: '타일', priceModifier: '+300,000' },
  { name: '단열재(아이소핑크)마감', priceModifier: '+300,000' },
  { name: '사춤(조적미장)', priceModifier: '+500,000' },
  { name: '몰딩(틀 당)', priceModifier: '+50,000' },
  { name: '보양(주거세대)', priceModifier: '+300,000' },
];

function wprod(
  index: number,
  location: string,
  productName: string,
  frame: string,
  type: string,
  glassThickness: string,
  glassSpec: string,
  w: number,
  h: number,
  form: string,
  mosquitoScreen: string,
  handle: string
): WindowProduct {
  return { index, location, productName, frame, type, glassThickness, glassSpec, w, h, form, mosquitoScreen, handle };
}

export const APARTMENT_SIZE_DATA: ApartmentSizeData[] = [
  {
    key: '20',
    label: '20평대',
    externalPrice: 4900000,
    fullPrice: 7200000,
    fullWindowProducts: [
      wprod(1, '거실발코니', 'BF-120BH', 'SF-115WG', '발코니단창', '26mm', '그린+로이(AR+단열)', 3000, 2200, '3W', 'SUS', '자동'),
      wprod(2, '안방발코니', 'BF-120BH', 'SF-115WG', '발코니단창', '26mm', '그린+로이(AR+단열)', 2400, 2200, '2W(U/B)', 'SUS', '자동'),
      wprod(3, '다용도실1', 'BF-120BH', 'SF-115WG', '발코니단창', '26mm', '그린+로이(AR+단열)', 1000, 1300, '2W', 'SUS', '자동'),
      wprod(4, '다용도실2', 'TT-70-BF', 'EW-70-SF', '시스템창', '39mm', '그린+투명+로이(AR+단열)', 1500, 1300, '1V1F', '-', 'O'),
      wprod(5, '주방창', 'TT-70-BF', 'EW-70-SF', '시스템창', '39mm', '그린+투명+로이(AR+단열)', 1500, 500, '1V1F', '-', 'O'),
      wprod(6, '침실3확장부', 'BF-250BH', 'SF-115WG', '이중창', '26mm', '투명+로이, 그린+로이(AR+단열)', 1500, 1300, '2W', 'SUS', '자동'),
      wprod(7, '거실분합', 'BF-225WAJH', 'SF-115WG', '공틀', '26mm', '투명+로이(AR+단열)', 3000, 2300, '3W', '-', '양방향'),
      wprod(8, '안방분합', 'BF-225WAJH', 'SF-115WG', '공틀', '26mm', '투명+로이(AR+단열)', 2200, 2300, '2W(U/B)', '-', '양방향'),
      wprod(9, '침실2내창', 'BF-225BH', 'SF-115WG', '이중창', '26mm', '투명+로이, 투명+로이(AR+단열)', 1200, 1200, '2W', '-', '자동'),
    ],
    externalWindowProducts: [
      wprod(1, '거실발코니', 'BF-120BH', 'SF-115WG', '발코니단창', '26mm', '그린+로이(AR+단열)', 3000, 2200, '3W', 'SUS', '자동'),
      wprod(2, '안방발코니', 'BF-120BH', 'SF-115WG', '발코니단창', '26mm', '그린+로이(AR+단열)', 2400, 2200, '2W(U/B)', 'SUS', '자동'),
      wprod(3, '다용도실1', 'BF-120BH', 'SF-115WG', '발코니단창', '26mm', '그린+로이(AR+단열)', 1000, 1300, '2W', 'SUS', '자동'),
      wprod(4, '다용도실2', 'TT-70-BF', 'EW-70-SF', '시스템창', '39mm', '그린+투명+로이(AR+단열)', 1500, 1300, '1V1F', '-', 'O'),
      wprod(5, '주방창', 'TT-70-BF', 'EW-70-SF', '시스템창', '39mm', '그린+투명+로이(AR+단열)', 1500, 500, '1V1F', '-', 'O'),
      wprod(6, '침실3확장부', 'BF-250BH', 'SF-115WG', '이중창', '26mm', '투명+로이, 그린+로이(AR+단열)', 1500, 1300, '2W', 'SUS', '자동'),
    ],
  },
  {
    key: '30',
    label: '30평대',
    externalPrice: 5000000,
    fullPrice: 7400000,
    fullWindowProducts: [
      wprod(1, '거실발코니', 'BF-120BH', 'SF-115WG', '발코니단창', '26mm', '그린+로이(AR+단열)', 3300, 2200, '3W', 'SUS', '자동'),
      wprod(2, '안방발코니', 'BF-120BH', 'SF-115WG', '발코니단창', '26mm', '그린+로이(AR+단열)', 2500, 2200, '2W(U/B)', 'SUS', '자동'),
      wprod(3, '다용도실1', 'BF-120BH', 'SF-115WG', '발코니단창', '26mm', '그린+로이(AR+단열)', 1000, 1300, '2W', 'SUS', '자동'),
      wprod(4, '다용도실2', 'TT-70-BF', 'EW-70-SF', '시스템창', '39mm', '그린+투명+로이(AR+단열)', 1500, 1300, '1V1F', '-', 'O'),
      wprod(5, '주방창', 'TT-70-BF', 'EW-70-SF', '시스템창', '39mm', '그린+투명+로이(AR+단열)', 1500, 500, '1V1F', '-', 'O'),
      wprod(6, '침실3확장부', 'BF-250BH', 'SF-115WG', '이중창', '26mm', '투명+로이, 그린+로이(AR+단열)', 1500, 1300, '2W', 'SUS', '자동'),
      wprod(7, '거실분합', 'BF-225WAJH', 'SF-115WG', '공틀', '26mm', '투명+로이(AR+단열)', 3300, 2300, '3W', '-', '양방향'),
      wprod(8, '안방분합', 'BF-225WAJH', 'SF-115WG', '공틀', '26mm', '투명+로이(AR+단열)', 2500, 2300, '2W(U/B)', '-', '양방향'),
      wprod(9, '침실2내창', 'BF-225BH', 'SF-115WG', '이중창', '26mm', '투명+로이, 투명+로이(AR+단열)', 1200, 1200, '2W', '-', '자동'),
    ],
    externalWindowProducts: [
      wprod(1, '거실발코니', 'BF-120BH', 'SF-115WG', '발코니단창', '26mm', '그린+로이(AR+단열)', 3300, 2200, '3W', 'SUS', '자동'),
      wprod(2, '안방발코니', 'BF-120BH', 'SF-115WG', '발코니단창', '26mm', '그린+로이(AR+단열)', 2500, 2200, '2W(U/B)', 'SUS', '자동'),
      wprod(3, '다용도실1', 'BF-120BH', 'SF-115WG', '발코니단창', '26mm', '그린+로이(AR+단열)', 1000, 1300, '2W', 'SUS', '자동'),
      wprod(4, '다용도실2', 'TT-70-BF', 'EW-70-SF', '시스템창', '39mm', '그린+투명+로이(AR+단열)', 1500, 1300, '1V1F', '-', 'O'),
      wprod(5, '주방창', 'TT-70-BF', 'EW-70-SF', '시스템창', '39mm', '그린+투명+로이(AR+단열)', 1500, 500, '1V1F', '-', 'O'),
      wprod(6, '침실3확장부', 'BF-250BH', 'SF-115WG', '이중창', '26mm', '투명+로이, 그린+로이(AR+단열)', 1500, 1300, '2W', 'SUS', '자동'),
    ],
  },
  {
    key: '40',
    label: '40평대',
    externalPrice: 7600000,
    fullPrice: 11000000,
    fullWindowProducts: [
      wprod(1, '거실발코니', 'BF-120BH', 'SF-115WG', '발코니단창', '26mm', '그린+로이(AR+단열)', 3400, 2200, '3W', 'SUS', '자동'),
      wprod(2, '안방발코니', 'BF-120BH', 'SF-115WG', '발코니단창', '26mm', '그린+로이(AR+단열)', 2200, 2200, '2W(U/B)', 'SUS', '자동'),
      wprod(3, '침실2발코니', 'BF-120BH', 'SF-115WG', '발코니단창', '26mm', '그린+로이(AR+단열)', 2200, 2200, '2W', 'SUS', '자동'),
      wprod(4, '침실3발코니', 'BF-120BH', 'SF-115WG', '발코니단창', '26mm', '그린+로이(AR+단열)', 2200, 2200, '2W', 'SUS', '자동'),
      wprod(5, '침실4발코니', 'BF-120BH', 'SF-115WG', '발코니단창', '26mm', '그린+로이(AR+단열)', 2200, 1300, '2W', 'SUS', '자동'),
      wprod(6, '다용도실', 'TT-70-BF', 'EW-70-SF', '시스템창', '39mm', '그린+투명+로이(AR+단열)', 1500, 1300, '1V1F', '-', 'O'),
      wprod(7, '거실분합', 'BF-225WAJH', 'SF-115WG', '공틀', '26mm', '투명+로이(AR+단열)', 3000, 2300, '3W', '-', '양방향'),
      wprod(8, '안방분합', 'BF-225WAJH', 'SF-115WG', '공틀', '26mm', '투명+로이(AR+단열)', 2200, 2300, '2W', '-', '양방향'),
      wprod(9, '침실2분합', 'BF-225WAJH', 'SF-115WG', '공틀', '26mm', '투명+로이(AR+단열)', 2200, 2300, '2W', '-', '양방향'),
      wprod(10, '침실3분합', 'BF-225WAJH', 'SF-115WG', '공틀', '26mm', '투명+로이(AR+단열)', 2200, 2300, '2W', '-', '양방향'),
      wprod(11, '주방분합', 'BF-225WAJH', 'SF-115WG', '공틀', '26mm', '투명+로이(AR+단열)', 1500, 2300, '2W', '-', '양방향'),
      wprod(12, '침실4내창', 'BF-225BH', 'SF-115WG', '이중창', '26mm', '투명+로이, 투명+로이(AR+단열)', 1400, 1200, '2W', '-', '자동'),
    ],
    externalWindowProducts: [
      wprod(1, '거실발코니', 'BF-120BH', 'SF-115WG', '발코니단창', '26mm', '그린+로이(AR+단열)', 3400, 2200, '3W', 'SUS', '자동'),
      wprod(2, '안방발코니', 'BF-120BH', 'SF-115WG', '발코니단창', '26mm', '그린+로이(AR+단열)', 2200, 2200, '2W(U/B)', 'SUS', '자동'),
      wprod(3, '침실2발코니', 'BF-120BH', 'SF-115WG', '발코니단창', '26mm', '그린+로이(AR+단열)', 2200, 2200, '2W', 'SUS', '자동'),
      wprod(4, '침실3발코니', 'BF-120BH', 'SF-115WG', '발코니단창', '26mm', '그린+로이(AR+단열)', 2200, 2200, '2W', 'SUS', '자동'),
      wprod(5, '침실4발코니', 'BF-120BH', 'SF-115WG', '발코니단창', '26mm', '그린+로이(AR+단열)', 2200, 1300, '2W', 'SUS', '자동'),
      wprod(6, '다용도실', 'TT-70-BF', 'EW-70-SF', '시스템창', '39mm', '그린+투명+로이(AR+단열)', 1500, 1300, '1V1F', '-', 'O'),
    ],
  },
  {
    key: '50',
    label: '50평대',
    externalPrice: 8000000,
    fullPrice: 11300000,
    fullWindowProducts: [
      wprod(1, '거실발코니', 'BF-120BH', 'SF-115WG', '발코니단창', '26mm', '그린+로이(AR+단열)', 3800, 2200, '3W', 'SUS', '자동'),
      wprod(2, '안방발코니', 'BF-120BH', 'SF-115WG', '발코니단창', '26mm', '그린+로이(AR+단열)', 2600, 2200, '2W(U/B)', 'SUS', '자동'),
      wprod(3, '침실2발코니', 'BF-120BH', 'SF-115WG', '발코니단창', '26mm', '그린+로이(AR+단열)', 2200, 2200, '2W', 'SUS', '자동'),
      wprod(4, '침실3발코니', 'BF-120BH', 'SF-115WG', '발코니단창', '26mm', '그린+로이(AR+단열)', 2200, 2200, '2W', 'SUS', '자동'),
      wprod(5, '침실4발코니', 'BF-120BH', 'SF-115WG', '발코니단창', '26mm', '그린+로이(AR+단열)', 2200, 1300, '2W', 'SUS', '자동'),
      wprod(6, '다용도실', 'TT-70-BF', 'EW-70-SF', '시스템창', '39mm', '그린+투명+로이(AR+단열)', 1500, 1300, '1V1F', '-', 'O'),
      wprod(7, '거실분합', 'BF-225WAJH', 'SF-115WG', '공틀', '26mm', '투명+로이(AR+단열)', 3800, 2300, '3W', '-', '양방향'),
      wprod(8, '안방분합', 'BF-225WAJH', 'SF-115WG', '공틀', '26mm', '투명+로이(AR+단열)', 2600, 2300, '2W(U/B)', '-', '양방향'),
      wprod(9, '침실2분합', 'BF-225WAJH', 'SF-115WG', '공틀', '26mm', '투명+로이(AR+단열)', 2200, 2300, '2W', '-', '양방향'),
      wprod(10, '침실3분합', 'BF-225WAJH', 'SF-115WG', '공틀', '26mm', '투명+로이(AR+단열)', 2200, 2300, '2W', '-', '양방향'),
      wprod(11, '주방분합', 'BF-225WAJH', 'SF-115WG', '공틀', '26mm', '투명+로이(AR+단열)', 1500, 2300, '2W', '-', '양방향'),
      wprod(12, '침실4내창', 'BF-225BH', 'SF-115WG', '이중창', '26mm', '투명+로이, 투명+로이(AR+단열)', 1400, 1200, '2W', '-', '자동'),
    ],
    externalWindowProducts: [
      wprod(1, '거실발코니', 'BF-120BH', 'SF-115WG', '발코니단창', '26mm', '그린+로이(AR+단열)', 3800, 2200, '3W', 'SUS', '자동'),
      wprod(2, '안방발코니', 'BF-120BH', 'SF-115WG', '발코니단창', '26mm', '그린+로이(AR+단열)', 2600, 2200, '2W(U/B)', 'SUS', '자동'),
      wprod(3, '침실2발코니', 'BF-120BH', 'SF-115WG', '발코니단창', '26mm', '그린+로이(AR+단열)', 2200, 2200, '2W', 'SUS', '자동'),
      wprod(4, '침실3발코니', 'BF-120BH', 'SF-115WG', '발코니단창', '26mm', '그린+로이(AR+단열)', 2200, 2200, '2W', 'SUS', '자동'),
      wprod(5, '침실4발코니', 'BF-120BH', 'SF-115WG', '발코니단창', '26mm', '그린+로이(AR+단열)', 2200, 1300, '2W', 'SUS', '자동'),
      wprod(6, '다용도실', 'TT-70-BF', 'EW-70-SF', '시스템창', '39mm', '그린+투명+로이(AR+단열)', 1500, 1300, '1V1F', '-', 'O'),
    ],
  },
];
