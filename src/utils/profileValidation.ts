import { UserProfile, UserRole, ProfessionalProfile, OwnerProfile } from '../services/authService';

/**
 * Define os campos obrigatórios para cada role
 * IMPORTANTE: Foto do perfil (photoURL) é OPCIONAL
 */
const REQUIRED_FIELDS_BY_ROLE: Record<UserRole, string[]> = {
  client: [
    'displayName',
    'email',
    'phone',
    'cpf',
    'gender',
    'birthDate',
  ],
  professional: [
    'displayName',
    'email',
    'phone',
    'cpf',
    'gender',
    'birthDate',
  ],
  owner: [
    'displayName',
    'email',
    'phone',
    'cpf',
    'gender',
    'birthDate',
  ],
};

/**
 * Labels amigáveis para os campos
 */
export const FIELD_LABELS: Record<string, string> = {
  displayName: 'Nome completo',
  email: 'E-mail',
  phone: 'Telefone',
  cpf: 'CPF',
  gender: 'Gênero',
  birthDate: 'Data de nascimento',
  cnpj: 'CNPJ',
};

/**
 * Verifica quais campos obrigatórios estão faltando no perfil
 */
export function getMissingFields(profile: UserProfile, role?: UserRole): string[] {
  const activeRole = role || profile.activeRole;
  const requiredFields = REQUIRED_FIELDS_BY_ROLE[activeRole] || [];

  const missingFields: string[] = [];

  for (const field of requiredFields) {
    const value = (profile as any)[field];

    // Campo está faltando se for undefined, null, ou string vazia
    if (value === undefined || value === null || value === '') {
      missingFields.push(field);
    }
  }

  return missingFields;
}

/**
 * Calcula a porcentagem de completude do perfil
 */
export function calculateProfileCompleteness(profile: UserProfile, role?: UserRole): number {
  const activeRole = role || profile.activeRole;
  const requiredFields = REQUIRED_FIELDS_BY_ROLE[activeRole] || [];

  if (requiredFields.length === 0) {
    return 100;
  }

  const filledFields = requiredFields.filter(field => {
    const value = (profile as any)[field];
    return value !== undefined && value !== null && value !== '';
  });

  return Math.round((filledFields.length / requiredFields.length) * 100);
}

/**
 * Verifica se o perfil está completo
 */
export function isProfileComplete(profile: UserProfile, role?: UserRole): boolean {
  const missingFields = getMissingFields(profile, role);
  return missingFields.length === 0;
}

/**
 * Retorna informações completas sobre a completude do perfil
 */
export function getProfileCompletenessInfo(profile: UserProfile, role?: UserRole) {
  const missingFields = getMissingFields(profile, role);
  const completeness = calculateProfileCompleteness(profile, role);
  const isComplete = missingFields.length === 0;

  return {
    isComplete,
    completeness,
    missingFields,
    missingFieldsLabels: missingFields.map(field => FIELD_LABELS[field] || field),
    totalRequired: REQUIRED_FIELDS_BY_ROLE[role || profile.activeRole]?.length || 0,
    totalFilled: (REQUIRED_FIELDS_BY_ROLE[role || profile.activeRole]?.length || 0) - missingFields.length,
  };
}

/**
 * Campos obrigatórios específicos para Professional
 */
export const REQUIRED_PROFESSIONAL_FIELDS = ['cnpj'];

/**
 * Campos obrigatórios específicos para Owner
 */
export const REQUIRED_OWNER_FIELDS = ['cnpj'];

/**
 * Verifica se o perfil de profissional está completo
 */
export function isProfessionalProfileComplete(professionalProfile?: ProfessionalProfile): boolean {
  if (!professionalProfile) return false;

  // CNPJ pode ser opcional dependendo da regra de negócio
  // Por enquanto, apenas verifica se o perfil existe
  return true;
}

/**
 * Verifica se o perfil de proprietário está completo
 */
export function isOwnerProfileComplete(ownerProfile?: OwnerProfile): boolean {
  if (!ownerProfile) return false;

  // CNPJ pode ser opcional dependendo da regra de negócio
  // Por enquanto, apenas verifica se o perfil existe
  return true;
}
