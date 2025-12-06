import {
	ProductType,
	ProductStatus,
	ProductLocation,
	ProductMaterial,
	ProductGlassType,
	ProductOpenType,
	ProductCategory,
} from '../../enums/property.enum';

export interface ProductUpdate {
	_id: string;
	productType?: ProductType;
	productStatus?: ProductStatus;
	productLocation?: ProductLocation;
	productAddress?: string;
	productHeight?: number;
	productWidth?: number;
	productTitle?: string;
	productPrice?: number;
	productMaterial?: ProductMaterial;
	productGlassType?: ProductGlassType;
	productOpenType?: ProductOpenType;
	productCategory?: ProductCategory;
	productImages?: string[];
	productDesc?: string;
	// productRent backend'da ProductUpdate type'ida yo'q, shuning uchun olib tashlandi
	productItems?: number;
	productBarter?: boolean;
}

