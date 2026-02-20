export interface Article {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  categorySlug: string;
  featuredImage: string;
  metaDescription: string;
  publishDate: string;
  author: string;
  featured: boolean;
  tags: string[];
  readTime: number;
  faq?: { question: string; answer: string }[];
}

export interface Resource {
  title: string;
  slug: string;
  description: string;
  category: string;
  coverImage: string;
  downloadUrl: string;
  publishDate: string;
}

export interface Category {
  name: string;
  slug: string;
  description: string;
}

export const categories: Category[] = [
  {
    name: 'Strategic Sourcing',
    slug: 'strategic-sourcing',
    description: 'Vendor selection, RFP processes, category management, and sourcing strategy.',
  },
  {
    name: 'Digital Transformation',
    slug: 'digital-transformation',
    description: 'AI in procurement, automation, e-procurement platforms, and digital tools.',
  },
  {
    name: 'Risk Management',
    slug: 'risk-management',
    description: 'Supply chain resilience, compliance, geopolitical risk, and business continuity.',
  },
  {
    name: 'Sustainability',
    slug: 'sustainability',
    description: 'ESG in procurement, circular economy, sustainable sourcing, and green supply chains.',
  },
  {
    name: 'Supplier Relationships',
    slug: 'supplier-relationships',
    description: 'SRM, collaboration, performance management, and supplier development.',
  },
  {
    name: 'Industry News',
    slug: 'industry-news',
    description: 'Market moves, regulations, notable deals, and procurement industry updates.',
  },
];

