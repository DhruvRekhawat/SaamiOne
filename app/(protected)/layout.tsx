import { Sidebar } from "@/components/ui/sidebar";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default function ProtectedLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) 
  {
    const session = auth();
    if(!session) redirect('/login')

    return (
     <main className="flex bg-indigo-50">
        <Sidebar></Sidebar>
        <div className="w-full flex-1">
        {children}
        </div>
     </main>
    );
  }