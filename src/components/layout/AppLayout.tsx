import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { CompleteProfileModal } from '../CompleteProfileModal'
import { useAuth } from '../../contexts/AuthContext'

export function AppLayout() {
  const { user, isAuthenticated } = useAuth()
  const location = useLocation()
  const [showModal, setShowModal] = useState(false)
  const [hasShownModalOnLogin, setHasShownModalOnLogin] = useState(false)

  // Mostra modal automaticamente apenas uma vez após login se perfil incompleto
  useEffect(() => {
    if (
      isAuthenticated &&
      user &&
      !user.profileComplete &&
      !hasShownModalOnLogin &&
      location.pathname !== '/profile/complete' &&
      location.pathname !== '/login' &&
      location.pathname !== '/register'
    ) {
      // Aguarda 1 segundo para garantir que o usuário viu a página inicial
      const timer = setTimeout(() => {
        setShowModal(true)
        setHasShownModalOnLogin(true)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [isAuthenticated, user, hasShownModalOnLogin, location.pathname])

  return (
    <div className="min-h-screen bg-black">
      {/* Page Content */}
      <Outlet />

      {/* Complete Profile Modal - Mostra automaticamente após login */}
      <CompleteProfileModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        requireImmediate={false}
      />
    </div>
  )
}
