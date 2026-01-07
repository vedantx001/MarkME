// Mock developer data for MarkMe Developers Page
// Replace with real developer information

export const developers = [
    {
        "id": 1,
        "name": "Aryan Prajapati",
        "role": "Backend & AI Systems Engineer",
        "avatar": "/aryan-prajapati_profile%20picture.png",
        "highlights": [
            "AI-driven image-based attendance systems",
            "Cloud-deployed biometric recognition services",
            "Concurrent processing & data integrity handling"
        ],
        "contributions": {
            "modules": [
                "Attendance Session & Records Engine",
                "AI Recognition Microservice (FastAPI)",
                "Image Upload & Cloud Persistence Pipeline",
                "Reporting & CSV/Excel Export Utilities"
            ],
            "features": [
                "Engineered a parallel image processing pipeline for classroom attendance, reducing total AI inference time by ~40% for multi-image sessions.",
                "Designed a dynamic cloud storage structure supporting bulk image uploads and raw Excel dataset persistence.",
                "Implemented concurrency-safe attendance updates to prevent duplicate or inconsistent records during parallel AI inference.",
                "Built a biometric recognition flow using InsightFace (512-dimensional embeddings) with cross-image student de-duplication.",
                "Deployed and exposed the AI microservice on Oracle Cloud Infrastructure with HTTPS via DuckDNS and reverse proxy configuration."
            ],
            "techStack": [
                "Node.js",
                "Express.js",
                "MongoDB",
                "FastAPI",
                "Python",
                "InsightFace (Buffalo_L)",
                "ONNX Runtime",
                "Oracle Cloud Infrastructure",
                "Multer"
            ],
            "decisions": [
                "Selected InsightFace (Buffalo_L) over legacy dlib models to improve recognition accuracy in crowded classroom conditions.",
                "Capped classroom image uploads to a maximum of four per session to balance inference latency, cost, and recognition coverage.",
                "Adopted parallel asynchronous processing for image analysis to minimize end-to-end attendance marking time.",
                "Decoupled AI inference behind a dedicated client abstraction to allow independent scaling and future model replacement.",
                "Exposed the AI service over HTTPS using domain-based routing instead of raw IP access to meet production security standards."
            ]
        },
        "links": {
            "github": "https://github.com/your-username",
            "linkedin": "https://linkedin.com/in/your-username",
            "portfolio": "https://your-portfolio-site.com"
        }
    }
    ,
    {
        id: 2,
        name: "Vedant Patel",
        role: "Backend & System Architect | Team Lead",
        avatar: "/Vedant_Patel_Profile.png",
        highlights: [
            "Authentication & Authorization Architecture",
            "Admin Panel System Design",
            "Team Management with Constant Inputs",
        ],
        contributions: {
            modules: [
                "Authentication & Authorization System",
                "Complete Admin Panel",
                "Role-Based Access Control",
                "Database Schema Design"
            ],
            features: [
                "Built complete JWT-based authentication system using access & refresh tokens",
                "Integrated Nodemailer with live email workflows for signup, OTP verification, and password recovery",
                "Developed full admin panel allowing creation and management of teachers, principals, classrooms, and students",
                "Implemented strict role-based authorization for Admin, Teacher, and Principal",
                "Designed and structured the entire database schema for scalability and clarity",
                "Handled smooth server–client integration for reliable data flow across the application",
                "Led the team by managing full workflow, assigning tasks, and providing constant feedback and inputs"
            ],
            techStack: [
                "Node.js",
                "Express.js",
                "MongoDB",
                "JWT (Access & Refresh Tokens)",
                "Nodemailer",
                "React",
                "REST APIs",
                "Git & GitHub"
            ],
            decisions: [
                "Chose refresh-token-based JWT authentication for better security and session control",
                "Designed role-based middleware to centralize authorization logic",
                "Structured backend APIs to remain UI-agnostic for future frontend changes",
                "Led end-to-end repository management, aligning team contributions through structured branching, reviews, and release discipline"
            ]
        },
        links: {
            github: "https://github.com",
            linkedin: "https://linkedin.com",
            portfolio: "https://example.com"
        }
    },
    {
        id: 3,
        name: "James Okonkwo",
        role: "Backend Engineer",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
        highlights: [
            "API development",
            "Security implementation",
            "Integration systems"
        ],
        contributions: {
            modules: [
                "REST API Gateway",
                "OAuth Integration",
                "Webhook System"
            ],
            features: [
                "Designed RESTful API serving 2M+ requests daily",
                "Implemented OAuth 2.0 with PKCE for secure authentication",
                "Built webhook delivery system with retry logic",
                "Created API versioning strategy for backward compatibility"
            ],
            techStack: ["Node.js", "Express", "MongoDB", "JWT", "OpenAPI"],
            decisions: [
                "Implemented rate limiting at API gateway level",
                "Chose MongoDB for flexible schema evolution"
            ]
        },
        links: {
            github: "https://github.com",
            linkedin: "https://linkedin.com"
        }
    },
    {
        id: 4,
        name: "Sarah Kim",
        role: "Platform Engineer",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
        highlights: [
            "DevOps automation",
            "Cloud infrastructure",
            "Monitoring systems"
        ],
        contributions: {
            modules: [
                "CI/CD Pipeline",
                "Monitoring Stack",
                "Container Orchestration"
            ],
            features: [
                "Automated infrastructure provisioning with Terraform",
                "Built comprehensive observability stack (logs, metrics, traces)",
                "Implemented GitOps workflow for declarative deployments",
                "Created disaster recovery procedures with 15-minute RTO"
            ],
            techStack: ["AWS", "Terraform", "Docker", "Prometheus", "Grafana"],
            decisions: [
                "Chose multi-region active-active deployment",
                "Implemented infrastructure as code for reproducibility"
            ]
        },
        links: {
            github: "https://github.com",
            linkedin: "https://linkedin.com",
            portfolio: "https://example.com"
        }
    }
];
