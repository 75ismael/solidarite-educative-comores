export type UserRole =
  | 'VISITOR'
  | 'PARENT'
  | 'TEACHER'
  | 'VOLUNTEER'
  | 'COORDINATOR'
  | 'SAFEGUARDING_OFFICER'
  | 'FINANCIAL_OFFICER'
  | 'ADMIN';

export type Island = 'NGAZIDJA' | 'NDZUWANI' | 'MWALI' | 'FRANCE' | 'AUTRE';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  role_display: string;
  phone?: string;
  island: Island;
  island_display: string;
  city?: string;
  is_verified: boolean;
  safeguarding_signed: boolean;
  bio?: string;
  date_joined: string;
}

export interface Subject {
  id: number;
  name: string;
  category: string;
  is_active: boolean;
}

export interface Student {
  id: number;
  anonymous_code: string;
  first_name: string;
  last_name_initial: string;
  birth_year?: number;
  school_level: 'PRIMAIRE' | 'COLLEGE' | 'LYCEE';
  school_level_display: string;
  grade: string;
  island: Island;
  island_display: string;
  city: string;
  school_name?: string;
  parent: number;
  parental_consent_granted: boolean;
  consent_date: string;
  created_at: string;
}

export interface SupportRequest {
  id: number;
  student: number;
  student_details: Student;
  requested_by: number;
  subjects: number[];
  subjects_details: Subject[];
  difficulties_description: string;
  pedagogical_goals: string;
  format_preference: 'REMOTE' | 'IN_PERSON' | 'EITHER';
  format_preference_display: string;
  availabilities: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXAM';
  urgency_display: string;
  status: 'PENDING' | 'VALIDATED' | 'IN_MATCHING' | 'MATCHED' | 'CLOSED' | 'REJECTED' | 'REASSIGNMENT_REQUESTED';
  status_display: string;
  change_reason?: string;
  coordinator_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface VolunteerProfile {
  id: number;
  user: number;
  user_details: User;
  subjects: number[];
  subjects_details: Subject[];
  levels_can_teach: 'PRIMAIRE' | 'COLLEGE' | 'LYCEE' | 'TOUS';
  levels_can_teach_display: string;
  languages: string;
  profession_or_studies: string;
  experience: string;
  availabilities: string;
  hours_per_week: number;
  verification_status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  verification_status_display: string;
  is_available_for_new_student: boolean;
  created_at: string;
}

export interface PublicMission {
  id: number;
  title: string;
  subject: number;
  subject_name: string;
  school_level: string;
  island: string;
  city: string;
  format: 'REMOTE' | 'IN_PERSON' | 'EITHER';
  format_display: string;
  description: string;
  expected_commitment: string;
  status: 'OPEN' | 'FILLED' | 'CLOSED';
  status_display: string;
  deadline?: string;
  created_at: string;
  applications_count: number;
}

export interface LiaisonNote {
  id: number;
  pairing: number;
  author: number;
  author_name: string;
  author_role: string;
  message: string;
  created_at: string;
}

export interface LearningObjective {
  id: number;
  student: number;
  subject: number;
  subject_name?: string;
  description: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'ACHIEVED' | 'NEEDS_REVISION';
  status_display?: string;
  target_date?: string;
  evaluation_notes?: string;
  created_at?: string;
}

export interface Pairing {
  id: number;
  student: number;
  student_details: Student;
  volunteer: number;
  volunteer_details: User;
  coordinator?: number;
  coordinator_details?: User;
  subject: number;
  subject_details: Subject;
  support_request?: number;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED' | 'REASSIGNMENT_REQUESTED';
  status_display: string;
  change_reason?: string;
  start_date: string;
  end_date?: string;
  weekly_frequency: string;
  general_goals?: string;
  notes?: LiaisonNote[];
  created_at: string;
  updated_at: string;
}

export interface TutoringSession {
  id: number;
  pairing: number;
  pairing_details?: Pairing;
  title: string;
  scheduled_at: string;
  duration_minutes: number;
  mode: 'REMOTE' | 'IN_PERSON';
  mode_display: string;
  location_or_link: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'MISSED';
  status_display: string;
  cancellation_reason?: string;
  report?: SessionReport;
  created_at: string;
}

export interface SessionReport {
  id: number;
  session: number;
  attendance: 'PRESENT' | 'ABSENT_JUSTIFIED' | 'ABSENT_UNJUSTIFIED';
  attendance_display: string;
  duration_actual_minutes: number;
  topics_covered: string;
  exercises_done?: string;
  understanding_level: number;
  understanding_level_display: string;
  remaining_difficulties?: string;
  next_steps?: string;
  submitted_at: string;
}

export interface KeyMetric {
  id: number;
  label: string;
  value: string;
  icon: string;
  description?: string;
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  category: 'NEWS' | 'PEDAGOGY' | 'COMMUNITY';
  category_display: string;
  excerpt: string;
  content: string;
  image_url?: string;
  author_name: string;
  published_at: string;
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  quote: string;
  location: string;
}

export interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

export interface TransparencyData {
  total_donations_received_eur: number;
  total_expenses_eur: number;
  balance_eur: number;
  categories_breakdown: Array<{
    category: string;
    label: string;
    amount_eur: number;
    percentage: number;
  }>;
  active_campaign?: {
    title: string;
    description: string;
    target_amount_eur: number;
    current_amount_eur: number;
    progress_percentage: number;
  };
  recent_donations: Array<{
    id: number;
    donor_name: string;
    amount: string;
    currency: string;
    amount_eur: string;
    allocation: string;
    received_at: string;
  }>;
  recent_expenses: Array<{
    id: number;
    title: string;
    category_display: string;
    amount: string;
    currency: string;
    amount_eur: string;
    spent_at: string;
    receipt_reference: string;
  }>;
}

export interface Alert {
  id: number;
  alert_type: string;
  alert_type_display: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  severity_display: string;
  pairing?: number;
  student?: number;
  title: string;
  description: string;
  is_resolved: boolean;
  assigned_to?: number;
  assigned_to_name?: string;
  resolution_notes?: string;
  created_at: string;
  resolved_at?: string;
}

export interface Partner {
  id: number;
  name: string;
  category: 'INSTITUTIONAL' | 'EDUCATION' | 'ASSOCIATION' | 'CORPORATE' | 'TECH';
  category_display: string;
  logo_url?: string;
  website_url?: string;
  description?: string;
  order: number;
  is_active: boolean;
  created_at: string;
}

export interface Milestone {
  id: number;
  year: string;
  title: string;
  tag: string;
  description: string;
  order: number;
  is_active: boolean;
  created_at: string;
}

