export interface WordItem {
  word: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  hints?: string[];
}

export const WORD_CATEGORIES = [
  'All Categories',
  'Animals',
  'Everyday Objects',
  'Food & Drinks',
  'Vehicles',
  'Nature',
  'Places',
  'Sports',
  'Jobs & Professions',
  'Movies & Pop Culture',
  'Household Items',
  'Technology'
] as const;

export const WORD_BANK: WordItem[] = [
  // Animals (Easy)
  { word: 'Elephant', category: 'Animals', difficulty: 'easy', hints: ['Large mammal', 'Has a trunk'] },
  { word: 'Cat', category: 'Animals', difficulty: 'easy', hints: ['Pet', 'Meows'] },
  { word: 'Dog', category: 'Animals', difficulty: 'easy', hints: ['Pet', 'Barks'] },
  { word: 'Lion', category: 'Animals', difficulty: 'easy', hints: ['King of the jungle', 'Has a mane'] },
  { word: 'Duck', category: 'Animals', difficulty: 'easy', hints: ['Swims in ponds', 'Quacks'] },
  { word: 'Bird', category: 'Animals', difficulty: 'easy', hints: ['Has wings', 'Can fly'] },
  { word: 'Fish', category: 'Animals', difficulty: 'easy', hints: ['Lives in water', 'Has gills'] },
  { word: 'Monkey', category: 'Animals', difficulty: 'easy', hints: ['Loves bananas', 'Climbs trees'] },
  { word: 'Frog', category: 'Animals', difficulty: 'easy', hints: ['Green amphibian', 'Hops'] },
  { word: 'Snake', category: 'Animals', difficulty: 'easy', hints: ['Reptile', 'Slithers'] },
  { word: 'Giraffe', category: 'Animals', difficulty: 'easy', hints: ['Tall animal', 'Long neck'] },
  { word: 'Penguin', category: 'Animals', difficulty: 'easy', hints: ['Flightless bird', 'Waddles on ice'] },
  { word: 'Butterfly', category: 'Animals', difficulty: 'easy', hints: ['Insect', 'Colorful wings'] },
  { word: 'Bee', category: 'Animals', difficulty: 'easy', hints: ['Makes honey', 'Buzzes'] },
  { word: 'Rabbit', category: 'Animals', difficulty: 'easy', hints: ['Long ears', 'Eats carrots'] },

  // Animals (Medium / Hard)
  { word: 'Chameleon', category: 'Animals', difficulty: 'medium', hints: ['Changes color', 'Lizard'] },
  { word: 'Kangaroo', category: 'Animals', difficulty: 'medium', hints: ['Australian', 'Has a pouch'] },
  { word: 'Flamingo', category: 'Animals', difficulty: 'medium', hints: ['Pink bird', 'Stands on one leg'] },
  { word: 'Octopus', category: 'Animals', difficulty: 'medium', hints: ['Sea creature', 'Eight tentacles'] },
  { word: 'Platypus', category: 'Animals', difficulty: 'hard', hints: ['Egg-laying mammal', 'Duck bill'] },
  { word: 'Armadillo', category: 'Animals', difficulty: 'hard', hints: ['Armored shell', 'Rolls into ball'] },

  // Vehicles (Easy / Medium)
  { word: 'Bicycle', category: 'Vehicles', difficulty: 'easy', hints: ['Two wheels', 'Pedals'] },
  { word: 'Car', category: 'Vehicles', difficulty: 'easy', hints: ['Four wheels', 'Driven on roads'] },
  { word: 'Airplane', category: 'Vehicles', difficulty: 'easy', hints: ['Flies in the sky', 'Has wings'] },
  { word: 'Rocket', category: 'Vehicles', difficulty: 'easy', hints: ['Goes to space', 'Flames at bottom'] },
  { word: 'Boat', category: 'Vehicles', difficulty: 'easy', hints: ['Floats on water', 'Sail or motor'] },
  { word: 'Train', category: 'Vehicles', difficulty: 'easy', hints: ['Runs on tracks', 'Choo-choo'] },
  { word: 'Bus', category: 'Vehicles', difficulty: 'easy', hints: ['Large public transit', 'School transport'] },
  { word: 'Helicopter', category: 'Vehicles', difficulty: 'medium', hints: ['Rotary blades', 'Hovers'] },
  { word: 'Submarine', category: 'Vehicles', difficulty: 'medium', hints: ['Underwater vessel', 'Periscope'] },
  { word: 'Skateboard', category: 'Vehicles', difficulty: 'easy', hints: ['Board on 4 small wheels', 'Tricks'] },
  { word: 'Hot Air Balloon', category: 'Vehicles', difficulty: 'hard', hints: ['Floats with hot gas', 'Basket'] },

  // Food & Drinks
  { word: 'Pizza', category: 'Food & Drinks', difficulty: 'easy', hints: ['Cheesy slice', 'Crust and toppings'] },
  { word: 'Burger', category: 'Food & Drinks', difficulty: 'easy', hints: ['Bun, patty, lettuce', 'Fast food'] },
  { word: 'Ice Cream', category: 'Food & Drinks', difficulty: 'easy', hints: ['Cold sweet treat', 'In a cone'] },
  { word: 'Apple', category: 'Food & Drinks', difficulty: 'easy', hints: ['Fruit', 'Red or green, has a stem'] },
  { word: 'Banana', category: 'Food & Drinks', difficulty: 'easy', hints: ['Yellow fruit', 'Peel to eat'] },
  { word: 'Cake', category: 'Food & Drinks', difficulty: 'easy', hints: ['Birthday dessert', 'Candles on top'] },
  { word: 'Coffee', category: 'Food & Drinks', difficulty: 'easy', hints: ['Morning brew', 'Mug with steam'] },
  { word: 'Donut', category: 'Food & Drinks', difficulty: 'easy', hints: ['Ring pastry with hole', 'Sprinkles'] },
  { word: 'Sushi', category: 'Food & Drinks', difficulty: 'medium', hints: ['Japanese roll', 'Rice and seaweed'] },
  { word: 'Taco', category: 'Food & Drinks', difficulty: 'easy', hints: ['Mexican food', 'Folded tortilla'] },
  { word: 'Watermelon', category: 'Food & Drinks', difficulty: 'easy', hints: ['Green rind', 'Red inside with seeds'] },
  { word: 'Spaghetti', category: 'Food & Drinks', difficulty: 'medium', hints: ['Pasta noodles', 'Meatballs'] },

  // Nature
  { word: 'Mountain', category: 'Nature', difficulty: 'easy', hints: ['High peak', 'Snow-capped top'] },
  { word: 'Tree', category: 'Nature', difficulty: 'easy', hints: ['Trunk and leaves', 'Grows in forests'] },
  { word: 'Sun', category: 'Nature', difficulty: 'easy', hints: ['In the sky', 'Shines bright'] },
  { word: 'Volcano', category: 'Nature', difficulty: 'easy', hints: ['Mountain with lava', 'Erupts'] },
  { word: 'Flower', category: 'Nature', difficulty: 'easy', hints: ['Petals and stem', 'Blooms in spring'] },
  { word: 'Cloud', category: 'Nature', difficulty: 'easy', hints: ['Fluffy in sky', 'Brings rain'] },
  { word: 'Rainbow', category: 'Nature', difficulty: 'easy', hints: ['Arch of colors in sky', 'After rain'] },
  { word: 'Waterfall', category: 'Nature', difficulty: 'medium', hints: ['River dropping over cliff', 'Cascading water'] },
  { word: 'Campfire', category: 'Nature', difficulty: 'easy', hints: ['Wood burning outdoors', 'Roast marshmallows'] },
  { word: 'Island', category: 'Nature', difficulty: 'medium', hints: ['Land surrounded by water', 'Palm tree'] },
  { word: 'Cactus', category: 'Nature', difficulty: 'easy', hints: ['Desert plant', 'Prickly needles'] },

  // Everyday Objects & Household Items
  { word: 'Guitar', category: 'Everyday Objects', difficulty: 'easy', hints: ['Musical instrument', 'Strings'] },
  { word: 'Clock', category: 'Everyday Objects', difficulty: 'easy', hints: ['Tells time', 'Hour and minute hands'] },
  { word: 'Umbrella', category: 'Everyday Objects', difficulty: 'easy', hints: ['Keeps you dry', 'Opens in rain'] },
  { word: 'Scissors', category: 'Everyday Objects', difficulty: 'easy', hints: ['Cuts paper', 'Two blades'] },
  { word: 'Key', category: 'Everyday Objects', difficulty: 'easy', hints: ['Unlocks doors', 'Metal'] },
  { word: 'Backpack', category: 'Everyday Objects', difficulty: 'easy', hints: ['School bag', 'Straps on back'] },
  { word: 'Book', category: 'Everyday Objects', difficulty: 'easy', hints: ['Pages to read', 'Hard or soft cover'] },
  { word: 'Glasses', category: 'Everyday Objects', difficulty: 'easy', hints: ['Worn on face', 'Helps vision'] },
  { word: 'Toothbrush', category: 'Household Items', difficulty: 'easy', hints: ['Cleans teeth', 'Bristles'] },
  { word: 'Lamp', category: 'Household Items', difficulty: 'easy', hints: ['Light fixture', 'Lampshade and bulb'] },
  { word: 'Chair', category: 'Household Items', difficulty: 'easy', hints: ['Furniture to sit on', 'Four legs'] },
  { word: 'Mirror', category: 'Household Items', difficulty: 'medium', hints: ['Reflects image', 'Glass frame'] },

  // Technology
  { word: 'Laptop', category: 'Technology', difficulty: 'easy', hints: ['Portable computer', 'Keyboard and screen'] },
  { word: 'Headphones', category: 'Technology', difficulty: 'easy', hints: ['Listen to music', 'Over ears'] },
  { word: 'Robot', category: 'Technology', difficulty: 'easy', hints: ['Mechanical entity', 'Antenna and metal body'] },
  { word: 'Camera', category: 'Technology', difficulty: 'easy', hints: ['Takes photos', 'Lens and flash'] },
  { word: 'Smartphone', category: 'Technology', difficulty: 'easy', hints: ['Touchscreen device', 'Apps and calls'] },
  { word: 'Gamepad', category: 'Technology', difficulty: 'medium', hints: ['Game controller', 'Buttons and joysticks'] },

  // Sports
  { word: 'Basketball', category: 'Sports', difficulty: 'easy', hints: ['Orange ball with lines', 'Hoop'] },
  { word: 'Soccer', category: 'Sports', difficulty: 'easy', hints: ['Black and white ball', 'Goal net'] },
  { word: 'Tennis', category: 'Sports', difficulty: 'easy', hints: ['Racket and green ball', 'Net court'] },
  { word: 'Bowling', category: 'Sports', difficulty: 'medium', hints: ['Heavy ball with 3 holes', '10 pins'] },
  { word: 'Trophy', category: 'Sports', difficulty: 'easy', hints: ['Award for winning', 'Golden cup'] },

  // Jobs & Professions
  { word: 'Doctor', category: 'Jobs & Professions', difficulty: 'medium', hints: ['Medical worker', 'Stethoscope'] },
  { word: 'Chef', category: 'Jobs & Professions', difficulty: 'easy', hints: ['Cooks food', 'Tall white hat'] },
  { word: 'Firefighter', category: 'Jobs & Professions', difficulty: 'medium', hints: ['Extinguishes fires', 'Helmet and hose'] },
  { word: 'Astronaut', category: 'Jobs & Professions', difficulty: 'medium', hints: ['Spacesuit', 'Explores space'] },
  { word: 'Painter', category: 'Jobs & Professions', difficulty: 'easy', hints: ['Creates art', 'Easel and palette'] },

  // Places
  { word: 'Castle', category: 'Places', difficulty: 'easy', hints: ['Fortress', 'Towers and stone walls'] },
  { word: 'Pyramid', category: 'Places', difficulty: 'easy', hints: ['Ancient Egypt', 'Triangular stone'] },
  { word: 'Lighthouse', category: 'Places', difficulty: 'medium', hints: ['Tower with bright light', 'Guiding ships'] },
  { word: 'Bridge', category: 'Places', difficulty: 'medium', hints: ['Spans over water', 'Cables and arches'] }
];

export function getWordChoices(category: string, difficulty: string, excludeWords: string[] = []): string[] {
  let pool = WORD_BANK.filter(w => !excludeWords.includes(w.word));
  
  if (category && category !== 'All Categories') {
    const catPool = pool.filter(w => w.category.toLowerCase() === category.toLowerCase());
    if (catPool.length >= 3) {
      pool = catPool;
    }
  }

  if (difficulty && difficulty !== 'mixed') {
    const diffPool = pool.filter(w => w.difficulty === difficulty);
    if (diffPool.length >= 3) {
      pool = diffPool;
    }
  }

  // Shuffle pool
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 3).map(w => w.word);

  // Fallback if less than 3
  if (selected.length < 3) {
    const defaults = ['Elephant', 'Bicycle', 'Mountain', 'Guitar', 'Rocket', 'Pizza'];
    for (const d of defaults) {
      if (!selected.includes(d)) selected.push(d);
      if (selected.length === 3) break;
    }
  }

  return selected;
}
