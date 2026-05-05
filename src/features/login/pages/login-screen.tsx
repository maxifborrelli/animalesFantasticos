"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LoginCredentialsForm } from "@/features/login/components/login-credentials-form";
import { LoginFooter } from "@/features/login/components/login-footer";
import { LoginHero } from "@/features/login/components/login-hero";

export function LoginScreen() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push("/");
  };

  return (
    // Contenedor exterior: 
    // - pt-24 da un margen superior pronunciado en móviles.
    // - px-6 da el espacio a los costados.
    // - md:justify-center centra todo verticalmente en pantallas grandes.
    <div className="flex min-h-screen flex-col items-center pt-24 px-6 pb-12 bg-background md:justify-center md:pt-12 md:px-0 safe-area">
      
      {/* Contenedor interior: 
          - max-w-sm o max-w-md restringe el ancho para que no se vea estirado.
          - space-y-8 añade un espacio vertical uniforme entre el Hero, el Form y el Footer. */}
      <div className="w-full max-w-sm sm:max-w-md flex flex-col space-y-8">
        <LoginHero />

        <LoginCredentialsForm
          email={email}
          password={password}
          showPassword={showPassword}
          onSubmit={handleLogin}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onTogglePasswordVisibility={() => setShowPassword((value) => !value)}
        />

        <LoginFooter />
      </div>
    </div>
  );
}