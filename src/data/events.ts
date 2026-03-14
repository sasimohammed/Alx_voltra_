export interface Event {
  id: string;
  title: string;
  description: string;
  city: string;
  type: "Tech" | "Music" | "Art" | "Business" | "Sports";
  mode: "Online" | "Offline";
  date: string; // ISO date string
  time: string;
  image: string;
  attendees: number;
  status: "Upcoming" | "Live" | "Past";
  speaker: string;
  price: number;
}

export const mockEvents: Event[] = [
  {
    id: "evt-1",
    title: "Global Tech Summit 2025",
    description: "Join industry leaders to discuss the future of AI, quantum computing, and sustainable technology. Featuring keynotes, breakout sessions, and networking opportunities.",
    city: "San Francisco",
    type: "Tech",
    mode: "Offline",
    date: "2025-08-15",
    time: "09:00 AM",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
    attendees: 1500,
    status: "Upcoming",
    speaker: "Dr. Sarah Chen",
    price: 299
  },
  {
    id: "evt-2",
    title: "Neon Nights Music Festival",
    description: "A three-day electronic music festival featuring top DJs from around the world. Immersive light shows, incredible sound systems, and unforgettable memories.",
    city: "Berlin",
    type: "Music",
    mode: "Offline",
    date: "2025-06-20",
    time: "04:00 PM",
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80",
    attendees: 5000,
    status: "Upcoming",
    speaker: "DJ Koda & Friends",
    price: 150
  },
  {
    id: "evt-3",
    title: "Startup Founders Pitch Day",
    description: "Watch the most promising early-stage startups pitch to top-tier venture capitalists. An incredible opportunity to network with founders and investors.",
    city: "London",
    type: "Business",
    mode: "Online",
    date: "2024-11-10",
    time: "10:00 AM",
    image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80",
    attendees: 800,
    status: "Past",
    speaker: "Michael Rossi",
    price: 0
  },
  {
    id: "evt-4",
    title: "Modern Abstract Art Exhibition",
    description: "A curated collection of contemporary abstract works from emerging artists across Europe and Asia.",
    city: "Paris",
    type: "Art",
    mode: "Offline",
    date: "2025-05-05",
    time: "11:00 AM",
    image: "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=800&q=80",
    attendees: 300,
    status: "Upcoming",
    speaker: "Elena Dubois",
    price: 45
  },
  {
    id: "evt-5",
    title: "FinTech Revolution Online",
    description: "How blockchain and decentralized finance are reshaping global economies. A deep dive into the future of money.",
    city: "New York",
    type: "Tech",
    mode: "Online",
    date: new Date().toISOString().split('T')[0], // Today
    time: "01:00 PM",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    attendees: 2100,
    status: "Live",
    speaker: "James Holden",
    price: 0
  },
  {
    id: "evt-6",
    title: "Urban Marathon 10K",
    description: "Annual city marathon promoting health and wellness. Open to all age groups and fitness levels.",
    city: "Tokyo",
    type: "Sports",
    mode: "Offline",
    date: "2025-09-12",
    time: "06:00 AM",
    image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&q=80",
    attendees: 12000,
    status: "Upcoming",
    speaker: "Kenji Sato",
    price: 60
  },
  {
    id: "evt-7",
    title: "Web3 Developer Bootcamp",
    description: "Intensive 2-day bootcamp covering smart contracts, dApps, and security in the Web3 ecosystem.",
    city: "Austin",
    type: "Tech",
    mode: "Offline",
    date: "2024-08-22",
    time: "09:00 AM",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80",
    attendees: 450,
    status: "Past",
    speaker: "Alex Rivera",
    price: 500
  },
  {
    id: "evt-8",
    title: "Jazz & Blues Evening",
    description: "An intimate evening of classic jazz and smooth blues featuring local quartets and special guest artists.",
    city: "Chicago",
    type: "Music",
    mode: "Offline",
    date: "2025-07-04",
    time: "08:00 PM",
    image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&q=80",
    attendees: 200,
    status: "Upcoming",
    speaker: "The Blue Notes",
    price: 75
  },
  {
    id: "evt-9",
    title: "E-Commerce Growth Masterclass",
    description: "Strategies for scaling your online store to 7 figures. Marketing, supply chain, and conversion rate optimization.",
    city: "Singapore",
    type: "Business",
    mode: "Online",
    date: "2025-04-18",
    time: "02:00 PM",
    image: "https://images.unsplash.com/photo-1661956602116-aa6865609028?w=800&q=80",
    attendees: 3500,
    status: "Upcoming",
    speaker: "Li Wei",
    price: 99
  },
  {
    id: "evt-10",
    title: "Digital Art & NFTs Showcase",
    description: "Exploring the intersection of traditional art and digital ownership. Live minting and interactive installations.",
    city: "Miami",
    type: "Art",
    mode: "Offline",
    date: new Date().toISOString().split('T')[0], // Today
    time: "05:00 PM",
    image: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800&q=80",
    attendees: 600,
    status: "Live",
    speaker: "Mia Jackson",
    price: 25
  },
  {
    id: "evt-11",
    title: "National Basketball Finals",
    description: "The thrilling conclusion to the national league. Watch the top two teams battle for the championship.",
    city: "Los Angeles",
    type: "Sports",
    mode: "Offline",
    date: "2025-06-10",
    time: "07:30 PM",
    image: "https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=800&q=80",
    attendees: 18000,
    status: "Upcoming",
    speaker: "N/A",
    price: 120
  },
  {
    id: "evt-12",
    title: "AI in Healthcare Symposium",
    description: "Discover how artificial intelligence is accelerating drug discovery, improving diagnostics, and personalizing patient care.",
    city: "Boston",
    type: "Tech",
    mode: "Offline",
    date: "2024-05-15",
    time: "10:00 AM",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
    attendees: 900,
    status: "Past",
    speaker: "Dr. Robert Singh",
    price: 350
  }
];
