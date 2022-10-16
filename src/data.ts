import { useEffect, useState } from 'react'
import Airtable, { Records, Table } from 'airtable'
import { groupBy } from 'lodash-es'
import { RawData, Song, SongData } from './types'
import { transformSongData } from './utils'

Airtable.configure({
	endpointUrl: 'https://api.airtable.com',
	apiKey: process.env.REACT_APP_AIRTABLE_API_KEY,
})

const base = Airtable.base(process.env.REACT_APP_AIRTABLE_BASE!)

const airtableData: Table<RawData> = base('Data')

const URL = `https://api.jsonbin.io/v3/b/${process.env.REACT_APP_JSONBIN}/latest`

async function fetchSongs(): Promise<Record<string, Song>> {
	const data: { record: Song[] } = await fetch(URL).then((r) => r.json())
	return data.record.reduce((acc, v) => Object.assign(acc, { [v.name]: v }), {})
}

function fetchAirtable() {
	let results: Records<RawData> = []
	return new Promise<_.Dictionary<SongData[]>>((resolve, reject) => {
		airtableData.select().eachPage(
			(records, fetchNextPage) => {
				results = results.concat(records)
				fetchNextPage()
			},
			(err: any) => {
				if (err) reject(err)
				else
					resolve(
						groupBy(
							results.map(({ fields }) => transformSongData(fields)),
							'song'
						)
					)
			}
		)
	})
}

export const useFetchData = () => {
	const [state, setState] = useState({
		loading: true,
		results: [] as unknown as _.Dictionary<SongData[]>,
		songs: {} as Record<string, Song>,
		// errors: undefined,
	})

	useEffect(() => {
		Promise.all([fetchAirtable(), fetchSongs()]).then((values) => {
			setState({ loading: false, results: values[0], songs: values[1] })
		})
	}, [])
	return state
}
