
import { Calendar, Home, Inbox, Plus, Search, Settings } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../components/ui/sidebar"


// Menu items.


export function SideBar({children}) {
  return (
    <Sidebar>
      <SidebarContent className='bg-[#fafbfc] mt-18'>
        
        <SidebarGroup className='text-white '>
            
          <SidebarGroupContent>
            <SidebarMenu className='gap-5 pl-2 pt-3'>
                <SidebarMenuItem >
                  
                    {children}  
                  
                </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
       
      </SidebarContent>
    </Sidebar>
  )
}