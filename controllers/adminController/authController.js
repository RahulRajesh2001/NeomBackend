import jwt from 'jsonwebtoken'

// POST
// api/v1/admin/login
// --- admin

export const AdminLogin = (req, res) => {
  try {
    const admin = {
      email: 'rahulrjev@gmail.com',
      password: 'Rahul@123',
    };
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required!' });
    }

    if (email === admin.email && password === admin.password) {
      const token = jwt.sign(
        { email: admin.email },
        process.env.JWT_ADMIN_SECRET,
        { expiresIn: process.env.JWT_TOKEN_LIFE }
      );
      return res.status(200).json({ message: 'Successfully Logged in', token });
    } else {
      return res.status(401).json({ message: 'Unauthorized: Incorrect email or password!' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Some error occurred. Please try again later.' });
  }
};