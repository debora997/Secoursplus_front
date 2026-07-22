import AuthLayout from "@/components/auth/AuthLayout";
import Login from "@/components/auth/Login";

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Connectez-vous à votre compte Secours+"
      subtitle="Rejoignez votre équipe de secours"
      footerText="Pas encore de compte ?"
      footerLinkText="Créer un compte"
      footerLinkHref="/inscription"
    >
      <Login />
    </AuthLayout>
  );
}