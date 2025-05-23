import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import usersRouter from './routes/users.js';
import rolesRouter from './routes/roles.js'; // Import the roles router
import profileRouter from './routes/profiles.js'; // Import the profile routes
import auditRouter from './routes/auditRoutes.js';
import testEmailRoutes from './routes/testEmail.js';
import stripeRouter from './routes/stripeRoutes.js'; // Import the Stripe routes

dotenv.config();

const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "*", // Restrict based on environment
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization",
};

app.use(cors(corsOptions));
app.use(express.json()); // Middleware to parse incoming JSON data

// Routes
app.use("/api/users", usersRouter);  // Users routes
app.use("/api/roles", rolesRouter);  // Roles routes
app.use("/api/profile", profileRouter);  // Profile routes
app.use("/api/audit", auditRouter); // Audit log routes
app.use('/api/email', testEmailRoutes); // Email routes
app.use("/api/stripe", stripeRouter);  // Stripe routes (subscription, payment handling)

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
