import { Book } from '../types';

const generateCoverDataUri = (title: string, seed: string): string => {
  const colors = [
    ['#6366F1', '#A5B4FC'], // Indigo
    ['#10B981', '#6EE7B7'], // Emerald
    ['#F59E0B', '#FCD34D'], // Amber
    ['#EC4899', '#F9A8D4'], // Pink
    ['#8B5CF6', '#C4B5FD'], // Violet
    ['#EF4444', '#FCA5A5'], // Red
    ['#3B82F6', '#93C5FD'], // Blue
  ];
  // Simple hash function to get a deterministic color pair
  const hash = seed.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
  const colorPair = colors[Math.abs(hash) % colors.length];
  
  const words = title.split(' ');
  const initials = (words.length > 1 
      ? words[0][0] + words[1][0] 
      : title.substring(0, 2)
    ).toUpperCase();

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="400" height="600">
    <defs>
      <linearGradient id="grad-${seed.replace(/[^a-zA-Z0-9-]/g, '')}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${colorPair[0]};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${colorPair[1]};stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="400" height="600" fill="url(#grad-${seed.replace(/[^a-zA-Z0-9-]/g, '')})" />
    <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-family="Poppins, sans-serif" font-size="120" font-weight="bold" fill="white" fill-opacity="0.8">
      ${initials}
    </text>
  </svg>`;
  
  // Browsers require the SVG to be Base64 encoded for data URIs.
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};


export const books: Book[] = [
  {
    id: 'moby-dick',
    title: 'Moby Dick',
    author: 'Herman Melville',
    coverImage: generateCoverDataUri('Moby Dick', 'mobydick'),
    chapters: [
      {
        title: 'Chapter 1: Loomings',
        content: `Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world. It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet; and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people’s hats off—then, I account it high time to get to sea as soon as I can. This is my substitute for pistol and ball. With a philosophical flourish Cato throws himself upon his sword; I quietly take to the ship. There is nothing surprising in this. If they but knew it, almost all men in their degree, some time or other, cherish very nearly the same feelings towards the ocean with me. There now is your insular city of the Manhattoes, belted round by wharves as Indian isles by coral reefs—commerce surrounds it with her surf. Right and left, the streets take you waterward. Its extreme downtown is the battery, where that noble mole is washed by waves, and cooled by breezes, which a few hours previous were out of sight of land. Look at the crowds of water-gazers there.`
      },
      {
        title: 'Chapter 2: The Carpet-Bag',
        content: `I stuffed a shirt or two into my old carpet-bag, tucked it under my arm, and started for Cape Horn and the Pacific. Quitting the good city of old Manhatto, I duly arrived in New Bedford. It was a Saturday night in December. I had striven to be nice and warm when I came into the house, and I had been rubbing my hands and stamping my feet, but all to no purpose. It was a very cold and frosty night. The sky was clear and the stars were bright. The wind was sharp and piercing. I was glad to get into a warm room, and I was glad to see a fire. I had no money to lose, so I did not care where I went. I determined to go to a cheap inn, and I was directed to one called “The Spouter-Inn,” kept by Peter Coffin. As I was walking along, I saw a light in a window, and I went up to the door and knocked. A man came to the door, and I asked him if he could give me a lodging. He said he could. I asked him what he charged, and he told me a shilling. I told him I would take it. He then led me into a little room, and he told me that I could have a bed there. I was very tired, and I was very glad to have a place to sleep.`
      }
    ],
  },
  {
    id: 'alice-in-wonderland',
    title: 'Alice in Wonderland',
    author: 'Lewis Carroll',
    coverImage: generateCoverDataUri('Alice in Wonderland', 'alice'),
    chapters: [
      {
        title: 'Chapter 1: Down the Rabbit-Hole',
        content: `Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, “and what is the use of a book,” thought Alice “without pictures or conversations?” So she was considering in her own mind (as well as she could, for the hot day made her feel very sleepy and stupid), whether the pleasure of making a daisy-chain would be worth the trouble of getting up and picking the daisies, when suddenly a White Rabbit with pink eyes ran close by her. There was nothing so very remarkable in that; nor did Alice think it so very much out of the way to hear the Rabbit say to itself, “Oh dear! Oh dear! I shall be late!” (when she thought it over afterwards, it occurred to her that she ought to have wondered at this, but at the time it all seemed quite natural); but when the Rabbit actually took a watch out of its waistcoat-pocket, and looked at it, and then hurried on, Alice started to her feet, for it flashed across her mind that she had never before seen a rabbit with either a waistcoat-pocket, or a watch to take out of it, and burning with curiosity, she ran across the field after it, and fortunately was just in time to see it pop down a large rabbit-hole under the hedge.`
      },
      {
        title: 'Chapter 2: The Pool of Tears',
        content: `“Curiouser and curiouser!” cried Alice (she was so much surprised, that for the moment she quite forgot how to speak good English); “now I’m opening out like the largest telescope that ever was! Good-bye, feet!” (for when she looked down at her feet, they seemed to be almost out of sight, they were getting so far off). “Oh, my poor little feet, I wonder who will put on your shoes and stockings for you now, dears? I’m sure I sha’n’t be able! I shall be a great deal too far off to trouble myself about you: you must manage the best way you can;—but I must be kind to them,” thought Alice, “or perhaps they won’t walk the way I want to go! Let me see: I’ll give them a new pair of boots every Christmas.” And she went on planning to herself how she would manage it. “They must go by the carrier,” she thought; “and how funny it’ll seem, sending presents to one’s own feet! And how odd the directions will look! Alice’s Right Foot, Esq. The Hearthrug, near the Fender, (with Alice’s love). Oh dear, what nonsense I’m talking!”`
      },
    ],
  },
];