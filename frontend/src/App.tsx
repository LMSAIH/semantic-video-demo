import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { VideoStudio } from '@/components/studio/VideoStudio';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<VideoStudio />} />
      </Routes>
    </Router>
  )
}

export default App;
