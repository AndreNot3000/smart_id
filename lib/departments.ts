/**
 * Comprehensive list of academic departments found across Nigerian
 * universities, organized by faculty. Used to populate department dropdowns
 * when creating students, lecturers and courses.
 *
 * Rendered as grouped <optgroup> options so the long list stays scannable.
 * Department names are deduplicated within their faculty; a few departments
 * legitimately appear under more than one faculty (e.g. Biochemistry) — that
 * is intentional and reflects how Nigerian institutions organize them.
 */
export interface FacultyDepartments {
  faculty: string;
  departments: string[];
}

export const DEPARTMENTS_BY_FACULTY: FacultyDepartments[] = [
  {
    faculty: "Administration & Management Sciences",
    departments: [
      "Accounting",
      "Actuarial Science",
      "Banking and Finance",
      "Business Administration",
      "Cooperative and Rural Development",
      "Entrepreneurship",
      "Finance",
      "Human Resource Management",
      "Insurance",
      "Marketing",
      "Procurement and Supply Chain Management",
      "Project Management",
      "Public Administration",
      "Taxation",
      "Tourism and Hospitality Management",
    ],
  },
  {
    faculty: "Agriculture",
    departments: [
      "Agricultural Economics",
      "Agricultural Extension and Rural Development",
      "Agronomy",
      "Animal Science",
      "Aquaculture and Fisheries Management",
      "Crop Science",
      "Fisheries",
      "Food Science and Technology",
      "Forestry and Wildlife Management",
      "Home Science and Management",
      "Horticulture",
      "Soil Science",
    ],
  },
  {
    faculty: "Arts & Humanities",
    departments: [
      "Archaeology",
      "Christian Religious Studies",
      "Creative Arts",
      "English and Literary Studies",
      "Fine and Applied Arts",
      "French",
      "History and International Studies",
      "Igbo",
      "Islamic Studies",
      "Linguistics",
      "Music",
      "Philosophy",
      "Religious Studies",
      "Theatre and Film Studies",
      "Yoruba",
    ],
  },
  {
    faculty: "Basic Medical Sciences",
    departments: [
      "Anatomy",
      "Biochemistry",
      "Human Physiology",
      "Medical Laboratory Science",
      "Pharmacology",
      "Physiology",
    ],
  },
  {
    faculty: "Communication & Media Studies",
    departments: [
      "Broadcasting",
      "Film and Multimedia",
      "Journalism",
      "Mass Communication",
      "Public Relations and Advertising",
    ],
  },
  {
    faculty: "Computing & Information Technology",
    departments: [
      "Computer Science",
      "Cyber Security",
      "Data Science",
      "Information and Communication Technology",
      "Information Systems",
      "Information Technology",
      "Software Engineering",
    ],
  },
  {
    faculty: "Education",
    departments: [
      "Adult and Non-Formal Education",
      "Early Childhood Education",
      "Educational Administration and Planning",
      "Educational Foundations",
      "Guidance and Counselling",
      "Health Education",
      "Human Kinetics and Health Education",
      "Library and Information Science",
      "Physical and Health Education",
      "Science Education",
      "Special Education",
      "Vocational and Technical Education",
    ],
  },
  {
    faculty: "Engineering & Technology",
    departments: [
      "Aeronautical Engineering",
      "Agricultural and Bio-resources Engineering",
      "Biomedical Engineering",
      "Chemical Engineering",
      "Civil Engineering",
      "Computer Engineering",
      "Electrical Engineering",
      "Electronics and Communication Engineering",
      "Marine Engineering",
      "Materials and Metallurgical Engineering",
      "Mechanical Engineering",
      "Mechatronics Engineering",
      "Petroleum and Gas Engineering",
      "Production Engineering",
      "Structural Engineering",
      "Systems Engineering",
      "Telecommunications Engineering",
    ],
  },
  {
    faculty: "Environmental Sciences",
    departments: [
      "Architecture",
      "Building",
      "Estate Management",
      "Fine Arts and Design",
      "Geography and Planning",
      "Quantity Surveying",
      "Surveying and Geoinformatics",
      "Urban and Regional Planning",
    ],
  },
  {
    faculty: "Law",
    departments: [
      "Commercial and Industrial Law",
      "International Law and Jurisprudence",
      "Private and Property Law",
      "Public Law",
    ],
  },
  {
    faculty: "Medicine & Health Sciences",
    departments: [
      "Dentistry",
      "Medicine and Surgery",
      "Nursing Science",
      "Optometry",
      "Physiotherapy",
      "Public Health",
      "Radiography",
    ],
  },
  {
    faculty: "Pharmaceutical Sciences",
    departments: [
      "Clinical Pharmacy",
      "Pharmaceutical Chemistry",
      "Pharmaceutics",
      "Pharmacognosy",
      "Pharmacy",
    ],
  },
  {
    faculty: "Sciences",
    departments: [
      "Applied Geophysics",
      "Biology",
      "Biotechnology",
      "Botany",
      "Chemistry",
      "Geology",
      "Industrial Chemistry",
      "Mathematics",
      "Microbiology",
      "Physics",
      "Statistics",
      "Zoology",
    ],
  },
  {
    faculty: "Social Sciences",
    departments: [
      "Criminology and Security Studies",
      "Demography and Social Statistics",
      "Economics",
      "International Relations",
      "Political Science",
      "Psychology",
      "Social Work",
      "Sociology",
    ],
  },
  {
    faculty: "Veterinary Medicine",
    departments: [
      "Veterinary Anatomy",
      "Veterinary Medicine",
      "Veterinary Surgery",
    ],
  },
];

/** Flat, de-duplicated, alphabetically sorted list of every department. */
export const ALL_DEPARTMENTS: string[] = Array.from(
  new Set(DEPARTMENTS_BY_FACULTY.flatMap((f) => f.departments)),
).sort((a, b) => a.localeCompare(b));
