import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import Player from './lib/Player'
import { useStore } from './store'
import { SongData } from './types'

let player: Player

export function usePlaySong(songData: SongData) {
	const songs = useStore((s) => s.songs)
	const { pressed, positions } = songData
	const { vol, interval, notes, reverb, instrument } = songs[songData.song]!

	const timeout = useRef<number>()
	const noteSequence = useMemo(() => notes.split(' '), [notes])
	const [noteIdx, setNoteIdx] = useState(-1)
	const currNoteIdxRef = useRef(noteIdx)

	const releaseNote = useCallback(() => {
		player.releaseNote()
	}, [])

	const stop = useCallback(() => {
		player.setInstrument(instrument)
		player.setReverb(reverb)
		player.setVolume(vol)
		releaseNote()
		setNoteIdx(-1)
		currNoteIdxRef.current = -1
		clearTimeout(timeout.current)
	}, [instrument, releaseNote, reverb, vol])

	const playNote = useCallback(
		(i: number) => {
			const _noteIdx = Number.isFinite(i - 1) ? i : noteIdx
			const newNote = (_noteIdx + 1) % noteSequence.length
			setNoteIdx(newNote)
			currNoteIdxRef.current = newNote
			player.playNote(noteSequence[newNote], interval)
		},
		[noteSequence, noteIdx, interval]
	)

	const playNoteForSong = useCallback(() => {
		const index = currNoteIdxRef.current
		if (index >= positions.length - 1) {
			currNoteIdxRef.current = -1
			setNoteIdx(-1)
			return
		}
		const interval = positions[index + 2]
		const duration = pressed[index + 1]
		playNote(index)
		setTimeout(() => releaseNote(), duration)
		timeout.current = window.setTimeout(() => {
			playNoteForSong()
		}, interval)
	}, [positions, playNote, pressed, releaseNote])

	const playSong = useCallback(() => {
		player = player || new Player()
		if (currNoteIdxRef.current > -1) stop()
		else {
			stop()
			playNoteForSong()
		}
	}, [playNoteForSong, stop])

	useEffect(() => {
		if (player) stop()
	}, [stop, songData])

	return { playSong, playing: noteIdx > -1, stop }
}
