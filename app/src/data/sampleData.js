export const therapists = [
  { id: 1, name: 'Dr. Sarah Mengistu', specialization: 'Anxiety & Depression', rating: 4.9, reviews: 128, experience: 8, verified: true, available: true, avatar: 'https://i.pravatar.cc/150?img=47', bio: 'Specializes in CBT and mindfulness-based therapy for anxiety and depression.', price: 800, languages: ['Amharic', 'English'], areas: ['Anxiety', 'Depression', 'Panic Attacks', 'Self-esteem'], authority: 'Ethiopian Health Authority' },
  { id: 2, name: 'Dr. Yonas Bekele', specialization: 'Trauma & PTSD', rating: 4.8, reviews: 94, experience: 12, verified: true, available: true, avatar: 'https://i.pravatar.cc/150?img=12', bio: 'Expert in trauma-focused therapy and EMDR for PTSD recovery.', price: 950, languages: ['Amharic', 'English', 'Oromiffa'], areas: ['Trauma', 'PTSD', 'Grief', 'Relationship Issues'], authority: 'Ethiopian Health Authority' },
  { id: 3, name: 'Dr. Hana Tadesse', specialization: 'Stress & Burnout', rating: 4.7, reviews: 76, experience: 6, verified: true, available: false, avatar: 'https://i.pravatar.cc/150?img=32', bio: 'Helps professionals manage workplace stress and prevent burnout.', price: 750, languages: ['Amharic', 'English'], areas: ['Stress', 'Burnout', 'Work-Life Balance', 'Mindfulness'], authority: 'Ethiopian Health Authority' },
  { id: 4, name: 'Dr. Kebede Alemu', specialization: 'Child & Adolescent', rating: 4.6, reviews: 55, experience: 9, verified: true, available: true, avatar: 'https://i.pravatar.cc/150?img=15', bio: 'Dedicated to supporting children and teens through emotional challenges.', price: 700, languages: ['Amharic', 'English'], areas: ['Child Therapy', 'Adolescent Issues', 'Family Conflict', 'ADHD'], authority: 'Ethiopian Health Authority' },
];

export const appointments = [
  { id: 1, therapist: 'Dr. Sarah Mengistu', therapistId: 1, avatar: 'https://i.pravatar.cc/150?img=47', date: '2025-04-10', time: '10:00 AM', type: 'Video Session', status: 'upcoming', fee: 800 },
  { id: 2, therapist: 'Dr. Yonas Bekele', therapistId: 2, avatar: 'https://i.pravatar.cc/150?img=12', date: '2025-03-28', time: '2:00 PM', type: 'Video Session', status: 'completed', fee: 950 },
  { id: 3, therapist: 'Dr. Sarah Mengistu', therapistId: 1, avatar: 'https://i.pravatar.cc/150?img=47', date: '2025-03-10', time: '11:00 AM', type: 'Video Session', status: 'completed', fee: 800 },
];

export const assessmentResults = [
  { id: 1, type: 'PHQ-9', score: 7, category: 'Mild Depression', date: '2025-03-20', recommendation: 'Consider speaking with a therapist for additional support.' },
  { id: 2, type: 'GAD-7', score: 5, category: 'Mild Anxiety', date: '2025-03-20', recommendation: 'Practice mindfulness and monitor your symptoms over time.' },
  { id: 3, type: 'PHQ-9', score: 11, category: 'Moderate Depression', date: '2025-02-10', recommendation: 'We recommend scheduling a session with a therapist soon.' },
];

export const notifications = [
  { id: 1, type: 'appointment', message: 'Your session with Dr. Sarah is tomorrow at 10:00 AM.', time: '2h ago', read: false },
  { id: 2, type: 'assessment', message: 'Your PHQ-9 result is ready. View your wellness summary.', time: '1d ago', read: false },
  { id: 3, type: 'appointment', message: 'Dr. Yonas confirmed your appointment for March 28.', time: '2d ago', read: true },
  { id: 4, type: 'payment', message: 'Payment of ETB 950 was successful for your last session.', time: '3d ago', read: true },
  { id: 5, type: 'tip', message: 'Wellness tip: Taking 5 deep breaths can reduce anxiety in minutes.', time: '4d ago', read: true },
];

