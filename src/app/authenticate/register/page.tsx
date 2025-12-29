import RegisterViewPage from "@/migrated/flood-dashboard/main/authenticate/register-view"
import { Metadata } from "next"

export const metadata: Metadata = {
    title: 'Authentication | Register',
    description: 'Register page for authentication.'
}

export default function Page(){
    return <RegisterViewPage/>
}