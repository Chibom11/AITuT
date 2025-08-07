import React from 'react'

function VidsComponent({ vidData }) {
  return (
    // Main container: Set to flex column, with a gap between items and some padding
    <div className='flex flex-col items-center gap-8 p-4 md:p-8 bg-gray-900'>
      {vidData.map((el, ind) => (
        // Video card container: Added 'group' for hover effects on children
        // Added relative positioning for the absolute overlay and text
        <div 
          key={el.vid_id} 
          className='group relative w-full max-w-xl cursor-pointer overflow-hidden rounded-lg shadow-lg'
        >
          <a href={el.vid_url} target="_blank" rel="noopener noreferrer">
            <img 
              src={el.thumbnail} 
              alt={el.vid_title} // Good practice for accessibility
              // Image styling: Smooth transition for scaling effect
              className='w-full h-auto object-cover transition-transform duration-300 ease-in-out group-hover:scale-105'
            />
            {/* Gradient overlay: Invisible by default, fades in on hover */}
            <div 
              className='absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100'
            ></div>
            {/* Video Title: Positioned at the bottom, styled for clarity */}
            <span 
              className='absolute bottom-4 left-4 text-lg font-bold text-white'
            >
              {el.vid_title}
            </span>
          </a>
        </div>
      ))}
    </div>
  )
}

export default VidsComponent