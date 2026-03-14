import { useUser } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CreateInterview = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    intervieweeId: '',
    questions: [],
    scheduledAt: '',
    duration: 30
  });
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/questions`, {
          headers: {
            Authorization: `Bearer ${await user.getToken()}`
          }
        });
        setQuestions(response.data);
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    };

    if (user) {
      fetchQuestions();
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration' ? parseInt(value) || 30 : value
    }));
  };

  const handleQuestionToggle = (questionId) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.includes(questionId)
        ? prev.questions.filter(id => id !== questionId)
        : [...prev.questions, questionId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/interviews`, formData, {
        headers: {
          Authorization: `Bearer ${await user.getToken()}`
        }
      });

      navigate('/interviews');
    } catch (error) {
      console.error('Error creating interview:', error);
      alert('Error creating interview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Schedule Interview</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Interviewee ID *
            </label>
            <input
              type="text"
              name="intervieweeId"
              value={formData.intervieweeId}
              onChange={handleChange}
              required
              placeholder="Clerk user ID of interviewee"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Scheduled Date & Time *
            </label>
            <input
              type="datetime-local"
              name="scheduledAt"
              value={formData.scheduledAt}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (minutes)
            </label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              min="15"
              max="180"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Questions
          </label>
          {questions.length === 0 ? (
            <p className="text-gray-500">
              No questions available. <a href="/questions/create" className="text-blue-600 hover:underline">Create some questions first</a>.
            </p>
          ) : (
            <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-md p-4">
              {questions.map((question) => (
                <div key={question._id} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id={question._id}
                    checked={formData.questions.includes(question._id)}
                    onChange={() => handleQuestionToggle(question._id)}
                    className="mr-3"
                  />
                  <label htmlFor={question._id} className="text-sm">
                    <span className="font-medium">{question.title}</span>
                    <span className="text-gray-500 ml-2">({question.type})</span>
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Scheduling...' : 'Schedule Interview'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/interviews')}
            className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateInterview;