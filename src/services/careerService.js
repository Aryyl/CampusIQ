/**
 * Career Service — Core Engine for Career Compass
 * Skill extraction, job role matching, roadmap generation (EN + AS bilingual)
 */

const SKILL_TAXONOMY = {
  frontend: [
    'react', 'vue', 'angular', 'next.js', 'nextjs', 'svelte', 'typescript', 'javascript',
    'html', 'css', 'tailwind', 'bootstrap', 'scss', 'sass', 'webpack', 'vite', 'redux',
    'graphql', 'figma', 'responsive design', 'web accessibility', 'pwa', 'jquery',
  ],
  backend: [
    'node.js', 'nodejs', 'express', 'python', 'django', 'flask', 'fastapi', 'java',
    'spring', 'spring boot', 'go', 'golang', 'ruby', 'rails', 'php', 'laravel', 'rust',
    'rest api', 'restful', 'grpc', 'microservices', 'websockets', 'oauth', 'jwt',
  ],
  database: [
    'postgresql', 'mysql', 'mongodb', 'redis', 'firebase', 'firestore', 'sqlite',
    'oracle', 'dynamodb', 'supabase', 'prisma', 'sequelize', 'elasticsearch',
    'cassandra', 'neo4j', 'sql', 'nosql', 'database design', 'orm',
  ],
  cloud_devops: [
    'aws', 'azure', 'google cloud', 'gcp', 'docker', 'kubernetes', 'terraform',
    'ansible', 'jenkins', 'github actions', 'ci/cd', 'linux', 'bash', 'nginx',
    'cloudflare', 'vercel', 'netlify', 'render', 'heroku', 'serverless', 'lambda',
  ],
  ai_ml: [
    'machine learning', 'deep learning', 'neural network', 'tensorflow', 'pytorch',
    'scikit-learn', 'sklearn', 'pandas', 'numpy', 'opencv', 'nlp', 'llm',
    'langchain', 'hugging face', 'data science', 'data analysis', 'statistics',
    'regression', 'classification', 'clustering', 'computer vision', 'generative ai',
    'rag', 'embeddings', 'ai', 'ml', 'artificial intelligence',
  ],
  cybersecurity: [
    'cybersecurity', 'penetration testing', 'ethical hacking', 'network security',
    'cryptography', 'owasp', 'kali linux', 'wireshark', 'nmap', 'burp suite',
    'siem', 'soc', 'threat analysis', 'vulnerability assessment', 'security audit',
    'incident response', 'firewall', 'ids', 'ips',
  ],
  core_cs: [
    'data structures', 'algorithms', 'oop', 'system design', 'operating systems',
    'computer networks', 'dbms', 'compiler design', 'discrete mathematics',
    'design patterns', 'solid principles', 'git', 'github', 'agile', 'scrum',
    'problem solving', 'competitive programming', 'leetcode',
  ],
  soft_skills: [
    'leadership', 'communication', 'teamwork', 'project management', 'presentation',
    'critical thinking', 'time management', 'collaboration', 'mentoring', 'research',
  ],
  assamese_keywords: [
    'কম্পিউটাৰ বিজ্ঞান', 'ৱেব নিৰ্মাণ', 'পাইথন', 'তথ্য বিশ্লেষণ', 'প্ৰকল্প পৰিচালনা',
    'কৃত্ৰিম বুদ্ধিমত্তা', 'ডাটাবেছ', 'নেটৱৰ্কিং', 'চাইবাৰ সুৰক্ষা', 'ডেটা বিজ্ঞান',
  ],
}

