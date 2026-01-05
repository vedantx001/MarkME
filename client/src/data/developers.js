// Mock developer data for MarkMe Developers Page
// Replace with real developer information

export const developers = [
    {
        id: 1,
        name: "Adrian Chen",
        role: "Lead Systems Architect",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
        highlights: [
            "Core infrastructure design",
            "Real-time sync engine",
            "Database architecture"
        ],
        contributions: {
            modules: [
                "Core Engine",
                "Authentication System",
                "Real-time Sync Module"
            ],
            features: [
                "Designed distributed marking system handling 100K+ concurrent sessions",
                "Built zero-downtime deployment pipeline",
                "Implemented end-to-end encryption for sensitive data",
                "Created auto-scaling infrastructure for peak loads"
            ],
            techStack: ["Go", "PostgreSQL", "Redis", "Kubernetes", "gRPC"],
            decisions: [
                "Chose event-sourcing for audit trail and replay capability",
                "Implemented CQRS pattern for read/write optimization"
            ]
        },
        links: {
            github: "https://github.com",
            linkedin: "https://linkedin.com",
            portfolio: "https://example.com"
        }
    },
    {
        id: 2,
        name: "Maya Rodriguez",
        role: "Frontend Lead",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face",
        highlights: [
            "UI/UX system design",
            "Component architecture",
            "Performance optimization"
        ],
        contributions: {
            modules: [
                "Design System",
                "Dashboard Module",
                "Analytics Visualizations"
            ],
            features: [
                "Built atomic design system with 60+ reusable components",
                "Implemented real-time collaboration UI with presence indicators",
                "Created accessible, keyboard-navigable interface (WCAG 2.1 AA)",
                "Optimized bundle size by 45% through code splitting"
            ],
            techStack: ["React", "TypeScript", "Framer Motion", "D3.js", "Vite"],
            decisions: [
                "Adopted CSS-in-JS for scoped, theme-aware styling",
                "Chose Zustand over Redux for simpler state management"
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
    },
    {
        id: 5,
        name: "Marcus Thompson",
        role: "Data Engineer",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
        highlights: [
            "Data pipelines",
            "Analytics infrastructure",
            "ML integration"
        ],
        contributions: {
            modules: [
                "Data Pipeline",
                "Analytics Engine",
                "Reporting System"
            ],
            features: [
                "Built real-time data streaming pipeline processing 1M events/hour",
                "Implemented predictive analytics for workload distribution",
                "Created automated reporting with customizable dashboards",
                "Designed data warehouse schema for complex queries"
            ],
            techStack: ["Python", "Apache Kafka", "Spark", "Airflow", "BigQuery"],
            decisions: [
                "Chose Lambda architecture for batch and real-time needs",
                "Implemented data lineage tracking for compliance"
            ]
        },
        links: {
            github: "https://github.com",
            linkedin: "https://linkedin.com"
        }
    },
    {
        id: 6,
        name: "Elena Volkov",
        role: "Security Engineer",
        avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop&crop=face",
        highlights: [
            "Security architecture",
            "Compliance systems",
            "Threat modeling"
        ],
        contributions: {
            modules: [
                "Security Layer",
                "Audit System",
                "Access Control"
            ],
            features: [
                "Designed zero-trust security architecture",
                "Implemented SOC 2 Type II compliance framework",
                "Built automated vulnerability scanning pipeline",
                "Created role-based access control with fine-grained permissions"
            ],
            techStack: ["SIEM", "HashiCorp Vault", "OWASP ZAP", "Snyk"],
            decisions: [
                "Implemented defense-in-depth strategy",
                "Chose hardware security modules for key management"
            ]
        },
        links: {
            github: "https://github.com",
            linkedin: "https://linkedin.com",
            portfolio: "https://example.com"
        }
    }
];
