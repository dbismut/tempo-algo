import { SongData } from '../types'
import { areaBetweenSeries, areaFromY } from '../utils'

export const area = (s1: SongData, s2: SongData) => {
	const p1abs: number[] = s1.positions.slice(1)
	const p2abs: number[] = s2.positions.slice(1)
	const p1rel: number[] = s1.positionsRelative.slice(1)
	const p2rel: number[] = s2.positionsRelative.slice(1)
	const p1diff: number[] = s1.positionsDifferential.slice(1)
	const p2diff: number[] = s2.positionsDifferential.slice(1)

	const absScore = score(p1abs, p2abs, s2)
	const relScore = score(p1rel, p2rel, s2)
	const diffScore = score(p1diff, p2diff, s2)

	return (1 - absScore) * (1 - relScore)
}

const score = (s1: number[], s2: number[], s?: SongData) => {
	const area = areaBetweenSeries(s1, s2)
	const area1 = areaFromY(s1, 0)

	return area / area1
}
