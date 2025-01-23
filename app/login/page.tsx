"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { GoogleIcon } from '../icons/google'
import handleGoogleSignIn from '@/app/actions/handleGoogleSignIn'
export default function LoginPage() {
 

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center text-indigo-700">Saami</CardTitle>
          <CardDescription className="text-center">Sign in to access your account</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button 
            onClick={()=>handleGoogleSignIn()}
            className="w-full max-w-sm flex items-center justify-center space-x-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          >
            <GoogleIcon className="w-5 h-5" />
            <span>Sign in with Google</span>
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-center text-gray-500">
            By signing in, you agree to our{' '}
            <a href="#" className="text-indigo-600 hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-indigo-600 hover:underline">
              Privacy Policy
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

