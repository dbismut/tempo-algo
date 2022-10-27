import {
	useReactTable,
	getCoreRowModel,
	createColumnHelper,
	flexRender,
	CellContext,
	SortingState,
	getSortedRowModel,
} from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { COLOR_RATES } from './SongUI'
import { useStore } from './store'
import { SongData } from './types'

const columnHelper = createColumnHelper<SongData>()

const RenderRate = (info: CellContext<SongData, number>) => {
	const value = info.getValue()
	return (
		<div style={{ background: COLOR_RATES[Math.max(0, Math.floor(value - 1))] }}>
			{value?.toFixed(2)}
		</div>
	)
}

const columns = [
	columnHelper.accessor('key', {}),
	columnHelper.accessor('song', {}),
	columnHelper.accessor('positions', {
		header: 'Notes',
		cell: (info) => info.getValue().length,
	}),
	columnHelper.accessor('rate', { id: 'rate', cell: RenderRate }),
	columnHelper.accessor('area', { id: 'rate area', cell: RenderRate }),
	columnHelper.accessor('ivan', { id: 'rate ivan', cell: RenderRate }),
]

export const Table = ({ data }: { data: SongData[] }) => {
	const _data = useMemo(() => data.filter((s) => s.key !== '__SOLUTION'), [data])
	const [sorting, setSorting] = useState<SortingState>([])
	const table = useReactTable({
		data: _data,
		columns,
		state: {
			sorting,
		},
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	})

	return (
		<div className="table-wrapper">
			<table>
				<thead>
					{table.getHeaderGroups().map((headerGroup) => (
						<tr key={headerGroup.id}>
							{headerGroup.headers.map((header) => (
								<th key={header.id}>
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
				<tbody>
					{table.getRowModel().rows.map((row) => (
						<tr
							key={row.id}
							onClick={() => {
								useStore.setState({
									selectedDataKey: row.original.key,
									selectedSong: row.original.song,
								})
							}}
						>
							{row.getVisibleCells().map((cell) => {
								return (
									<td key={cell.id} className={cell.column.id}>
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