export const payments = [
  { id: 1, therapist: 'Dr. Sarah Mengistu', date: '2025-04-10', amount: 800, status: 'pending', type: 'Video Session' },
  { id: 2, therapist: 'Dr. Yonas Bekele', date: '2025-03-28', amount: 950, status: 'paid', type: 'Video Session' },
  { id: 3, therapist: 'Dr. Sarah Mengistu', date: '2025-03-10', amount: 800, status: 'paid', type: 'Video Session' },
];

export const reviews = [
  { id: 1, therapist: 'Dr. Yonas Bekele', therapistId: 2, avatar: 'https://i.pravatar.cc/150?img=12', rating: 5, text: 'Very understanding and professional. I felt heard for the first time.', date: '2025-03-29' },
  { id: 2, therapist: 'Dr. Sarah Mengistu', therapistId: 1, avatar: 'https://i.pravatar.cc/150?img=47', rating: 5, text: 'The CBT techniques she shared were incredibly helpful.', date: '2025-03-11' },
];

export const adminStats = {
  totalUsers: 1240, totalTherapists: 87, totalAppointments: 3420,
  totalRevenue: 2840000, flaggedVerifications: 4, pendingIssues: 7,
};

export const verificationQueue = [
  { id: 1, name: 'Dr. Abebe Girma', profession: 'Therapist', status: 'pending', confidence: null, submitted: '2025-04-05', licenseNumber: 'ETH-PSY-2024-0041', authority: 'Ethiopian Health Authority', expiry: '2027-01-01', flagReason: null },
  { id: 2, name: 'Dr. Liya Solomon', profession: 'Counselor', status: 'verified', confidence: 97, submitted: '2025-04-03', licenseNumber: 'ETH-CNS-2023-0188', authority: 'Ethiopian Health Authority', expiry: '2026-06-15', flagReason: null },
  { id: 3, name: 'Dr. Dawit Haile', profession: 'Therapist', status: 'flagged', confidence: 42, submitted: '2025-04-02', licenseNumber: 'ETH-PSY-2022-0077', authority: 'Unknown Authority', expiry: '2024-12-01', flagReason: 'License appears expired. Issuing authority not recognized.' },
  { id: 4, name: 'Dr. Meron Alemu', profession: 'Counselor', status: 'failed', confidence: 18, submitted: '2025-04-01', licenseNumber: 'ETH-CNS-2021-0033', authority: 'Ethiopian Health Authority', expiry: '2025-03-01', flagReason: 'Document unreadable. License number mismatch.' },
];

export const adminReports = [
  { id: 1, title: 'Session not started on time', user: 'Biruk M.', type: 'session', severity: 'medium', date: '2025-04-06', status: 'open' },
  { id: 2, title: 'Payment not reflected in account', user: 'Hana T.', type: 'payment', severity: 'high', date: '2025-04-05', status: 'open' },
  { id: 3, title: 'Therapist was unresponsive during session', user: 'Dawit A.', type: 'session', severity: 'high', date: '2025-04-04', status: 'investigating' },
  { id: 4, title: 'Inappropriate message from therapist', user: 'Selam G.', type: 'abuse', severity: 'high', date: '2025-04-03', status: 'resolved' },
];

export const testimonials = [
  { id: 1, name: 'Yordanos T.', text: 'This platform helped me find the right therapist within minutes. I feel so much better now.', avatar: 'https://i.pravatar.cc/150?img=5' },
  { id: 2, name: 'Biruk M.', text: 'The assessment was eye-opening. I had no idea I was dealing with anxiety until I took the PHQ-9.', avatar: 'https://i.pravatar.cc/150?img=8' },
  { id: 3, name: 'Selam G.', text: 'Knowing my therapist is system-verified gave me so much confidence. Highly recommend.', avatar: 'https://i.pravatar.cc/150?img=9' },
];
