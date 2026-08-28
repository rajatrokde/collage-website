const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'rootpassword',
  database: process.env.DB_NAME || 'logindb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool = null;
let isInMemory = false;

// In-Memory Fallback Store with rich Engineering College Dummy Data
const inMemoryData = {
  users: [
    {
      id: 1,
      username: '2023BCSE0842',
      email: 'aarav.sharma@aitae.edu.in',
      password_hash: bcrypt.hashSync('student123', 10),
      role: 'student',
      full_name: 'Aarav Sharma',
      roll_number: '2023BCSE0842',
      department: 'Computer Science & Engineering',
      degree: 'B.Tech',
      semester: 6,
      section: 'CSE-A',
      cgpa: 9.14,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      hostel: 'CV Raman Hall of Residence - Room B-402',
      advisor: 'Dr. Rajeshwari Ramanujan',
      created_at: new Date()
    },
    {
      id: 2,
      username: 'FAC-CSE-4092',
      email: 'r.ramanujan@aitae.edu.in',
      password_hash: bcrypt.hashSync('faculty123', 10),
      role: 'faculty',
      full_name: 'Dr. Rajeshwari Ramanujan, Ph.D.',
      roll_number: 'FAC-CSE-4092',
      department: 'Computer Science & Artificial Intelligence',
      degree: 'Faculty - Associate Professor',
      semester: null,
      section: null,
      cgpa: null,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      hostel: 'Staff Quarters Type-IV #12',
      advisor: 'Dean of Faculty Affairs',
      created_at: new Date()
    },
    {
      id: 3,
      username: 'admin',
      email: 'dean.academic@aitae.edu.in',
      password_hash: bcrypt.hashSync('admin123', 10),
      role: 'admin',
      full_name: 'Dr. K. V. S. Murthy',
      roll_number: 'ADM-HQ-101',
      department: 'Office of Academic Affairs & Registrar',
      degree: 'Registrar & Chief Academic Officer',
      semester: null,
      section: null,
      cgpa: null,
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
      hostel: 'Administrative Block - Suite 101',
      advisor: 'Board of Governors',
      created_at: new Date()
    },
    {
      id: 4,
      username: 'PARENT-842',
      email: 'm.sharma.parent@gmail.com',
      password_hash: bcrypt.hashSync('parent123', 10),
      role: 'parent',
      full_name: 'Mukesh Sharma (Parent of Aarav)',
      roll_number: '2023BCSE0842',
      department: 'Computer Science & Engineering',
      degree: 'Parent Portal',
      semester: 6,
      section: 'CSE-A',
      cgpa: 9.14,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      hostel: 'CV Raman Hall of Residence - Room B-402',
      advisor: 'Dr. Rajeshwari Ramanujan',
      created_at: new Date()
    }
  ],

  courses: [
    { code: 'CS601', title: 'Distributed Systems & Cloud Computing', credits: 4, faculty: 'Dr. Rajeshwari Ramanujan', room: 'LH-302', attendance: 92, total_classes: 36, attended: 33, grade: 'A+' },
    { code: 'CS602', title: 'Compiler Design & Automata', credits: 4, faculty: 'Prof. Anirudh Sengupta', room: 'LH-304', attendance: 88, total_classes: 34, attended: 30, grade: 'A' },
    { code: 'CS603', title: 'Deep Learning & Neural Networks', credits: 4, faculty: 'Dr. Priya Nambiar', room: 'AI-CoE Lab 2', attendance: 95, total_classes: 38, attended: 36, grade: 'O' },
    { code: 'CS604', title: 'Information & Network Security', credits: 3, faculty: 'Prof. Vikramaditya Rao', room: 'LH-201', attendance: 78, total_classes: 32, attended: 25, grade: 'B+' },
    { code: 'CS605', title: 'Full Stack DevOps & Microservices Lab', credits: 2, faculty: 'Prof. Tanmay Bhatnagar', room: 'Computing Lab 4', attendance: 90, total_classes: 20, attended: 18, grade: 'O' },
    { code: 'CS606', title: 'Major Project Phase-I (Capstone)', credits: 3, faculty: 'Project Advisory Committee', room: 'Project Incubation Suite', attendance: 100, total_classes: 12, attended: 12, grade: 'O' }
  ],

  semesterGrades: [
    { semester: 'Semester 1', sgpa: 8.92, credits: 22, status: 'Passed (Distinction)' },
    { semester: 'Semester 2', sgpa: 9.05, credits: 22, status: 'Passed (Distinction)' },
    { semester: 'Semester 3', sgpa: 9.18, credits: 24, status: 'Passed (Distinction)' },
    { semester: 'Semester 4', sgpa: 9.25, credits: 24, status: 'Passed (Distinction)' },
    { semester: 'Semester 5', sgpa: 9.30, credits: 22, status: 'Passed (Distinction)' },
    { semester: 'Semester 6', sgpa: 'Current', credits: 20, status: 'In Progress (Projected 9.20)' }
  ],

  timetable: {
    Monday: [
      { time: '09:00 - 10:00 AM', course: 'Distributed Systems', code: 'CS601', room: 'LH-302', type: 'Lecture' },
      { time: '10:00 - 11:00 AM', course: 'Compiler Design', code: 'CS602', room: 'LH-304', type: 'Lecture' },
      { time: '11:15 - 01:15 PM', course: 'Full Stack DevOps Lab', code: 'CS605', room: 'Computing Lab 4', type: 'Practical' },
      { time: '02:00 - 03:00 PM', course: 'Deep Learning', code: 'CS603', room: 'AI-CoE Lab 2', type: 'Lecture' }
    ],
    Tuesday: [
      { time: '09:00 - 10:00 AM', course: 'Information Security', code: 'CS604', room: 'LH-201', type: 'Lecture' },
      { time: '10:00 - 11:00 AM', course: 'Deep Learning', code: 'CS603', room: 'AI-CoE Lab 2', type: 'Lecture' },
      { time: '11:15 - 12:15 PM', course: 'Distributed Systems', code: 'CS601', room: 'LH-302', type: 'Tutorial' },
      { time: '02:00 - 05:00 PM', course: 'Major Project Phase-I', code: 'CS606', room: 'Incubation Suite', type: 'Lab / Review' }
    ],
    Wednesday: [
      { time: '09:00 - 10:00 AM', course: 'Compiler Design', code: 'CS602', room: 'LH-304', type: 'Lecture' },
      { time: '10:00 - 11:00 AM', course: 'Distributed Systems', code: 'CS601', room: 'LH-302', type: 'Lecture' },
      { time: '11:15 - 01:15 PM', course: 'Compiler & Systems Lab', code: 'CS602P', room: 'Lab 2', type: 'Practical' },
      { time: '02:00 - 03:00 PM', course: 'Library / Research Hour', code: 'RES-01', room: 'Central Library', type: 'Research' }
    ],
    Thursday: [
      { time: '09:00 - 10:00 AM', course: 'Deep Learning & Neural Networks', code: 'CS603', room: 'AI-CoE Lab 2', type: 'Lecture' },
      { time: '10:00 - 11:00 AM', course: 'Information & Network Security', code: 'CS604', room: 'LH-201', type: 'Lecture' },
      { time: '11:15 - 12:15 PM', course: 'Open Elective (Quantum Computing)', code: 'OE601', room: 'Auditorium 2', type: 'Lecture' },
      { time: '02:00 - 04:00 PM', course: 'Placement Training & Mock Tests', code: 'TPO-01', room: 'Seminar Hall B', type: 'Career Prep' }
    ],
    Friday: [
      { time: '09:00 - 10:00 AM', course: 'Distributed Systems', code: 'CS601', room: 'LH-302', type: 'Lecture' },
      { time: '10:00 - 11:00 AM', course: 'Compiler Design', code: 'CS602', room: 'LH-304', type: 'Lecture' },
      { time: '11:15 - 01:15 PM', course: 'AI & Deep Learning Practical', code: 'CS603P', room: 'NVIDIA Lab', type: 'Practical' },
      { time: '02:00 - 03:30 PM', course: 'Department Colloquium & Guest Talk', code: 'COL-06', room: 'Main Audi', type: 'Guest Lecture' }
    ]
  },

  notices: [
    { id: 1, title: 'End-Semester Theory & Practical Examination Schedule (Even Sem 2026)', category: 'Examination', date: '25 Aug 2026', urgent: true, description: 'Hall tickets are available for download in the examination portal. No candidate without hall ticket will be permitted.' },
    { id: 2, title: 'Google & NVIDIA Campus Placement Drive 2026 - Registration Open', category: 'Placement', date: '24 Aug 2026', urgent: true, description: 'Eligible branches: CSE, AI&DS, ECE. Minimum CGPA criterion: 8.0+. Test date: September 5, 2026.' },
    { id: 3, title: 'Smart India Hackathon 2026 - Internal College Shortlist Announced', category: 'Events', date: '22 Aug 2026', urgent: false, description: 'Top 15 teams have been selected for the National Round mentoring bootcamp in the Incubation Center.' },
    { id: 4, title: 'Hostel Outing / Gate Pass Digital QR System Mandatory from Sept 1', category: 'Hostel', date: '20 Aug 2026', urgent: false, description: 'All student hostel exits must be generated via the student portal gate pass generator.' },
    { id: 5, title: 'IEEE Xplore & ACM Digital Library Off-Campus Access Renewed', category: 'Library', date: '18 Aug 2026', urgent: false, description: 'Students can access 5M+ IEEE papers using institutional SSO credentials.' }
  ],

  placements: [
    { id: 1, company: 'Google Inc.', role: 'Software Development Engineer - I', package: '₹44.5 LPA', location: 'Bangalore / Hyderabad', deadline: '31 Aug 2026', status: 'Eligible - Applied', logo: '🌐' },
    { id: 2, company: 'NVIDIA Graphics', role: 'System Software / AI Engineer', package: '₹38.0 LPA', location: 'Pune / Bangalore', deadline: '02 Sept 2026', status: 'Eligible - Shortlisted for OA', logo: '⚡' },
    { id: 3, company: 'Microsoft India', role: 'Cloud & AI Engineer', package: '₹42.0 LPA', location: 'Hyderabad', deadline: '05 Sept 2026', status: 'Registration Open', logo: '💻' },
    { id: 4, company: 'Amazon AWS', role: 'Cloud Solutions Associate', package: '₹34.0 LPA', location: 'Gurugram / Bangalore', deadline: '10 Sept 2026', status: 'Eligible', logo: '📦' },
    { id: 5, company: 'Qualcomm', role: 'Embedded Systems & Firmware Engg', package: '₹28.5 LPA', location: 'Hyderabad / Chennai', deadline: '15 Sept 2026', status: 'Eligible', logo: '📡' }
  ],

  fees: [
    { id: 'FEE-2026-01', description: 'Semester 6 Tuition & Academic Infrastructure Fee', amount: 115000, due_date: '15 Sept 2026', status: 'Paid', receipt_no: 'RCP-AITAE-2026-84920' },
    { id: 'FEE-2026-02', description: 'Hostel & Mess Charges (CV Raman Hall - Even Sem)', amount: 48000, due_date: '15 Sept 2026', status: 'Paid', receipt_no: 'RCP-AITAE-2026-84921' },
    { id: 'FEE-2026-03', description: 'End-Semester Examination & Evaluation Fee', amount: 3500, due_date: '05 Sept 2026', status: 'Pending', receipt_no: null },
    { id: 'FEE-2026-04', description: 'IEEE Student Chapter & CoE Lab Access Fee', amount: 2000, due_date: '20 Sept 2026', status: 'Pending', receipt_no: null }
  ],

  books: [
    { title: 'Distributed Systems: Concepts and Design (5th Edition)', author: 'George Coulouris', due_date: '02 Sept 2026', status: 'Issued (Return in 7 days)' },
    { title: 'Deep Learning (Adaptive Computation and Machine Learning)', author: 'Ian Goodfellow, Yoshua Bengio', due_date: '10 Sept 2026', status: 'Issued' },
    { title: 'Compilers: Principles, Techniques, and Tools (Dragon Book)', author: 'Alfred Aho, Jeffrey Ullman', due_date: 'Returned', status: 'Returned on 15 Aug' }
  ],

  gatepasses: [
    { id: 'GP-9082', destination: 'City Center / Tech Meetup', out_time: '2026-08-25 17:00', return_time: '2026-08-25 21:30', reason: 'Developer Conference', status: 'Approved by Warden', qr: 'AITAE-GP-9082-VERIFIED' }
  ]
};

