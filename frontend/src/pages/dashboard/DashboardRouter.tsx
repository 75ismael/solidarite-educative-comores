import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { VolunteerDashboard } from '../volunteer/VolunteerDashboard';
import { FamilyDashboard } from '../family/FamilyDashboard';
import { CoordinatorDashboard } from '../coordinator/CoordinatorDashboard';
import { SafeguardingDashboard } from '../safeguarding/SafeguardingDashboard';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class DashboardErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Erreur d'affichage du tableau de bord:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-xl mx-auto my-16 p-8 bg-white border border-rose-200 rounded-3xl shadow-sm text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Une interruption est survenue lors du chargement de votre espace
          </h2>
          <p className="text-xs text-slate-500">
            {this.state.error?.message || "Une erreur inattendue s'est produite lors de la synchronisation des données."}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-teal text-white text-xs font-bold hover:bg-teal-700 shadow transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser mon espace
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export const DashboardRouter: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-500 text-sm">
        Chargement de votre session...
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const renderDashboardByRole = () => {
    switch (user.role) {
      case 'VOLUNTEER':
        return <VolunteerDashboard />;
      case 'PARENT':
      case 'TEACHER':
        return <FamilyDashboard />;
      case 'COORDINATOR':
      case 'ADMIN':
        return <CoordinatorDashboard />;
      case 'SAFEGUARDING_OFFICER':
        return <SafeguardingDashboard />;
      case 'FINANCIAL_OFFICER':
        return <Navigate to="/transparence" replace />;
      default:
        return <FamilyDashboard />;
    }
  };

  return (
    <DashboardErrorBoundary>
      {renderDashboardByRole()}
    </DashboardErrorBoundary>
  );
};
