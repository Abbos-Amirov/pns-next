import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
	TableCell,
	TableHead,
	TableBody,
	TableRow,
	Table,
	TableContainer,
	Button,
	Menu,
	Fade,
	MenuItem,
	Chip,
} from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { Stack } from '@mui/material';
import Moment from 'react-moment';

type Order = 'asc' | 'desc';

interface Data {
	category: string;
	qna_case_status: string;
	title: string;
	writer: string;
	date: string;
	status: string;
	id?: string;
}

interface HeadCell {
	disablePadding: boolean;
	id: keyof Data;
	label: string;
	numeric: boolean;
}

const headCells: readonly HeadCell[] = [
	{
		id: 'category',
		numeric: true,
		disablePadding: false,
		label: 'CATEGORY',
	},
	{
		id: 'title',
		numeric: true,
		disablePadding: false,
		label: 'TITLE',
	},
	{
		id: 'writer',
		numeric: true,
		disablePadding: false,
		label: 'WRITER',
	},
	{
		id: 'date',
		numeric: true,
		disablePadding: false,
		label: 'DATE',
	},
	{
		id: 'qna_case_status',
		numeric: false,
		disablePadding: false,
		label: 'QNA STATUS',
	},
];

interface EnhancedTableProps {
	numSelected: number;
	onRequestSort: (event: React.MouseEvent<unknown>, property: keyof Data) => void;
	onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
	order: Order;
	orderBy: string;
	rowCount: number;
}

function EnhancedTableHead(props: EnhancedTableProps) {
	return (
		<TableHead>
			<TableRow>
				{headCells.map((headCell) => (
					<TableCell
						key={headCell.id}
						align={headCell.numeric ? 'left' : 'center'}
						padding={headCell.disablePadding ? 'none' : 'normal'}
					>
						{headCell.label}
					</TableCell>
				))}
			</TableRow>
		</TableHead>
	);
}

interface InquiryArticle {
	_id: string;
	category: string;
	title: string;
	content?: string;
	writer?: string;
	writerName?: string;
	writerImage?: string;
	date?: string;
	qna_case_status?: string;
	status?: string;
	createdAt?: string;
	updatedAt?: string;
}

interface InquiryPanelListType {
	dense?: boolean;
	inquiryArticles?: InquiryArticle[];
	anchorEl?: any;
	handleMenuIconClick?: any;
	handleMenuIconClose?: any;
	updateArticleHandler?: any;
	removeArticleHandler?: any;
}

