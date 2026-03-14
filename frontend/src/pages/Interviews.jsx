import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Interviews = () => {
  const { user } = useUser();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/interviews`, {
          headers: {
            Authorization: `Bearer ${await user.getToken()}`
          }
        });
        setInterviews(response.data);
      } catch (error) {
        console.error('Error fetching interviews:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchInterviews();
    }
  }, [user]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Interviews</h1>
        <Link
          to="/interviews/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Schedule Interview
        </Link>
      </div>

      {interviews.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No interviews scheduled yet.</p>
          <Link
            to="/interviews/create"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Schedule Your First Interview
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {interviews.map((interview) => (
            <div key={interview._id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {interview.title}
                  </h3>
                  {interview.description && (
                    <p className="text-gray-600 mb-2">{interview.description}</p>
                  )}
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                    <span>Scheduled: {new Date(interview.scheduledAt).toLocaleString()}</span>
                    <span>Duration: {interview.duration} minutes</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(interview.status)}`}>
                      {interview.status}
                    </span>
                    {interview.rating && (
                      <span className="text-sm text-gray-600">
                        Rating: {interview.rating}/5
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Link
                    to={`/interviews/${interview._id}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
                  >
                    View Details
                  </Link>
                  {interview.status === 'scheduled' && (
                    <Link
                      to={`/call/${interview.streamCallId}`}
                      className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700"
                    >
                      Join Call
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Interviews;