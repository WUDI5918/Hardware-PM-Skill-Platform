export type ComponentType = 'docHeader' | 'textBlock' | 'quoteBlock' | 'divider' | 'table' | 'alertBlock' | 'userRequirements' | 'userStoryMap' | 'marketAnalysis' | 'competitorRadar' | 'compAnalysis' | 'compComparison' | 'prdSpecs' | 'productPrototype' | 'bomCalculator' | 'compliance' | 'techRiskAnalysis' | 'fmeaAnalysis' | 'mpStages' | 'milestoneRoadmap' | 'stepBar';

export interface ComponentDefinition {
  type: ComponentType;
  title: string;
  category: string;
  description: string;
  defaultData: any;
}

export const COMPONENT_DEFINITIONS: ComponentDefinition[] = [
  // 1. 通用组件
  {
    type: 'docHeader',
    title: '文档表头',
    category: '通用组件',
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
    category: '通用组件',
    description: '通用的富文本或段落模块，用于记录文字性说明、背景概述等。',
    defaultData: {
      content: '在此输入具体的背景、目标、范围或其它详细文字说明...\n支持多行文字展示。'
    }
  },
  {
    type: 'quoteBlock',
    title: '重点引用',
    category: '通用组件',
    description: '用于高亮重要结论、名言警句或前置关键提示信息。',
    defaultData: {
      text: '“在满足核心用户诉求的同时，必须要严格控制硬件生产BOM成本。”',
      author: '项目委员会批注'
    }
  },
  {
    type: 'divider',
    title: '分割线',
    category: '通用组件',
    description: '章节与模块之间的视觉分隔，支持实线、虚线等样式。',
    defaultData: {
      style: 'solid',
      color: '#e2e8f0',
      thickness: 1,
      spacing: 'normal'
    }
  },
  {
    type: 'table',
    title: '表格',
    category: '通用组件',
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
    type: 'alertBlock',
    title: '警示',
    category: '通用组件',
    description: '用于展示警告、提示、成功或错误等醒目的状态信息。',
    defaultData: {
      alertType: 'warning',
      title: '注意风险',
      content: '这是一个警示信息，提醒阅读者高度关注当前的风险点。'
    }
  },

  // 2. 用户需求
  {
    type: 'userRequirements',
    title: '用户需求收集',
    category: '用户需求',
    description: '记录并整理来自不同渠道的用户需求、优先级和状态。支持灵活增删行列及自定义表头。',
    defaultData: {
      columns: [
        { id: 'id', name: '编号' },
        { id: 'module', name: '所属模块' },
        { id: 'source', name: '来源' },
        { id: 'summary', name: '需求描述' },
        { id: 'assignee', name: '负责人' },
        { id: 'version', name: '目标版本' },
        { id: 'priority', name: '优先级' },
        { id: 'status', name: '状态' }
      ],
      requirements: [
        { id: 'REQ-01', module: '电源管理', source: '市场调研', summary: '提升设备峰值续航能力', assignee: '张三', version: 'V1.0', priority: '高', status: '已实现' },
        { id: 'REQ-02', module: '结构散热', source: '售后反馈', summary: '改善发热问题，优化导热路径', assignee: '李四', version: 'V1.1', priority: '中', status: '开发中' },
        { id: 'REQ-03', module: '软件交互', source: '用户访谈', summary: '增加深色模式与自定义表盘', assignee: '王五', version: '-', priority: '低', status: '规划中' },
        { id: 'REQ-04', module: '平台生态', source: '内部规划', summary: '支持第三方应用消息通知推送', assignee: '待定', version: '-', priority: '中', status: '待评估' }
      ]
    }
  },
  {
    type: 'userStoryMap',
    title: '用户故事地图',
    category: '用户需求',
    description: '通过类似画布的交互，规划各个用户角色的主线与分支故事地图，支持自由拖拽排序。',
    defaultData: {
      personas: [
        {
          id: 'p_1',
          role: '初次体验的用户',
          mainLines: [
            {
              id: 'm_1',
              title: '步骤一：开机与初始化',
              branches: [
                { id: 'b_1', content: '长按实体电源键，明确感知到马达震动后开机' },
                { id: 'b_2', content: '屏幕亮起展示品牌的欢迎动画设计' }
              ]
            },
            {
              id: 'm_2',
              title: '步骤二：设备连接',
              branches: [
                { id: 'b_3', content: '扫码下载手机端控制App' },
                { id: 'b_4', content: '自动发现附近的蓝牙设备并实现一键配对' }
              ]
            }
          ]
        },
        {
          id: 'p_2',
          role: '日常重度使用者',
          mainLines: [
            {
              id: 'm_3',
              title: '核心场景：运动健康监测',
              branches: [
                { id: 'b_5', content: '在强阳光的户外依然清晰可见时间与心率' },
                { id: 'b_6', content: '开启跑步模式，实时记录配速与GPS轨迹' }
              ]
            },
            {
              id: 'm_4',
              title: '基础场景：日常通知',
              branches: [
                { id: 'b_7', content: '不用掏出手机，可以通过设备查阅微信消息通知' }
              ]
            }
          ]
        }
      ]
    }
  },

  // 3. 市场分析
  {
    type: 'marketAnalysis',
    title: '市场分析',
    category: '市场分析',
    description: '自由组合统计指标与图表，支持通过图表ID设置公式联动（如：var_sam * 0.1）。',
    defaultData: {
      widgets: [
        {
          id: 'v_tam',
          type: 'metric',
          title: '总潜在市场 (TAM)',
          value: '1000',
          formula: '',
          prefix: '¥',
          suffix: ' 亿'
        },
        {
          id: 'v_sam',
          type: 'metric',
          title: '可服务市场 (SAM)',
          value: '',
          formula: 'v_tam * 0.3',
          prefix: '¥',
          suffix: ' 亿'
        },
        {
          id: 'v_som',
          type: 'metric',
          title: '可获得市场 (SOM)',
          value: '',
          formula: 'v_sam * 0.1',
          prefix: '¥',
          suffix: ' 亿'
        },
        {
          id: 'c_trend',
          type: 'bar',
          title: '未来五年规模预测',
          data: [
            { label: '2024', value: 'v_som * 1.0' },
            { label: '2025', value: 'v_som * 1.5' },
            { label: '2026', value: 'v_som * 2.2' },
            { label: '2027', value: 'v_som * 3.5' }
          ]
        },
        {
          id: 'c_share',
          type: 'pie',
          title: '当前首发市场份额',
          data: [
            { label: '竞品A', value: '45' },
            { label: '竞品B', value: '30' },
            { label: '我司预期', value: 'v_som / (v_sam * 0.5) * 100' }
          ]
        }
      ]
    }
  },
  {
    type: 'competitorRadar',
    title: '竞品雷达',
    category: '市场分析',
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
    type: 'compAnalysis',
    title: '竞品分析',
    category: '市场分析',
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
    category: '市场分析',
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
  },

  // 4. 产品规格
  {
    type: 'prdSpecs',
    title: '核心参数',
    category: '产品规格',
    description: '定义硬件的物理尺寸、重量、环境规格等参数。',
    defaultData: {
      尺寸: '150 x 75 x 8 mm',
      重量: '180g',
      防水防尘: 'IP68',
      工作温度: '-10°C 至 50°C'
    }
  },
  {
    type: 'productPrototype',
    title: '产品原型',
    category: '产品规格',
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
    type: 'bomCalculator',
    title: 'BOM成本计算',
    category: '产品规格',
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
    type: 'compliance',
    title: '合规认证清单',
    category: '产品规格',
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

  // 5. 风险评估
  {
    type: 'techRiskAnalysis',
    title: '技术风险分析',
    category: '风险评估',
    description: '评估项目中可能遇到的技术障碍及应对策略。',
    defaultData: {
      risks: [
        { risk: '供应链短缺', probability: '高', impact: '严重', mitigation: '寻找备用供应商及提前备料' },
        { risk: '电池过热', probability: '低', impact: '致命', mitigation: '增加石墨烯散热层及限流保护机制' }
      ]
    }
  },
  {
    type: 'fmeaAnalysis',
    title: 'FMEA分析',
    category: '风险评估',
    description: '指导并记录产品硬件失效模式与影响分析。',
    defaultData: {
      items: [
        { phase: '结构层', failureMode: '外壳破裂', cause: '跌落冲击', effect: '进水/内部损坏', severity: 8, prevention: '加厚PC+ABS材料' }
      ]
    }
  },

  // 6. 计划节点
  {
    type: 'mpStages',
    title: '量产关键阶段',
    category: '计划节点',
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
    type: 'milestoneRoadmap',
    title: '里程碑计划',
    category: '计划节点',
    description: '规划关键的项目节点或版本迭代阶段。',
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
    type: 'stepBar',
    title: '步骤条',
    category: '计划节点',
    description: '展示流程步骤、进度及对应的时间节点。',
    defaultData: {
      currentStep: 2,
      steps: [
        { title: 'Step 1', description: '需求评审', date: '2024-01-10' },
        { title: 'Step 2', description: '原型设计', date: '2024-02-15' },
        { title: 'Step 3', description: '开发测试', date: '2024-03-20' }
      ]
    }
  }
];
