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
	IconButton,
	Tooltip,
} from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { Stack } from '@mui/material';
import Moment from 'react-moment';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';

interface Data {
	category: string;
	title: string;
	writer: string;
	date: string;
	status: string;
	id?: string;
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
	if (b[orderBy] < a[orderBy]) {
		return -1;
	}
	if (b[orderBy] > a[orderBy]) {
		return 1;
	}
	return 0;
}

type Order = 'asc' | 'desc';

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
		id: 'status',
		numeric: false,
		disablePadding: false,
		label: 'STATUS',
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
	const { onSelectAllClick } = props;

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

interface FaqArticle {
	_id: string;
	category: string;
	title: string;
	content?: string;
	writer?: string;
	writerName?: string;
	writerImage?: string;
	date?: string;
	status: string;
	createdAt?: string;
	updatedAt?: string;
}

interface FaqArticlesPanelListType {
	dense?: boolean;
	faqArticles?: FaqArticle[];
	anchorEl?: any;
	handleMenuIconClick?: any;
	handleMenuIconClose?: any;
	updateArticleHandler?: any;
	removeArticleHandler?: any;
}

export const FaqArticlesPanelList = (props: FaqArticlesPanelListType) => {
	const {
		dense,
		faqArticles = [],
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

	const getStatusColor = (status: string) => {
		switch (status?.toUpperCase()) {
			case 'ACTIVE':
				return { bg: 'rgba(34, 154, 22, 0.1)', color: '#229a16', className: 'status-active' };
			case 'BLOCKED':
				return { bg: 'rgba(255, 152, 0, 0.1)', color: '#FF9800', className: 'status-blocked' };
			case 'DELETED':
				return { bg: 'rgba(117, 117, 117, 0.1)', color: '#757575', className: 'status-deleted' };
			default:
				return { bg: 'rgba(139, 69, 19, 0.1)', color: '#8B4513', className: 'status-default' };
		}
	};

	const getCategoryColor = (category: string) => {
		const categories: { [key: string]: { bg: string; color: string } } = {
			property: { bg: 'rgba(22, 70, 193, 0.1)', color: '#1646C1' },
			payment: { bg: 'rgba(233, 44, 40, 0.1)', color: '#E92C28' },
			buyers: { bg: 'rgba(139, 69, 19, 0.1)', color: '#8B4513' },
			agents: { bg: 'rgba(34, 154, 22, 0.1)', color: '#229a16' },
			membership: { bg: 'rgba(255, 152, 0, 0.1)', color: '#FF9800' },
			community: { bg: 'rgba(171, 71, 188, 0.1)', color: '#ab47bc' },
			other: { bg: 'rgba(117, 117, 117, 0.1)', color: '#757575' },
		};
		return categories[category?.toLowerCase()] || { bg: 'rgba(139, 69, 19, 0.1)', color: '#8B4513' };
	};

	return (
		<Stack>
			<TableContainer>
				<Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size={dense ? 'small' : 'medium'} className={'faq-table'}>
					{/*@ts-ignore*/}
					<EnhancedTableHead />
					<TableBody>
						{faqArticles.length === 0 && (
							<TableRow>
								<TableCell align="center" colSpan={5} className={'faq-no-data'}>
									<Typography variant={'body2'} className={'faq-no-data-text'}>
										No FAQ articles found
									</Typography>
								</TableCell>
							</TableRow>
						)}

						{faqArticles.length !== 0 &&
							faqArticles.map((article: FaqArticle, index: number) => {
								const statusColors = getStatusColor(article.status);
								const categoryColors = getCategoryColor(article.category);

								return (
									<TableRow hover key={article._id || index} className={'faq-table-row'}>
										<TableCell align="left" className={'faq-category-cell'}>
											<Chip
												label={article.category || 'N/A'}
												className={`faq-category-chip category-${article.category?.toLowerCase() || 'default'}`}
												sx={{
													backgroundColor: categoryColors.bg,
													color: categoryColors.color,
													fontWeight: 600,
												}}
											/>
										</TableCell>
										<TableCell align="left" className={'faq-title-cell'}>
											<Typography variant={'body2'} className={'faq-title-text'}>
												{article.title || 'N/A'}
											</Typography>
										</TableCell>
										<TableCell align="left" className={'faq-writer-cell'}>
											<Typography variant={'body2'} className={'faq-writer-name'}>
												Admin
											</Typography>
										</TableCell>
										<TableCell align="left" className={'faq-date-cell'}>
											{article.createdAt ? (
												<Moment format="YYYY-MM-DD HH:mm" className={'faq-date-text'}>
													{article.createdAt}
												</Moment>
											) : (
												<Typography variant={'body2'} className={'faq-date-text'}>
													{article.date || 'N/A'}
												</Typography>
											)}
										</TableCell>
										<TableCell align="center" className={'faq-status-cell'}>
											<Stack direction={'row'} alignItems={'center'} spacing={1} justifyContent={'center'}>
												<Button
													onClick={(e: any) => handleMenuIconClick && handleMenuIconClick(e, index)}
													className={`faq-status-badge ${statusColors.className || ''}`}
												>
													{article.status || 'N/A'}
												</Button>

												{/* Update va Delete buttonlar - faqat ACTIVE status'da */}
												{article.status === 'ACTIVE' && (
													<>
														<Tooltip title="Edit FAQ">
															<IconButton
																size="small"
																onClick={() => {
																	if (updateArticleHandler) {
																		updateArticleHandler({ _id: article._id, action: 'edit' });
																	}
																}}
																className={'faq-edit-btn'}
																sx={{
																	color: '#1646C1',
																	'&:hover': {
																		backgroundColor: 'rgba(22, 70, 193, 0.1)',
																	},
																}}
															>
																<EditRoundedIcon fontSize="small" />
															</IconButton>
														</Tooltip>
														<Tooltip title="Delete FAQ">
															<IconButton
																size="small"
																onClick={() => {
																	if (removeArticleHandler) {
																		removeArticleHandler(article._id);
																	}
																}}
																className={'faq-delete-btn'}
																sx={{
																	color: '#E92C28',
																	'&:hover': {
																		backgroundColor: 'rgba(233, 44, 40, 0.1)',
																	},
																}}
															>
																<DeleteRoundedIcon fontSize="small" />
															</IconButton>
														</Tooltip>
													</>
												)}

												{handleMenuIconClick && anchorEl && (
													<Menu
														className={'menu-modal faq-status-menu'}
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
																	updateArticleHandler({ _id: article._id, status: 'ACTIVE' });
																}
																if (handleMenuIconClose) handleMenuIconClose();
															}}
														>
															<Typography variant={'subtitle1'} component={'span'}>
																ACTIVE
															</Typography>
														</MenuItem>
														<MenuItem
															onClick={() => {
																if (updateArticleHandler) {
																	updateArticleHandler({ _id: article._id, status: 'BLOCKED' });
																}
																if (handleMenuIconClose) handleMenuIconClose();
															}}
														>
															<Typography variant={'subtitle1'} component={'span'}>
																BLOCKED
															</Typography>
														</MenuItem>
														<MenuItem
															onClick={() => {
																if (updateArticleHandler) {
																	updateArticleHandler({ _id: article._id, status: 'DELETED' });
																}
																if (handleMenuIconClose) handleMenuIconClose();
															}}
														>
															<Typography variant={'subtitle1'} component={'span'}>
																DELETED
															</Typography>
														</MenuItem>
													</Menu>
												)}
											</Stack>
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
