import { getCollection } from "astro:content";

// Helper function to parse dates
export function parseDate(value: unknown): Date | null {
  if (!value) return null;
  if (typeof value === 'string') return new Date(value);
  if (value instanceof Date) return value;
  return null;
}

// Helper function to sort by date descending
export function sortByDateDesc(a: any, b: any): number {
  const dateA = parseDate(a.data.dateEnd || a.data.date);
  const dateB = parseDate(b.data.dateEnd || b.data.date);

  if (!dateA && !dateB) return 0;
  if (!dateA) return 1;
  if (!dateB) return -1;

  return dateB.getTime() - dateA.getTime();
}

// Helper function to format work dates
export function formatWorkDate(input: string | Date | undefined): string {
  if (!input) return "Present";
  if (typeof input === "string") return input;
  const month = new Date(input).toLocaleDateString("en-US", { month: "short" });
  const year = new Date(input).getFullYear();
  return `${month} ${year}`;
}

// Get latest posts
export async function getLatestPosts(limit: number = 3) {
  return (await getCollection("blog"))
    .filter(post => !post.data.draft)
    .sort(sortByDateDesc)
    .slice(0, limit);
}

// Get latest projects
export async function getLatestProjects(limit: number = 3) {
  return (await getCollection("projects"))
    .filter(project => !project.data.draft)
    .sort(sortByDateDesc)
    .slice(0, limit);
}

// Get latest work experience
export async function getLatestWork(limit: number = 2) {
  return (await getCollection("work"))
    .filter(exp => !exp.data.draft)
    .sort((a, b) => {
      const dateStartA = typeof a.data.dateStart === 'string' ? new Date(a.data.dateStart) : a.data.dateStart || new Date(0);
      const dateStartB = typeof b.data.dateStart === 'string' ? new Date(b.data.dateStart) : b.data.dateStart || new Date(0);
      return dateStartB.getTime() - dateStartA.getTime();
    })
    .slice(0, limit);
}

// Get latest education
export async function getLatestEducation(limit: number = 2) {
  return (await getCollection("education"))
    .filter(edu => !edu.data.draft)
    .sort((a, b) => {
      const dateEndA = typeof a.data.dateEnd === 'string' ? new Date(a.data.dateEnd) : a.data.dateEnd || new Date(0);
      const dateEndB = typeof b.data.dateEnd === 'string' ? new Date(b.data.dateEnd) : b.data.dateEnd || new Date(0);
      return dateEndB.getTime() - dateEndA.getTime();
    })
    .slice(0, limit);
}

// Skills data
export const skills = {
  mobile: [
    "Dart", "Flutter", "Kotlin", "Java", "Swift", "SwiftUI", "React Native"
  ],
  frontend: [
    "ReactJS", "NextJS", "Frontend", "Full-Stack", "Cross-Platform"
  ],
  backend: [
    "Laravel", "ExpressJS", "NodeJS", "Backend", "RESTful APIs", "GraphQL"
  ],
  databases: [
    "MySQL", "PostgreSQL", "SQLite", "MongoDB"
  ],
  cloudAndStorage: [
    "Firebase", "Cloudinary", "Amazon S3"
  ],
  dataAnalysis: [
    "Python", "R", "SQL", "Pandas", "NumPy", "Matplotlib", "Tableau", "Power BI"
  ],
  tools: [
    "Git", "GitHub", "GitLab", "Bitbucket", "Postman", "XAMPP", "MAMP",
    "VSCode", "Android Studio", "Xcode"
  ],
  design: [
    "Figma", "Canva", "Adobe XD"
  ]
};

// Achievements/Certifications
export const achievements = [
  {
    title: "Belajar Prinsip Pemrograman SOLID",
    provider: "Dicoding Academy",
    year: "2020"
  },
  {
    title: "Belajar Membuat Aplikasi Android untuk Pemula",
    provider: "Dicoding Academy", 
    year: "2020"
  },
  {
    title: "Android Developer Expert",
    provider: "Dicoding Academy",
    year: "2020"
  },
  {
    title: "HTML, PHP, Java, SQL, JavaScript, C++, Python 3",
    provider: "SoloLearn Certifications",
    year: "2021"
  },
  {
    title: "Mikrotik Certified Network Associate (MTCNA)",
    provider: "Mikrotik",
    year: ""
  }
];