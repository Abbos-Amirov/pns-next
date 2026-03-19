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
  priceValue: number; // KRW
  hex: string;
  isDefault?: boolean;
}

export interface DoorModalGalleryItem {
  label: string;
  image: string;
}

export interface DoorOption {
  name: string;
  priceModifier: string;
  priceValue: number; // KRW
  /** Hex color for fallback swatch when no image */
  hex?: string;
  isDefault?: boolean;
  /** Circular thumbnail image URL */
  thumbnail?: string;
  /** Modal content (null = no 더보기 for "없음") */
  modal?: {
    title: string;
    subtitle?: string;
    heroImage: string;
    description?: string;
    gallery?: DoorModalGalleryItem[];
  };
}

export interface ExtraOption {
  name: string;
  priceModifier: string;
  priceValue: number; // KRW, 0 for 상담시문의
}

export const WINDOW_PRICING_TITLE = '와이드뷰';
export const WINDOW_PRICING_SUBTITLE = '에너지 성능은 기본 리모델링 최적화 시스템';
export const PRICE_NOTICE = '창호기준표 창호수량과 사이즈변동에 따라 가격이 상이할 수 있음';
export const VAT_NOTE = '(VAT포함, 변동금액)';
export const BOTTOM_NOTE = '평균 금액으로 실측 후 현장 상황에 따라 비용이 변동될 수 있습니다.';

export const COLOR_OPTIONS: ColorOption[] = [
  { name: 'White', priceModifier: '기본', priceValue: 0, hex: '#f2f2f2', isDefault: true },
  { name: 'US201', priceModifier: '+1,000,000', priceValue: 1000000, hex: '#e7d5bf' },
  { name: 'MQ808', priceModifier: '+1,000,000', priceValue: 1000000, hex: '#cbb79c' },
];

export const GLASS_SPEC = {
  default: '26T 로이',
  note: '아르곤 가스등의 기타 사양은 옵션으로 추가할 수 있음.',
  hex: '#b8dce8', // light blue/translucent Low-E
};

const DOOR_BASE = '/img/configurator/doors';
const DOOR_HEX: Record<string, string> = {
  없음: '#f8f9fb',
  블랙: '#1b1b1f',
  화이트: '#f2f2f2',
  그레이: '#7d828a',
};

const GALLERY_3연동 = [
  { label: '일반형', image: `${DOOR_BASE}/inner_3_option1_1.png` },
  { label: '고시형', image: `${DOOR_BASE}/inner_3_option2.png` },
  { label: '스틱바형', image: `${DOOR_BASE}/inner_3_option3.png` },
];

const GALLERY_파티션 = [
  { label: '일반형', image: `${DOOR_BASE}/partition.png` },
  { label: '고시형', image: `${DOOR_BASE}/inner_3_option2.png` },
  { label: '스틱바형', image: `${DOOR_BASE}/inner_3_option3.png` },
];

