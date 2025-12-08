import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getProfileCompletenessInfo } from '../utils/profileValidation';

/**
 * Hook para verificar e exigir perfil completo
 * Retorna informações sobre completude e função para mostrar modal
 */
export function useRequireCompleteProfile() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);

  // Calcula informações de completude
  const completenessInfo = user
    ? getProfileCompletenessInfo(user)
    : {
        isComplete: false,
        completeness: 0,
        missingFields: [],
        missingFieldsLabels: [],
        totalRequired: 0,
        totalFilled: 0,
      };

  /**
   * Mostra modal de completar perfil
   */
  const showCompletionModal = useCallback(() => {
    setShowModal(true);
  }, []);

  /**
   * Esconde modal de completar perfil
   */
  const hideCompletionModal = useCallback(() => {
    setShowModal(false);
  }, []);

  /**
   * Verifica se perfil está completo e mostra modal se não estiver
   * Retorna true se perfil está completo, false caso contrário
   */
  const requireCompleteProfile = useCallback(
    (customMessage?: string): boolean => {
      if (!completenessInfo.isComplete) {
        showCompletionModal();
        return false;
      }
      return true;
    },
    [completenessInfo.isComplete, showCompletionModal]
  );

  return {
    // Informações de completude
    isComplete: completenessInfo.isComplete,
    completeness: completenessInfo.completeness,
    missingFields: completenessInfo.missingFields,
    missingFieldsLabels: completenessInfo.missingFieldsLabels,
    totalRequired: completenessInfo.totalRequired,
    totalFilled: completenessInfo.totalFilled,

    // Controle do modal
    showModal,
    showCompletionModal,
    hideCompletionModal,

    // Função principal
    requireCompleteProfile,
  };
}
