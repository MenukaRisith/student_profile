const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs'); 

const app = express();
const PORT = 3000;

// Database Configuration
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'student_profile',
});

// Check Database Connection
(async () => {
  try {
    await db.getConnection();
    console.log('Connected to the MySQL database.');
  } catch (err) {
    console.error('Database connection failed:', err.message);
  }
})();


// File Upload Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB file size limit
  }
});

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const SECRET_KEY = '0edec067ddc8b4a6d42e371c57ba6050cdc20d118ad151c096b4cb955d88612fad58c4cad5027ad910f3133cc54b8aa19a4b57b2919df57f65b564047d7e0cc4';

// Helper Functions
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; // Setting the user in the request object
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

//generate certificates
const generateCertificate = async (studentId, description, token) => {
  try {
    const response = await fetch('http://localhost:3003/issue', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.BLOCKCHAIN_AUTH_TOKEN}`, // Token for blockchain server
      },
      body: JSON.stringify({ studentId, description }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to generate certificate');
    }

    const data = await response.json();
    return data; // Contains details of the mined block
  } catch (error) {
    console.error('Error generating certificate:', error);
    throw error;
  }
};

//fetch certificates
const fetchCertificates = async (token) => {
  try {
    const response = await fetch('http://localhost:3003/certificates', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.BLOCKCHAIN_AUTH_TOKEN}`, // Token for blockchain server
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch certificates');
    }

    const data = await response.json();
    return data.certificates;
  } catch (error) {
    console.error('Error fetching certificates:', error);
    throw error;
  }
};

//verify certificates
const verifyCertificate = async (certId) => {
  try {
    const response = await fetch(`http://localhost:3003/verify/${certId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.BLOCKCHAIN_AUTH_TOKEN}`, // Token for blockchain server
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to verify certificate');
    }

    const data = await response.json();
    return data.certificate;
  } catch (error) {
    console.error('Error verifying certificate:', error);
    throw error;
  }
};

const hashPassword = async (password) => bcrypt.hash(password, 10);
const comparePassword = async (password, hash) => bcrypt.compare(password, hash);

// Endpoints

// 1. Login
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [results] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (results.length === 0)
      return res.status(404).json({ message: "User not found" });

    const user = results[0];
    const isValid = await comparePassword(password, user.password);
    if (!isValid)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user.userId, role: user.role },
      SECRET_KEY,
      { expiresIn: "1h" }
    );
    res.json({ token, role: user.role });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ message: "Database error" });
  }
});

// 2. Register Student
app.post('/students/register', async (req, res) => {
  const {
    fullName,
    email,
    password,
    indexNumber,
    studentClass,
    birthday,
    profilePicture, // This will be the base64 string from the frontend
  } = req.body;

  console.log('Received profile picture (base64):', profilePicture ? profilePicture.substring(0, 50) : 'No image');

  let profilePicturePath = null;
  if (profilePicture) {
    try {
      const matches = profilePicture.match(/^data:image\/([a-zA-Z]*);base64,([^\"]*)$/);
      if (matches && matches.length === 3) {
        const imageBuffer = Buffer.from(matches[2], 'base64');
        const fileName = `${uuidv4()}.jpg`;
        const filePath = path.join(__dirname, 'uploads', fileName);

        console.log('Decoded image buffer length:', imageBuffer.length);
        console.log('Saving file at:', filePath);

        fs.writeFileSync(filePath, imageBuffer);
        profilePicturePath = `/uploads/${fileName}`;
      } else {
        console.error('Base64 string is not valid');
        return res.status(400).json({ message: 'Invalid base64 image string' });
      }
    } catch (error) {
      console.error('Error decoding or saving image:', error);
      return res.status(500).json({ message: 'Failed to save profile picture' });
    }
  }

  const hashedPassword = await hashPassword(password);

  try {
    const [studentResults] = await db.execute('SELECT * FROM students WHERE indexNumber = ?', [indexNumber]);

    if (studentResults.length > 0) {
      const existingStudent = studentResults[0];
      const existingStudentId = existingStudent.studentId;

      await db.execute(
        'UPDATE students SET fullName = ?, email = ?, password = ?, class = ?, birthday = ?, profilePicture = ? WHERE indexNumber = ?',
        [
          fullName,
          email,
          hashedPassword,
          studentClass,
          birthday,
          profilePicturePath || existingStudent.profilePicture,
          indexNumber,
        ]
      );

      const [userResults] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);

      if (userResults.length === 0) {
        await db.execute(
          'INSERT INTO users (userId, email, password, role) VALUES (?, ?, ?, ?)',
          [existingStudentId, email, hashedPassword, 'student']
        );
        return res.status(200).json({ message: 'Student and user updated successfully' });
      } else {
        return res.status(200).json({ message: 'Student updated, user already exists' });
      }
    } else {
      const newStudentId = uuidv4();

      await db.execute(
        'INSERT INTO students (studentId, fullName, indexNumber, email, password, class, birthday, profilePicture) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          newStudentId,
          fullName,
          indexNumber,
          email,
          hashedPassword,
          studentClass,
          birthday,
          profilePicturePath,
        ]
      );

      await db.execute(
        'INSERT INTO users (userId, email, password, role) VALUES (?, ?, ?, ?)',
        [newStudentId, email, hashedPassword, 'student']
      );

      return res.status(201).json({ message: 'Registration successful, user created', studentId: newStudentId });
    }
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ message: 'Database error' });
  }
});

