import {
	useReactTable,
	getCoreRowModel,
	createColumnHelper,
	flexRender,
	CellContext,
	SortingState,
	getSortedRowModel,
} from '@tanstack/react-table'
import { useControls } from 'leva'
import { useMemo, useRef, useState } from 'react'
import { COLOR_RATES } from './SongUI'
import { useStore } from './store'
import { SongData } from './types'
import * as algos from './algos'

const columnHelper = createColumnHelper<SongData>()

const RenderRate = ({
	info,
	diff,
}: {
	info: CellContext<SongData, number> | CellContext<SongData, number | undefined>
	diff?: boolean
}) => {
	const value = info.getValue()
	if (value === undefined) return null

	const rate = info.row.original.rate
	const delta = Math.abs(rate - value) / value

	const background = diff
		? info.column.id === 'rate' || rate === undefined
			? 'transparent'
			: // : COLOR_RATES[Math.floor(10 - delta * 10)]
			(rate < 5 && value < 5) || (rate >= 5 && value >= 5)
			? '#00b300'
			: '#e60000'
		: COLOR_RATES[Math.max(0, Math.floor(value - 1))]
	return (
		<div style={{ background }}>
			{value?.toFixed(2)}
			{info.column.id !== 'rate' && rate !== undefined && <span>{(delta * 100).toFixed(2)}%</span>}
		</div>
	)
}

const columns = (diff: boolean) => [
	columnHelper.accessor('key', {}),
	columnHelper.accessor('song', {}),
	columnHelper.accessor('positions', {
		id: 'figure note',
		header: 'notes',
		cell: (info) => info.getValue().length,
	}),
	columnHelper.accessor('rate', {
		id: 'figure rate',
		cell: (info) => <RenderRate info={info} diff={diff} />,
	}),
	...Object.keys(algos).map((algo) =>
		columnHelper.accessor(algo as any, {
			id: `figure ${algo}`,
			cell: (info) => <RenderRate info={info} diff={diff} />,
		})
	),
]

export const Table = ({ data }: { data: SongData[] }) => {
	const [sorting, setSorting] = useState<SortingState>([])

	const { diff, filterSongs } = useControls('table', {
		diff: { value: false, hint: 'highlight differences with rate', label: 'mark errors' },
		filterSongs: { value: false, label: 'filter songs' },
	})

	const selectedSong = useStore((s) => s.selectedSong)
	const selectedSongRef = useRef(selectedSong)
	selectedSongRef.current = selectedSong

	const _data = useMemo(
		() =>
			data.filter((s) => {
				let filter = !s.key.includes('__SOLUTION')
				if (filterSongs) filter &&= s.song === selectedSongRef.current
				return filter
			}),
		[data, filterSongs]
	)

	const table = useReactTable({
		data: _data,
		columns: columns(diff),
		state: {
			sorting,
		},
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	})

	return (
		<div className="table-wrapper">
			<table className="sticky">
				<thead>
					{table.getHeaderGroups().map((headerGroup) => (
						<tr key={headerGroup.id}>
							{headerGroup.headers.map((header) => (
								<th key={header.id} className={header.column.id}>
									{header.isPlaceholder ? null : (
										<div
											{...{
												className: header.column.getCanSort() ? 'cursor-pointer select-none' : '',
												onClick: header.column.getToggleSortingHandler(),
											}}
										>
											{flexRender(header.column.columnDef.header, header.getContext())}
											{{
												asc: ' 🔼',
												desc: ' 🔽',
											}[header.column.getIsSorted() as string] ?? null}
										</div>
									)}
								</th>
							))}
						</tr>
					))}
				</thead>
			</table>
			<table>
				<tbody>
					{table.getRowModel().rows.map((row) => (
						<tr key={row.id}>
							{row.getVisibleCells().map((cell) => {
								return (
									<td
										key={cell.id}
										className={cell.column.id}
										{...(cell.column.id === 'key' && {
											onClick: () => {
												useStore.setState({
													selectedDataKey: row.original.key,
													selectedSong: row.original.song,
												})
											},
										})}
									>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</td>
								)
							})}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}
