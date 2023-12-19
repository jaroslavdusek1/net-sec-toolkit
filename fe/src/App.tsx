import React from 'react';
import './styles/App.css';
import Navbar from './components/Navbar';
import SSHattack from './pages/SSHattack.jsx';
import About from './pages/About';
import BruteForceCheck from './pages/BruteForce.jsx';
import Home from './pages/Home';
import SYNflood from './pages/SYNflood';
import Sniff from './pages/Sniff';
import BuffetBinary from './pages/Buffet';
import CatchMe from './pages/CatchMe';
import Term from './pages/Term';
import Top from './pages/Top';
import Deauth from './pages/Deauth';
import ReverseHash from './pages/ReverseHash';
import { Route, Routes } from 'react-router-dom';
import 'typeface-roboto';

function App() {
  // call api
  // const handleApiCall = useCallback(async () => {
  //   try {
  //     const data = await fetchFirewall();
  //     console.log(data);
  //   } catch (error) {
  //     console.log("Hahahaha", error);
  //     console.error("API call failed", error);
  //   }
  // }, []);

  return (
    <div>
      <Navbar />
      <div className='container'>
        {/* <button onClick={handleApiCall}>call api</button> */}
        <Routes>
          <Route path='/home' element={<Home />} />
          <Route path='/CatchMe' element={<CatchMe />} />
          <Route path='/brute_force_check' element={<BruteForceCheck/>} />
          <Route path='/SSHattack' element={<SSHattack/>} />
          <Route path='/SYNflood' element={<SYNflood />} />
          <Route path='/rHash' element={<ReverseHash />} />
          <Route path='/top' element={<Top />} />
          <Route path='/sniff' element={<Sniff />} />
          <Route path='/bBinary' element={<BuffetBinary />} />
          <Route path='/term' element={<Term />} />
          <Route path='/deauth' element={<Deauth />} />
          <Route path='/about' element={<About />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;