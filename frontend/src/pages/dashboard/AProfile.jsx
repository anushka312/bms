import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAdminAuth } from '../../context/AdminAuthContext';

const AProfile = () => {
    const { employee } = useAdminAuth();
    const employee_id = employee?.employee_id;

    const [profileData, setProfileData] = useState(null);
    const [formData, setFormData] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [showPasswords, setShowPasswords] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/employee/${employee_id}`);
                setProfileData(res.data);
                setFormData(res.data);
                console.log("Fetched Profile Data:", res.data);
            } catch (err) {
                console.error("Failed to fetch profile:", err);
            }
        };
        

        if (employee_id) fetchProfile();
    }, [employee_id]);

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSave = async () => {
        try {
            let madeChanges = false;

            // Password update
            if (currentPassword || newPassword || confirmPassword) {
                if (!currentPassword || !newPassword || !confirmPassword) {
                    setPasswordError('Please fill in all password fields.');
                    return;
                }

                if (newPassword !== confirmPassword) {
                    setPasswordError('Passwords do not match.');
                    return;
                }

                const passRes = await axios.put(`http://localhost:5000/employee/${employee_id}`, {
                    password: newPassword,
                });

                if (passRes.status === 200) {
                    alert("Password updated!");
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setPasswordError('');
                    madeChanges = true;
                }
            }

            // Profile update
            const updatedFields = {};

            if (formData.telephone_number !== profileData.telephone_number)
                updatedFields.telephone_number = formData.telephone_number;

            if (Object.keys(updatedFields).length > 0) {
                const res = await axios.put(`http://localhost:5000/employee/${employee_id}`, updatedFields);
                if (res.status === 200) {
                    setProfileData(prev => ({ ...prev, ...updatedFields }));
                    madeChanges = true;
                }
            }

            if (madeChanges) alert("Changes saved!");
            else alert("No changes detected.");

            setIsEditing(false);
        } catch (err) {
            console.error("Update failed:", err);
            alert("Update failed.");
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-start p-6">
            <motion.h1
                className="text-7xl text-gray-800 mb-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5 }}
            >
                Profile
            </motion.h1>

            {profileData ? (
                <div className="w-2/5 max-w-4xl bg-white bg-opacity-60 rounded-xl shadow-lg p-6 space-y-4 text-lg">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-4xl shadow-md">
                            {profileData.employee_name.charAt(0).toUpperCase()}
                        </div>



                        <div className="w-full space-y-4 text-xl">
                            <div className="flex justify-between items-center ">
                                <span className="font-semibold text-gray-700">Name:</span>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="employee_name"
                                        value={formData.employee_name}
                                        onChange={handleChange}
                                        className="border px-3 py-2 rounded-lg w-3/4"
                                    />
                                ) : (
                                    <span>{profileData.employee_name}</span>
                                )}
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-gray-700">Email:</span>
                                <span>{profileData.email}</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-gray-700">Employee ID:</span>
                                <span>{employee_id}</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-gray-700">Phone:</span>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="telephone_number"
                                        value={formData.telephone_number}
                                        onChange={handleChange}
                                        className="border px-3 py-2 rounded-lg w-3/4"
                                    />
                                ) : (
                                    <span>{profileData.telephone_number}</span>
                                )}
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-gray-700">Start Date:</span>
                                <span>{new Date(profileData.start_date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-gray-700">Branch Name:</span>
                                <span>{profileData.branch_name}</span>
                            </div>
                        </div>
                    </div>


                    {isEditing && (
                        <div className="pt-6 space-y-4">
                            <h3 className="text-xl font-semibold text-gray-800">Change Password</h3>
                            <div className="flex flex-col space-y-2">
                                <label>Current Password</label>
                                <input
                                    type={showPasswords ? "text" : "password"}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="border px-3 py-2 rounded-lg"
                                />

                                <label>New Password</label>
                                <input
                                    type={showPasswords ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="border px-3 py-2 rounded-lg"
                                />

                                <label>Confirm New Password</label>
                                <input
                                    type={showPasswords ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="border px-3 py-2 rounded-lg"
                                />

                                <div className="flex items-center space-x-2 mt-2">
                                    <input
                                        type="checkbox"
                                        checked={showPasswords}
                                        onChange={() => setShowPasswords(prev => !prev)}
                                    />
                                    <label className="text-sm text-gray-700">Show Passwords</label>
                                </div>

                                {passwordError && <p className="text-red-500">{passwordError}</p>}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between gap-4 pt-6">
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
            ) : (
                <p>Loading profile...</p>
            )}
        </div>
    );
};

export default AProfile;
