import create from 'zustand'
import { SolutionSongData, SongData } from './types'

export const useStore = create(() => ({
	loading: true,
	results: [] as SongData[],
	songs: {} as Record<string, SolutionSongData>,
}))

export const updateSongs = (updatedSongs: SongData[]) => {
	useStore.setState((prev) => {
		updatedSongs.forEach((s) => {
			const song = prev.results.find((r) => r.id === s.id)
			if (song) Object.assign(song, s)
		})
		return { ...prev }
	})
}
