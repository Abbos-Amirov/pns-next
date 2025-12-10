import React, { useEffect } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Stack } from '@mui/material';
import MemberMenu from '../../libs/components/member/MemberMenu';
import MemberProperties from '../../libs/components/member/MemberProperties';
import { useRouter } from 'next/router';
import MemberFollowers from '../../libs/components/member/MemberFollowers';
import MemberArticles from '../../libs/components/member/MemberArticles';
import { useReactiveVar, useMutation } from '@apollo/client';
import { sweetErrorHandling, sweetTopSuccessAlert } from '../../libs/sweetAlert';
import MemberFollowings from '../../libs/components/member/MemberFollowings';
import { userVar } from '../../apollo/store';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { SUBSCRIBE, UNSUBSCRIBE } from '../../apollo/user/mutation';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const MemberPage: NextPage = () => {
	const device = useDeviceDetect();
	const router = useRouter();
	const category: any = router.query?.category;
	const user = useReactiveVar(userVar);

	/** APOLLO REQUESTS **/

	/** LIFECYCLES **/
	useEffect(() => {
		if (!router.isReady) return;
		if (!category) {
			router.replace(
				{
					pathname: router.pathname,
					query: { ...router.query, category: 'properties' },
				},
				undefined,
				{ shallow: true },
			);
		}
	}, [category, router]);

	/** APOLLO MUTATIONS **/
	const [subscribe, { loading: subscribeLoading }] = useMutation(SUBSCRIBE, {
		onCompleted: (data) => {
			if (data?.subscribe) {
				sweetTopSuccessAlert('Successfully followed!', 700).then();
			}
		},
		onError: (err) => {
			console.error('Subscribe Mutation Error:', err);
			sweetErrorHandling(err).then();
		},
	});

	const [unsubscribe, { loading: unsubscribeLoading }] = useMutation(UNSUBSCRIBE, {
		onCompleted: (data) => {
			if (data?.unsubscribe) {
				sweetTopSuccessAlert('Successfully unfollowed!', 700).then();
			}
		},
		onError: (err) => {
			console.error('Unsubscribe Mutation Error:', err);
			sweetErrorHandling(err).then();
		},
	});

	/** HANDLERS **/
	const subscribeHandler = async (id: string, refetch: any, query: any) => {
		if (!user?._id) {
			sweetTopSuccessAlert('Please login to follow members', 700).then();
			return;
		}

		if (!id) {
			sweetTopSuccessAlert('Member ID is missing', 700).then();
			return;
		}

		try {
			await subscribe({
				variables: {
					input: id,
				},
			});
			
			// Refetch member data to update follow status
			if (refetch) {
				await refetch();
			}
		} catch (err: any) {
			console.error('Error subscribing:', err);
			sweetErrorHandling(err).then();
		}
	};

	const unsubscribeHandler = async (id: string, refetch: any, query: any) => {
		if (!user?._id) {
			sweetTopSuccessAlert('Please login to unfollow members', 700).then();
			return;
		}

		if (!id) {
			sweetTopSuccessAlert('Member ID is missing', 700).then();
			return;
		}

		try {
			await unsubscribe({
				variables: {
					input: id,
				},
			});
			
			// Refetch member data to update follow status
			if (refetch) {
				await refetch();
			}
		} catch (err: any) {
			console.error('Error unsubscribing:', err);
			sweetErrorHandling(err).then();
		}
	};

	const redirectToMemberPageHandler = async (memberId: string) => {
		try {
			if (memberId === user?._id) await router.push(`/mypage?memberId=${memberId}`);
			else await router.push(`/member?memberId=${memberId}`);
		} catch (error) {
			await sweetErrorHandling(error);
		}
	};

	if (device === 'mobile') {
		return <>MEMBER PAGE MOBILE</>;
	} else {
		return (
			<div id="member-page" style={{ position: 'relative' }}>
				<div className="container">
					<Stack className={'member-page'}>
						<Stack className={'back-frame'}>
							<Stack className={'left-config'}>
								<MemberMenu subscribeHandler={subscribeHandler} unsubscribeHandler={unsubscribeHandler} />
							</Stack>
							<Stack className="main-config" mb={'76px'}>
								<Stack className={'list-config'}>
									{category === 'properties' && <MemberProperties />}
									{category === 'followers' && (
										<MemberFollowers
											subscribeHandler={subscribeHandler}
											unsubscribeHandler={unsubscribeHandler}
											redirectToMemberPageHandler={redirectToMemberPageHandler}
										/>
									)}
									{category === 'followings' && (
										<MemberFollowings
											subscribeHandler={subscribeHandler}
											unsubscribeHandler={unsubscribeHandler}
											redirectToMemberPageHandler={redirectToMemberPageHandler}
										/>
									)}
									{category === 'articles' && <MemberArticles />}
								</Stack>
							</Stack>
						</Stack>
					</Stack>
				</div>
			</div>
		);
	}
};

export default withLayoutBasic(MemberPage);
