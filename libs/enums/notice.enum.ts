export enum NoticeCategory {
	FAQ = 'FAQ',
	TERMS = 'TERMS',
	INQUIRY = 'INQUIRY',
}

export enum NoticeStatus {
	HOLD = 'HOLD',
	ACTIVE = 'ACTIVE',
	DELETE = 'DELETE',
}

export enum NoticeCategoryType {
	PRODUCT = 'PRODUCT',                 // Eshik/deraza mahsulotlari haqida e'lon
	LOCATION = 'LOCATION',               // Shaharlar/filiallar haqida e'lon
	MEASURER = 'MEASURER',               // Razmer oluvchilar uchun e'lon
	INSTALLER = 'INSTALLER',             // O'rnatadigan ustalar uchun e'lon
	MEMBERS = 'MEMBERS',                 // Oddiy userlar uchun e'lon
	SYSTEM = 'SYSTEM',                   // Platforma yangilanishlari / umumiy e'lonlar
	COMMUNITY = 'COMMUNITY',             // Foydalanuvchilar uchun umumiy postlar
	OTHER = 'OTHER',                     // Boshqa turdagi e'lonlar
}
