import { button, useControls } from 'leva'
import { useEffect } from 'react'
import { useSetSongRate } from './dataFetcher'
import { SongData } from './types'
import { usePlaySong } from './usePlaySong'
import * as algos from './algos'

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

	const algosInputs = Object.keys(algos).reduce(
		(acc, algo) =>
			Object.assign(acc, {
				// @ts-ignore
				[algo]: { value: dataSet[algo]?.value ?? -1, disabled: true, order: 2 },
			}),
		{}
	)

	const [, set] = useControls(
		dataSet.key,
		() => ({
			[`${playing ? 'Pause' : 'Play'} song`]: button(() => playSong(), {
				disabled: !dataSet,
			}),
			rate: {
				value: dataSet.rate ?? 0,
				min: 0,
				max: 10,
				step: 0.5,
				hint: '0 is not rated',
				disabled: loading,
				order: 1,
				render: () => !dataSet.key.includes('__SOLUTION') && !dataSet.key.includes('__FLAT'),
				onEditEnd: (v) => setSongRate(v),
			},
			...algosInputs,
		}),
		[dataSet, playing, loading]
	)

	useEffect(() => {
		const d = Object.keys(algos).reduce(
			// @ts-ignore
			(acc, algo) => Object.assign(acc, { [algo]: dataSet[algo]?.value ?? -1 }),
			{}
		)
		set(d)
	}, [set, dataSet])

	return null
}
