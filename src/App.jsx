import { Route, Routes } from 'react-router-dom';

import Header from './components/Header';
import Home from './pages/Home';
import Result from './pages/Result';
import ResultDetails from './pages/ResultDetails';

function App() {
  return (
    <div className='App bg-zinc-800 min-h-screen min-h-[100dvh] text-white w-full'>
      <Header />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/result' element={<Result />} />
        <Route path='/result-details' element={<ResultDetails />} />
      </Routes>
    </div>
  );
}

export default App;
