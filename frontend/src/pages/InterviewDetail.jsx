import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const InterviewDetail = () => {
  const { user } = useUser();
  const { id } = useParams();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/interviews/${id}`, {
          headers: {
            Authorization: `Bearer ${await user.getToken()}`
          }
        });
        setInterview(response.data);
        setFeedback(response.data.feedback || '');
        setRating(response.data.rating || 0);
      } catch (error) {
        console.error('Error fetching interview:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user && id) {
      fetchInterview();
    }
  }, [user, id]);

  const updateStatus = async (status) => {
    try {
      const updateData = { status };
      if (status === 'completed') {
        updateData.feedback = feedback;
        updateData.rating = rating;
      }

      const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/interviews/${id}/status`, updateData, {
        headers: {
          Authorization: `Bearer ${await user.getToken()}`
        }
      });
      setInterview(response.data);
    } catch (error) {
      console.error('Error updating interview:', error);
    }
  };

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

  if (!interview) {
    return <div className="text-center py-8">Interview not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{interview.title}</h1>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(interview.status)}`}>
          {interview.status}
        </span>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Interview Details</h3>
            <p className="text-gray-600 mb-2">{interview.description}</p>
            <div className="space-y-1 text-sm text-gray-600">
              <p><strong>Scheduled:</strong> {new Date(interview.scheduledAt).toLocaleString()}</p>
              <p><strong>Duration:</strong> {interview.duration} minutes</p>
              <p><strong>Interviewer:</strong> {interview.interviewer.name}</p>
              <p><strong>Interviewee:</strong> {interview.interviewee.name}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Actions</h3>
            <div className="space-y-2">
              {interview.status === 'scheduled' && (
                <Link
                  to={`/call/${interview.streamCallId}`}
                  className="block bg-green-600 text-white px-4 py-2 rounded-md text-center hover:bg-green-700"
                >
                  Join Video Call
                </Link>
              )}

              {interview.status === 'scheduled' && (
                <button
                  onClick={() => updateStatus('in-progress')}
                  className="block w-full bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700"
                >
                  Start Interview
                </button>
              )}

              {interview.status === 'in-progress' && (
                <button
                  onClick={() => updateStatus('completed')}
                  className="block w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Complete Interview
                </button>
              )}

              {interview.status !== 'completed' && interview.status !== 'cancelled' && (
                <button
                  onClick={() => updateStatus('cancelled')}
                  className="block w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                >
                  Cancel Interview
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {interview.questions && interview.questions.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Questions</h3>
          <div className="space-y-4">
            {interview.questions.map((question, index) => (
              <div key={question._id} className="border border-gray-200 rounded-md p-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  {index + 1}. {question.title}
                </h4>
                {question.description && (
                  <p className="text-gray-600 mb-2">{question.description}</p>
                )}
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Type: {question.type}</span>
                  <span>Points: {question.points}</span>
                  {question.timeLimit > 0 && <span>Time: {question.timeLimit}s</span>}
                </div>
                {question.type === 'multiple-choice' && question.options && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">Options:</p>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {question.options.map((option, idx) => (
                        <li key={idx}>{option}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {interview.status === 'completed' && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Feedback & Rating</h3>
          {interview.feedback && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Feedback</h4>
              <p className="text-gray-600">{interview.feedback}</p>
            </div>
          )}
          {interview.rating && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Rating</h4>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`text-2xl ${i < interview.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    ★
                  </span>
                ))}
                <span className="ml-2 text-gray-600">{interview.rating}/5</span>
              </div>
            </div>
          )}
        </div>
      )}

      {interview.status === 'in-progress' && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Complete Interview</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Feedback
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Provide feedback for the interviewee..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400`}
                  >
                    ★
                  </button>
                ))}
                <span className="text-gray-600">{rating}/5</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewDetail;