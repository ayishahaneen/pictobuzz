export interface AIStrokePoint {
  x: number;
  y: number;
}

export interface AIStroke {
  color: string;
  width: number;
  points: AIStrokePoint[];
  pauseAfterMs?: number;
}

export interface AIDrawingData {
  word: string;
  category: string;
  hints: string[];
  totalStrokes: number;
  strokes: AIStroke[];
}

// 800x500 normalized canvas coordinates for smooth scaling
export const AI_DRAWINGS: Record<string, AIDrawingData> = {
  'Elephant': {
    word: 'Elephant',
    category: 'Animals',
    hints: ['Big gray animal', 'Has a long trunk and big ears'],
    totalStrokes: 12,
    strokes: [
      // Body & back
      {
        color: '#1E293B',
        width: 4,
        points: [{x: 240, y: 320}, {x: 250, y: 220}, {x: 300, y: 170}, {x: 420, y: 170}, {x: 500, y: 210}, {x: 540, y: 260}, {x: 540, y: 380}]
      },
      // Back legs
      {
        color: '#1E293B',
        width: 4,
        points: [{x: 540, y: 380}, {x: 530, y: 440}, {x: 490, y: 440}, {x: 485, y: 350}]
      },
      {
        color: '#1E293B',
        width: 4,
        points: [{x: 460, y: 340}, {x: 460, y: 430}, {x: 430, y: 430}, {x: 425, y: 340}]
      },
      // Belly
      {
        color: '#1E293B',
        width: 4,
        points: [{x: 425, y: 340}, {x: 340, y: 350}, {x: 300, y: 340}]
      },
      // Front legs
      {
        color: '#1E293B',
        width: 4,
        points: [{x: 300, y: 340}, {x: 300, y: 440}, {x: 260, y: 440}, {x: 255, y: 330}]
      },
      {
        color: '#1E293B',
        width: 4,
        points: [{x: 230, y: 320}, {x: 230, y: 430}, {x: 200, y: 430}, {x: 195, y: 310}]
      },
      // Head & Trunk
      {
        color: '#1E293B',
        width: 4,
        points: [
          {x: 240, y: 220}, {x: 200, y: 200}, {x: 170, y: 230}, {x: 160, y: 280},
          {x: 155, y: 340}, {x: 140, y: 360}, {x: 110, y: 350}, {x: 100, y: 310},
          {x: 115, y: 290}, {x: 135, y: 300}, {x: 145, y: 260}, {x: 155, y: 210}
        ]
      },
      // Big Ear
      {
        color: '#1E293B',
        width: 4,
        points: [
          {x: 210, y: 200}, {x: 240, y: 180}, {x: 260, y: 220}, {x: 255, y: 280},
          {x: 230, y: 320}, {x: 200, y: 300}, {x: 190, y: 240}, {x: 210, y: 200}
        ]
      },
      // Eye
      {
        color: '#1E293B',
        width: 5,
        points: [{x: 175, y: 230}, {x: 177, y: 232}]
      },
      // Tusk
      {
        color: '#D97706',
        width: 3,
        points: [{x: 155, y: 280}, {x: 120, y: 300}, {x: 140, y: 290}]
      },
      // Tail
      {
        color: '#1E293B',
        width: 3,
        points: [{x: 540, y: 280}, {x: 570, y: 330}, {x: 575, y: 340}]
      },
      // Cute ground shadow
      {
        color: '#94A3B8',
        width: 3,
        points: [{x: 150, y: 450}, {x: 580, y: 450}]
      }
    ]
  },

  'Bicycle': {
    word: 'Bicycle',
    category: 'Vehicles',
    hints: ['Two wheels and handlebars', 'Human-powered transport'],
    totalStrokes: 11,
    strokes: [
      // Rear wheel
      {
        color: '#0284C7',
        width: 5,
        points: [
          {x: 200, y: 350}, {x: 240, y: 310}, {x: 280, y: 350}, {x: 240, y: 390}, {x: 200, y: 350}
        ]
      },
      // Front wheel
      {
        color: '#0284C7',
        width: 5,
        points: [
          {x: 500, y: 350}, {x: 540, y: 310}, {x: 580, y: 350}, {x: 540, y: 390}, {x: 500, y: 350}
        ]
      },
      // Frame - bottom bracket & chain stay
      {
        color: '#EF4444',
        width: 6,
        points: [{x: 240, y: 350}, {x: 370, y: 350}]
      },
      // Frame - seat tube
      {
        color: '#EF4444',
        width: 6,
        points: [{x: 370, y: 350}, {x: 330, y: 230}]
      },
      // Frame - top tube
      {
        color: '#EF4444',
        width: 6,
        points: [{x: 330, y: 230}, {x: 480, y: 230}]
      },
      // Frame - down tube
      {
        color: '#EF4444',
        width: 6,
        points: [{x: 370, y: 350}, {x: 480, y: 230}]
      },
      // Frame - seat stays
      {
        color: '#EF4444',
        width: 5,
        points: [{x: 240, y: 350}, {x: 330, y: 230}]
      },
      // Front fork & stem
      {
        color: '#1E293B',
        width: 5,
        points: [{x: 540, y: 350}, {x: 480, y: 230}, {x: 470, y: 180}]
      },
      // Handlebars
      {
        color: '#1E293B',
        width: 5,
        points: [{x: 440, y: 175}, {x: 470, y: 180}, {x: 500, y: 185}]
      },
      // Saddle
      {
        color: '#1E293B',
        width: 7,
        points: [{x: 295, y: 220}, {x: 355, y: 220}]
      },
      // Pedals / crank
      {
        color: '#F59E0B',
        width: 4,
        points: [{x: 370, y: 350}, {x: 370, y: 390}, {x: 390, y: 390}]
      }
    ]
  },

  'Rocket': {
    word: 'Rocket',
    category: 'Vehicles',
    hints: ['Blasts off to outer space', 'Pointy nose and fire booster'],
    totalStrokes: 9,
    strokes: [
      // Rocket Body
      {
        color: '#0EA5E9',
        width: 5,
        points: [
          {x: 340, y: 380}, {x: 340, y: 240}, {x: 400, y: 130}, {x: 460, y: 240}, {x: 460, y: 380}, {x: 340, y: 380}
        ]
      },
      // Nose Cone Color
      {
        color: '#EF4444',
        width: 5,
        points: [{x: 355, y: 220}, {x: 400, y: 130}, {x: 445, y: 220}, {x: 355, y: 220}]
      },
      // Left Fin
      {
        color: '#EF4444',
        width: 5,
        points: [{x: 340, y: 320}, {x: 270, y: 390}, {x: 340, y: 380}]
      },
      // Right Fin
      {
        color: '#EF4444',
        width: 5,
        points: [{x: 460, y: 320}, {x: 530, y: 390}, {x: 460, y: 380}]
      },
      // Center Window (Porthole)
      {
        color: '#FACC15',
        width: 5,
        points: [{x: 380, y: 280}, {x: 420, y: 280}, {x: 420, y: 320}, {x: 380, y: 320}, {x: 380, y: 280}]
      },
      // Inner window glass
      {
        color: '#38BDF8',
        width: 4,
        points: [{x: 390, y: 290}, {x: 410, y: 310}]
      },
      // Flame Outer
      {
        color: '#F97316',
        width: 6,
        points: [{x: 360, y: 385}, {x: 380, y: 460}, {x: 400, y: 420}, {x: 420, y: 465}, {x: 440, y: 385}]
      },
      // Flame Inner
      {
        color: '#FACC15',
        width: 5,
        points: [{x: 380, y: 390}, {x: 400, y: 440}, {x: 420, y: 390}]
      },
      // Smoke stars
      {
        color: '#94A3B8',
        width: 3,
        points: [{x: 250, y: 160}, {x: 260, y: 160}, {x: 530, y: 180}, {x: 540, y: 180}]
      }
    ]
  },

  'Mountain': {
    word: 'Mountain',
    category: 'Nature',
    hints: ['Huge rocky peak', 'Snow on top and sun in the sky'],
    totalStrokes: 8,
    strokes: [
      // Left mountain peak
      {
        color: '#1E293B',
        width: 5,
        points: [{x: 100, y: 420}, {x: 320, y: 160}, {x: 500, y: 420}]
      },
      // Snow cap left
      {
        color: '#0EA5E9',
        width: 4,
        points: [{x: 260, y: 235}, {x: 290, y: 250}, {x: 320, y: 230}, {x: 350, y: 255}, {x: 380, y: 235}]
      },
      // Right mountain peak
      {
        color: '#1E293B',
        width: 5,
        points: [{x: 380, y: 420}, {x: 550, y: 200}, {x: 720, y: 420}]
      },
      // Snow cap right
      {
        color: '#0EA5E9',
        width: 4,
        points: [{x: 490, y: 275}, {x: 520, y: 290}, {x: 550, y: 270}, {x: 580, y: 295}, {x: 610, y: 275}]
      },
      // Ground line
      {
        color: '#22C55E',
        width: 6,
        points: [{x: 50, y: 420}, {x: 750, y: 420}]
      },
      // Sun
      {
        color: '#F59E0B',
        width: 5,
        points: [{x: 400, y: 140}, {x: 430, y: 110}, {x: 460, y: 140}, {x: 430, y: 170}, {x: 400, y: 140}]
      },
      // Sun rays
      {
        color: '#FBBF24',
        width: 3,
        points: [{x: 430, y: 90}, {x: 430, y: 70}]
      },
      // Cloud
      {
        color: '#64748B',
        width: 3,
        points: [{x: 180, y: 120}, {x: 220, y: 100}, {x: 260, y: 120}, {x: 220, y: 130}, {x: 180, y: 120}]
      }
    ]
  },

  'Guitar': {
    word: 'Guitar',
    category: 'Everyday Objects',
    hints: ['Musical instrument with strings', 'Acoustic sound hole'],
    totalStrokes: 10,
    strokes: [
      // Lower body
      {
        color: '#D97706',
        width: 5,
        points: [
          {x: 220, y: 320}, {x: 180, y: 380}, {x: 220, y: 440}, {x: 320, y: 440},
          {x: 360, y: 380}, {x: 320, y: 320}
        ]
      },
      // Upper body
      {
        color: '#D97706',
        width: 5,
        points: [
          {x: 220, y: 320}, {x: 200, y: 270}, {x: 240, y: 230}, {x: 300, y: 230},
          {x: 340, y: 270}, {x: 320, y: 320}
        ]
      },
      // Sound hole
      {
        color: '#1E293B',
        width: 5,
        points: [{x: 250, y: 310}, {x: 290, y: 310}, {x: 290, y: 350}, {x: 250, y: 350}, {x: 250, y: 310}]
      },
      // Bridge
      {
        color: '#1E293B',
        width: 6,
        points: [{x: 240, y: 400}, {x: 300, y: 400}]
      },
      // Neck
      {
        color: '#B45309',
        width: 5,
        points: [{x: 260, y: 230}, {x: 260, y: 90}, {x: 280, y: 90}, {x: 280, y: 230}]
      },
      // Headstock
      {
        color: '#D97706',
        width: 5,
        points: [{x: 255, y: 90}, {x: 255, y: 40}, {x: 285, y: 40}, {x: 285, y: 90}]
      },
      // Tuning pegs
      {
        color: '#F59E0B',
        width: 4,
        points: [
          {x: 240, y: 55}, {x: 255, y: 55},
          {x: 240, y: 75}, {x: 255, y: 75},
          {x: 285, y: 55}, {x: 300, y: 55},
          {x: 285, y: 75}, {x: 300, y: 75}
        ]
      },
      // Strings
      {
        color: '#94A3B8',
        width: 2,
        points: [{x: 265, y: 50}, {x: 265, y: 400}]
      },
      {
        color: '#94A3B8',
        width: 2,
        points: [{x: 275, y: 50}, {x: 275, y: 400}]
      },
      // Musical notes
      {
        color: '#EF4444',
        width: 3,
        points: [{x: 390, y: 150}, {x: 410, y: 130}, {x: 410, y: 180}]
      }
    ]
  },

  'Pizza': {
    word: 'Pizza',
    category: 'Food & Drinks',
    hints: ['Cheesy Italian slice', 'Pepperoni toppings and crust'],
    totalStrokes: 8,
    strokes: [
      // Crust top arc
      {
        color: '#D97706',
        width: 8,
        points: [{x: 250, y: 120}, {x: 400, y: 90}, {x: 550, y: 120}]
      },
      // Left side edge to tip
      {
        color: '#F59E0B',
        width: 6,
        points: [{x: 250, y: 120}, {x: 400, y: 420}]
      },
      // Right side edge to tip
      {
        color: '#F59E0B',
        width: 6,
        points: [{x: 550, y: 120}, {x: 400, y: 420}]
      },
      // Cheese texture
      {
        color: '#FACC15',
        width: 5,
        points: [{x: 290, y: 170}, {x: 400, y: 150}, {x: 510, y: 170}]
      },
      // Pepperoni 1
      {
        color: '#EF4444',
        width: 5,
        points: [{x: 350, y: 180}, {x: 380, y: 180}, {x: 380, y: 210}, {x: 350, y: 210}, {x: 350, y: 180}]
      },
      // Pepperoni 2
      {
        color: '#EF4444',
        width: 5,
        points: [{x: 430, y: 220}, {x: 460, y: 220}, {x: 460, y: 250}, {x: 430, y: 250}, {x: 430, y: 220}]
      },
      // Pepperoni 3
      {
        color: '#EF4444',
        width: 5,
        points: [{x: 370, y: 280}, {x: 400, y: 280}, {x: 400, y: 310}, {x: 370, y: 310}, {x: 370, y: 280}]
      },
      // Basil leaves / seasoning
      {
        color: '#22C55E',
        width: 4,
        points: [{x: 320, y: 240}, {x: 335, y: 235}, {x: 450, y: 170}, {x: 465, y: 180}, {x: 385, y: 350}, {x: 395, y: 345}]
      }
    ]
  },

  'Cat': {
    word: 'Cat',
    category: 'Animals',
    hints: ['Pet with whiskers and pointy ears', 'Meows and catches mice'],
    totalStrokes: 9,
    strokes: [
      // Head with ears
      {
        color: '#1E293B',
        width: 5,
        points: [
          {x: 320, y: 250}, {x: 300, y: 160}, {x: 350, y: 190},
          {x: 450, y: 190}, {x: 500, y: 160}, {x: 480, y: 250},
          {x: 460, y: 290}, {x: 340, y: 290}, {x: 320, y: 250}
        ]
      },
      // Eyes
      {
        color: '#22C55E',
        width: 5,
        points: [{x: 360, y: 230}, {x: 365, y: 230}]
      },
      {
        color: '#22C55E',
        width: 5,
        points: [{x: 440, y: 230}, {x: 445, y: 230}]
      },
      // Nose & Mouth
      {
        color: '#EF4444',
        width: 4,
        points: [{x: 400, y: 250}, {x: 390, y: 265}, {x: 400, y: 260}, {x: 410, y: 265}]
      },
      // Whiskers Left
      {
        color: '#1E293B',
        width: 3,
        points: [{x: 370, y: 255}, {x: 290, y: 245}, {x: 370, y: 265}, {x: 285, y: 270}]
      },
      // Whiskers Right
      {
        color: '#1E293B',
        width: 3,
        points: [{x: 430, y: 255}, {x: 510, y: 245}, {x: 430, y: 265}, {x: 515, y: 270}]
      },
      // Body
      {
        color: '#1E293B',
        width: 5,
        points: [
          {x: 350, y: 290}, {x: 320, y: 420}, {x: 480, y: 420}, {x: 450, y: 290}
        ]
      },
      // Front paws
      {
        color: '#1E293B',
        width: 4,
        points: [{x: 380, y: 350}, {x: 380, y: 420}, {x: 420, y: 350}, {x: 420, y: 420}]
      },
      // Tail
      {
        color: '#1E293B',
        width: 5,
        points: [{x: 480, y: 400}, {x: 540, y: 380}, {x: 560, y: 320}, {x: 540, y: 300}]
      }
    ]
  },

  'Tree': {
    word: 'Tree',
    category: 'Nature',
    hints: ['Brown trunk and green leaves', 'Grows in forests'],
    totalStrokes: 7,
    strokes: [
      // Trunk
      {
        color: '#92400E',
        width: 7,
        points: [{x: 370, y: 440}, {x: 375, y: 250}, {x: 425, y: 250}, {x: 430, y: 440}]
      },
      // Branch left
      {
        color: '#92400E',
        width: 5,
        points: [{x: 375, y: 300}, {x: 330, y: 260}]
      },
      // Branch right
      {
        color: '#92400E',
        width: 5,
        points: [{x: 425, y: 280}, {x: 470, y: 240}]
      },
      // Foliage Bottom Puff
      {
        color: '#16A34A',
        width: 6,
        points: [
          {x: 280, y: 270}, {x: 240, y: 220}, {x: 290, y: 170},
          {x: 510, y: 170}, {x: 560, y: 220}, {x: 520, y: 270}, {x: 280, y: 270}
        ]
      },
      // Foliage Top Puff
      {
        color: '#22C55E',
        width: 6,
        points: [
          {x: 290, y: 180}, {x: 330, y: 110}, {x: 400, y: 80},
          {x: 470, y: 110}, {x: 510, y: 180}, {x: 290, y: 180}
        ]
      },
      // Apples on tree
      {
        color: '#EF4444',
        width: 6,
        points: [
          {x: 320, y: 190}, {x: 325, y: 190},
          {x: 450, y: 160}, {x: 455, y: 160},
          {x: 380, y: 130}, {x: 385, y: 130},
          {x: 410, y: 210}, {x: 415, y: 210}
        ]
      },
      // Grass at base
      {
        color: '#15803D',
        width: 4,
        points: [
          {x: 320, y: 440}, {x: 340, y: 425}, {x: 360, y: 440},
          {x: 440, y: 440}, {x: 460, y: 425}, {x: 480, y: 440}
        ]
      }
    ]
  },

  'House': {
    word: 'House',
    category: 'Places',
    hints: ['Building to live in', 'Roof, door, and windows'],
    totalStrokes: 8,
    strokes: [
      // Base square
      {
        color: '#1E293B',
        width: 5,
        points: [{x: 250, y: 420}, {x: 250, y: 240}, {x: 550, y: 240}, {x: 550, y: 420}, {x: 250, y: 420}]
      },
      // Roof triangle
      {
        color: '#EF4444',
        width: 6,
        points: [{x: 220, y: 240}, {x: 400, y: 110}, {x: 580, y: 240}, {x: 220, y: 240}]
      },
      // Chimney
      {
        color: '#D97706',
        width: 4,
        points: [{x: 480, y: 170}, {x: 480, y: 120}, {x: 520, y: 120}, {x: 520, y: 195}]
      },
      // Smoke
      {
        color: '#94A3B8',
        width: 3,
        points: [{x: 500, y: 110}, {x: 510, y: 90}, {x: 495, y: 70}, {x: 515, y: 50}]
      },
      // Door
      {
        color: '#D97706',
        width: 4,
        points: [{x: 360, y: 420}, {x: 360, y: 320}, {x: 440, y: 320}, {x: 440, y: 420}]
      },
      // Doorknob
      {
        color: '#F59E0B',
        width: 4,
        points: [{x: 425, y: 370}, {x: 427, y: 370}]
      },
      // Left Window
      {
        color: '#0EA5E9',
        width: 4,
        points: [{x: 280, y: 270}, {x: 330, y: 270}, {x: 330, y: 320}, {x: 280, y: 320}, {x: 280, y: 270}]
      },
      // Right Window
      {
        color: '#0EA5E9',
        width: 4,
        points: [{x: 470, y: 270}, {x: 520, y: 270}, {x: 520, y: 320}, {x: 470, y: 320}, {x: 470, y: 270}]
      }
    ]
  },

  'Robot': {
    word: 'Robot',
    category: 'Technology',
    hints: ['Mechanical person', 'Antenna and glowing eyes'],
    totalStrokes: 9,
    strokes: [
      // Head
      {
        color: '#0284C7',
        width: 5,
        points: [{x: 340, y: 150}, {x: 460, y: 150}, {x: 460, y: 230}, {x: 340, y: 230}, {x: 340, y: 150}]
      },
      // Antenna
      {
        color: '#1E293B',
        width: 4,
        points: [{x: 400, y: 150}, {x: 400, y: 90}]
      },
      {
        color: '#EF4444',
        width: 6,
        points: [{x: 400, y: 85}, {x: 402, y: 85}]
      },
      // Eyes
      {
        color: '#FACC15',
        width: 5,
        points: [{x: 370, y: 180}, {x: 385, y: 180}, {x: 415, y: 180}, {x: 430, y: 180}]
      },
      // Mouth grid
      {
        color: '#1E293B',
        width: 3,
        points: [{x: 370, y: 210}, {x: 430, y: 210}]
      },
      // Torso / Body
      {
        color: '#0EA5E9',
        width: 5,
        points: [{x: 310, y: 250}, {x: 490, y: 250}, {x: 490, y: 390}, {x: 310, y: 390}, {x: 310, y: 250}]
      },
      // Chest dials & buttons
      {
        color: '#22C55E',
        width: 4,
        points: [{x: 340, y: 280}, {x: 380, y: 280}, {x: 380, y: 320}, {x: 340, y: 320}, {x: 340, y: 280}]
      },
      // Arms
      {
        color: '#1E293B',
        width: 5,
        points: [{x: 310, y: 270}, {x: 250, y: 320}, {x: 250, y: 360}, {x: 490, y: 270}, {x: 550, y: 320}, {x: 550, y: 360}]
      },
      // Legs
      {
        color: '#1E293B',
        width: 6,
        points: [{x: 360, y: 390}, {x: 360, y: 450}, {x: 440, y: 390}, {x: 440, y: 450}]
      }
    ]
  }
};

export function getRandomAIDrawing(excludeWord?: string): AIDrawingData {
  const keys = Object.keys(AI_DRAWINGS).filter(k => k !== excludeWord);
  const randomKey = keys[Math.floor(Math.random() * keys.length)] || 'Elephant';
  return AI_DRAWINGS[randomKey];
}
