import create from 'zustand'
import { SolutionSongData, SongData } from './types'

type Store = {
	loading: boolean
	results: SongData[]
	songs: Record<string, SolutionSongData>
	selectedDataKey: string | null
	selectedSong: string | null
}

export const useStore = create<Store>(() => ({
	loading: true,
	results: [],
	songs: {},
	selectedSong: null,
	selectedDataKey: null,
}))

export const updateSongs = (updatedSongs: SongData[]) => {
	useStore.setState((prev) => {
		updatedSongs.forEach((s) => {
			const song = prev.results.find((r) => r.id === s.id)
			if (song) Object.assign(song, s)
		})
		return { ...prev, results: [...prev.results] }
	})
}

export const setSelectedDataKey = (selectedDataKey: string | null) =>
	useStore.setState({ selectedDataKey })

export const setSelectedSong = (selectedSong: string) => useStore.setState({ selectedSong })
