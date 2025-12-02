import { NoticeCategory, NoticeCategoryType, NoticeStatus } from '../../enums/notice.enum';

export interface UpdateNoticeInput {
	_id: string;
	noticeCategory?: NoticeCategory;
	noticeStatus?: NoticeStatus;
	noticeCategoryType?: NoticeCategoryType;
	noticeTitle?: string;
	noticeContent?: string;
}

