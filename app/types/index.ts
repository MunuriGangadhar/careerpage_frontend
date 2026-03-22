export interface BrandTheme {
  primaryColor: string; secondaryColor: string; accentColor: string;
  backgroundColor: string; textColor: string; fontFamily: string;
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
}
export interface ContentSection {
  id: string; type: 'about' | 'life' | 'values' | 'benefits' | 'team' | 'custom';
  title: string; content: string; visible: boolean; order: number;
}
export interface SocialLinks { linkedin?: string; twitter?: string; instagram?: string; facebook?: string; }
export interface Company {
  _id: string; name: string; slug: string; tagline: string; description: string;
  website: string; industry: string; size: string; founded: string; headquarters: string;
  logoUrl: string; bannerUrl: string; cultureVideoUrl: string;
  socialLinks: SocialLinks; brandTheme: BrandTheme; contentSections: ContentSection[];
  isPublished: boolean; createdAt: string; updatedAt: string;
}
export type WorkPolicy      = 'Remote' | 'Hybrid' | 'On-site';
export type EmploymentType  = 'Full time' | 'Part time' | 'Contract';
export type ExperienceLevel = 'Junior' | 'Mid-level' | 'Senior';
export type JobType         = 'Permanent' | 'Temporary' | 'Internship';
export interface Job {
  _id: string; companySlug: string; title: string; slug: string; department: string;
  location: string; workPolicy: WorkPolicy; employmentType: EmploymentType;
  experienceLevel: ExperienceLevel; jobType: JobType; salaryRange: string;
  description: string; responsibilities: string[]; requirements: string[];
  benefits: string[]; isActive: boolean; postedAt: string; createdAt: string; updatedAt: string;
}
export interface Pagination { total: number; page: number; limit: number; totalPages: number; }
export interface FilterOptions {
  locations: string[]; departments: string[]; workPolicies: string[];
  employmentTypes: string[]; experienceLevels: string[]; jobTypes: string[];
}
export interface JobsResponse { success: boolean; data: Job[]; pagination: Pagination; filterOptions: FilterOptions; }
export interface AuthUser { id: string; name: string; email: string; role: 'recruiter' | 'admin'; }
export interface AuthCompany { id: string; slug: string; name: string; isPublished: boolean; }