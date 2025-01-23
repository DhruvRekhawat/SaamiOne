"use server"
import { signIn } from "@/auth"

const handleGoogleSignIn = async() => {
    // Implement Google Sign-In logic here

    console.log("=================== Initiating Google Sign-In ===========================")
    await signIn("google",{
      redirectTo:'/mail'
    })
    console.log("===================  End of Process ===========================")

  }

  export default handleGoogleSignIn