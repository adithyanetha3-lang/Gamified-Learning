import { motion } from "framer-motion";

function AuthCard({ children }) {
  return (
    <motion.section
      className="auth-card"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      {children}
    </motion.section>
  );
}

export default AuthCard;
