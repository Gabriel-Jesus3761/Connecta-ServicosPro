import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, CheckCircle, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRequireCompleteProfile } from '../hooks/useRequireCompleteProfile';

interface CompleteProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  /**
   * Se true, não permite fechar o modal (obriga completar perfil)
   * Se false, permite fechar e completar depois
   */
  requireImmediate?: boolean;
}

export function CompleteProfileModal({
  isOpen,
  onClose,
  requireImmediate = false,
}: CompleteProfileModalProps) {
  const navigate = useNavigate();
  const { completeness, missingFieldsLabels, totalRequired, totalFilled } =
    useRequireCompleteProfile();

  const handleCompleteNow = () => {
    onClose();
    navigate('/profile/complete');
  };

  const handleCompleteLater = () => {
    if (!requireImmediate) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={requireImmediate ? undefined : onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Complete seu perfil</h2>
                  <p className="text-sm text-gray-400">{completeness}% completo</p>
                </div>
              </div>
              {!requireImmediate && (
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              )}
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Progress Bar */}
              <div>
                <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${completeness}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {totalFilled} de {totalRequired} campos preenchidos
                </p>
              </div>

              {/* Message */}
              <p className="text-sm text-gray-300">
                {requireImmediate
                  ? 'Para continuar, precisamos que você complete algumas informações do seu perfil.'
                  : 'Para aproveitar melhor nossa plataforma, complete seu perfil com as informações abaixo:'}
              </p>

              {/* Missing Fields */}
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                <p className="text-sm font-medium text-amber-400 mb-3">
                  Campos necessários:
                </p>
                <ul className="space-y-2">
                  {missingFieldsLabels.map((label, index) => (
                    <li key={index} className="text-sm text-amber-300/90 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                      {label}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Benefits */}
              {!requireImmediate && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                  <p className="text-sm font-medium text-green-400 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Benefícios de completar seu perfil:
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm text-green-300/90">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Agendar serviços nas melhores barbearias</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-green-300/90">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Receber ofertas e promoções exclusivas</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-green-300/90">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Histórico completo de agendamentos</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-6 pt-0 flex gap-3">
              <button
                onClick={handleCompleteNow}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:opacity-90 text-white font-medium transition-opacity flex items-center justify-center gap-2"
              >
                <UserCircle className="w-5 h-5" />
                Completar agora
              </button>
              {!requireImmediate && (
                <button
                  onClick={handleCompleteLater}
                  className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-white hover:bg-white/5 font-medium transition-colors"
                >
                  Fazer depois
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
