import {
  faQrcode,
  faUserShield,
  faClipboardCheck,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";

const profileModules = import.meta.glob(
  "../assets/profile/*.{jpg,jpeg,png,jfif,jpe}",
  { eager: true, import: "default", query: "?url" },
);

const profileImages = Object.fromEntries(
  Object.entries(profileModules).map(([path, url]) => [
    path
      .split("/")
      .pop()
      .replace(/\.[^.]+$/, "")
      .toLowerCase(),
    url,
  ]),
);

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
    photo: profileImages["ralph"],
  },
  {
    name: "Ralf Gett Gatmaitan",
    role: "Backend Developer",
    photo: profileImages["arji"],
  },
  {
    name: "Lance Estopace",
    role: "Frontend Developer",
    photo: profileImages["lance"],
  },
  {
    name: "Jerald Gutierrez",
    role: "UI/UX Designer",
    photo: profileImages["je"],
  },
  {
    name: "Humphrey Caasi",
    role: "QA Engineer",
    photo: profileImages["humps"],
  },
];
