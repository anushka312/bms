import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const customer_id = user?.customer_id;

  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/customer/${customer_id}`);
        setProfileData(res.data);
        setFormData(res.data);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setError('Something went wrong while fetching profile.');
      } finally {
        setLoading(false);
      }
    };

    const fetchEmployeeInfo = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/employee/customer/${customer_id}`);
        setEmployeeInfo(res.data);
      } catch (err) {
        console.warn("No employee assigned or fetch failed:", err);
      }
    };

    if (customer_id) {
      fetchProfile();
      fetchEmployeeInfo();
    }
  }, [customer_id]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async () => {
    try {
      let madeChanges = false;

      // 1. Update password if fields are filled
      if (currentPassword || newPassword || confirmPassword) {
        if (!currentPassword || !newPassword || !confirmPassword) {
          setPasswordError('Please fill in all password fields.');
          return;
        }

        if (newPassword !== confirmPassword) {
          setPasswordError('Passwords do not match.');
          return;
        }

        const passwordPayload = {
          password: newPassword,
        };

        const passwordRes = await axios.put(
          `http://localhost:5000/customer/${customer_id}`,
          passwordPayload
        );

        if (passwordRes.status === 200) {
          alert("Password updated successfully!");
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setPasswordError('');
          madeChanges = true;
        } else {
          setPasswordError('Password update failed. Please try again.');
          return;
        }
      }
      
      // 2. Update profile if anything has changed
      const profilePayload = {};
      if (formData.customer_name !== profileData.customer_name) {
        profilePayload.customer_name = formData.customer_name;
      }
      if (formData.customer_street !== profileData.customer_street) {
        profilePayload.customer_street = formData.customer_street;
      }
      if (formData.customer_city !== profileData.customer_city) {
        profilePayload.customer_city = formData.customer_city;
      }

      if (Object.keys(profilePayload).length > 0) {
        const profileRes = await axios.put(
          `http://localhost:5000/customer/${customer_id}`,
          profilePayload
        );

        if (profileRes.status === 200) {
          setProfileData(prev => ({
            ...prev,
            ...profilePayload,
          }));
          madeChanges = true;
        }
      }

      if (madeChanges) {
        alert("Profile saved successfully!");
      } else {
        alert("No changes detected.");
      }

      setIsEditing(false);
    } catch (err) {
      console.error("Update failed:", err.response || err);
      if (err.response?.data?.message) {
        alert(`Error: ${err.response.data.message}`);
      } else {
        alert("Update failed. Please try again.");
      }
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await axios.delete(`http://localhost:5000/account/${customer_id}`);
  
      if (response.status === 200) {
        alert("Your account has been deleted.");
        logout(); 
        navigate('/'); 
      } else {
        alert("Failed to delete account. Please try again.");
      }
    } catch (err) {
      console.error("Error deleting account:", err);
      alert("An error occurred while deleting your account.");
    }
  };
  

  const openDeleteModal = () => setIsDeleteModalOpen(true);
  const closeDeleteModal = () => setIsDeleteModalOpen(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-6">
      <motion.h1 className="text-7xl text-gray-800 mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}>
        Profile
      </motion.h1>

      {loading ? (
        <p className="text-lg">Loading profile...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : profileData ? (
        <div className="w-full max-w-5xl flex flex-row justify-between space-x-6 bg-white bg-opacity-50 rounded-xl shadow-md p-6">
          <div className="w-1/2 space-y-4 text-lg">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-rose-500 flex items-center justify-center text-white text-3xl shadow-md">
                {profileData.customer_name.charAt(0).toUpperCase()}
              </div>
              <div className="w-full space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-700">Name:</span>
                  {isEditing ? (
                    <input
                      type="text"
                      name="customer_name"
                      value={formData.customer_name}
                      onChange={handleChange}
                      className="border px-3 py-2 rounded-lg w-3/4"
                    />
                  ) : (
                    <span>{profileData.customer_name}</span>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-700">Email:</span>
                  <span>{profileData.email}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-700">Customer ID:</span>
                  <span>{profileData.customer_id}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-700">Street:</span>
                  {isEditing ? (
                    <input
                      type="text"
                      name="customer_street"
                      value={formData.customer_street}
                      onChange={handleChange}
                      className="border px-3 py-2 rounded-lg w-3/4"
                    />
                  ) : (
                    <span>{profileData.customer_street}</span>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-700">City:</span>
                  <span>{profileData.customer_city}</span>
                </div>

                {isEditing && (
                  <div className="space-y-4 pt-4 w-full">
                    <h3 className="text-xl font-semibold text-gray-800">Change Password</h3>
                    <div className="flex flex-col space-y-2 pl-3">
                      <label className="font-semibold text-gray-700">Current Password</label>
                      <input
                        type={showPasswords ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="border px-3 py-2 rounded-lg w-full"
                      />
                    </div>

                    <div className="flex flex-col space-y-2 pl-3">
                      <label className="font-semibold text-gray-700">New Password</label>
                      <input
                        type={showPasswords ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="border px-3 py-2 rounded-lg w-full"
                      />
                    </div>

                    <div className="flex flex-col space-y-2 pl-3">
                      <label className="font-semibold text-gray-700">Confirm New Password</label>
                      <input
                        type={showPasswords ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="border px-3 py-2 rounded-lg w-full"
                      />
                    </div>
                    <div className="flex items-center space-x-2 mt-4 pl-3">
                      <input
                        type="checkbox"
                        checked={showPasswords}
                        onChange={() => setShowPasswords(prev => !prev)}
                      />
                      <label className="text-sm text-gray-700">Show Passwords</label>
                    </div>

                    {passwordError && <p className="text-red-500">{passwordError}</p>}
                  </div>
                )}

                <div className="flex justify-between gap-4 pt-4">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleSave}
                        className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg w-1/2"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => {
                          setFormData(profileData);
                          setIsEditing(false);
                          setPasswordError('');
                          setCurrentPassword('');
                          setNewPassword('');
                          setConfirmPassword('');
                        }}
                        className="bg-gray-300 hover:bg-gray-400 text-black px-6 py-2 rounded-lg w-1/2"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg w-full"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {employeeInfo && (
            <div className="w-1/2 bg-white bg-opacity-30 p-5 rounded-lg shadow-md space-y-5">
              <h2 className="text-4xl font-bold text-black mb-4">POC</h2>
              <div className="space-y-5 text-xl px-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-700">Name:</span>
                  <span>{employeeInfo.employee_name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-700">Phone Number:</span>
                  <a href={`tel:${employeeInfo.telephone_number}`} className="text-blue-500 hover:underline block">
                    {employeeInfo.telephone_number}
                  </a>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-700">Mail ID:</span>
                  <a href={`mailto:${employeeInfo.email}`} className="text-blue-500 hover:underline block">
                    {employeeInfo.email}
                  </a>
                </div>
              </div>
              <p className="text-[18px] text-gray-600 mt-4 text-justify">
                If you have any questions or need assistance, feel free to reach out to your assigned point of contact.
              </p>
            </div>
          )}
        </div>
      ) : (
        <p className="text-gray-500">Profile data not available.</p>
      )}

      <motion.div
        className="w-full max-w-5xl mt-10 bg-red-100 rounded-xl shadow-md p-6 flex flex-row justify-between items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <div>
          <h2 className="text-2xl font-bold text-red-600">Danger Zone</h2>
          <p className="text-gray-700 text-md font-bold">
            Deleting your account is permanent and cannot be undone.
          </p>
        </div>
        <button
          onClick={openDeleteModal}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 text-lg rounded-lg"
        >
          Delete My Account
        </button>
      </motion.div>

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-800">Are you sure?</h2>
            <p className="text-gray-600 mt-4">
              Once you delete your account, it cannot be undone. This action will permanently remove your profile and all associated data.
            </p>
            <div className="flex justify-between mt-6">
              <button
                onClick={handleDeleteAccount}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg"
              >
                Delete Account
              </button>
              <button
                onClick={closeDeleteModal}
                className="bg-gray-300 hover:bg-gray-400 text-black px-6 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
