/** Nationwide PNS offices — keys map to `common.json` i18n strings. */
export type AboutOfficeDef = {
	id: string;
	titleKey: string;
	addressKey: string;
	telKey: string;
	mapUrlKey: string;
};

export function getAboutOfficeById(id: string): AboutOfficeDef | undefined {
	return ABOUT_OFFICES.find((o) => o.id === id);
}

export const ABOUT_OFFICES: AboutOfficeDef[] = [
	{
		id: 'seoul',
		titleKey: 'AboutOfficeSeoulTitle',
		addressKey: 'AboutOfficeSeoulAddress',
		telKey: 'AboutOfficeSeoulTel',
		mapUrlKey: 'AboutOfficeSeoulMapUrl',
	},
	{
		id: 'busanFactory',
		titleKey: 'AboutOfficeBusanFactoryTitle',
		addressKey: 'AboutOfficeBusanFactoryAddress',
		telKey: 'AboutOfficeBusanFactoryTel',
		mapUrlKey: 'AboutOfficeBusanFactoryMapUrl',
	},
	{
		id: 'cheonan',
		titleKey: 'AboutOfficeCheonanTitle',
		addressKey: 'AboutOfficeCheonanAddress',
		telKey: 'AboutOfficeCheonanTel',
		mapUrlKey: 'AboutOfficeCheonanMapUrl',
	},
	{
		id: 'busanBranch',
		titleKey: 'AboutOfficeBusanBranchTitle',
		addressKey: 'AboutOfficeBusanBranchAddress',
		telKey: 'AboutOfficeBusanBranchTel',
		mapUrlKey: 'AboutOfficeBusanBranchMapUrl',
	},
	{
		id: 'daejeon',
		titleKey: 'AboutOfficeDaejeonTitle',
		addressKey: 'AboutOfficeDaejeonAddress',
		telKey: 'AboutOfficeDaejeonTel',
		mapUrlKey: 'AboutOfficeDaejeonMapUrl',
	},
	{
		id: 'jeonju',
		titleKey: 'AboutOfficeJeonjuTitle',
		addressKey: 'AboutOfficeJeonjuAddress',
		telKey: 'AboutOfficeJeonjuTel',
		mapUrlKey: 'AboutOfficeJeonjuMapUrl',
	},
	{
		id: 'pocheon',
		titleKey: 'AboutOfficePocheonTitle',
		addressKey: 'AboutOfficePocheonAddress',
		telKey: 'AboutOfficePocheonTel',
		mapUrlKey: 'AboutOfficePocheonMapUrl',
	},
	{
		id: 'gwangju',
		titleKey: 'AboutOfficeGwangjuTitle',
		addressKey: 'AboutOfficeGwangjuAddress',
		telKey: 'AboutOfficeGwangjuTel',
		mapUrlKey: 'AboutOfficeGwangjuMapUrl',
	},
	{
		id: 'jeju',
		titleKey: 'AboutOfficeJejuTitle',
		addressKey: 'AboutOfficeJejuAddress',
		telKey: 'AboutOfficeJejuTel',
		mapUrlKey: 'AboutOfficeJejuMapUrl',
	},
];
