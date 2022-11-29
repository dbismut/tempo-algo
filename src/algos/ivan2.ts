import * as _ from 'lodash-es'
import { SongData } from '../types'

const RAW_BONUS = 1.05
const RAW_LOW_TOLERANCE = 250
const RAW_HIGH_TOLERANCE = 750
const ERROR_MARGIN = 50
const AVG_TAP = 330
const RATIO_SENSITIVITY = 4

export const _ivan2 = (s1: SongData, s2: SongData, shouldLog?: boolean) => {
	// const log = shouldLog ? console.log : (...a: any) => {}
	const abs1 = s1.positions.slice(1)
	const abs2 = s2.positions.slice(1)

	const avg1 = _.mean(abs1)
	const sum1 = _.sum(abs1)
	const sum2 = _.sum(abs2)
	const sumRatio = sum2 / sum1

	const adjusted2 = abs2.map((v2) => v2 / sumRatio)
	const arythmie = abs1.map((v1) => Math.abs(v1 - avg1))
	const avgArythmie = _.mean(arythmie)
	const arythmieCoeff = 0.004 * avgArythmie - 0.2

	const normalizedLowTolerance = RAW_LOW_TOLERANCE * arythmieCoeff
	const normalizedErrorMargin = ERROR_MARGIN * arythmieCoeff

	const rawArray = abs1.map((v1, i) => {
		const v2 = adjusted2[i]
		const diff = Math.abs(v1 - v2)
		const tol =
			v1 > RAW_HIGH_TOLERANCE ? RAW_HIGH_TOLERANCE : normalizedLowTolerance + (i > 0 ? v1 / 5 : 0)
		const ponderation = 1 + Math.abs(AVG_TAP - v1) / 250
		const condition = diff < normalizedErrorMargin ? 0 : diff / tol
		const conditionDelta =
			condition !== 0
				? Math.min(
						Math.abs(v1 - v2 + normalizedErrorMargin) / tol,
						Math.abs(v1 - v2 - normalizedErrorMargin) / tol
				  )
				: 0
		const scoreRaw = diff > tol ? -0.3 : 1 - conditionDelta
		const scoreBonus = Math.min(1, scoreRaw * RAW_BONUS)
		const scoreFinal = scoreBonus * ponderation
		return { scoreFinal, ponderation, scoreBonus }
	})

	const rawScore = _.sumBy(rawArray, 'scoreFinal')
	const ponderationSum = _.sumBy(rawArray, 'ponderation')

	const rawRatio = rawScore / ponderationSum

	const adjustedRatioSensitivity = RATIO_SENSITIVITY + 3 - 3 * arythmieCoeff

	const ratioArray = abs1.map((v1, i) => {
		const v2 = abs2[i]
		const prev1 = abs1[i - 1] ?? 0
		const prev2 = abs2[i - 1] ?? 0
		const ponderation = 1 + Math.abs(AVG_TAP - v1) / 250

		const influence =
			adjustedRatioSensitivity -
			(rawArray[i].scoreBonus + (i > 0 ? rawArray[i - 1].scoreBonus : 0)) * 1.3
		const formula = ((v2 * prev1 - v1 * prev2) / (prev1 * prev2 + v1 * v2)) * influence
		const parabolicScore = Math.max(1 - formula ** 2, 0)
		const parabolicScore2 = parabolicScore || -0.3
		const scorePondere = parabolicScore2 * ponderation

		return scorePondere
	})

	const ratioScore = _.sum(ratioArray)
	const ratioRatio = ratioScore / ponderationSum

	const rawFinalScore = (rawRatio * 2 + ratioRatio * 3) / (2 + 3)
	const finalScore = rawFinalScore - (0.1 * Math.abs(sum1 - sum2)) / sum1
	return finalScore
}

// const sol = [
// 	0, 135, 97, 424, 1153, 152, 119, 272, 292, 1251, 161, 111, 460, 1276, 144, 113, 255, 283, 230,
// 	288,
// ]

// const flat = [
// 	0, 400, 400, 400, 400, 400, 400, 400, 400, 400, 400, 400, 400, 400, 400, 400, 400, 400, 400, 400,
// ]

// @ts-ignore
// _ivan2({ positions: sol }, { positions: flat }, true)
