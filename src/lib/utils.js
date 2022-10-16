import XRegExp from 'xregexp'

// prettier-ignore
const NOTES = { C: 0,'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#':6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 }
const STD_OCTAVE = 4
const MIDDLE_C = 60

const INTERVALS = {
	min7b5: [0, 3, 6, 10],
	minmaj7: [0, 3, 7, 11],
	'maj7#5': [0, 4, 8, 11],
	dim7: [0, 3, 6, 9],
	maj7: [0, 4, 7, 11],
	min7: [0, 3, 7, 10],
	aug: [0, 4, 8],
	dim: [0, 3, 6],
	min: [0, 3, 7],
	maj: [0, 4, 7],
	7: [0, 4, 7, 10],
}

const noteRegExp = XRegExp(
	`(?<note>[A-G])(?<pitch>[b|#])?(?<octave>\\d)(?<chord>${Object.keys(INTERVALS).join('|')})?`
)

function decomposeNote(n) {
	return XRegExp.exec(n, noteRegExp)
}

export function decodeNote(n) {
	if (n.indexOf('[') === 0) {
		// n is a group of notes like [C4,E3]
		return n.slice(1, -1).split(/,\s?/).map(decodeNote)
	}
	const { note, octave, pitch, chord } = decomposeNote(n)
	const increment = pitch ? (pitch === '#' ? 1 : -1) : 0
	const octaveDelta = octave - STD_OCTAVE

	const finalNote = MIDDLE_C + 12 * octaveDelta + increment + NOTES[note]
	return !chord ? finalNote : INTERVALS[chord].map((int) => finalNote + int)
}
