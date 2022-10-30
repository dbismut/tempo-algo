import { SongData } from '../types'
import { areaBetweenSeries, areaFromY } from '../utils'

export const scale = (s1: SongData, s2: SongData) => {
	const p1abs: number[] = s1.positions.slice(1)
	const p2abs: number[] = s2.positions.slice(1)
	const p1rel: number[] = s1.positionsRelative.slice(1)
	const p2rel: number[] = s2.positionsRelative.slice(1)

	const absScore = score(p1abs, p2abs, s2)
	const relScore = score(p1rel, p2rel, s2)

	// s2.key === 'ivanbad_94' && console.log(absScore, relScore)

	return Math.max(0, 1 - relScore) * Math.max(0, 1 - absScore)
}

const score = (s1: number[], s2: number[], s?: SongData) => {
	const min1 = s1.reduce((acc, v) => Math.min(acc, v), Infinity)
	const max1 = s1.reduce((acc, v) => Math.max(acc, v), 0)

	const min2 = s2.reduce((acc, v) => Math.min(acc, v), Infinity)
	const max2 = s2.reduce((acc, v) => Math.max(acc, v), 0)

	const s2h = s2.map((k) =>
		max2 === min2 ? (max1 - min1) / 2 : ((k - min2) / (max2 - min2)) * (max1 - min1) + min1
	)

	const area = areaBetweenSeries(s1, s2h)
	const area1 = areaFromY(s1, 0)

	// key === '__FLAT_7 Nation Army - White Stripes' &&
	// 	console.log(key, points, { min1, max1, min2, max2 })

	return area / area1
}