// 3. Get Dashboard Data
app.get("/dashboard", authenticate, async (req, res) => {
  const { role, userId } = req.user;

  try {
    let query = "";
    let params = [];

    if (role === "teacher") {
      query = `
        SELECT teachers.class, students.indexNumber, students.fullName, students.class AS studentClass
        FROM teachers
        LEFT JOIN students ON teachers.class = students.class
        WHERE teachers.userId = ?
      `;
      params = [userId];
    } else if (role === "student") {
      query = `
        SELECT students.fullName, students.class, students.email, students.profilePicture, achievements.description AS achievementDescription, achievements.date AS achievementDate
        FROM students
        LEFT JOIN achievements ON students.studentId = achievements.studentId
        WHERE students.studentId = ?
      `;
      params = [userId];
    } else if (role === "societyAdmin") {
      return res.json({
        role,
        message: "You have the 'Society Admin' role. You can assign roles to students.",
      });
    } else if (role === "admin") {
      query = "SELECT * FROM users WHERE userId = ?";
      params = [userId];
    } else {
      return res.status(400).json({ message: "Invalid role" });
    }

    const [results] = await db.query(query, params);
    if (results.length === 0)
      return res.status(404).json({ message: "No data found for this user" });

    res.json({ role, data: results });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ message: "Database error" });
  }
});

// 4. Add Student
app.post('/teachers/add-student', authenticate, async (req, res) => {
  if (req.user.role !== 'teacher') return res.status(403).json({ message: 'Forbidden' });

  const { indexNumber, class: teacherClass } = req.body;
  console.log('Add student request received. Index:', indexNumber, 'Class:', teacherClass); // Debugging request

  if (!indexNumber || !teacherClass) {
    console.log('Validation error: Index number and class are required'); // Debugging validation error
    return res.status(400).json({ message: 'Index number and class are required.' });
  }

  try {
    // Validate the teacher's class using userId
    const [classResults] = await db.execute(
      'SELECT * FROM teachers WHERE userId = ? AND class = ?',
      [req.user.userId, teacherClass]  // Here we use req.user.userId
    );

    if (classResults.length === 0) {
      console.log('Class not found for userId:', req.user.userId); // Debugging class not found
      return res.status(400).json({ message: 'Class not found or unauthorized access.' });
    }

    // Insert the student's index number and class into the database
    await db.execute(
      'INSERT INTO students (studentId, indexNumber, class) VALUES (?, ?, ?)',
      [uuidv4(), indexNumber, teacherClass]
    );

    console.log('Student added successfully:', indexNumber); // Debugging success
    res.json({ message: 'Student index number added successfully.' });
  } catch (err) {
    console.error('Database error during operation:', err); // Debugging database error
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Index number already exists.' });
    }
    return res.status(500).json({ message: 'Failed to add student.' });
  }
});

