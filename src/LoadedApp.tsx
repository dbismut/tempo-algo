import { useMemo } from 'react'
import {
	LineChart,
	Line,
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
import { button, Leva, useControls } from 'leva'

import './data'

import { COLOR_RATES, SongUI } from './SongUI'
import { setSelectedDataKey, setSelectedSong, useStore } from './store'
import { SongData } from './types'
import { CurveType } from 'recharts/types/shape/Curve'
import * as algos from './algos'
import { Table } from './Table'

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
						// @ts-ignore
						s[algoName] = algo(solutionData, s) * 10
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
			// @ts-ignore
			attempt[visualize].forEach((k, i) => {
				_data[i] = Object.assign({}, _data[i], { [attempt.key]: k })
			})
		}
		return { data: _data, series: _series, solutionKey }
	}, [groupedResults, songName, visualize, filter])

	return (
		<>
			<Leva titleBar={{ filter: false }} />
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
					<LineChart
						width={window.innerWidth}
						height={window.innerHeight * 0.4}
						data={data}
						margin={{
							right: 30,
							left: 30,
						}}
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
								<Line
									key={n}
									dot={false}
									type={curve as CurveType}
									onClick={() => setSelectedDataKey(n as any)}
									dataKey={n}
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
							<Line
								type={curve as CurveType}
								dot={false}
								dataKey={solutionKey}
								stroke="#008330"
								// @ts-ignore
								opacity={selectedDataKey && selectedDataKey !== solutionKey ? 0.5 : 0.8}
								strokeWidth={2}
							/>
						)}
					</LineChart>
					{/* {solutionKey && selectedDataKey && (
					<AreaChart data={data} width={400} height={300}>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis />
						<YAxis />
						<Area stackId="pv" dataKey={solutionKey} stroke="#F00" fill="transparent" />
						<Area stackId="pv" dataKey={selectedDataKey} stroke="#82ca9d" fill="#82ca9d" />
					</AreaChart>
				)} */}
				</div>
			</div>
			<Table data={results}></Table>
		</>
	)
}
