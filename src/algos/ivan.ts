import { clamp, mean, sum, sumBy } from 'lodash-es'
import { SongData } from '../types'

const RAW_BONUS = 1.1
const RAW_ANALYSIS_TOLERANCE = 1
const BONUS_MINIMAL_WHEN_CUMULATED = 0.7
const RAW_ANALYSIS_FACTOR = 1
const RATIO_ANALYSIS_FACTOR = 1
const REL_ANALYSIS_FACTOR = 1
const BONUS_TOLERANCE_MIN = 0.25
const BONUS_TOLERANCE_MID = 0.5
const BONUS_TOLERANCE_MAX = 0.75
const BONUS_VALUE_MIN = 1
const BONUS_VALUE_MID = 1.2
const BONUS_VALUE_MAX = 1.4

export const _ivan = (s1: SongData, s2: SongData) => {
	const abs1 = s1.positions.slice(1)
	const abs2 = s2.positions.slice(1)

	const rawArray = abs1.map((v1, i) => {
		const delta = Math.abs(v1 - abs2[i] + 0.01)
		const tol = v1 < 350 ? 350 : v1 > 700 ? 700 : v1 * RAW_ANALYSIS_TOLERANCE
		const scoreRaw = (1 - delta / tol) * RAW_BONUS
		const scoreFinal = clamp(scoreRaw, 0, 1)
		return scoreFinal
	})

	const ratioArray = abs1.map((v1, i) => {
		const prev1 = abs1[i - 1] ?? v1
		const v2 = abs2[i]
		const prev2 = abs2[i - 1] ?? v2
		const r1 = (v1 - prev1) / ((v1 + prev1) / 2)
		const r2 = (v2 - prev2) / ((v2 + prev2) / 2)
		const scoreRaw = (1 - Math.abs(r1 - r2)) * 1.1
		const scoreFinal = clamp(scoreRaw, 0, 1)
		return scoreFinal
	})

	const avg1 = mean(abs1)
	const sum1 = sum(abs1)
	const sum2 = sum(abs2)
	const sumRatio = sum2 / sum1

	const relArray = abs1.map((v1, i) => {
		const w1 = v1 < avg1 / 2 ? 0 : v1 < avg1 ? 1 : v1 > avg1 * 1.5 ? 3 : 2
		const v2 = abs2[i]
		const hV2 = v2 / sumRatio
		const w2 = hV2 < avg1 / 2 ? 0 : hV2 < avg1 ? 1 : hV2 > avg1 * 2 ? 3 : 2
		const scoreFinal = !v1
			? 0
			: w1 === w2 || Math.abs(v1 - v2) < 250
			? 1
			: Math.abs(w1 - w2) <= 1
			? 0.5
			: 0
		return scoreFinal
	})

	const bonusArray = abs1.map((v1, i) => {
		const longNoteBonus = !v1 ? 0 : 1 + v1 / (!i ? 200 : 800)
		const ratioScore = ratioArray[i]
		const rawScore = rawArray[i]
		const relScore = relArray[i]
		const tempScore =
			RATIO_ANALYSIS_FACTOR * ratioScore * longNoteBonus +
			RAW_ANALYSIS_FACTOR * rawScore * longNoteBonus +
			REL_ANALYSIS_FACTOR * relScore * longNoteBonus

		const perfectScore =
			RAW_ANALYSIS_FACTOR * longNoteBonus +
			RATIO_ANALYSIS_FACTOR * longNoteBonus +
			REL_ANALYSIS_FACTOR * longNoteBonus

		const tempRatioScore = tempScore / perfectScore
		const _bonus = !perfectScore
			? BONUS_VALUE_MAX
			: tempRatioScore <= BONUS_TOLERANCE_MIN
			? BONUS_MINIMAL_WHEN_CUMULATED
			: tempRatioScore <= BONUS_TOLERANCE_MID
			? BONUS_VALUE_MIN
			: tempRatioScore <= BONUS_TOLERANCE_MAX
			? BONUS_VALUE_MID
			: BONUS_VALUE_MAX
		const bonus = _bonus < 1 ? BONUS_MINIMAL_WHEN_CUMULATED : _bonus

		return { perfectScore, ratioScore, longNoteBonus, tempScore, bonus }
	})

	const finalScoreArray = bonusArray.map((curr, i) => {
		const prev = !i ? curr : bonusArray[i - 1]
		const next = i === bonusArray.length - 1 ? { bonus: 1.4, tempScore: 0 } : bonusArray[i + 1]
		const finalBonus = curr.bonus * prev.bonus * next.bonus
		const finalScore = finalBonus * curr.tempScore
		return finalScore
	})

	const perfectSum = sumBy(bonusArray, 'perfectScore') * 2.744
	const scoreSum = sum(finalScoreArray)

	return scoreSum / perfectSum
}

// const sol = [
// 	153, 200, 400, 1383, 144, 150, 287, 314, 1366, 149, 142, 564, 1317, 136, 146, 307, 285, 299, 322,
// ]

// const play = [
// 	173, 184, 465, 996, 165, 156, 265, 276, 1150, 173, 149, 468, 820, 173, 176, 265, 256, 242, 332,
// ]

// // @ts-ignore
// ivan({ positions: sol }, { positions: play })