// 5. Assign Role (Society Admin)
app.post('/societies/assign-role', authenticate, async (req, res) => {
  if (req.user.role !== 'societyAdmin') return res.status(403).json({ message: 'Forbidden' });

  const { indexNumber, role: roleName, societyName } = req.body;

  if (!indexNumber || !roleName || !societyName) {
    return res.status(400).json({ message: 'Index number, role, and society name are required' });
  }

  const requestId = uuidv4();
  const currentYear = new Date().getFullYear();  // Get current year
  const yearAppointed = currentYear;
  const yearEnded = null;  // Set yearEnded as null initially

  try {
    // Query to get the student using the indexNumber
    const [studentResults] = await db.execute('SELECT * FROM students WHERE indexNumber = ?', [indexNumber]);

    if (studentResults.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Proceed to create the request
    await db.execute(
      'INSERT INTO requests (requestId, studentId, type, details, status, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
      [
        requestId,
        studentResults[0].studentId,  // Use the studentId from the student query result
        'role',
        JSON.stringify({ roleName, societyName, yearAppointed, yearEnded }),
        'pending',
        new Date(),
      ]
    );

    res.json({ message: 'Role assignment request sent' });
  } catch (err) {
    console.error('Database error during operation:', err); // Debugging database error
    return res.status(500).json({ message: 'Database error' });
  }
});

// 6. Approve Role Request (Teacher/Admin)
app.post('/admins/approve-role', authenticate, async (req, res) => {
  const { requestId, status } = req.body;

  try {
    // Query to get the request by requestId
    const [requestResults] = await db.execute('SELECT * FROM requests WHERE requestId = ?', [requestId]);

    if (requestResults.length === 0) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const request = requestResults[0];

    // Update the request status
    await db.execute('UPDATE requests SET status = ? WHERE requestId = ?', [status, requestId]);

    if (status === 'approved') {
      // Parse details and insert the role into the `roles` table if the request is approved
      const { roleName, societyName } = JSON.parse(request.details);

      await db.execute(
        'INSERT INTO roles (roleId, studentId, roleName, societyName, yearAppointed, yearEnded) VALUES (?, ?, ?, ?, ?, ?)',
        [
          uuidv4(),
          request.studentId,
          roleName,
          societyName, // Use actual society name if needed
          new Date().getFullYear(),
          null,
        ]
      );
      res.json({ message: 'Role request approved and added to roles' });
    } else {
      res.json({ message: 'Role request rejected' });
    }
  } catch (err) {
    console.error('Database error during operation:', err); // Debugging database error
    return res.status(500).json({ message: 'Database error' });
  }
});

// 7. Add Behavior (Teacher)
app.post('/teachers/add-behavior', authenticate, async (req, res) => {
  const { indexNumber, type, description } = req.body;
  const behaviorId = uuidv4();

  // Check if the teacher has the appropriate role
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  try {
    // Fetch the studentId using the provided indexNumber
    const [studentResults] = await db.execute('SELECT studentId FROM students WHERE indexNumber = ?', [indexNumber]);

    if (studentResults.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const studentId = studentResults[0].studentId;

    // Prepare the behavior request data
    const behaviorRequestData = {
      requestId: behaviorId,
      studentId: studentId,
      type: 'behavior',
      details: JSON.stringify({ type, description }),
      status: 'pending',
      createdAt: new Date(),
    };

    // Insert the behavior request into the `requests` table
    await db.execute(
      'INSERT INTO requests (requestId, studentId, type, details, status, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
      [
        behaviorRequestData.requestId,
        behaviorRequestData.studentId,
        behaviorRequestData.type,
        behaviorRequestData.details,
        behaviorRequestData.status,
        behaviorRequestData.createdAt,
      ]
    );

    res.json({ message: 'Behavior request sent to admin' });
  } catch (err) {
    console.error('Database error during operation:', err); // Debugging database error
    return res.status(500).json({ message: 'Database error' });
  }
});

// 8. Approve Behavior (Admin)
app.post('/admins/approve-behavior', authenticate, async (req, res) => {
  const { requestId, status } = req.body;

  // Ensure the user has admin rights
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  try {
    // Fetch the request by requestId
    const [requestResults] = await db.execute('SELECT * FROM requests WHERE requestId = ?', [requestId]);

    if (requestResults.length === 0) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const request = requestResults[0];
    const { studentId, details } = request;
    const parsedDetails = JSON.parse(details);

    // Update the request status
    await db.execute('UPDATE requests SET status = ? WHERE requestId = ?', [status, requestId]);

    // If the status is approved, add the behavior to the `behaviors` table
    if (status === 'approved') {
      await db.execute(
        'INSERT INTO behaviors (behaviorId, studentId, type, description, date) VALUES (?, ?, ?, ?, ?)',
        [
          uuidv4(),
          studentId,
          parsedDetails.type,
          parsedDetails.description,
          new Date(),
        ]
      );
      return res.json({ message: 'Behavior request approved and saved in behaviors table' });
    }

    // If not approved, just acknowledge processing
    return res.json({ message: 'Behavior request processed but not approved' });
  } catch (err) {
    console.error('Database error during operation:', err); // Debugging database error
    return res.status(500).json({ message: 'Database error' });
  }
});

// 9. Get Student Profile by Index Number
app.get('/students/profile/:indexNumber', async (req, res) => {
  const { indexNumber } = req.params;

  try {
    // Query the `students` table
    const [studentResults] = await db.execute('SELECT * FROM students WHERE indexNumber = ?', [indexNumber]);
    if (studentResults.length === 0) return res.status(404).json({ message: 'Student not found' });

    const student = studentResults[0];

    // Query the `roles` table
    const [roleResults] = await db.execute('SELECT * FROM roles WHERE studentId = ?', [student.studentId]);

    // Query the `achievements` table
    const [achievementResults] = await db.execute('SELECT * FROM achievements WHERE studentId = ?', [student.studentId]);

    // Query the `behaviors` table for good behaviors only
    const [behaviorResults] = await db.execute('SELECT * FROM behaviors WHERE studentId = ? AND type = "good"', [student.studentId]);

    // Return the combined profile
    res.json({
      profile: {
        ...student,
        roles: roleResults,
        achievements: achievementResults,
        behaviors: behaviorResults,
      },
    });
  } catch (err) {
    console.error('Database error:', err); // Debugging database error
    return res.status(500).json({ message: 'Database error' });
  }
});

// 10. update profile picture and class
app.put('/students/update-profile', authenticate, async (req, res) => {
  const { userId } = req.user;
  const { newClass, profilePicture } = req.body;

  try {
    // Fetch the student from the database
    const [studentResults] = await db.execute('SELECT * FROM students WHERE studentId = ?', [userId]);

    if (studentResults.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const student = studentResults[0];

    // Calculate the time difference between now and the last update
    const currentDate = new Date();
    const lastUpdated = new Date(student.lastUpdated);
    const timeDifference = currentDate - lastUpdated;
    const oneYearInMs = 365 * 24 * 60 * 60 * 1000; // 1 year in milliseconds

    if (timeDifference < oneYearInMs) {
      return res.status(400).json({ message: 'You can only update your profile once per year.' });
    }

    // Proceed with the update
    let profilePicturePath = student.profilePicture;

    if (profilePicture) {
      try {
        // Decode and save the new profile picture
        const matches = profilePicture.match(/^data:image\/([a-zA-Z]*);base64,([^\"]*)$/);
        if (matches && matches.length === 3) {
          const imageBuffer = Buffer.from(matches[2], 'base64');
          const fileName = `${uuidv4()}.jpg`; // Generate unique file name
          const filePath = path.join(__dirname, 'uploads', fileName);
          fs.writeFileSync(filePath, imageBuffer);
          profilePicturePath = `/uploads/${fileName}`; // Path to be stored in the database
        } else {
          console.error('Base64 string is not valid');
          return res.status(400).json({ message: 'Invalid base64 image string' });
        }
      } catch (error) {
        console.error('Error decoding or saving image:', error);
        return res.status(500).json({ message: 'Failed to save profile picture' });
      }
    }

    // Update the student's profile picture and class
    await db.execute(
      'UPDATE students SET class = ?, profilePicture = ?, lastUpdated = CURRENT_TIMESTAMP WHERE studentId = ?',
      [newClass, profilePicturePath, userId]
    );

    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Database error during operation:', err); // Debugging database error
    return res.status(500).json({ message: 'Database error' });
  }
});

// 11. Get Pending Requests for Admin
app.get('/requests', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  // Fetch all pending requests for admin, including roles, behaviors, and achievements
  const query = `
    SELECT 
      r.requestId, 
      r.studentId, 
      r.details, 
      r.createdAt, 
      'role' AS requestType,
      ro.yearAppointed, 
      ro.yearEnded, 
      ro.societyName
    FROM 
      requests r
    JOIN 
      roles ro ON r.studentId = ro.studentId
    WHERE 
      r.type = "role" AND r.status = "pending"
    UNION ALL
    SELECT 
      r.requestId, 
      r.studentId, 
      r.details, 
      r.createdAt, 
      'behavior' AS requestType,
      NULL AS yearAppointed, 
      NULL AS yearEnded, 
      NULL AS societyName
    FROM 
      requests r
    WHERE 
      r.type = "behavior" AND r.status = "pending"
    UNION ALL
    SELECT 
      r.requestId, 
      r.studentId, 
      r.details, 
      r.createdAt, 
      'achievement' AS requestType,
      NULL AS yearAppointed, 
      NULL AS yearEnded, 
      NULL AS societyName
    FROM 
      requests r
    WHERE 
      r.type = "achievement" AND r.status = "pending"
  `;

  try {
    const [results] = await db.execute(query);
    res.json({ requests: results });
  } catch (err) {
    console.error('Database error:', err); // Debugging database error
    return res.status(500).json({ message: 'Database error' });
  }
});

// 12. Create Achievement Request (Teacher)
app.post('/teachers/create-achievement', authenticate, async (req, res) => {
  const { indexNumber, description } = req.body;
  const requestId = uuidv4();

  // Check if the teacher has the appropriate role
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  try {
    // Fetch the studentId using the provided indexNumber
    const [studentResults] = await db.execute('SELECT studentId FROM students WHERE indexNumber = ?', [indexNumber]);

    if (studentResults.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const studentId = studentResults[0].studentId;

    // Insert the achievement request into the `requests` table
    await db.execute(
      'INSERT INTO requests (requestId, studentId, type, details, status, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
      [
        requestId,
        studentId,
        'achievement',
        JSON.stringify({ description }),
        'pending',
        new Date(),
      ]
    );

    res.json({ message: 'Achievement request created successfully' });
  } catch (err) {
    console.error('Database error during operation:', err); // Debugging database error
    return res.status(500).json({ message: 'Database error' });
  }
});

// 13. Approve Achievement Request (Admin)
app.post('/admins/approve-achievement', authenticate, async (req, res) => {
  const { requestId, status } = req.body;

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  try {
    const [requestResults] = await db.execute('SELECT * FROM requests WHERE requestId = ?', [requestId]);

    if (requestResults.length === 0) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const request = requestResults[0];
    const { studentId, details } = request;
    const parsedDetails = JSON.parse(details);

    await db.execute('UPDATE requests SET status = ? WHERE requestId = ?', [status, requestId]);

    if (status === 'approved') {
      await db.execute(
        'INSERT INTO achievements (achievementId, studentId, date, description) VALUES (?, ?, ?, ?)',
        [
          uuidv4(),
          studentId,
          new Date(),
          parsedDetails.description,
        ]
      );
      res.json({ message: 'Achievement request approved and added to achievements' });
    } else {
      res.json({ message: 'Achievement request rejected' });
    }
  } catch (err) {
    console.error('Database error during operation:', err); // Debugging database error
    return res.status(500).json({ message: 'Database error' });
  }
});

// 14. Generate certificate 
app.post('/certificates/generate', authenticate, async (req, res) => {
  const { indexNumber, description } = req.body;

  if (!indexNumber || !description) {
    return res.status(400).json({ message: 'Student index number and description are required.' });
  }

  try {
    // Fetch student details
    const [studentResults] = await db.query('SELECT * FROM students WHERE indexNumber = ?', [indexNumber]);
    if (studentResults.length === 0) {
      return res.status(404).json({ message: 'Student not found.' });
    }
    const student = studentResults[0];

    const { userId } = req.user; // Extract from authentication middleware
    const [issuerResults] = await db.query('SELECT * FROM users WHERE userId = ?', [userId]);
    if (issuerResults.length === 0) {
      return res.status(404).json({ message: 'Issuer not found.' });
    }
    const issuer = issuerResults[0];

    // Prepare certificate data
    const certificateData = {
      certId: uuidv4(), // Generate a unique certificate ID
      studentId: student.studentId,
      issuedByUserId: issuer.userId,
      issuedByName: issuer.email, // Replace with issuer name if required
      dateIssued: new Date().toISOString(),
      description,
    };

    // Communicate with the blockchain server
    const blockchainResponse = await fetch('http://localhost:3003/issue', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(certificateData),
    });

    const blockchainData = await blockchainResponse.json();

    // Handle blockchain errors
    if (!blockchainResponse.ok) {
      return res.status(500).json({ 
        message: 'Failed to issue certificate on the blockchain.', 
        details: blockchainData 
      });
    }
    // Respond with success
    res.status(201).json({
      message: 'Certificate issued and block mined successfully.',
      block: blockchainData.block,
    });
  } catch (error) {
    console.error('Error generating certificate:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// 15. Fetch all certificates
app.get('/certificates', authenticate, async (req, res) => {
  try {
    // Query database for certificates along with indexNumber from students table
    const [certificates] = await db.query(`
      SELECT 
        cert.certId,
        stud.indexNumber,  -- Fetch indexNumber instead of studentId
        cert.issuedByUserId,
        cert.issuedByName,
        cert.dateIssued,
        cert.description,
        cert.behaviors,
        cert.achievements,
        cert.societyDetails,
        cert.blockHash
      FROM certificates AS cert
      JOIN students AS stud ON cert.studentId = stud.studentId
    `);
    
    // Respond with the certificates
    res.status(200).json({
      message: 'Certificates retrieved successfully.',
      certificates,
    });
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// 16. Verify certificate
app.get('/certificates/verify/:certId', authenticate, async (req, res) => {
  const { certId } = req.params;

  try {
    // Query database for the certificate
    const [certificateResults] = await db.query('SELECT * FROM certificates WHERE certId = ?', [certId]);

    if (certificateResults.length === 0) {
      return res.status(404).json({ message: 'Certificate not found.' });
    }

    // Certificate found
    const certificate = certificateResults[0];

    // Optionally validate against the blockchain
    const blockchainResponse = await fetch(`http://localhost:3003/verify/${certId}`);
    const blockchainData = await blockchainResponse.json();

    if (!blockchainResponse.ok || !blockchainData.certificate) {
      return res.status(500).json({ message: 'Blockchain verification failed.', details: blockchainData });
    }

    res.status(200).json({
      message: 'Certificate verified successfully.',
      certificate: {
        ...certificate,
        blockchainVerified: true, // Indicate blockchain validation success
      },
    });
  } catch (error) {
    console.error('Error verifying certificate:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
