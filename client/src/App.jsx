import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Login_history from "./pages/Login_history";
import Register from "./pages/Register";
function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login_history />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
