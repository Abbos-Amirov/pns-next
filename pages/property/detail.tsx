import React, { ChangeEvent, useEffect, useState } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import { NextPage } from 'next';
import Review from '../../libs/components/property/Review';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { Autoplay, Navigation, Pagination } from 'swiper';
import PropertyBigCard from '../../libs/components/common/PropertyBigCard';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';
import { useReactiveVar, useQuery, useMutation } from '@apollo/client';
import { useRouter } from 'next/router';
import { Product } from '../../libs/types/product/property';
import moment from 'moment';
import { formatterStr } from '../../libs/utils';
import { REACT_APP_API_URL } from '../../libs/config';
import { userVar } from '../../apollo/store';
import { GET_COMMENTS, GET_PRODUCT } from '../../apollo/user/query';
import { CREATE_COMMENT, LIKE_TARGET_PRODUCT } from '../../apollo/user/mutation';
import { sweetErrorHandling, sweetTopSuccessAlert } from '../../libs/sweetAlert';
import { CommentInput, CommentsInquiry } from '../../libs/types/comment/comment.input';
import { Comment } from '../../libs/types/comment/comment';
import { CommentGroup } from '../../libs/enums/comment.enum';
import { Pagination as MuiPagination } from '@mui/material';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import HeightIcon from '@mui/icons-material/Height';
import CategoryIcon from '@mui/icons-material/Category';
import PaletteIcon from '@mui/icons-material/Palette';
import ConstructionIcon from '@mui/icons-material/Construction';
import AspectRatioIcon from '@mui/icons-material/AspectRatio';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import 'swiper/css';
import 'swiper/css/pagination';

SwiperCore.use([Autoplay, Navigation, Pagination]);

