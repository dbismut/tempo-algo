import { Point, SongData } from '../types'
import { sum, sumBy } from 'lodash-es'
import { areaFromY, quadrilateralArea } from '../utils'

export const cumul = (s1: SongData, s2: SongData) => {
	const p1abs: number[] = s1.positions.slice(1)
	const p2abs: number[] = s2.positions.slice(1)
	const p1rel: number[] = s1.positionsRelative.slice(1)
	const p2rel: number[] = s2.positionsRelative.slice(1)

	const absScore = areaBetweenSeries(p1abs, p2abs, s2)
	const relScore = areaBetweenSeries(p1rel, p2rel, s2)

	return (1 - relScore) * (1 - absScore)
}

const areaBetweenSeries = (s1: number[], s2: number[], s?: SongData) => {
	const points = s1.map((k, i) => [i, k]).concat(s2.map((k, i) => [i, k]).reverse()) as Point[]
	const l = points.length

	const min = s1.reduce((acc, v) => Math.min(acc, v), Infinity)
	const max = s1.reduce((acc, v) => Math.max(acc, v), 0)

	const deltaAreas: Array<any> = []

	for (let i = 0; i < l / 2 - 1; i++) {
		const [p1, p2] = points.slice(i, i + 2) as [Point, Point]
		const [p3, p4] = points.slice(l - i - 2, l - i) as [Point, Point]

		const area = quadrilateralArea(p1, p2, p3, p4)
		const zeroArea = areaFromY([p1[1], p2[1]], min * 0.8)
		const error = Math.abs(area / zeroArea)

		if (i > 0) {
			const prev = deltaAreas[deltaAreas.length - 1]
			const proximity = (prev.zeroArea - zeroArea) / (prev.zeroArea + zeroArea)
			const significantPeak = (p2[1] - min) / (max - min)
			// s?.song === 'Come as you are - Nirvana' && console.log(p1, p2, error, significantPeak)
			if (error > 0.3 || significantPeak > 0.5) {
				deltaAreas.push({ area, zeroArea, error, i })
			}
		} else {
			deltaAreas.push({ area, zeroArea, error, i })
		}
	}

	s?.song === 'Wizard of Oz' &&
		console.log(
			s.key,
			deltaAreas,
			sumBy(deltaAreas, 'error'),
			sumBy(deltaAreas, 'error') / s1.length
		)
	// key === '__FLAT_Mr Vain - Culture Beat' && console.log(key, min, area1, sum(deltaAreas))

	return sumBy(deltaAreas, 'error') / s1.length
}
