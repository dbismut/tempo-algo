export type RawAirtableSongData = {
	Id: string
	songname: string
	durations: string
	intervals: string
	positions: string
	sequenceDuration: number
	user: string
	rate: number
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
	rate: number
}

export type SolutionSongData = {
	name: string
	instrument: string
	notes: string
	vol: number
	interval: number
	reverb: number
	positions: number[]
	durations: number[]
}