const ROLE_PROFILES = [
  {
    id: 'frontend_dev',
    titleEn: 'Frontend Developer',
    titleAs: 'ফ্ৰণ্ট-এণ্ড ডেভেলপাৰ',
    descEn: 'Build beautiful, responsive web interfaces using modern JavaScript frameworks.',
    descAs: 'আধুনিক JavaScript ফ্ৰেমৱৰ্ক ব্যৱহাৰ কৰি সুন্দৰ, প্ৰতিক্ৰিয়াশীল ৱেব ইণ্টাৰফেচ নিৰ্মাণ কৰক।',
    coreSkills: ['react', 'typescript', 'javascript', 'html', 'css', 'tailwind', 'git'],
    niceToHave: ['next.js', 'graphql', 'figma', 'redux', 'webpack', 'vite'],
    salaryEn: '₹4–9 LPA (Entry Level)',
    salaryAs: '₹৪–৯ লক্ষ প্ৰতি বছৰ',
    demand: 'Very High',
    demandAs: 'অতি বেছি',
  },
  {
    id: 'fullstack_dev',
    titleEn: 'Full Stack Engineer',
    titleAs: 'ফুল স্টেক ইঞ্জিনিয়াৰ',
    descEn: 'Handle both frontend and backend development end-to-end for complete web applications.',
    descAs: 'সম্পূৰ্ণ ৱেব এপ্লিকেচনৰ বাবে ফ্ৰণ্ট-এণ্ড আৰু বেক-এণ্ড দুয়োটা নিৰ্মাণ কৰক।',
    coreSkills: ['react', 'node.js', 'javascript', 'sql', 'git', 'rest api'],
    niceToHave: ['typescript', 'docker', 'postgresql', 'mongodb', 'aws', 'next.js'],
    salaryEn: '₹5–12 LPA (Entry Level)',
    salaryAs: '₹৫–১২ লক্ষ প্ৰতি বছৰ',
    demand: 'Very High',
    demandAs: 'অতি বেছি',
  },
  {
    id: 'backend_dev',
    titleEn: 'Backend & API Engineer',
    titleAs: 'বেক-এণ্ড আৰু API ইঞ্জিনিয়াৰ',
    descEn: 'Design and build scalable APIs, microservices, and server-side systems.',
    descAs: 'স্কেলেবল API, মাইক্ৰ\'ছাৰ্ভিচ আৰু ছাৰ্ভাৰ-ছাইড চিষ্টেম ডিজাইন আৰু নিৰ্মাণ কৰক।',
    coreSkills: ['python', 'node.js', 'sql', 'rest api', 'git', 'postgresql'],
    niceToHave: ['docker', 'microservices', 'redis', 'jwt', 'fastapi', 'aws', 'mongodb'],
    salaryEn: '₹5–11 LPA (Entry Level)',
    salaryAs: '₹৫–১১ লক্ষ প্ৰতি বছৰ',
    demand: 'High',
    demandAs: 'বেছি',
  },
  {
    id: 'cloud_devops',
    titleEn: 'Cloud & DevOps Associate',
    titleAs: 'ক্লাউড আৰু ডেভঅপছ সহযোগী',
    descEn: 'Manage cloud infrastructure, CI/CD pipelines, and system reliability.',
    descAs: 'ক্লাউড আন্তঃগাঁথনি, CI/CD পাইপলাইন আৰু চিষ্টেম নিৰ্ভৰযোগ্যতা পৰিচালনা কৰক।',
    coreSkills: ['linux', 'git', 'docker', 'ci/cd', 'aws'],
    niceToHave: ['kubernetes', 'terraform', 'ansible', 'bash', 'azure', 'google cloud', 'jenkins'],
    salaryEn: '₹5–13 LPA (Entry Level)',
    salaryAs: '₹৫–১৩ লক্ষ প্ৰতি বছৰ',
    demand: 'Very High',
    demandAs: 'অতি বেছি',
  },
  {
    id: 'data_analyst',
    titleEn: 'Data Analyst & BI Specialist',
    titleAs: 'ডাটা বিশ্লেষক আৰু BI বিশেষজ্ঞ',
    descEn: 'Transform raw data into insights and dashboards that drive business decisions.',
    descAs: 'কাঁচা ডাটাক অন্তৰ্দৃষ্টি আৰু ড্যাশব\'ৰ্ডলৈ ৰূপান্তৰিত কৰক।',
    coreSkills: ['python', 'sql', 'pandas', 'numpy', 'data analysis', 'statistics'],
    niceToHave: ['tableau', 'power bi', 'matplotlib', 'scikit-learn', 'excel', 'mongodb'],
    salaryEn: '₹4–9 LPA (Entry Level)',
    salaryAs: '₹৪–৯ লক্ষ প্ৰতি বছৰ',
    demand: 'High',
    demandAs: 'বেছি',
  },
  {
    id: 'ai_ml_engineer',
    titleEn: 'AI / ML Engineer',
    titleAs: 'AI / ML ইঞ্জিনিয়াৰ',
    descEn: 'Build machine learning models, generative AI applications, and intelligent systems.',
    descAs: 'মেচিন লাৰ্নিং মডেল, জেনাৰেটিভ AI এপ্লিকেচন আৰু বুদ্ধিমান চিষ্টেম নিৰ্মাণ কৰক।',
    coreSkills: ['python', 'machine learning', 'pandas', 'numpy', 'data analysis'],
    niceToHave: ['tensorflow', 'pytorch', 'nlp', 'llm', 'scikit-learn', 'docker', 'sql'],
    salaryEn: '₹6–15 LPA (Entry Level)',
    salaryAs: '₹৬–১৫ লক্ষ প্ৰতি বছৰ',
    demand: 'Very High',
    demandAs: 'অতি বেছি',
  },
  {
    id: 'cybersecurity',
    titleEn: 'Cybersecurity Analyst',
    titleAs: 'চাইবাৰ সুৰক্ষা বিশ্লেষক',
    descEn: 'Protect systems and networks from cyber threats, vulnerabilities, and attacks.',
    descAs: 'চাইবাৰ ভাবুকি, দুৰ্বলতা আৰু আক্ৰমণৰ পৰা চিষ্টেম আৰু নেটৱৰ্ক সুৰক্ষিত কৰক।',
    coreSkills: ['cybersecurity', 'network security', 'linux', 'python'],
    niceToHave: ['ethical hacking', 'kali linux', 'owasp', 'penetration testing', 'cryptography', 'wireshark'],
    salaryEn: '₹5–12 LPA (Entry Level)',
    salaryAs: '₹৫–১২ লক্ষ প্ৰতি বছৰ',
    demand: 'High',
    demandAs: 'বেছি',
  },
  {
    id: 'product_coordinator',
    titleEn: 'Product & Tech Coordinator',
    titleAs: 'প্ৰডাক্ট আৰু টেক সমন্বয়কাৰী',
    descEn: 'Bridge technology teams and stakeholders to deliver great digital products.',
    descAs: 'প্ৰযুক্তি দল আৰু স্টেকহল্ডাৰসকলক সংযুক্ত কৰি উৎকৃষ্ট ডিজিটেল প্ৰডাক্ট প্ৰদান কৰক।',
    coreSkills: ['project management', 'agile', 'communication', 'git', 'figma'],
    niceToHave: ['scrum', 'sql', 'data analysis', 'leadership', 'presentation'],
    salaryEn: '₹4–8 LPA (Entry Level)',
    salaryAs: '₹৪–৮ লক্ষ প্ৰতি বছৰ',
    demand: 'Moderate',
    demandAs: 'মধ্যমীয়া',
  },
]

