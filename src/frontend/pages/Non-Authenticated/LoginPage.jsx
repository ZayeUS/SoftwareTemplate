import React, { useState, useEffect } from "react";
import {
  Box, Container, TextField, Button, Typography, Link, Alert,
  CircularProgress, useTheme, Paper, InputAdornment, IconButton,
  Tooltip, Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import { MailOutline, LockOutlined, Visibility, VisibilityOff, LightMode, DarkMode, Key } from "@mui/icons-material";
import { motion, AnimatePresence } from 'framer-motion';
import { login, resetPassword } from "../../../firebase";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../../store/userStore";

const ResetPasswordModal = ({ open, onClose }) => {
    // ... (This component remains the same as it's already well-structured)
};

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isResetModalOpen, setResetModalOpen] = useState(false);
  
  const theme = useTheme();
  const navigate = useNavigate();
  const { isLoggedIn, profile, authHydrated, isDarkMode, toggleTheme } = useUserStore();

  useEffect(() => {
    if (authHydrated && isLoggedIn) {
      navigate(profile?.fully_onboarded ? "/dashboard" : "/profile-onboarding");
    }
  }, [isLoggedIn, profile, navigate, authHydrated]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) return setError("Please enter an email and password.");
    
    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      const messages = {
        "auth/user-not-found": "No account found with this email. Please sign up.",
        "auth/wrong-password": "Incorrect password. Please try again or reset it.",
        "auth/invalid-credential": "Incorrect email or password. Please try again.",
      };
      setError(messages[err.code] || "Login failed. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!authHydrated) {
    return null; // The FullScreenLoader in App.jsx handles this
  }

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "background.default", p: 2 }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
        <Tooltip title={`Switch to ${isDarkMode ? 'Light' : 'Dark'} Mode`}>
          <IconButton onClick={toggleTheme} sx={{ position: 'absolute', top: 16, right: 16 }}>
            {isDarkMode ? <LightMode /> : <DarkMode />}
          </IconButton>
        </Tooltip>
      </motion.div>
      <Container maxWidth="xs">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <Paper elevation={12} sx={{ borderRadius: theme.shape.borderRadiusLG, overflow: 'hidden' }}>
                <Box sx={{ p: { xs: 3, sm: 5 } }}>
                    <motion.div variants={itemVariants}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                            <Key sx={{ fontSize: 40, mb: 2, color: 'primary.main' }} />
                            <Typography component="h1" variant="h4" fontWeight="bold">Welcome Back</Typography>
                            <Typography variant="body2" color="text.secondary">Sign in to access your dashboard.</Typography>
                        </Box>
                    </motion.div>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, height: 0 }}
                                animate={{ opacity: 1, y: 0, height: 'auto' }}
                                exit={{ opacity: 0, y: -10, height: 0 }}
                                transition={{ duration: 0.3, ease: 'easeOut' }}
                                style={{ marginBottom: theme.spacing(2), width: '100%' }}
                            >
                                <Alert severity="error" onClose={() => setError("")}>{error}</Alert>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    
                    <Box component="form" onSubmit={handleLogin} noValidate sx={{ mt: 1 }}>
                        <motion.div variants={itemVariants}>
                            <TextField margin="normal" required fullWidth autoFocus label="Email Address" name="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isSubmitting} />
                        </motion.div>
                        <motion.div variants={itemVariants}>
                            <TextField margin="normal" required fullWidth name="password" label="Password" type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isSubmitting}
                                InputProps={{
                                endAdornment: (<InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} edge="end">{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>),
                                }}
                            />
                        </motion.div>
                        <motion.div variants={itemVariants}>
                            <Box sx={{ textAlign: 'right', mt: 1 }}>
                                <Link component="button" type="button" variant="body2" onClick={() => setResetModalOpen(true)}>Forgot password?</Link>
                            </Box>
                        </motion.div>
                        <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button type="submit" fullWidth variant="contained" size="large" disabled={isSubmitting} sx={{ mt: 3, mb: 2, py: 1.5 }}>
                                {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                            </Button>
                        </motion.div>
                        <motion.div variants={itemVariants}>
                            <Typography variant="body2" align="center" color="text.secondary">
                                Don't have an account?{' '}
                                <Link component="button" variant="body2" onClick={() => navigate("/signup")} fontWeight="bold">Sign Up</Link>
                            </Typography>
                        </motion.div>
                    </Box>
                </Box>
            </Paper>
        </motion.div>
      </Container>
      <ResetPasswordModal open={isResetModalOpen} onClose={() => setResetModalOpen(false)} />
    </Box>
  );
}