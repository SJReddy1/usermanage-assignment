import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [editedUser, setEditedUser] = useState({ first_name: '', last_name: '', email: '' });
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState(''); // For search functionality

  const navigate = useNavigate(); // For navigation

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  useEffect(() => {
    filterUsers(searchQuery); // Filter users whenever search query changes
  }, [searchQuery, users]);

  const fetchUsers = async (page) => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await axios.get(`https://reqres.in/api/users?page=${page}`);
      setUsers(response.data.data);
      setFilteredUsers(response.data.data); // Set initial filtered users
      setTotalPages(response.data.total_pages);
    } catch (err) {
      setError('Failed to fetch user data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setEditedUser({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
    });
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://reqres.in/api/users/${id}`);
      setMessage('User deleted successfully!');
      setUsers(users.filter((user) => user.id !== id));
    } catch (err) {
      setError('Failed to delete user. Please try again later.');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault(); // Prevent form submission reload
  
    try {
      // Sending updated user data to the API
      const response = await axios.put(`https://reqres.in/api/users/${selectedUser.id}`, {
        first_name: editedUser.first_name,
        last_name: editedUser.last_name,
        email: editedUser.email,
      });
  
      // Manually updating the user in the local state
      setUsers(
        users.map((user) =>
          user.id === selectedUser.id
            ? { ...user, ...response.data } // Merge API response with local state
            : user
        )
      );
  
      // Update the filtered users to reflect changes in search
      setFilteredUsers(
        filteredUsers.map((user) =>
          user.id === selectedUser.id
            ? { ...user, ...response.data } // Merge API response with local state
            : user
        )
      );
  
      // Clear selected user and edited user states
      setMessage('User updated successfully!');
      setSelectedUser(null); // Close the edit form
      setEditedUser({ first_name: '', last_name: '', email: '' });
    } catch (err) {
      setError('Failed to update user. Please try again later.');
    }
  };
  

  // Search/filter function
  const filterUsers = (query) => {
    if (!query) {
      setFilteredUsers(users); // If no query, show all users
      return;
    }
    const lowercasedQuery = query.toLowerCase();
    const filtered = users.filter(
      (user) =>
        user.first_name.toLowerCase().includes(lowercasedQuery) ||
        user.last_name.toLowerCase().includes(lowercasedQuery) ||
        user.email.toLowerCase().includes(lowercasedQuery)
    );
    setFilteredUsers(filtered); // Update filtered users
  };

  // Handle logout
  const handleLogout = () => {
    // Remove any token or authentication data here (if applicable)
    // For example:
    localStorage.removeItem('authToken'); // Example, if you are using localStorage to store a token
    navigate('/login'); // Redirect to login page
  };

  return (
    <div className="user-list-container">
      <h1>Users List</h1>
      {message && <p className="message success">{message}</p>}
      {error && <p className="error">{error}</p>}

      {/* Search bar */}
      <div className="search-bar">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)} // Update search query
          placeholder="Search by name or email..."
        />
      </div>

      {/* Logout Button */}
      <button className="logout-btn" onClick={handleLogout}>Logout</button>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="user-grid">
          {filteredUsers.map((user) => (
            <div key={user.id} className="user-card">
              <img src={user.avatar} alt={`${user.first_name} ${user.last_name}`} />
              <h2>
                {user.first_name} {user.last_name}
              </h2>
              <p>{user.email}</p>
              <button onClick={() => handleEdit(user)}>Edit</button>
              <button onClick={() => handleDelete(user.id)}>Delete</button>
            </div>
          ))}
        </div>
      )}

      {selectedUser && (
        <div className="edit-form-container">
          <h2>Edit User</h2>
          <form onSubmit={handleUpdate}>
            <input
              type="text"
              value={editedUser.first_name}
              onChange={(e) =>
                setEditedUser({ ...editedUser, first_name: e.target.value })
              }
              required
              placeholder="First Name"
            />
            <input
              type="text"
              value={editedUser.last_name}
              onChange={(e) =>
                setEditedUser({ ...editedUser, last_name: e.target.value })
              }
              required
              placeholder="Last Name"
            />
            <input
              type="email"
              value={editedUser.email}
              onChange={(e) =>
                setEditedUser({ ...editedUser, email: e.target.value })
              }
              required
              placeholder="Email"
            />
            <button type="submit">Update</button>
            <button type="button" onClick={() => setSelectedUser(null)}>
              Cancel
            </button>
          </form>
        </div>
      )}

      <div className="pagination-controls">
        <button onClick={handlePrevious} disabled={page === 1}>
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button onClick={handleNext} disabled={page === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
};

export default UserList;
