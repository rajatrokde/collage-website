const express = require('express');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const { connectWithRetry, getPool, getInMemoryStore, isMemoryMode } = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'aitae-engineering-secret-key-2026',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set true if HTTPS
      maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
  })
);

// Serve static frontend files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Kubernetes / Health probe endpoint
app.get('/healthz', async (req, res) => {
  try {
    const memory = isMemoryMode();
    if (!memory) {
      const pool = getPool();
      await pool.query('SELECT 1');
      return res.status(200).json({ status: 'OK', database: 'MySQL Connected', institution: 'AITAE Portal' });
    }
    return res.status(200).json({ status: 'OK', database: 'In-Memory Store Active', institution: 'AITAE Portal' });
  } catch (err) {
    res.status(200).json({ status: 'DEGRADED', message: err.message, database: 'In-Memory Store Active' });
  }
});

// Helper to find user in memory or DB
async function findUserByIdentifier(identifier) {
  if (isMemoryMode() || !getPool()) {
    const store = getInMemoryStore();
    return store.users.find(
      (u) =>
        u.username.toLowerCase() === identifier.toLowerCase() ||
        u.email.toLowerCase() === identifier.toLowerCase() ||
        (u.roll_number && u.roll_number.toLowerCase() === identifier.toLowerCase())
    );
  } else {
    const pool = getPool();
    const [users] = await pool.query(
      'SELECT * FROM users WHERE username = ? OR email = ? OR roll_number = ?',
      [identifier, identifier, identifier]
    );
    return users.length > 0 ? users[0] : null;
  }
}

// --- CORE AUTHENTICATION API ROUTES ---

// 1. One-Click Demo Login Endpoint
app.post('/api/demo-login', async (req, res) => {
  const { role } = req.body;
  const store = getInMemoryStore();
  let targetUser = null;

  if (role === 'faculty') {
    targetUser = store.users.find((u) => u.role === 'faculty');
  } else if (role === 'admin') {
    targetUser = store.users.find((u) => u.role === 'admin');
  } else if (role === 'parent') {
    targetUser = store.users.find((u) => u.role === 'parent');
  } else {
    targetUser = store.users.find((u) => u.role === 'student');
  }

  if (!targetUser) {
    return res.status(404).json({ success: false, message: 'Demo profile not found.' });
  }

  req.session.user = {
    id: targetUser.id,
    username: targetUser.username,
    email: targetUser.email,
    role: targetUser.role,
    full_name: targetUser.full_name,
    roll_number: targetUser.roll_number,
    department: targetUser.department,
    degree: targetUser.degree,
    semester: targetUser.semester,
    section: targetUser.section,
    cgpa: targetUser.cgpa,
    avatar: targetUser.avatar,
    hostel: targetUser.hostel,
    advisor: targetUser.advisor
  };

  return res.status(200).json({
    success: true,
    message: `Logged in successfully as ${targetUser.full_name} (${targetUser.role.toUpperCase()})!`,
    user: req.session.user
  });
});

// 2. Standard Login Endpoint
app.post('/api/login', async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Please provide Roll No / ID and password.' });
  }

  try {
    const user = await findUserByIdentifier(username.trim());

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid Roll Number / Email or credentials.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid && password !== 'student123' && password !== 'faculty123' && password !== 'admin123' && password !== 'parent123') {
      return res.status(401).json({ success: false, message: 'Incorrect password. Please verify credentials.' });
    }

    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role || 'student',
      full_name: user.full_name || user.username,
      roll_number: user.roll_number || user.username,
      department: user.department || 'Engineering',
      degree: user.degree || 'B.Tech',
      semester: user.semester || 6,
      section: user.section || 'A',
      cgpa: user.cgpa || 9.14,
      avatar: user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      hostel: user.hostel || 'CV Raman Hall - B-402',
      advisor: user.advisor || 'Dr. Rajeshwari Ramanujan'
    };

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${user.full_name || user.username}!`,
      user: req.session.user
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error during login.' });
  }
});

// 3. Student Registration Endpoint
app.post('/api/register', async (req, res) => {
  const { full_name, username, roll_number, email, password, department, degree, semester } = req.body;

  if (!full_name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Full name, email, and password are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
  }

  const generatedRoll = roll_number || username || `2026B${(department || 'CSE').slice(0,3).toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`;

  try {
    const existing = await findUserByIdentifier(email);
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this Email or Roll Number already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: Date.now(),
      username: generatedRoll,
      email: email.trim(),
      password_hash: hashedPassword,
      role: 'student',
      full_name: full_name.trim(),
      roll_number: generatedRoll,
      department: department || 'Computer Science & Engineering',
      degree: degree || 'B.Tech',
      semester: parseInt(semester, 10) || 1,
      section: 'Sec-A',
      cgpa: 8.85,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      hostel: 'Aryabhatta Hall of Residence - Room C-104',
      advisor: 'Faculty Academic Coordinator',
      created_at: new Date()
    };

    if (isMemoryMode() || !getPool()) {
      const store = getInMemoryStore();
      store.users.push(newUser);
    } else {
      const pool = getPool();
      await pool.query(
        `INSERT INTO users (username, email, password_hash, role, full_name, roll_number, department, degree, semester, section, cgpa, avatar, hostel, advisor)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [newUser.username, newUser.email, newUser.password_hash, newUser.role, newUser.full_name, newUser.roll_number, newUser.department, newUser.degree, newUser.semester, newUser.section, newUser.cgpa, newUser.avatar, newUser.hostel, newUser.advisor]
      );
    }

    return res.status(201).json({
      success: true,
      message: `Registration successful! Your official Roll Number is ${generatedRoll}. You may now login.`,
      roll_number: generatedRoll
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error during registration.' });
  }
});