export const DOOR_OPTIONS: DoorOption[] = [
  { name: '없음', priceModifier: '기본', priceValue: 0, hex: '#f8f9fb', isDefault: true },
  {
    name: '3연동 중문 블랙',
    priceModifier: '+900,000',
    priceValue: 900000,
    hex: DOOR_HEX.블랙,
    thumbnail: `${DOOR_BASE}/inner_3_black.png`,
    modal: {
      title: '3연동 중문',
      subtitle: '블랙',
      heroImage: `${DOOR_BASE}/inner_3_black.png`,
      description: '슬림한 블랙 프레임과 투명 유리가 어우러진 3연동 중문입니다. 미니멀한 실내 인테리어에 잘 어울리며, 개방감과 프라이버시를 동시에 확보할 수 있습니다.',
      gallery: GALLERY_3연동,
    },
  },
  {
    name: '3연동 중문 화이트',
    priceModifier: '+900,000',
    priceValue: 900000,
    hex: DOOR_HEX.화이트,
    thumbnail: `${DOOR_BASE}/inner_3_white.png`,
    modal: {
      title: '3연동 중문',
      subtitle: '화이트',
      heroImage: `${DOOR_BASE}/inner_3_white.png`,
      description: '화이트 프레임의 깔끔한 3연동 중문으로 밝고 넓은 느낌을 줍니다. 현대적인 주거 공간에 잘 어울리는 디자인입니다.',
      gallery: GALLERY_3연동,
    },
  },
  {
    name: '3연동 중문 그레이',
    priceModifier: '+900,000',
    priceValue: 900000,
    hex: DOOR_HEX.그레이,
    thumbnail: `${DOOR_BASE}/inner_3_gray.png`,
    modal: {
      title: '3연동 중문',
      subtitle: '그레이',
      heroImage: `${DOOR_BASE}/inner_3_gray.png`,
      description: '그레이 톤 프레임으로 차분하고 세련된 분위기를 연출합니다. 다양한 인테리어 스타일과 조화를 이룹니다.',
      gallery: GALLERY_3연동,
    },
  },
  {
    name: '3연동 중문 ㄱ자 파티션 블랙',
    priceModifier: '+1,500,000',
    priceValue: 1500000,
    hex: DOOR_HEX.블랙,
    thumbnail: `${DOOR_BASE}/partition.png`,
    modal: {
      title: '3연동 중문 ㄱ자 파티션',
      subtitle: '블랙',
      heroImage: `${DOOR_BASE}/partition.png`,
      description: 'ㄱ자 형태의 파티션형 3연동 중문. 공간 분리와 시각적 연결을 동시에 만족시키는 실용적인 디자인입니다.',
      gallery: GALLERY_파티션,
    },
  },
  {
    name: '3연동 중문 ㄱ자 파티션 화이트',
    priceModifier: '+1,500,000',
    priceValue: 1500000,
    hex: DOOR_HEX.화이트,
    thumbnail: `${DOOR_BASE}/inner_3_white.png`,
    modal: {
      title: '3연동 중문 ㄱ자 파티션',
      subtitle: '화이트',
      heroImage: `${DOOR_BASE}/inner_3_white.png`,
      description: '화이트 ㄱ자 파티션 중문. 밝고 개방감 있는 공간 연출에 적합합니다.',
      gallery: GALLERY_파티션,
    },
  },
  {
    name: '3연동 중문 ㄱ자 파티션 그레이',
    priceModifier: '+1,500,000',
    priceValue: 1500000,
    hex: DOOR_HEX.그레이,
    thumbnail: `${DOOR_BASE}/inner_3_gray.png`,
    modal: {
      title: '3연동 중문 ㄱ자 파티션',
      subtitle: '그레이',
      heroImage: `${DOOR_BASE}/inner_3_gray.png`,
      description: '그레이 ㄱ자 파티션 중문. 중성적인 색감으로 다양한 인테리어와 조화를 이룹니다.',
      gallery: GALLERY_파티션,
    },
  },
  {
    name: '원슬라이딩 블랙',
    priceModifier: '+1,200,000',
    priceValue: 1200000,
    hex: DOOR_HEX.블랙,
    thumbnail: `${DOOR_BASE}/onesliding_black.png`,
    modal: {
      title: '원슬라이딩',
      subtitle: '블랙',
      heroImage: `${DOOR_BASE}/onesliding_black.png`,
      description: '한쪽으로 열리는 원슬라이딩 도어. 공간 활용도가 뛰어나고 설치가 간편합니다.',
      gallery: [{ label: '일반형', image: `${DOOR_BASE}/onesliding_black.png` }],
    },
  },
  {
    name: '원슬라이딩 화이트',
    priceModifier: '+1,200,000',
    priceValue: 1200000,
    hex: DOOR_HEX.화이트,
    thumbnail: `${DOOR_BASE}/onesliding_white.png`,
    modal: {
      title: '원슬라이딩',
      subtitle: '화이트',
      heroImage: `${DOOR_BASE}/onesliding_white.png`,
      description: '화이트 원슬라이딩 도어. 밝고 깔끔한 인테리어에 잘 어울립니다.',
      gallery: [{ label: '일반형', image: `${DOOR_BASE}/onesliding_white.png` }],
    },
  },
  {
    name: '원슬라이딩 그레이',
    priceModifier: '+1,500,000',
    priceValue: 1500000,
    hex: DOOR_HEX.그레이,
    thumbnail: `${DOOR_BASE}/onesliding_gray.png`,
    modal: {
      title: '원슬라이딩',
      subtitle: '그레이',
      heroImage: `${DOOR_BASE}/onesliding_gray.png`,
      description: '그레이 원슬라이딩 도어. 차분한 분위기의 공간에 적합합니다.',
      gallery: [{ label: '일반형', image: `${DOOR_BASE}/onesliding_gray.png` }],
    },
  },
];

