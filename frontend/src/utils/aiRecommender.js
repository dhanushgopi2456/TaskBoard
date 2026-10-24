/**
 * AI Smart Recommendation & Auto-Fill Engine for TaskBoard
 * Provides intelligent task suggestions, automated content generation,
 * title enhancement, checklist generation, priority inference, and due date recommendation.
 */

export const AI_TASK_PRESETS = [
  {
    category: 'Engineering',
    label: 'WebGL Shader Optimization',
    title: 'Optimize Three.js WebGL particle shaders & FPS',
    description: `- [ ] Profile frame render times with Chrome DevTools\n- [ ] Reduce geometry vertex count and enable instanced meshes\n- [ ] Optimize mobile devicePixelRatio cap to 1.5\n- [ ] Verify 60-120 FPS on mobile and low-power devices`,
    priority: 'High',
    dueDays: 2,
  },
  {
    category: 'Engineering',
    label: 'Security & Auth Audit',
    title: 'Audit JWT session expiration & bcrypt hashing strength',
    description: `- [ ] Verify token expiration timing and refresh flow\n- [ ] Check SQL injection protections and parameterized queries\n- [ ] Validate strict user isolation on all REST endpoints\n- [ ] Add rate limiting headers to /api/auth/login`,
    priority: 'High',
    dueDays: 1,
  },
  {
    category: 'Engineering',
    label: 'Automated Test Coverage',
    title: 'Write automated Jest integration tests for task API',
    description: `- [ ] Add edge case test for empty task titles\n- [ ] Add user isolation test for cross-tenant access\n- [ ] Test status transitions (todo -> in_progress -> completed)\n- [ ] Ensure 100% pass rate in CI/CD pipeline`,
    priority: 'Medium',
    dueDays: 3,
  },
  {
    category: 'Design',
    label: 'Glassmorphism UX Polish',
    title: 'Polish dark mode glassmorphism & specular lighting',
    description: `- [ ] Enhance specular sheen highlight gradients on 3D tilt cards\n- [ ] Refine text contrast ratios for WCAG AAA compliance\n- [ ] Test frosted blur performance on Safari and Firefox\n- [ ] Fine-tune glow shadows for High/Medium/Low priority badges`,
    priority: 'Medium',
    dueDays: 2,
  },
  {
    category: 'Design',
    label: 'Mobile Responsive Audit',
    title: 'Audit touch micro-interactions & mobile tap ripples',
    description: `- [ ] Verify tap ripple bursts trigger on pointerdown\n- [ ] Ensure desktop cursor follower cleanly unmounts on touch\n- [ ] Verify bottom navigation ergonomics on iOS Safari\n- [ ] Test pull-to-refresh and scroll bounce behaviors`,
    priority: 'Medium',
    dueDays: 1,
  },
  {
    category: 'Productivity',
    label: 'Sprint Review & Backlog',
    title: 'Conduct weekly sprint review & clean completed backlog',
    description: `- [ ] Review completion rate analytics and weekly velocity\n- [ ] Identify and clear completed legacy tasks\n- [ ] Reprioritize overdue missions\n- [ ] Set 3 key objective milestones for the upcoming sprint`,
    priority: 'Low',
    dueDays: 4,
  },
  {
    category: 'Productivity',
    label: 'Production Release',
    title: 'Deploy TaskBoard production release with zero-downtime',
    description: `- [ ] Run production Vite bundle build and asset compression\n- [ ] Verify health check endpoint /api/health returns 200 OK\n- [ ] Verify database WAL mode migration on production server\n- [ ] Perform smoke test on live URL`,
    priority: 'High',
    dueDays: 0,
  },
  {
    category: 'Personal',
    label: 'Focus Deep Work Session',
    title: 'Execute 90-minute uninterrupted deep work block',
    description: `- [ ] Silence non-essential notifications\n- [ ] Tackle top High-priority mission without context switching\n- [ ] Take a 10-minute stretch break after Pomodoro completion\n- [ ] Document breakthrough learnings in workspace notes`,
    priority: 'Medium',
    dueDays: 0,
  },
];

/**
 * Intelligent AI Auto-Complete & Enhancement
 * Analyzes the user's input and expands it into a fully formed task
 */
