import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'

const rootElement = createRoot(document.getElementById('root')!)
rootElement.render(<App />)
