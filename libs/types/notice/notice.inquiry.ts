import { NoticeCategory, NoticeCategoryType, NoticeStatus } from '../../enums/notice.enum';
import { Direction } from '../../enums/common.enum';

interface NoticeSearch {
	noticeCategory?: NoticeCategory;
	noticeCategoryType?: NoticeCategoryType;
	noticeStatus?: NoticeStatus;
	text?: string;
}

export interface NoticeInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search?: NoticeSearch;
}

