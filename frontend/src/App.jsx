import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ReviewDetail from './pages/ReviewDetail.jsx';

const App = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/reviews/:id" element={<ReviewDetail />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;