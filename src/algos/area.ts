import { Point, SongData } from '../types'
import { sum } from 'lodash-es'
import { areaFromY, quadrilateralArea } from '../utils'

export const area = (s1: SongData, s2: SongData) => {
	const p1abs: number[] = s1.positions.slice(1)
	const p2abs: number[] = s2.positions.slice(1)
	const p1rel: number[] = s1.positionsRelative.slice(1)
	const p2rel: number[] = s2.positionsRelative.slice(1)

	const absScore = areaBetweenSeries(p1abs, p2abs, s2.key)
	const relScore = areaBetweenSeries(p1rel, p2rel, s2.key)

	return (1 - absScore) * (1 - relScore)
}

const areaBetweenSeries = (s1: number[], s2: number[], key?: string) => {
	const points = s1.map((k, i) => [i, k]).concat(s2.map((k, i) => [i, k]).reverse()) as Point[]

	const l = points.length

	const deltaAreas: number[] = []
	for (let i = 0; i < l / 2; i++) {
		const [p1, p2] = points.slice(i, i + 2) as [Point, Point]
		const [p3, p4] = points.slice(l - i - 2, l - i) as [Point, Point]

		const area = quadrilateralArea(p1, p2, p3, p4)
		deltaAreas.push(area)
	}

	const min = s1.reduce((acc, v) => Math.min(acc, v), Infinity)

	const area1 = areaFromY(s1, 0)

	// key === '__FLAT_Mr Vain - Culture Beat' && console.log(key, min, area1, sum(deltaAreas))

	return sum(deltaAreas) / area1
}
