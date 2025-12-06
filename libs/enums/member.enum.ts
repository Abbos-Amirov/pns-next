export enum MemberType {
	USER = 'USER',
	MEASURER = 'MEASURER',  // o'lchov oladigan
	ADMIN = 'ADMIN',
	INSTALLER = 'INSTALLER', // o'rnatadigan
}

export enum MemberStatus {
	ACTIVE = 'ACTIVE',
	BLOCK = 'BLOCK',
	DELETE = 'DELETE',
}

export enum MemberAuthType {
	PHONE = 'PHONE',
	EMAIL = 'EMAIL',
	TELEGRAM = 'TELEGRAM',
}
