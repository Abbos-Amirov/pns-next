import React, { useRef, useState } from 'react';
import { Box, Button, FormControl, MenuItem, Stack, Typography, Select, TextField } from '@mui/material';
import { BoardArticleCategory } from '../../enums/board-article.enum';
import { Editor } from '@toast-ui/react-editor';
import { getJwtToken } from '../../auth';
import { REACT_APP_API_URL, REACT_APP_API_GRAPHQL_URL } from '../../config';
import { useRouter } from 'next/router';
import axios from 'axios';
import { T } from '../../types/common';
import { useMutation } from '@apollo/client';
import { CREATE_BOARD_ARTICLE } from '../../../apollo/user/mutation';
import { BoardArticleInput } from '../../types/board-article/board-article.input';
import { sweetErrorHandling, sweetTopSuccessAlert } from '../../sweetAlert';
import '@toast-ui/editor/dist/toastui-editor.css';

const TuiEditor = () => {
	const editorRef = useRef<Editor>(null),
		token = getJwtToken(),
		router = useRouter();
	const [articleCategory, setArticleCategory] = useState<BoardArticleCategory>(BoardArticleCategory.FREE);
	const [articleTitle, setArticleTitle] = useState<string>('');
	const [articleImage, setArticleImage] = useState<string>('');

	/** APOLLO REQUESTS **/
	const [createBoardArticle, { loading: creating }] = useMutation(CREATE_BOARD_ARTICLE, {
		onCompleted: () => {
			sweetTopSuccessAlert('Article created successfully!').then();
			router.push('/mypage?category=myArticles').then();
		},
		onError: (err) => {
			console.error('Create Article Error:', err);
			sweetErrorHandling(err).then();
		},
	});

	/** HANDLERS **/
	const uploadImage = async (image: any) => {
		try {
			const formData = new FormData();
			formData.append(
				'operations',
				JSON.stringify({
					query: `mutation ImageUploader($file: Upload!, $target: String!) {
						imageUploader(file: $file, target: $target) 
				  }`,
					variables: {
						file: null,
						target: 'article',
					},
				}),
			);
			formData.append(
				'map',
				JSON.stringify({
					'0': ['variables.file'],
				}),
			);
			formData.append('0', image);

			const response = await axios.post(`${REACT_APP_API_GRAPHQL_URL}`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
					'apollo-require-preflight': true,
					Authorization: `Bearer ${token}`,
				},
			});

			const responseImage = response.data.data.imageUploader;
			console.log('=responseImage: ', responseImage);
			setArticleImage(responseImage);

			return `${REACT_APP_API_URL}/${responseImage}`;
		} catch (err) {
			console.log('Error, uploadImage:', err);
		}
	};

	const changeCategoryHandler = (e: any) => {
		setArticleCategory(e.target.value);
	};

	const articleTitleHandler = (e: T) => {
		setArticleTitle(e.target.value);
	};

	const handleRegisterButton = async () => {
		try {
			// Get article content from editor
			const articleContent = editorRef.current?.getInstance()?.getMarkdown() || '';
			const cleanContent = articleContent.trim();
			
			if (!articleTitle.trim()) {
				await sweetErrorHandling({ message: 'Please enter article title' });
				return;
			}

			if (!cleanContent || cleanContent === 'Type here') {
				await sweetErrorHandling({ message: 'Please enter article content' });
				return;
			}

			const input: BoardArticleInput = {
				articleCategory,
				articleTitle: articleTitle.trim(),
				articleContent: cleanContent,
				articleImage: articleImage || '',
			};

			console.log('Creating article with input:', input);
			await createBoardArticle({
				variables: { input },
			});
		} catch (err: any) {
			console.error('Error creating article:', err);
			await sweetErrorHandling(err);
		}
	};

	const doDisabledCheck = () => {
		if (creating) return true;
		if (!articleTitle.trim()) return true;
		try {
			if (!editorRef.current) return true;
			const articleContent = editorRef.current.getInstance()?.getMarkdown() || '';
			const cleanContent = articleContent.trim();
			if (!cleanContent || cleanContent === 'Type here') return true;
			return false;
		} catch (err) {
			return false;
		}
	};

	return (
		<Stack>
			<Stack direction="row" style={{ margin: '40px' }} justifyContent="space-evenly">
				<Box component={'div'} className={'form_row'} style={{ width: '300px' }}>
					<Typography style={{ color: '#7f838d', margin: '10px' }} variant="h3">
						Category
					</Typography>
					<FormControl sx={{ width: '100%', background: 'white' }}>
						<Select
							value={articleCategory}
							onChange={changeCategoryHandler}
							displayEmpty
							inputProps={{ 'aria-label': 'Without label' }}
						>
							<MenuItem value={BoardArticleCategory.FREE}>
								<span>Free</span>
							</MenuItem>
							<MenuItem value={BoardArticleCategory.HUMOR}>Humor</MenuItem>
							<MenuItem value={BoardArticleCategory.NEWS}>News</MenuItem>
							<MenuItem value={BoardArticleCategory.RECOMMEND}>Recommendation</MenuItem>
						</Select>
					</FormControl>
				</Box>
				<Box component={'div'} style={{ width: '300px', flexDirection: 'column' }}>
					<Typography style={{ color: '#7f838d', margin: '10px' }} variant="h3">
						Title
					</Typography>
					<TextField
						onChange={articleTitleHandler}
						value={articleTitle}
						id="filled-basic"
						label="Type Title"
						style={{ width: '300px', background: 'white' }}
					/>
				</Box>
			</Stack>

			<Editor
				initialValue={'Type here'}
				placeholder={'Type here'}
				previewStyle={'vertical'}
				height={'640px'}
				// @ts-ignore
				initialEditType={'WYSIWYG'}
				toolbarItems={[
					['heading', 'bold', 'italic', 'strike'],
					['image', 'table', 'link'],
					['ul', 'ol', 'task'],
				]}
				ref={editorRef}
				hooks={{
					addImageBlobHook: async (image: any, callback: any) => {
						const uploadedImageURL = await uploadImage(image);
						callback(uploadedImageURL);
						return false;
					},
				}}
				events={{
					load: function (param: any) {},
				}}
			/>

			<Stack direction="row" justifyContent="center" sx={{ marginTop: '30px', marginBottom: '30px' }}>
				<Button
					variant="contained"
					color="primary"
					sx={{
						width: '300px',
						height: '50px',
						borderRadius: '12px',
						backgroundColor: '#8B4513',
						fontSize: '16px',
						fontWeight: 600,
						textTransform: 'none',
						'&:hover': {
							backgroundColor: '#6B3410',
						},
						'&:disabled': {
							backgroundColor: '#cccccc',
							color: '#666666',
						},
					}}
					onClick={handleRegisterButton}
					disabled={doDisabledCheck()}
				>
					{creating ? 'Yaratilmoqda...' : 'Yaratish'}
				</Button>
			</Stack>
		</Stack>
	);
};

export default TuiEditor;
