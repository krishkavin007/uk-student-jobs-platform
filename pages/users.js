// pages/users.js
import React from 'react';

function UsersPage({ users, error }) {
  if (error) {
    return <div>Error fetching users: {error}</div>;
  }

  if (!users || users.length === 0) {
    return <div>No users found. Try creating one via API first!</div>;
  }

  return (
    <div>
      <h1>All Users (Server-Rendered)</h1>
      <ul>
        {users.map(user => (
          <li key={user.user_id}>
            <strong>Username:</strong> {user.user_username} <br />
            <strong>Email:</strong> {user.user_email} <br />
            <strong>Type:</strong> {user.user_type} <br />
            {user.organization_name && <span><strong>Organization:</strong> {user.organization_name} <br /></span>}
            {user.user_first_name && <span><strong>Name:</strong> {user.user_first_name} {user.user_last_name} <br /></span>}
            <small>ID: {user.user_id}</small>
            <hr />
          </li>
        ))}
      </ul>
    </div>
  );
}

// This function runs on the server for every request
export async function getServerSideProps(context) {
  let users = [];
  let error = null;
  try {
    // --- MODIFIED LINE START HERE ---
    // Using the full absolute URL for server-side fetch to Next.js API Route
    const apiUrl = `http://upbeat-swanson.217-154-37-86.plesk.page/api/user`;
    // --- MODIFIED LINE END HERE ---

    const response = await fetch(apiUrl);

    if (!response.ok) {
      const errorText = await response.text(); // Get raw error message from backend
      throw new Error(`Failed to fetch users: ${response.status} - ${errorText}`);
    }
    users = await response.json();
  } catch (err) {
    console.error('Error in getServerSideProps for Users:', err.message);
    error = err.message;
  }

  return {
    props: {
      users, // will be passed to the page component as props
      error,
    },
  };
}

export default UsersPage;