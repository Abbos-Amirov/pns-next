export enum PropertyType {
	APARTMENT = 'APARTMENT',
	VILLA = 'VILLA',
	HOUSE = 'HOUSE',
	OFFICE = 'OFFICE',
	STORE = 'STORE',
	FACTORY = 'FACTORY',
}

export enum PropertyStatus {
	ACTIVE = 'ACTIVE',
	SOLD = 'SOLD',
	DELETE = 'DELETE',
}

export enum PropertyLocation {
	SEOUL = 'SEOUL',
	BUSAN = 'BUSAN',
	INCHEON = 'INCHEON',
	DAEGU = 'DAEGU',
	GYEONGJU = 'GYEONGJU',
	GWANGJU = 'GWANGJU',
	CHONJU = 'CHONJU',
	DAEJON = 'DAEJON',
	JEJU = 'JEJU',
}

// === PRODUCT TYPE ===
export enum ProductType {
	DOOR = 'DOOR',          // Eshik
	WINDOW = 'WINDOW',      // Deraza
}

// === PRODUCT MATERIAL ===
export enum ProductMaterial {
	ALUMINUM = 'ALUMINUM',  // Alyuminiy material
	PVC = 'PVC',            // Plastik (PVC) material
	WOOD = 'WOOD',          // Yog'och material
	STEEL = 'STEEL',        // Po'lat (metall) material
	GLASS = 'GLASS',        // Shisha material (faqat oynaviy qism uchun)
}

// === PRODUCT COLOR ===
export enum ProductColor {
	WHITE = 'WHITE',        // Oq rang
	BLACK = 'BLACK',        // Qora rang
	GRAY = 'GRAY',          // Kulrang
	BROWN = 'BROWN',        // Jigarrang
	SILVER = 'SILVER',      // Kumushrang (metallik)
	BRONZE = 'BRONZE',      // Bronza (mis rangli)
}

// === PRODUCT GLASS TYPE ===
export enum ProductGlassType {
	SINGLE = 'SINGLE',      // Yagona qatlamli shisha
	DOUBLE = 'DOUBLE',      // Ikkitalik (2 qatlamli) shisha
	TRIPLE = 'TRIPLE',      // Uch qatlamli shisha
	TEMPERED = 'TEMPERED',  // Mustahkamlangan (temperli) shisha
	LOW_E = 'LOW_E',        // Energiya tejovchi (Low-E) shisha turi
}

// === PRODUCT OPEN TYPE ===
export enum ProductOpenType {
	SLIDING = 'SLIDING',    // Sürmeli — suriladigan eshik/deraza
	SWING = 'SWING',        // Ochiladigan (kapotli) eshik/deraza
	FIXED = 'FIXED',        // Qimirlamaydigan, o'rnatilgan (masalan, vitrina)
	FOLDING = 'FOLDING',    // Bukiladigan (akordeon tipidagi)
}

// === PRODUCT STATUS ===
export enum ProductStatus {
	ACTIVE = 'ACTIVE',        // Sotuvda bor
	OUT_OF_STOCK = 'OUT_OF_STOCK',  // Tugagan, mavjud emas
	DELETE = 'DELETE',  // Ishlab chiqarish to'xtatilgan
	CUSTOM_ORDER = 'CUSTOM_ORDER',  // Buyurtma asosida tayyorlanadi
}

// === PRODUCT CATEGORY ===
export enum ProductCategory {
	INTERIOR = 'INTERIOR',  // Ichki (xonaning ichki qismi uchun)
	EXTERIOR = 'EXTERIOR',  // Tashqi (binoning tashqi qismi uchun)
	BALCONY = 'BALCONY',    // Balkon yoki veranda uchun
	OFFICE = 'OFFICE',      // Ofis yoki tijoriy joylar uchun
}

// === PRODUCT LOCATION ===
export enum ProductLocation {
	SEOUL = 'SEOUL',
	BUSAN = 'BUSAN',
	INCHEON = 'INCHEON',
	DAEGU = 'DAEGU',
	DAEJEON = 'DAEJEON',
	GWANGJU = 'GWANGJU',
	ULSAN = 'ULSAN',
	SUWON = 'SUWON',
	CHEONAN = 'CHEONAN',
	JEJU = 'JEJU',
	OTHER = 'OTHER', // boshqa joylar uchun
}
