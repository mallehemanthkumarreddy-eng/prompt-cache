// PRISM_ENHANCED_CONFIG.ts
// Implementation constants for Enhanced Prism Protocol v2.0

// ============================================
// SPECTRUM - Available Models
// ============================================
export const SPECTRUM = {
  // Orchestrator
  'gemini-2.0-flash': {
    provider: 'Google',
    role: 'orchestrator',
    bestFor: ['routing', 'multimodal', 'speed'],
    speedTier: 3,
    tokenLimit: 32768,
  },
  
  // Specialists
  'gemini-3.0-pro': {
    provider: 'Google',
    role: 'analyst',
    bestFor: ['complex-analysis', 'long-context', 'research'],
    speedTier: 2,
    tokenLimit: 128000,
  },
  'claude-3.5-sonnet': {
    provider: 'Anthropic',
    role: 'writer',
    bestFor: ['writing', 'nuance', 'safety', 'creative'],
    speedTier: 2,
    tokenLimit: 200000,
  },
  'deepseek-r1': {
    provider: 'DeepSeek',
    role: 'reasoner',
    bestFor: ['reasoning', 'math', 'logic', 'chain-of-thought'],
    speedTier: 2,
    tokenLimit: 64000,
  },
  'llama-3.3-70b': {
    provider: 'Meta (Groq)',
    role: 'speed-general',
    bestFor: ['general-chat', 'summaries', 'speed'],
    speedTier: 3,
    tokenLimit: 8192,
  },
  'qwen-2.5-coder': {
    provider: 'Alibaba',
    role: 'coder',
    bestFor: ['code-generation', 'debugging', 'refactoring'],
    speedTier: 2,
    tokenLimit: 32768,
  },
} as const;

export type ModelId = keyof typeof SPECTRUM;

// ============================================
// COMPLEXITY LEVELS
// ============================================
export enum Complexity {
  SIMPLE = 'SIMPLE',       // Handle directly
  MODERATE = 'MODERATE',   // Single specialist
  COMPLEX = 'COMPLEX',     // Multi-specialist
  COUNCIL = 'COUNCIL',     // Parallel consensus
}

// ============================================
// SPECIALIST ROLES MAPPING
// ============================================
export const SPECIALIST_ROLES = {
  reasoner: 'deepseek-r1',
  writer: 'claude-3.5-sonnet',
  coder: 'qwen-2.5-coder',
  'speed-general': 'llama-3.3-70b',
  multimodal: 'gemini-2.0-flash',
  analyst: 'gemini-3.0-pro',
} as const;

// ============================================
// COUNCIL CONFIGURATION
// ============================================
export const COUNCIL_CONFIG = {
  models: ['claude-3.5-sonnet', 'llama-3.3-70b', 'deepseek-r1'] as ModelId[],
  synthesisMode: 'consensus' as 'consensus' | 'debate' | 'best-of',
  timeout: 30000, // ms
};

// ============================================
// PRISM SYSTEM INSTRUCTION
// ============================================
export const PRISM_SYSTEM_INSTRUCTION = `
You are Prism, the intelligent orchestrator of Scatter AI.

PRIME DIRECTIVES:
1. Analyze every request before acting
2. Classify complexity: SIMPLE | MODERATE | COMPLEX | COUNCIL
3. Route to specialists when complexity > SIMPLE
4. Synthesize multi-model outputs into cohesive responses
5. Act as HR Manager when user needs team configuration
6. Always explain your routing decisions briefly

WORKFLOW PATTERN:
1. RECEIVE → Intake user request
2. CLASSIFY → Determine complexity level
3. PLAN → Create execution plan with clear steps
4. DELEGATE → Assign tasks to specialist agents
5. MONITOR → Track progress, handle blockers
6. INTEGRATE → Combine results, resolve conflicts
7. VERIFY → Quality check, validate completeness
8. DELIVER → Present synthesized response to user

HR SYNTAX:
- Individual: ||SUGGEST_AGENT: ModelID|RoleName|JobDescription||
- Team: ||SUGGEST_CUSTOM_GROUP: {"name": "...", "roles": [...]}||
- Route: ||ROUTE: ModelID|TaskDescription||
- Council: ||ACTIVATE_COUNCIL: {"query": "...", "models": [...]}||

DECISION FRAMEWORK:
1. Favor user's existing team - Use hired agents before suggesting new ones
2. Prefer specialist over generalist - Route to the best-fit model
3. Optimize for quality over speed - Unless user specifies urgency
4. Consider token efficiency - Don't over-engineer simple tasks
5. Document routing decisions - Explain why specific models were chosen

CONSTRAINTS:
- Never fabricate model capabilities
- Always respect the Passive Protocol in groups
- Prioritize user's existing agents before suggesting new hires
- Keep orchestration overhead minimal for simple tasks

PERSONALITY:
- Professional but approachable
- Decisive in routing decisions
- Transparent about your reasoning
- Helpful in team-building conversations

AVAILABLE SPECTRUM: gemini-2.0-flash, gemini-3.0-pro, claude-3.5-sonnet, deepseek-r1, llama-3.3-70b, qwen-2.5-coder
`;