/** Har bir mahsulot detail sahifasida ko‘rinadigan qo‘shimcha kichik rasmlar (mahsulot rasmlaridan keyin) */
const PRODUCT_DETAIL_EXTRA_THUMBNAILS: readonly string[] = [
	'/img/property/detail-gallery/extra-1.png',
	'/img/property/detail-gallery/extra-2.png',
	'/img/property/detail-gallery/extra-3.png',
	'/img/property/detail-gallery/extra-4.png',
	'/img/property/detail-gallery/extra-5.png',
	'/img/property/detail-gallery/extra-6.png',
	'/img/property/detail-gallery/extra-7.png',
	'/img/property/detail-gallery/extra-8.png',
	'/img/property/detail-gallery/extra-9.png',
];

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const PropertyDetail: NextPage = ({ initialComment, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [propertyId, setPropertyId] = useState<string | null>(null);
	type ProductDetail = Product & {
		productHeight?: number;
		productWidth?: number;
		productMaterial?: string;
		productGlassType?: string;
		productOpenType?: string;
		productCategory?: string;
		productColor?: string;
		productItems?: number;
	};

	const [property, setProperty] = useState<ProductDetail | null>(null);
	const [slideImage, setSlideImage] = useState<string>('');
	const [destinationProperty, setDestinationProperty] = useState<ProductDetail[]>([]);
	const [commentInquiry, setCommentInquiry] = useState<CommentsInquiry>(initialComment);
	const [propertyComments, setPropertyComments] = useState<Comment[]>([]);
	const [commentTotal, setCommentTotal] = useState<number>(0);
	const [insertCommentData, setInsertCommentData] = useState<CommentInput>({
		commentGroup: CommentGroup.PRODUCT,
		commentContent: '',
		commentRefId: '',
	});
	const [isLiked, setIsLiked] = useState<boolean>(false);

	/** APOLLO REQUESTS **/
	const { data: productData, loading: productLoading, error: productError } = useQuery(GET_PRODUCT, {
		variables: {
			input: propertyId || '',
		},
		skip: !propertyId,
		fetchPolicy: 'network-only',
		errorPolicy: 'all',
		onCompleted: (data) => {
			if (data?.getProduct) {
				const product: ProductDetail = data.getProduct;
				setProperty(product);
				// Set first image as slide image
				setSlideImage(product.productImages?.[0] || '');
				// backend-driven like state (USER ↔ PRODUCT relationship)
				setIsLiked(!!product?.meLiked?.[0]?.myFavorite);
			}
		},
		onError: (err) => {
			sweetErrorHandling(err).then();
		},
	});

	// Get Comments Query
	const {
		loading: commentsLoading,
		error: commentsError,
		refetch: refetchComments,
	} = useQuery(GET_COMMENTS, {
		variables: {
			input: commentInquiry,
		},
		skip: !commentInquiry?.search?.commentRefId,
		fetchPolicy: 'network-only',
		errorPolicy: 'all',
		onCompleted: (data) => {
			if (data?.getComments) {
				setPropertyComments(data.getComments.list || []);
				const metaCounter = data.getComments.metaCounter;
				const totalCount = Array.isArray(metaCounter) ? metaCounter?.[0]?.total || 0 : metaCounter?.total || 0;
				setCommentTotal(totalCount);
			}
		},
		onError: (err) => {
			console.error('GetComments Query Error:', err);
		},
	});

	// Create Comment Mutation
	const [createComment, { loading: createCommentLoading }] = useMutation(CREATE_COMMENT, {
		onCompleted: async (data) => {
			const createdRaw = data?.createComment as Comment | undefined;
			const created =
				createdRaw && !(createdRaw as any)?.memberData && user?._id
					? ({
							...createdRaw,
							memberData: {
								_id: user._id,
								memberNick: (user as any)?.memberNick,
								memberFullName: (user as any)?.memberFullName,
								memberImage: (user as any)?.memberImage,
							},
					  } as any as Comment)
					: createdRaw;

			// instant UI update (no reload)
			if (created) {
				setPropertyComments((prev) => {
					const next = [created, ...(prev || [])];
					// keep list size reasonable in UI (server is source of truth)
					return next.slice(0, commentInquiry.limit || 5);
				});
				setCommentTotal((prev) => (prev || 0) + 1);
			}

			setInsertCommentData((prev) => ({ ...prev, commentContent: '' }));

			// ensure the newest comment is visible
			setCommentInquiry((prev) => ({ ...prev, page: 1 }));

			// sync with backend list
			if (refetchComments && propertyId) {
				await refetchComments({
					input: {
						...commentInquiry,
						page: 1,
						search: { commentRefId: propertyId },
					},
				});
			}

			sweetTopSuccessAlert('Review submitted successfully!', 700).then();
		},
		onError: (err) => {
			console.error('CreateComment Mutation Error:', err);
			sweetErrorHandling(err).then();
		},
	});

	// Like Product Mutation
	const [likeTargetProduct, { loading: likeLoading }] = useMutation(LIKE_TARGET_PRODUCT, {
		onCompleted: (data) => {
			if (data?.likeTargetProduct) {
				const updated = data.likeTargetProduct as ProductDetail;
				const newLikedState = !!updated?.meLiked?.[0]?.myFavorite;
				setIsLiked(newLikedState);
				setProperty((prev) => {
					if (!prev) return prev;
					return {
						...prev,
						productLikes: updated.productLikes ?? prev.productLikes,
						meLiked: updated.meLiked ?? prev.meLiked,
					};
				});
				const message = newLikedState ? 'Product liked successfully!' : 'Product unliked successfully!';
				sweetTopSuccessAlert(message, 700).then();
			}
		},
		onError: (err) => {
			sweetErrorHandling(err).then();
		},
	});

	// Like Property Handler
	const likePropertyHandler = async (user: any, productId: string) => {
		if (!user?._id) {
			sweetTopSuccessAlert('Please login to like products', 700).then();
			return;
		}
		if (!property?._id || !productId) return;

		// backend-driven current state
		const prevMeLiked = property?.meLiked || [];
		const prevLikedState = !!property?.meLiked?.[0]?.myFavorite;
		const prevLikesCount = property?.productLikes || 0;

		// optimistic update
		const nextLikedState = !prevLikedState;
		setIsLiked(nextLikedState);
		setProperty((prev) => {
			if (!prev) return prev;
			return {
				...prev,
				productLikes: nextLikedState ? prevLikesCount + 1 : Math.max(0, prevLikesCount - 1),
				meLiked: nextLikedState ? [{ memberId: user._id, likeRefId: productId, myFavorite: true }] : [],
			};
		});

		try {
			const res = await likeTargetProduct({
				variables: {
					input: productId,
				},
			});
			// onCompleted handler sync qiladi (backend returned state)
			void res;
		} catch (err) {
			console.error('Like error: ', err);
			// revert
			setIsLiked(prevLikedState);
			setProperty((prev) => {
				if (!prev) return prev;
				return {
					...prev,
					productLikes: prevLikesCount,
					meLiked: prevMeLiked,
				};
			});
			sweetErrorHandling(err).then();
		}
	};

	/** LIFECYCLES **/
	useEffect(() => {
		if (router.query.id) {
			const newPropertyId = router.query.id as string;
			setPropertyId(newPropertyId);
			setSlideImage(''); // Reset slide image when property changes
			setProperty(null); // Reset property when property changes
			setIsLiked(false); // Reset isLiked when property changes
			setCommentInquiry((prev) => ({
				...prev,
				page: 1,
				search: {
					commentRefId: newPropertyId,
				},
			}));
			setInsertCommentData((prev) => ({
				...prev,
				commentGroup: CommentGroup.PRODUCT,
				commentRefId: newPropertyId,
			}));
		}
	}, [router.query.id]);

	// Update isLiked when property changes
	useEffect(() => {
		if (property?._id) {
			setIsLiked(!!property?.meLiked?.[0]?.myFavorite);
		}
	}, [property?._id, property?.meLiked]);

	useEffect(() => {}, [commentInquiry]);

	/** HANDLERS **/
	const changeImageHandler = (image: string) => {
		setSlideImage(image);
	};

	const commentPaginationChangeHandler = async (event: ChangeEvent<unknown>, value: number) => {
		commentInquiry.page = value;
		setCommentInquiry({ ...commentInquiry });
	};

	const createCommentHandler = async () => {
		if (!user?._id) {
			sweetTopSuccessAlert('Please login to leave a review', 700).then();
			return;
		}
		if (!propertyId) return;
		if (!insertCommentData.commentContent.trim()) {
			sweetTopSuccessAlert('Please enter a review', 700).then();
			return;
		}
		try {
			await createComment({
				variables: {
					input: {
						commentGroup: CommentGroup.PRODUCT,
						commentContent: insertCommentData.commentContent.trim(),
						commentRefId: propertyId,
					},
				},
			});
		} catch (err) {
			console.error('Create comment error:', err);
		}
	};

	if (device === 'mobile') {
		return <div>PROPERTY DETAIL PAGE</div>;
	} else {
		// Show loading state
		if (productLoading) {
			return (
				<div id={'property-detail-page'}>
					<div className={'container'}>
						<Stack sx={{ py: 5, alignItems: 'center' }}>
							<Typography>Loading product...</Typography>
						</Stack>
					</div>
				</div>
			);
		}

		// Show error state
		if (productError || !property) {
			return (
				<div id={'property-detail-page'}>
					<div className={'container'}>
						<Stack sx={{ py: 5, alignItems: 'center' }}>
							<Typography color={'error'}>
								{productError ? `Error loading product: ${productError.message}` : 'Product not found!'}
							</Typography>
						</Stack>
					</div>
				</div>
			);
		}

		return (
			<div id={'property-detail-page'}>
				<div className={'container'}>
					<Stack className={'property-detail-config'}>
						<Stack className={'property-info-config'}>
							<Stack className={'info'}>
								<Stack className={'left-box'}>
									<Typography className={'title-main'}>{property?.productTitle}</Typography>
									<Stack className={'top-box'}>
										<Typography className={'city'}>{property?.productLocation}</Typography>
										<Stack className={'divider'}></Stack>
										
										<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
											<g clipPath="url(#clip0_6505_6282)">
												<path
													d="M7 14C5.61553 14 4.26216 13.5895 3.11101 12.8203C1.95987 12.0511 1.06266 10.9579 0.532846 9.67879C0.00303297 8.3997 -0.13559 6.99224 0.134506 5.63437C0.404603 4.2765 1.07129 3.02922 2.05026 2.05026C3.02922 1.07129 4.2765 0.404603 5.63437 0.134506C6.99224 -0.13559 8.3997 0.00303297 9.67879 0.532846C10.9579 1.06266 12.0511 1.95987 12.8203 3.11101C13.5895 4.26216 14 5.61553 14 7C14 8.85652 13.2625 10.637 11.9498 11.9498C10.637 13.2625 8.85652 14 7 14ZM7 0.931878C5.79984 0.931878 4.62663 1.28777 3.62873 1.95454C2.63084 2.62132 1.85307 3.56903 1.39379 4.67783C0.934505 5.78664 0.814336 7.00673 1.04848 8.18384C1.28262 9.36094 1.86055 10.4422 2.70919 11.2908C3.55783 12.1395 4.63907 12.7174 5.81617 12.9515C6.99327 13.1857 8.21337 13.0655 9.32217 12.6062C10.431 12.1469 11.3787 11.3692 12.0455 10.3713C12.7122 9.37337 13.0681 8.20016 13.0681 7C13.067 5.39099 12.4273 3.84821 11.2895 2.71047C10.1518 1.57273 8.60901 0.933037 7 0.931878Z"
													fill="#8B4513"
												/>
												<path
													d="M9.0372 9.7275C8.97153 9.72795 8.90643 9.71543 8.84562 9.69065C8.7848 9.66587 8.72948 9.62933 8.68282 9.58313L6.68345 7.58375C6.63724 7.53709 6.6007 7.48177 6.57592 7.42096C6.55115 7.36015 6.53863 7.29504 6.53907 7.22938V2.7275C6.53907 2.59464 6.59185 2.46723 6.6858 2.37328C6.77974 2.27934 6.90715 2.22656 7.04001 2.22656C7.17287 2.22656 7.30028 2.27934 7.39423 2.37328C7.48817 2.46723 7.54095 2.59464 7.54095 2.7275V7.01937L9.39595 8.87438C9.47462 8.9425 9.53001 9.03354 9.55436 9.13472C9.57871 9.2359 9.5708 9.34217 9.53173 9.43863C9.49266 9.53509 9.4244 9.61691 9.3365 9.67264C9.24861 9.72836 9.14548 9.75519 9.04157 9.74938L9.0372 9.7275Z"
													fill="#8B4513"
												/>
											</g>
											<defs>
												<clipPath id="clip0_6505_6282">
													<rect width="14" height="14" fill="white" />
												</clipPath>
											</defs>
										</svg>
										<Typography className={'date'}>{moment().diff(property?.createdAt, 'days')} days ago</Typography>
									</Stack>
								
								</Stack>
								<Stack className={'right-box'}>
									<Stack className="buttons">
										<Stack className="button-box">
											<RemoveRedEyeIcon fontSize="medium" />
											<Typography>{property?.productViews}</Typography>
										</Stack>
										<Stack className="button-box">
														{isLiked ? (
															<FavoriteIcon 
															sx={{ color: '#eb6753', cursor: 'pointer' }} 
															fontSize="medium"
															onClick={() => likePropertyHandler(user, property?._id)}
															/>
														) : (
															<FavoriteBorderIcon
															fontSize="medium"
															sx={{ color: '#8B4513', cursor: 'pointer' }}
															onClick={() => likePropertyHandler(user, property?._id)}
															/>
														)}

														<Typography>{property?.productLikes}</Typography>
														</Stack>
									</Stack>
									<Typography>${formatterStr(property?.productPrice)}</Typography>
								</Stack>
							</Stack>
							<Stack className={'images'}>
								<Stack className={'main-image'}>
									<img
										src={
											slideImage 
												? (slideImage.startsWith('http://') || slideImage.startsWith('https://') 
													? slideImage 
													: slideImage.startsWith('/img/') 
														? slideImage 
														: `${REACT_APP_API_URL}/${slideImage}`)
												: (property?.productImages && property.productImages.length > 0
													? (property.productImages[0].startsWith('http://') || property.productImages[0].startsWith('https://')
														? property.productImages[0]
														: property.productImages[0].startsWith('/img/')
															? property.productImages[0]
															: `${REACT_APP_API_URL}/${property.productImages[0]}`)
													: '/img/property/bigImage.png')
										}
										alt={'main-image'}
									/>
								</Stack>
								<Stack className={'sub-images'}>
									{[...(property?.productImages || []), ...PRODUCT_DETAIL_EXTRA_THUMBNAILS].map(
										(subImg: string, index: number) => {
											const imagePath: string =
												subImg.startsWith('http://') || subImg.startsWith('https://')
													? subImg
													: subImg.startsWith('/img/')
														? subImg
														: `${REACT_APP_API_URL}/${subImg}`;
											return (
												<Stack
													className={'sub-img-box'}
													onClick={() => changeImageHandler(subImg)}
													key={`${subImg}-${index}`}
												>
													<img src={imagePath} alt={'sub-image'} />
												</Stack>
											);
										},
									)}
								</Stack>
								{/* Product Specifications Below Image */}
								<Stack className={'product-specs'}>
									<Stack className={'spec-item'}>
										<HeightIcon className={'spec-icon'} />
										<Stack className={'spec-content'}>
											<Typography className={'spec-label'}>Height</Typography>
											<Typography className={'spec-value'}>{(property as any)?.productHeight ?? 'N/A'} {(property as any)?.productHeight ? 'cm' : ''}</Typography>
										</Stack>
									</Stack>
									<Stack className={'spec-item'}>
										<AspectRatioIcon className={'spec-icon'} sx={{ transform: 'rotate(90deg)' }} />
										<Stack className={'spec-content'}>
											<Typography className={'spec-label'}>Width</Typography>
											<Typography className={'spec-value'}>{(property as any)?.productWidth || 'N/A'} {(property as any)?.productWidth ? 'cm' : ''}</Typography>
										</Stack>
									</Stack>
									<Stack className={'spec-item'}>
										<ConstructionIcon className={'spec-icon'} />
										<Stack className={'spec-content'}>
											<Typography className={'spec-label'}>Material</Typography>
											<Typography className={'spec-value'}>{property?.productMaterial || property?.productType || 'N/A'}</Typography>
										</Stack>
									</Stack>
									<Stack className={'spec-item'}>
										<CategoryIcon className={'spec-icon'} />
										<Stack className={'spec-content'}>
											<Typography className={'spec-label'}>Category</Typography>
											<Typography className={'spec-value'}>{(property as any)?.productCategory || 'N/A'}</Typography>
										</Stack>
									</Stack>
									<Stack className={'spec-item'}>
										<PaletteIcon className={'spec-icon'} />
										<Stack className={'spec-content'}>
											<Typography className={'spec-label'}>Color</Typography>
											<Typography className={'spec-value'}>{(property as any)?.productColor || 'N/A'}</Typography>
										</Stack>
									</Stack>
								</Stack>
							</Stack>
						</Stack>
						<Stack className={'property-desc-config'}>
							<Stack className={'left-config'}>
								<Stack className={'options-config'}>
									{(property as any)?.productMaterial && (
									<Stack className={'option'}>
										<Stack className={'svg-box'}>
											<svg xmlns="http://www.w3.org/2000/svg" width="24" height="20" viewBox="0 0 24 20" fill="none">
												<path
														d="M17.2955 18.8863H6.64714C5.76532 18.8848 4.92008 18.5724 4.29654 18.0174C3.673 17.4624 3.32196 16.7101 3.32031 15.9252V7.21961C3.32207 6.73455 3.45794 6.25732 3.71592 5.83005C3.97391 5.40277 4.34608 5.03858 4.7996 4.76961L10.0988 1.6085C10.6506 1.27315 11.3032 1.09375 11.9713 1.09375C12.6394 1.09375 13.292 1.27315 13.8438 1.6085L19.168 4.76961C19.618 5.04048 19.9866 5.4055 20.2412 5.83265C20.4958 6.25981 20.6289 6.73605 20.6285 7.21961V15.9252C20.6269 16.711 20.275 17.4642 19.6501 18.0193C19.0252 18.5745 18.1784 18.8863 17.2955 18.8863ZM11.9713 2.29183C11.5779 2.29281 11.1936 2.39717 10.8665 2.59183L5.53612 5.75294C5.26468 5.91407 5.04189 6.1321 4.88734 6.38784C4.73279 6.64359 4.65122 6.92922 4.64979 7.21961V15.9252C4.64979 16.3967 4.86023 16.8488 5.2348 17.1822C5.60938 17.5156 6.11741 17.7029 6.64714 17.7029H17.2955C17.8252 17.7029 18.3332 17.5156 18.7078 17.1822C19.0824 16.8488 19.2928 16.3967 19.2928 15.9252V7.21961C19.2935 6.92734 19.2129 6.63946 19.0582 6.38163C18.9036 6.12379 18.6797 5.904 18.4065 5.74183L13.0761 2.59183C12.7492 2.39687 12.3648 2.29248 11.9713 2.29183Z"
														fill="#8B4513"
												/>
													<path d="M9.30469 14.7422H14.6289V15.9255H9.30469V14.7422Z" fill="#8B4513" />
											</svg>
										</Stack>
										<Stack className={'option-includes'}>
												<Typography className={'title'}>Material</Typography>
												<Typography className={'option-data'}>{(property as any)?.productMaterial}</Typography>
									</Stack>
										</Stack>
									)}
									{(property as any)?.productGlassType && (
									<Stack className={'option'}>
										<Stack className={'svg-box'}>
											<svg xmlns="http://www.w3.org/2000/svg" width="24" height="20" viewBox="0 0 24 20" fill="none">
												<path
														d="M17.2955 18.8863H6.64714C5.76532 18.8848 4.92008 18.5724 4.29654 18.0174C3.673 17.4624 3.32196 16.7101 3.32031 15.9252V7.21961C3.32207 6.73455 3.45794 6.25732 3.71592 5.83005C3.97391 5.40277 4.34608 5.03858 4.7996 4.76961L10.0988 1.6085C10.6506 1.27315 11.3032 1.09375 11.9713 1.09375C12.6394 1.09375 13.292 1.27315 13.8438 1.6085L19.168 4.76961C19.618 5.04048 19.9866 5.4055 20.2412 5.83265C20.4958 6.25981 20.6289 6.73605 20.6285 7.21961V15.9252C20.6269 16.711 20.275 17.4642 19.6501 18.0193C19.0252 18.5745 18.1784 18.8863 17.2955 18.8863ZM11.9713 2.29183C11.5779 2.29281 11.1936 2.39717 10.8665 2.59183L5.53612 5.75294C5.26468 5.91407 5.04189 6.1321 4.88734 6.38784C4.73279 6.64359 4.65122 6.92922 4.64979 7.21961V15.9252C4.64979 16.3967 4.86023 16.8488 5.2348 17.1822C5.60938 17.5156 6.11741 17.7029 6.64714 17.7029H17.2955C17.8252 17.7029 18.3332 17.5156 18.7078 17.1822C19.0824 16.8488 19.2928 16.3967 19.2928 15.9252V7.21961C19.2935 6.92734 19.2129 6.63946 19.0582 6.38163C18.9036 6.12379 18.6797 5.904 18.4065 5.74183L13.0761 2.59183C12.7492 2.39687 12.3648 2.29248 11.9713 2.29183Z"
														fill="#8B4513"
												/>
													<path d="M9.30469 14.7422H14.6289V15.9255H9.30469V14.7422Z" fill="#8B4513" />
											</svg>
										</Stack>
										<Stack className={'option-includes'}>
												<Typography className={'title'}>Glass Type</Typography>
												<Typography className={'option-data'}>{(property as any)?.productGlassType}</Typography>
											</Stack>
										</Stack>
									)}
									{(property as any)?.productOpenType && (
									<Stack className={'option'}>
										<Stack className={'svg-box'}>
												<svg xmlns="http://www.w3.org/2000/svg" width="24" height="20" viewBox="0 0 24 20" fill="none">
												<path
														d="M17.2955 18.8863H6.64714C5.76532 18.8848 4.92008 18.5724 4.29654 18.0174C3.673 17.4624 3.32196 16.7101 3.32031 15.9252V7.21961C3.32207 6.73455 3.45794 6.25732 3.71592 5.83005C3.97391 5.40277 4.34608 5.03858 4.7996 4.76961L10.0988 1.6085C10.6506 1.27315 11.3032 1.09375 11.9713 1.09375C12.6394 1.09375 13.292 1.27315 13.8438 1.6085L19.168 4.76961C19.618 5.04048 19.9866 5.4055 20.2412 5.83265C20.4958 6.25981 20.6289 6.73605 20.6285 7.21961V15.9252C20.6269 16.711 20.275 17.4642 19.6501 18.0193C19.0252 18.5745 18.1784 18.8863 17.2955 18.8863ZM11.9713 2.29183C11.5779 2.29281 11.1936 2.39717 10.8665 2.59183L5.53612 5.75294C5.26468 5.91407 5.04189 6.1321 4.88734 6.38784C4.73279 6.64359 4.65122 6.92922 4.64979 7.21961V15.9252C4.64979 16.3967 4.86023 16.8488 5.2348 17.1822C5.60938 17.5156 6.11741 17.7029 6.64714 17.7029H17.2955C17.8252 17.7029 18.3332 17.5156 18.7078 17.1822C19.0824 16.8488 19.2928 16.3967 19.2928 15.9252V7.21961C19.2935 6.92734 19.2129 6.63946 19.0582 6.38163C18.9036 6.12379 18.6797 5.904 18.4065 5.74183L13.0761 2.59183C12.7492 2.39687 12.3648 2.29248 11.9713 2.29183Z"
														fill="#8B4513"
													/>
													<path d="M9.30469 14.7422H14.6289V15.9255H9.30469V14.7422Z" fill="#8B4513" />
											</svg>
										</Stack>
										<Stack className={'option-includes'}>
												<Typography className={'title'}>Open Type</Typography>
												<Typography className={'option-data'}>{(property as any)?.productOpenType}</Typography>
											</Stack>
										</Stack>
									)}
									{(property as any)?.productType && (
									<Stack className={'option'}>
										<Stack className={'svg-box'}>
											<svg xmlns="http://www.w3.org/2000/svg" width="24" height="20" viewBox="0 0 24 20" fill="none">
												<path
													d="M17.2955 18.8863H6.64714C5.76532 18.8848 4.92008 18.5724 4.29654 18.0174C3.673 17.4624 3.32196 16.7101 3.32031 15.9252V7.21961C3.32207 6.73455 3.45794 6.25732 3.71592 5.83005C3.97391 5.40277 4.34608 5.03858 4.7996 4.76961L10.0988 1.6085C10.6506 1.27315 11.3032 1.09375 11.9713 1.09375C12.6394 1.09375 13.292 1.27315 13.8438 1.6085L19.168 4.76961C19.618 5.04048 19.9866 5.4055 20.2412 5.83265C20.4958 6.25981 20.6289 6.73605 20.6285 7.21961V15.9252C20.6269 16.711 20.275 17.4642 19.6501 18.0193C19.0252 18.5745 18.1784 18.8863 17.2955 18.8863ZM11.9713 2.29183C11.5779 2.29281 11.1936 2.39717 10.8665 2.59183L5.53612 5.75294C5.26468 5.91407 5.04189 6.1321 4.88734 6.38784C4.73279 6.64359 4.65122 6.92922 4.64979 7.21961V15.9252C4.64979 16.3967 4.86023 16.8488 5.2348 17.1822C5.60938 17.5156 6.11741 17.7029 6.64714 17.7029H17.2955C17.8252 17.7029 18.3332 17.5156 18.7078 17.1822C19.0824 16.8488 19.2928 16.3967 19.2928 15.9252V7.21961C19.2935 6.92734 19.2129 6.63946 19.0582 6.38163C18.9036 6.12379 18.6797 5.904 18.4065 5.74183L13.0761 2.59183C12.7492 2.39687 12.3648 2.29248 11.9713 2.29183Z"
														fill="#8B4513"
												/>
													<path d="M9.30469 14.7422H14.6289V15.9255H9.30469V14.7422Z" fill="#8B4513" />
											</svg>
										</Stack>
										<Stack className={'option-includes'}>
												<Typography className={'title'}>Product Type</Typography>
												<Typography className={'option-data'}>{property?.productType}</Typography>
											</Stack>
										</Stack>
									)}
								</Stack>
								<Stack className={'prop-desc-config'}>
									<Stack className={'top'}>
										<Typography className={'title'}>Product Description</Typography>
										<Typography className={'desc'}>{property?.productDesc || 'No Description!'}</Typography>
									</Stack>
									<Stack className={'bottom'}>
										<Typography className={'title'}>Product Details</Typography>
										<Stack className={'info-box'}>
											<Stack className={'left'}>
												<Box component={'div'} className={'info'}>
													<Typography className={'title'}>Price</Typography>
													<Typography className={'data'}>${formatterStr(property?.productPrice)}</Typography>
												</Box>
												{(property as any)?.productHeight && (
												<Box component={'div'} className={'info'}>
														<Typography className={'title'}>Height</Typography>
														<Typography className={'data'}>{(property as any)?.productHeight} cm</Typography>
												</Box>
												)}
												{(property as any)?.productWidth && (
												<Box component={'div'} className={'info'}>
														<Typography className={'title'}>Width</Typography>
														<Typography className={'data'}>{(property as any)?.productWidth} cm</Typography>
												</Box>
												)}
												{(property as any)?.productColor && (
												<Box component={'div'} className={'info'}>
														<Typography className={'title'}>Color</Typography>
														<Typography className={'data'}>{(property as any)?.productColor}</Typography>
												</Box>
												)}
											</Stack>
											<Stack className={'right'}>
												{(property as any)?.productMaterial && (
													<Box component={'div'} className={'info'}>
														<Typography className={'title'}>Material</Typography>
														<Typography className={'data'}>{(property as any)?.productMaterial}</Typography>
													</Box>
												)}
												{(property as any)?.productGlassType && (
												<Box component={'div'} className={'info'}>
														<Typography className={'title'}>Glass Type</Typography>
														<Typography className={'data'}>{(property as any)?.productGlassType}</Typography>
												</Box>
												)}
												{(property as any)?.productOpenType && (
												<Box component={'div'} className={'info'}>
														<Typography className={'title'}>Open Type</Typography>
														<Typography className={'data'}>{(property as any)?.productOpenType}</Typography>
												</Box>
												)}
												{(property as any)?.productType && (
												<Box component={'div'} className={'info'}>
														<Typography className={'title'}>Product Type</Typography>
														<Typography className={'data'}>{property?.productType}</Typography>
												</Box>
												)}
											</Stack>
										</Stack>
									</Stack>
								</Stack>
								<Stack className={'floor-plans-config'}>
									<Typography className={'title'}>Product Plans</Typography>
									<Stack className={'plans-grid'}>
										<Stack className={'plan-item'}>
											<Typography className={'plan-title'}>Door Plan</Typography>
											<Stack className={'image-box'}>
												<a href="https://www.shutterstock.com/search/doors-plan" target="_blank" rel="noopener noreferrer" style={{ display: 'block', width: '100%', height: '100%' }}>
													<img 
														src={'https://t4.ftcdn.net/jpg/17/83/11/47/240_F_1783114735_wVf1isO3bRO52xUy8kDUbgT9NCZEOFnC.jpg'} 
														alt={'Door Plan'}
														style={{ width: '100%', height: '100%', objectFit: 'cover' }}
														onError={(e) => {
															// Prevent infinite loop by checking if already tried fallback
															const target = e.target as HTMLImageElement;
															if (!target.dataset.fallback) {
																target.dataset.fallback = 'true';
																target.src = 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800';
															}
														}}
													/>
												</a>
											</Stack>
										</Stack>
										<Stack className={'plan-item'}>
											<Typography className={'plan-title'}>Window Plan</Typography>
											<Stack className={'image-box'}>
												<a href="https://www.bibliocad.com/" target="_blank" rel="noopener noreferrer" style={{ display: 'block', width: '100%', height: '100%' }}>
													<img 
														src={'https://thumb.bibliocad.com/thumbs/content/586x440/00130000/0000/130080.webp'} 
														alt={'Window Plan'}
														style={{ width: '100%', height: '100%', objectFit: 'cover' }}
													/>
												</a>
											</Stack>
										</Stack>
									</Stack>
								</Stack>
								<Stack className={'leave-review-config'}>
									<Typography className={'main-title'}>Leave A Review</Typography>
									<Typography className={'review-title'}>Review</Typography>
									<textarea
										onChange={({ target: { value } }: any) => {
											setInsertCommentData({ ...insertCommentData, commentContent: value });
										}}
										value={insertCommentData.commentContent}
									></textarea>
									<Box className={'submit-btn'} component={'div'}>
										<Button
											className={'submit-review'}
											onClick={createCommentHandler}
											disabled={createCommentLoading || !user?._id || insertCommentData.commentContent.trim() === ''}
										>
											<Typography className={'title'}>Submit Review</Typography>
											<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
												<g clipPath="url(#clip0_6975_3642)">
													<path
														d="M16.1571 0.5H6.37936C6.1337 0.5 5.93491 0.698792 5.93491 0.944458C5.93491 1.19012 6.1337 1.38892 6.37936 1.38892H15.0842L0.731781 15.7413C0.558156 15.915 0.558156 16.1962 0.731781 16.3698C0.818573 16.4566 0.932323 16.5 1.04603 16.5C1.15974 16.5 1.27345 16.4566 1.36028 16.3698L15.7127 2.01737V10.7222C15.7127 10.9679 15.9115 11.1667 16.1572 11.1667C16.4028 11.1667 16.6016 10.9679 16.6016 10.7222V0.944458C16.6016 0.698792 16.4028 0.5 16.1571 0.5Z"
														fill="#8B4513"
													/>
												</g>
												<defs>
													<clipPath id="clip0_6975_3642">
														<rect width="16" height="16" fill="white" transform="translate(0.601562 0.5)" />
													</clipPath>
												</defs>
											</svg>
										</Button>
									</Box>
								</Stack>
								<Stack className={'reviews-config'}>
									<Stack className={'filter-box'}>
										<Stack className={'review-cnt'}>
												<svg xmlns="http://www.w3.org/2000/svg" width="16" height="12" viewBox="0 0 16 12" fill="none">
													<g clipPath="url(#clip0_6507_7309)">
														<path
															d="M15.7183 4.60288C15.6171 4.3599 15.3413 4.18787 15.0162 4.16489L10.5822 3.8504L8.82988 0.64527C8.7005 0.409792 8.40612 0.257812 8.07846 0.257812C7.7508 0.257812 7.4563 0.409792 7.32774 0.64527L5.57541 3.8504L1.14072 4.16489C0.815641 4.18832 0.540363 4.36035 0.438643 4.60288C0.337508 4.84586 0.430908 5.11238 0.676772 5.28084L4.02851 7.57692L3.04025 10.9774C2.96794 11.2275 3.09216 11.486 3.35771 11.636C3.50045 11.717 3.66815 11.7575 3.83643 11.7575C3.98105 11.7575 4.12577 11.7274 4.25503 11.667L8.07846 9.88098L11.9012 11.667C12.1816 11.7979 12.5342 11.7859 12.7992 11.636C13.0648 11.486 13.189 11.2275 13.1167 10.9774L12.1284 7.57692L15.4801 5.28084C15.7259 5.11238 15.8194 4.84641 15.7183 4.60288Z"
															fill="#181A20"
														/>
													</g>
													<defs>
														<clipPath id="clip0_6507_7309">
															<rect width="15.36" height="12" fill="white" transform="translate(0.398438)" />
														</clipPath>
													</defs>
												</svg>
												<Typography className={'reviews'}>{commentTotal} reviews</Typography>
										</Stack>
									</Stack>
									<Stack className={'review-list'}>
										{commentsLoading ? (
											<Stack sx={{ py: 3, alignItems: 'center' }}>
												<Typography sx={{ color: '#717171' }}>Loading reviews...</Typography>
											</Stack>
										) : commentsError ? (
											<Stack sx={{ py: 3, alignItems: 'center' }}>
												<Typography sx={{ color: '#717171' }}>
													Error loading reviews: {commentsError.message}
												</Typography>
											</Stack>
										) : propertyComments.length === 0 ? (
											<Stack sx={{ py: 3, alignItems: 'center' }}>
												<Typography sx={{ color: '#717171' }}>
													No reviews yet. Be the first to leave a review!
												</Typography>
											</Stack>
										) : (
											<>
												{propertyComments?.map((comment: Comment) => {
													return <Review comment={comment} key={comment?._id} />;
												})}
												<Box component={'div'} className={'pagination-box'}>
													<MuiPagination
														page={commentInquiry.page}
														count={Math.ceil(commentTotal / commentInquiry.limit) || 1}
														onChange={commentPaginationChangeHandler}
														shape="circular"
														color="primary"
													/>
												</Box>
											</>
										)}
									</Stack>
								</Stack>
							</Stack>
						</Stack>
						{destinationProperty.length !== 0 && (
							<Stack className={'similar-properties-config'}>
								<Stack className={'title-pagination-box'}>
									<Stack className={'title-box'}>
										<Typography className={'main-title'}>Destination Property</Typography>
										<Typography className={'sub-title'}>Aliquam lacinia diam quis lacus euismod</Typography>
									</Stack>
									<Stack className={'pagination-box'}>
										<WestIcon className={'swiper-similar-prev'} />
										<div className={'swiper-similar-pagination'}></div>
										<EastIcon className={'swiper-similar-next'} />
									</Stack>
								</Stack>
								<Stack className={'cards-box'}>
									<Swiper
										className={'similar-homes-swiper'}
										slidesPerView={'auto'}
										spaceBetween={35}
										modules={[Autoplay, Navigation, Pagination]}
										navigation={{
											nextEl: '.swiper-similar-next',
											prevEl: '.swiper-similar-prev',
										}}
										pagination={{
											el: '.swiper-similar-pagination',
										}}
									>
										{destinationProperty.map((property: ProductDetail) => {
											return (
												<SwiperSlide className={'similar-homes-slide'} key={property.productTitle}>
													<PropertyBigCard property={property} key={property?._id} />
												</SwiperSlide>
											);
										})}
									</Swiper>
								</Stack>
							</Stack>
						)}
					</Stack>
				</div>
			</div>
		);
	}
};

PropertyDetail.defaultProps = {
	initialComment: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		direction: 'DESC',
		search: {
			commentRefId: '',
		},
	},
};

export default withLayoutFull(PropertyDetail);
