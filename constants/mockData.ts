export type ServiceType = 'plumber' | 'electrician';

export interface Provider {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  serviceType: ServiceType;
  city: string;
  experience: number;
  rating: number;
  reviewCount: number;
  pricePerHour: number;
  available: boolean;
  description: string;
  skills: string[];
  completedJobs: number;
  phone: string;
  distance: number;
}

export interface Review {
  id: string;
  providerId: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
}

export const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata', 'Ahmedabad'];

export const MOCK_PROVIDERS: Provider[] = [
  {
    id: 'p1',
    name: 'Rajesh Kumar',
    initials: 'RK',
    avatarColor: '#1D4ED8',
    serviceType: 'plumber',
    city: 'Mumbai',
    experience: 8,
    rating: 4.8,
    reviewCount: 127,
    pricePerHour: 350,
    available: true,
    description: 'Expert plumber with 8 years of experience specializing in pipe fitting, leak repairs, and bathroom renovations. Available 24/7 for emergencies.',
    skills: ['Pipe Fitting', 'Leak Repair', 'Bathroom Installation', 'Water Heater', 'Drain Cleaning'],
    completedJobs: 340,
    phone: '+91 9876543210',
    distance: 1.2,
  },
  {
    id: 'p2',
    name: 'Suresh Patel',
    initials: 'SP',
    avatarColor: '#D97706',
    serviceType: 'electrician',
    city: 'Mumbai',
    experience: 12,
    rating: 4.9,
    reviewCount: 203,
    pricePerHour: 420,
    available: true,
    description: 'Certified electrician with over 12 years of experience. Specializes in home wiring, panel upgrades, and smart home installations.',
    skills: ['Home Wiring', 'Panel Upgrade', 'Smart Home', 'Safety Inspection', 'Lighting'],
    completedJobs: 512,
    phone: '+91 9876543211',
    distance: 2.5,
  },
  {
    id: 'p3',
    name: 'Amit Sharma',
    initials: 'AS',
    avatarColor: '#059669',
    serviceType: 'plumber',
    city: 'Delhi',
    experience: 5,
    rating: 4.6,
    reviewCount: 89,
    pricePerHour: 300,
    available: false,
    description: 'Skilled plumber offering quality services for residential and commercial properties. Specializes in modern plumbing systems.',
    skills: ['Pipe Fitting', 'Sanitary Fitting', 'RO Installation', 'Geyser Repair'],
    completedJobs: 180,
    phone: '+91 9876543212',
    distance: 3.1,
  },
  {
    id: 'p4',
    name: 'Deepak Mehta',
    initials: 'DM',
    avatarColor: '#7C3AED',
    serviceType: 'electrician',
    city: 'Bangalore',
    experience: 7,
    rating: 4.7,
    reviewCount: 145,
    pricePerHour: 380,
    available: true,
    description: 'Professional electrician with expertise in industrial and residential electrical systems. Quick response and reliable service.',
    skills: ['Wiring', 'MCB & Fuse', 'Inverter Setup', 'CCTV Installation', 'Fan Installation'],
    completedJobs: 290,
    phone: '+91 9876543213',
    distance: 0.8,
  },
  {
    id: 'p5',
    name: 'Vikram Singh',
    initials: 'VS',
    avatarColor: '#DC2626',
    serviceType: 'plumber',
    city: 'Bangalore',
    experience: 10,
    rating: 4.5,
    reviewCount: 167,
    pricePerHour: 320,
    available: true,
    description: 'Experienced plumber providing comprehensive plumbing solutions. Available for both emergency and scheduled work.',
    skills: ['Pipe Repair', 'Kitchen Plumbing', 'Bathroom Renovation', 'Pump Installation'],
    completedJobs: 410,
    phone: '+91 9876543214',
    distance: 1.9,
  },
  {
    id: 'p6',
    name: 'Ravi Reddy',
    initials: 'RR',
    avatarColor: '#0891B2',
    serviceType: 'electrician',
    city: 'Hyderabad',
    experience: 15,
    rating: 4.9,
    reviewCount: 321,
    pricePerHour: 450,
    available: true,
    description: 'Senior electrician with 15 years of experience. Expert in complex wiring, industrial setups, and renewable energy systems.',
    skills: ['Heavy Wiring', 'Solar Panel', 'Generator Setup', 'Industrial Electrical', 'AC Wiring'],
    completedJobs: 750,
    phone: '+91 9876543215',
    distance: 2.3,
  },
  {
    id: 'p7',
    name: 'Pradeep Joshi',
    initials: 'PJ',
    avatarColor: '#BE185D',
    serviceType: 'plumber',
    city: 'Pune',
    experience: 6,
    rating: 4.4,
    reviewCount: 72,
    pricePerHour: 280,
    available: false,
    description: 'Reliable plumber available for all household plumbing needs. Affordable rates and quality workmanship guaranteed.',
    skills: ['Tap Repair', 'Pipe Fitting', 'Flush Repair', 'Basin Installation'],
    completedJobs: 160,
    phone: '+91 9876543216',
    distance: 4.2,
  },
  {
    id: 'p8',
    name: 'Sanjay Mishra',
    initials: 'SM',
    avatarColor: '#92400E',
    serviceType: 'electrician',
    city: 'Chennai',
    experience: 9,
    rating: 4.6,
    reviewCount: 118,
    pricePerHour: 360,
    available: true,
    description: 'Licensed electrician offering residential and commercial electrical services with a focus on safety and quality.',
    skills: ['Home Wiring', 'Switchboard Repair', 'Earthing', 'Meter Installation', 'DG Set'],
    completedJobs: 280,
    phone: '+91 9876543217',
    distance: 1.5,
  },
];

export const MOCK_REVIEWS: Review[] = [
  { id: 'r1', providerId: 'p1', customerName: 'Anita Verma', rating: 5, comment: 'Excellent work! Fixed the leak quickly and professionally. Very neat and clean work.', date: '2026-02-10' },
  { id: 'r2', providerId: 'p1', customerName: 'Rahul Gupta', rating: 5, comment: 'Great service! Arrived on time and completed the work perfectly.', date: '2026-01-28' },
  { id: 'r3', providerId: 'p1', customerName: 'Priya Nair', rating: 4, comment: 'Good work, slightly expensive but worth it for the quality.', date: '2026-01-15' },
  { id: 'r4', providerId: 'p2', customerName: 'Mohit Agarwal', rating: 5, comment: 'Very knowledgeable and professional. Installed smart switches perfectly.', date: '2026-02-18' },
  { id: 'r5', providerId: 'p2', customerName: 'Sunita Rao', rating: 5, comment: 'Best electrician in the city. Highly recommend!', date: '2026-02-05' },
  { id: 'r6', providerId: 'p4', customerName: 'Kiran Reddy', rating: 5, comment: 'Fixed the wiring issue that 3 other electricians failed to diagnose. Brilliant!', date: '2026-02-12' },
  { id: 'r7', providerId: 'p6', customerName: 'Lakshmi Devi', rating: 5, comment: 'Installed solar panels beautifully. Very professional and thorough.', date: '2026-02-20' },
];

export const TIME_SLOTS = [
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM',
  '4:00 PM', '5:00 PM', '6:00 PM',
];