const ROADMAP_TEMPLATES = {
  frontend_dev: {
    phase1En: ['Master JavaScript ES6+: arrow functions, promises, async/await, destructuring', 'Build 3 static landing pages with HTML5, CSS3, and Tailwind CSS', 'Learn React fundamentals: components, props, useState, useEffect', 'Complete Git + GitHub workflow: branches, PRs, merge conflicts'],
    phase1As: ['JavaScript ES6+ শিকক: এৰ\' ফাংচন, প্ৰমিচ, async/await', 'HTML5, CSS3, আৰু Tailwind CSS ব্যৱহাৰ কৰি ৩টা ষ্টেটিক পেজ নিৰ্মাণ কৰক', 'React-ৰ মূল ধাৰণাসমূহ শিকক: কম্পনেণ্ট, প্ৰপছ, useState, useEffect', 'Git + GitHub ৱৰ্কফ্লো সম্পূৰ্ণ কৰক: ব্ৰাঞ্চ, PR, মাৰ্জ কনফ্লিক্ট'],
    phase2En: ['Build a full CRUD React app with Firebase/REST API backend', 'Complete Meta Frontend Professional Certificate (Coursera)', 'Learn TypeScript: types, interfaces, generics in a real project', 'Contribute to 1 open-source project on GitHub'],
    phase2As: ['Firebase/REST API বেকেণ্ডৰ সৈতে এটা সম্পূৰ্ণ CRUD React এপ নিৰ্মাণ কৰক', 'Meta Frontend Professional Certificate (Coursera) সম্পূৰ্ণ কৰক', 'TypeScript শিকক: টাইপ, ইণ্টাৰফেচ, জেনেৰিক্স এটা প্ৰকল্পত ব্যৱহাৰ কৰক', 'GitHub-ত ১টা অ\'পেন-ছোৰ্চ প্ৰকল্পত অবদান দিয়ক'],
    phase3En: ['Target 60+ LeetCode problems (Easy + Medium focus)', 'Build a portfolio site showcasing 3–4 projects with live demos', 'Practice 20 frontend interview questions on CSS, React lifecycle, and optimization', 'Apply to 10 internships/junior roles weekly via LinkedIn, Internshala, and GitHub Jobs'],
    phase3As: ['LeetCode-ত ৬০+ সমস্যা সমাধান কৰক (সহজ + মধ্যম মানৰ)', 'লাইভ ডেমো সহ ৩-৪টা প্ৰকল্প প্ৰদৰ্শন কৰা পোৰ্টফলি\' ছাইট নিৰ্মাণ কৰক', 'CSS, React লাইফচাইকেল আৰু অপ্টিমাইজেচনৰ ওপৰত ২০টা ইণ্টাৰভিউ প্ৰশ্ন অনুশীলন কৰক', 'LinkedIn, Internshala আৰু GitHub Jobs-এ প্ৰতি সপ্তাহত ১০টা ইণ্টাৰ্নশ্বিপত আবেদন কৰক'],
  },
  fullstack_dev: {
    phase1En: ['Solidify JavaScript, HTML, CSS foundations and Git workflow', 'Learn React for frontend, Node.js + Express for backend', 'Practice REST API design: CRUD operations with JSON', 'Set up PostgreSQL or MongoDB locally and write basic queries'],
    phase1As: ['JavaScript, HTML, CSS-ৰ ভিত্তি আৰু Git ৱৰ্কফ্লো মজবুত কৰক', 'ফ্ৰণ্ট-এণ্ডৰ বাবে React আৰু বেক-এণ্ডৰ বাবে Node.js + Express শিকক', 'REST API ডিজাইন অনুশীলন কৰক: JSON-ৰ সৈতে CRUD অপাৰেচন', 'PostgreSQL বা MongoDB ইনষ্টল কৰি মূল কুৱেৰি লিখক'],
    phase2En: ['Build an end-to-end e-commerce app (product listing, cart, checkout)', 'Learn Docker for containerization and local dev environments', 'Complete The Odin Project or Full Stack Open (free curriculum)', 'Add TypeScript to your existing backend projects'],
    phase2As: ['এটা সম্পূৰ্ণ ই-কমাৰ্চ এপ নিৰ্মাণ কৰক (প্ৰডাক্ট লিষ্টিং, কাৰ্ট, চেকআউট)', 'কণ্টেইনাৰাইজেচনৰ বাবে Docker শিকক', 'The Odin Project বা Full Stack Open (বিনামূলীয়া পাঠ্যক্ৰম) সম্পূৰ্ণ কৰক', 'আপোনাৰ বিদ্যমান বেকেণ্ড প্ৰকল্পত TypeScript যোগ দিয়ক'],
    phase3En: ['Target 80+ LeetCode problems with focus on arrays, trees, and DP', 'Deploy your full-stack project to Vercel + Render/Railway', 'Prepare for system design basics: load balancing, caching, CDN', 'Mock interviews: practice behavioral + technical rounds'],
    phase3As: ['এৰে, ট্ৰি আৰু DP-ৰ ওপৰত গুৰুত্ব দি LeetCode-ত ৮০+ সমস্যা সমাধান কৰক', 'Vercel + Render/Railway-ত আপোনাৰ ফুল-স্টেক প্ৰকল্প ডেপ্ল\' কৰক', 'ছিষ্টেম ডিজাইনৰ মূল ধাৰণা প্ৰস্তুত কৰক: লোড বেলেন্সিং, কেচিং, CDN', 'মক ইণ্টাৰভিউ: বিহেভিয়াৰাল + টেকনিকেল ৰাউণ্ড অনুশীলন কৰক'],
  },
  backend_dev: {
    phase1En: ['Master Python or Node.js: functions, classes, error handling, modules', 'Learn REST API design principles and HTTP methods', 'Practice SQL: joins, subqueries, indexes, transactions', 'Set up a local PostgreSQL or MySQL instance'],
    phase1As: ['Python বা Node.js-ৰ মূল ধাৰণা শিকক: ফাংচন, ক্লাছ, এৰৰ হেণ্ডলিং', 'REST API ডিজাইনৰ নীতি আৰু HTTP মেথড শিকক', 'SQL অনুশীলন কৰক: জইন, ছাবকুৱেৰি, ইণ্ডেক্স, ট্ৰেনজেকচন', 'লোকেল PostgreSQL বা MySQL ইনষ্টল আৰু সংস্থাপন কৰক'],
    phase2En: ['Build a production-ready REST API (authentication, rate limiting, logging)', 'Learn Docker and containerize your application', 'Study microservices: separate services communicating over HTTP/gRPC', 'Complete AWS Cloud Practitioner or Google Cloud Digital Leader certification'],
    phase2As: ['প্ৰডাকচন-ৰেডি REST API নিৰ্মাণ কৰক (অথেণ্টিকেচন, ৰেট লিমিটিং, লগিং)', 'Docker শিকক আৰু আপোনাৰ এপ্লিকেচন কণ্টেইনাৰাইজ কৰক', 'মাইক্ৰ\'ছাৰ্ভিচ অধ্যয়ন কৰক: HTTP/gRPC যোগাযোগ', 'AWS Cloud Practitioner বা Google Cloud Digital Leader প্ৰমাণপত্ৰ সম্পূৰ্ণ কৰক'],
    phase3En: ['Target 70+ LeetCode with emphasis on strings, graphs, and trees', 'Practice system design: design a URL shortener, chat system, file storage', 'Set up monitoring and observability on a deployed project', 'Apply to backend/software engineering internships with your GitHub portfolio'],
    phase3As: ['ষ্ট্ৰিং, গ্ৰাফ আৰু ট্ৰিৰ ওপৰত গুৰুত্ব দি LeetCode-ত ৭০+ সমস্যা সমাধান কৰক', 'ছিষ্টেম ডিজাইন অনুশীলন কৰক: URL শ্বৰ্টেনাৰ, চেট চিষ্টেম, ফাইল ষ্ট\'ৰেজ ডিজাইন', 'ডেপ্ল\' প্ৰকল্পত মনিটৰিং স্থাপন কৰক', 'আপোনাৰ GitHub পোৰ্টফলি\' লৈ বেকেণ্ড ইণ্টাৰ্নশ্বিপত আবেদন কৰক'],
  },
  cloud_devops: {
    phase1En: ['Get comfortable with Linux CLI: file system, processes, networking basics', 'Learn Git branching, rebasing, and collaborative workflows', 'Set up Docker: build images, run containers, write Dockerfiles', 'Complete AWS Cloud Practitioner Essentials (free on AWS Skill Builder)'],
    phase1As: ['Linux CLI-ৰ সৈতে পৰিচিত হওক: ফাইল ছিষ্টেম, প্ৰচেছ, নেটৱৰ্কিং', 'Git ব্ৰাঞ্চিং, ৰিবেচিং আৰু সহযোগী ৱৰ্কফ্লো শিকক', 'Docker সংস্থাপন কৰক: ইমেজ নিৰ্মাণ, কণ্টেইনাৰ চলাওক, Dockerfile লিখক', 'AWS Cloud Practitioner Essentials (AWS Skill Builder-ত বিনামূলীয়া) সম্পূৰ্ণ কৰক'],
    phase2En: ['Set up a CI/CD pipeline using GitHub Actions for a sample project', 'Learn Kubernetes basics: pods, deployments, services, ingress', 'Practice Terraform for infrastructure as code (provision EC2, S3)', 'Get AWS Solutions Architect Associate or GCP Associate Cloud Engineer certification'],
    phase2As: ['এটা নমুনা প্ৰকল্পৰ বাবে GitHub Actions ব্যৱহাৰ কৰি CI/CD পাইপলাইন স্থাপন কৰক', 'Kubernetes-ৰ মূল ধাৰণা শিকক: পড, ডেপ্ল\'মেণ্ট, ছাৰ্ভিচ', 'Terraform অনুশীলন কৰক: EC2, S3 প্ৰ\'ভিচন কৰক', 'AWS Solutions Architect Associate বা GCP Associate Cloud Engineer প্ৰমাণপত্ৰ লাভ কৰক'],
    phase3En: ['Build an end-to-end DevOps project: code → CI/CD → Docker → Kubernetes → monitoring', 'Set up Prometheus + Grafana alerting dashboard on a cloud cluster', 'Practice 25 DevOps interview questions on containers, networking, and observability', 'Apply to Cloud Engineer, Site Reliability, and DevOps internships'],
    phase3As: ['এটা সম্পূৰ্ণ DevOps প্ৰকল্প নিৰ্মাণ কৰক: ক\'ড → CI/CD → Docker → Kubernetes → মনিটৰিং', 'ক্লাউড ক্লাষ্টাৰত Prometheus + Grafana এলাৰ্টিং ড্যাশব\'ৰ্ড স্থাপন কৰক', 'কণ্টেইনাৰ, নেটৱৰ্কিং আৰু অবজাৰ্ভেবিলিটিৰ ওপৰত ২৫টা DevOps ইণ্টাৰভিউ প্ৰশ্ন অনুশীলন কৰক', 'Cloud Engineer, Site Reliability আৰু DevOps ইণ্টাৰ্নশ্বিপত আবেদন কৰক'],
  },
  data_analyst: {
    phase1En: ['Master Python: Pandas, NumPy, and Matplotlib for data manipulation and visualization', 'Learn SQL: advanced queries, window functions, and aggregations', 'Complete Google Data Analytics Certificate (Coursera)', 'Practice with 3 real datasets from Kaggle'],
    phase1As: ['Python শিকক: ডাটা মেনিপুলেচন আৰু ভিজ্যুৱেলাইজেচনৰ বাবে Pandas, NumPy, Matplotlib', 'SQL শিকক: উন্নত কুৱেৰি, ৱিণ্ড\' ফাংচন আৰু এগ্ৰিগেচন', 'Google Data Analytics Certificate (Coursera) সম্পূৰ্ণ কৰক', 'Kaggle-ৰ পৰা ৩টা প্ৰকৃত ডাটাছেটৰ সৈতে অনুশীলন কৰক'],
    phase2En: ['Learn Tableau or Power BI for interactive business dashboards', 'Build an end-to-end analytics project: data collection → cleaning → analysis → dashboard', 'Study statistics: hypothesis testing, A/B testing, correlation', 'Complete IBM Data Analyst Professional Certificate'],
    phase2As: ['ইন্টাৰেক্টিভ বিজনেছ ড্যাশব\'ৰ্ডৰ বাবে Tableau বা Power BI শিকক', 'সম্পূৰ্ণ এনালিটিক্স প্ৰকল্প নিৰ্মাণ কৰক: ডাটা সংগ্ৰহ → পৰিষ্কাৰ → বিশ্লেষণ → ড্যাশব\'ৰ্ড', 'পৰিসংখ্যা শিকক: হাইপোথেছিছ টেষ্টিং, A/B টেষ্টিং, কৰিলেচন', 'IBM Data Analyst Professional Certificate সম্পূৰ্ণ কৰক'],
    phase3En: ['Share 3 Kaggle notebooks demonstrating business impact', 'Practice SQL interview challenges on HackerRank or StrataScratch', 'Prepare for case study interviews: data interpretation and storytelling', 'Apply to Data Analyst and Business Intelligence internships'],
    phase3As: ['ব্যৱসায়িক প্ৰভাৱ প্ৰদৰ্শন কৰা ৩টা Kaggle নোটবুক শ্বেয়াৰ কৰক', 'HackerRank বা StrataScratch-ত SQL ইণ্টাৰভিউ চেলেঞ্জ অনুশীলন কৰক', 'কেছ ষ্টাডি ইণ্টাৰভিউৰ বাবে প্ৰস্তুতি নিয়ক: ডাটা ব্যাখ্যা আৰু ষ্ট\'ৰিটেলিং', 'ডাটা এনালিষ্ট আৰু Business Intelligence ইণ্টাৰ্নশ্বিপত আবেদন কৰক'],
  },
  ai_ml_engineer: {
    phase1En: ['Master Python: Pandas, NumPy, Matplotlib, Seaborn for data handling', 'Learn ML fundamentals: supervised learning, regression, classification, decision trees', 'Complete fast.ai Practical Deep Learning or Andrew Ng Machine Learning Specialization', 'Practice on 2 Kaggle ML competitions'],
    phase1As: ['Python শিকক: ডাটা হেণ্ডেলিংৰ বাবে Pandas, NumPy, Matplotlib, Seaborn', 'ML-ৰ মূল ধাৰণা শিকক: ছুপাৰভাইজড লাৰ্নিং, ৰিগ্ৰেচন, ক্লাছিফিকেচন', 'fast.ai Practical Deep Learning বা Andrew Ng Machine Learning Specialization সম্পূৰ্ণ কৰক', 'Kaggle-ত ২টা ML প্ৰতিযোগিতাত অংশগ্ৰহণ কৰক'],
    phase2En: ['Build an end-to-end ML project: collect data → train model → evaluate → deploy as API', 'Learn deep learning: PyTorch/TensorFlow, CNNs, RNNs, Transformers', 'Explore LLMs, LangChain, and Retrieval-Augmented Generation (RAG)', 'Get TensorFlow Developer Certificate or DeepLearning.AI specialization'],
    phase2As: ['সম্পূৰ্ণ ML প্ৰকল্প নিৰ্মাণ কৰক: ডাটা সংগ্ৰহ → মডেল ট্ৰেইন → মূল্যায়ন → API হিচাপে ডেপ্ল\'', 'ডিপ লাৰ্নিং শিকক: PyTorch/TensorFlow, CNN, RNN, ট্ৰান্সফৰমাৰ', 'LLM, LangChain আৰু RAG অন্বেষণ কৰক', 'TensorFlow Developer Certificate বা DeepLearning.AI specialization লাভ কৰক'],
    phase3En: ['Deploy 2 ML/AI projects on HuggingFace Spaces or Streamlit', 'Write technical blog posts explaining your ML project decisions', 'Practice ML interview questions: bias-variance tradeoff, model evaluation metrics', 'Apply to ML Engineer / Data Scientist internships'],
    phase3As: ['HuggingFace Spaces বা Streamlit-ত ২টা ML/AI প্ৰকল্প ডেপ্ল\' কৰক', 'আপোনাৰ ML প্ৰকল্পৰ সিদ্ধান্ত ব্যাখ্যা কৰা টেকনিকেল ব্লগ লিখক', 'ML ইণ্টাৰভিউ প্ৰশ্ন অনুশীলন কৰক: বায়াছ-ভেৰিয়েন্স, মডেল মূল্যায়ন, ফিচাৰ ইঞ্জিনিয়াৰিং', 'ML Engineer / Data Scientist ইণ্টাৰ্নশ্বিপত আবেদন কৰক'],
  },
  cybersecurity: {
    phase1En: ['Learn networking fundamentals: TCP/IP, DNS, HTTP, firewalls, VPNs', 'Set up Kali Linux in a VM and explore its toolset', 'Complete Google Cybersecurity Professional Certificate (Coursera)', 'Study OWASP Top 10 vulnerabilities and how to mitigate them'],
    phase1As: ['নেটৱৰ্কিং-ৰ মূল ধাৰণা শিকক: TCP/IP, DNS, HTTP, ফায়াৰৱল, VPN', 'VM-ত Kali Linux সংস্থাপন কৰক আৰু ইয়াৰ টুলছেট অন্বেষণ কৰক', 'Google Cybersecurity Professional Certificate (Coursera) সম্পূৰ্ণ কৰক', 'OWASP Top 10 দুৰ্বলতা অধ্যয়ন কৰক আৰু সমাধান শিকক'],
    phase2En: ['Practice on HackTheBox (Tier 0 machines) and TryHackMe learning paths', 'Learn web application penetration testing: SQLi, XSS, CSRF, SSRF', 'Get CompTIA Security+ or Certified Ethical Hacker (CEH) certification', 'Complete a Capture The Flag (CTF) challenge and document your approach'],
    phase2As: ['HackTheBox (Tier 0 মেচিন) আৰু TryHackMe-ত অনুশীলন কৰক', 'ৱেব এপ্লিকেচন পেনিট্ৰেচন টেষ্টিং শিকক: SQLi, XSS, CSRF, SSRF', 'CompTIA Security+ বা Certified Ethical Hacker (CEH) প্ৰমাণপত্ৰ লাভ কৰক', 'Capture The Flag (CTF) চেলেঞ্জ সম্পূৰ্ণ কৰক আৰু আপোনাৰ পদ্ধতি নথিভুক্ত কৰক'],
    phase3En: ['Build a home SOC lab: set up SIEM, network monitoring, and log analysis', 'Create a security writeup blog documenting 5 CTF/bug hunting solutions', 'Practice incident response scenarios and threat modeling', 'Apply to SOC Analyst, Security Intern, or Bug Bounty programs'],
    phase3As: ['ঘৰুৱা SOC লেব নিৰ্মাণ কৰক: SIEM, নেটৱৰ্ক মনিটৰিং, লগ বিশ্লেষণ স্থাপন কৰক', '৫টা CTF/বাগ হাণ্টিং সমাধান নথিভুক্ত কৰা এটা নিৰাপত্তা ব্ল\'গ তৈয়াৰ কৰক', 'ইনচিডেণ্ট ৰেছপনছ চিনাৰি\' আৰু থ্ৰেট মডেলিং অনুশীলন কৰক', 'SOC Analyst, Security Intern বা Bug Bounty প্ৰগ্ৰামত আবেদন কৰক'],
  },
  product_coordinator: {
    phase1En: ['Complete Google Project Management Professional Certificate (Coursera)', 'Learn Agile/Scrum: sprint planning, standups, retrospectives, backlog grooming', 'Understand product discovery: user research, personas, and competitive analysis', 'Practice Figma basics: wireframing and low-fidelity prototyping'],
    phase1As: ['Google Project Management Professional Certificate (Coursera) সম্পূৰ্ণ কৰক', 'Agile/Scrum শিকক: স্প্ৰিণ্ট পৰিকল্পনা, ষ্টেণ্ডাপ, ৰেট্ৰ\'স্পেক্টিভ', 'প্ৰডাক্ট ডিছকভাৰি বুজক: ব্যৱহাৰকাৰী গৱেষণা, পাৰছ\'না, প্ৰতিযোগিতামূলক বিশ্লেষণ', 'Figma-ৰ মূল ধাৰণা অনুশীলন কৰক: ৱায়াৰফ্ৰেমিং আৰু লো-ফিডেলিটি প্ৰ\'ট\'টাইপিং'],
    phase2En: ['Lead a team project end-to-end: define requirements, sprint plan, and ship it', 'Build a data-driven case study using basic SQL for product metrics', 'Complete JIRA + Confluence fundamentals and use them in a project', 'Get Certified Scrum Master (CSM) or Agile Certified Practitioner (PMI-ACP)'],
    phase2As: ['এটা দলীয় প্ৰকল্প সম্পূৰ্ণ নেতৃত্ব দিয়ক: প্ৰয়োজনীয়তা নিৰ্ধাৰণ, স্প্ৰিণ্ট পৰিকল্পনা, শিপমেণ্ট', 'প্ৰডাক্ট মেট্ৰিক্সৰ বাবে মূল SQL ব্যৱহাৰ কৰি ডাটা-চালিত কেছ ষ্টাডি নিৰ্মাণ কৰক', 'JIRA + Confluence শিকক আৰু এটা প্ৰকল্পত ব্যৱহাৰ কৰক', 'Certified Scrum Master (CSM) বা Agile Certified Practitioner (PMI-ACP) লাভ কৰক'],
    phase3En: ['Create a product portfolio: 2–3 documented case studies with metrics and decisions', 'Practice PM interview: product sense, metrics, root cause analysis', 'Network on LinkedIn with PMs, TPMs, and startup founders', 'Apply to Associate PM (APM), Business Analyst, and Tech PM internships'],
    phase3As: ['প্ৰডাক্ট পোৰ্টফলি\' তৈয়াৰ কৰক: মেট্ৰিক্স আৰু সিদ্ধান্ত সহ ২-৩টা কেছ ষ্টাডি', 'প্ৰডাক্ট মেনেজাৰ ইণ্টাৰভিউ অনুশীলন কৰক: প্ৰডাক্ট ছেন্স, মেট্ৰিক্স, ৰুট কজ বিশ্লেষণ', 'LinkedIn-ত PM, TPM আৰু ষ্টাৰ্টআপ প্ৰতিষ্ঠাপকৰ সৈতে নেটৱৰ্ক কৰক', 'Associate PM, Business Analyst আৰু Tech PM ইণ্টাৰ্নশ্বিপত আবেদন কৰক'],
  },
}

