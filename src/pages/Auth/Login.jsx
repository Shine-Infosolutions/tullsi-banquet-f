import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { IoIosEye, IoIosEyeOff } from "react-icons/io";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "../../assets/tulsiwhite.png";

const hardcodedUsers = {
  "admin@tulsi.com":   { password: "admin@123",   role: "Admin", name: "Admin User",   isActive: true },
  "staff@tulsi.com":   { password: "staff@123",   role: "Staff", name: "Staff User",   isActive: true },
  "manager@tulsi.com": { password: "manager@123", role: "Admin", name: "Manager User", isActive: true },
};

// Floating petal shape
const Petal = ({ style }) => (
  <motion.div
    className="absolute rounded-full opacity-20 pointer-events-none"
    style={{ background: "linear-gradient(135deg, #c3ad6b, #e8dfc8)", ...style }}
    animate={{ y: [0, -18, 0], rotate: [0, 15, -10, 0], scale: [1, 1.08, 1] }}
    transition={{ duration: style.duration, repeat: Infinity, ease: "easeInOut", delay: style.delay }}
  />
);

const petals = [
  { width: 80,  height: 80,  top: "8%",  left: "6%",  duration: 6,   delay: 0   },
  { width: 50,  height: 50,  top: "18%", right: "8%", duration: 7.5, delay: 1   },
  { width: 110, height: 110, bottom: "12%", left: "4%", duration: 8, delay: 0.5 },
  { width: 60,  height: 60,  bottom: "20%", right: "6%", duration: 6.5, delay: 2 },
  { width: 35,  height: 35,  top: "45%", left: "2%",  duration: 5,   delay: 1.5 },
  { width: 45,  height: 45,  top: "60%", right: "3%", duration: 9,   delay: 0.8 },
  { width: 25,  height: 25,  top: "30%", left: "18%", duration: 7,   delay: 3   },
  { width: 30,  height: 30,  bottom: "35%", right: "15%", duration: 6, delay: 2.5 },
];

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [focused, setFocused] = useState(null); // 'email' | 'password'

  useEffect(() => {
    if (localStorage.getItem("currentUser") === "true") navigate("/");
  }, [navigate]);

  const login = (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password!");
      triggerShake();
      return;
    }
    const user = hardcodedUsers[email.trim()];
    if (!user) { toast.error("User not found!"); triggerShake(); return; }
    if (user.password !== password.trim()) { toast.error("Incorrect password!"); triggerShake(); return; }
    if (!user.isActive) { toast.error("This account is inactive!"); triggerShake(); return; }

    setLoading(true);
    localStorage.setItem("User", JSON.stringify(user));
    localStorage.setItem("currentUser", "true");
    localStorage.setItem("role", user.role);
    toast.success(`Welcome back, ${user.name}!`);
    setTimeout(() => { window.location.href = "/banquet/list-booking"; }, 1000);
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  return (
    <>
      <Toaster position="top-center" toastOptions={{ style: { fontFamily: "inherit" } }} />

      {/* Full-page background */}
      <div
        className="min-h-screen flex items-center justify-center relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, hsl(45,60%,12%) 0%, hsl(45,50%,18%) 50%, hsl(45,40%,10%) 100%)" }}
      >
        {/* Animated petals */}
        {petals.map((p, i) => <Petal key={i} style={p} />)}

        {/* Radial glow behind card */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: 600, height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(195,173,107,0.15) 0%, transparent 70%)",
            top: "50%", left: "50%",
            transform: "translate(-50%, -50%)"
          }}
        />

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full max-w-md mx-4"
        >
          <motion.div
            animate={shake ? { x: [-10, 10, -8, 8, -4, 4, 0] } : {}}
            transition={{ duration: 0.45 }}
            className="rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(2px)", border: "1px solid rgba(195,173,107,0.2)" }}
          >
            {/* Gold header band */}
            <div
              className="px-8 pt-6 pb-5 text-center relative"
              style={{ background: "linear-gradient(160deg, rgba(195,173,107,0.18) 0%, rgba(195,173,107,0.06) 100%)", borderBottom: "1px solid rgba(195,173,107,0.15)" }}
            >
              {/* Logo */}
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5, ease: "backOut" }}
                className="flex justify-center mb-3"
              >
                <img src={Logo} alt="Tulsi Banquet" className="w-16 h-16 object-contain" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.4 }}
                className="text-xl font-bold tracking-wide"
                style={{ color: "#c3ad6b" }}
              >
                Tulsi Banquet
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45, duration: 0.4 }}
                className="text-xs mt-0.5"
                style={{ color: "rgba(195,173,107,0.6)" }}
              >
                Management Portal
              </motion.p>
            </div>

            {/* Form area */}
            <div className="px-8 py-8" style={{ background: "rgba(10,8,4,0.55)" }}>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center text-sm mb-6"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                Sign in to continue
              </motion.p>

              <form onSubmit={login} className="space-y-5">
                {/* Email field */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.55, duration: 0.4 }}
                >
                  <label className="block text-xs font-semibold mb-2 tracking-wider uppercase" style={{ color: "rgba(195,173,107,0.7)" }}>
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="you@tulsi.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocused("email")}
                      onBlur={() => setFocused(null)}
                      required
                      className="w-full px-4 py-3 text-sm rounded-xl outline-none transition-all duration-200"
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        border: focused === "email" ? "1px solid #c3ad6b" : "1px solid rgba(255,255,255,0.1)",
                        color: "#f5f0e8",
                        boxShadow: focused === "email" ? "0 0 0 3px rgba(195,173,107,0.15)" : "none",
                      }}
                    />
                    <AnimatePresence>
                      {focused === "email" && (
                        <motion.div
                          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} exit={{ scaleX: 0 }}
                          className="absolute bottom-0 left-4 right-4 h-px origin-left"
                          style={{ background: "linear-gradient(90deg, #c3ad6b, transparent)" }}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>

                {/* Password field */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.65, duration: 0.4 }}
                >
                  <label className="block text-xs font-semibold mb-2 tracking-wider uppercase" style={{ color: "rgba(195,173,107,0.7)" }}>
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocused("password")}
                      onBlur={() => setFocused(null)}
                      required
                      className="w-full px-4 py-3 pr-12 text-sm rounded-xl outline-none transition-all duration-200"
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        border: focused === "password" ? "1px solid #c3ad6b" : "1px solid rgba(255,255,255,0.1)",
                        color: "#f5f0e8",
                        boxShadow: focused === "password" ? "0 0 0 3px rgba(195,173,107,0.15)" : "none",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 transition-colors"
                      style={{ color: "rgba(195,173,107,0.6)" }}
                    >
                      {showPassword ? <IoIosEyeOff size={18} /> : <IoIosEye size={18} />}
                    </button>
                    <AnimatePresence>
                      {focused === "password" && (
                        <motion.div
                          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} exit={{ scaleX: 0 }}
                          className="absolute bottom-0 left-4 right-4 h-px origin-left"
                          style={{ background: "linear-gradient(90deg, #c3ad6b, transparent)" }}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>

                {/* Submit button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.75, duration: 0.4 }}
                  className="pt-2"
                >
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.02, boxShadow: "0 8px 30px rgba(195,173,107,0.35)" }}
                    whileTap={{ scale: loading ? 1 : 0.97 }}
                    className="w-full py-3 rounded-xl font-semibold text-sm tracking-wide transition-all duration-200 relative overflow-hidden"
                    style={{
                      background: loading ? "rgba(195,173,107,0.5)" : "linear-gradient(135deg, #c3ad6b 0%, #8a7340 100%)",
                      color: "#1a1408",
                      cursor: loading ? "not-allowed" : "pointer",
                    }}
                  >
                    <AnimatePresence mode="wait">
                      {loading ? (
                        <motion.span
                          key="loading"
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="flex items-center justify-center gap-2"
                        >
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                            className="inline-block w-4 h-4 border-2 border-[#1a1408] border-t-transparent rounded-full"
                          />
                          Signing in...
                        </motion.span>
                      ) : (
                        <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                          Sign In
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </motion.div>
              </form>

              {/* Divider */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.85 }}
                className="flex items-center gap-3 my-6"
              >
                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>demo credentials</span>
                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
              </motion.div>

              {/* Demo credentials */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="grid grid-cols-2 gap-3"
              >
                {[
                  { label: "Admin", email: "admin@tulsi.com", pass: "admin@123" },
                  { label: "Staff",  email: "staff@tulsi.com",  pass: "staff@123"  },
                ].map(({ label, email: e, pass }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => { setEmail(e); setPassword(pass); }}
                    className="text-left px-3 py-2.5 rounded-xl transition-all duration-150 group"
                    style={{ background: "rgba(195,173,107,0.07)", border: "1px solid rgba(195,173,107,0.12)" }}
                  >
                    <p className="text-xs font-semibold mb-0.5" style={{ color: "#c3ad6b" }}>{label}</p>
                    <p className="text-[10px] truncate" style={{ color: "rgba(255,255,255,0.35)" }}>{e}</p>
                  </button>
                ))}
              </motion.div>
            </div>
          </motion.div>

          {/* Bottom tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center text-xs mt-5"
            style={{ color: "rgba(195,173,107,0.35)" }}
          >
            © {new Date().getFullYear()} Tulsi Banquet · All rights reserved
          </motion.p>
        </motion.div>
      </div>
    </>
  );
};

export default Login;
