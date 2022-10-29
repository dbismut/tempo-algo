import { Leva } from 'leva'

const theme = {
	sizes: {
		rootWidth: '300px',
		controlWidth: '130px',
	},
}

export const LevaThemed = () => {
	return <Leva titleBar={{ filter: false }} theme={theme} />
}
