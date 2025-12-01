import React, { useState } from 'react';
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
	Checkbox,
	Chip,
} from '@mui/material';
import Avatar from '@mui/material/Avatar';
import { IconButton, Tooltip } from '@mui/material';
import Typography from '@mui/material/Typography';
import { Stack } from '@mui/material';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import Moment from 'react-moment';

type Order = 'asc' | 'desc';

interface Data {
	category: string;
	title: string;
	id: string;
	writer: string;
	date: string;
	view: number;
	action: string;
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
		id: 'id',
		numeric: true,
		disablePadding: false,
		label: 'ID',
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
		id: 'view',
		numeric: true,
		disablePadding: false,
		label: 'VIEW',
	},
	{
		id: 'action',
		numeric: false,
		disablePadding: false,
		label: 'ACTION',
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
	const { onSelectAllClick, numSelected, rowCount } = props;

	return (
		<TableHead>
			<TableRow>
				<TableCell padding="checkbox">
					<Checkbox
						color="primary"
						indeterminate={numSelected > 0 && numSelected < rowCount}
						checked={rowCount > 0 && numSelected === rowCount}
						onChange={onSelectAllClick}
						inputProps={{
							'aria-label': 'select all',
						}}
					/>
				</TableCell>
				{headCells.map((headCell) => (
					<TableCell
						key={headCell.id}
						align={headCell.numeric ? 'left' : 'right'}
						padding={headCell.disablePadding ? 'none' : 'normal'}
					>
						{headCell.label}
					</TableCell>
				))}
			</TableRow>
		</TableHead>
	);
}

interface NoticeArticle {
	_id: string;
	category: string;
	title: string;
	content?: string;
	writer?: string;
	writerName?: string;
	writerImage?: string;
	date?: string;
	view?: number;
	status?: string;
	createdAt?: string;
	updatedAt?: string;
}

interface NoticeListType {
	dense?: boolean;
	noticeArticles?: NoticeArticle[];
	anchorEl?: any;
	handleMenuIconClick?: any;
	handleMenuIconClose?: any;
	updateArticleHandler?: any;
	removeArticleHandler?: any;
}

export const NoticeList = (props: NoticeListType) => {
	const {
		dense,
		noticeArticles = [],
		anchorEl,
		handleMenuIconClick,
		handleMenuIconClose,
		updateArticleHandler,
		removeArticleHandler,
	} = props;
	const router = useRouter();
	const [selected, setSelected] = useState<string[]>([]);

	/** APOLLO REQUESTS **/
	/** LIFECYCLES **/
	/** HANDLERS **/

	const getCategoryColor = (category: string) => {
		const categories: { [key: string]: { bg: string; color: string } } = {
			important: { bg: 'rgba(233, 44, 40, 0.1)', color: '#E92C28' },
			general: { bg: 'rgba(139, 69, 19, 0.1)', color: '#8B4513' },
			update: { bg: 'rgba(34, 154, 22, 0.1)', color: '#229a16' },
			maintenance: { bg: 'rgba(255, 152, 0, 0.1)', color: '#FF9800' },
			other: { bg: 'rgba(117, 117, 117, 0.1)', color: '#757575' },
		};
		return categories[category?.toLowerCase()] || { bg: 'rgba(139, 69, 19, 0.1)', color: '#8B4513' };
	};

	const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.checked) {
			const newSelected = noticeArticles.map((n) => n._id);
			setSelected(newSelected);
			return;
		}
		setSelected([]);
	};

	const handleSelectClick = (id: string) => {
		const selectedIndex = selected.indexOf(id);
		let newSelected: string[] = [];

		if (selectedIndex === -1) {
			newSelected = newSelected.concat(selected, id);
		} else if (selectedIndex === 0) {
			newSelected = newSelected.concat(selected.slice(1));
		} else if (selectedIndex === selected.length - 1) {
			newSelected = newSelected.concat(selected.slice(0, -1));
		} else if (selectedIndex > 0) {
			newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
		}

		setSelected(newSelected);
	};

	const isSelected = (id: string) => selected.indexOf(id) !== -1;

	return (
		<Stack>
			<TableContainer>
				<Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size={dense ? 'small' : 'medium'} className={'notice-table'}>
					{/*@ts-ignore*/}
					<EnhancedTableHead
						numSelected={selected.length}
						onSelectAllClick={handleSelectAllClick}
						rowCount={noticeArticles.length}
						onRequestSort={() => {}}
						order={'asc'}
						orderBy={''}
					/>
					<TableBody>
						{noticeArticles.length === 0 && (
							<TableRow>
								<TableCell align="center" colSpan={8} className={'notice-no-data'}>
									<Typography variant={'body2'} className={'notice-no-data-text'}>
										No notice articles found
									</Typography>
								</TableCell>
							</TableRow>
						)}

						{noticeArticles.length !== 0 &&
							noticeArticles.map((article: NoticeArticle, index: number) => {
								const categoryColors = getCategoryColor(article.category);
								const writerImage = article.writerImage || '/img/profile/defaultUser.svg';
								const writerName = article.writer || article.writerName || 'Admin';
								const isItemSelected = isSelected(article._id);

								return (
									<TableRow
										hover
										key={article._id || index}
										className={'notice-table-row'}
										selected={isItemSelected}
									>
										<TableCell padding="checkbox">
											<Checkbox
												color="primary"
												checked={isItemSelected}
												onClick={() => handleSelectClick(article._id)}
											/>
										</TableCell>
										<TableCell align="left" className={'notice-category-cell'}>
											<Chip
												label={article.category || 'N/A'}
												className={`notice-category-chip category-${article.category?.toLowerCase() || 'default'}`}
											/>
										</TableCell>
										<TableCell align="left" className={'notice-title-cell'}>
											<Typography variant={'body2'} className={'notice-title-text'}>
												{article.title || 'N/A'}
											</Typography>
										</TableCell>
										<TableCell align="left" className={'notice-id-cell'}>
											<Typography variant={'body2'} className={'notice-id-text'}>
												{article._id || 'N/A'}
											</Typography>
										</TableCell>
										<TableCell align="left" className={'notice-writer-cell'}>
											<Stack direction={'row'} alignItems={'center'} spacing={1.5}>
												<Avatar
													alt={writerName}
													src={writerImage}
													className={'notice-writer-avatar'}
												/>
												<Typography variant={'body2'} className={'notice-writer-name'}>
													{writerName}
												</Typography>
											</Stack>
										</TableCell>
										<TableCell align="left" className={'notice-date-cell'}>
											{article.createdAt ? (
												<Moment format="YYYY-MM-DD" className={'notice-date-text'}>
													{article.createdAt}
												</Moment>
											) : (
												<Typography variant={'body2'} className={'notice-date-text'}>
													{article.date || 'N/A'}
												</Typography>
											)}
										</TableCell>
										<TableCell align="left" className={'notice-view-cell'}>
											<Typography variant={'body2'} className={'notice-view-text'}>
												{article.view || 0}
											</Typography>
										</TableCell>
										<TableCell align="right" className={'notice-action-cell'}>
											<Tooltip title="Edit">
												<IconButton
													onClick={() => router.push(`/_admin/cs/notice_create?id=${article._id}`)}
													className={'notice-edit-btn'}
												>
													<EditRoundedIcon />
												</IconButton>
											</Tooltip>
											<Tooltip title="Delete">
												<IconButton
													onClick={() => removeArticleHandler && removeArticleHandler(article._id)}
													className={'notice-delete-btn'}
												>
													<DeleteRoundedIcon />
												</IconButton>
											</Tooltip>
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
