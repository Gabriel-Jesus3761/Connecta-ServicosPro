import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useRequireCompleteProfile } from '../hooks/useRequireCompleteProfile';

export function ProfileCompleteBanner() {
  const navigate = useNavigate();
  const { isComplete, completeness, missingFieldsLabels } = useRequireCompleteProfile();
  const [isDismissed, setIsDismissed] = useState(false);

  // Não mostra se perfil está completo ou se foi dismissed
  if (isComplete || isDismissed) {
    return null;
  }

  const handleComplete = () => {
    navigate('/profile/complete');
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    // Banner volta a aparecer após reload da página
  };

  return (
    <div className="bg-amber-50 border-b border-amber-200">
      <div className="max-w-7xl mx-auto py-3 px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between flex-wrap">
          <div className="w-0 flex-1 flex items-center">
            <span className="flex p-2 rounded-lg bg-amber-100">
              <ExclamationTriangleIcon className="h-6 w-6 text-amber-600" aria-hidden="true" />
            </span>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-amber-900">
                Complete seu perfil ({completeness}%)
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                Faltam {missingFieldsLabels.length}{' '}
                {missingFieldsLabels.length === 1 ? 'campo' : 'campos'} para desbloquear todas
                as funcionalidades
              </p>
            </div>
          </div>
          <div className="order-3 mt-2 flex-shrink-0 w-full sm:order-2 sm:mt-0 sm:w-auto">
            <button
              onClick={handleComplete}
              className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-amber-900 bg-amber-100 hover:bg-amber-200 transition-colors"
            >
              Completar agora
            </button>
          </div>
          <div className="order-2 flex-shrink-0 sm:order-3 sm:ml-3">
            <button
              type="button"
              onClick={handleDismiss}
              className="-mr-1 flex p-2 rounded-md hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-600 transition-colors"
            >
              <span className="sr-only">Dismiss</span>
              <XMarkIcon className="h-5 w-5 text-amber-600" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
