import React, { useState, useEffect, useRef } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import {
	Box,
	Button,
	Card,
	CardContent,
	Stack,
	TextField,
	Typography,
	Select,
	MenuItem,
	FormControl,
	Grid,
	Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import UpdateIcon from '@mui/icons-material/Update';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import Moment from 'react-moment';
import { BoardArticleUpdate } from '../../../libs/types/board-article/board-article.update';
import { BoardArticleStatus } from '../../../libs/enums/board-article.enum';
import { sweetMixinErrorAlert, sweetTopSuccessAlert } from '../../../libs/sweetAlert';
import { useMutation, useQuery } from '@apollo/client';
import { UPDATE_BOARD_ARTICLE_BY_ADMIN } from '../../../apollo/admin/mutation';
import { GET_BOARD_ARTICLES } from '../../../apollo/user/query';
import { BoardArticlesInquiry } from '../../../libs/types/board-article/board-article.input';
import { BoardArticleCategory } from '../../../libs/enums/board-article.enum';
import { Direction } from '../../../libs/enums/common.enum';
import { getJwtToken } from '../../../libs/auth';
import { REACT_APP_API_URL, REACT_APP_API_GRAPHQL_URL } from '../../../libs/config';
import axios from 'axios';

const ArticleEdit: NextPage = (props: any) => {
	const router = useRouter();
	const { id } = router.query;
	const inputRef = useRef<HTMLInputElement>(null);
	const token = getJwtToken();
	
	const [articleData, setArticleData] = useState<BoardArticleUpdate>({
		_id: '',
		articleStatus: BoardArticleStatus.ACTIVE,
		articleTitle: '',
		articleContent: '',
		articleImage: '',
	});

	// Article ma'lumotlarini olish - barcha article'larni olish va ID bo'yicha filter qilish
	const articleInquiry: BoardArticlesInquiry = {
		page: 1,
		limit: 1000, // Katta limit - barcha article'larni olish uchun
		sort: 'createdAt',
		direction: Direction.DESC,
		search: {
			articleCategory: BoardArticleCategory.NEWS, // Default category
		},
	};

	const { data: articlesData, loading: loadingArticle } = useQuery(GET_BOARD_ARTICLES, {
		variables: { input: articleInquiry },
		fetchPolicy: 'network-only',
		skip: !id,
	});

	const [updateArticle] = useMutation(UPDATE_BOARD_ARTICLE_BY_ADMIN);

	// Article ma'lumotlarini yuklash
	useEffect(() => {
		if (id && articlesData?.getBoardArticles?.list) {
			const article = articlesData.getBoardArticles.list.find((a: any) => a._id === id);
			if (article) {
				setArticleData({
					_id: article._id,
					articleStatus: article.articleStatus || BoardArticleStatus.ACTIVE,
					articleTitle: article.articleTitle || '',
					articleContent: article.articleContent || '',
					articleImage: article.articleImage || '',
				});
			}
		}
	}, [id, articlesData]);

	/** HANDLERS **/
	const handleInputChange = (field: keyof BoardArticleUpdate, value: any) => {
		setArticleData({ ...articleData, [field]: value });
	};

	async function uploadImage() {
		try {
			const formData = new FormData();
			const selectedFile = inputRef.current?.files?.[0];

			if (!selectedFile) {
				await sweetMixinErrorAlert('Please select an image!');
				return false;
			}

			formData.append(
				'operations',
				JSON.stringify({
					query: `mutation ImagesUploader($files: [Upload!]!, $target: String!) { 
						imagesUploader(files: $files, target: $target)
					}`,
					variables: {
						files: [null],
						target: 'article',
					},
				}),
			);
			formData.append(
				'map',
				JSON.stringify({
					'0': ['variables.files.0'],
				}),
			);
			formData.append('0', selectedFile);

			const graphqlUrl = REACT_APP_API_GRAPHQL_URL || 'http://localhost:3007/graphql';
			console.log('Uploading image to:', graphqlUrl);
			
			const response = await axios.post(graphqlUrl, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
					'apollo-require-preflight': true,
					Authorization: `Bearer ${token}`,
				},
			});

			if (!response.data || !response.data.data || !response.data.data.imagesUploader) {
				throw new Error('Invalid response from server');
			}

			const responseImages = response.data.data.imagesUploader;
			// Faqat birinchi rasmni olish (article'da faqat bitta image bor)
			if (responseImages && responseImages.length > 0) {
				setArticleData({ ...articleData, articleImage: responseImages[0] });
				await sweetTopSuccessAlert('Image uploaded successfully!');
				// File input'ni tozalash
				if (inputRef.current) {
					inputRef.current.value = '';
				}
				return true;
			} else {
				throw new Error('No image returned from server');
			}
		} catch (err: any) {
			console.error('Image upload error:', err);
			const errorMessage = err.response?.data?.message || err.message || 'Failed to upload image';
			await sweetMixinErrorAlert(errorMessage);
			return false;
		}
	}

	const removeImage = () => {
		setArticleData({ ...articleData, articleImage: '' });
	};

	const doDisabledCheck = () => {
		// ID query parametri yoki _id bo'lsa, button enabled bo'ladi
		const hasId = (id && typeof id === 'string') || (articleData._id && articleData._id.trim() !== '');
		const isDisabled = !hasId;
		
		if (isDisabled) {
			console.log('Form validation failed: Missing _id or id query param');
			console.log('Current id query:', id);
			console.log('Current articleData._id:', articleData._id);
		}
		
		return isDisabled;
	};

	const handleSubmit = async () => {
		try {
			// ID ni query parametridan yoki articleData._id dan olish
			const articleId = (typeof id === 'string' ? id : articleData._id) || '';
			
			if (!articleId) {
				await sweetMixinErrorAlert('Article ID is missing');
				return;
			}
			
			// Faqat o'zgartirilgan field'larni yuborish
			const updateInput: BoardArticleUpdate = {
				_id: articleId,
			};

			if (articleData.articleStatus) updateInput.articleStatus = articleData.articleStatus;
			if (articleData.articleTitle) updateInput.articleTitle = articleData.articleTitle;
			if (articleData.articleContent) updateInput.articleContent = articleData.articleContent;
			if (articleData.articleImage) updateInput.articleImage = articleData.articleImage;

			await updateArticle({
				variables: { input: updateInput },
			});
			await sweetTopSuccessAlert('Article updated successfully!');
			// Article page'ga qaytish va cache'ni yangilash
			router.push({
				pathname: '/_admin/community',
				query: { refresh: 'true', timestamp: Date.now() },
			});
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message || 'Failed to update article');
		}
	};

	if (loadingArticle) {
		return (
			<Box component={'div'} className={'content article-edit-page'}>
				<Card>
					<CardContent>
						<Typography>Loading article...</Typography>
					</CardContent>
				</Card>
			</Box>
		);
	}

	const currentArticle = articlesData?.getBoardArticles?.list?.find((a: any) => a._id === id);

	return (
		<Box component={'div'} className={'content article-edit-page'}>
			{/* Header Section */}
			<Card className={'page-header-card'} sx={{ mb: 3 }}>
				<CardContent>
					<Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
						<Stack direction={'row'} alignItems={'center'} spacing={2}>
							<Button
								startIcon={<ArrowBackIcon />}
								onClick={() => router.push('/_admin/community')}
								className={'back-btn'}
							>
								Back
							</Button>
							<Box component="div" className={'article-edit-icon-box'}>
								<EditIcon className={'article-edit-icon'} />
							</Box>
							<Box component="div">
								<Typography variant={'h4'} className={'page-title'} sx={{ fontWeight: 700, mb: 0.5 }}>
									Edit Article
								</Typography>
								<Typography variant={'body2'} sx={{ color: '#717171' }}>
									Modify existing community article
								</Typography>
							</Box>
						</Stack>
					</Stack>
				</CardContent>
			</Card>

			{/* Main Content - Two Column Layout */}
			<Grid container spacing={3}>
				{/* Left Column - Article Information */}
				<Grid item xs={12} md={4}>
					<Card className={'info-card'}>
						<CardContent>
							<Stack spacing={3}>
								<Box component="div">
									<Stack direction={'row'} alignItems={'center'} spacing={1} sx={{ mb: 2 }}>
										<InfoOutlinedIcon sx={{ color: '#8B4513', fontSize: 20 }} />
										<Typography variant={'h6'} sx={{ fontWeight: 600, color: '#8B4513' }}>
											Article Information
										</Typography>
									</Stack>
									<Box component="div" className={'info-item'}>
										<Typography variant={'caption'} sx={{ color: '#9e9e9e', display: 'block', mb: 0.5 }}>
											Article ID
										</Typography>
										<Typography variant={'body2'} sx={{ fontWeight: 500, color: '#181a20' }}>
											{articleData._id || 'Loading...'}
										</Typography>
									</Box>
									<Box component="div" className={'info-item'} sx={{ mt: 2 }}>
										<Typography variant={'caption'} sx={{ color: '#9e9e9e', display: 'block', mb: 0.5 }}>
											Category
										</Typography>
										<Typography variant={'body2'} sx={{ fontWeight: 500, color: '#181a20' }}>
											{currentArticle?.articleCategory || 'N/A'}
										</Typography>
									</Box>
									<Box component="div" className={'info-item'} sx={{ mt: 2 }}>
										<Typography variant={'caption'} sx={{ color: '#9e9e9e', display: 'block', mb: 0.5 }}>
											Views
										</Typography>
										<Typography variant={'body2'} sx={{ fontWeight: 500, color: '#181a20' }}>
											{currentArticle?.articleViews || 0}
										</Typography>
									</Box>
									<Box component="div" className={'info-item'} sx={{ mt: 2 }}>
										<Typography variant={'caption'} sx={{ color: '#9e9e9e', display: 'block', mb: 0.5 }}>
											Likes
										</Typography>
										<Typography variant={'body2'} sx={{ fontWeight: 500, color: '#181a20' }}>
											{currentArticle?.articleLikes || 0}
										</Typography>
									</Box>
									<Box component="div" className={'info-item'} sx={{ mt: 2 }}>
										<Typography variant={'caption'} sx={{ color: '#9e9e9e', display: 'block', mb: 0.5 }}>
											Comments
										</Typography>
										<Typography variant={'body2'} sx={{ fontWeight: 500, color: '#181a20' }}>
											{currentArticle?.articleComments || 0}
										</Typography>
									</Box>
								</Box>

								<Divider />

								<Box component="div">
									<Stack direction={'row'} alignItems={'center'} spacing={1} sx={{ mb: 2 }}>
										<CalendarTodayIcon sx={{ color: '#8B4513', fontSize: 20 }} />
										<Typography variant={'h6'} sx={{ fontWeight: 600, color: '#8B4513' }}>
											Timeline
										</Typography>
									</Stack>
									<Box component="div" className={'info-item'}>
										<Typography variant={'caption'} sx={{ color: '#9e9e9e', display: 'block', mb: 0.5 }}>
											Created At
										</Typography>
										<Typography variant={'body2'} sx={{ fontWeight: 500, color: '#181a20' }}>
											{currentArticle?.createdAt ? (
												<Moment format="YYYY-MM-DD HH:mm">{currentArticle.createdAt}</Moment>
											) : (
												'N/A'
											)}
										</Typography>
									</Box>
									<Box component="div" className={'info-item'} sx={{ mt: 2 }}>
										<Typography variant={'caption'} sx={{ color: '#9e9e9e', display: 'block', mb: 0.5 }}>
											Last Updated
										</Typography>
										<Typography variant={'body2'} sx={{ fontWeight: 500, color: '#181a20' }}>
											{currentArticle?.updatedAt ? (
												<Moment format="YYYY-MM-DD HH:mm">{currentArticle.updatedAt}</Moment>
											) : (
												'N/A'
											)}
										</Typography>
									</Box>
								</Box>
							</Stack>
						</CardContent>
					</Card>
				</Grid>

				{/* Right Column - Edit Form */}
				<Grid item xs={12} md={8}>
					<Card className={'form-card'}>
						<CardContent>
							<Stack spacing={3}>
								{/* Title Field */}
								<Box component="div">
									<Typography variant={'subtitle1'} sx={{ fontWeight: 600, mb: 1.5, color: '#181a20' }}>
										Article Title <span style={{ color: '#d32f2f' }}>*</span>
									</Typography>
									<TextField
										fullWidth
										value={articleData.articleTitle || ''}
										onChange={(e) => handleInputChange('articleTitle', e.target.value)}
										placeholder="Enter article title..."
										variant="outlined"
										className={'article-edit-title-input'}
									/>
								</Box>

								{/* Content Field */}
								<Box component="div">
									<Typography variant={'subtitle1'} sx={{ fontWeight: 600, mb: 1.5, color: '#181a20' }}>
										Article Content <span style={{ color: '#d32f2f' }}>*</span>
									</Typography>
									<TextField
										fullWidth
										
										rows={10}
										value={articleData.articleContent || ''}
										onChange={(e) => handleInputChange('articleContent', e.target.value)}
										placeholder="Enter article content..."
										variant="outlined"
										className={'article-edit-textarea'}
									/>
								</Box>

								{/* Image Upload Section */}
								<Box component="div">
									<Typography variant={'subtitle1'} sx={{ fontWeight: 600, mb: 1.5, color: '#181a20' }}>
										Article Image
									</Typography>
									<Box component="div" className={'image-upload-section'}>
										<input
											type="file"
											ref={inputRef}
											accept="image/*"
											style={{ display: 'none' }}
										/>
										<Stack direction={'row'} spacing={2} alignItems={'center'} sx={{ mb: 2 }}>
											<Button
												variant={'outlined'}
												startIcon={<CloudUploadIcon />}
												onClick={() => inputRef.current?.click()}
												className={'upload-image-btn'}
											>
												Select Image
											</Button>
											<Button
												variant={'contained'}
												onClick={uploadImage}
												disabled={!inputRef.current?.files || inputRef.current.files.length === 0}
												className={'upload-image-submit-btn'}
											>
												Upload Image
											</Button>
										</Stack>
										{articleData.articleImage && (
											<Box component="div" className={'image-preview-box'}>
												<img
													src={`${REACT_APP_API_URL}/${articleData.articleImage}`}
													alt="Article"
													className={'image-preview'}
												/>
												<Button
													className={'remove-image-btn'}
													onClick={removeImage}
													startIcon={<DeleteRoundedIcon />}
												>
													Remove
												</Button>
											</Box>
										)}
									</Box>
								</Box>

								{/* Status Field */}
								<Box component="div">
									<Typography variant={'subtitle1'} sx={{ fontWeight: 600, mb: 1.5, color: '#181a20' }}>
										Article Status
									</Typography>
									<FormControl fullWidth>
										<Select
											value={articleData.articleStatus || BoardArticleStatus.ACTIVE}
											onChange={(e) => handleInputChange('articleStatus', e.target.value)}
											className={'article-edit-select'}
										>
											{Object.values(BoardArticleStatus).map((status) => (
												<MenuItem key={status} value={status}>
													{status}
												</MenuItem>
											))}
										</Select>
									</FormControl>
								</Box>

								{/* Action Buttons */}
								<Stack direction={'row'} spacing={2} justifyContent={'flex-end'} sx={{ mt: 2 }}>
									<Button
										variant={'outlined'}
										onClick={() => router.push('/_admin/community')}
										className={'cancel-btn'}
									>
										Cancel
									</Button>
									<Button
										variant={'contained'}
										startIcon={<UpdateIcon />}
										onClick={handleSubmit}
										disabled={doDisabledCheck()}
										className={'submit-btn'}
									>
										Update Article
									</Button>
								</Stack>
							</Stack>
						</CardContent>
					</Card>
				</Grid>
			</Grid>
		</Box>
	);
};

export default withAdminLayout(ArticleEdit);

