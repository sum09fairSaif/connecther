/// <reference types="vite/client" />

declare module "./Components/LoginForm/LoginForm" {
  import type { ComponentType } from "react";
  const LoginForm: ComponentType;
  export default LoginForm;
}

declare module "./Components/RegisterForm/RegisterForm" {
  import type { ComponentType } from "react";
  const RegisterForm: ComponentType;
  export default RegisterForm;
}