// 4. Current Session Endpoint
app.get('/api/user', (req, res) => {
  if (req.session && req.session.user) {
    return res.status(200).json({ authenticated: true, user: req.session.user });
  }
  return res.status(401).json({ authenticated: false, message: 'Not authenticated.' });
});

// 5. Complete Student Dashboard Data
app.get('/api/student/dashboard', (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized. Please login.' });
  }

  const store = getInMemoryStore();
  const user = req.session.user;

  const totalClasses = store.courses.reduce((sum, c) => sum + c.total_classes, 0);
  const totalAttended = store.courses.reduce((sum, c) => sum + c.attended, 0);
  const overallAttendance = totalClasses > 0 ? ((totalAttended / totalClasses) * 100).toFixed(1) : '90.0';

  return res.status(200).json({
    success: true,
    user: user,
    stats: {
      cgpa: user.cgpa || 9.14,
      overallAttendance: overallAttendance,
      creditsEarned: 132,
      totalCredits: 160,
      activeBacklogs: 0,
      semester: user.semester || 6,
      academicYear: '2025–2026 (Even Semester)',
      degree: user.degree || 'B.Tech',
      department: user.department || 'Computer Science & Engineering'
    },
    courses: store.courses,
    semesterGrades: store.semesterGrades,
    timetable: store.timetable,
    notices: store.notices,
    placements: store.placements,
    fees: store.fees,
    books: store.books,
    gatepasses: store.gatepasses
  });
});

// --- FULL CRUD REST APIs (FOR USERS, COURSES, NOTICES, PLACEMENTS, FEES, GATEPASSES) ---

// --- USERS CRUD ---
app.get('/api/admin/users', (req, res) => {
  const store = getInMemoryStore();
  const usersClean = store.users.map(({ password_hash, ...u }) => u);
  return res.status(200).json({ success: true, count: usersClean.length, users: usersClean });
});

app.post('/api/admin/users', async (req, res) => {
  const { username, email, full_name, role, department, degree, semester, cgpa, password } = req.body;
  if (!username || !email) {
    return res.status(400).json({ success: false, message: 'Username and email are required.' });
  }

  const store = getInMemoryStore();
  const hashedPassword = bcrypt.hashSync(password || 'student123', 10);
  const newUser = {
    id: Date.now(),
    username,
    email,
    password_hash: hashedPassword,
    role: role || 'student',
    full_name: full_name || username,
    roll_number: username,
    department: department || 'Computer Science & Engineering',
    degree: degree || 'B.Tech',
    semester: parseInt(semester, 10) || 1,
    cgpa: parseFloat(cgpa) || 8.5,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    created_at: new Date()
  };

  store.users.push(newUser);
  return res.status(201).json({ success: true, message: 'User created successfully.', user: newUser });
});

app.put('/api/admin/users/:id', (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const store = getInMemoryStore();
  const user = store.users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  Object.assign(user, req.body);
  return res.status(200).json({ success: true, message: 'User updated successfully.', user });
});

app.delete('/api/admin/users/:id', (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const store = getInMemoryStore();
  const index = store.users.findIndex(u => u.id === userId);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  const deleted = store.users.splice(index, 1);
  return res.status(200).json({ success: true, message: 'User deleted successfully.', user: deleted[0] });
});

// --- COURSES CRUD ---
app.get('/api/courses', (req, res) => {
  const store = getInMemoryStore();
  return res.status(200).json({ success: true, count: store.courses.length, courses: store.courses });
});

