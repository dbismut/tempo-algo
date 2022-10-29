import { Point, SongData } from '../types'
import { sumBy } from 'lodash-es'
import * as d3 from 'd3'
import { quadrilateralArea } from '../utils'

export const peaks = (s1: SongData, s2: SongData) => {
	const p1abs: number[] = s1.positions.slice(1)
	const p2abs: number[] = s2.positions.slice(1)
	const p1rel: number[] = s1.positionsRelative.slice(1)
	const p2rel: number[] = s2.positionsRelative.slice(1)

	const absScore = areaBetweenSeries(p1abs, p2abs, s2.key)
	const relScore = areaBetweenSeries(p1rel, p2rel, s2.key)

	// s2.key === 'ivanbad_94' && console.log(absScore, relScore)

	return Math.max(0, 1 - relScore * 1.4)
}

const areaBetweenSeries = (p1: number[], p2: number[], key?: string) => {
	const points = p1.map((k, i) => [i, k]).concat(p2.map((k, i) => [i, k]).reverse()) as Point[]
	const min = p1.reduce((acc, v) => Math.min(acc, v), Infinity)

	// key === '__FLAT_My Own Summer - Deftones' && console.log(points)

	const l = points.length

	const deltaAreas: { area: number; zeroArea: number; minArea: number }[] = []
	for (let i = 0; i < l / 2 - 1; i++) {
		const [p1, p2] = points.slice(i, i + 2) as [Point, Point]
		const [p3, p4] = points.slice(l - i - 2, l - i) as [Point, Point]

		const area = quadrilateralArea(p1, p2, p3, p4)

		const zeroArea = d3.polygonArea([p1, p2, [p2[0], 0], [p1[0], 0]])
		const minArea = d3.polygonArea([p1, p2, [p2[0], min], [p1[0], min]])

		if (i > 0) {
			const prev = deltaAreas[deltaAreas.length - 1]
			const proximity = Math.abs(1 - zeroArea / prev.zeroArea)
			// key === '__FLAT_My Own Summer - Deftones' && console.log(proximity)
			if (proximity > 0.1) {
				deltaAreas.push({ area, zeroArea, minArea })
			}
		} else {
			deltaAreas.push({ area, zeroArea, minArea })
		}
	}

	// key === '__FLAT_The Blue Danube, Strauss' && console.log(deltaAreas)

	return sumBy(deltaAreas, 'area') / sumBy(deltaAreas, 'zeroArea')
}
