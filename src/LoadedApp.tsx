import { useMemo } from 'react'
import {
	XAxis,
	YAxis,
	CartesianGrid,
	// Tooltip,
	Legend,
	AreaChart,
	Area,
	CartesianAxis,
} from 'recharts'
import { find, groupBy, keyBy } from 'lodash-es'
import { button, useControls } from 'leva'

import './data'

import { COLOR_RATES, SongUI } from './SongUI'
import { setSelectedDataKey, setSelectedSong, useStore } from './store'
import { SongData } from './types'
import { CurveType } from 'recharts/types/shape/Curve'
import * as algos from './algos'
import { Table } from './Table'
import { LevaThemed } from './LevaThemed'

export const LoadedApp = () => {
	const results = useStore((s) => s.results)

	const groupedResults = useMemo(() => {
		const _g = groupBy(results, 'song')
		const _groupedResults = {} as _.Dictionary<_.Dictionary<SongData>>
		for (const key in _g) {
			_groupedResults[key] = keyBy(_g[key], 'key')
			const solutionData = _g[key].find((s) => s.key.includes('__SOLUTION'))
			if (solutionData) {
				_g[key].forEach((s) => {
					Object.entries(algos).forEach(([algoName, algo]) => {
						const value = algo(solutionData, s) * 10
						// @ts-ignore
						s[algoName] = {
							value,
							delta: s.rate !== undefined ? Math.abs(s.rate - value) / value : undefined,
							error: (s.rate < 5 && value >= 5) || (s.rate >= 5 && value < 5),
						}
					})
				})
			}
		}

		return _groupedResults
	}, [results])

	const songKeys = useMemo(
		() =>
			Object.keys(groupedResults).sort(
				(a, b) => Object.keys(groupedResults[b]).length - Object.keys(groupedResults[a]).length
			),
		[groupedResults]
	)

	const songName = useStore((s) => s.selectedSong) || songKeys[0]
	const selectedDataKey = useStore((s) => s.selectedDataKey)

	const selectedDataSet = useMemo(
		() => (songName && selectedDataKey ? find(results, { key: selectedDataKey }) : null),
		[results, selectedDataKey, songName]
	)

	const { visualize, curve, filter } = useControls(
		{
			curve: { options: ['monotone', 'linear', 'step'] },
			visualize: {
				options: {
					positions: 'positions',
					'positions (rel.)': 'positionsRelative',
					'positions (cum.)': 'positionsCumulative',
					pressed: 'pressed',
				},
			},
			filter: { options: ['all', 'correct', 'incorrect', 'not rated'] },
			'unselect song': button(() => setSelectedDataKey(null), { disabled: !selectedDataKey }),
		},
		[selectedDataKey]
	)

	const { data, series, solutionKey } = useMemo(() => {
		const _data: Record<string, number>[] = []
		const _series: string[] = []
		let solutionKey

		for (const key in groupedResults[songName]) {
			const attempt = groupedResults[songName][key]
			switch (filter) {
				case 'correct':
					if (!attempt.rate || attempt.rate < 5) continue
					break
				case 'incorrect':
					if (!attempt.rate || attempt.rate >= 5) continue
					break
				case 'not rated':
					if (attempt.rate !== undefined) continue
			}
			if (key.includes('__SOLUTION')) solutionKey = key
			else _series.push(key)
			const isSolAndSelected =
				key.includes('__SOLUTION') && !!selectedDataSet && selectedDataSet.key !== key
			// @ts-ignore
			attempt[visualize].forEach((k, i) => {
				_data[i] = Object.assign({}, _data[i], {
					// @ts-ignore
					[attempt.key]: isSolAndSelected ? k - selectedDataSet[visualize][i] : k,
				})
			})
		}
		return { data: _data, series: _series, solutionKey }
	}, [groupedResults, songName, visualize, filter, selectedDataSet])

	return (
		<>
			<LevaThemed />
			<div className="chart-wrapper">
				<nav>
					<select
						value={songName}
						onChange={(v) => {
							setSelectedSong(v.target.value)
							setSelectedDataKey(null)
						}}
					>
						{songKeys.map((s) => (
							<option key={s} value={s}>
								{s}
							</option>
						))}
					</select>
					{selectedDataSet && <SongUI dataSet={selectedDataSet} />}
				</nav>
				<div className="wrapper">
					<AreaChart
						width={window.innerWidth}
						height={window.innerHeight * 0.4}
						data={data}
						margin={{ right: 30, left: 30 }}
					>
						<CartesianAxis />
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis />
						<YAxis />
						{/* <Tooltip /> */}
						<Legend
							onClick={({ dataKey }) => setSelectedDataKey(dataKey)}
							formatter={(value, entry) => {
								const { color } = entry
								const songData = groupedResults[songName][value]

								return (
									<span
										style={{
											color,
											opacity: !selectedDataKey ? 1 : value === selectedDataKey ? 1 : 0.2,
										}}
									>
										{value}
										{songData.rate && <span> ({songData.rate})</span>}
									</span>
								)
							}}
						/>
						{series.map((n) => {
							const songData = groupedResults[songName][n]
							return (
								<Area
									key={n}
									type={curve as CurveType}
									onClick={() => setSelectedDataKey(n as any)}
									dataKey={n}
									fill="transparent"
									stackId={n === selectedDataKey ? 'pv' : undefined}
									baseLine={800}
									opacity={!selectedDataKey ? 0.9 : n === selectedDataKey ? 1 : 0.2}
									stroke={
										songData.rate === undefined
											? '#d2d2d2'
											: COLOR_RATES[Math.round(songData.rate - 1)]
									}
									strokeWidth={n === selectedDataKey ? 2 : 1}
								/>
							)
						})}
						{solutionKey && (
							<Area
								type={curve as CurveType}
								dataKey={solutionKey}
								stroke="#008330"
								fill={
									selectedDataKey && selectedDataKey !== solutionKey ? '#e1d200ba' : 'transparent'
								}
								stackId="pv"
								opacity={selectedDataKey && selectedDataKey !== solutionKey ? 0.5 : 0.8}
								strokeWidth={2}
							/>
						)}
					</AreaChart>
				</div>
			</div>
			<Table data={results} selectedSong={songName} />
		</>
	)
}