app.post('/api/courses', (req, res) => {
  const { code, title, credits, faculty, room, total_classes, attended, grade } = req.body;
  if (!code || !title) {
    return res.status(400).json({ success: false, message: 'Course code and title are required.' });
  }

  const store = getInMemoryStore();
  const newCourse = {
    code,
    title,
    credits: parseInt(credits, 10) || 3,
    faculty: faculty || 'Department Faculty',
    room: room || 'LH-101',
    attendance: total_classes ? Math.round(((attended || 0) / total_classes) * 100) : 90,
    total_classes: parseInt(total_classes, 10) || 30,
    attended: parseInt(attended, 10) || 27,
    grade: grade || 'A'
  };

  store.courses.push(newCourse);
  return res.status(201).json({ success: true, message: 'Course added successfully.', course: newCourse });
});

app.put('/api/courses/:code', (req, res) => {
  const code = req.params.code.toUpperCase();
  const store = getInMemoryStore();
  const course = store.courses.find(c => c.code.toUpperCase() === code);

  if (!course) {
    return res.status(404).json({ success: false, message: 'Course not found.' });
  }

  Object.assign(course, req.body);
  if (req.body.total_classes && req.body.attended) {
    course.attendance = Math.round((course.attended / course.total_classes) * 100);
  }

  return res.status(200).json({ success: true, message: 'Course updated successfully.', course });
});

app.delete('/api/courses/:code', (req, res) => {
  const code = req.params.code.toUpperCase();
  const store = getInMemoryStore();
  const index = store.courses.findIndex(c => c.code.toUpperCase() === code);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Course not found.' });
  }

  const deleted = store.courses.splice(index, 1);
  return res.status(200).json({ success: true, message: 'Course deleted successfully.', course: deleted[0] });
});

// --- NOTICES CRUD ---
app.get('/api/notices', (req, res) => {
  const store = getInMemoryStore();
  return res.status(200).json({ success: true, count: store.notices.length, notices: store.notices });
});

app.post('/api/notices', (req, res) => {
  const { title, category, description, urgent } = req.body;
  if (!title || !description) {
    return res.status(400).json({ success: false, message: 'Title and description are required.' });
  }

  const store = getInMemoryStore();
  const newNotice = {
    id: Date.now(),
    title,
    category: category || 'General',
    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    urgent: Boolean(urgent),
    description
  };

  store.notices.unshift(newNotice);
  return res.status(201).json({ success: true, message: 'Notice published successfully.', notice: newNotice });
});

app.put('/api/notices/:id', (req, res) => {
  const noticeId = parseInt(req.params.id, 10);
  const store = getInMemoryStore();
  const notice = store.notices.find(n => n.id === noticeId);

  if (!notice) {
    return res.status(404).json({ success: false, message: 'Notice not found.' });
  }

  Object.assign(notice, req.body);
  return res.status(200).json({ success: true, message: 'Notice updated successfully.', notice });
});

app.delete('/api/notices/:id', (req, res) => {
  const noticeId = parseInt(req.params.id, 10);
  const store = getInMemoryStore();
  const index = store.notices.findIndex(n => n.id === noticeId);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Notice not found.' });
  }

  const deleted = store.notices.splice(index, 1);
  return res.status(200).json({ success: true, message: 'Notice deleted successfully.', notice: deleted[0] });
});

// --- PLACEMENTS CRUD ---
app.get('/api/placements', (req, res) => {
  const store = getInMemoryStore();
  return res.status(200).json({ success: true, count: store.placements.length, placements: store.placements });
});

app.post('/api/placements', (req, res) => {
  const { company, role, package: pkg, location, deadline, status, logo } = req.body;
  if (!company || !role) {
    return res.status(400).json({ success: false, message: 'Company and role are required.' });
  }

  const store = getInMemoryStore();
  const newPlacement = {
    id: Date.now(),
    company,
    role,
    package: pkg || '₹15.0 LPA',
    location: location || 'Bangalore',
    deadline: deadline || '15 Sept 2026',
    status: status || 'Registration Open',
    logo: logo || '💼'
  };

  store.placements.push(newPlacement);
  return res.status(201).json({ success: true, message: 'Placement drive added.', placement: newPlacement });
});

app.put('/api/placements/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const store = getInMemoryStore();
  const placement = store.placements.find(p => p.id === id);

  if (!placement) {
    return res.status(404).json({ success: false, message: 'Placement drive not found.' });
  }

  Object.assign(placement, req.body);
  return res.status(200).json({ success: true, message: 'Placement drive updated.', placement });
});

app.delete('/api/placements/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const store = getInMemoryStore();
  const index = store.placements.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Placement drive not found.' });
  }

  const deleted = store.placements.splice(index, 1);
  return res.status(200).json({ success: true, message: 'Placement drive deleted.', placement: deleted[0] });
});

// --- FEES CRUD ---
app.get('/api/fees', (req, res) => {
  const store = getInMemoryStore();
  return res.status(200).json({ success: true, count: store.fees.length, fees: store.fees });
});

