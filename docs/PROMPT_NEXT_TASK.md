# Phase-Based Task Execution Prompt

## Instructions for Next Task Execution

Before starting any development work, you **MUST** follow this systematic approach:

### 1. =Ê Check Current Progress
- **ALWAYS** read `@docs/TASK_CHECKLIST.md` first to identify:
  - Current overall progress percentage
  - Which phase is the next to be worked on (look for first L **Not Started** phase)
  - Dependencies between phases
  - Any notes or blockers

### 2. =Ë Read Phase Specification  
- **ALWAYS** read the corresponding `@docs/phases/PHASE_XX_NAME.md` file for the current phase
- **FOLLOW THE EXACT SPECIFICATIONS** - do not deviate from the documented requirements
- Pay attention to:
  - **Objective**: What this phase aims to accomplish
  - **Tasks Breakdown**: The specific 4-5 subtasks to complete
  - **Deliverables**: Expected file structure and configurations
  - **Success Criteria**: How to verify completion
  - **Dependencies**: What this phase requires from previous phases

### 3. <¯ Phase Execution Protocol
1. **Update Phase Status**: Mark the phase as =á **In Progress** in `TASK_CHECKLIST.md`
2. **Create Todo List**: Use TodoWrite to create specific tasks from the phase specification
3. **Follow Specifications Exactly**: Implement only what is documented in the phase file
4. **Update Progress**: Mark individual tasks as completed in both todo list and phase file
5. **Verify Success Criteria**: Ensure all success criteria are met before marking phase complete
6. **Update Documentation**: Mark phase as  **Completed** and update progress percentages

### 4. =« Critical Requirements
- **NO SCOPE CREEP**: Only implement features explicitly listed in the current phase
- **NO SKIPPING PHASES**: Complete phases in the documented order due to dependencies
- **EXACT COMPLIANCE**: Follow the specifications precisely - don't add extra features
- **PROGRESS TRACKING**: Always update both TASK_CHECKLIST.md and the specific phase file

### 5. =Ý Documentation Updates Required
After completing each phase:
- [ ] Update `TASK_CHECKLIST.md` with new progress percentage
- [ ] Mark phase status as  **Completed** 
- [ ] Check all task items [x] in phase specification file
- [ ] Update time tracking in phase file
- [ ] Update **Last Updated** date in TASK_CHECKLIST.md

### 6. = Next Phase Identification
After completing a phase:
1. Check `TASK_CHECKLIST.md` for the next L **Not Started** phase
2. Verify all dependencies are met (check **Critical Path Dependencies** section)
3. If dependencies are not met, identify blocking issues
4. Read the next phase specification before starting work

## Current Status Reference

**Last Known Status**: Phase 1 completed (6.7% overall progress)
**Next Phase**: Phase 2 - Backend Foundation (L Not Started)

## Example Workflow

```
1. Read @docs/TASK_CHECKLIST.md ’ Identify Phase 2 is next
2. Read @docs/phases/PHASE_02_BACKEND_FOUNDATION.md ’ Understand requirements
3. Update TASK_CHECKLIST.md ’ Mark Phase 2 as =á In Progress  
4. Create TodoWrite with Phase 2's 4 tasks
5. Implement exactly what Phase 2 specifies (Express server, Socket.io, routing, testing)
6. Verify success criteria are met
7. Update both TASK_CHECKLIST.md and PHASE_02 file with completion
8. Check dependencies for Phase 3 before proceeding
```

---

**Remember**: This systematic approach ensures consistent progress tracking, prevents scope creep, and maintains alignment with the project's planned architecture and timeline.