export function generateAiTaskContent(inputPrompt = '') {
  const query = inputPrompt.trim().toLowerCase();

  // 1. Direct match with preset library
  for (const preset of AI_TASK_PRESETS) {
    if (
      preset.title.toLowerCase().includes(query) ||
      preset.label.toLowerCase().includes(query) ||
      (query.length >= 3 && preset.category.toLowerCase().includes(query))
    ) {
      return {
        title: preset.title,
        description: preset.description,
        priority: preset.priority,
        dueDays: preset.dueDays,
      };
    }
  }

  // 2. Keyword-based contextual AI generation
  if (query.includes('bug') || query.includes('fix') || query.includes('error') || query.includes('crash')) {
    return {
      title: inputPrompt.length > 5 ? `Fix: ${inputPrompt}` : 'Investigate & resolve critical application issue',
      description: `- [ ] Reproduce error condition with minimal test case\n- [ ] Inspect browser console and server application logs\n- [ ] Implement targeted fix with zero side effects\n- [ ] Verify resolution across multiple test environments`,
      priority: 'High',
      dueDays: 1,
    };
  }

  if (query.includes('deploy') || query.includes('release') || query.includes('launch') || query.includes('prod')) {
    return {
      title: inputPrompt.length > 5 ? `Release: ${inputPrompt}` : 'Deploy production release & verify health endpoints',
      description: `- [ ] Run full test suite and verify 0 regressions\n- [ ] Run production asset build with code-splitting\n- [ ] Push deployment and monitor server metrics\n- [ ] Conduct live verification on desktop and mobile`,
      priority: 'High',
      dueDays: 0,
    };
  }

  if (query.includes('design') || query.includes('ui') || query.includes('ux') || query.includes('logo') || query.includes('css')) {
    return {
      title: inputPrompt.length > 5 ? `Design: ${inputPrompt}` : 'Craft high-fidelity UI design & motion prototypes',
      description: `- [ ] Explore visual aesthetics and color hierarchy\n- [ ] Implement responsive layout with Tailwind CSS\n- [ ] Add spring physics animations via Motion\n- [ ] Verify accessibility contrast and dark mode clarity`,
      priority: 'Medium',
      dueDays: 2,
    };
  }

  if (query.includes('test') || query.includes('qa') || query.includes('audit')) {
    return {
      title: inputPrompt.length > 5 ? `QA: ${inputPrompt}` : 'Execute comprehensive test audit & validation',
      description: `- [ ] Create end-to-end user journey test scenarios\n- [ ] Validate API response payloads and HTTP error handling\n- [ ] Test mobile touch gestures and responsive breakpoints\n- [ ] Document edge cases and verify performance metrics`,
      priority: 'Medium',
      dueDays: 3,
    };
  }

  if (query.includes('meeting') || query.includes('call') || query.includes('sync') || query.includes('review')) {
    return {
      title: inputPrompt.length > 5 ? `Sync: ${inputPrompt}` : 'Prepare agenda & alignment sync for key stakeholders',
      description: `- [ ] Define 3 core decision items for discussion\n- [ ] Share pre-read document and workspace metrics\n- [ ] Document agreed action items and owners\n- [ ] Update Kanban board with follow-up milestones`,
      priority: 'Medium',
      dueDays: 1,
    };
  }

  if (query.includes('doc') || query.includes('readme') || query.includes('guide') || query.includes('write')) {
    return {
      title: inputPrompt.length > 5 ? `Docs: ${inputPrompt}` : 'Author comprehensive technical documentation & guides',
      description: `- [ ] Outline core architecture and data models\n- [ ] Write step-by-step onboarding guide\n- [ ] Include code snippets and interactive examples\n- [ ] Review spelling and verify all markdown links`,
      priority: 'Low',
      dueDays: 4,
    };
  }

  // 3. Fallback smart generic task enhancement
  const cleanTitle = inputPrompt ? inputPrompt.charAt(0).toUpperCase() + inputPrompt.slice(1) : 'Complete high-priority mission objective';
  return {
    title: cleanTitle.length < 8 ? `${cleanTitle} — Architecture & Implementation` : cleanTitle,
    description: `- [ ] Define milestone goals and success criteria\n- [ ] Execute primary implementation tasks\n- [ ] Perform peer review and quality check\n- [ ] Mark completed and celebrate progress 🎉`,
    priority: cleanTitle.toLowerCase().includes('important') ? 'High' : 'Medium',
    dueDays: 2,
  };
}

/**
 * Helper to compute ISO date string from offset days
 */
export function getIsoDateFromOffset(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

