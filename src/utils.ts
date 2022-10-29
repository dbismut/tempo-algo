import { clamp } from 'lodash-es'
import { Point, RawAirtableSongData, SongData } from './types'
import * as d3 from 'd3'

export function normalize(val: number, min: number, max: number) {
	return clamp((val - min) / (max - min), 0, 1)
}

export function transformSongData(id: string, fields: RawAirtableSongData): SongData {
	const positionsCumulative = JSON.parse(fields.positions)
	return {
		id,
		song: fields.songname,
		key: `${fields.user.toLowerCase().trim()}_${fields.Id}`,
		rate: fields.rate,
		user: fields.user.toLowerCase(),
		duration: fields.sequenceDuration,
		pressedRelative: JSON.parse(fields.durations),
		pressed: JSON.parse(fields.durations).map((d: number) => d * fields.sequenceDuration),
		positions: JSON.parse(fields.intervals),
		positionsRelative: positionsCumulative.map((d: number, i: number) =>
			i === 0 ? d : d - positionsCumulative[i - 1]
		),
		positionsCumulative,
	}
}

export function quadrilateralArea(p1: Point, p2: Point, p3: Point, p4: Point) {
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

	return isPolygonCrossed
		? Math.abs(d3.polygonArea([p1, intersec, p4])) + Math.abs(d3.polygonArea([p2, intersec, p3]))
		: Math.abs(d3.polygonArea([p1, p2, p3, p4]))
}

export function areaFromY(p: number[], y: number) {
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
