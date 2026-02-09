// PUT /api/users/:id
app.put('/api/users/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = users.findIndex(u => u.id === id);
    if (index === -1) {
        return res.status(404).json({error: 'User not found'});
    }
    const {firstName, lastName, role, email, gender, phoneNumber, linkedinUrl} = req.body;
    if (firstName !== undefined && !isValidName(firstName)) {
        return res.status(400).json({error: 'Invalid first name'});
    }
    if (lastName !== undefined && !isValidName(lastName)) {
        return res.status(400).json({error: 'Invalid last name'});
    }
    if (email !== undefined && !isValidEmail(email)) {
        return res.status(400).json({error: 'Invalid email format'});
    }
    if (gender && !['male', 'female'].includes(gender)) {
        return res.status(400).json({error: 'Invalid gender'});
    }
    if (phoneNumber && !isValidPhoneNumber(phoneNumber)) {
        return res.status(400).json({error: 'Invalid phone number format (E.164)'});
    }
    if (firstName !== undefined) users[index].firstName = firstName.trim();
    if (lastName !== undefined) users[index].lastName = lastName.trim();
    if (role !== undefined) users[index].role = role;
    if (email !== undefined) users[index].email = email;
    if (gender !== undefined) users[index].gender = gender;
    if (phoneNumber !== undefined) users[index].phoneNumber = phoneNumber;
    if (linkedinUrl !== undefined) users[index].linkedinUrl = linkedinUrl;
    res.json({
        message: 'User updated successfully',
        user: users[index],
    });
});