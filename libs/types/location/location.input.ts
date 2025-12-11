import { Direction } from '../../enums/common.enum';

interface LocationsSearch {
	// Add search fields here if needed
}

export interface LocationsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: LocationsSearch;
}

