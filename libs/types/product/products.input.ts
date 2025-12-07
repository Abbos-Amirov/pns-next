import { ProductLocation, ProductStatus } from '../../enums/property.enum';
import { Direction } from '../../enums/common.enum';

interface ProductsSearch {
	productStatus?: ProductStatus;
	locationList?: ProductLocation[]; // Backend'da PISearch type'ida locationList deb nomlangan
	text?: string; // Search text
	pricesRange?: { start: number; end: number }; // Price range filter
	productType?: string[]; // Product type filter (DOOR, WINDOW)
}

export interface ProductsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: ProductsSearch;
}

