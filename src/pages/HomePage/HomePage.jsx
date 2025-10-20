import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsers, deleteUser } from "../../services/api/userApi";
import { clearMessage } from "../../redux/slices/userSlice";
import "./HomePage.css";
import { useNavigate } from "react-router-dom";

const HomePage = () => {

  const dispatch = useDispatch();
  const { allUser, isFetching, error } = useSelector(state => state?.user?.users || { allUser: null, isFetching: false, error: false });
  const message = useSelector(state => state?.user?.message || { text: "", type: "" });
  const accessToken = useSelector(state => state?.auth?.login?.accessToken || "");
  const currentUser = useSelector(state => state?.auth?.login?.currentUser || null);
  const navigate = useNavigate();

  // Fetch users khi component mount
  useEffect(() => {
    console.log("🔍 useEffect triggered:");
    console.log("- currentUser:", currentUser ? "EXISTS" : "NULL");
    console.log("- accessToken:", accessToken ? "EXISTS" : "NULL");
    
    if(!currentUser) {
      console.log(" Redirecting to login: no currentUser");
      navigate('/login');
      return;
    }
    
    if (currentUser) {
      console.log("👥 Fetching users...");
      getAllUsers(dispatch).catch(error => {
        // Ignore AUTH_FAILED errors since we already redirected
        if (error.message !== 'AUTH_FAILED') {
          console.error("❌ Error fetching users:", error);
        }
      });
    } else {
      console.log("⚠️ No currentUser, skipping user fetch");
    }
  }, [accessToken, dispatch, currentUser, navigate]);

  // Auto clear message after 3 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        dispatch(clearMessage());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message.text, dispatch]);

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        console.log("🗑️ Deleting user with ID:", userId);
        console.log("🔑 Current state before delete:");
        console.log("- accessToken:", accessToken ? "EXISTS" : "NULL");
        console.log("- currentUser:", currentUser ? "EXISTS" : "NULL");
        
        await deleteUser(userId, dispatch);
        console.log("✅ Delete successful, refreshing user list...");
        
        console.log("🔑 Current state after delete:");
        console.log("- accessToken:", accessToken ? "EXISTS" : "NULL");
        console.log("- currentUser:", currentUser ? "EXISTS" : "NULL");
        
        // Refresh user list after successful delete
        getAllUsers(dispatch).catch(error => {
          if (error.message !== 'AUTH_FAILED') {
            console.error("❌ Error refreshing user list:", error);
          }
        });
      } catch (error) {
        if (error.message !== 'AUTH_FAILED') {
          console.error("❌ Failed to delete user:", error);
        }
      }
    }
  };

  if (isFetching) {
    return (
      <main className="home-container">
        <div className="home-title">Loading...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="home-container">
        <div className="home-title">Error loading users</div>
      </main>
    );
  }

  return (
    <main className="home-container">
      <div className="home-title">User List</div>
      
      {/* Display message */}
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
      
      <div className="home-userlist">
        {allUser && allUser.length > 0 ? (
          allUser.map((user) => (
            <div key={user._id} className="user-container">
              <div className="home-user">
                <div>Username: {user.username}</div>
                <div>Email: {user.email}</div>
                <div>Role: {user.role || 'user'}</div>
              </div>
              <div 
                className="delete-user" 
                onClick={() => handleDeleteUser(user._id)}
              > 
                Delete 
              </div>
            </div>
          ))
        ) : (
          <div>No users found</div>
        )}
      </div>
    </main>
  );
};

export default HomePage;