// ============================================
// COMMAND PARSERS (Regex patterns)
// ============================================
export const PRISM_COMMAND_PATTERNS = {
  SUGGEST_AGENT: /\|\|SUGGEST_AGENT:\s*([^|]+)\|([^|]+)\|([^|]+)\|\|/,
  SUGGEST_CUSTOM_GROUP: /\|\|SUGGEST_CUSTOM_GROUP:\s*(\{[\s\S]*?\})\|\|/,
  ROUTE: /\|\|ROUTE:\s*([^|]+)\|([^|]+)\|\|/,
  ACTIVATE_COUNCIL: /\|\|ACTIVATE_COUNCIL:\s*(\{[\s\S]*?\})\|\|/,
  EXECUTION_PLAN: /\|\|EXECUTION_PLAN:\s*(\{[\s\S]*?\})\|\|/,
  STATUS: /\|\|STATUS:\s*(\{[\s\S]*?\})\|\|/,
  HANDOFF: /\|\|HANDOFF:\s*(\{[\s\S]*?\})\|\|/,
  REMOVE_AGENT: /\|\|REMOVE_AGENT:\s*([^|]+)\|([^|]+)\|\|/,
  UPDATE_AGENT: /\|\|UPDATE_AGENT:\s*([^|]+)\|(\{[\s\S]*?\})\|\|/,
};

// ============================================
// TYPES
// ============================================
export interface ExecutionPlan {
  complexity: Complexity;
  subtasks: Subtask[];
  parallelizable?: number[];
  estimated_tokens?: number;
}

export interface Subtask {
  id: number;
  task: string;
  specialist: ModelId;
  blocking?: number[];
  status?: 'pending' | 'in-progress' | 'complete' | 'failed';
}

export interface AgentSuggestion {
  modelId: ModelId;
  roleName: string;
  jobDescription: string;
}

export interface TeamSuggestion {
  name: string;
  description: string;
  roles: {
    role: string;
    jd: string;
    modelId: ModelId;
  }[];
  interaction_mode: 'passive' | 'round-robin' | 'council';
}

export interface CouncilActivation {
  query: string;
  models: ModelId[];
  synthesis_mode: 'consensus' | 'debate' | 'best-of';
}

export interface StatusUpdate {
  phase: 'RECEIVE' | 'CLASSIFY' | 'PLAN' | 'DELEGATE' | 'MONITOR' | 'INTEGRATE' | 'VERIFY' | 'DELIVER';
  progress: string;
  current: string;
  blockers: string[];
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
export function parseAgentSuggestion(text: string): AgentSuggestion | null {
  const match = text.match(PRISM_COMMAND_PATTERNS.SUGGEST_AGENT);
  if (!match) return null;
  return {
    modelId: match[1].trim() as ModelId,
    roleName: match[2].trim(),
    jobDescription: match[3].trim(),
  };
}

export function parseTeamSuggestion(text: string): TeamSuggestion | null {
  const match = text.match(PRISM_COMMAND_PATTERNS.SUGGEST_CUSTOM_GROUP);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

export function parseExecutionPlan(text: string): ExecutionPlan | null {
  const match = text.match(PRISM_COMMAND_PATTERNS.EXECUTION_PLAN);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

export function parseCouncilActivation(text: string): CouncilActivation | null {
  const match = text.match(PRISM_COMMAND_PATTERNS.ACTIVATE_COUNCIL);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

export function getSpecialistForTask(taskType: string): ModelId {
  const taskMappings: Record<string, ModelId> = {
    'code': 'qwen-2.5-coder',
    'coding': 'qwen-2.5-coder',
    'debug': 'qwen-2.5-coder',
    'write': 'claude-3.5-sonnet',
    'writing': 'claude-3.5-sonnet',
    'creative': 'claude-3.5-sonnet',
    'reason': 'deepseek-r1',
    'math': 'deepseek-r1',
    'logic': 'deepseek-r1',
    'analyze': 'gemini-3.0-pro',
    'research': 'gemini-3.0-pro',
    'fast': 'llama-3.3-70b',
    'quick': 'llama-3.3-70b',
    'image': 'gemini-2.0-flash',
    'vision': 'gemini-2.0-flash',
  };
  
  const lowerTask = taskType.toLowerCase();
  for (const [key, model] of Object.entries(taskMappings)) {
    if (lowerTask.includes(key)) return model;
  }
  return 'llama-3.3-70b'; // Default fallback
}

export function classifyComplexity(message: string): Complexity {
  const wordCount = message.split(/\s+/).length;
  const hasMultipleTasks = /and|then|also|after|finally/i.test(message);
  const needsReasoning = /why|how|explain|analyze|compare/i.test(message);
  const isCodeRequest = /code|function|api|implement|build|create.*app/i.test(message);
  const isSimpleGreeting = /^(hi|hello|hey|thanks|ok|yes|no|sure)[\s!?.]*$/i.test(message);
  
  if (isSimpleGreeting || wordCount < 5) return Complexity.SIMPLE;
  if (hasMultipleTasks && isCodeRequest) return Complexity.COMPLEX;
  if (needsReasoning && hasMultipleTasks) return Complexity.COUNCIL;
  if (isCodeRequest || needsReasoning) return Complexity.MODERATE;
  return Complexity.SIMPLE;
}
