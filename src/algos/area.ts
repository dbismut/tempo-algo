import { SongData } from '../types'
import { sum } from 'lodash-es'
import * as d3 from 'd3'

export const area = (s1: SongData, s2: SongData, visualize: string) => {
	// @ts-ignore
	const p1: number[] = s1[visualize]
	// @ts-ignore
	const p2: number[] = s2[visualize]

	const points = p1.map((k, i) => [i, k]).concat(p2.map((k, i) => [i, k]).reverse()) as [
		number,
		number
	][]

	const l = points.length
	const areas: number[] = []
	for (let i = 0; i < l / 2; i++) {
		const poly = points.slice(i, i + 2).concat(points.slice(l - i - 2, l - i))
		areas.push(Math.abs(d3.polygonArea(poly)))
	}
	return sum(areas)
}
