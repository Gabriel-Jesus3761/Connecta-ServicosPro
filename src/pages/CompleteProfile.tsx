import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User, Phone, Cake, CreditCard, CheckCircle, AlertCircle, UserCircle, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { getProfileCompletenessInfo } from '../utils/profileValidation';
import { motion, AnimatePresence } from 'framer-motion';

export function CompleteProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showBirthDateCalendar, setShowBirthDateCalendar] = useState(false);
  const birthDateRef = useRef<HTMLDivElement>(null);
  const [birthDateInput, setBirthDateInput] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    phone: user?.phone || '',
    cpf: user?.cpf || '',
    gender: user?.gender || '',
    birthDate: user?.birthDate || '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const completenessInfo = user ? getProfileCompletenessInfo(user as any) : null;

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        birthDateRef.current &&
        !birthDateRef.current.contains(event.target as Node)
      ) {
        setShowBirthDateCalendar(false);
      }
    };

    if (showBirthDateCalendar) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showBirthDateCalendar]);

  // Sync birthDate with input
  useEffect(() => {
    if (formData.birthDate && !birthDateInput) {
      const [year, month, day] = formData.birthDate.split("-");
      setBirthDateInput(`${day}/${month}/${year}`);
    }
  }, [formData.birthDate, birthDateInput]);

  // Sync calendar with selected date when opening
  useEffect(() => {
    if (showBirthDateCalendar && formData.birthDate) {
      const date = new Date(formData.birthDate + "T00:00:00");
      setSelectedYear(date.getFullYear());
      setSelectedMonth(date.getMonth());
    }
  }, [showBirthDateCalendar]);

  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || '',
        phone: user.phone || '',
        cpf: user.cpf || '',
        gender: user.gender || '',
        birthDate: user.birthDate || '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const limited = numbers.slice(0, 11);

    if (limited.length <= 3) return limited;
    if (limited.length <= 6) return `${limited.slice(0, 3)}.${limited.slice(3)}`;
    if (limited.length <= 9)
      return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6)}`;
    return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6, 9)}-${limited.slice(9)}`;
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const limited = numbers.slice(0, 11);

    if (limited.length <= 2) return limited;
    if (limited.length <= 7) return `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
    if (limited.length <= 10)
      return `(${limited.slice(0, 2)}) ${limited.slice(2, 6)}-${limited.slice(6)}`;
    return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`;
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setFormData(prev => ({ ...prev, cpf: formatted }));
    setError('');
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData(prev => ({ ...prev, phone: formatted }));
    setError('');
  };

  // Calendar functions
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handleDateSelect = (day: number) => {
    const month = String(selectedMonth + 1).padStart(2, "0");
    const dayStr = String(day).padStart(2, "0");
    const dateValue = `${selectedYear}-${month}-${dayStr}`;
    setFormData((prev) => ({ ...prev, birthDate: dateValue }));
    setBirthDateInput(`${dayStr}/${month}/${selectedYear}`);
    setShowBirthDateCalendar(false);
  };

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const handleBirthDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length >= 2) {
      value = value.slice(0, 2) + "/" + value.slice(2);
    }
    if (value.length >= 5) {
      value = value.slice(0, 5) + "/" + value.slice(5, 9);
    }
    setBirthDateInput(value);

    if (value.length === 10) {
      const [day, month, year] = value.split("/");
      const dateValue = `${year}-${month}-${day}`;
      setFormData((prev) => ({ ...prev, birthDate: dateValue }));
    }
  };

  const validateForm = (): boolean => {
    if (!formData.displayName || formData.displayName.trim().length < 3) {
      setError('Nome completo deve ter pelo menos 3 caracteres');
      return false;
    }

    const phoneNumbers = formData.phone.replace(/\D/g, '');
    if (phoneNumbers.length < 10) {
      setError('Telefone inválido');
      return false;
    }

    const cpfNumbers = formData.cpf.replace(/\D/g, '');
    if (cpfNumbers.length !== 11) {
      setError('CPF inválido');
      return false;
    }

    if (!formData.gender) {
      setError('Selecione seu gênero');
      return false;
    }

    if (!formData.birthDate) {
      setError('Data de nascimento é obrigatória');
      return false;
    }

    const birthDate = new Date(formData.birthDate);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    if (age < 13) {
      setError('Você precisa ter pelo menos 13 anos');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError('Usuário não autenticado');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const userRef = doc(db, 'users', user.uid);

      await updateDoc(userRef, {
        displayName: formData.displayName.trim(),
        phone: formData.phone,
        cpf: formData.cpf.replace(/\D/g, ''),
        gender: formData.gender,
        birthDate: formData.birthDate,
        profileComplete: true,
        updatedAt: serverTimestamp(),
      });

      setSuccess(true);

      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err: any) {
      console.error('Erro ao atualizar perfil:', err);
      setError(err.message || 'Erro ao atualizar perfil. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl text-center max-w-md"
        >
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Perfil completo!</h2>
          <p className="text-gray-400">Redirecionando...</p>
        </motion.div>
      </div>
    );
  }

  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
  const firstDay = getFirstDayOfMonth(selectedYear, selectedMonth);
  const today = new Date();
  const maxDate = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());

  const colors = {
    text: "text-amber-400",
    ring: "focus:ring-amber-500/30 focus:border-amber-500/50",
    primary: "from-amber-500 to-yellow-600",
    glow: "rgba(212, 175, 55, 0.2)",
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/4 -left-20 w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: colors.glow }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full blur-3xl opacity-50"
          style={{ backgroundColor: colors.glow }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl relative z-10"
      >
        <motion.div
          className="bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-6 sm:p-8"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <UserCircle className="w-10 h-10 text-amber-500" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Complete seu perfil</h1>
            <p className="text-gray-400">
              Preencha as informações abaixo para desbloquear todas as funcionalidades
            </p>

            {/* Progress */}
            {completenessInfo && (
              <div className="mt-6">
                <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${completenessInfo.completeness}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full"
                  />
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  {completenessInfo.completeness}% completo ({completenessInfo.totalFilled} de{' '}
                  {completenessInfo.totalRequired} campos)
                </p>
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome completo */}
            <motion.div
              className="space-y-1.5"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-300">
                Nome completo *
              </label>
              <div className="relative group">
                <div className="pointer-events-none">
                  <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-all duration-300 z-10 ${formData.displayName ? colors.text : 'text-gray-500'}`} />
                </div>
                <input
                  type="text"
                  name="displayName"
                  id="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  style={{
                    backgroundColor: 'transparent',
                    WebkitBoxShadow: '0 0 0 1000px transparent inset'
                  }}
                  className={`w-full h-11 pl-12 pr-4 bg-transparent border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300 border-white/10 ${colors.ring}`}
                  placeholder="Seu nome completo"
                  required
                />
                <motion.div
                  className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r ${colors.primary}`}
                  initial={{ width: 0 }}
                  animate={{ width: formData.displayName ? "100%" : 0 }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>

            {/* Telefone */}
            <motion.div
              className="space-y-1.5"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300">
                Telefone *
              </label>
              <div className="relative group">
                <div className="pointer-events-none">
                  <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-all duration-300 z-10 ${formData.phone ? colors.text : 'text-gray-500'}`} />
                </div>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  style={{
                    backgroundColor: 'transparent',
                    WebkitBoxShadow: '0 0 0 1000px transparent inset'
                  }}
                  className={`w-full h-11 pl-12 pr-4 bg-transparent border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300 border-white/10 ${colors.ring}`}
                  placeholder="(00) 00000-0000"
                  required
                />
                <motion.div
                  className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r ${colors.primary}`}
                  initial={{ width: 0 }}
                  animate={{ width: formData.phone ? "100%" : 0 }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>

            {/* CPF */}
            <motion.div
              className="space-y-1.5"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label htmlFor="cpf" className="block text-sm font-medium text-gray-300">
                CPF *
              </label>
              <div className="relative group">
                <div className="pointer-events-none">
                  <CreditCard className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-all duration-300 z-10 ${formData.cpf ? colors.text : 'text-gray-500'}`} />
                </div>
                <input
                  type="text"
                  name="cpf"
                  id="cpf"
                  value={formData.cpf}
                  onChange={handleCPFChange}
                  style={{
                    backgroundColor: 'transparent',
                    WebkitBoxShadow: '0 0 0 1000px transparent inset'
                  }}
                  className={`w-full h-11 pl-12 pr-4 bg-transparent border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300 border-white/10 ${colors.ring}`}
                  placeholder="000.000.000-00"
                  required
                />
                <motion.div
                  className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r ${colors.primary}`}
                  initial={{ width: 0 }}
                  animate={{ width: formData.cpf ? "100%" : 0 }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Gênero */}
              <motion.div
                className="space-y-1.5"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label htmlFor="gender" className="block text-sm font-medium text-gray-300">
                  Gênero *
                </label>
                <div className="relative group">
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    style={{
                      backgroundColor: 'transparent',
                      WebkitBoxShadow: '0 0 0 1000px transparent inset'
                    }}
                    className={`w-full h-11 px-4 bg-transparent border rounded-xl text-white focus:outline-none focus:ring-2 transition-all duration-300 border-white/10 ${colors.ring} appearance-none cursor-pointer`}
                    required
                  >
                    <option value="" className="bg-gray-800">Selecione</option>
                    <option value="male" className="bg-gray-800">Masculino</option>
                    <option value="female" className="bg-gray-800">Feminino</option>
                    <option value="other" className="bg-gray-800">Outro</option>
                    <option value="prefer-not-to-say" className="bg-gray-800">Prefiro não dizer</option>
                  </select>
                  <motion.div
                    className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r ${colors.primary}`}
                    initial={{ width: 0 }}
                    animate={{ width: formData.gender ? "100%" : 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </motion.div>

              {/* Data de nascimento */}
              <motion.div
                className="space-y-1.5"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                ref={birthDateRef}
              >
                <label htmlFor="birthDate" className="block text-sm font-medium text-gray-300">
                  Data de nascimento *
                </label>
                <div className="relative group">
                  <div className="pointer-events-none">
                    <Cake className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-all duration-300 z-10 ${formData.birthDate ? colors.text : 'text-gray-500'}`} />
                  </div>
                  <input
                    type="text"
                    value={birthDateInput}
                    onChange={handleBirthDateInputChange}
                    onClick={() => setShowBirthDateCalendar(true)}
                    style={{
                      backgroundColor: 'transparent',
                      WebkitBoxShadow: '0 0 0 1000px transparent inset'
                    }}
                    className={`w-full h-11 pl-12 pr-4 bg-transparent border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300 border-white/10 ${colors.ring} cursor-pointer`}
                    placeholder="DD/MM/AAAA"
                    maxLength={10}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowBirthDateCalendar(!showBirthDateCalendar)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-400 transition-colors"
                  >
                    <CalendarIcon className="w-5 h-5" />
                  </button>
                  <motion.div
                    className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r ${colors.primary}`}
                    initial={{ width: 0 }}
                    animate={{ width: formData.birthDate ? "100%" : 0 }}
                    transition={{ duration: 0.3 }}
                  />

                  {/* Custom Calendar */}
                  <AnimatePresence>
                    {showBirthDateCalendar && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full mt-2 left-0 right-0 bg-gray-800 border border-white/10 rounded-xl p-4 shadow-2xl z-50"
                      >
                        {/* Calendar Header */}
                        <div className="flex items-center justify-between mb-4">
                          <button
                            type="button"
                            onClick={handlePrevMonth}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          >
                            <ChevronLeft className="w-5 h-5 text-gray-400" />
                          </button>
                          <div className="text-center">
                            <div className="text-white font-medium">
                              {monthNames[selectedMonth]} {selectedYear}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleNextMonth}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            disabled={
                              selectedYear > maxDate.getFullYear() ||
                              (selectedYear === maxDate.getFullYear() &&
                                selectedMonth >= maxDate.getMonth())
                            }
                          >
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </button>
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(
                            (day) => (
                              <div
                                key={day}
                                className="text-center text-xs font-medium text-gray-500 py-2"
                              >
                                {day}
                              </div>
                            )
                          )}
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                          {Array.from({ length: firstDay }).map((_, i) => (
                            <div key={`empty-${i}`} />
                          ))}
                          {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const currentDate = new Date(
                              selectedYear,
                              selectedMonth,
                              day
                            );
                            const isDisabled = currentDate > maxDate;
                            const isSelected =
                              formData.birthDate ===
                              `${selectedYear}-${String(selectedMonth + 1).padStart(
                                2,
                                "0"
                              )}-${String(day).padStart(2, "0")}`;

                            return (
                              <button
                                key={day}
                                type="button"
                                onClick={() => !isDisabled && handleDateSelect(day)}
                                disabled={isDisabled}
                                className={`
                                  aspect-square p-2 text-sm rounded-lg transition-all
                                  ${
                                    isSelected
                                      ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-medium"
                                      : isDisabled
                                      ? "text-gray-600 cursor-not-allowed"
                                      : "text-gray-300 hover:bg-white/10"
                                  }
                                `}
                              >
                                {day}
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:opacity-90 text-white font-medium transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Salvar e continuar
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}
