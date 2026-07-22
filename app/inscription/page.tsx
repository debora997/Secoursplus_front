import AuthLayout from "@/components/auth/AuthLayout";
import Inscription from "@/components/auth/Inscription";



export default function LoginPage() {
  return (
    <AuthLayout
      title="Bienvenue sur Secours+"
      subtitle="Connectez-vous à votre centre de commandement"
      footerText="Vous n'avez pas encore de compte ?"
      footerLinkText="Créer un compte"
      footerLinkHref="/inscription"
    >
      <Inscription />
    </AuthLayout>
  );
}
