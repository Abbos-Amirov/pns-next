import { NoticeCategory, NoticeCategoryType, NoticeStatus } from '../../enums/notice.enum';

export interface CreateNoticeInput {
	noticeCategory: NoticeCategory;
	noticeStatus: NoticeStatus;
	noticeCategoryType: NoticeCategoryType;
	noticeTitle: string;
	noticeContent: string;
}