export function extractSkills(text) {
  const lower = text.toLowerCase()
  const found = {}
  const allFound = []
  Object.entries(SKILL_TAXONOMY).forEach(([category, keywords]) => {
    const matchedInCategory = keywords.filter((kw) => lower.includes(kw.toLowerCase()))
    found[category] = matchedInCategory
    allFound.push(...matchedInCategory)
  })
  return { skills: [...new Set(allFound)], byCategory: found }
}

function scoreRole(role, detectedSkills) {
  const lowerDetected = detectedSkills.map((s) => s.toLowerCase())
  const coreMatched = role.coreSkills.filter((s) => lowerDetected.includes(s))
  const niceMatched = role.niceToHave.filter((s) => lowerDetected.includes(s))
  const coreMissing = role.coreSkills.filter((s) => !lowerDetected.includes(s))
  const niceMissing = role.niceToHave.filter((s) => !lowerDetected.includes(s))
  const coreScore = (coreMatched.length / role.coreSkills.length) * 70
  const niceScore = (niceMatched.length / Math.max(role.niceToHave.length, 1)) * 30
  const matchPercentage = Math.round(Math.min(coreScore + niceScore, 100))
  return { ...role, matchPercentage, matchedSkills: [...coreMatched, ...niceMatched], missingCoreSkills: coreMissing, missingNiceSkills: niceMissing.slice(0, 4) }
}

