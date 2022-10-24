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
} from 'recharts'

import './data'
import { fetchData } from './data'

import './styles.css'
import { COLOR_RATES, SongUI } from './SongUI'
import { useStore } from './store'
import { groupBy } from 'lodash-es'
import { button, useControls } from 'leva'

export default function App() {
	const { loading, results, songs } = useStore()
	const groupedResults = useMemo(() => groupBy(results, 'song'), [results])

	useEffect(() => {
		fetchData()
	}, [])

	const songKeys = useMemo(
		() =>
			Object.keys(groupedResults).sort((a, b) =>
				groupedResults[a].length > groupedResults[b].length ? -1 : 1
			),
		[groupedResults]
	)

	const [songIndex, setSongIndex] = useState(0)

	const songName = songKeys[songIndex]

	const [selectedDataKey, setSelectedDataKey] = useState<string | null>(null)

	const selectedDataSet = useMemo(
		() => (songName ? groupedResults[songName].find((k) => k.key === selectedDataKey) : undefined),
		[groupedResults, selectedDataKey, songName]
	)

	const { visualize } = useControls(
		{
			visualize: {
				options: {
					positions: 'positions',
					'positions (rel.)': 'positionsRelative',
					'positions (cum.)': 'positionsCumulative',
					pressed: 'pressed',
				},
			},
			'Unselect song': button(() => setSelectedDataKey(null), { disabled: !selectedDataKey }),
		},
		[selectedDataKey]
	)

	const { data, series, solutionKey } = useMemo(() => {
		if (loading) return { data: [], series: [] }
		const _data: Record<string, number>[] = []
		const _series: string[] = []
		let _solutionKey: string
		groupedResults[songName].forEach((attempt) => {
			if (attempt.key !== '__SOLUTION') _series.push(attempt.key)
			else _solutionKey = attempt.key
			// @ts-ignore
			attempt[visualize].forEach((k, i) => {
				_data[i] = Object.assign({}, _data[i], { [attempt.key]: k })
			})
		})
		return { data: _data, series: _series, solutionKey: _solutionKey! }
	}, [loading, groupedResults, songName, visualize])

	if (loading) return <>Loading…</>

	return (
		<>
			<nav>
				<select
					onChange={(v) => {
						setSongIndex(~~v.target.value)
						setSelectedDataKey('')
					}}
				>
					{songKeys.map((s, i) => (
						<option key={s} value={i}>
							{s}
						</option>
					))}
				</select>

				{selectedDataSet && <SongUI selectedDataSet={selectedDataSet} />}
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
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis />
					<YAxis />
					{/* <Tooltip /> */}
					<Legend
						onClick={({ dataKey }) => setSelectedDataKey(dataKey)}
						formatter={(value, entry, i) => {
							const { color } = entry
							const songData = groupedResults[songName][i]

							return (
								<span
									style={{
										color,
										opacity: !selectedDataKey ? 1 : value === selectedDataKey ? 1 : 0.6,
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
					{series.map((n, i) => {
						const songData = groupedResults[songName][i]
						return (
							<Line
								key={n}
								dot={false}
								type="monotone"
								onClick={() => setSelectedDataKey(n)}
								dataKey={n}
								opacity={!selectedDataKey ? 1 : n === selectedDataKey ? 1 : 0.2}
								stroke={
									songData.rate === undefined
										? '#d2d2d2'
										: COLOR_RATES[Math.round(songData.rate - 1)]
								}
								strokeWidth={1}
							/>
						)
					})}
					{solutionKey && (
						<Line
							type="monotone"
							dot={false}
							dataKey={solutionKey}
							stroke="#008330"
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
		</>
	)
}
