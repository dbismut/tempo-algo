export type RawData = {
	Id: string
	songname: string
	durations: string
	intervals: string
	positions: string
	sequenceDuration: number
	user: string
}

export type SongData = {
	id: string
	key: string
	song: string
	user: string
	pressed: number[]
	pressedRelative: number[]
	positions: number[]
	positionsRelative: number[]
	positionsCumulative: number[]
	duration: number
}

export type Song = {
	name: string
	instrument: string
	notes: string
	vol: number
	interval: number
	reverb: number
	positions: number[]
	durations: number[]
}
