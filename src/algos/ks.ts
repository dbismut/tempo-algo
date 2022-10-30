import { SongData } from '../types'
import { sum } from 'lodash-es'

export const ks = (s1: SongData, s2: SongData) => {
	const p1cumul: number[] = s1.positionsCumulative.slice(1)
	const p2cumul: number[] = s2.positionsCumulative.slice(1)

	const cumulScore = score(p1cumul, p2cumul, s2)
	return 1 - cumulScore
}

const score = (s1: number[], s2: number[], s?: SongData) => {
	const dists = s1.map((k, i) => Math.abs(k - s2[i]))
	return sum(dists)
}
