import { useCallback, useState } from 'react'
import Airtable, { Records, Table } from 'airtable'
import { sum } from 'lodash-es'
import { RawAirtableSongData, SolutionSongData, SongData } from './types'
import { transformSongData } from './utils'
import { updateSongs, useStore } from './store'

Airtable.configure({
	endpointUrl: 'https://api.airtable.com',
	apiKey: process.env.REACT_APP_AIRTABLE_API_KEY,
})

const base = Airtable.base(process.env.REACT_APP_AIRTABLE_BASE!)

const airtableData: Table<RawAirtableSongData> = base('Data')

const URL = `https://api.jsonbin.io/v3/b/${process.env.REACT_APP_JSONBIN}/latest`

async function fetchSongs(): Promise<Record<string, SolutionSongData>> {
	const data: { record: SolutionSongData[] } = await fetch(URL).then((r) => r.json())
	return data.record.reduce((acc, v) => Object.assign(acc, { [v.name]: v }), {})
}

function fetchAirtable() {
	let results: Records<RawAirtableSongData> = []
	return new Promise<SongData[]>((resolve, reject) => {
		airtableData.select().eachPage(
			(records, fetchNextPage) => {
				results = results.concat(records)
				fetchNextPage()
			},
			(err: any) => {
				if (err) reject(err)
				else resolve(results.map(({ id, fields }) => transformSongData(id, fields)))
			}
		)
	})
}

export const useSetSongRate = (id: string) => {
	const [state, setState] = useState({ loading: false, error: null })
	const setSongRate = useCallback(
		(rate: number) => {
			if (state.loading) return
			setState({ loading: true, error: null })
			airtableData.update([{ id, fields: { rate } }], (err, records = []) => {
				if (err) setState({ loading: false, error: err })
				else {
					const updatedSongs = records.map(({ id, fields }) => transformSongData(id, fields))
					updateSongs(updatedSongs)
					setState({ loading: false, error: null })
				}
			})
		},
		[id, state.loading]
	)

	return [state, setSongRate] as [typeof state, typeof setSongRate]
}

export const fetchData = () => {
	Promise.all([fetchAirtable(), fetchSongs()]).then(([results, songs]) => {
		// add solutions to results
		for (let k in songs) {
			const song = songs[k]
			if (!song.positions || !song.durations) continue
			const duration = sum(song.positions)
			const positionsRelative = song.positions.map((d) => d / duration)
			results.push({
				id: '-1',
				key: '__SOLUTION',
				song: k,
				user: 'Solution',
				duration,
				positions: song.positions,
				positionsRelative,
				positionsCumulative: positionsRelative.reduce(
					(acc, v, i) => (i === 0 ? [...acc, v] : [...acc, v + acc[i - 1]]),
					[] as number[]
				),
				pressed: song.durations,
				pressedRelative: song.durations.map((d) => d / duration),
				rate: 10,
			})
		}
		useStore.setState({ loading: false, results, songs })
	})
}
