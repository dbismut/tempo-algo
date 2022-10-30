import { SongData } from '../types'
import { sum } from 'lodash-es'
import { areaBetweenSeries, areaFromY } from '../utils'

export const dist = (s1: SongData, s2: SongData) => {
	const p1abs: number[] = s1.positions.slice(1)
	const p2abs: number[] = s2.positions.slice(1)
	const p1rel: number[] = s1.positionsRelative.slice(1)
	const p2rel: number[] = s2.positionsRelative.slice(1)
	const p1diff: number[] = s1.positionsDifferential.slice(1)
	const p2diff: number[] = s2.positionsDifferential.slice(1)

	const absScore = score(p1rel, p2rel, s2)
	// const relScore = areaBetweenSeries(p1rel, p2rel, s2)
	// const diffScore = areaBetweenSeries(p1diff, p2diff, s2)

	return 1 - (absScore / p1abs.length) * 100
}

const score = (s1: number[], s2: number[], s?: SongData) => {
	const dists = s1.map((k, i) => Math.pow(k - s2[i], 2))
	return Math.sqrt(sum(dists))
}