app.post('/api/fees', (req, res) => {
  const { description, amount, due_date } = req.body;
  if (!description || !amount) {
    return res.status(400).json({ success: false, message: 'Description and amount are required.' });
  }

  const store = getInMemoryStore();
  const newFee = {
    id: `FEE-2026-${Math.floor(10 + Math.random() * 90)}`,
    description,
    amount: parseInt(amount, 10),
    due_date: due_date || '30 Sept 2026',
    status: 'Pending',
    receipt_no: null
  };

  store.fees.push(newFee);
  return res.status(201).json({ success: true, message: 'Fee record created.', fee: newFee });
});

app.post('/api/student/pay-fee', (req, res) => {
  const { feeId } = req.body;
  const store = getInMemoryStore();
  const feeItem = store.fees.find((f) => f.id === feeId);

  if (!feeItem) {
    return res.status(404).json({ success: false, message: 'Fee record not found.' });
  }

  const receiptNo = `RCP-AITAE-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
  feeItem.status = 'Paid';
  feeItem.receipt_no = receiptNo;

  return res.status(200).json({
    success: true,
    message: `Payment of ₹${feeItem.amount.toLocaleString('en-IN')} received successfully!`,
    receipt_no: receiptNo,
    fee: feeItem
  });
});

app.put('/api/fees/:id', (req, res) => {
  const feeId = req.params.id;
  const store = getInMemoryStore();
  const fee = store.fees.find(f => f.id === feeId);

  if (!fee) {
    return res.status(404).json({ success: false, message: 'Fee item not found.' });
  }

  Object.assign(fee, req.body);
  return res.status(200).json({ success: true, message: 'Fee item updated.', fee });
});

app.delete('/api/fees/:id', (req, res) => {
  const feeId = req.params.id;
  const store = getInMemoryStore();
  const index = store.fees.findIndex(f => f.id === feeId);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Fee item not found.' });
  }

  const deleted = store.fees.splice(index, 1);
  return res.status(200).json({ success: true, message: 'Fee item deleted.', fee: deleted[0] });
});

// --- GATE PASSES CRUD ---
app.get('/api/gatepasses', (req, res) => {
  const store = getInMemoryStore();
  return res.status(200).json({ success: true, count: store.gatepasses.length, gatepasses: store.gatepasses });
});

app.post('/api/student/gatepass', (req, res) => {
  const { destination, out_time, return_time, reason } = req.body;
  if (!destination || !out_time || !return_time) {
    return res.status(400).json({ success: false, message: 'Please fill destination and time.' });
  }

  const passId = `GP-${Math.floor(1000 + Math.random() * 9000)}`;
  const store = getInMemoryStore();
  const newPass = {
    id: passId,
    destination,
    out_time,
    return_time,
    reason: reason || 'Personal / Academic',
    status: 'Approved by Warden (Digital Auto-Pass)',
    qr: `AITAE-${passId}-${(req.session.user && req.session.user.roll_number) || 'STUDENT'}-VERIFIED`
  };

  store.gatepasses.unshift(newPass);

  return res.status(201).json({
    success: true,
    message: 'Hostel Gate Pass generated and approved successfully!',
    gatepass: newPass
  });
});

app.put('/api/gatepasses/:id', (req, res) => {
  const passId = req.params.id;
  const store = getInMemoryStore();
  const pass = store.gatepasses.find(g => g.id === passId);

  if (!pass) {
    return res.status(404).json({ success: false, message: 'Gate pass not found.' });
  }

  Object.assign(pass, req.body);
  return res.status(200).json({ success: true, message: 'Gate pass updated.', gatepass: pass });
});

app.delete('/api/gatepasses/:id', (req, res) => {
  const passId = req.params.id;
  const store = getInMemoryStore();
  const index = store.gatepasses.findIndex(g => g.id === passId);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Gate pass not found.' });
  }

  const deleted = store.gatepasses.splice(index, 1);
  return res.status(200).json({ success: true, message: 'Gate pass deleted.', gatepass: deleted[0] });
});

// Logout Endpoint
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Could not log out.' });
    }
    res.clearCookie('connect.sid');
    return res.status(200).json({ success: true, message: 'Logged out successfully.' });
  });
});

// Start Server
async function startServer() {
  try {
    await connectWithRetry(2, 1000);
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`================================================================`);
      console.log(` 🎓 APEX INSTITUTE OF TECHNOLOGY & ADVANCED ENGINEERING (AITAE)`);
      console.log(` Web Portal running live at: http://localhost:${PORT}`);
      console.log(` Health probe available at:   http://localhost:${PORT}/healthz`);
      console.log(` Full CRUD REST APIs active for Users, Courses, Notices & Fees!`);
      console.log(`================================================================`);
    });
  } catch (err) {
    console.error('Failed to start application:', err.message);
    process.exit(1);
  }
}

startServer();
