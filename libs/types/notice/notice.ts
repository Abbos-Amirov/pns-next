import { NoticeCategory, NoticeCategoryType, NoticeStatus } from '../../enums/notice.enum';

export interface Notice {
	_id: string;
	noticeCategory: NoticeCategory;
	noticeCategoryType: NoticeCategoryType;
	noticeStatus: NoticeStatus;
	noticeTitle: string;
	noticeContent: string;
	createdAt: string;
	updatedAt: string;
}