export const InquiryList = (props: InquiryPanelListType) => {
	const {
		dense,
		inquiryArticles = [],
		anchorEl,
		handleMenuIconClick,
		handleMenuIconClose,
		updateArticleHandler,
		removeArticleHandler,
	} = props;
	const router = useRouter();

	/** APOLLO REQUESTS **/
	/** LIFECYCLES **/
	/** HANDLERS **/

	const getCategoryColor = (category: string) => {
		const categories: { [key: string]: { bg: string; color: string } } = {
			product: { bg: 'rgba(22, 70, 193, 0.1)', color: '#1646C1' },
			payment: { bg: 'rgba(233, 44, 40, 0.1)', color: '#E92C28' },
			service: { bg: 'rgba(139, 69, 19, 0.1)', color: '#8B4513' },
			technical: { bg: 'rgba(34, 154, 22, 0.1)', color: '#229a16' },
			other: { bg: 'rgba(117, 117, 117, 0.1)', color: '#757575' },
		};
		return categories[category?.toLowerCase()] || { bg: 'rgba(139, 69, 19, 0.1)', color: '#8B4513' };
	};

	const getStatusColor = (status: string) => {
		switch (status?.toUpperCase()) {
			case 'PENDING':
				return { bg: 'rgba(255, 152, 0, 0.1)', color: '#FF9800', className: 'status-pending' };
			case 'RESOLVED':
				return { bg: 'rgba(34, 154, 22, 0.1)', color: '#229a16', className: 'status-resolved' };
			case 'ACTIVE':
				return { bg: 'rgba(22, 70, 193, 0.1)', color: '#1646C1', className: 'status-active' };
			case 'CLOSED':
				return { bg: 'rgba(117, 117, 117, 0.1)', color: '#757575', className: 'status-closed' };
			default:
				return { bg: 'rgba(139, 69, 19, 0.1)', color: '#8B4513', className: 'status-default' };
		}
	};

	return (
		<Stack>
			<TableContainer>
				<Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size={dense ? 'small' : 'medium'} className={'inquiry-table'}>
					{/*@ts-ignore*/}
					<EnhancedTableHead
						numSelected={0}
						onSelectAllClick={() => {}}
						rowCount={inquiryArticles.length}
						onRequestSort={() => {}}
						order={'asc'}
						orderBy={''}
					/>
					<TableBody>
						{inquiryArticles.length === 0 && (
							<TableRow>
								<TableCell align="center" colSpan={5} className={'inquiry-no-data'}>
									<Typography variant={'body2'} className={'inquiry-no-data-text'}>
										No inquiry articles found
									</Typography>
								</TableCell>
							</TableRow>
						)}

						{inquiryArticles.length !== 0 &&
							inquiryArticles.map((article: InquiryArticle, index: number) => {
								const categoryColors = getCategoryColor(article.category);
								const statusColors = getStatusColor(article.qna_case_status || article.status || '');
								const writerImage = article.writerImage || '/img/profile/defaultUser.svg';
								const writerName = article.writer || article.writerName || 'User';

								return (
									<TableRow hover key={article._id || index} className={'inquiry-table-row'}>
										<TableCell align="left" className={'inquiry-category-cell'}>
											<Chip
												label={article.category || 'N/A'}
												className={`inquiry-category-chip category-${article.category?.toLowerCase() || 'default'}`}
											/>
										</TableCell>
										<TableCell align="left" className={'inquiry-title-cell'}>
											<Typography variant={'body2'} className={'inquiry-title-text'}>
												{article.title || 'N/A'}
											</Typography>
										</TableCell>
										<TableCell align="left" className={'inquiry-writer-cell'}>
											<Stack direction={'row'} alignItems={'center'} spacing={1.5}>
												<Avatar
													alt={writerName}
													src={writerImage}
													className={'inquiry-writer-avatar'}
												/>
												<Typography variant={'body2'} className={'inquiry-writer-name'}>
													{writerName}
												</Typography>
											</Stack>
										</TableCell>
										<TableCell align="left" className={'inquiry-date-cell'}>
											{article.createdAt ? (
												<Moment format="YYYY-MM-DD" className={'inquiry-date-text'}>
													{article.createdAt}
												</Moment>
											) : (
												<Typography variant={'body2'} className={'inquiry-date-text'}>
													{article.date || 'N/A'}
												</Typography>
											)}
										</TableCell>
										<TableCell align="center" className={'inquiry-status-cell'}>
											<Button
												onClick={(e: any) => handleMenuIconClick && handleMenuIconClick(e, index)}
												className={`inquiry-status-badge ${statusColors.className || ''}`}
											>
												{article.qna_case_status || article.status || 'N/A'}
											</Button>

											{handleMenuIconClick && anchorEl && (
												<Menu
													className={'menu-modal inquiry-status-menu'}
													MenuListProps={{
														'aria-labelledby': 'fade-button',
													}}
													anchorEl={anchorEl[index]}
													open={Boolean(anchorEl[index])}
													onClose={handleMenuIconClose}
													TransitionComponent={Fade}
													sx={{ p: 1 }}
												>
													<MenuItem
														onClick={() => {
															if (updateArticleHandler) {
																updateArticleHandler({ _id: article._id, qna_case_status: 'PENDING' });
															}
															if (handleMenuIconClose) handleMenuIconClose();
														}}
													>
														<Typography variant={'subtitle1'} component={'span'}>
															PENDING
														</Typography>
													</MenuItem>
													<MenuItem
														onClick={() => {
															if (updateArticleHandler) {
																updateArticleHandler({ _id: article._id, qna_case_status: 'RESOLVED' });
															}
															if (handleMenuIconClose) handleMenuIconClose();
														}}
													>
														<Typography variant={'subtitle1'} component={'span'}>
															RESOLVED
														</Typography>
													</MenuItem>
													<MenuItem
														onClick={() => {
															if (updateArticleHandler) {
																updateArticleHandler({ _id: article._id, qna_case_status: 'CLOSED' });
															}
															if (handleMenuIconClose) handleMenuIconClose();
														}}
													>
														<Typography variant={'subtitle1'} component={'span'}>
															CLOSED
														</Typography>
													</MenuItem>
												</Menu>
											)}
										</TableCell>
									</TableRow>
								);
							})}
					</TableBody>
				</Table>
			</TableContainer>
		</Stack>
	);
};
