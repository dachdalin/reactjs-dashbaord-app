const activities = [
    { user: "John Doe", action: "created a new project", time: "2 min ago", avatar: "JD" },
    { user: "Sarah Smith", action: "completed task #42", time: "15 min ago", avatar: "SS" },
    { user: "Mike Johnson", action: "uploaded 3 files", time: "1 hour ago", avatar: "MJ" },
    { user: "Emily Brown", action: "commented on issue", time: "2 hours ago", avatar: "EB" },
  ];

const teams = [
  {
    name: "Engineering",
    description: "Building the core product",
    members: [
      { name: "Alex Chen", role: "Lead Developer", avatar: "AC" },
      { name: "Sarah Kim", role: "Backend Developer", avatar: "SK" },
      { name: "Mike Johnson", role: "Frontend Developer", avatar: "MJ" },
      { name: "Emma Wilson", role: "DevOps Engineer", avatar: "EW" },
    ],
    color: "from-indigo-500 to-purple-600",
  },
  {
    name: "Design",
    description: "Creating beautiful experiences",
    members: [
      { name: "Lisa Park", role: "Design Lead", avatar: "LP" },
      { name: "Tom Brown", role: "UI Designer", avatar: "TB" },
      { name: "Anna Lee", role: "UX Researcher", avatar: "AL" },
    ],
    color: "from-pink-500 to-rose-600",
  },
  {
    name: "Marketing",
    description: "Growing our reach",
    members: [
      { name: "David Miller", role: "Marketing Lead", avatar: "DM" },
      { name: "Rachel Green", role: "Content Writer", avatar: "RG" },
      { name: "Chris Evans", role: "SEO Specialist", avatar: "CE" },
      { name: "Nina Patel", role: "Social Media", avatar: "NP" },
    ],
    color: "from-orange-500 to-amber-600",
  },
  {
    name: "Product",
    description: "Defining the roadmap",
    members: [
      { name: "James Wilson", role: "Product Manager", avatar: "JW" },
      { name: "Kate Thompson", role: "Product Analyst", avatar: "KT" },
    ],
    color: "from-emerald-500 to-teal-600",
  },
];
const projects = [
  {
    name: "E-Commerce Platform",
    description: "Modern online shopping experience with real-time inventory",
    status: "In Progress",
    statusColor: "bg-yellow-500",
    progress: 68,
    team: ["AC", "SK", "MJ"],
    deadline: "Mar 15, 2026",
    tasks: { completed: 24, total: 35 },
  },
  {
    name: "Mobile App Redesign",
    description: "Complete UI/UX overhaul for iOS and Android apps",
    status: "Planning",
    statusColor: "bg-blue-500",
    progress: 25,
    team: ["LP", "TB", "AL"],
    deadline: "Apr 20, 2026",
    tasks: { completed: 8, total: 32 },
  },
  {
    name: "API Integration Hub",
    description: "Centralized API gateway with documentation",
    status: "In Progress",
    statusColor: "bg-yellow-500",
    progress: 82,
    team: ["EW", "SK"],
    deadline: "Feb 28, 2026",
    tasks: { completed: 41, total: 50 },
  },
  {
    name: "Analytics Dashboard",
    description: "Real-time metrics and reporting system",
    status: "Completed",
    statusColor: "bg-emerald-500",
    progress: 100,
    team: ["MJ", "AC", "KT"],
    deadline: "Jan 31, 2026",
    tasks: { completed: 28, total: 28 },
  },
  {
    name: "Customer Portal",
    description: "Self-service portal for customer management",
    status: "On Hold",
    statusColor: "bg-gray-500",
    progress: 45,
    team: ["JW", "TB"],
    deadline: "May 10, 2026",
    tasks: { completed: 18, total: 40 },
  },
  {
    name: "Security Audit",
    description: "Comprehensive security review and implementation",
    status: "In Progress",
    statusColor: "bg-yellow-500",
    progress: 55,
    team: ["EW"],
    deadline: "Feb 15, 2026",
    tasks: { completed: 11, total: 20 },
  },
];
const events = [
  { day: 2, title: "Team Standup", time: "9:00 AM", color: "bg-indigo-500" },
  { day: 5, title: "Project Review", time: "2:00 PM", color: "bg-purple-500" },
  { day: 8, title: "Client Meeting", time: "11:00 AM", color: "bg-emerald-500" },
  { day: 12, title: "Sprint Planning", time: "10:00 AM", color: "bg-orange-500" },
  { day: 15, title: "Design Review", time: "3:00 PM", color: "bg-pink-500" },
  { day: 20, title: "Team Building", time: "6:00 PM", color: "bg-teal-500" },
];
const stats = [
  { label: "Total Visitors", value: "45,678", change: "+12.5%", up: true },
  { label: "Page Views", value: "128,456", change: "+8.2%", up: true },
  { label: "Bounce Rate", value: "32.4%", change: "-2.1%", up: false },
  { label: "Avg. Session", value: "4m 32s", change: "+15.3%", up: true },
];

