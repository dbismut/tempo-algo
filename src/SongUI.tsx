import { button, useControls } from 'leva'
import { useEffect } from 'react'
import { useSetSongRate } from './data'
import { SongData } from './types'
import { usePlaySong } from './usePlaySong'

type Props = {
	dataSet: SongData
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

export const SongUI = ({ dataSet }: Props) => {
	const { playSong, playing } = usePlaySong(dataSet!)
	const [{ loading }, setSongRate] = useSetSongRate(dataSet.id)

	const [, set] = useControls(
		dataSet.key,
		() => ({
			[`${playing ? 'Pause' : 'Play'} song`]: button(() => playSong(), {
				disabled: !dataSet,
			}),
			rate: {
				value: dataSet.rate || 0,
				min: 0,
				max: 10,
				step: 0.5,
				hint: '0 is not rated',
				disabled: loading,
				order: 1,
				render: () => dataSet.key !== '__SOLUTION',
				onEditEnd: (v) => setSongRate(v),
			},
			score: { value: dataSet.score!, disabled: true, order: 2 },
		}),
		[dataSet, playing, loading]
	)

	useEffect(() => {
		set({ score: dataSet.score })
	}, [set, dataSet.score])

	return null
}
