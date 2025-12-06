import { ProductLocation, ProductStatus } from '../../enums/property.enum';
import { Direction } from '../../enums/common.enum';

interface ProductsSearch {
	productStatus?: ProductStatus;
	locationList?: ProductLocation[]; // Backend'da PISearch type'ida locationList deb nomlangan
}

export interface ProductsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: ProductsSearch;
}

