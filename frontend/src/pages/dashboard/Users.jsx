import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAdminAuth } from '../../context/AdminAuthContext';

const Users = () => {
    const { employee } = useAdminAuth();
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState(''); // Step 1: State for search query
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch(`http://localhost:5000/other/users_name/${employee.employee_id}`);
                const data = await res.json();
                setUsers(data);
            } catch (err) {
                console.error('Error fetching users:', err);
            }
        };

        if (employee) fetchUsers();
    }, [employee]);

    // Step 2: Filter the users based on the search query
    const filteredUsers = users.filter(user =>
        user.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-6">
            <motion.h1
                className="text-5xl md:text-7xl mb-14"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
            >
                Customers Assigned
            </motion.h1>

            {/* Step 3: Add the search bar */}
            <div className='flex justify-center'>
            <div className="mb-6 w-2/3 ">
                <input
                    type="text"
                    placeholder="Search by name or email"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)} // Update search query
                    className=" w-full p-3 rounded-lg border border-gray-300"
                />
            </div>
            </div>

            <div className="flex justify-center items-center p-8">
                <div className="grid grid-cols w-2/3  gap-6">
                    {/* Step 4: Map over filtered users */}
                    {filteredUsers.map(user => (
                        <div
                            key={user.customer_id}
                            onClick={() => navigate(`/user/${user.customer_id}`)}
                            className="bg-white bg-opacity-90 shadow-md rounded-lg p-8 cursor-pointer hover:shadow-xl transition"
                        >
                            <h2 className="text-3xl font-semibold text-blue-800">{user.customer_name}</h2>
                            <p className="text-gray-700 my-1 text-lg">{user.email}</p>
                            <p className="text-lg text-gray-500 mt-1">Customer ID: {user.customer_id}</p>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
};

export default Users;
