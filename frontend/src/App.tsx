import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import { HomePage } from './pages/public/HomePage';
import { PublicMissionsPage } from './pages/public/PublicMissionsPage';
import { MissionDetailPage } from './pages/public/MissionDetailPage';
import { ArticlesPage } from './pages/public/ArticlesPage';
import { TransparencyPage } from './pages/public/TransparencyPage';
import { ApplyVolunteerPage } from './pages/public/ApplyVolunteerPage';
import { RequestSupportPage } from './pages/public/RequestSupportPage';
import { ConfidentialReportPage } from './pages/public/ConfidentialReportPage';
import { AboutPage } from './pages/public/AboutPage';
import { ProgramsPage } from './pages/public/ProgramsPage';
import { SafeguardingCharterPage } from './pages/public/SafeguardingCharterPage';
import { ContactPage } from './pages/public/ContactPage';
import { ImpactReportPage } from './pages/public/ImpactReportPage';
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardRouter } from './pages/dashboard/DashboardRouter';
import { MaintenancePage } from './pages/public/MaintenancePage';
import { PublishMissionPage } from './pages/public/PublishMissionPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="a-propos" element={<AboutPage />} />
            <Route path="programmes" element={<ProgramsPage />} />
            <Route path="charte-ethique" element={<SafeguardingCharterPage />} />
            <Route path="missions" element={<PublicMissionsPage />} />
            <Route path="missions/:id" element={<MissionDetailPage />} />
            <Route path="publier-mission" element={<PublishMissionPage />} />
            <Route path="actualites" element={<ArticlesPage />} />
            <Route path="transparence" element={<TransparencyPage />} />
            <Route path="rapport-impact" element={<ImpactReportPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="devenir-benevole" element={<ApplyVolunteerPage />} />
            <Route path="demande-soutien" element={<RequestSupportPage />} />
            <Route path="signalement-protection" element={<ConfidentialReportPage />} />
            <Route path="maintenance" element={<MaintenancePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="dashboard" element={<DashboardRouter />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
