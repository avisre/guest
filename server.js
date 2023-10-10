const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const XLSX = require('xlsx');
const multer = require('multer');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const bcrypt = require('bcrypt');
const upload = multer({ dest: 'uploads/' });
const moment = require('moment');
const PORT = 3000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'assets')));

// MongoDB connection setup (modify connection URL as needed)
mongoose.connect('mongodb+srv://project:project@cluster0.kos1k7l.mongodb.net/excelData', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// MongoDB models
const User = mongoose.model('User', {
  username: String,
  password: String,
});

const ExcelData = mongoose.model('ExcelData', {
  username: String,
  password: String,
  projectId:String,
  customerName: String,
  speciesName: String,
  sequencingID: String,
  kitType: String,
  name: String,
  datee: String,
  iLabID: String,
  runFolder: String,
  runType: String,
  clicked: {
    type: Boolean,
    default: false,
  },
});

// Passport.js configuration
passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    const user = await User.findOne({ username: username });
    if (!user) {
      return done(null, false, { message: 'Incorrect username.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (isPasswordValid) {
      return done(null, user);
    } else {
      return done(null, false, { message: 'Incorrect password.' });
    }
  } catch (err) {
    return done(err);
  }
}));

app.use(session({
  secret: 'your-secret-key', // Add a secret key for session encryption
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/index', (req, res) => {
  if (req.isAuthenticated()) {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
  } else {
    res.redirect('/');
  }
});

app.post('/login', passport.authenticate('local', {
  successRedirect: '/index',
  failureRedirect: '/',
  failureFlash: true,
}));

app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Error during logout:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    // Redirect the user after they have been logged out
    res.redirect('/');
  });
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

app.get('/index', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});
app.get('/login', (req, res) => {
  res.redirect('/');
});






app.get('/data', async (req, res) => {
  try {
      const data = await ExcelData.find({}, { username: 0, password: 0 });
      res.json(data);
  } catch (error) {
      console.error('Error retrieving data from MongoDB:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});





app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
