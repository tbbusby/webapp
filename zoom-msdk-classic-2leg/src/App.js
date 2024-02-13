import React from 'react';
import StartPage from "./components/Startpage";
import MeetingsPage from "./components/Meetingspage";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
  } from "react-router-dom";

const App = () => {
    return (
        <React.Fragment>
        <Router>
          <Routes>
            <Route path="/" element={<Navigate replace to="/startpage" />} />
            <Route path="/startpage" element={<StartPage />} />
            <Route path="/meetingspage" element={<MeetingsPage />} />
          </Routes>
        </Router>
    </React.Fragment>
    )
}

export default App
