import { SongData } from '../types'
import { areaBetweenSeries, areaFromY } from '../utils'

export const bapt = (s1: SongData, s2: SongData) => {
	const p1abs: number[] = s1.positions.slice(1)
	const p2abs: number[] = s2.positions.slice(1)
	const p1rel: number[] = s1.positionsRelative.slice(1)
	const p2rel: number[] = s2.positionsRelative.slice(1)
	const p1diff: number[] = s1.positionsDifferential.slice(1)
	const p2diff: number[] = s2.positionsDifferential.slice(1)

	// return score1(p1rel, p2rel)
	// return score2(p1diff, p2diff)
	return score3(p1diff, p2diff)
}

const pow2 = (x: number) => {
	return x * x;
}

// Squared area diff
const score1 = (s1: number[], s2: number[], s?: SongData) => {
	let diff = 0;
	let max = 0;
	for (let i = 0; i < s1.length && i < s2.length; i++) {
		diff += pow2((s1[i] - s2[i]) * 100) / 100;
	}

	for (let i = 0; i < s1.length && i < s2.length; i++) {
		max += s1[i];
	}


	return Math.max(Math.min(1 - diff / max, 1), 0);
}

// Binary thresholded scoring
const score2 = (s1: number[], s2: number[], s?: SongData) => {
	let points = 0;

	for (let i = 0; i < s1.length && i < s2.length; i++) {
		points += Math.pow(Math.abs(s1[i] - s2[i]) * 10, 2) < 4 ? 1 : 0
	}

	return (points / s1.length);
}

// 
const score3 = (s1: number[], s2: number[], s?: SongData) => {
	let points = 0;
	let max = 0;

	let last = null;
	let flatness = null;

	let flatmax = 0;
	for (let i = 0; i < s1.length; i++) {
		if (last != null) flatmax = Math.max(flatmax, Math.abs(s1[i] - last))

		last = s1[i];
	}

	last = null;

	for (let i = 0; i < s1.length && i < s2.length; i++) {
		flatness = 0;

		if (last != null)
			flatness = Math.abs(s1[i] - last) / flatmax;

		points += Math.pow(Math.abs(s1[i] - s2[i]) * 10, 2) < (4 - (i / s1.length) * .2) ? flatness : 0
		max += flatness;

		last = s1[i];
	}

	return (points / max);
}

