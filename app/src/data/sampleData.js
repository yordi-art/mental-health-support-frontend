export const therapists = [
  {
    id: 1,
    name: 'Dr. Sarah Mengistu',
    specialization: 'Anxiety & Depression',
    rating: 4.9,
    reviews: 128,
    experience: 8,
    verified: true,
    available: true,
    avatar: 'https://i.pravatar.cc/150?img=47',
    bio: 'Specializes in CBT and mindfulness-based therapy for anxiety and depression.',
    price: 800,
  },
  {
    id: 2,
    name: 'Dr. Yonas Bekele',
    specialization: 'Trauma & PTSD',
    rating: 4.8,
    reviews: 94,
    experience: 12,
    verified: true,
    available: true,
    avatar: 'https://i.pravatar.cc/150?img=12',
    bio: 'Expert in trauma-focused therapy and EMDR for PTSD recovery.',
    price: 950,
  },
  {
    id: 3,
    name: 'Dr. Hana Tadesse',
    specialization: 'Stress & Burnout',
    rating: 4.7,
    reviews: 76,
    experience: 6,
    verified: true,
    available: false,
    avatar: 'https://i.pravatar.cc/150?img=32',
    bio: 'Helps professionals manage workplace stress and prevent burnout.',
    price: 750,
  },
];

export const appointments = [
  {
    id: 1,
    therapist: 'Dr. Sarah Mengistu',
    avatar: 'https://i.pravatar.cc/150?img=47',
    date: '2025-04-10',
    time: '10:00 AM',
    type: 'Video Session',
    status: 'upcoming',
  },
  {
    id: 2,
    therapist: 'Dr. Yonas Bekele',
    avatar: 'https://i.pravatar.cc/150?img=12',
    date: '2025-03-28',
    time: '2:00 PM',
    type: 'Video Session',
    status: 'completed',
  },
];

export const assessmentResults = [
  { id: 1, type: 'PHQ-9', score: 7, category: 'Mild Depression', date: '2025-03-20', recommendation: 'Consider speaking with a therapist.' },
  { id: 2, type: 'GAD-7', score: 5, category: 'Mild Anxiety', date: '2025-03-20', recommendation: 'Practice mindfulness and monitor symptoms.' },
];

export const notifications = [
  { id: 1, message: 'Your session with Dr. Sarah is tomorrow at 10:00 AM.', time: '2h ago', read: false },
  { id: 2, message: 'Assessment result is ready. View your PHQ-9 score.', time: '1d ago', read: false },
  { id: 3, message: 'Dr. Yonas confirmed your appointment.', time: '2d ago', read: true },
];

export const adminStats = {
  totalUsers: 1240,
  totalTherapists: 87,
  totalAppointments: 3420,
  totalRevenue: 2840000,
  flaggedVerifications: 4,
  pendingIssues: 7,
};

export const verificationQueue = [
  { id: 1, name: 'Dr. Abebe Girma', profession: 'Therapist', status: 'pending', confidence: null, submitted: '2025-04-05' },
  { id: 2, name: 'Dr. Liya Solomon', profession: 'Counselor', status: 'verified', confidence: 97, submitted: '2025-04-03' },
  { id: 3, name: 'Dr. Dawit Haile', profession: 'Therapist', status: 'flagged', confidence: 42, submitted: '2025-04-02' },
  { id: 4, name: 'Dr. Meron Alemu', profession: 'Counselor', status: 'failed', confidence: 18, submitted: '2025-04-01' },
];

export const testimonials = [
  { id: 1, name: 'Yordanos T.', text: 'This platform helped me find the right therapist within minutes. I feel so much better now.', avatar: 'https://i.pravatar.cc/150?img=5' },
  { id: 2, name: 'Biruk M.', text: 'The assessment was eye-opening. I had no idea I was dealing with anxiety until I took the PHQ-9.', avatar: 'https://i.pravatar.cc/150?img=8' },
  { id: 3, name: 'Selam G.', text: 'Knowing my therapist is system-verified gave me so much confidence. Highly recommend.', avatar: 'https://i.pravatar.cc/150?img=9' },
];
