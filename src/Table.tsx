import {
	useReactTable,
	getCoreRowModel,
	createColumnHelper,
	flexRender,
	CellContext,
	SortingState,
	getSortedRowModel,
	RowData,
} from '@tanstack/react-table'
// import * as Tooltip from '@radix-ui/react-tooltip'
import { useControls } from 'leva'
import { useMemo, useRef, useState } from 'react'
import { COLOR_RATES } from './SongUI'
import { useStore } from './store'
import { SongData } from './types'
import * as algos from './algos'

type Conclusion = { sum: number; error: number; count: number }

const stringify = (concl: Conclusion) => `avg score: ${(concl.sum / concl.count).toFixed(2)}
nb errors: ${concl.error}`

const columnHelper = createColumnHelper<SongData>()

declare module '@tanstack/table-core' {
	interface ColumnMeta<TData extends RowData, TValue> {
		className?: string
		isAlgo?: boolean
	}
}

const RenderRate = ({
	info,
	diff,
}: {
	info: CellContext<SongData, number | undefined>
	diff?: boolean
}) => {
	const value = info.getValue()
	if (value === undefined) return null
	// @ts-ignore
	const delta = info.column.id === 'rate' ? undefined : info.row.original[info.column.id]?.delta
	// @ts-ignore
	const error = info.column.id === 'rate' ? undefined : info.row.original[info.column.id]?.error

	const rate = info.row.original.rate

	const background = diff
		? info.column.id === 'rate' || rate === undefined
			? 'transparent'
			: error
			? '#00b300'
			: '#e60000'
		: COLOR_RATES[Math.max(0, Math.floor(value - 1))]

	return (
		<div style={{ background }}>
			{value?.toFixed(2)}
			{delta !== undefined && <span>{(delta * 100).toFixed(2)}%</span>}
		</div>
	)
}

const columns = (diff: boolean) => [
	columnHelper.accessor('key', {
		meta: {
			className: 'cursor-pointer select-none key',
		},
	}),
	columnHelper.accessor('song', {}),
	columnHelper.accessor('positions', {
		header: 'notes',
		meta: {
			className: 'figure',
		},
		cell: (info) => info.getValue().length,
	}),
	columnHelper.accessor('rate', {
		meta: {
			className: 'figure',
		},
		// @ts-ignore
		cell: (info) => <RenderRate info={info} diff={diff} />,
	}),
	...Object.keys(algos).map((algo) =>
		// @ts-ignore
		columnHelper.accessor((row) => row[algo]?.value, {
			id: algo,
			meta: {
				isAlgo: true,
				className: 'figure',
			},
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

	const conclusions = useMemo(() => {
		const _conclusions = {} as Record<keyof typeof algos, Conclusion>
		Object.keys(algos).forEach((algo) => {
			Object.assign(_conclusions, {
				[algo]: data.reduce(
					(acc, d) => {
						return {
							// @ts-ignore
							sum: acc.sum + d[algo]?.value || 0,
							// @ts-ignore
							count: d[algo] ? acc.count + 1 : acc.count,
							// @ts-ignore
							error: d[algo]?.error === false ? acc.error + 1 : acc.error,
						}
					},
					{ error: 0, count: 0, sum: 0 }
				),
			})
		})
		return _conclusions
	}, [data])

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
								<th
									key={header.id}
									className={header.column.columnDef.meta?.className}
									{...(header.column.columnDef.meta?.isAlgo && {
										title: stringify((conclusions as any)[header.id]),
									})}
								>
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
										className={cell.column.columnDef.meta?.className}
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
