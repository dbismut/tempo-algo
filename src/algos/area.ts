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
	for (let i = 1; i < l / 2; i++) {
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

		areas.push(area)
	}
	return sum(areas)
}

type Point = [number, number]

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
