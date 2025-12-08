import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
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
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={requireImmediate ? () => {} : onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <ExclamationTriangleIcon className="h-10 w-10 text-amber-500" />
                    </div>
                    <div>
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-medium leading-6 text-gray-900"
                      >
                        Complete seu perfil
                      </Dialog.Title>
                      <p className="text-sm text-gray-500 mt-1">
                        {completeness}% completo
                      </p>
                    </div>
                  </div>
                  {!requireImmediate && (
                    <button
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-500 transition-colors"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-primary-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${completeness}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {totalFilled} de {totalRequired} campos preenchidos
                  </p>
                </div>

                {/* Message */}
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    {requireImmediate
                      ? 'Para continuar, precisamos que você complete algumas informações do seu perfil.'
                      : 'Para aproveitar melhor nossa plataforma, complete seu perfil com as informações abaixo:'}
                  </p>

                  {/* Missing Fields */}
                  <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-amber-800 mb-2">
                      Campos necessários:
                    </p>
                    <ul className="space-y-1">
                      {missingFieldsLabels.map((label, index) => (
                        <li key={index} className="text-sm text-amber-700 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                          {label}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Benefits */}
                  {!requireImmediate && (
                    <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm font-medium text-green-800 mb-2 flex items-center gap-2">
                        <CheckCircleIcon className="h-5 w-5" />
                        Benefícios de completar seu perfil:
                      </p>
                      <ul className="space-y-1 text-sm text-green-700">
                        <li className="flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span>Agendar serviços nas melhores barbearias</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span>Receber ofertas e promoções exclusivas</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span>Histórico completo de agendamentos</span>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    className="flex-1 inline-flex justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 transition-colors"
                    onClick={handleCompleteNow}
                  >
                    Completar agora
                  </button>
                  {!requireImmediate && (
                    <button
                      type="button"
                      className="flex-1 inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 transition-colors"
                      onClick={handleCompleteLater}
                    >
                      Fazer depois
                    </button>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
