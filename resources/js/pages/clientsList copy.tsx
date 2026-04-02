import React, { useEffect, useState } from 'react';

// Define the shape of your database record
interface User {
    id: number;
    name: string;
    email: string;
    created_at: string;
}

const UserList: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Replace with your actual Laravel local or production URL
        const fetchUsers = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/users');

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data: User[] = await response.json();
                setUsers(data);
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : 'An error occurred',
                );
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    if (loading) return <p>Loading users...</p>;
    if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

    return (
        <div>
            <h1>Database Users</h1>
            <ul>
                {users.map((user) => (
                    <li key={user.id}>
                        <strong>{user.name}</strong> - {user.email}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default UserList;
