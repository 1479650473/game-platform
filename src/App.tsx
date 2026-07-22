import Home from './pages/Home';
import TitleBar from './components/TitleBar';
import './App.css';

export default function App() {
  return (
    <div className="app">
      <TitleBar />
      <Home />
      <div className="watermark">developed by csy &amp; gr</div>
    </div>
  );
}
