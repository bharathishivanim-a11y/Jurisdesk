const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- MONGOOSE SCHEMAS ---

// User Schema (Advocates & Clients)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['advocate', 'client'], required: true }
});

// Case Schema
const caseSchema = new mongoose.Schema({
  caseNumber: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  clientName: { type: String, required: true },
  advocateName: { type: String, required: true },
  court: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'In Progress', 'Closed'], default: 'Pending' },
  nextHearingDate: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Case = mongoose.model('Case', caseSchema);

// --- MONGO DB CONNECTION & DEMO SEEDING ---
mongoose.connect('mongodb://127.0.0.1:27017/legal_db')
  .then(async () => {
    console.log('✅ Connected to MongoDB Legal DB');

    // Seed Demo Users if empty
    if (await User.countDocuments() === 0) {
      await User.insertMany([
        { name: 'Adv. Rajesh Sharma', email: 'rajesh@legal.com', password: '123', role: 'advocate' },
        { name: 'Adv. Priya Malhotra', email: 'priya@legal.com', password: '123', role: 'advocate' },
        { name: 'Ramesh Kumar', email: 'ramesh@gmail.com', password: '123', role: 'client' },
        { name: 'Ananya Sharma', email: 'ananya@gmail.com', password: '123', role: 'client' }
      ]);
      console.log('🌱 Hardcoded Advocates & Clients seeded!');
    }

    // Seed Demo Cases if empty
    if (await Case.countDocuments() === 0) {
      await Case.insertMany([
        {
          caseNumber: 'HC/2026/104',
          title: 'Property Title & Ownership Dispute',
          clientName: 'Ramesh Kumar',
          advocateName: 'Adv. Rajesh Sharma',
          court: 'High Court of Karnataka',
          status: 'Pending',
          nextHearingDate: '2026-11-15'
        },
        {
          caseNumber: 'SC/2026/409',
          title: 'Corporate Tax Audit Appeals',
          clientName: 'Ramesh Kumar',
          advocateName: 'Adv. Rajesh Sharma',
          court: 'Supreme Court of India',
          status: 'In Progress',
          nextHearingDate: '2026-12-02'
        },
        {
          caseNumber: 'DC/2026/882',
          title: 'Employment Contract Breach',
          clientName: 'Ananya Sharma',
          advocateName: 'Adv. Rajesh Sharma',
          court: 'District Civil Court',
          status: 'Closed',
          nextHearingDate: '2026-09-10'
        },
        {
          caseNumber: 'HC/2026/312',
          title: 'Environmental Compliance Injunction',
          clientName: 'Ananya Sharma',
          advocateName: 'Adv. Priya Malhotra',
          court: 'National Green Tribunal',
          status: 'In Progress',
          nextHearingDate: '2026-11-20'
        }
      ]);
      console.log('🌱 Hardcoded demo cases seeded!');
    }
  })
  .catch(err => console.error('❌ DB Error:', err));

// --- API ENDPOINTS ---

// Register New User (Advocate or Client)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already registered' });

    const newUser = new User({ name, email, password, role });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login User
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const user = await User.findOne({ email, password, role });
    if (!user) return res.status(401).json({ error: 'Invalid credentials or role selected' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Login error' });
  }
});

// Get Filtered Cases based on Role & Name
app.get('/api/cases', async (req, res) => {
  try {
    const { role, name } = req.query;
    let query = {};

    if (role === 'client') {
      // Client sees ONLY their own cases
      query = { clientName: name };
    } else if (role === 'advocate') {
      // Advocate sees ALL cases assigned to them
      query = { advocateName: name };
    }

    const cases = await Case.find(query).sort({ createdAt: -1 });
    res.json(cases);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cases' });
  }
});

// Add Case
app.post('/api/cases', async (req, res) => {
  try {
    const newCase = new Case(req.body);
    await newCase.save();
    res.status(201).json(newCase);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create case. Case Number must be unique.' });
  }
});

// Update Case
app.put('/api/cases/:id', async (req, res) => {
  try {
    const updated = await Case.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update case.' });
  }
});

// Delete Case
app.delete('/api/cases/:id', async (req, res) => {
  try {
    await Case.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Delete failed' });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));