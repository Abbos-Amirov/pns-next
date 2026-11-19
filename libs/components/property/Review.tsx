import React from 'react';
import { Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Comment } from '../../types/comment/comment';
import { REACT_APP_API_URL } from '../../config';
import Moment from 'react-moment';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';

interface ReviewProps {
	comment: Comment;
}

const Review = (props: ReviewProps) => {
	const { comment } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [value, setValue] = React.useState<number | null>(2);
	const imagePath: string = comment?.memberData?.memberImage
		? `${REACT_APP_API_URL}/${comment?.memberData?.memberImage}`
		: '/img/profile/defaultUser.svg';

	const displayName =
		comment?.memberData?.memberNick ||
		comment?.memberData?.memberFullName ||
		(comment?.memberId ? `User (${String(comment.memberId).slice(-6)})` : 'User');

	/** HANDLERS **/
	const goMemberPage = (id: string) => {
		if (id === user?._id) router.push('/mypage');
		else router.push(`/member?memberId=${id}`);
	};
	if (device === 'mobile') {
		return (
			<div className={'review-mobile-card mobile-card'}>
				<div className={'review-mobile-top'}>
					<img src={imagePath} alt={''} className={'review-mobile-avatar'} />
					<div className={'review-mobile-meta'}>
						<span
							className={'review-mobile-name'}
							onClick={() => {
								const memberId = comment?.memberData?._id || comment?.memberId;
								if (memberId) goMemberPage(memberId as string);
							}}
						>
							{displayName}
						</span>
						<span className={'review-mobile-date'}>
							<Moment format={'DD MMMM, YYYY'}>{comment.createdAt}</Moment>
						</span>
					</div>
				</div>
				<p className={'review-mobile-text'}>{comment.commentContent}</p>
			</div>
		);
	} else {
		return (
			<Stack className={'review-config'}>
				<Stack className={'review-mb-info'}>
					<Stack className={'img-name-box'}>
						<img src={imagePath} alt="" className={'img-box'} />
						<Stack>
							<Typography
								className={'name'}
								onClick={() => {
									const memberId = comment?.memberData?._id || comment?.memberId;
									if (memberId) goMemberPage(memberId as string);
								}}
							>
								{displayName}
							</Typography>
							<Typography className={'date'}>
								<Moment format={'DD MMMM, YYYY'}>{comment.createdAt}</Moment>
							</Typography>
						</Stack>
					</Stack>
				</Stack>
				<Stack className={'desc-box'}>
					<Typography className={'description'}>{comment.commentContent}</Typography>
				</Stack>
			</Stack>
		);
	}
};

export default Review;
