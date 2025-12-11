import { TotalCounter } from '../product/property';

export interface Location {
	_id: string;
	locationName: string;
	address: string;
	description?: string;
	locationType?: string;
	latitude?: number;
	longitude?: number;
	locationViews: number;
	locationLikes: number;
	images?: string[];
	memberId: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface Locations {
	list: Location[];
	metaCounter: TotalCounter[];
}


