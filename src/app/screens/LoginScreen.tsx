import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, User, Shield, Globe, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { LanguageSelector } from "../components/LanguageSelector";
import { useAuth } from "../context/AuthContext";
import { getDemoCredentials } from "../lib/demo";
import { useTranslation } from "../hooks/useTranslation";

type ViewMode = "welcome" | "login" | "signup";

export function LoginScreen() {
  const navigate = useNavigate();
  const { signIn, signUp, isAuthenticated, isLoading: authLoading } = useAuth();
  const tr = useTranslation();
  const [viewMode, setViewMode] = useState<ViewMode>("welcome");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // Redirect si déjà authentifié
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      console.log('✅ User authenticated, redirecting to home...');
      navigate("/global-home");
    }
  }, [isAuthenticated, authLoading, navigate]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!email) {
      setError(tr("L'email est requis"));
      return;
    }
    if (!validateEmail(email)) {
      setError(tr("Email invalide"));
      return;
    }
    if (!password) {
      setError(tr("Le mot de passe est requis"));
      return;
    }
    if (password.length < 6) {
      setError(tr("Le mot de passe doit contenir au moins 6 caractères"));
      return;
    }

    setIsLoading(true);
    try {
      await signIn(email, password);
      setSuccess(tr("Connexion réussie!"));
      // La redirection sera gérée par le useEffect
    } catch (err: any) {
      console.error('❌ Login error:', err);
      setError(err.message || tr("Erreur lors de la connexion"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      console.log('🎭 Demo login requested...');
      const demo = await getDemoCredentials();
      
      console.log('🔐 Signing in with demo account...');
      await signIn(demo.email, demo.password);
      
      setSuccess(tr("Connexion au compte démo réussie!"));
      // La redirection sera gérée par le useEffect
    } catch (err: any) {
      console.error('❌ Demo login error:', err);
      setError(err.message || tr("Erreur lors de la connexion au compte démo"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!name) {
      setError(tr("Le nom est requis"));
      return;
    }
    if (!email) {
      setError(tr("L'email est requis"));
      return;
    }
    if (!validateEmail(email)) {
      setError(tr("Email invalide"));
      return;
    }
    if (!password) {
      setError(tr("Le mot de passe est requis"));
      return;
    }
    if (password.length < 6) {
      setError(tr("Le mot de passe doit contenir au moins 6 caractères"));
      return;
    }
    if (!confirmPassword) {
      setError(tr("Veuillez confirmer votre mot de passe"));
      return;
    }
    if (password !== confirmPassword) {
      setError(tr("Les mots de passe ne correspondent pas"));
      return;
    }

    setIsLoading(true);
    try {
      await signUp(email, password, name);
      setSuccess(tr("Inscription réussie!"));
      // La redirection sera gérée par le useEffect
    } catch (err: any) {
      console.error('❌ Signup error:', err);
      
      // Gestion des erreurs spécifiques
      if (err.message.includes('déjà')) {
        setError(err.message + tr(" Voulez-vous vous connecter ?"));
      } else {
        setError(err.message || tr("Erreur lors de l'inscription"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden max-w-[430px] mx-auto">
      {/* Background Image avec parallax subtil */}
      <motion.div 
        className="absolute inset-0"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1761758594560-9ee0114e475b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZXJlbmUlMjBtb3VudGFpbiUyMGxha2UlMjBzdW5zZXQlMjByZWZsZWN0aW9ufGVufDF8fHx8MTc3MzE1NDUyNnww&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Peaceful landscape"
          className="w-full h-full object-cover"
        />
        {/* Dégradé premium avec couleurs Lokadia */}
        <div 
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(135deg, 
                rgba(15, 76, 129, 0.85) 0%, 
                rgba(30, 90, 150, 0.75) 35%,
                rgba(60, 130, 200, 0.65) 70%,
                rgba(100, 170, 230, 0.55) 100%
              )
            `
          }}
        ></div>
        {/* Overlay pour profondeur */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/40"></div>
      </motion.div>

      {/* Éléments décoratifs flottants */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              background: i % 2 === 0 
                ? 'radial-gradient(circle, rgba(15, 76, 129, 0.15) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(100, 170, 230, 0.12) 0%, transparent 70%)',
              width: `${120 + i * 40}px`,
              height: `${120 + i * 40}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, i % 2 === 0 ? 20 : -20, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col px-5">
        {/* Language Selector - Top Right */}
        <motion.div 
          className="absolute top-8 right-5 z-20"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <LanguageSelector />
        </motion.div>

        {/* Back Button (shown in login/signup modes) */}
        <AnimatePresence>
          {viewMode !== "welcome" && (
            <motion.button
              onClick={() => {
                setViewMode("welcome");
                resetForm();
              }}
              className="absolute top-8 left-5 w-10 h-10 rounded-full flex items-center justify-center transition-transform active:scale-95 z-20"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="h-5 w-5 text-white" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Hero Section - Logo et Tagline */}
        <motion.div 
          className="pt-16 pb-8"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Logo/Icon avec effet glow */}
          <motion.div 
            className="flex justify-center mb-4"
            animate={{ 
              scale: [1, 1.05, 1],
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut" 
            }}
          >
            <div 
              className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl"
              style={{
                background: "linear-gradient(135deg, #0F4C81 0%, #2E88C7 50%, #64AAE6 100%)",
                boxShadow: "0 20px 50px rgba(46, 136, 199, 0.4), 0 0 60px rgba(100, 170, 230, 0.3)",
              }}
            >
              <Shield className="w-10 h-10 text-white" strokeWidth={2.5} />
            </div>
          </motion.div>

          {/* Brand Name */}
          <motion.h1 
            className="text-center text-4xl font-bold text-white mb-2"
            style={{
              textShadow: "0 4px 20px rgba(0, 0, 0, 0.3), 0 0 40px rgba(6, 182, 212, 0.2)",
              letterSpacing: "0.02em",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Lokadia
          </motion.h1>

          {/* Tagline avec icônes */}
          <motion.div 
            className="flex items-center justify-center gap-2 text-white/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Globe className="w-4 h-4" />
            <p className="text-sm font-medium">Voyagez en toute sérénité</p>
            <Sparkles className="w-4 h-4" />
          </motion.div>
        </motion.div>

        {/* Forms Container - Spacer pour pousser vers le bas */}
        <div className="flex-1 flex items-end pb-6">
          <div className="w-full">
            {/* Welcome Mode */}
            <AnimatePresence mode="wait">
              {viewMode === "welcome" && (
                <motion.div
                  key="welcome"
                  className="rounded-3xl p-6 shadow-2xl"
                  style={{
                    background: "linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.4)",
                  }}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  {/* Welcome Text */}
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2 leading-tight">
                      Bienvenue sur Lokadia
                    </h2>
                    <p className="text-white/90 text-sm">
                      Votre sécurité, notre priorité.
                    </p>
                    
                    {/* Info message pour les problèmes de connexion */}
                    <motion.div 
                      className="mt-4 p-3 rounded-xl bg-blue-500/20 border border-blue-400/30 backdrop-blur-sm"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <p className="text-blue-100 text-xs leading-relaxed">
                        <strong>Note :</strong> Si vous rencontrez l'erreur "Failed to fetch", cela signifie que le serveur backend n'est pas encore déployé. Contactez l'administrateur pour activer le serveur Supabase Edge Function.
                      </p>
                    </motion.div>
                  </div>

                  {/* Primary Button - Sign Up */}
                  <motion.button
                    onClick={() => {
                      setViewMode("signup");
                      resetForm();
                    }}
                    className="w-full py-4 rounded-2xl font-semibold text-white mb-3 transition-all shadow-lg relative overflow-hidden"
                    style={{ 
                      background: "linear-gradient(135deg, #0F4C81 0%, #06B6D4 100%)",
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="relative z-10">S'inscrire</span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.6 }}
                    />
                  </motion.button>

                  {/* Secondary Button - Login */}
                  <motion.button
                    onClick={() => {
                      setViewMode("login");
                      resetForm();
                    }}
                    className="w-full py-4 rounded-2xl font-semibold transition-all relative overflow-hidden"
                    style={{
                      background: "rgba(255, 255, 255, 0.25)",
                      color: "white",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                    }}
                    whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.3)" }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Se connecter
                  </motion.button>
                </motion.div>
              )}

              {/* Login Mode */}
              {viewMode === "login" && (
                <motion.div
                  key="login"
                  className="rounded-3xl p-6 shadow-2xl max-h-[75vh] overflow-y-auto"
                  style={{
                    background: "linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.4)",
                  }}
                  initial={{ opacity: 0, y: 50, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -30, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-white mb-1.5 leading-tight">
                      Connexion
                    </h2>
                    <p className="text-white/80 text-sm">
                      Bon retour parmi nous !
                    </p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-4">
                    {/* Error Message */}
                    <AnimatePresence>
                      {error && (
                        <motion.div 
                          className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 backdrop-blur-sm"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <p className="text-red-200 text-sm text-center">{error}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Success Message */}
                    <AnimatePresence>
                      {success && (
                        <motion.div 
                          className="p-3 rounded-xl bg-green-500/20 border border-green-500/30 backdrop-blur-sm"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <p className="text-green-200 text-sm text-center">{success}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Email Field */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            setError("");
                          }}
                          placeholder="Email"
                          className="w-full py-3.5 pl-11 pr-4 rounded-2xl bg-white/10 border-2 border-white/30 text-white placeholder-white/60 focus:outline-none focus:border-white/60 focus:bg-white/15 transition-all"
                        />
                      </div>
                    </motion.div>

                    {/* Password Field */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            setError("");
                          }}
                          placeholder="Mot de passe"
                          className="w-full py-3.5 pl-11 pr-11 rounded-2xl bg-white/10 border-2 border-white/30 text-white placeholder-white/60 focus:outline-none focus:border-white/60 focus:bg-white/15 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5 text-white/60" />
                          ) : (
                            <Eye className="h-5 w-5 text-white/60" />
                          )}
                        </button>
                      </div>
                    </motion.div>

                    {/* Submit Button */}
                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-4 rounded-2xl font-semibold text-white transition-all shadow-lg mt-5 disabled:opacity-50 relative overflow-hidden"
                      style={{ 
                        background: "linear-gradient(135deg, #0F4C81 0%, #06B6D4 100%)",
                      }}
                      whileHover={{ scale: isLoading ? 1 : 1.02 }}
                      whileTap={{ scale: isLoading ? 1 : 0.98 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      {isLoading ? "Connexion..." : "Se connecter"}
                    </motion.button>

                    {/* Link to Sign Up */}
                    <motion.p 
                      className="text-center text-white/70 text-sm mt-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      Pas encore de compte ?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setViewMode("signup");
                          resetForm();
                        }}
                        className="text-white font-semibold underline hover:text-[#06B6D4] transition-colors"
                      >
                        S'inscrire
                      </button>
                    </motion.p>
                  </form>

                  {/* Demo Login Button - Separate from form */}
                  <motion.div 
                    className="mt-5 pt-5 border-t border-white/20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <motion.button
                      type="button"
                      onClick={handleDemoLogin}
                      disabled={isLoading}
                      className="w-full py-3.5 rounded-2xl font-semibold transition-all disabled:opacity-50"
                      style={{
                        background: "rgba(255, 255, 255, 0.25)",
                        color: "white",
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                      }}
                      whileHover={{ scale: isLoading ? 1 : 1.02, backgroundColor: "rgba(255, 255, 255, 0.3)" }}
                      whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    >
                      {isLoading ? "Connexion..." : "🎭 Essayer le compte démo"}
                    </motion.button>
                    <p className="text-center text-white/60 text-xs mt-2">
                      Explorez l'application sans créer de compte
                    </p>
                    <div className="mt-2.5 p-2.5 rounded-xl bg-white/10 border border-white/20">
                      <p className="text-white/70 text-xs text-center font-mono">
                        <strong className="text-white">Ou connectez-vous avec:</strong><br/>
                        demo@lokadia.com / demo123
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {/* Sign Up Mode */}
              {viewMode === "signup" && (
                <motion.div
                  key="signup"
                  className="rounded-3xl p-6 shadow-2xl max-h-[75vh] overflow-y-auto"
                  style={{
                    background: "linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.4)",
                  }}
                  initial={{ opacity: 0, y: 50, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -30, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-white mb-1.5 leading-tight">
                      Inscription
                    </h2>
                    <p className="text-white/80 text-sm">
                      Créez votre compte Lokadia
                    </p>
                  </div>

                  <form onSubmit={handleSignUp} className="space-y-4">
                    {/* Error Message */}
                    <AnimatePresence>
                      {error && (
                        <motion.div 
                          className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 backdrop-blur-sm"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <p className="text-red-200 text-sm text-center">{error}</p>
                          {error.includes('connecter') && (
                            <button
                              type="button"
                              onClick={() => {
                                setViewMode("login");
                                resetForm();
                              }}
                              className="mt-2 w-full py-2 rounded-lg bg-white/20 text-white font-semibold text-sm hover:bg-white/30 transition-colors"
                            >
                              Aller à la connexion
                            </button>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Success Message */}
                    <AnimatePresence>
                      {success && (
                        <motion.div 
                          className="p-3 rounded-xl bg-green-500/20 border border-green-500/30 backdrop-blur-sm"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <p className="text-green-200 text-sm text-center">{success}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Name Field */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => {
                            setName(e.target.value);
                            setError("");
                          }}
                          placeholder="Nom"
                          className="w-full py-3.5 pl-11 pr-4 rounded-2xl bg-white/10 border-2 border-white/30 text-white placeholder-white/60 focus:outline-none focus:border-white/60 focus:bg-white/15 transition-all"
                        />
                      </div>
                    </motion.div>

                    {/* Email Field */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            setError("");
                          }}
                          placeholder="Email"
                          className="w-full py-3.5 pl-11 pr-4 rounded-2xl bg-white/10 border-2 border-white/30 text-white placeholder-white/60 focus:outline-none focus:border-white/60 focus:bg-white/15 transition-all"
                        />
                      </div>
                    </motion.div>

                    {/* Password Field */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            setError("");
                          }}
                          placeholder="Mot de passe (min. 6 caractères)"
                          className="w-full py-3.5 pl-11 pr-11 rounded-2xl bg-white/10 border-2 border-white/30 text-white placeholder-white/60 focus:outline-none focus:border-white/60 focus:bg-white/15 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5 text-white/60" />
                          ) : (
                            <Eye className="h-5 w-5 text-white/60" />
                          )}
                        </button>
                      </div>
                    </motion.div>

                    {/* Confirm Password Field */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            setError("");
                          }}
                          placeholder="Confirmer le mot de passe"
                          className="w-full py-3.5 pl-11 pr-11 rounded-2xl bg-white/10 border-2 border-white/30 text-white placeholder-white/60 focus:outline-none focus:border-white/60 focus:bg-white/15 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5 text-white/60" />
                          ) : (
                            <Eye className="h-5 w-5 text-white/60" />
                          )}
                        </button>
                      </div>
                    </motion.div>

                    {/* Submit Button */}
                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-4 rounded-2xl font-semibold text-white transition-all shadow-lg mt-5 disabled:opacity-50 relative overflow-hidden"
                      style={{ 
                        background: "linear-gradient(135deg, #0F4C81 0%, #06B6D4 100%)",
                      }}
                      whileHover={{ scale: isLoading ? 1 : 1.02 }}
                      whileTap={{ scale: isLoading ? 1 : 0.98 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      {isLoading ? "Inscription..." : "S'inscrire"}
                    </motion.button>

                    {/* Link to Login */}
                    <motion.p 
                      className="text-center text-white/70 text-sm mt-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      Déjà un compte ?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setViewMode("login");
                          resetForm();
                        }}
                        className="text-white font-semibold underline hover:text-[#06B6D4] transition-colors"
                      >
                        Se connecter
                      </button>
                    </motion.p>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Terms & Conditions */}
        <motion.p 
          className="text-white/60 text-xs text-center mt-4 mb-4 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          En continuant, vous acceptez nos{" "}
          <span className="underline">Conditions d'utilisation</span> et notre{" "}
          <span className="underline">Politique de confidentialité</span>
        </motion.p>
      </div>
    </div>
  );
}