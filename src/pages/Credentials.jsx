import React, { useState, useEffect } from 'react';

const Credentials = () => {
  const [roll, setRoll] = useState('');
  const [credentials, setCredentials] = useState([]);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('credentials.json')
      .then(res => res.json())
      .then(data => setCredentials(data))
      .catch(err => console.error('Error loading data:', err));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedRollNo = roll.trim().toLowerCase();

    setError('');
    setUserData(null);

    if (!trimmedRollNo) {
      setError('Please enter a roll number');
      return;
    }

    const user = credentials.find(
      (u) => u.roll_no.toLowerCase() === trimmedRollNo
    );

    if (user) {
      setUserData(user);
    } else {
      setError(`No user found with Roll No: ${trimmedRollNo}`);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Get Your AWS Credentials</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter Roll no"
          value={roll}
          onChange={(e) => setRoll(e.target.value)}
          className="w-full p-2 mb-3 border rounded"
        />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
          Fetch Credentials
        </button>
      </form>

      {userData && (
        <div className="mt-6 p-4 bg-green-100 rounded border border-green-400">
          <p><strong>Roll no:</strong> {userData.roll_no}</p>
          <p><strong>IAM Username:</strong> {userData.username}</p>
          <p><strong>Password:</strong> {userData.password}</p>
          <p>
            <strong>Login:</strong>{' '}
            <a href={userData.login_url} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">
              {userData.login_url}
            </a>
          </p>
        </div>
      )}

        {error && (
          <div className="mt-6 p-4 bg-red-100 rounded border border-red-400">
            <p className="text-red-600">{error}</p>
          </div>
        )}
    </div>
  );
};

export default Credentials;