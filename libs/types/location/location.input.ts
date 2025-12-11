import { Direction } from '../../enums/common.enum';
import { PropertyType } from '../../enums/property.enum';

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

