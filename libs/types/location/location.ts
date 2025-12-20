import { TotalCounter } from '../product/property';
import { LocationCity } from '../../enums/location-city.enum';

export interface Location {
	_id: string;
	locationName: string;
	locationCity?: LocationCity;
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


