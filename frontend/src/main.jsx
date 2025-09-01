//  Node imports
import { StrictMode } from 'react'  // Used during development
import { createRoot } from 'react-dom/client' // Injects our React application into the HTML page
import { BrowserRouter } from 'react-router-dom'; // Needed to implement the Routes inside our main application App


// Styling
import './styles/resets.css.js';  // Vanilla Extract CSS Resets
import 'bootstrap/dist/css/bootstrap.min.css';  // Bootstrap CSS
// import './index.css'  // Global CSS file replaced by vanilla-extract

// Local imports
import App from './App.jsx' // Main application component



createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
