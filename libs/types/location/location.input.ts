import { Direction } from '../../enums/common.enum';
import { PropertyType } from '../../enums/property.enum';
import { LocationType } from '../../enums/location.enum';

interface LocationsSearch {
	text?: string;
	typeList?: PropertyType[];
}

export interface LocationsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: LocationsSearch;
}

export interface CreateLocationInput {
	locationName: string;
	address: string;
	description?: string;
	locationType: LocationType;
	latitude: number;
	longitude: number;
	images?: string[];
}

export interface LocationUpdateInput {
	_id: string;
	locationName?: string;
	address?: string;
	description?: string;
	locationType?: LocationType;
	latitude?: number;
	longitude?: number;
	images?: string[];
}

