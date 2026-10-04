import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CategoryRibbon({
  categories,
  selectedCategory,
  onSelectCategory
}) {
  const scrollRef = useRef(null);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -240 : 240;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="ribbon-container">
      <button 
        className="ribbon-nav-btn" 
        onClick={() => handleScroll('left')}
        aria-label="Scroll categories left"
      >
        <ChevronLeft size={18} />
      </button>

      <div className="ribbon-scroll" ref={scrollRef}>
        {categories.map((category) => {
          const isActive = selectedCategory === category;
          return (
            <button
              key={category}
              className={`ribbon-pill ${isActive ? 'active' : ''}`}
              onClick={() => onSelectCategory(category)}
              id={`ribbon-pill-${category.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
            >
              {category}
            </button>
          );
        })}
      </div>

      <button 
        className="ribbon-nav-btn" 
        onClick={() => handleScroll('right')}
        aria-label="Scroll categories right"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
