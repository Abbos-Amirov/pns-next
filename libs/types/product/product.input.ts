import {
	ProductType,
	ProductStatus,
	ProductLocation,
	ProductMaterial,
	ProductGlassType,
	ProductOpenType,
	ProductCategory,
	ProductColor,
} from '../../enums/property.enum';

export interface ProductInput {
	productType: ProductType;
	productStatus: ProductStatus;
	productAddress: string;
	productTitle: string;
	productLocation: ProductLocation;
	productHeight: number;
	productWidth: number;
	productPrice: number;
	productMaterial: ProductMaterial;
	productGlassType: ProductGlassType;
	productOpenType: ProductOpenType;
	productCategory: ProductCategory;
	productColor: ProductColor;
	productImages: string[];
}