async function connectWithRetry(maxRetries = 2, delayMs = 1000) {
  let retries = maxRetries;
  while (retries > 0) {
    try {
      console.log(`Attempting connection to MySQL at ${dbConfig.host}:${dbConfig.port}... (${maxRetries - retries + 1}/${maxRetries})`);
      
      const rootConn = await mysql.createConnection({
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.user,
        password: dbConfig.password,
        connectTimeout: 2000
      });

      await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`;`);
      await rootConn.end();

      pool = mysql.createPool(dbConfig);
      const conn = await pool.getConnection();
      console.log(' Successfully connected to MySQL database engine!');
      conn.release();

      await initDatabase();
      isInMemory = false;
      return pool;
    } catch (err) {
      console.warn(`MySQL connection notice: ${err.message}.`);
      retries--;
      if (retries === 0) {
        console.log(' Running with integrated In-Memory College Data Store.');
        isInMemory = true;
        return null;
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

async function initDatabase() {
  if (!pool) return;
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'student',
        full_name VARCHAR(100) NOT NULL,
        roll_number VARCHAR(50) DEFAULT NULL,
        department VARCHAR(100) DEFAULT NULL,
        degree VARCHAR(50) DEFAULT 'B.Tech',
        semester INT DEFAULT 6,
        section VARCHAR(20) DEFAULT 'CSE-A',
        cgpa DECIMAL(3,2) DEFAULT 9.14,
        avatar VARCHAR(255) DEFAULT NULL,
        hostel VARCHAR(100) DEFAULT NULL,
        advisor VARCHAR(100) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await pool.query(createTableQuery);
    console.log(' Database tables initialized successfully.');

    // Seed default accounts
    for (const u of inMemoryData.users) {
      const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [u.username]);
      if (rows.length === 0) {
        await pool.query(
          `INSERT INTO users (username, email, password_hash, role, full_name, roll_number, department, degree, semester, section, cgpa, avatar, hostel, advisor)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [u.username, u.email, u.password_hash, u.role, u.full_name, u.roll_number, u.department, u.degree, u.semester, u.section, u.cgpa, u.avatar, u.hostel, u.advisor]
        );
      }
    }
    console.log(' Seeded official AITAE Student, Faculty, and Admin accounts.');
  } catch (err) {
    console.error('Error initializing database tables:', err.message);
  }
}

function getPool() {
  return pool;
}

function getInMemoryStore() {
  return inMemoryData;
}

function isMemoryMode() {
  return isInMemory;
}

module.exports = {
  connectWithRetry,
  getPool,
  getInMemoryStore,
  isMemoryMode,
  inMemoryData
};
