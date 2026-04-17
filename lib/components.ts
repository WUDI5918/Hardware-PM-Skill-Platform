export type ComponentType = 'competitorRadar' | 'bomCalculator' | 'prdSpecs' | 'userStoryMap' | 'milestoneRoadmap' | 'compliance' | 'userRequirements' | 'stepBar' | 'table' | 'techRiskFmea' | 'productPrototype' | 'compAnalysis' | 'compComparison' | 'mpStages' | 'textBlock' | 'divider' | 'docHeader' | 'quoteBlock';

export interface ComponentDefinition {
  type: ComponentType;
  title: string;
  category: string;
  description: string;
  defaultData: any;
}

export const COMPONENT_DEFINITIONS: ComponentDefinition[] = [
  {
    type: 'docHeader',
    title: '文档表头',
    category: '通用排版',
    description: '用于文档开头，展示文档大标题、版本号、作者及日期等元信息。',
    defaultData: {
      title: '产品需求文档 (PRD)',
      version: 'V1.0',
      author: '产品经理',
      date: new Date().toISOString().split('T')[0]
    }
  },
  {
    type: 'textBlock',
    title: '多行文本',
    category: '通用排版',
    description: '通用的富文本或段落模块，用于记录文字性说明、背景概述等。',
    defaultData: {
      content: '在此输入具体的背景、目标、范围或其它详细文字说明...\n支持多行文字展示。'
    }
  },
  {
    type: 'quoteBlock',
    title: '重点引用',
    category: '通用排版',
    description: '用于高亮重要结论、名言警句或前置关键提示信息。',
    defaultData: {
      text: '“在满足核心用户诉求的同时，必须要严格控制硬件生产BOM成本。”',
      author: '项目委员会批注'
    }
  },
  {
    type: 'divider',
    title: '分割线',
    category: '通用排版',
    description: '章节与模块之间的视觉分隔，支持实线、虚线等样式。',
    defaultData: {
      style: 'solid',
      color: '#e2e8f0',
      thickness: 1,
      spacing: 'normal'
    }
  },
  {
    type: 'mpStages',
    title: '量产关键阶段',
    category: '规划与进度',
    description: '展示 EVT、DVT、PVT、MP 等硬件量产关键阶段的准入标准和核心任务。',
    defaultData: {
      stages: [
        {
          stage: 'EVT',
          name: 'Engineering Verification Test / 工程验证测试',
          cnDesc: '处于产品开发的早期阶段。主要用于验证产品的基本功能和原理设计是否可行。在这个阶段，工程师会找出并解决硬件底层设计上的根本性缺陷。',
          enDesc: 'The early stage of product development. It is primarily used to verify if the basic functions and conceptual design are feasible. Engineers identify and resolve fundamental flaws in the underlying hardware design.'
        },
        {
          stage: 'DVT',
          name: 'Design Verification Test / 设计验证测试',
          cnDesc: '在基本功能跑通后，重点验证产品的可靠性和稳定性。这个阶段会进行严格的测试，如高低温测试、跌落测试、防水防尘测试，以及申请各类安规认证（如 CE、FCC）。',
          enDesc: 'After basic functions are verified, the focus shifts to product reliability and stability. Strict testing is conducted, such as temperature extremes, drop tests, water/dust resistance, and applying for safety certifications (e.g., CE, FCC).'
        },
        {
          stage: 'PVT',
          name: 'Production Verification Test / 生产验证测试',
          cnDesc: '也被称为“小批量试产”。在这个阶段，产品会放到真实的工厂生产线上进行组装。主要目的是验证生产工艺、流水线作业流程，并评估生产良品率，为最后的规模化生产扫清障碍。',
          enDesc: 'Also known as a "pilot run." The product is assembled on actual factory production lines. The main goal is to verify the manufacturing process, assembly line procedures, and assess the production yield rate, clearing obstacles for final large-scale production.'
        },
        {
          stage: 'MP',
          name: 'Mass Production / 量产',
          cnDesc: '产品的软硬件设计、物料供应链和工厂生产工艺均已完全定型，正式进入大规模连续生产阶段，随后产品即可发货上市。',
          enDesc: 'The hardware/software design, material supply chain, and factory manufacturing processes are completely finalized. The product officially enters large-scale continuous production and is ready to be shipped to the market.'
        }
      ]
    }
  },
  {
    type: 'competitorRadar',
    title: '竞品雷达',
    category: '市场与竞品',
    description: '输入竞品名称和维度，生成雷达图直观对比分析。',
    defaultData: {
      dimensions: ['价格', '性能', '设计', '续航', '生态'],
      competitors: [
        { name: '本品', scores: [4, 5, 4, 3, 4] },
        { name: '竞品 A', scores: [5, 3, 3, 5, 2] }
      ]
    }
  },
  {
    type: 'bomCalculator',
    title: 'BOM 成本计算器',
    category: '研发与供应链',
    description: '计算 BOM 物料成本、良率以及总体利润。',
    defaultData: {
      items: [
        { name: 'PCBA (主板)', cost: 135.5 },
        { name: '显示屏', cost: 120.0 },
        { name: '电池', cost: 45.5 },
        { name: '外壳', cost: 25.0 }
      ],
      targetCost: 500.0,
      yieldRate: 0.95
    }
  },
  {
    type: 'prdSpecs',
    title: '核心参数 PRD Specs',
    category: '需求与规格',
    description: '定义硬件的物理尺寸、重量、环境规格等参数。',
    defaultData: {
      尺寸: '150 x 75 x 8 mm',
      重量: '180g',
      防水防尘: 'IP68',
      工作温度: '-10°C 至 50°C'
    }
  },
  {
    type: 'userStoryMap',
    title: '用户故事地图',
    category: '需求与规格',
    description: '映射用户角色、交互场景以及对应的硬件响应。',
    defaultData: {
      stories: [
        { role: '用户', action: '按下电源键', hardware: '电源按键', feedback: 'LED 亮起绿灯' },
        { role: '用户', action: '连接充电器', hardware: 'USB-C 接口', feedback: '屏幕显示充电图标' }
      ]
    }
  },
  {
    type: 'milestoneRoadmap',
    title: '硬件里程碑计划',
    category: '规划与进度',
    description: '规划 EVT、DVT、PVT、MP 等关键量产阶段。',
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
    title: '合规认证清单',
    category: '研发与供应链',
    description: '管理并追踪不同销售区域所需的各类强制认证。',
    defaultData: {
      regions: ['美国 (US)', '欧盟 (EU)', '日本 (Japan)', '中国 (CN)'],
      certifications: [
        { name: 'FCC', region: 'US', status: '进行中' },
        { name: 'CE', region: 'EU', status: '未启动' },
        { name: 'TELEC', region: 'Japan', status: '未启动' },
        { name: 'CCC', region: 'CN', status: '未启动' }
      ]
    }
  },
  {
    type: 'userRequirements',
    title: '用户需求收集',
    category: '需求与规格',
    description: '记录并整理来自不同渠道的用户需求、优先级和状态。',
    defaultData: {
      requirements: [
        { id: 'REQ-001', source: '市场调研', summary: '更长的电池续航', priority: '高', status: '已接纳' },
        { id: 'REQ-002', source: '销售反馈', summary: '降低设备发热', priority: '中', status: '评估中' },
        { id: 'REQ-003', source: '用户访谈', summary: '增加更多的表盘样式', priority: '低', status: '规划中' }
      ]
    }
  },
  {
    type: 'stepBar',
    title: '步骤条',
    category: '规划与进度',
    description: '展示流程步骤、进度及对应的时间节点。',
    defaultData: {
      currentStep: 2,
      steps: [
        { title: 'Step 1', description: '需求评审', date: '2024-01-10' },
        { title: 'Step 2', description: '原型设计', date: '2024-02-15' },
        { title: 'Step 3', description: '开发测试', date: '2024-03-20' }
      ]
    }
  },
  {
    type: 'table',
    title: '自定义表格',
    category: '文档与展示',
    description: '支持自定义行列数、表头文字与背景色的通用数据表格。',
    defaultData: {
      headerColor: '#f8fafc',
      headers: ['列 1', '列 2', '列 3'],
      rows: [
        ['数据 1', '数据 2', '数据 3'],
        ['数据 4', '数据 5', '数据 6']
      ]
    }
  },
  {
    type: 'techRiskFmea',
    title: '技术风险与 FMEA',
    category: '研发与供应链',
    description: '指导并记录产品硬件失效模式与影响分析的七步法。',
    defaultData: {
      items: [
        { step: '1', phase: '规划与准备', task: '定义范围', thinkingPoint: '哪些组件包含在内？哪些排除？' },
        { step: '2', phase: '结构分析', task: '系统分解', thinkingPoint: '将复杂系统拆解为：系统 -> 子系统 -> 部件。' },
        { step: '3', phase: '功能分析', task: '功能关联', thinkingPoint: '每个部件具体负责什么？（输入与输出是什么）。' },
        { step: '4', phase: '失效分析', task: '建立链接', thinkingPoint: '失效模式（坏了什么）-> 失效后果（有什么影响）-> 失效原因（为什么坏）。' },
        { step: '5', phase: '风险评价', task: '打分 (S/O/D)', thinkingPoint: '评估严重性、发生概率和检测能力。' },
        { step: '6', phase: '优化改进', task: '预防与探测', thinkingPoint: '针对高风险项，增加设计冗余或改进测试流程。' },
        { step: '7', phase: '结果记录', task: '文档化', thinkingPoint: '形成闭环报告，用于技术沉淀。' }
      ]
    }
  },
  {
    type: 'productPrototype',
    title: '产品原型',
    category: '需求与规格',
    description: '用于展示产品早期线框图、界面核心交互与测试重点。',
    defaultData: {
      showImage: true,
      imageUrl: 'https://images.unsplash.com/photo-1618761714954-0b8cd0026356?auto=format&fit=crop&q=80&w=800',
      prototypeName: 'V1.0 交互原型',
      description: '主要用于验证设备物理按键布局与核心屏幕页面流转，确认人机交互可用性。',
      targetAudience: '内部测试人员、种子体验用户',
      status: '设计验证阶段',
      features: [
        { name: '物理按键手感', notes: '测试按压行程与防误触设计。' },
        { name: 'OLED 屏幕视窗', notes: '验证强光下可视度与字体大小布局。' }
      ]
    }
  },
  {
    type: 'compAnalysis',
    title: '竞品分析',
    category: '市场与竞品',
    description: '针对主要竞品的优劣势、市场定位等进行深度的定性分析。',
    defaultData: {
      competitors: [
        {
          name: '竞品 Apple',
          positioning: '高端旗舰定位',
          strengths: '品牌认可度极高，软硬件生态闭环完善。',
          weaknesses: '售价相对高昂，部分硬件参数迭代趋于保守。'
        },
        {
          name: '竞品 Samsung',
          positioning: '全价位段覆盖，主打屏幕与影像差异化',
          strengths: '全球供应链整合能力顶尖，屏幕素质极佳。',
          weaknesses: '系统本地化体验存在短板。'
        }
      ]
    }
  },
  {
    type: 'compComparison',
    title: '竞品参数对比',
    category: '市场与竞品',
    description: '通过核心参数对照表，直观呈现产品间的硬规格差异。',
    defaultData: {
      products: ['本品', '竞品 A', '竞品 B'],
      features: [
        { name: '核心处理器', values: ['Snapdragon 8 Gen 3', 'A17 Pro', 'Dimensity 9300'] },
        { name: '电池与快充', values: ['5000mAh + 120W', '4422mAh + 27W', '5400mAh + 100W'] },
        { name: '机身重量', values: ['210g', '221g', '206g'] },
        { name: '指导售价', values: ['¥4999', '¥7999', '¥4599'] }
      ]
    }
  }
];
