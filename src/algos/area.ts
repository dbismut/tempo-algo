import { SongData } from '../types'
import { sum } from 'lodash-es'
import * as d3 from 'd3'

type Point = [number, number]

export const area = (s1: SongData, s2: SongData) => {
	const p1abs: number[] = s1.positions.slice(1)
	const p2abs: number[] = s2.positions.slice(1)
	const p1rel: number[] = s1.positionsRelative.slice(1)
	const p2rel: number[] = s2.positionsRelative.slice(1)

	const absScore = areaBetweenSeries(p1abs, p2abs, s2.key)
	const relScore = areaBetweenSeries(p1rel, p2rel, s2.key)

	return (1 - absScore) * (1 - relScore)
}

export const areaBetweenSeries = (p1: number[], p2: number[], key?: string) => {
	const points = p1.map((k, i) => [i, k]).concat(p2.map((k, i) => [i, k]).reverse()) as Point[]

	const l = points.length

	const deltaAreas: number[] = []
	for (let i = 0; i < l / 2; i++) {
		const [p1, p2] = points.slice(i, i + 2) as [Point, Point]
		const [p3, p4] = points.slice(l - i - 2, l - i) as [Point, Point]
		const intersec = getIntersection([p1, p2], [p3, p4])
		const [ix, iy] = intersec
		const dxi = ix - p1[0]
		const dyi = iy - p1[1]
		const dxl = p2[0] - p1[0]
		const dyl = p2[1] - p1[1]

		const isPolygonCrossed =
			Math.sign(dxi) === Math.sign(dxl) &&
			Math.sign(dyi) === Math.sign(dyl) &&
			Math.abs(dxi) <= Math.abs(dxl) &&
			Math.abs(dyi) <= Math.abs(dyl)

		const area = isPolygonCrossed
			? Math.abs(d3.polygonArea([p1, intersec, p4])) + Math.abs(d3.polygonArea([p2, intersec, p3]))
			: Math.abs(d3.polygonArea([p1, p2, p3, p4]))

		deltaAreas.push(area)
	}

	const min = p1.reduce((acc, v) => Math.min(acc, v), Infinity)

	const area1 = areaFromY(p1, 0)

	key === '__FLAT_7 Nation Army - White Stripes' && console.log(key, min, area1, areaFromY(p1, 0))

	return sum(deltaAreas) / area1
}

function areaFromY(p: number[], y: number) {
	return d3.polygonArea(
		p
			.map((k, i) => [i, k])
			.concat(
				Array(p.length)
					.fill(0)
					.map((_, i) => [i, y])
					.reverse()
			) as Point[]
	)
}

function getLineEq([x1, y1]: Point, [x2, y2]: Point) {
	const a = (y2 - y1) / (x2 - x1)
	const b = y1 - a * x1
	return [a, b]
}

function getIntersection(l1: [Point, Point], l2: [Point, Point]): Point {
	const [a1, b1] = getLineEq(...l1)
	const [a2, b2] = getLineEq(...l2)
	const x = (b2 - b1) / (a1 - a2)
	const y = a1 * x + b1
	return [x, y]
}
