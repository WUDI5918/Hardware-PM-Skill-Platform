export type ComponentType = 'competitorRadar' | 'bomCalculator' | 'prdSpecs' | 'userStoryMap' | 'milestoneRoadmap' | 'compliance';

export interface ComponentDefinition {
  type: ComponentType;
  title: string;
  category: string;
  description: string;
  defaultData: any;
}

export const COMPONENT_DEFINITIONS: ComponentDefinition[] = [
  {
    type: 'competitorRadar',
    title: 'Competitor Radar',
    category: 'Market & Business',
    description: 'Input competitor names and dimensions to generate a radar chart.',
    defaultData: {
      dimensions: ['Price', 'Performance', 'Design', 'Battery', 'Ecosystem'],
      competitors: [
        { name: 'Our Product', scores: [4, 5, 4, 3, 4] },
        { name: 'Competitor A', scores: [5, 3, 3, 5, 2] }
      ]
    }
  },
  {
    type: 'bomCalculator',
    title: 'BOM Cost Calculator',
    category: 'Market & Business',
    description: 'Calculate BOM costs, yield, and margins.',
    defaultData: {
      items: [
        { name: 'PCBA', cost: 15.5 },
        { name: 'Display', cost: 22.0 },
        { name: 'Battery', cost: 8.5 },
        { name: 'Enclosure', cost: 5.0 }
      ],
      targetCost: 50.0,
      yieldRate: 0.95
    }
  },
  {
    type: 'prdSpecs',
    title: 'PRD Core Specs',
    category: 'Requirements & Specs',
    description: 'Define physical dimensions, weight, and environment specs.',
    defaultData: {
      dimensions: '150 x 75 x 8 mm',
      weight: '180g',
      ipRating: 'IP68',
      operatingTemp: '-10°C to 50°C'
    }
  },
  {
    type: 'userStoryMap',
    title: 'User Story Map',
    category: 'Requirements & Specs',
    description: 'Map out user roles, scenarios, and hardware interactions.',
    defaultData: {
      stories: [
        { role: 'User', action: 'Press Power Button', hardware: 'Power Key', feedback: 'LED turns green' },
        { role: 'User', action: 'Connect Charger', hardware: 'USB-C Port', feedback: 'Screen shows charging icon' }
      ]
    }
  },
  {
    type: 'milestoneRoadmap',
    title: 'Milestone Roadmap',
    category: 'R&D & Lifecycle',
    description: 'Plan EVT, DVT, PVT, MP phases.',
    defaultData: {
      phases: [
        { name: 'EVT', start: '2024-01-01', end: '2024-03-01', status: 'completed' },
        { name: 'DVT', start: '2024-03-15', end: '2024-05-15', status: 'in-progress' },
        { name: 'PVT', start: '2024-06-01', end: '2024-07-15', status: 'planned' },
        { name: 'MP', start: '2024-08-01', end: '2024-12-31', status: 'planned' }
      ]
    }
  },
  {
    type: 'compliance',
    title: 'Compliance & Certifications',
    category: 'R&D & Lifecycle',
    description: 'Manage required certifications by region.',
    defaultData: {
      regions: ['US', 'EU', 'Japan'],
      certifications: [
        { name: 'FCC', region: 'US', status: 'Pending' },
        { name: 'CE', region: 'EU', status: 'Not Started' },
        { name: 'TELEC', region: 'Japan', status: 'Not Started' }
      ]
    }
  }
];
