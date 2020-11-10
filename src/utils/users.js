const users = [];

const addUser = ({ id, username, room }) => {
    // Remove white space and make lowercase from username and room
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // Check if room and username are provided
    if (!room || !username) {
        return {
            error: "Username and room are required!"
        }
    }
    console.log(users)
    // Check for existing user
    const existingUser = users.find((user) => {
        console.log('user', user)
        return user.room === room && user.username === username;
    })
    console.log('exisitingUser', existingUser)
    // Return error if username is already used
    if (existingUser) {
        return {
            error: 'Username is in use!'
        };
    }

    // Store user
    const user = { id, username, room };
    users.push(user);
    return { user };
}

const removeUser = (id) => {
    // Find the user
    const index = users.findIndex((user) => user.id === id);

    // If we found a user, remove it from the array
    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
}

const getUser = (id) => {
    // Find user by id
    return users.find((user) => user.id === id);
}
const getUsersInRoom = (room) => {
    // Find users in room
    return users.filter((user) => user.room === room);
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}