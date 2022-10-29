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

type Conclusion = { sum: number; errorWhenRight: number; errorWhenWrong: number; count: number }

const stringify = (concl: Conclusion) => `avg score: ${(concl.sum / concl.count).toFixed(2)}
err. total: ${concl.errorWhenRight + concl.errorWhenWrong}
err. when right: ${concl.errorWhenRight}
err. when wrong: ${concl.errorWhenWrong}`

const columnHelper = createColumnHelper<SongData>()

declare module '@tanstack/table-core' {
	interface ColumnMeta<TData extends RowData, TValue> {
		className?: string
		isAlgo?: boolean
	}
}

const RenderRate = ({
	info,
	markErrors,
}: {
	info: CellContext<SongData, number | undefined>
	markErrors?: boolean
}) => {
	const value = info.getValue()
	if (value === undefined) return null
	// @ts-ignore
	const delta = info.column.id === 'rate' ? undefined : info.row.original[info.column.id]?.delta
	// @ts-ignore
	const error = info.column.id === 'rate' ? undefined : info.row.original[info.column.id]?.error

	const rate = info.row.original.rate

	const background = markErrors
		? info.column.id === 'rate' || rate === undefined
			? 'transparent'
			: error
			? rate > 5
				? '#a629ff'
				: '#e60000'
			: '#00b30088'
		: COLOR_RATES[Math.max(0, Math.floor(value - 1))]

	return (
		<div style={{ background }}>
			{value?.toFixed(2)}
			{delta !== undefined && <span>{(delta * 100).toFixed(2)}%</span>}
		</div>
	)
}

const columns = (markErrors: boolean) => [
	columnHelper.accessor('key', {
		meta: {
			className: 'cursor-pointer key',
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
		cell: (info) => <RenderRate info={info} markErrors={markErrors} />,
	}),
	...Object.keys(algos).map((algo) =>
		// @ts-ignore
		columnHelper.accessor((row) => row[algo]?.value, {
			id: algo,
			meta: {
				isAlgo: true,
				className: 'figure',
			},
			cell: (info) => <RenderRate info={info} markErrors={markErrors} />,
		})
	),
]

export const Table = ({ data, selectedSong }: { data: SongData[]; selectedSong?: string }) => {
	const [sorting, setSorting] = useState<SortingState>([])

	const { hideUnrated, markErrors, filterSongs } = useControls('table', {
		hideUnrated: { value: true, label: 'hide unrated' },
		markErrors: { value: false, hint: 'highlight differences with rate', label: 'mark errors' },
		filterSongs: { value: false, label: 'sel. song only' },
	})

	const _data = useMemo(
		() =>
			data.filter((s) => {
				let filter = !s.key.includes('__SOLUTION')
				if (hideUnrated) filter &&= s.rate !== undefined
				if (filterSongs) filter &&= s.song === selectedSong
				return filter
			}),
		[data, filterSongs, hideUnrated, selectedSong]
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
							errorWhenRight:
								// @ts-ignore
								d[algo]?.error && d.rate >= 5 ? acc.errorWhenRight + 1 : acc.errorWhenRight,
							errorWhenWrong:
								// @ts-ignore
								d[algo]?.error && d.rate < 5 ? acc.errorWhenWrong + 1 : acc.errorWhenWrong,
						}
					},
					{ errorWhenRight: 0, errorWhenWrong: 0, count: 0, sum: 0 }
				),
			})
		})
		return _conclusions
	}, [data])

	const table = useReactTable({
		data: _data,
		columns: columns(markErrors),
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
