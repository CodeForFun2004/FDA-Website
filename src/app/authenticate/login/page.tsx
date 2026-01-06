
import LoginViewPage from "@/features/authenticate/components/login-view";
import { Metadata } from "next";

export const metadata: Metadata ={
    title: 'Authentication | Login',
    description: 'Login page for authentication.'
}

export default function Page(){
    return <LoginViewPage />;
}