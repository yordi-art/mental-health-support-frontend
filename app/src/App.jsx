import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import HomePage from './pages/public/HomePage';

// Placeholder components
const RegisterPage = () => (
  <PublicLayout>
    <div className="min-h-screen bg-bg py-20 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-slate-800 mb-4">Register</h1>
        <p className="text-xl text-gray-600 mb-8">Registration form coming soon...</p>
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <p className="text-gray-600">This feature is under development.</p>
        </div>
      </div>
    </div>
  </PublicLayout>
);

const TherapistsPage = () => (
  <PublicLayout>
    <div className="min-h-screen bg-bg py-20 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-slate-800 mb-4">Find Therapists</h1>
        <p className="text-xl text-gray-600 mb-8">Browse verified therapists coming soon...</p>
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <p className="text-gray-600">This feature is under development.</p>
        </div>
      </div>
    </div>
  </PublicLayout>
);

const ContactPage = () => (
  <PublicLayout>
    <div className="min-h-screen bg-bg py-20 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-slate-800 mb-4">Contact Us</h1>
        <p className="text-xl text-gray-600 mb-8">Get in touch with our support team...</p>
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <p className="text-gray-600">This feature is under development.</p>
        </div>
      </div>
    </div>
  </PublicLayout>
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/therapists" element={<TherapistsPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
    </BrowserRouter>
  );
}
