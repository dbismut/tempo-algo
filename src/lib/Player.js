import Instruments from './Instruments'
import { decodeNote } from './utils'

export default class Player {
	lastNotes = undefined
	instrument = undefined
	constructor() {
		this.player = new Instruments()
	}

	setInstrument(instrument) {
		if (typeof instrument === 'string') this.instrument = this.player.names.indexOf(instrument)
		else this.instrument = instrument
	}

	setReverb(reverb = 0.3) {
		this.player._synth.setReverbLev(reverb)
	}

	setVolume(vol = 0.5) {
		this.player._synth.setMasterVol(vol)
	}

	playNote(note, interval = 0) {
		if (typeof note === 'string') note = decodeNote(note)
		const notes = Array.isArray(note) ? note : [note]
		if (interval !== 0) notes.push(note + interval)

		this.lastNotes = notes

		this.player.play(this.instrument, notes)
		// console.log('playing note', notes)
	}
	releaseNote() {
		this.player.release(this.lastNotes)
	}
}
