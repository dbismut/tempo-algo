import { button, useControls } from 'leva'
import { useSetSongRate } from './data'
import { SolutionSongData, SongData } from './types'
import { usePlaySong } from './usePlaySong'

type Props = {
	selectedDataSet: SongData
}

export const COLOR_RATES = [
	'#e60000FF',
	'#e60000DD',
	'#e60000BB',
	'#e6000099',
	'#00b30077',
	'#00b30099',
	'#00b300BB',
	'#00b300CC',
	'#00b300DD',
	'#00b300FF',
]

export const SongUI = ({ selectedDataSet }: Props) => {
	const { playSong, playing } = usePlaySong(selectedDataSet!)
	const [{ loading }, setSongRate] = useSetSongRate(selectedDataSet.id)

	useControls(
		selectedDataSet.key,
		{
			[`${playing ? 'Pause' : 'Play'} song`]: button(() => playSong(), {
				disabled: !selectedDataSet,
			}),
			rate: {
				value: selectedDataSet.rate || 0,
				min: 0,
				max: 10,
				step: 0.5,
				hint: '0 is not rated',
				disabled: loading,
				order: 1,
				render: () => selectedDataSet.key !== '__SOLUTION',
				onEditEnd: (v) => setSongRate(v),
			},
		},
		[selectedDataSet, playing, loading]
	)

	return null
}
