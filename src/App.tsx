import { useEffect, useState } from 'react'
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
import { groupBy, keyBy } from 'lodash-es'
import { button, Leva, useControls } from 'leva'

import './data'
import { fetchData } from './data'

import { COLOR_RATES, SongUI } from './SongUI'
import { useStore } from './store'
import { SongData } from './types'
import { CurveType } from 'recharts/types/shape/Curve'
import * as algos from './algos'

export default function App() {
	const { loading, results } = useStore()
	const groupedResults = useMemo(() => {
		const _g = groupBy(results, 'song')
		const _groupedResults = {} as _.Dictionary<_.Dictionary<SongData>>
		for (const key in _g) {
			_groupedResults[key] = keyBy(_g[key], 'key')
		}

		return _groupedResults
	}, [results])

	useEffect(() => {
		fetchData()
	}, [])

	const songKeys = useMemo(
		() =>
			Object.keys(groupedResults).sort(
				(a, b) => Object.keys(groupedResults[b]).length - Object.keys(groupedResults[a]).length
			),
		[groupedResults]
	)

	const [songIndex, setSongIndex] = useState(0)

	const songName = songKeys[songIndex]

	const [selectedDataKey, setSelectedDataKey] = useState<
		keyof _.Dictionary<SongData>[typeof songName] | null
	>(null)

	const selectedDataSet = useMemo(
		() => (songName && selectedDataKey ? groupedResults[songName][selectedDataKey] : null),
		[groupedResults, selectedDataKey, songName]
	)

	const { visualize, curve, algo, filter } = useControls(
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
			algo: { options: algos },
			'unselect song': button(() => setSelectedDataKey(null), { disabled: !selectedDataKey }),
		},
		[selectedDataKey]
	)

	const { data, series } = useMemo(() => {
		if (loading) return { data: [], series: [] }
		const _data: Record<string, number>[] = []
		const _series: string[] = []
		const solutionData = groupedResults[songName]['__SOLUTION']

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
			if (key !== '__SOLUTION') _series.push(key)
			attempt.score = algo(solutionData, attempt, visualize)
			// @ts-ignore
			attempt[visualize].forEach((k, i) => {
				_data[i] = Object.assign({}, _data[i], { [attempt.key]: k })
			})
		}
		return { data: _data, series: _series }
	}, [loading, groupedResults, songName, visualize, filter, algo])

	if (loading) return <>Loading…</>

	return (
		<>
			<Leva titleBar={{ filter: false }} />
			<nav>
				<select
					onChange={(v) => {
						setSongIndex(~~v.target.value)
						setSelectedDataKey(null)
					}}
				>
					{songKeys.map((s, i) => (
						<option key={s} value={i}>
							{s}
						</option>
					))}
				</select>
				{selectedDataSet && <SongUI dataSet={selectedDataSet} />}
			</nav>
			<div className="wrapper">
				<LineChart
					width={window.innerWidth}
					height={window.innerHeight * 0.6}
					data={data}
					margin={{
						top: 5,
						right: 30,
						left: 20,
						bottom: 5,
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
									{songData.rate && (
										<span
											style={{
												fontSize: '0.8em',
											}}
										>
											{' '}
											({songData.rate})
										</span>
									)}
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
					<Line
						type={curve as CurveType}
						dot={false}
						dataKey={'__SOLUTION'}
						stroke="#008330"
						// @ts-ignore
						opacity={selectedDataKey && selectedDataKey !== '__SOLUTION' ? 0.5 : 0.8}
						strokeWidth={2}
					/>
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
		</>
	)
}
