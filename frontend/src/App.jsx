import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import CreateRoom from "./pages/CreateRoom";
import VideoCall from "./pages/VideoCall";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route
          path="create-room"
          element={<CreateRoom />}
        />
        <Route
          path="call/:callId"
          element={<VideoCall />}
        />
      </Route>
    </Routes>
  );
}

export default App;