const topPages = [
  { page: "/dashboard", views: "12,456", percentage: 45 },
  { page: "/projects", views: "8,234", percentage: 32 },
  { page: "/teams", views: "5,123", percentage: 22 },
  { page: "/settings", views: "3,456", percentage: 15 },
  { page: "/analytics", views: "2,890", percentage: 12 },
];

const trafficSources = [
  { source: "Direct", visitors: "15,432", percentage: 35, color: "bg-indigo-500" },
  { source: "Organic Search", visitors: "12,234", percentage: 28, color: "bg-purple-500" },
  { source: "Social Media", visitors: "8,567", percentage: 19, color: "bg-pink-500" },
  { source: "Referral", visitors: "5,678", percentage: 13, color: "bg-orange-500" },
  { source: "Email", visitors: "2,345", percentage: 5, color: "bg-emerald-500" },
];
const projectsData = [
    { name: "Website Redesign", progress: 75, color: "from-indigo-500 to-purple-600" },
    { name: "Mobile App", progress: 45, color: "from-emerald-500 to-teal-600" },
    { name: "API Integration", progress: 90, color: "from-orange-500 to-red-600" },
];
const blogs = [
  {
    id: 1,
    title: "Building Scalable React Applications with Modern Patterns",
    excerpt:
      "Learn how to structure your React projects for scalability using the latest design patterns, hooks, and state management techniques.",
    author: "Alex Chen",
    avatar: "AC",
    date: "Feb 8, 2026",
    readTime: "8 min read",
    category: "React",
    categoryColor: "from-cyan-500 to-blue-600",
    image:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&h=400&fit=crop",
    featured: true,
  },
  {
    id: 2,
    title: "Getting Started with TypeScript in 2026",
    excerpt:
      "A comprehensive guide to TypeScript fundamentals and advanced features that every developer should know.",
    author: "Sarah Kim",
    avatar: "SK",
    date: "Feb 6, 2026",
    readTime: "6 min read",
    category: "TypeScript",
    categoryColor: "from-blue-500 to-indigo-600",
    image:
      "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=600&h=400&fit=crop",
  },
  {
    id: 3,
    title: "Mastering Tailwind CSS: Tips & Tricks",
    excerpt:
      "Discover advanced Tailwind techniques to build stunning UIs faster with utility-first CSS.",
    author: "Emma Wilson",
    avatar: "EW",
    date: "Feb 4, 2026",
    readTime: "5 min read",
    category: "CSS",
    categoryColor: "from-teal-500 to-emerald-600",
    image:
      "https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=600&h=400&fit=crop",
  },
  {
    id: 4,
    title: "API Design Best Practices for RESTful Services",
    excerpt:
      "Explore the principles of designing clean, maintainable, and well-documented REST APIs.",
    author: "Mike Johnson",
    avatar: "MJ",
    date: "Feb 2, 2026",
    readTime: "7 min read",
    category: "Backend",
    categoryColor: "from-orange-500 to-red-600",
    image:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=400&fit=crop",
  },
  {
    id: 5,
    title: "The Future of Web Development: What to Expect",
    excerpt:
      "A look at emerging web technologies and trends that will shape how we build applications.",
    author: "Lisa Park",
    avatar: "LP",
    date: "Jan 30, 2026",
    readTime: "10 min read",
    category: "Trends",
    categoryColor: "from-purple-500 to-pink-600",
    image:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=400&fit=crop",
  },
  {
    id: 6,
    title: "DevOps Essentials: CI/CD Pipelines Explained",
    excerpt:
      "Understanding continuous integration and deployment pipelines to streamline your development workflow.",
    author: "Tom Brown",
    avatar: "TB",
    date: "Jan 28, 2026",
    readTime: "9 min read",
    category: "DevOps",
    categoryColor: "from-amber-500 to-orange-600",
    image:
      "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=600&h=400&fit=crop",
  },
];

export { activities, projects, teams, events, stats, topPages, trafficSources, projectsData, blogs };