import { Point, SongData } from '../types'
import { sum } from 'lodash-es'
import { areaFromY, quadrilateralArea } from '../utils'

export const scale = (s1: SongData, s2: SongData) => {
	const p1abs: number[] = s1.positions.slice(1)
	const p2abs: number[] = s2.positions.slice(1)
	const p1rel: number[] = s1.positionsRelative.slice(1)
	const p2rel: number[] = s2.positionsRelative.slice(1)

	const absScore = areaBetweenSeries(p1abs, p2abs, s2.key)
	const relScore = areaBetweenSeries(p1rel, p2rel, s2.key)

	// s2.key === 'ivanbad_94' && console.log(absScore, relScore)

	return Math.max(0, 1 - relScore) * Math.max(0, 1 - absScore)
}

const areaBetweenSeries = (s1: number[], s2: number[], key?: string) => {
	const min1 = s1.reduce((acc, v) => Math.min(acc, v), Infinity)
	const max1 = s1.reduce((acc, v) => Math.max(acc, v), 0)

	const min2 = s2.reduce((acc, v) => Math.min(acc, v), Infinity)
	const max2 = s2.reduce((acc, v) => Math.max(acc, v), 0)

	const p2h = s2.map((k) =>
		max2 === min2 ? (max1 - min1) / 2 : ((k - min2) / (max2 - min2)) * (max1 - min1) + min1
	)
	const points = s1.map((k, i) => [i, k]).concat(p2h.map((k, i) => [i, k]).reverse()) as Point[]

	const l = points.length

	const deltaAreas: number[] = []
	for (let i = 0; i < l / 2; i++) {
		const [p1, p2] = points.slice(i, i + 2) as [Point, Point]
		const [p3, p4] = points.slice(l - i - 2, l - i) as [Point, Point]

		const area = quadrilateralArea(p1, p2, p3, p4)

		deltaAreas.push(area)
	}

	const area1 = areaFromY(s1, 0)

	// key === '__FLAT_7 Nation Army - White Stripes' &&
	// 	console.log(key, points, { min1, max1, min2, max2 })

	return sum(deltaAreas) / area1
}
