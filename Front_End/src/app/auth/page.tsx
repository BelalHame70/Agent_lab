import { Suspense } from "react";
import AuthLayout from "@/components/auth/Auth";


export default function AuthPage() {
  return (

    
    <Suspense fallback={
      <div style={{
        minHeight: "100vh",
        background: "#080808",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{
          width: "20px", height: "20px",
          border: "2px solid rgba(1,71,255,0.3)",
          borderTopColor: "#0147FF",
          borderRadius: "50%",
          animation: "spin 0.7s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <AuthLayout />
    </Suspense>
  );
}