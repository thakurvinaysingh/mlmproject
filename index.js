require('dotenv').config();

const multer = require('multer');
const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

// Initialize the app
const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static('public'));

// Configure session store
const store = new MongoDBStore({
    uri: process.env.MONGO_URL, // Use the environment variable for MongoDB connection string
    collection: 'sessions',
});

store.on('error', function (error) {
    console.log(error);
});

// Configure sessions
app.use(session({
    secret: process.env.Secret_Key || 'your-secret-key', // Replace with a secret key
    resave: false,
    saveUninitialized: true,
    store: store,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 }, // 1 week
}));

// Routers handler ...

const UserRoutes = require('./routers/userfile');
app.use('/', UserRoutes);

const PackageFile = require('./routers/package');
app.use('/packages',PackageFile)

const PackageRequest = require('./routers/packageRequest');
app.use('/',PackageRequest)

const commissionPercentage = require('./routers/commission');
app.use('/setCommission',commissionPercentage)

app.get('/', async (req, res) => {
    console.log('API verification by vinay');
    res.send('Api is deployed successfully');
});

// Database connection
mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log('Mongoose connected');
    })
    .catch((e) => {
        console.log(e);
    });

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});
