import { clamp } from 'lodash-es'
import { RawData, SongData } from './types'

export function normalize(val: number, min: number, max: number) {
	return clamp((val - min) / (max - min), 0, 1)
}

export function transformSongData(fields: RawData): SongData {
	const positionsCumulative = JSON.parse(fields.positions)
	return {
		id: fields.Id,
		song: fields.songname,
		key: `${fields.user.toLowerCase()}_${fields.Id}`,
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
