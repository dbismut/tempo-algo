import { useState } from 'react'
import { useMemo } from 'react'
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	// Tooltip,
	Legend,
} from 'recharts'

import './data'
import { useFetchData } from './data'

import './styles.css'
import { PlayButton } from './PlayButton'

export default function App() {
	const { loading, results, songs } = useFetchData()

	const songKeys = useMemo(
		() => Object.keys(results).sort((a, b) => (results[a].length > results[b].length ? -1 : 1)),
		[results]
	)

	const [songIndex, setSongIndex] = useState(0)

	const songName = songKeys[songIndex]

	const [selectedDataKey, setSelectedDataKey] = useState<string | null>(null)
	const [perfKey, setPerfKey] = useState<'positions' | 'positionsRelative' | 'positionsCumulative'>(
		'positions'
	)

	const { data, series, solutionKey } = useMemo(() => {
		if (loading) return { data: [], series: [] }
		const _data: Record<string, number>[] = []
		const _series: string[] = []
		let _solutionKey: string
		results[songName].forEach((attempt) => {
			if (attempt.user !== 'solution') _series.push(attempt.key)
			else _solutionKey = attempt.key
			attempt[perfKey].forEach((k, i) => {
				_data[i] = Object.assign({}, _data[i], { [attempt.key]: k })
			})
		})
		return { data: _data, series: _series, solutionKey: _solutionKey! }
	}, [loading, results, songName, perfKey])

	const selectedDataSet = useMemo(
		() => (songName ? results[songName].find((k) => k.key === selectedDataKey) : undefined),
		[results, selectedDataKey, songName]
	)

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
				<select onChange={(v) => setPerfKey(v.target.value as any)}>
					<option value="positions">Positions (absolute)</option>
					<option value="positionsRelative">Positions (relative)</option>
					<option value="positionsCumulative">Positions (relative, cumulative)</option>
				</select>
				<PlayButton selectedDataSet={selectedDataSet} songs={songs} />
			</nav>
			<div className="wrapper">
				<LineChart
					width={window.innerWidth}
					height={(window.innerWidth * 2) / 3}
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
					<Legend onClick={({ dataKey }) => setSelectedDataKey(dataKey)} />
					{series.map((n) => (
						<Line
							key={n}
							dot={false}
							type="monotone"
							onClick={() => setSelectedDataKey(n)}
							dataKey={n}
							opacity={!selectedDataKey ? 1 : n === selectedDataKey ? 1 : 0.2}
							stroke={n.includes('bad') ? '#9c82ca' : '#82ca9d'}
							strokeDasharray={n.includes('bad') ? 4 : undefined}
							strokeWidth={n.includes('bad') ? 2 : 1}
						/>
					))}
					{solutionKey && (
						<Line type="monotone" dot={false} dataKey={solutionKey} stroke="#F00" strokeWidth={2} />
					)}
				</LineChart>
			</div>
		</>
	)
}
