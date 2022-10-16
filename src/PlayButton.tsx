import { Song, SongData } from './types'
import { usePlaySong } from './usePlaySong'

type Props = {
	selectedDataSet?: SongData
	songs: Record<string, Song>
}

export const PlayButton = ({ selectedDataSet, songs }: Props) => {
	return selectedDataSet ? (
		<PlayButtonDefined selectedDataSet={selectedDataSet} songs={songs} />
	) : (
		<button disabled={!selectedDataSet}>Selected a data set</button>
	)
}

const PlayButtonDefined = ({ selectedDataSet, songs }: Props) => {
	const { playSong, playing } = usePlaySong(songs, selectedDataSet!)

	return (
		<button disabled={!selectedDataSet} onClick={() => playSong()}>
			{playing ? 'Pause' : 'Play'} <b>{selectedDataSet!.key}</b>
		</button>
	)
}
