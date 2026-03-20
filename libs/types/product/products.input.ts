import { ProductLocation, ProductMaterial, ProductStatus } from '../../enums/property.enum';
import { Direction } from '../../enums/common.enum';

interface ProductsSearch {
	productStatus?: ProductStatus;
	locationList?: ProductLocation[]; // Backend'da PISearch type'ida locationList deb nomlangan
	text?: string; // Search text
	pricesRange?: { start: number; end: number }; // Price range filter
	productType?: string[]; // Product type filter (DOOR, WINDOW)
	typeList?: string[]; // Backend ba'zan typeList kutadi (DOOR, WINDOW)
	productMaterial?: ProductMaterial; // Product material filter (ALUMINUM, PVC, WOOD, STEEL, GLASS)
	memberId?: string; // Filter by member/agent
}

export interface ProductsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: ProductsSearch;
}

