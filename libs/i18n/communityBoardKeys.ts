/** i18n key helpers for community board category (FREE / RECOMMEND / NEWS / HUMOR) */

export function communityBoardTitleKey(cat: string | undefined): string {
	const c = (cat || 'FREE').toUpperCase();
	if (c === 'RECOMMEND') return 'CommunityBoardTitleRECOMMEND';
	if (c === 'NEWS') return 'CommunityBoardTitleNEWS';
	if (c === 'HUMOR') return 'CommunityBoardTitleHUMOR';
	return 'CommunityBoardTitleFREE';
}

export function communitySubKey(cat: string | undefined): string {
	const c = (cat || 'FREE').toUpperCase();
	if (c === 'RECOMMEND') return 'CommunitySubRECOMMEND';
	if (c === 'NEWS') return 'CommunitySubNEWS';
	if (c === 'HUMOR') return 'CommunitySubHUMOR';
	return 'CommunitySubFREE';
}
