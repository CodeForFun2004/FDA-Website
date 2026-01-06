import RegisterViewPage from "@/features/authenticate/components/register-view"
import { Metadata } from "next"

export const metadata: Metadata = {
    title: 'Authentication | Register',
    description: 'Register page for authentication.'
}

export default function Page(){
    return <RegisterViewPage/>
}