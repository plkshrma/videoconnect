import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="text-center">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          Welcome to VideoConnect
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Professional video calling platform with real-time chat and collaboration tools.
        </p>

        <div className="space-y-4 mb-12">
          <Link to="/create-room">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 mr-4">
              Start Video Call
            </button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <Link
            to="/create-room"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="text-4xl mb-4">📹</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Video Calls</h3>
            <p className="text-gray-600">Start HD video calls with crystal clear audio</p>
          </Link>

          <Link
            to="/create-room"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Live Chat</h3>
            <p className="text-gray-600">Chat and share messages during your calls</p>
          </Link>

          <Link
            to="/create-room"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Group Calls</h3>
            <p className="text-gray-600">Connect with multiple participants easily</p>
          </Link>
        </div>

        <div className="mt-16 bg-gray-50 p-8 rounded-lg">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Features</h2>
          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">🎥 HD Video Quality</h3>
              <p className="text-gray-600">Crystal clear video calls with adaptive quality</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">🎙️ Noise Cancellation</h3>
              <p className="text-gray-600">Advanced audio processing for clear conversations</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">💬 Real-time Chat</h3>
              <p className="text-gray-600">Send messages and questions during calls</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">📱 Cross-platform</h3>
              <p className="text-gray-600">Works on desktop, mobile, and tablets</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;