export const articles: Article[] = [
  {
    title: 'How AI Is Reshaping Procurement: 5 Trends to Watch in 2026',
    slug: 'ai-reshaping-procurement-2026-trends',
    excerpt: 'From autonomous sourcing agents to predictive supplier risk scoring, artificial intelligence is fundamentally changing how procurement teams operate. Here are the five trends that matter most.',
    content: `<p>Artificial intelligence has moved from pilot programs to production workflows in procurement organizations worldwide. What was once a novelty is now a competitive necessity, and 2026 is proving to be the year AI goes from "nice to have" to "must have" for procurement teams of every size.</p>
<h2>1. Autonomous Sourcing Agents</h2>
<p>AI-powered sourcing agents can now independently research suppliers, compare pricing across markets, and generate shortlists based on predefined criteria. These agents work around the clock, scanning thousands of supplier databases and market signals that would take human teams weeks to process.</p>
<h2>2. Predictive Supplier Risk Scoring</h2>
<p>Machine learning models are combining financial data, news sentiment, geopolitical indicators, and supply chain mapping to generate real-time risk scores for suppliers. Procurement teams can now identify potential disruptions before they happen, shifting from reactive to proactive risk management.</p>
<h2>3. Intelligent Contract Analysis</h2>
<p>Natural language processing has made it possible to analyze thousands of contracts in minutes, identifying unfavorable terms, compliance gaps, and renegotiation opportunities. This capability alone is saving organizations millions in previously overlooked contract leakage.</p>
<h2>4. Spend Analytics on Autopilot</h2>
<p>AI-driven spend classification has reached accuracy levels above 95%, enabling real-time spend visibility without manual categorization. Procurement leaders can now access accurate spend dashboards that update automatically as transactions flow through their systems.</p>
<h2>5. Conversational Procurement Interfaces</h2>
<p>Chatbot and voice interfaces are making procurement systems accessible to non-specialists. Requisitioners can now describe what they need in natural language, and AI handles supplier selection, compliance checks, and order placement automatically.</p>`,
    category: 'Digital Transformation',
    categorySlug: 'digital-transformation',
    featuredImage: '',
    metaDescription: 'Discover the 5 AI trends reshaping procurement in 2026, from autonomous sourcing agents to predictive risk scoring and intelligent contract analysis.',
    publishDate: '2026-02-18',
    author: 'SourcingTomorrow',
    featured: true,
    tags: ['AI', 'Automation', 'Technology'],
    readTime: 6,
    faq: [
      { question: 'How is AI being used in procurement?', answer: 'AI is being used for autonomous sourcing, predictive supplier risk scoring, intelligent contract analysis, automated spend classification, and conversational procurement interfaces.' },
      { question: 'What are the biggest AI trends in procurement for 2026?', answer: 'The five biggest trends are autonomous sourcing agents, predictive supplier risk scoring, intelligent contract analysis, spend analytics automation, and conversational procurement interfaces.' },
    ],
  },
  {
    title: 'Building a Resilient Supply Chain: Lessons from Recent Disruptions',
    slug: 'building-resilient-supply-chain-lessons',
    excerpt: 'The past five years have taught procurement professionals that resilience is not optional. Here\'s how leading organizations are building supply chains that can withstand the unexpected.',
    content: `<p>From pandemics to geopolitical conflicts to climate events, the past five years have been a masterclass in supply chain vulnerability. Organizations that invested in resilience before these disruptions hit were able to adapt faster and recover more completely than their peers.</p>
<h2>Diversification Is Non-Negotiable</h2>
<p>Single-source strategies that optimize for cost are giving way to multi-source approaches that balance cost with resilience. Leading procurement teams now maintain at least two qualified suppliers for every critical category, with geographic diversification as a key criterion.</p>
<h2>Visibility Beyond Tier 1</h2>
<p>Understanding your direct suppliers is no longer sufficient. Procurement teams need visibility into tier 2 and tier 3 suppliers to identify hidden concentration risks. Supply chain mapping technologies are making this possible at scale for the first time.</p>
<h2>Scenario Planning as a Core Competency</h2>
<p>The best procurement organizations run regular scenario planning exercises, stress-testing their supply chains against a range of disruption types. This practice turns risk management from a periodic audit into a continuous capability.</p>`,
    category: 'Risk Management',
    categorySlug: 'risk-management',
    featuredImage: '',
    metaDescription: 'Learn how to build a resilient supply chain from recent disruption lessons. Strategies for diversification, visibility, and scenario planning.',
    publishDate: '2026-02-15',
    author: 'SourcingTomorrow',
    featured: false,
    tags: ['Supply Chain', 'Risk', 'Resilience'],
    readTime: 5,
    faq: [
      { question: 'How can procurement teams build supply chain resilience?', answer: 'Key strategies include supplier diversification, multi-tier supply chain visibility, regular scenario planning exercises, and investing in supply chain mapping technologies.' },
    ],
  },
  {
    title: 'The Strategic Sourcing Playbook: From RFP to Partnership',
    slug: 'strategic-sourcing-playbook-rfp-to-partnership',
    excerpt: 'Modern strategic sourcing goes beyond selecting the lowest bidder. Here\'s how top procurement teams are building sourcing processes that create lasting supplier partnerships.',
    content: `<p>Strategic sourcing has evolved from a cost-reduction exercise to a value-creation discipline. The best procurement organizations understand that the real value isn't in squeezing suppliers on price — it's in building partnerships that drive innovation, quality, and mutual growth.</p>
<h2>Rethinking the RFP Process</h2>
<p>Traditional RFPs focus heavily on price and compliance. Modern RFPs incorporate innovation criteria, sustainability commitments, and partnership potential alongside commercial terms. This shift attracts suppliers who want to invest in the relationship, not just win on price.</p>
<h2>Total Value of Ownership</h2>
<p>Leading organizations have moved from Total Cost of Ownership (TCO) to Total Value of Ownership (TVO), which accounts for supplier innovation, responsiveness, risk mitigation, and sustainability contributions alongside direct costs.</p>
<h2>Collaborative Category Strategies</h2>
<p>The most effective category strategies are developed collaboratively with key stakeholders and suppliers, ensuring alignment across the organization and creating buy-in from the business units that will ultimately use the sourced goods and services.</p>`,
    category: 'Strategic Sourcing',
    categorySlug: 'strategic-sourcing',
    featuredImage: '',
    metaDescription: 'The modern strategic sourcing playbook. Learn how top procurement teams move from RFP processes to lasting supplier partnerships that drive value.',
    publishDate: '2026-02-10',
    author: 'SourcingTomorrow',
    featured: false,
    tags: ['Sourcing', 'RFP', 'Strategy'],
    readTime: 5,
  },
  {
    title: 'ESG in Procurement: Moving Beyond Compliance to Competitive Advantage',
    slug: 'esg-procurement-competitive-advantage',
    excerpt: 'Environmental, social, and governance criteria in procurement are shifting from regulatory requirements to strategic differentiators. Here\'s how to make sustainability a source of competitive advantage.',
    content: `<p>ESG considerations in procurement have moved well beyond the compliance checkbox. Organizations that treat sustainability as a strategic imperative — not just a regulatory burden — are finding that it drives cost savings, innovation, and brand value simultaneously.</p>
<h2>Scope 3 Emissions: The Procurement Imperative</h2>
<p>For most organizations, 70-80% of their carbon footprint sits in Scope 3 emissions — the emissions generated by their supply chain. This makes procurement the most important function for achieving corporate sustainability targets.</p>
<h2>Sustainable Sourcing as Innovation Driver</h2>
<p>When procurement teams challenge suppliers to reduce environmental impact, it often triggers innovation in materials, processes, and logistics that reduce costs as well. The sustainability conversation has become an innovation conversation.</p>
<h2>Measuring What Matters</h2>
<p>The shift from qualitative ESG assessments to quantitative, data-driven metrics is enabling procurement teams to make evidence-based decisions about supplier sustainability performance and track improvement over time.</p>`,
    category: 'Sustainability',
    categorySlug: 'sustainability',
    featuredImage: '',
    metaDescription: 'How to make ESG in procurement a competitive advantage, not just a compliance burden. Strategies for Scope 3 emissions, sustainable sourcing, and metrics.',
    publishDate: '2026-02-05',
    author: 'SourcingTomorrow',
    featured: false,
    tags: ['ESG', 'Sustainability', 'Green Procurement'],
    readTime: 5,
    faq: [
      { question: 'Why is ESG important in procurement?', answer: 'ESG is critical in procurement because 70-80% of most organizations\' carbon footprint sits in Scope 3 supply chain emissions. Procurement is the key function for achieving corporate sustainability targets.' },
    ],
  },
  {
    title: 'Supplier Relationship Management: The Key to Unlocking Innovation',
    slug: 'supplier-relationship-management-innovation',
    excerpt: 'Organizations that invest in genuine supplier relationships outperform their peers on cost, quality, and innovation. Here\'s how to build an SRM program that delivers real results.',
    content: `<p>Supplier relationship management (SRM) is one of the most talked-about but least effectively implemented capabilities in procurement. Many organizations claim to practice SRM, but few move beyond transactional management to the kind of strategic partnership that unlocks real innovation.</p>
<h2>Segmentation: Not All Suppliers Are Equal</h2>
<p>Effective SRM starts with honest segmentation. Not every supplier needs — or deserves — a strategic relationship. The goal is to identify the 10-15% of suppliers who are truly strategic and invest disproportionately in those relationships.</p>
<h2>Joint Value Creation</h2>
<p>The highest-performing supplier relationships focus on joint value creation rather than zero-sum negotiation. This means sharing market insights, co-investing in innovation, and aligning on long-term goals that benefit both parties.</p>
<h2>Performance Beyond KPIs</h2>
<p>While KPIs are important, the best SRM programs look beyond traditional metrics to assess relationship health, innovation pipeline, strategic alignment, and mutual trust. These softer measures often predict long-term value better than hard metrics.</p>`,
    category: 'Supplier Relationships',
    categorySlug: 'supplier-relationships',
    featuredImage: '',
    metaDescription: 'Build a supplier relationship management program that drives innovation. Learn segmentation, joint value creation, and performance management strategies.',
    publishDate: '2026-01-28',
    author: 'SourcingTomorrow',
    featured: false,
    tags: ['SRM', 'Supplier Management', 'Innovation'],
    readTime: 5,
  },
  {
    title: 'Federal Procurement Spending Hits Record $750B: What It Means for Suppliers',
    slug: 'federal-procurement-spending-record-2026',
    excerpt: 'U.S. federal procurement spending reached a new high in fiscal year 2025. Here\'s what the data shows and what it means for companies looking to win government contracts.',
    content: `<p>The U.S. federal government spent over $750 billion on contracts in fiscal year 2025, marking a new record driven by defense modernization, infrastructure investments, and technology upgrades across civilian agencies.</p>
<h2>Where the Money Is Going</h2>
<p>Defense-related procurement continues to dominate, accounting for roughly 60% of total contract spending. However, civilian agency spending is growing faster, particularly in IT modernization, cybersecurity, and infrastructure categories.</p>
<h2>Small Business Set-Asides Growing</h2>
<p>The government continues to increase its commitment to small business procurement, with set-aside contracts growing 8% year-over-year. This represents a significant opportunity for small and mid-sized companies looking to enter the federal market.</p>
<h2>How to Track Opportunities</h2>
<p>Tools like SAM.gov and USASpending.gov provide free access to federal procurement data. Procurement professionals can use these platforms to identify upcoming opportunities, track agency spending patterns, and research competitor contract wins.</p>`,
    category: 'Industry News',
    categorySlug: 'industry-news',
    featuredImage: '',
    metaDescription: 'U.S. federal procurement spending hits $750B record. Analysis of where the money is going and how suppliers can track government contract opportunities.',
    publishDate: '2026-01-20',
    author: 'SourcingTomorrow',
    featured: false,
    tags: ['Federal', 'Government', 'Spending'],
    readTime: 4,
    faq: [
      { question: 'How much does the U.S. government spend on procurement?', answer: 'The U.S. federal government spent over $750 billion on contracts in fiscal year 2025, with approximately 60% going to defense-related procurement.' },
      { question: 'How can I find federal procurement opportunities?', answer: 'SAM.gov provides free access to all published federal procurement opportunities, and USASpending.gov allows you to track agency spending patterns and contract awards.' },
    ],
  },
];

export const resources: Resource[] = [
  {
    title: 'The Complete RFP Template for Procurement Teams',
    slug: 'complete-rfp-template',
    description: 'A battle-tested RFP template that includes evaluation criteria, scoring matrices, and supplier response formats used by Fortune 500 procurement teams.',
    category: 'Template',
    coverImage: '',
    downloadUrl: '#',
    publishDate: '2026-02-01',
  },
  {
    title: 'Supplier Risk Assessment Framework',
    slug: 'supplier-risk-assessment-framework',
    description: 'A comprehensive framework for assessing and monitoring supplier risk across financial, operational, compliance, and geopolitical dimensions.',
    category: 'Guide',
    coverImage: '',
    downloadUrl: '#',
    publishDate: '2026-01-15',
  },
  {
    title: '2026 Procurement Technology Landscape Report',
    slug: '2026-procurement-technology-landscape',
    description: 'An overview of the procurement technology market in 2026, covering source-to-pay platforms, AI tools, analytics solutions, and emerging technologies.',
    category: 'Whitepaper',
    coverImage: '',
    downloadUrl: '#',
    publishDate: '2026-01-01',
  },
];