export function analyzeResume(resumeText, language = 'en') {
  if (!resumeText || !resumeText.trim()) return null
  const { skills, byCategory } = extractSkills(resumeText)
  const totalSkills = skills.length
  const resumeScore = Math.min(10 + totalSkills * 4, 95)
  const scoredRoles = ROLE_PROFILES.map((role) => scoreRole(role, skills)).sort((a, b) => b.matchPercentage - a.matchPercentage)
  const domainScores = { frontend: (byCategory.frontend || []).length, backend: (byCategory.backend || []).length, ai_ml: (byCategory.ai_ml || []).length, cloud_devops: (byCategory.cloud_devops || []).length, cybersecurity: (byCategory.cybersecurity || []).length, data: (byCategory.database || []).length }
  const primaryDomain = Object.entries(domainScores).sort((a, b) => b[1] - a[1])[0]?.[0] || 'general'
  return { skills, byCategory, totalSkills, resumeScore, scoredRoles, primaryDomain, language }
}

export function generateRoadmap(analysis, targetRoleId, language = 'en') {
  const isAs = language === 'as'
  const role = ROLE_PROFILES.find((r) => r.id === targetRoleId) || ROLE_PROFILES[0]
  const templates = ROADMAP_TEMPLATES[targetRoleId] || ROADMAP_TEMPLATES.frontend_dev
  const phase1 = isAs ? templates.phase1As : templates.phase1En
  const phase2 = isAs ? templates.phase2As : templates.phase2En
  const phase3 = isAs ? templates.phase3As : templates.phase3En
  const scored = analysis?.scoredRoles?.find((r) => r.id === targetRoleId) || scoreRole(role, analysis?.skills || [])
  return {
    role,
    language,
    matchPercentage: scored.matchPercentage,
    missingCoreSkills: scored.missingCoreSkills || [],
    missingNiceSkills: scored.missingNiceSkills || [],
    phases: [
      { number: 1, titleEn: 'Phase 1: Foundation & Skill Gaps (30 Days)', titleAs: 'প্ৰথম পৰ্যায়: মূল ভিত্তি আৰু দক্ষতাৰ ফাঁক (৩০ দিন)', steps: phase1 },
      { number: 2, titleEn: 'Phase 2: Projects & Certifications (Month 2–3)', titleAs: 'দ্বিতীয় পৰ্যায়: ব্যৱহাৰিক প্ৰকল্প আৰু প্ৰমাণপত্ৰ (মাহ ২-৩)', steps: phase2 },
      { number: 3, titleEn: 'Phase 3: Placement Readiness & Applications (Month 4+)', titleAs: 'তৃতীয় পৰ্যায়: নিযুক্তি প্ৰস্তুতি আৰু আবেদন (মাহ ৪+)', steps: phase3 },
    ],
  }
}

export { ROLE_PROFILES, SKILL_TAXONOMY }
