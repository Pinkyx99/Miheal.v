// This file contains mock data for demonstrating the admin panel UI.

export const MOCK_USERS = [
    {
        id: '1',
        username: 'Owner',
        email: 'userr.98a@gmail.com',
        avatar_url: 'https://i.imgur.com/L4pP31z.png',
        role: 'Owner',
        balance: 10000.00,
        status: 'Online',
        last_seen: new Date().toISOString(),
    },
    {
        id: '2',
        username: 'Alice',
        email: 'alice@example.com',
        avatar_url: 'https://i.pravatar.cc/150?u=alice',
        role: 'Admin',
        balance: 543.21,
        status: 'Online',
        last_seen: new Date().toISOString(),
    },
    {
        id: '3',
        username: 'Bob',
        email: 'bob@example.com',
        avatar_url: 'https://i.pravatar.cc/150?u=bob',
        role: 'Moderator',
        balance: 123.45,
        status: 'Offline',
        last_seen: new Date(Date.now() - 86400000).toISOString(),
    },
    {
        id: '4',
        username: 'Charlie',
        email: 'charlie_banned@example.com',
        avatar_url: 'https://i.pravatar.cc/150?u=charlie',
        role: 'User',
        balance: 0.00,
        status: 'Banned',
        last_seen: new Date(Date.now() - 604800000).toISOString(),
    },
    // Add more users to test pagination
    ...Array.from({ length: 25 }, (_, i) => ({
        id: (i + 5).toString(),
        username: `user_${i + 1}`,
        email: `user${i + 1}@example.com`,
        avatar_url: `https://i.pravatar.cc/150?u=user${i + 1}`,
        role: 'User',
        balance: Math.random() * 1000,
        status: Math.random() > 0.5 ? 'Online' : 'Offline' as 'Online' | 'Offline',
        last_seen: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString(),
    }))
];