import {
  faQrcode,
  faUserShield,
  faClipboardCheck,
  faChartLine,
  faLayerGroup,
  faBullseye,
} from "@fortawesome/free-solid-svg-icons";

export const SYSTEM_OVERVIEW = {
  title: "About the System",
  description:
    "The Web-Based Asset Tracking and Auditing System with QR Code Integration is an institutional resource management platform custom-built for the College of Information and Communications Technology (CICT) at Bulacan State University (BulSU). Developed to replace manual paper logs and static spreadsheets, the system provides a centralized digital environment for registering, monitoring, and auditing physical equipment assigned to CICT classrooms and offices.",
};

export const MISSION = {
  title: "Our Mission",
  description:
    "At the College of Information and Communications Technology (CICT) of Bulacan State University, we are committed to driving digital transformation within our academic community. The Web-Based Asset Tracking and Auditing System with QR Code Integration was built to modernize institutional resource management, replacing traditional paper logs and manual spreadsheets with an efficient, transparent, and accurate digital platform.  Our goal is to streamline physical asset tracking across all CICT classrooms and offices, empowering administrators, property officers, and faculty members with real-time visibility and absolute accountability.",
};

export const FEATURES = [
  {
    icon: faQrcode,
    title: "Instant Asset Lookup",
    description:
      "Scan any CICT QR tag to instantly pull up an asset's history, condition, and current custodian — no account needed.",
  },
  {
    icon: faUserShield,
    title: "Exclusive Faculty Access",
    description:
      "A dedicated, interactive system built for CICT faculty and staff at BulSU main campus, secured behind role-based login.",
  },
  {
    icon: faClipboardCheck,
    title: "QR-Powered Auditing",
    description:
      "Run room audits by scanning asset QR tags directly, flagging discrepancies in real time and cutting manual checklist work.",
  },
  {
    icon: faChartLine,
    title: "Live Monitoring & Management",
    description:
      "Track transfers, reports, and asset status across every room and custodian from one centralized dashboard.",
  },
];

export const TEAM_MEMBERS = [
  {
    name: "Ralph Jasper Ortiz",
    role: "Project Lead / Project Manager",
    bio: "Oversees the full development lifecycle of the CICT Asset Management System, ensuring architectural integrity and on-time delivery. Bridges technical direction with stakeholder requirements across all project phases.",
  },
  {
    name: "Ralf Gett Gatmaitan",
    role: "Backend Developer",
    bio: "Designs and maintains the server-side logic, database schemas, and REST API endpoints powering the platform. Specializes in secure, scalable Node.js architecture and SQL query optimization.",
  },
  {
    name: "Lance Estopace",
    role: "Frontend Developer",
    bio: "Builds and refines the React-based interface, translating design mockups into responsive, accessible components. Focuses on performance, cross-browser consistency, and a smooth faculty user experience.",
  },
  {
    name: "Jerald Gutierrez",
    role: "UI/UX Designer",
    bio: "Leads the visual identity and interaction design of the system, conducting user research with CICT staff to inform every screen. Responsible for the design system, prototypes, and usability standards.",
  },
  {
    name: "Humphrey Caasi",
    role: "QA Engineer",
    bio: "Owns the testing strategy across unit, integration, and end-to-end layers to guarantee system reliability before every release. Documents defects, tracks resolution, and enforces quality gates throughout the sprint cycle.",
  },
];
