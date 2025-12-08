import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  User,
  ArrowLeft,
  CreditCard,
  Calendar,
  Scissors,
  Crown,
  AlertCircle,
  CheckCircle,
  Send,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import {
  registerWithEmail,
  checkEmailExists,
  addRoleWithPassword,
} from "@/services/authService";
import type { UserRole } from "@/contexts/AuthContext";
import { getCountries, getCountryCallingCode } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import en from "react-phone-number-input/locale/en";
import flags from "react-phone-number-input/flags";
import {
  sanitizeString,
  isValidEmail,
  isValidCPF,
  isValidCNPJ,
  isValidPhone,
  isValidPassword,
  detectXSS,
  detectSQLInjection,
} from "@/lib/securityUtils";

export function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>("client");
  const [emailExists, setEmailExists] = useState(false);
  const [existingUserData, setExistingUserData] = useState<any>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [currentStep, setCurrentStep] = useState(1); // 1: Tipo de conta, 2: Dados pessoais, 3: Credenciais

  // Estados para dropdown customizado de países
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("BR");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showBirthDateCalendar, setShowBirthDateCalendar] = useState(false);
  const birthDateRef = useRef<HTMLDivElement>(null);
  const [birthDateInput, setBirthDateInput] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    cpf: "",
    phone: "",
    gender: "",
    birthDate: "",
    cnpj: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    cpf: "",
    phone: "",
    gender: "",
    birthDate: "",
    cnpj: "",
    general: "",
  });

  // Lista de países disponíveis
  const allCountries = getCountries();
  const filteredCountries = allCountries.filter((country) => {
    const countryName = en[country as keyof typeof en] || country;
    const countryCode = getCountryCallingCode(country as any);
    const searchLower = countrySearch.toLowerCase();
    return (
      countryName.toLowerCase().includes(searchLower) ||
      countryCode.includes(searchLower) ||
      country.toLowerCase().includes(searchLower)
    );
  });

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowCountryDropdown(false);
        setCountrySearch("");
      }
      if (
        birthDateRef.current &&
        !birthDateRef.current.contains(event.target as Node)
      ) {
        setShowBirthDateCalendar(false);
      }
    };

    if (showCountryDropdown || showBirthDateCalendar) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCountryDropdown, showBirthDateCalendar]);

  // Sincronizar input de data com formData
  useEffect(() => {
    if (formData.birthDate && !birthDateInput) {
      const [year, month, day] = formData.birthDate.split("-");
      setBirthDateInput(`${day}/${month}/${year}`);
    }
  }, [formData.birthDate, birthDateInput]);

  // Sincronizar calendário com data selecionada quando abrir
  useEffect(() => {
    if (showBirthDateCalendar && formData.birthDate) {
      const date = new Date(formData.birthDate + "T00:00:00");
      setSelectedYear(date.getFullYear());
      setSelectedMonth(date.getMonth());
    }
  }, [showBirthDateCalendar]);

  const formatCPF = (value: string) => {
    const cleanValue = value.replace(/\D/g, "");
    if (cleanValue.length <= 11) {
      return cleanValue
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }
    return value;
  };

  const formatCNPJ = (value: string) => {
    const cleanValue = value.replace(/\D/g, "");
    if (cleanValue.length <= 14) {
      return cleanValue
        .replace(/(\d{2})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1/$2")
        .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
    }
    return value;
  };

  // Funções para o calendário de data de nascimento
  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  const dayNames = ["D", "S", "T", "Q", "Q", "S", "S"];

  // Gerar lista de anos (dos últimos 100 anos até o ano atual)
  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= currentYear - 100; year--) {
      years.push(year);
    }
    return years;
  };

  const daysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const firstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = parseInt(e.target.value);
    setSelectedMonth(newMonth);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value);
    setSelectedYear(newYear);
  };

  const previousMonth = () => {
    let newMonth = selectedMonth - 1;
    let newYear = selectedYear;

    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    }

    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };

  const nextMonth = () => {
    let newMonth = selectedMonth + 1;
    let newYear = selectedYear;

    if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }

    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };

  const formatBirthDate = (value: string) => {
    // Remove tudo exceto números
    const cleanValue = value.replace(/\D/g, "");

    // Formata como DD/MM/AAAA
    if (cleanValue.length <= 2) {
      return cleanValue;
    } else if (cleanValue.length <= 4) {
      return `${cleanValue.slice(0, 2)}/${cleanValue.slice(2)}`;
    } else {
      return `${cleanValue.slice(0, 2)}/${cleanValue.slice(
        2,
        4
      )}/${cleanValue.slice(4, 8)}`;
    }
  };

  const handleBirthDateInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    const formatted = formatBirthDate(value);
    setBirthDateInput(formatted);

    // Se tiver formato completo DD/MM/AAAA, converte para formato ISO
    if (formatted.length === 10) {
      const [day, month, year] = formatted.split("/");
      const isoDate = `${year}-${month.padStart(2, "0")}-${day.padStart(
        2,
        "0"
      )}`;

      // Validar se é uma data válida
      const testDate = new Date(isoDate);
      if (!isNaN(testDate.getTime())) {
        setFormData((prev) => ({ ...prev, birthDate: isoDate }));
        if (errors.birthDate) {
          setErrors((prev) => ({ ...prev, birthDate: "" }));
        }
      }
    }
  };

  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(selectedYear, selectedMonth, day);
    const formattedDate = selectedDate.toISOString().split("T")[0];
    setFormData((prev) => ({ ...prev, birthDate: formattedDate }));

    // Atualizar o input visual também
    const [year, month, dayNum] = formattedDate.split("-");
    setBirthDateInput(`${dayNum}/${month}/${year}`);

    setShowBirthDateCalendar(false);
    if (errors.birthDate) {
      setErrors((prev) => ({ ...prev, birthDate: "" }));
    }
  };

  const isDateSelected = (day: number) => {
    if (!formData.birthDate) return false;
    const selectedDate = new Date(formData.birthDate + "T00:00:00");
    const checkDate = new Date(selectedYear, selectedMonth, day);
    return selectedDate.toDateString() === checkDate.toDateString();
  };

  const isFutureDate = (day: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(selectedYear, selectedMonth, day);
    return date > today;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      cpf: "",
      phone: "",
      gender: "",
      birthDate: "",
      cnpj: "",
      general: "",
    };

    // SEGURANÇA: Sanitizar inputs
    const sanitizedName = sanitizeString(formData.name);
    const sanitizedEmail = sanitizeString(formData.email);

    // Validar nome
    if (!sanitizedName) {
      newErrors.name = "Nome é obrigatório";
    } else if (sanitizedName.length < 2 || sanitizedName.length > 100) {
      newErrors.name = "Nome deve ter entre 2 e 100 caracteres";
    } else if (detectXSS(sanitizedName) || detectSQLInjection(sanitizedName)) {
      newErrors.name = "Nome contém caracteres inválidos";
    }

    // Validar email
    if (!sanitizedEmail) {
      newErrors.email = "Email é obrigatório";
    } else if (!isValidEmail(sanitizedEmail)) {
      newErrors.email = "Email inválido";
    } else if (detectXSS(sanitizedEmail)) {
      newErrors.email = "Email contém caracteres inválidos";
    }

    // Validar senha
    if (!formData.password) {
      newErrors.password = "Senha é obrigatória";
    } else if (!isValidPassword(formData.password)) {
      newErrors.password =
        "Senha deve ter no mínimo 8 caracteres, incluindo letras e números";
    }

    // Validar confirmação de senha
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirme sua senha";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "As senhas não coincidem";
    }

    // Validar CPF
    if (!formData.cpf) {
      newErrors.cpf = "CPF é obrigatório";
    } else if (!isValidCPF(formData.cpf)) {
      newErrors.cpf = "CPF inválido";
    }

    // Validar telefone
    if (!formData.phone) {
      newErrors.phone = "Telefone é obrigatório";
    } else if (!isValidPhone(formData.phone)) {
      newErrors.phone = "Telefone inválido";
    }

    // Validar gênero
    if (!formData.gender) {
      newErrors.gender = "Gênero é obrigatório";
    }

    // Validar data de nascimento
    if (!formData.birthDate) {
      newErrors.birthDate = "Data de nascimento é obrigatória";
    }

    // Validar CNPJ (opcional para profissionais e proprietários)
    if (
      (selectedRole === "owner" || selectedRole === "professional") &&
      formData.cnpj &&
      !isValidCNPJ(formData.cnpj)
    ) {
      newErrors.cnpj = "CNPJ inválido";
    }

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some((error) => error !== "");

    if (!hasErrors) {
      setIsLoading(true);
      try {
        // SEGURANÇA: Usar valores sanitizados
        const additionalData: any = {
          cpf: formData.cpf.replace(/\D/g, ""),
          phone: formData.phone, // PhoneInput já retorna no formato internacional completo
          gender: formData.gender,
          birthDate: formData.birthDate,
        };

        // Adiciona CNPJ se preenchido (opcional para proprietários e profissionais)
        if (
          formData.cnpj &&
          (selectedRole === "owner" || selectedRole === "professional")
        ) {
          additionalData.cnpj = formData.cnpj.replace(/\D/g, "");
        }

        await registerWithEmail(
          sanitizedEmail,
          formData.password,
          sanitizedName,
          selectedRole,
          additionalData
        );

        // Redirecionar para login com email e role pré-preenchidos
        navigate(
          `/login?email=${encodeURIComponent(
            formData.email
          )}&role=${selectedRole}`
        );
      } catch (error: any) {
        console.error("❌ Erro no registro:", error);
        setErrors((prev) => ({
          ...prev,
          general: error.message || "Erro ao criar conta. Tente novamente.",
        }));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // SEGURANÇA: Limitar tamanho dos inputs
    const maxLengths: Record<string, number> = {
      name: 100,
      email: 254,
      password: 128,
      confirmPassword: 128,
      cpf: 14,
      phone: 20,
      cnpj: 18,
      birthDate: 10,
    };

    let formattedValue = value;

    // Limitar tamanho
    if (maxLengths[name]) {
      formattedValue = formattedValue.substring(0, maxLengths[name]);
    }

    // Aplicar formatação
    if (name === "cpf") {
      formattedValue = formatCPF(formattedValue);
    } else if (name === "cnpj") {
      formattedValue = formatCNPJ(formattedValue);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));

    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "", general: "" }));
    }
  };

  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleNextStep = () => {
    // Validar campos da etapa atual antes de avançar
    if (currentStep === 1) {
      // Etapa 1: Tipo de conta já selecionado
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Validar dados pessoais
      const newErrors = {
        name: "",
        cpf: "",
        phone: "",
        gender: "",
        birthDate: "",
        cnpj: "",
      };

      // SEGURANÇA: Validar com funções seguras
      const sanitizedName = sanitizeString(formData.name);

      if (!sanitizedName) {
        newErrors.name = "Nome é obrigatório";
      } else if (
        detectXSS(sanitizedName) ||
        detectSQLInjection(sanitizedName)
      ) {
        newErrors.name = "Nome contém caracteres inválidos";
      }

      if (!formData.cpf) {
        newErrors.cpf = "CPF é obrigatório";
      } else if (!isValidCPF(formData.cpf)) {
        newErrors.cpf = "CPF inválido";
      }

      if (!formData.phone) {
        newErrors.phone = "Telefone é obrigatório";
      } else if (!isValidPhone(formData.phone)) {
        newErrors.phone = "Telefone inválido";
      }

      if (!formData.gender) newErrors.gender = "Gênero é obrigatório";
      if (!formData.birthDate)
        newErrors.birthDate = "Data de nascimento é obrigatória";

      if (
        (selectedRole === "professional" || selectedRole === "owner") &&
        formData.cnpj &&
        !isValidCNPJ(formData.cnpj)
      ) {
        newErrors.cnpj = "CNPJ inválido";
      }

      setErrors((prev) => ({ ...prev, ...newErrors }));

      const hasErrors = Object.values(newErrors).some((error) => error !== "");
      if (!hasErrors) {
        setCurrentStep(3);
      }
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleEmailBlur = async () => {
    const sanitizedEmail = sanitizeString(formData.email);
    if (sanitizedEmail && isValidEmail(sanitizedEmail)) {
      const result = await checkEmailExists(sanitizedEmail);
      if (result.exists && result.userData) {
        // Verifica se o usuário já possui o role selecionado
        if (result.userData.roles.includes(selectedRole)) {
          setErrors((prev) => ({
            ...prev,
            email: `Este email já está cadastrado como ${
              selectedRole === "client"
                ? "Cliente"
                : selectedRole === "professional"
                ? "Profissional"
                : "Proprietário"
            }. Faça login.`,
          }));
          setEmailExists(false);
        } else {
          setEmailExists(true);
          setExistingUserData(result.userData);
          setErrors((prev) => ({ ...prev, email: "" }));
        }
      } else {
        setEmailExists(false);
        setExistingUserData(null);
      }
    }
  };

  const handleUseExistingData = () => {
    if (existingUserData) {
      // Preenche os campos com os dados existentes
      setFormData((prev) => ({
        ...prev,
        name: existingUserData.displayName || prev.name,
        phone: existingUserData.phone || prev.phone, // PhoneInput gerencia o formato automaticamente
        cpf: existingUserData.cpf || prev.cpf,
        gender: existingUserData.gender || prev.gender,
        birthDate: existingUserData.birthDate || prev.birthDate,
      }));
      setShowPasswordModal(true);
    }
  };

  const handleConfirmPassword = async () => {
    setPasswordError("");
    setIsLoading(true);

    try {
      const cnpj = formData.cnpj || undefined;
      await addRoleWithPassword(
        formData.email,
        confirmPassword,
        selectedRole,
        cnpj
      );

      navigate(
        `/login?email=${encodeURIComponent(
          formData.email
        )}&role=${selectedRole}`
      );
    } catch (error: any) {
      setPasswordError(error.message || "Erro ao confirmar senha");
    } finally {
      setIsLoading(false);
    }
  };

  const roleOptions = [
    {
      value: "client" as UserRole,
      label: "Cliente",
      icon: User,
      color: "from-blue-500 to-blue-600",
      colors: {
        primary: "from-blue-500 to-blue-600",
        border: "border-blue-500",
        bg: "bg-blue-500",
        bgLight: "bg-blue-500/10",
        text: "text-blue-400",
        shadow: "shadow-blue-500/30",
        ring: "focus:ring-blue-500/30 focus:border-blue-500/50",
        glow: "rgba(59, 130, 246, 0.2)",
        cardShadow: "rgba(59, 130, 246, 0.15)",
        borderColor: "rgba(59, 130, 246, 0.3)",
      },
    },
    {
      value: "professional" as UserRole,
      label: "Profissional",
      icon: Scissors,
      color: "from-emerald-500 to-green-600",
      colors: {
        primary: "from-emerald-500 to-green-600",
        border: "border-emerald-500",
        bg: "bg-emerald-500",
        bgLight: "bg-emerald-500/10",
        text: "text-emerald-400",
        shadow: "shadow-emerald-500/30",
        ring: "focus:ring-emerald-500/30 focus:border-emerald-500/50",
        glow: "rgba(16, 185, 129, 0.2)",
        cardShadow: "rgba(16, 185, 129, 0.15)",
        borderColor: "rgba(16, 185, 129, 0.3)",
      },
    },
    {
      value: "owner" as UserRole,
      label: "Proprietário",
      icon: Crown,
      color: "from-gold to-yellow-600",
      colors: {
        primary: "from-gold to-yellow-600",
        border: "border-gold",
        bg: "bg-gold",
        bgLight: "bg-gold/10",
        text: "text-gold",
        shadow: "shadow-gold/30",
        ring: "focus:ring-gold/30 focus:border-gold/50",
        glow: "rgba(212, 175, 55, 0.2)",
        cardShadow: "rgba(212, 175, 55, 0.15)",
        borderColor: "rgba(212, 175, 55, 0.3)",
      },
    },
  ];

  const currentRoleOption = roleOptions.find((r) => r.value === selectedRole)!;
  const colors = currentRoleOption.colors;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Estilos globais para remover fundo branco do autocomplete */}
      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px transparent inset !important;
          box-shadow: 0 0 0 1000px transparent inset !important;
          -webkit-text-fill-color: white !important;
          transition: background-color 5000s ease-in-out 0s;
        }

        /* Custom scrollbar para dropdown de países */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        /* Estilos personalizados para PhoneInput */
        .phone-input-custom {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .phone-input-custom .PhoneInputInput {
          width: 100%;
          height: 44px;
          padding-left: 16px;
          padding-right: 16px;
          background-color: transparent !important;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: white;
          font-size: 14px;
          outline: none;
          transition: all 0.3s;
          -webkit-box-shadow: 0 0 0 1000px transparent inset !important;
          box-shadow: 0 0 0 1000px transparent inset !important;
        }

        .phone-input-custom .PhoneInputInput:focus {
          outline: none;
          border-color: ${colors.borderColor};
          box-shadow: 0 0 0 2px ${colors.glow};
        }

        .phone-input-custom .PhoneInputInput::placeholder {
          color: rgb(107, 114, 128);
        }

        .phone-input-custom.phone-input-error .PhoneInputInput {
          border-color: rgba(239, 68, 68, 0.5);
        }

        .phone-input-custom.phone-input-error .PhoneInputInput:focus {
          box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.3);
        }

        .phone-input-custom .PhoneInputCountry {
          display: flex;
          align-items: center;
          padding: 8px;
          margin: 0;
          margin-right: 8px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          height: 44px;
          cursor: pointer;
          position: relative;
          z-index: 10;
          transition: all 0.3s;
        }

        .phone-input-custom .PhoneInputCountry:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .phone-input-custom .PhoneInputCountry:focus {
          outline: 2px solid ${colors.borderColor};
          outline-offset: 2px;
        }

        .phone-input-custom .PhoneInputCountryIcon {
          width: 28px;
          height: 28px;
          border-radius: 4px;
          overflow: hidden;
          display: block;
          pointer-events: none;
        }

        .phone-input-custom .PhoneInputCountryIcon img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .phone-input-custom .PhoneInputCountrySelectArrow {
          opacity: 0.5;
          margin-left: 4px;
          border: solid white;
          border-width: 0 2px 2px 0;
          display: inline-block;
          padding: 3px;
          transform: rotate(45deg);
          -webkit-transform: rotate(45deg);
          pointer-events: none;
        }

        /* Select nativo do seletor de país - agora visível e clicável */
        .phone-input-custom .PhoneInputCountrySelect {
          appearance: auto;
          -webkit-appearance: auto;
          -moz-appearance: auto;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: white;
          cursor: pointer;
          font-size: 14px;
          padding: 4px 8px;
          outline: none;
          width: auto;
          height: auto;
          min-width: 80px;
          z-index: 11;
          transition: all 0.3s;
        }

        .phone-input-custom .PhoneInputCountrySelect:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .phone-input-custom .PhoneInputCountrySelect:focus {
          border-color: ${colors.borderColor};
          box-shadow: 0 0 0 2px ${colors.glow};
        }

        .phone-input-custom .PhoneInputCountrySelect option {
          background-color: rgb(31, 41, 55);
          color: white;
          padding: 12px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .phone-input-custom .PhoneInputCountrySelect option:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }

        /* Scrollbar customizado para o select */
        .phone-input-custom .PhoneInputCountrySelect::-webkit-scrollbar {
          width: 10px;
        }

        .phone-input-custom .PhoneInputCountrySelect::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          margin: 4px;
        }

        .phone-input-custom .PhoneInputCountrySelect::-webkit-scrollbar-thumb {
          background: ${colors.borderColor};
          border-radius: 10px;
          border: 2px solid rgba(31, 41, 55, 0.5);
        }

        .phone-input-custom .PhoneInputCountrySelect::-webkit-scrollbar-thumb:hover {
          background: ${colors.text};
          box-shadow: 0 0 6px ${colors.glow};
        }

        .PhoneInputCountrySelectOption {
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          color: white;
          transition: background-color 0.2s;
        }

        .PhoneInputCountrySelectOption:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }

        .PhoneInputCountrySelectOption--selected {
          background-color: rgba(255, 255, 255, 0.05);
        }

        /* Dropdown customizado com pesquisa */
        .custom-country-dropdown {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          right: 0;
          max-height: 320px;
          background: rgb(31, 41, 55);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          z-index: 9999;
          overflow: hidden;
        }

        .custom-country-search {
          position: sticky;
          top: 0;
          padding: 12px;
          background: rgb(31, 41, 55);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          z-index: 10;
        }

        .custom-country-search input {
          width: 100%;
          padding: 8px 12px 8px 36px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: white;
          font-size: 14px;
          outline: none;
          transition: all 0.3s;
        }

        .custom-country-search input:focus {
          border-color: ${colors.borderColor};
          box-shadow: 0 0 0 2px ${colors.glow};
        }

        .custom-country-search input::placeholder {
          color: rgb(107, 114, 128);
        }

        .custom-country-list {
          max-height: 256px;
          overflow-y: auto;
        }

        .custom-country-list::-webkit-scrollbar {
          width: 10px;
        }

        .custom-country-list::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          margin: 4px;
        }

        .custom-country-list::-webkit-scrollbar-thumb {
          background: ${colors.borderColor};
          border-radius: 10px;
          border: 2px solid rgba(31, 41, 55, 0.5);
        }

        .custom-country-list::-webkit-scrollbar-thumb:hover {
          background: ${colors.text};
          box-shadow: 0 0 6px ${colors.glow};
        }

        .custom-country-item {
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: background-color 0.2s;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .custom-country-item:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }

        .custom-country-item.selected {
          background-color: rgba(255, 255, 255, 0.05);
        }

        .custom-country-flag {
          width: 28px;
          height: 20px;
          border-radius: 4px;
          overflow: hidden;
          flex-shrink: 0;
        }

        .custom-country-info {
          flex: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: white;
          font-size: 14px;
        }

        .custom-country-code {
          color: rgb(156, 163, 175);
          font-size: 13px;
        }

        /* Estilos para bandeiras SVG */
        .w-6.h-6 svg,
        .w-7.h-7 svg {
          width: 100%;
          height: 100%;
          border-radius: 4px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }

        /* Estilos para o campo de data */
        .custom-date-input {
          color-scheme: dark;
        }

        .custom-date-input::-webkit-calendar-picker-indicator {
          cursor: pointer;
          filter: invert(1);
          opacity: 0.7;
          transition: all 0.3s ease;
          width: 20px;
          height: 20px;
        }

        .custom-date-input::-webkit-calendar-picker-indicator:hover {
          opacity: 1;
          filter: invert(1) brightness(1.2);
        }

        .custom-date-input:focus::-webkit-calendar-picker-indicator {
          opacity: 1;
        }

        /* Estilos para o placeholder do campo de data */
        .custom-date-input::-webkit-datetime-edit-text,
        .custom-date-input::-webkit-datetime-edit-month-field,
        .custom-date-input::-webkit-datetime-edit-day-field,
        .custom-date-input::-webkit-datetime-edit-year-field {
          color: white;
        }

        .custom-date-input::before {
          content: attr(placeholder);
          color: rgb(107, 114, 128);
          position: absolute;
        }

        .custom-date-input:focus::before,
        .custom-date-input:valid::before {
          display: none;
        }

        /* Calendário customizado de data de nascimento */
        .birth-date-calendar {
          position: absolute;
          bottom: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%);
          min-width: 340px;
          padding: 20px;
          border-radius: 16px;
          border: 2px solid ${colors.borderColor};
          background: #1f2937;
          box-shadow:
            0 25px 50px -12px rgba(0, 0, 0, 0.95),
            0 0 40px ${colors.glow},
            0 0 0 1px rgba(0, 0, 0, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
          z-index: 10000;
        }

        .birth-calendar-header {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;
        }

        .birth-calendar-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .birth-calendar-selectors {
          display: flex;
          gap: 8px;
          align-items: center;
          justify-content: center;
        }

        .birth-calendar-selector {
          flex: 1;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: white;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
          outline: none;
        }

        .birth-calendar-selector:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: ${colors.borderColor};
        }

        .birth-calendar-selector:focus {
          border-color: ${colors.borderColor};
          box-shadow: 0 0 0 2px ${colors.glow};
        }

        .birth-calendar-selector option {
          background: rgb(31, 41, 55);
          color: white;
        }

        .birth-calendar-nav-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgb(156, 163, 175);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;
        }

        .birth-calendar-nav-btn:hover {
          background: ${colors.borderColor};
          border-color: ${colors.borderColor};
          color: ${colors.text};
          transform: scale(1.1);
        }

        .birth-calendar-month {
          font-size: 16px;
          font-weight: 700;
          background: linear-gradient(to right, ${colors.text}, ${colors.borderColor});
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .birth-calendar-day-names {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
          margin-bottom: 12px;
        }

        .birth-calendar-day-name {
          text-align: center;
          font-size: 12px;
          font-weight: 600;
          padding: 8px;
          color: rgb(107, 114, 128);
        }

        .birth-calendar-day-name:first-child,
        .birth-calendar-day-name:last-child {
          color: ${colors.borderColor};
        }

        .birth-calendar-divider {
          height: 1px;
          background: linear-gradient(to right, transparent, ${colors.borderColor}, transparent);
          margin-bottom: 12px;
          opacity: 0.5;
        }

        .birth-calendar-days {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
        }

        .birth-calendar-day {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          color: white;
        }

        .birth-calendar-day:not(.disabled):not(.selected):hover {
          background: ${colors.borderColor};
          color: ${colors.text};
          transform: scale(1.1);
        }

        .birth-calendar-day.selected {
          background: transparent;
          color: white;
          border: 2.5px solid ${colors.borderColor};
          box-shadow:
            0 0 0 4px ${colors.glow},
            0 0 20px ${colors.glow},
            inset 0 0 20px ${colors.glow};
          font-weight: 700;
          transform: scale(1.05);
        }

        .birth-calendar-day.disabled {
          color: rgb(75, 85, 99);
          cursor: not-allowed;
          opacity: 0.5;
        }

        .birth-calendar-legend {
          margin-top: 16px;
          padding-top: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          font-size: 12px;
        }

        .birth-calendar-legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .birth-calendar-legend-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .birth-calendar-legend-dot.selected {
          background: transparent;
          border: 2px solid ${colors.borderColor};
          box-shadow: 0 0 0 2px ${colors.glow}, 0 0 8px ${colors.glow};
        }

        .birth-calendar-legend-text {
          color: rgb(107, 114, 128);
        }
      `}</style>

      {/* Background Effects */}
      <div className="absolute inset-0">
        <motion.div
          animate={{ backgroundColor: colors.glow }}
          transition={{ duration: 0.5 }}
          className="absolute top-1/4 -left-20 w-96 h-96 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ backgroundColor: colors.glow }}
          transition={{ duration: 0.5 }}
          className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full blur-3xl opacity-50"
        />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(212, 175, 55, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(212, 175, 55, 0.3) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <motion.div
          animate={{ borderColor: colors.borderColor }}
          transition={{ duration: 0.3 }}
          className="bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-3xl border shadow-2xl p-8"
          style={{ boxShadow: `0 25px 50px -12px ${colors.cardShadow}` }}
        >
          {/* Botão Voltar - Para Login */}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="absolute top-4 left-4 w-9 h-9 rounded-lg flex items-center justify-center bg-white/5 border border-white/10 hover:bg-white/10 transition-all z-10"
          >
            <ArrowLeft className="w-4 h-4 text-gray-400" />
          </button>

          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-1">Criar Conta</h1>
            <p className="text-gray-400 text-sm">
              {currentStep === 1 && "Selecione o tipo de conta"}
              {currentStep === 2 && "Informe seus dados pessoais"}
              {currentStep === 3 && "Crie suas credenciais de acesso"}
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2, 3].map((step) => (
              <motion.div key={step} className="flex items-center">
                <motion.div
                  animate={{
                    backgroundColor:
                      currentStep >= step
                        ? colors.glow
                        : "rgba(255, 255, 255, 0.1)",
                    scale: currentStep === step ? 1.2 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    currentStep >= step ? "text-white" : "text-gray-500"
                  }`}
                >
                  {step}
                </motion.div>
                {step < 3 && (
                  <motion.div
                    animate={{
                      backgroundColor:
                        currentStep > step
                          ? colors.glow
                          : "rgba(255, 255, 255, 0.1)",
                    }}
                    className="w-12 h-0.5 mx-1"
                  />
                )}
              </motion.div>
            ))}
          </div>

          {/* Aviso de conta existente */}
          {emailExists && existingUserData && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl"
            >
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-green-400">
                    Conta encontrada!
                  </p>
                  <p className="text-xs text-gray-300 mt-1">
                    Você já possui uma conta como{" "}
                    {existingUserData.roles
                      .map((r: string) =>
                        r === "client"
                          ? "Cliente"
                          : r === "professional"
                          ? "Profissional"
                          : "Proprietário"
                      )
                      .join(", ")}
                    . Clique abaixo para usar seus dados existentes.
                  </p>
                  <Button
                    type="button"
                    onClick={handleUseExistingData}
                    className="mt-3 w-full bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 h-10 font-medium"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Usar dados existentes
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm"
              >
                {errors.general}
              </motion.div>
            )}

            {/* Step Content */}
            <AnimatePresence mode="wait">
              {/* STEP 1: Role Selection */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Role Selection */}
                  <div className="relative mb-6">
                    <Label className="text-sm font-medium text-gray-300 mb-2 block">
                      Tipo de conta
                    </Label>
                    <div className="grid grid-cols-3 gap-3">
                      {roleOptions.map((option, index) => {
                        const Icon = option.icon;
                        const isSelected = selectedRole === option.value;

                        return (
                          <motion.button
                            key={option.value}
                            type="button"
                            onClick={() => handleSelectRole(option.value)}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{
                              opacity: isSelected ? 1 : 0.6,
                              y: 0,
                            }}
                            transition={{
                              delay: 0.08 * index,
                              duration: 0.3,
                            }}
                            whileHover={{
                              y: -5,
                              opacity: 1,
                              transition: {
                                type: "spring",
                                stiffness: 400,
                                damping: 10,
                              },
                            }}
                            className={`
                              p-3 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-2 relative overflow-hidden
                              ${
                                isSelected
                                  ? `${option.colors.bgLight} ${option.colors.border} shadow-lg ${option.colors.shadow}`
                                  : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
                              }
                            `}
                          >
                            {/* Efeito de brilho no hover */}
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                              initial={{ x: "-100%" }}
                              whileHover={{ x: "100%" }}
                              transition={{ duration: 0.6 }}
                            />

                            {/* Brilho contínuo de fundo para o selecionado */}
                            {isSelected && (
                              <motion.div
                                className={`absolute inset-0 bg-gradient-to-r ${option.colors.primary} opacity-0`}
                                animate={{
                                  opacity: [0, 0.15, 0],
                                  x: ["-100%", "100%"],
                                }}
                                transition={{
                                  duration: 2.5,
                                  repeat: Infinity,
                                  repeatDelay: 2,
                                  ease: "easeInOut",
                                }}
                              />
                            )}

                            <motion.div
                              className={`
                                rounded-xl flex items-center justify-center transition-all relative
                                bg-gradient-to-br ${option.colors.primary} ${option.colors.shadow}
                                w-14 h-14 shadow-xl
                              `}
                              whileHover={{
                                rotate: [0, -10, 10, -10, 0],
                                transition: { duration: 0.5 },
                              }}
                            >
                              <Icon
                                className={`${
                                  isSelected ? "w-7 h-7" : "w-6 h-6"
                                } text-white transition-all`}
                              />

                              {/* Pulso de luz */}
                              {isSelected && (
                                <motion.div
                                  className={`absolute inset-0 rounded-xl bg-gradient-to-br ${option.colors.primary} opacity-0`}
                                  animate={{
                                    opacity: [0, 0.5, 0],
                                    scale: [1, 1.2, 1],
                                  }}
                                  transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    repeatDelay: 1,
                                  }}
                                />
                              )}
                            </motion.div>

                            <p
                              className={`text-xs font-semibold transition-colors ${
                                isSelected ? "text-white" : "text-gray-400"
                              }`}
                            >
                              {option.label}
                            </p>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Navigation Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="relative"
                    >
                      <motion.div
                        className={`absolute -inset-0.5 bg-gradient-to-r ${colors.primary} rounded-xl opacity-0 blur`}
                        whileHover={{ opacity: 0.7 }}
                        transition={{ duration: 0.3 }}
                      />

                      <Button
                        type="button"
                        onClick={handleNextStep}
                        className={`w-full h-11 bg-gradient-to-r ${colors.primary} hover:opacity-90 text-white font-semibold rounded-xl shadow-lg ${colors.shadow} transition-all relative overflow-hidden`}
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          animate={{ x: ["-100%", "100%"] }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 1,
                            ease: "linear",
                          }}
                        />
                        <span className="relative z-10">Próximo</span>
                      </Button>
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}

              {/* STEP 2: Personal Data */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {/* Name Field */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="name"
                      className="text-sm font-medium text-gray-300"
                    >
                      Nome completo
                    </Label>
                    <div className="relative group">
                      <div className="pointer-events-none">
                        <User
                          className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-all duration-300 z-10 ${
                            formData.name ? colors.text : "text-gray-500"
                          }`}
                        />
                      </div>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Seu nome"
                        value={formData.name}
                        onChange={handleChange}
                        autoComplete="off"
                        style={{
                          backgroundColor: "transparent",
                          WebkitBoxShadow: "0 0 0 1000px transparent inset",
                        }}
                        className={`
                          w-full h-11 pl-12 pr-4 bg-transparent border rounded-xl text-white placeholder-gray-500
                          focus:outline-none focus:ring-2 transition-all duration-300
                          ${
                            errors.name
                              ? "border-red-500/50 focus:ring-red-500/30"
                              : `border-white/10 ${colors.ring}`
                          }
                        `}
                      />
                      <motion.div
                        className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r ${colors.primary} pointer-events-none`}
                        initial={{ width: 0 }}
                        animate={{ width: formData.name ? "100%" : 0 }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <AnimatePresence>
                      {errors.name && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="text-xs text-red-400"
                        >
                          {errors.name}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* CPF Field */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="cpf"
                      className="text-sm font-medium text-gray-300"
                    >
                      CPF
                    </Label>
                    <div className="relative group">
                      <div className="pointer-events-none">
                        <CreditCard
                          className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-all duration-300 z-10 ${
                            formData.cpf ? colors.text : "text-gray-500"
                          }`}
                        />
                      </div>
                      <input
                        id="cpf"
                        name="cpf"
                        type="text"
                        placeholder="000.000.000-00"
                        value={formData.cpf}
                        onChange={handleChange}
                        maxLength={14}
                        autoComplete="off"
                        style={{
                          backgroundColor: "transparent",
                          WebkitBoxShadow: "0 0 0 1000px transparent inset",
                        }}
                        className={`
                          w-full h-11 pl-12 pr-4 bg-transparent border rounded-xl text-white placeholder-gray-500
                          focus:outline-none focus:ring-2 transition-all duration-300
                          ${
                            errors.cpf
                              ? "border-red-500/50 focus:ring-red-500/30"
                              : `border-white/10 ${colors.ring}`
                          }
                        `}
                      />
                      <motion.div
                        className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r ${colors.primary} pointer-events-none`}
                        initial={{ width: 0 }}
                        animate={{ width: formData.cpf ? "100%" : 0 }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <AnimatePresence>
                      {errors.cpf && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="text-xs text-red-400"
                        >
                          {errors.cpf}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Phone Field with Custom Dropdown */}
                  <div
                    className="space-y-1.5"
                    style={{ position: "relative", zIndex: 20 }}
                    ref={dropdownRef}
                  >
                    <Label className="text-sm font-medium text-gray-300">
                      Telefone
                    </Label>
                    <div style={{ position: "relative" }}>
                      <div className="flex gap-2">
                        {/* Country Selector Button */}
                        <button
                          type="button"
                          onClick={() =>
                            setShowCountryDropdown(!showCountryDropdown)
                          }
                          className={`
                            flex items-center gap-2 px-3 h-11 bg-white/5 border rounded-xl
                            hover:bg-white/10 transition-all
                            ${
                              errors.phone
                                ? "border-red-500/50"
                                : `border-white/10 hover:border-white/20`
                            }
                          `}
                        >
                          <div className="w-6 h-6 flex items-center justify-center">
                            {(() => {
                              const Flag =
                                flags[selectedCountry as keyof typeof flags];
                              return Flag ? (
                                <Flag
                                  title={en[selectedCountry as keyof typeof en]}
                                />
                              ) : null;
                            })()}
                          </div>
                          <span className="text-white text-sm font-medium">
                            +{getCountryCallingCode(selectedCountry as any)}
                          </span>
                          <svg
                            className={`w-4 h-4 text-gray-400 transition-transform ${
                              showCountryDropdown ? "rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>

                        {/* Phone Number Input */}
                        <div className="relative flex-1">
                          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 z-10">
                            <Phone
                              className={`w-5 h-5 transition-all duration-300 ${
                                formData.phone ? colors.text : "text-gray-500"
                              }`}
                            />
                          </div>
                          <input
                            type="tel"
                            placeholder={
                              selectedCountry === "BR"
                                ? "(00) 00000-0000"
                                : selectedCountry === "US"
                                ? "(000) 000-0000"
                                : selectedCountry === "GB"
                                ? "00000 000000"
                                : "Phone number"
                            }
                            value={(() => {
                              if (!formData.phone) return "";

                              // Pega apenas os dígitos do telefone (sem o código do país)
                              const countryCode = getCountryCallingCode(
                                selectedCountry as any
                              );
                              const digitsOnly = formData.phone
                                .replace(/\D/g, "")
                                .replace(countryCode, "");

                              if (!digitsOnly) return "";

                              // Formatação manual por país
                              if (selectedCountry === "BR") {
                                if (digitsOnly.length <= 2) {
                                  return `(${digitsOnly}`;
                                } else if (digitsOnly.length <= 7) {
                                  return `(${digitsOnly.substring(
                                    0,
                                    2
                                  )}) ${digitsOnly.substring(2)}`;
                                } else if (digitsOnly.length <= 11) {
                                  return `(${digitsOnly.substring(
                                    0,
                                    2
                                  )}) ${digitsOnly.substring(
                                    2,
                                    7
                                  )}-${digitsOnly.substring(7)}`;
                                }
                              } else if (selectedCountry === "US") {
                                if (digitsOnly.length <= 3) {
                                  return `(${digitsOnly}`;
                                } else if (digitsOnly.length <= 6) {
                                  return `(${digitsOnly.substring(
                                    0,
                                    3
                                  )}) ${digitsOnly.substring(3)}`;
                                } else {
                                  return `(${digitsOnly.substring(
                                    0,
                                    3
                                  )}) ${digitsOnly.substring(
                                    3,
                                    6
                                  )}-${digitsOnly.substring(6, 10)}`;
                                }
                              }

                              return digitsOnly;
                            })()}
                            onChange={(e) => {
                              // Pega o valor digitado (pode conter símbolos)
                              const inputValue = e.target.value;

                              // Remove tudo exceto dígitos
                              const digitsOnly = inputValue.replace(/\D/g, "");

                              if (!digitsOnly) {
                                setFormData((prev) => ({ ...prev, phone: "" }));
                                return;
                              }

                              // Adiciona o código do país e formata
                              const countryCode = getCountryCallingCode(
                                selectedCountry as any
                              );
                              const fullPhone = `+${countryCode}${digitsOnly}`;

                              setFormData((prev) => ({
                                ...prev,
                                phone: fullPhone,
                              }));
                              if (errors.phone) {
                                setErrors((prev) => ({ ...prev, phone: "" }));
                              }
                            }}
                            className={`
                              w-full h-11 pl-12 pr-4 bg-transparent border rounded-xl text-white placeholder-gray-500
                              focus:outline-none focus:ring-2 transition-all
                              ${
                                errors.phone
                                  ? "border-red-500/50 focus:ring-red-500/30"
                                  : `border-white/10 ${colors.ring}`
                              }
                            `}
                            style={{
                              backgroundColor: "transparent",
                              WebkitBoxShadow: "0 0 0 1000px transparent inset",
                            }}
                          />
                          <motion.div
                            className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r ${colors.primary} pointer-events-none`}
                            initial={{ width: 0 }}
                            animate={{ width: formData.phone ? "100%" : 0 }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </div>

                      {/* Custom Dropdown */}
                      <AnimatePresence>
                        {showCountryDropdown && (
                          <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="custom-country-dropdown"
                          >
                            {/* Search Bar */}
                            <div className="custom-country-search">
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                  type="text"
                                  placeholder="Buscar país..."
                                  value={countrySearch}
                                  onChange={(e) =>
                                    setCountrySearch(e.target.value)
                                  }
                                  autoFocus
                                  onClick={(e) => e.stopPropagation()}
                                />
                                {countrySearch && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setCountrySearch("");
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Countries List */}
                            <div className="custom-country-list">
                              {filteredCountries.length > 0 ? (
                                filteredCountries.map((country) => {
                                  const Flag =
                                    flags[country as keyof typeof flags];
                                  const countryName =
                                    en[country as keyof typeof en] || country;
                                  return (
                                    <div
                                      key={country}
                                      onClick={() => {
                                        setSelectedCountry(country);
                                        const currentNumber =
                                          formData.phone.replace(/^\+\d+/, "");
                                        const newFullPhone = `+${getCountryCallingCode(
                                          country as any
                                        )}${currentNumber}`;
                                        setFormData((prev) => ({
                                          ...prev,
                                          phone: newFullPhone,
                                        }));
                                        setShowCountryDropdown(false);
                                        setCountrySearch("");
                                      }}
                                      className={`custom-country-item ${
                                        selectedCountry === country
                                          ? "selected"
                                          : ""
                                      }`}
                                    >
                                      <div className="w-7 h-7 flex items-center justify-center flex-shrink-0">
                                        {Flag && <Flag title={countryName} />}
                                      </div>
                                      <div className="custom-country-info">
                                        <span>{countryName}</span>
                                        <span className="custom-country-code">
                                          +
                                          {getCountryCallingCode(
                                            country as any
                                          )}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })
                              ) : (
                                <div className="p-8 text-center text-gray-400 text-sm">
                                  Nenhum país encontrado
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <AnimatePresence>
                      {errors.phone && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="text-xs text-red-400"
                        >
                          {errors.phone}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Gender and Birth Date in a row */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Gender Field */}
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="gender"
                        className="text-sm font-medium text-gray-300"
                      >
                        Gênero
                      </Label>
                      <select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className={`
                          w-full h-11 px-4 bg-white/5 border rounded-xl text-white
                          focus:outline-none focus:ring-2 transition-all
                          ${
                            errors.gender
                              ? "border-red-500/50 focus:ring-red-500/30"
                              : `border-white/10 ${colors.ring}`
                          }
                        `}
                      >
                        <option value="" className="bg-gray-800">
                          Selecione
                        </option>
                        <option value="masculino" className="bg-gray-800">
                          Masculino
                        </option>
                        <option value="feminino" className="bg-gray-800">
                          Feminino
                        </option>
                        <option value="outro" className="bg-gray-800">
                          Outro
                        </option>
                      </select>
                      {errors.gender && (
                        <p className="text-xs text-red-400">{errors.gender}</p>
                      )}
                    </div>

                    {/* Birth Date Field */}
                    <div
                      className="space-y-1.5"
                      style={{ position: "relative", zIndex: 10 }}
                      ref={birthDateRef}
                    >
                      <Label
                        htmlFor="birthDate"
                        className="text-sm font-medium text-gray-300"
                      >
                        Nascimento
                      </Label>
                      <div className="relative group">
                        {/* Ícone de calendário à esquerda */}
                        <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 z-10">
                          <Calendar
                            className={`w-5 h-5 transition-all duration-300 ${
                              formData.birthDate ? colors.text : "text-gray-500"
                            }`}
                          />
                        </div>

                        <input
                          type="text"
                          id="birthDate"
                          name="birthDate"
                          placeholder="dd/mm/aaaa"
                          value={birthDateInput}
                          onChange={handleBirthDateInputChange}
                          onFocus={() => setShowBirthDateCalendar(false)}
                          maxLength={10}
                          autoComplete="off"
                          style={{
                            backgroundColor: "transparent",
                            WebkitBoxShadow: "0 0 0 1000px transparent inset",
                          }}
                          className={`
                            w-full h-11 pl-12 pr-12 bg-transparent border rounded-xl text-white placeholder-gray-500
                            focus:outline-none focus:ring-2 transition-all duration-300
                            ${
                              errors.birthDate
                                ? "border-red-500/50 focus:ring-red-500/30"
                                : `border-white/10 ${colors.ring}`
                            }
                          `}
                        />

                        {/* Botão de calendário à direita */}
                        <button
                          type="button"
                          onClick={() =>
                            setShowBirthDateCalendar(!showBirthDateCalendar)
                          }
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-white/10 transition-all"
                        >
                          <svg
                            className={`w-4 h-4 transition-all duration-300 ${
                              showBirthDateCalendar
                                ? colors.text
                                : "text-gray-400"
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>

                        {/* Calendário customizado */}
                        <AnimatePresence>
                          {showBirthDateCalendar && (
                            <motion.div
                              initial={{ opacity: 0, y: -10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -10, scale: 0.95 }}
                              transition={{ duration: 0.2 }}
                              className="birth-date-calendar"
                            >
                              {/* Header */}
                              <div className="birth-calendar-header">
                                {/* Seletores de Mês e Ano */}
                                <div className="birth-calendar-selectors">
                                  <select
                                    value={selectedMonth}
                                    onChange={handleMonthChange}
                                    className="birth-calendar-selector"
                                  >
                                    {monthNames.map((month, index) => (
                                      <option key={index} value={index}>
                                        {month}
                                      </option>
                                    ))}
                                  </select>

                                  <select
                                    value={selectedYear}
                                    onChange={handleYearChange}
                                    className="birth-calendar-selector"
                                  >
                                    {generateYears().map((year) => (
                                      <option key={year} value={year}>
                                        {year}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {/* Navegação com Setas */}
                                <div className="birth-calendar-nav">
                                  <button
                                    type="button"
                                    onClick={previousMonth}
                                    className="birth-calendar-nav-btn"
                                  >
                                    <ChevronLeft className="w-5 h-5" />
                                  </button>

                                  <span className="text-gray-400 text-sm">
                                    {monthNames[selectedMonth]} {selectedYear}
                                  </span>

                                  <button
                                    type="button"
                                    onClick={nextMonth}
                                    className="birth-calendar-nav-btn"
                                  >
                                    <ChevronRight className="w-5 h-5" />
                                  </button>
                                </div>
                              </div>

                              {/* Day names */}
                              <div className="birth-calendar-day-names">
                                {dayNames.map((name, index) => (
                                  <div
                                    key={`${name}-${index}`}
                                    className="birth-calendar-day-name"
                                  >
                                    {name}
                                  </div>
                                ))}
                              </div>

                              {/* Divider */}
                              <div className="birth-calendar-divider" />

                              {/* Days */}
                              <div className="birth-calendar-days">
                                {(() => {
                                  const days = [];
                                  const totalDays = daysInMonth(
                                    selectedYear,
                                    selectedMonth
                                  );
                                  const firstDay = firstDayOfMonth(
                                    selectedYear,
                                    selectedMonth
                                  );

                                  // Empty cells for days before month starts
                                  for (let i = 0; i < firstDay; i++) {
                                    days.push(<div key={`empty-${i}`} />);
                                  }

                                  // Days of the month
                                  for (let day = 1; day <= totalDays; day++) {
                                    const selected = isDateSelected(day);
                                    const future = isFutureDate(day);

                                    days.push(
                                      <button
                                        key={day}
                                        type="button"
                                        onClick={() =>
                                          !future && handleDateSelect(day)
                                        }
                                        disabled={future}
                                        className={`
                                          birth-calendar-day
                                          ${selected ? "selected" : ""}
                                          ${future ? "disabled" : ""}
                                        `}
                                      >
                                        {day}
                                      </button>
                                    );
                                  }

                                  return days;
                                })()}
                              </div>

                              {/* Legend */}
                              <div className="birth-calendar-legend">
                                <div className="birth-calendar-legend-item">
                                  <div className="birth-calendar-legend-dot selected" />
                                  <span className="birth-calendar-legend-text">
                                    Selecionado
                                  </span>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <motion.div
                          className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r ${colors.primary} pointer-events-none`}
                          initial={{ width: 0 }}
                          animate={{ width: formData.birthDate ? "100%" : 0 }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <AnimatePresence>
                        {errors.birthDate && (
                          <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="text-xs text-red-400"
                          >
                            {errors.birthDate}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* CNPJ Field - Only for Professional and Owner */}
                  {(selectedRole === "professional" ||
                    selectedRole === "owner") && (
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="cnpj"
                        className="text-sm font-medium text-gray-300"
                      >
                        CNPJ{" "}
                        <span className="text-gray-500 text-xs">
                          (Opcional)
                        </span>
                      </Label>
                      <div className="relative group">
                        <div className="pointer-events-none">
                          <CreditCard
                            className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-all duration-300 z-10 ${
                              formData.cnpj ? colors.text : "text-gray-500"
                            }`}
                          />
                        </div>
                        <input
                          id="cnpj"
                          name="cnpj"
                          type="text"
                          placeholder="00.000.000/0000-00"
                          value={formData.cnpj}
                          onChange={handleChange}
                          maxLength={18}
                          autoComplete="off"
                          style={{
                            backgroundColor: "transparent",
                            WebkitBoxShadow: "0 0 0 1000px transparent inset",
                          }}
                          className={`
                            w-full h-11 pl-12 pr-4 bg-transparent border rounded-xl text-white placeholder-gray-500
                            focus:outline-none focus:ring-2 transition-all duration-300
                            ${
                              errors.cnpj
                                ? "border-red-500/50 focus:ring-red-500/30"
                                : `border-white/10 ${colors.ring}`
                            }
                          `}
                        />
                        <motion.div
                          className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r ${colors.primary} pointer-events-none`}
                          initial={{ width: 0 }}
                          animate={{ width: formData.cnpj ? "100%" : 0 }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <AnimatePresence>
                        {errors.cnpj && (
                          <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="text-xs text-red-400"
                          >
                            {errors.cnpj}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex gap-3 pt-2">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1"
                    >
                      <Button
                        type="button"
                        onClick={handlePreviousStep}
                        className="w-full h-11 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl border border-white/10 transition-all"
                      >
                        Voltar
                      </Button>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-[2] relative"
                    >
                      <motion.div
                        className={`absolute -inset-0.5 bg-gradient-to-r ${colors.primary} rounded-xl opacity-0 blur`}
                        whileHover={{ opacity: 0.7 }}
                        transition={{ duration: 0.3 }}
                      />
                      <Button
                        type="button"
                        onClick={handleNextStep}
                        className={`w-full h-11 bg-gradient-to-r ${colors.primary} hover:opacity-90 text-white font-semibold rounded-xl shadow-lg ${colors.shadow} transition-all relative overflow-hidden`}
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          animate={{ x: ["-100%", "100%"] }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 1,
                            ease: "linear",
                          }}
                        />
                        <span className="relative z-10">Próximo</span>
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Credentials */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {/* Email Field */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium text-gray-300"
                    >
                      Email
                    </Label>
                    <div className="relative group">
                      <div className="pointer-events-none">
                        <Mail
                          className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-all duration-300 z-10 ${
                            formData.email ? colors.text : "text-gray-500"
                          }`}
                        />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleEmailBlur}
                        autoComplete="off"
                        style={{
                          backgroundColor: "transparent",
                          WebkitBoxShadow: "0 0 0 1000px transparent inset",
                        }}
                        className={`
                          w-full h-11 pl-12 pr-4 bg-transparent border rounded-xl text-white placeholder-gray-500
                          focus:outline-none focus:ring-2 transition-all duration-300
                          ${
                            errors.email
                              ? "border-red-500/50 focus:ring-red-500/30"
                              : emailExists
                              ? `border-green-500/50 ${colors.ring}`
                              : `border-white/10 ${colors.ring}`
                          }
                        `}
                      />
                      <motion.div
                        className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r ${colors.primary} pointer-events-none`}
                        initial={{ width: 0 }}
                        animate={{ width: formData.email ? "100%" : 0 }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <AnimatePresence>
                      {errors.email && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="text-xs text-red-400"
                        >
                          {errors.email}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="password"
                      className="text-sm font-medium text-gray-300"
                    >
                      Senha
                    </Label>
                    <div className="relative group">
                      <div className="pointer-events-none">
                        <Lock
                          className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-all duration-300 z-10 ${
                            formData.password ? colors.text : "text-gray-500"
                          }`}
                        />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        autoComplete="off"
                        style={{
                          backgroundColor: "transparent",
                          WebkitBoxShadow: "0 0 0 1000px transparent inset",
                        }}
                        className={`
                          w-full h-11 pl-12 pr-12 bg-transparent border rounded-xl text-white placeholder-gray-500
                          focus:outline-none focus:ring-2 transition-all duration-300
                          ${
                            errors.password
                              ? "border-red-500/50 focus:ring-red-500/30"
                              : `border-white/10 ${colors.ring}`
                          }
                        `}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-300 z-20 ${
                          showPassword
                            ? colors.text
                            : "text-gray-500 hover:text-gray-300"
                        }`}
                      >
                        <AnimatePresence mode="wait">
                          {showPassword ? (
                            <motion.div
                              key="eyeoff"
                              initial={{ rotate: -180, opacity: 0 }}
                              animate={{ rotate: 0, opacity: 1 }}
                              exit={{ rotate: 180, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <EyeOff className="w-5 h-5" />
                            </motion.div>
                          ) : (
                            <motion.div
                              key="eye"
                              initial={{ rotate: -180, opacity: 0 }}
                              animate={{ rotate: 0, opacity: 1 }}
                              exit={{ rotate: 180, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Eye className="w-5 h-5" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </button>
                      <motion.div
                        className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r ${colors.primary} pointer-events-none`}
                        initial={{ width: 0 }}
                        animate={{ width: formData.password ? "100%" : 0 }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <AnimatePresence>
                      {errors.password && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="text-xs text-red-400"
                        >
                          {errors.password}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="confirmPassword"
                      className="text-sm font-medium text-gray-300"
                    >
                      Confirmar senha
                    </Label>
                    <div className="relative group">
                      <div className="pointer-events-none">
                        <Lock
                          className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-all duration-300 z-10 ${
                            formData.confirmPassword
                              ? colors.text
                              : "text-gray-500"
                          }`}
                        />
                      </div>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        autoComplete="off"
                        style={{
                          backgroundColor: "transparent",
                          WebkitBoxShadow: "0 0 0 1000px transparent inset",
                        }}
                        className={`
                          w-full h-11 pl-12 pr-12 bg-transparent border rounded-xl text-white placeholder-gray-500
                          focus:outline-none focus:ring-2 transition-all duration-300
                          ${
                            errors.confirmPassword
                              ? "border-red-500/50 focus:ring-red-500/30"
                              : `border-white/10 ${colors.ring}`
                          }
                        `}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-300 z-20 ${
                          showConfirmPassword
                            ? colors.text
                            : "text-gray-500 hover:text-gray-300"
                        }`}
                      >
                        <AnimatePresence mode="wait">
                          {showConfirmPassword ? (
                            <motion.div
                              key="eyeoff"
                              initial={{ rotate: -180, opacity: 0 }}
                              animate={{ rotate: 0, opacity: 1 }}
                              exit={{ rotate: 180, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <EyeOff className="w-5 h-5" />
                            </motion.div>
                          ) : (
                            <motion.div
                              key="eye"
                              initial={{ rotate: -180, opacity: 0 }}
                              animate={{ rotate: 0, opacity: 1 }}
                              exit={{ rotate: 180, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Eye className="w-5 h-5" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </button>
                      <motion.div
                        className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r ${colors.primary} pointer-events-none`}
                        initial={{ width: 0 }}
                        animate={{
                          width: formData.confirmPassword ? "100%" : 0,
                        }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <AnimatePresence>
                      {errors.confirmPassword && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="text-xs text-red-400"
                        >
                          {errors.confirmPassword}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Navigation & Submit Buttons */}
                  <div className="flex gap-3 pt-2">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1"
                    >
                      <Button
                        type="button"
                        onClick={handlePreviousStep}
                        className="w-full h-11 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl border border-white/10 transition-all"
                      >
                        Voltar
                      </Button>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-[2] relative"
                    >
                      <motion.div
                        className={`absolute -inset-0.5 bg-gradient-to-r ${colors.primary} rounded-xl opacity-0 blur`}
                        whileHover={{ opacity: 0.7 }}
                        transition={{ duration: 0.3 }}
                      />
                      <Button
                        type="submit"
                        className={`w-full h-11 bg-gradient-to-r ${colors.primary} hover:opacity-90 text-white font-semibold rounded-xl shadow-lg ${colors.shadow} transition-all relative overflow-hidden`}
                        disabled={isLoading}
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          animate={{ x: ["-100%", "100%"] }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 1,
                            ease: "linear",
                          }}
                        />
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          {isLoading ? (
                            <>
                              <motion.div
                                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                                animate={{ rotate: 360 }}
                                transition={{
                                  duration: 1,
                                  repeat: Infinity,
                                  ease: "linear",
                                }}
                              />
                              Criando conta...
                            </>
                          ) : (
                            <>
                              Criar conta
                              <motion.div
                                animate={{ x: [0, 3, 0], y: [0, -2, 0] }}
                                transition={{
                                  duration: 1,
                                  repeat: Infinity,
                                  repeatDelay: 1,
                                }}
                              >
                                <Send className="w-4 h-4" />
                              </motion.div>
                            </>
                          )}
                        </span>
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          {/* Login Link */}
          <motion.div
            className="mt-5 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <p className="text-xs text-gray-500">
              Já tem uma conta?{" "}
              <motion.button
                type="button"
                onClick={() => navigate("/login")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`font-semibold ${colors.text} hover:opacity-80 transition-colors relative inline-block`}
              >
                Faça login
                <motion.div
                  className={`absolute -bottom-0.5 left-0 h-0.5 bg-gradient-to-r ${colors.primary}`}
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.2 }}
                />
              </motion.button>
            </p>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Modal de Confirmação de Senha */}
      <AnimatePresence>
        {showPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPasswordModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-6"
            >
              {/* Header */}
              <div className="flex items-start gap-3 mb-6">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors.primary} flex items-center justify-center flex-shrink-0`}
                >
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white">
                    Confirmar Identidade
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Digite sua senha para adicionar o perfil de{" "}
                    <span className={colors.text}>
                      {selectedRole === "client"
                        ? "Cliente"
                        : selectedRole === "professional"
                        ? "Profissional"
                        : "Proprietário"}
                    </span>
                  </p>
                </div>
              </div>

              {/* Informações preenchidas */}
              <div className="mb-4 p-3 bg-white/5 rounded-xl border border-white/10">
                <p className="text-xs font-medium text-gray-400 mb-2">
                  Dados que serão utilizados:
                </p>
                <div className="space-y-1 text-sm text-white">
                  <p>✓ Nome: {formData.name}</p>
                  <p>✓ CPF: {formData.cpf}</p>
                  <p>✓ Telefone: {formData.phone}</p>
                  {formData.cnpj && <p>✓ CNPJ: {formData.cnpj}</p>}
                </div>
              </div>

              {/* Campo de senha */}
              <div className="space-y-2 mb-6">
                <Label
                  htmlFor="modal-password"
                  className="text-sm font-medium text-gray-300"
                >
                  Senha da conta existente
                </Label>
                <div className="relative">
                  <Lock
                    className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${colors.text}`}
                  />
                  <input
                    id="modal-password"
                    type="password"
                    placeholder="Digite sua senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleConfirmPassword()
                    }
                    className={`
                      w-full h-11 pl-12 pr-4 bg-white/5 border rounded-xl text-white placeholder-gray-500
                      focus:outline-none focus:ring-2 transition-all
                      ${
                        passwordError
                          ? "border-red-500/50 focus:ring-red-500/30"
                          : `border-white/10 ${colors.ring}`
                      }
                    `}
                    autoFocus
                  />
                </div>
                {passwordError && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-400 flex items-center gap-1"
                  >
                    <AlertCircle className="w-3 h-3" />
                    {passwordError}
                  </motion.p>
                )}
              </div>

              {/* Botões */}
              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setConfirmPassword("");
                    setPasswordError("");
                  }}
                  variant="outline"
                  className="flex-1 border-white/10 text-white hover:bg-white/5"
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirmPassword}
                  className={`flex-1 bg-gradient-to-r ${colors.primary} hover:opacity-90 text-white`}
                  disabled={isLoading || !confirmPassword}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Confirmando...
                    </div>
                  ) : (
                    "Confirmar"
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
