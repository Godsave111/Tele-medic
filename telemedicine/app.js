const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const bodyparser = require('body-parser');
const Mysqlstore = require('express-mysql-session')(session);
const flash = require('connect-flash');
const patientsRoutes = require('./routes/patientsRoutes'); 
const patientControllers = require('./controllers/patientController');
const dotenv = require('dotenv');
dotenv.config();




// Initialize app
const app = express();

// Initialize environment variables
dotenv.config();

// Middleware to parse JSON
app.use(express.json());
app.use(bodyparser.urlencoded({ extended: true })); // Capture form data

// MySQL Connection Pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tele-medic',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Configure session store
const sessionStore = new Mysqlstore({}, pool);

// Session setup
app.use (cors);
app.use(session({
    secret: 'telemedicine_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }  // Set to true in production with HTTPS
}));

// Flash messages middleware
app.use(flash());

// Test MySQL Connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');

    // Create Patients Table
    const createPatientsTable = `
        CREATE TABLE IF NOT EXISTS patients (
            id INT AUTO_INCREMENT PRIMARY KEY,
            first_name VARCHAR(255) NOT NULL,
            last_name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            phone VARCHAR(15),
            date_of_birth DATE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;
    connection.query(createPatientsTable, (err, results) => {
        if (err) {
            console.error('Error creating patients table:', err);
            return;
        }
        console.log('Patients table created successfully');
    });

    // Insert sample data for patients
    const insertSamplePatients = `
        INSERT INTO patients (first_name, last_name, email, password_hash, phone, date_of_birth)
        VALUES 
            ('John', 'Doe', 'godsaveeliphus@gmail.com', '${bcrypt.hashSync('password1', 8)}', '1234567890', '1980-01-01'),
            ('Jane', 'Doe', 'eliphusgodsave@gmail.com', '${bcrypt.hashSync('password2', 8)}', '0987654321', '1990-02-02')
        ON DUPLICATE KEY UPDATE id=id;  -- Prevent duplicate entry errors
    `;
    connection.query(insertSamplePatients, (err, results) => {
        if (err) {
            console.error('Error inserting into patients table:', err.stack);
            return;
        }
        console.log('Successfully inserted into patients table');
    });

    // Create Doctors Table
    const createDoctorsTable = `
        CREATE TABLE IF NOT EXISTS doctors (
            id INT AUTO_INCREMENT PRIMARY KEY,
            first_name VARCHAR(255) NOT NULL,
            last_name VARCHAR(255) NOT NULL,
            specialty VARCHAR(255),
            email VARCHAR(255) NOT NULL UNIQUE,
            phone VARCHAR(15),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;
    connection.query(createDoctorsTable, (err, results) => {
        if (err) {
            console.error('Error creating doctors table:', err.stack);
            return;
        }
        console.log('Doctors table created successfully');
    });

    // Insert sample data for doctors
    const insertSampleDoctors = `
        INSERT INTO doctors (first_name, last_name, specialty, email, phone)
         VALUES 
    ('Dr. Smith', 'Smith', 'Cardiology', 'smith@example.com', '1112223333'),
    ('Dr. Johnson', 'Johnson', 'Dermatology', 'johnson@example.com', '4445556666')
     ON DUPLICATE KEY UPDATE id=id;
  
    `;
    connection.query(insertSampleDoctors, (err, results) => {
        if (err) {
            console.error('Error inserting into doctors table:', err.stack);
            return;
        }
        console.log('Successfully inserted into doctors table');
    });

    // Create Appointments Table
    const createAppointmentTable = `
    CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT,
    doctor_id INT,
    appointment_date DATETIME,
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE SET NULL
);

    `;
    connection.query(createAppointmentTable, (err, results) => {
        if (err) {
            console.error('Error creating appointments table:', err.stack);
            return;
        }
        console.log('Appointments table created successfully');
    });

    // Insert sample data for appointments
    const insertSampleAppointments = `
        INSERT INTO appointments (patient_id, doctor_id, appointment_date, status)
          VALUES (1, 1, '2024-10-21 10:00:00', 'Scheduled')
           ON DUPLICATE KEY UPDATE appointment_date = VALUES(appointment_date), status = VALUES(status);

 
    `;
    connection.query(insertSampleAppointments, (err, results) => {
        if (err) {
            console.error('Error inserting into appointments table:', err.stack);
            return;
        }
        console.log('Successfully inserted into appointments table');
    });

    // Create Admin Table
    const createAdminsTable = `
        CREATE TABLE IF NOT EXISTS admins (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;
    connection.query(createAdminsTable, (err, results) => {
        if (err) {
            console.error('Error creating admin table:', err.stack);
            return;
        }
        console.log('Admin table created successfully');
    });

    // Insert sample data for admins
    const insertSampleAdmins = `
        INSERT INTO admins (name, email, password_hash)
        VALUES 
            ('Admin One', 'admin1@example.com', '${bcrypt.hashSync('adminpass1', 8)}'),
            ('Admin Two', 'admin2@example.com', '${bcrypt.hashSync('adminpass2', 8)}')
        ON DUPLICATE KEY UPDATE id=id;  --  Prevent duplicate entry errors
    `;
    connection.query(insertSampleAdmins, (err, results) => {
        if (err) {
            console.error('Error inserting into admins table:', err.stack);
            return;
        }
        console.log('Successfully inserted into admins table');
    });

    // Release the connection back to the pool
    connection.release();
});

// Define a route for the root path
app.get('/', (req, res) => {
    res.send('Welcome to the Tele-medic app!');
});



// Use routes
app.post('/register', patientControllers.register);
app.post('/login', patientControllers.login);
app.get('/profile', patientControllers.viewProfile);
app.post('/updateProfile', patientControllers.updateProfile);
app.get('/logout', patientControllers.logout);

// Define a route to test if the sample data was inserted 
app.get('/patients', (req, res) => {
    pool.query('SELECT * FROM patients', (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});
 
// define a routes for patientsRoutes 
app.get('/patientsRoutes', (req, res) => {
    pool.query('SELECT * FROM patients', (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});
 // define a routes for adminRoutes 
 app.get ('/adminRoutes', (req, res )=>{
    pool.query('SELECT * FROM admins',(err, results) => {
        if(err) {
        return res.status(500).json({error:err.message});
        }
        res.json(results);
    });
 });
 
 // define a routes appointmentRoutes 
 app.get('/appointmentRoutes',(req, res )=>{
    pool.query('SELECT * FROM appointments',(err,results)=> {
        if(err){
            return res.status(500).json({error:err.message});

        }
        res.json(results);
    });

 });
 // define a routes for doctorsRoutes
 app.get('/doctorsRoutes',(req, res)=>{
    pool.query('SELECT * FROM doctors', (err,results)=>{
        if(err){
            return res.status(500).json({error:err.message});
        }
        res.json (results);
    });
 });


// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
   console.log(`Server is running on port ${PORT}`);
});
