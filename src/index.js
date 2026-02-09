// POST /api/users
app.post('/api/users', (req, res) => {
    const {firstName, lastName, role, email, gender, phoneNumber, linkedinUrl} = req.body;
    if (!isValidName(firstName) || !isValidName(lastName)) {
        return res.status(400).json({error: 'Invalid first or last name'});
    }
    if (!isValidEmail(email)) {
        return res.status(400).json({error: 'Invalid email format'});
    }
    if (!gender || !['male', 'female'].includes(gender)) {
        return res.status(400).json({error: 'Invalid gender'});
    }
    if (phoneNumber && !isValidPhoneNumber(phoneNumber)) {
        return res.status(400).json({error: 'Invalid phone number format (E.164)'});
    }
    if (linkedinUrl && !isValidLinkedinUrl(linkedinUrl)) {
        return res.status(400).json({error: 'Invalid LinkedIn URL'});
    }
    const newUser = {
        id: Math.floor(Math.random() * 1000),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        role,
        email,
        gender,
        phoneNumber: phoneNumber || null,
        linkedinUrl: linkedinUrl || null,
    };
    users.push(newUser);
    res.status(201).json({
        message: 'User created successfully',
        user: newUser,
    });
});