export const HANDLE_SPEC = {
  default: '리네아핸들',
  note: '핸들디자인, 크리센트 디자인 등 부속들은 사전 통지없이 변경될 수 있습니다.',
};

const HANDLE_BASE = '/img/configurator/handles';

export interface HandleOption {
  name: string;
  thumbnail: string;
  isDefault?: boolean;
}

export const HANDLE_OPTIONS: HandleOption[] = [
  { name: '리네아핸들', thumbnail: `${HANDLE_BASE}/handle1.png`, isDefault: true },
  { name: '블랙핸들', thumbnail: `${HANDLE_BASE}/handle2.png` },
  { name: '스테인리스핸들', thumbnail: `${HANDLE_BASE}/handle3.png` },
  { name: '도무스핸들', thumbnail: `${HANDLE_BASE}/handle4.png` },
  { name: '그립핸들', thumbnail: `${HANDLE_BASE}/handle5.png` },
  { name: '실버핸들', thumbnail: `${HANDLE_BASE}/handle6.png` },
  { name: '화이트핸들', thumbnail: `${HANDLE_BASE}/handle7.png` },
  { name: '클래식핸들', thumbnail: `${HANDLE_BASE}/handle8.png` },
];

export const MOSQUITO_SCREEN = ['SUS 방충망', '이탈방지구'];

export const FUNCTIONAL_MATERIAL = '클린범퍼';

const FUNC_BASE = '/img/configurator/functional';

export interface FunctionalOption {
  name: string;
  thumbnail: string;
  isDefault?: boolean;
}

export const FUNCTIONAL_OPTIONS: FunctionalOption[] = [
  { name: '클린범퍼', thumbnail: `${FUNC_BASE}/func1.png`, isDefault: true },
  { name: '소프트클로저', thumbnail: `${FUNC_BASE}/func2.png` },
  { name: '창개방제한기', thumbnail: `${FUNC_BASE}/func3.png` },
  { name: '그립핸들', thumbnail: `${FUNC_BASE}/func4.png` },
];

export const EXTRA_OPTIONS: ExtraOption[] = [
  { name: '루버창', priceModifier: '상담시문의', priceValue: 0 },
  { name: '윈드클로저', priceModifier: '+7,000', priceValue: 7000 },
  { name: '방충망 그립핸들', priceModifier: '+5,000', priceValue: 5000 },
  { name: '타일', priceModifier: '+300,000', priceValue: 300000 },
  { name: '단열재(아이소핑크)마감', priceModifier: '+300,000', priceValue: 300000 },
  { name: '사춤(조적미장)', priceModifier: '+500,000', priceValue: 500000 },
  { name: '몰딩(틀 당)', priceModifier: '+50,000', priceValue: 50000 },
  { name: '보양(주거세대)', priceModifier: '+300,000', priceValue: 300000 },
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
