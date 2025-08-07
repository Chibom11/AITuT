// your_layout_file.jsx (e.g., app/dashboard/layout.jsx)
'use client'
import { SidebarProvider, SidebarTrigger } from '../../components/ui/sidebar' 
import { SignedIn, UserButton } from '@clerk/nextjs' 
import { MenuIcon} from 'lucide-react'; 
import ChatHistorySidebar from '@/components/ChatHistorySideBar'




function DashBoardLayout({children}) {

  return (
    
     <SidebarProvider>
      
      <div className=" bg-white bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] bg-[size:6rem_4rem] relative flex flex-col min-h-screen ">
        {/* Header */}
        <header className="fixed top-0 left-0 w-full h-[10vh] flex items-center justify-between px-6 bg-[#1b2635] z-50">
          {/* Left group: SidebarTrigger and Chat with AI agent button */}
          <div className="flex items-center space-x-4">
            <SidebarTrigger className='text-white'>
              <MenuIcon className="h-6 w-6" /> {/* Icon for sidebar trigger */}
            </SidebarTrigger>
            
            <button className='text-white text-lg font-semibold'>Chat with AI agent</button>
          </div>

         

         
          <div className="flex items-center space-x-4">
            {/* The UserButton only shows up for signed-in users anyway */}
            <UserButton />
          </div>
        </header>


        {/* Main content area - adjusted padding for both fixed header and footer */}
        <div className=" flex flex-1 pt-[10vh] pb-[10vh]"> {/* pt-[10vh] for header, pb-[10vh] for footer */}
          <SignedIn>
          <aside className="z-10">
            <ChatHistorySidebar/>  
          </aside> 
          </SignedIn>
          </div>
          
            <main className="w-[80%] px-4">
              {children}
            </main>
          
           
      </div>
   
    </SidebarProvider>
 
    
  )
}

export default DashBoardLayout
