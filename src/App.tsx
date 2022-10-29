import { useEffect } from 'react'
import './data'
import { fetchData } from './dataFetcher'
import { LoadedApp } from './LoadedApp'
import { useStore } from './store'

export default function App() {
	const loading = useStore((s) => s.loading)

	useEffect(() => {
		fetchData()
	}, [])

	if (loading) return <>Loading…</>
	return <LoadedApp />
}
