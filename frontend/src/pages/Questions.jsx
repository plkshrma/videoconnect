import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Questions = () => {
  const { user } = useUser();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchQuestions();
    }
  }, [user]);

  const deleteQuestion = async (id) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/questions/${id}`, {
        headers: {
          Authorization: `Bearer ${await user.getToken()}`
        }
      });
      setQuestions(questions.filter(q => q._id !== id));
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Questions</h1>
        <Link
          to="/questions/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Create Question
        </Link>
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No questions created yet.</p>
          <Link
            to="/questions/create"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Create Your First Question
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {questions.map((question) => (
            <div key={question._id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {question.title}
                  </h3>
                  {question.description && (
                    <p className="text-gray-600 mb-2">{question.description}</p>
                  )}
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Type: {question.type}</span>
                    <span>Points: {question.points}</span>
                    {question.timeLimit > 0 && (
                      <span>Time: {question.timeLimit}s</span>
                    )}
                  </div>
                  {question.type === 'multiple-choice' && question.options && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">Options:</p>
                      <ul className="list-disc list-inside text-sm text-gray-600">
                        {question.options.map((option, index) => (
                          <li key={index}>{option}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => deleteQuestion(question._id)}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Questions;