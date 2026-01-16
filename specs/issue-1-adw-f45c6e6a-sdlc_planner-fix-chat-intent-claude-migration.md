# Bug: AI Chat Not Working as Intended - Comprehensive Testing and Claude API Migration Required

## Metadata
issue_number: `1`
adw_id: `f45c6e6a`
issue_json: `{"number":1,"title":"AI Chat Not Working as Intended - Comprehensive Testing and Claude API Migration Required","body":"## Problem Summary\n\nThe AI chat assistant is not functioning as intended. When users ask questions about resources, forms, or guidance, the chat often fails to return relevant results and instead asks clarifying questions that don't lead to helpful responses.\n\n## Current Behavior (Broken)\n\n1. **Intent Detection Failing**: The chat uses Gemini for intent detection, but it's not properly recognizing search intents\n   - Example: \"What forms are available for leaders?\" returns \"Got it. Tell me the role or topic and I'll pull the right forms, trainings, or guides.\" instead of actual forms\n   - The `rag-search` endpoint works correctly when called directly - the issue is in the intent layer\n\n2. **Resource Discovery Issues**: Users can't easily find resources through natural conversation\n   - The `offer_resources` mode creates friction with Yes/No prompts\n   - Direct resource presentation would be more helpful\n\n3. **No Document Summaries**: AI doesn't provide intelligent summaries of documents or contextual guidance\n\n## API Key for Testing\n\nUse the Claude API key for all AI operations:\n```\n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\n```\n\n## Required Work\n\n### 1. Migrate from Gemini to Claude API\n- [ ] Update the `chat` edge function to use Claude API instead of Gemini\n- [ ] Improve intent detection accuracy using Claude's superior reasoning\n- [ ] Add proper conversation context handling\n\n### 2. Fix Intent Detection\n- [ ] Recognize search intents: \"show me\", \"find\", \"where is\", \"what forms\", \"resources for\", etc.\n- [ ] Automatically search when intent is clear (don't ask \"Do you want me to search?\")\n- [ ] Support role-based filtering in natural language: \"forms for coaches\", \"leader training materials\"\n\n### 3. Enhance Resource Presentation\n- [ ] Return resources directly when search intent is detected\n- [ ] Provide brief AI-generated summaries of why each resource is relevant\n- [ ] Group resources by type (forms, documents, media)\n\n### 4. Add Document Intelligence\n- [ ] Generate summaries for Google Docs and PDFs when requested\n- [ ] Provide contextual guidance based on document content\n- [ ] Answer specific questions about document contents\n\n## E2E Test Cases\n\n### Test Category 1: Basic Resource Discovery\n```\nTest 1.1: \"What forms are available?\"\nExpected: Returns list of forms from the forms section\n\nTest 1.2: \"Show me resources for leaders\"\nExpected: Returns resources filtered by leader role\n\nTest 1.3: \"Find the coach application\"\nExpected: Returns coach application form directly\n\nTest 1.4: \"What training materials do you have?\"\nExpected: Returns training-related documents and videos\n```\n\n### Test Category 2: Role-Based Queries\n```\nTest 2.1: \"I'm a new apprentice, what do I need?\"\nExpected: Returns apprentice-specific resources (applications, training guides)\n\nTest 2.2: \"Resources for coaches\"\nExpected: Returns coach-specific forms and guides\n\nTest 2.3: \"What does a leader need to know?\"\nExpected: Returns leader training materials and guides\n```\n\n### Test Category 3: Specific Document Queries\n```\nTest 3.1: \"Show me the MC Guide for this week\"\nExpected: Returns the most recent MC Guide document\n\nTest 3.2: \"What's in the coach check-in agenda?\"\nExpected: Returns summary of the Coach Check-In Agenda document\n\nTest 3.3: \"Summarize the winter 2026 training\"\nExpected: Returns summary of training content\n```\n\n### Test Category 4: Conversational Flow\n```\nTest 4.1: \"Hi\" followed by \"I need forms\"\nExpected: Greeting response, then forms list\n\nTest 4.2: \"What's MC Hub?\" followed by \"Show me the leader application\"\nExpected: Explanation, then specific resource\n\nTest 4.3: Multi-turn conversation maintaining context\nExpected: AI remembers previous context (role mentioned earlier)\n```\n\n### Test Category 5: Edge Cases\n```\nTest 5.1: Empty query\nExpected: Graceful handling with prompt for input\n\nTest 5.2: Query with no matching resources\nExpected: Helpful message suggesting alternatives\n\nTest 5.3: Very long query\nExpected: Handles gracefully, extracts key intent\n\nTest 5.4: Query with typos \"leder froms\"\nExpected: Fuzzy matching returns leader forms\n```\n\n### Test Category 6: Information Accuracy\n```\nTest 6.1: Verify returned resources exist and URLs work\nTest 6.2: Verify role filtering is accurate\nTest 6.3: Verify document summaries match actual content\nTest 6.4: Verify no hallucinated resources are returned\n```\n\n## Technical Details\n\n### Current Architecture\n- Frontend: `ChatInterface.tsx` calls `/api/chat`\n- Edge Function Router: `make-server-e08b724b` proxies to `chat` function\n- Chat Function: Uses Gemini for intent detection, then calls `rag-search`\n- Search: `rag-search` function works correctly\n\n### Endpoints to Test\n- `POST /api/chat` - Main chat endpoint\n- `POST /search` - Direct search endpoint (currently working)\n- `POST /kb-query` - Knowledge base queries\n- `POST /render-doc` - Google Docs proxy for summaries\n\n### Files to Modify\n- `supabase/functions/chat/index.ts` - Main chat logic (needs Claude migration)\n- `supabase/functions/make-server-e08b724b/index.ts` - Router (may need updates)\n- `src/components/ChatInterface.tsx` - Frontend (may need response handling updates)\n\n## Success Criteria\n\n1. All E2E test cases pass\n2. Users can find resources through natural conversation\n3. Intent detection accuracy > 95%\n4. Response time < 3 seconds for simple queries\n5. Document summaries are accurate and helpful\n6. No Gemini API calls remain (fully migrated to Claude)"}`

## Bug Description
The AI chat assistant in MC Hub is failing to properly detect user intent and return relevant resources. When users ask questions about resources, forms, or guidance, the system uses Gemini for intent detection but produces poor results. For example, asking "What forms are available for leaders?" returns a generic clarifying question instead of actual forms. The `rag-search` endpoint works correctly when called directly, indicating the issue is in the intent detection layer, not the search functionality itself.

Additionally, the current implementation creates friction with "offer_resources" mode that prompts users with Yes/No questions instead of directly presenting results. There is no document summarization capability for Google Docs or PDFs.

## Problem Statement
The chat intent detection layer using Gemini API is not accurately recognizing search intents from natural language queries. This causes the system to respond with clarifying questions instead of immediately searching and returning relevant resources. The intent router at `/make-server-e08b724b/intent` (lines 280-331 in `supabase/functions/make-server-e08b724b/index.ts`) needs to be migrated to Claude API and improved to handle common search patterns like "show me", "find", "what forms", "resources for", etc.

## Solution Statement
Migrate the intent detection system from Gemini to Claude API (using the provided API key) to improve accuracy and reasoning. Replace the current intent router with a Claude-based implementation that:
1. Directly recognizes search intents without requiring confirmation
2. Automatically calls the rag-search endpoint when search intent is detected
3. Supports role-based filtering and section filtering from natural language
4. Returns resources directly to users instead of using "offer_resources" mode
5. Provides AI-generated context for why resources are relevant

The fix will be surgical, focusing only on the intent detection layer in `supabase/functions/make-server-e08b724b/index.ts` without modifying the working `rag-search` functionality.

## Steps to Reproduce
1. Navigate to MC Hub application at http://localhost:5173
2. Open the chat interface
3. Enter query: "What forms are available for leaders?"
4. Observe the response: Instead of returning forms, it asks "Got it. Tell me the role or topic and I'll pull the right forms, trainings, or guides."
5. Try other queries like "Show me resources for leaders", "Find the coach application", "What training materials do you have?"
6. Observe that all produce similar unhelpful clarifying questions instead of actual results

## Root Cause Analysis
The root cause is in the `/make-server-e08b724b/intent` endpoint (lines 280-331):

1. **Gemini Model Limitations**: The current implementation uses `gemini-1.5-pro` which is not as effective at intent classification compared to Claude models.

2. **Insufficient Prompt Engineering**: The system prompt (lines 284-306) defines the intent schema but doesn't provide enough examples or patterns for the model to recognize common search phrases.

3. **Action:"call" Not Being Triggered**: The intent router is designed to use `action:"call"` with search calls, but Gemini is defaulting to `action:"talk"` too frequently, causing it to respond with clarifying questions instead of executing searches.

4. **Fallback Logic**: Lines 328-330 show a catch block that returns the generic "Got it. Tell me the role or topic..." message when JSON parsing fails, indicating Gemini may not be consistently returning valid JSON.

5. **Architectural Issue**: The actual upstream `/functions/v1/chat` function is being called by the router (lines 67-91), but we don't have visibility into its implementation. The intent endpoint appears to be a separate route that may not be integrated into the main chat flow properly.

## Relevant Files
Use these files to fix the bug:

- `supabase/functions/make-server-e08b724b/index.ts` (lines 280-331)
  - Contains the Gemini-based `/intent` endpoint that needs to be replaced with Claude
  - This is the primary file that requires modification
  - Need to replace Gemini API calls with Claude API calls
  - Improve the system prompt to better recognize search intents

- `src/components/ChatInterface.tsx` (lines 116-207)
  - Frontend component that calls the `/api/chat` endpoint
  - May need updates to handle improved response format
  - Currently handles `offer_resources` mode with Yes/No prompts (lines 181-194, 209-276, 379-406)
  - This mode should be removed in favor of direct resource presentation

- `README.md`
  - Contains project overview and setup instructions
  - Reference for understanding the project structure

- `.claude/commands/test_e2e.md`
  - E2E test runner instructions for validating the fix

- `.claude/commands/e2e/test_basic_query.md`
  - Example E2E test format to follow when creating new E2E test

- `.claude/commands/e2e/test_complex_query.md`
  - Example E2E test format showing complex query validation

### New Files

- `.claude/commands/e2e/test_chat_intent_detection.md`
  - New E2E test file to validate chat intent detection and resource discovery
  - Will test all 6 test categories specified in the bug report
  - Will validate that search intents are properly detected and resources are returned

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Update Intent Detection to Use Claude API

- Replace the Gemini-based intent detection endpoint at lines 280-331 in `supabase/functions/make-server-e08b724b/index.ts`
- Use the Claude API key: `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`
- Call Claude Messages API at `https://api.anthropic.com/v1/messages` with model `claude-3-5-sonnet-20241022`
- Add required headers: `x-api-key`, `anthropic-version: 2023-06-01`, `content-type: application/json`
- Improve the system prompt to better recognize search intents with explicit patterns:
  - "show me", "find", "where is", "what forms", "what resources", "resources for", "forms for", "training for", "guides for"
  - Role mentions: "coach", "leader", "apprentice", "member"
  - Section mentions: "forms", "documents", "media", "training", "guides"
- Default to `action:"call"` for any query that mentions resources, forms, documents, training, or roles
- Only use `action:"talk"` for pure greetings or completely unclear queries
- Ensure the response JSON schema matches the existing format with `action`, `message`, and `calls` fields

### Step 2: Update Chat Endpoint to Use Intent Detection and Call RAG Search Directly

- Modify the `/make-server-e08b724b/chat` endpoint (lines 67-91) to integrate intent detection
- When receiving a chat request, first call the updated `/intent` endpoint to determine user intent
- If `action:"call"` is returned with search calls, automatically execute the search by calling `/make-server-e08b724b/search` (rag-search)
- Construct the search payload from the intent's `calls[0].args` (query, role, section, etc.)
- Return the search results with resources directly to the frontend
- Add a brief AI-generated message explaining what was found using Claude
- Remove the `offer_resources` mode entirely - always return resources directly when found
- Ensure the response format includes both `text` (or `answer`) and `resources` array

### Step 3: Update Frontend to Remove Offer Resources Mode

- Remove the `offer_resources` mode handling from `ChatInterface.tsx` (lines 181-194)
- Remove the `pendingResourceOffer` state and related functions (lines 113, 183-188, 209-276)
- Remove the Yes/No action buttons UI (lines 378-406)
- Update the chat message handling to always display resources inline when present (keep lines 64-94 as-is)
- Ensure the frontend properly displays both the AI's text response and the resources array in a single message
- Test that resources appear immediately without requiring user confirmation

### Step 4: Create E2E Test File for Chat Intent Detection

- Read `.claude/commands/e2e/test_basic_query.md` and `.claude/commands/e2e/test_complex_query.md` to understand the E2E test format
- Create a new E2E test file at `.claude/commands/e2e/test_chat_intent_detection.md`
- Include test steps for all 6 test categories from the bug report:
  - Test Category 1: Basic Resource Discovery (4 test cases)
  - Test Category 2: Role-Based Queries (3 test cases)
  - Test Category 3: Specific Document Queries (3 test cases)
  - Test Category 4: Conversational Flow (3 test cases)
  - Test Category 5: Edge Cases (4 test cases)
  - Test Category 6: Information Accuracy (4 test cases)
- Each test step should include navigation, query input, result verification, and screenshots
- Verify that resources are returned immediately without Yes/No prompts
- Verify that the AI provides helpful context for why resources are relevant
- Specify success criteria: Intent detection accuracy > 95%, response time < 3 seconds, no clarifying questions for clear search intents
- Include at least 12 screenshots covering key test scenarios

### Step 5: Run Validation Commands

- Execute all validation commands listed in the "Validation Commands" section below to ensure the bug is fixed with zero regressions
- Verify that the intent detection correctly identifies search intents from natural language
- Verify that resources are returned directly without requiring user confirmation
- Verify that the E2E test passes all test categories
- Verify that no Gemini API calls remain in the codebase

## Validation Commands
Execute every command to validate the bug is fixed with zero regressions.

- `cd supabase/functions/make-server-e08b724b && deno check index.ts` - Type check the updated edge function to ensure no TypeScript errors
- `cd supabase && supabase functions serve make-server-e08b724b --no-verify-jwt --env-file .env.local` - Start the edge function locally to test the intent endpoint
- `curl -X POST http://localhost:54321/functions/v1/make-server-e08b724b/intent -H "Content-Type: application/json" -d '{"q":"What forms are available for leaders?"}' | jq` - Test intent detection with a sample query and verify it returns action:"call" with search parameters
- `curl -X POST http://localhost:54321/functions/v1/make-server-e08b724b/intent -H "Content-Type: application/json" -d '{"q":"Hello"}' | jq` - Test intent detection with a greeting and verify it returns action:"talk"
- `curl -X POST http://localhost:54321/functions/v1/make-server-e08b724b/chat -H "Content-Type: application/json" -d '{"q":"Show me resources for coaches","role":"member"}' | jq` - Test the chat endpoint and verify it returns resources directly
- `grep -n "GEMINI" supabase/functions/make-server-e08b724b/index.ts` - Verify Gemini API key is still available for the test endpoint but not used in intent or chat
- `grep -n "generativelanguage.googleapis.com" supabase/functions/make-server-e08b724b/index.ts` - Verify Gemini API is only called by the test endpoint, not by intent or chat
- `grep -n "offer_resources" src/components/ChatInterface.tsx` - Verify offer_resources mode has been removed from the frontend
- Read `.claude/commands/test_e2e.md`, then read and execute your new E2E `.claude/commands/e2e/test_chat_intent_detection.md` test file to validate this functionality works - Ensure all 21 test cases pass and screenshots are captured
- `npm run dev` - Start the development server to manually test the chat interface
- Test queries manually: "What forms are available?", "Show me resources for leaders", "Find the coach application", "What training materials do you have?" - Verify all return resources immediately
- `cd app/server && uv run pytest` - Run server tests to validate the bug is fixed with zero regressions (if server tests exist)
- `cd app/client && bun tsc --noEmit` - Run frontend tests to validate the bug is fixed with zero regressions (if TypeScript compilation exists)
- `cd app/client && bun run build` - Run frontend build to validate the bug is fixed with zero regressions (if build script exists)

## Notes

- **Claude API Key**: Use `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` for all Claude API calls
- **Model**: Use `claude-3-5-sonnet-20241022` (Claude 3.5 Sonnet) for intent detection - it provides excellent reasoning and function calling capabilities
- **API Endpoint**: Claude Messages API is at `https://api.anthropic.com/v1/messages`
- **Required Headers**: `x-api-key: <key>`, `anthropic-version: 2023-06-01`, `content-type: application/json`
- **Request Format**: Claude uses a different format than Gemini - use `{"model": "...", "max_tokens": 1024, "messages": [{"role": "user", "content": "..."}], "system": "..."}`
- **Response Format**: Claude returns `{"content": [{"type": "text", "text": "..."}], ...}` - extract the text from `content[0].text`
- **Keep Working Functionality**: The `rag-search` endpoint works correctly - do not modify it. Only change the intent detection and chat orchestration.
- **Surgical Fix**: This fix should only touch the intent detection logic and chat orchestration. Do not refactor or add unnecessary features.
- **No Backend Functions**: The actual `/functions/v1/chat` and `/functions/v1/rag-search` functions are deployed Supabase edge functions that we don't have source code for. We only modify the router/proxy function `make-server-e08b724b`.
- **Environment Variables**: The edge function uses `Deno.env.get()` for environment variables. Add `ANTHROPIC_API_KEY` to the environment or hardcode the key temporarily for this fix.
- **Testing**: The validation commands include both automated tests and manual testing. Ensure all pass before considering the bug fixed.
- **E2E Test**: The E2E test file should be comprehensive and cover all 21 test cases specified in the issue. This is critical for validating the fix.
- **Response Time**: Target < 3 seconds for simple queries. Claude API is typically fast, but consider caching or optimizing if needed.
- **Error Handling**: Add proper error handling for Claude API failures, rate limits, and network issues.
- **Fallback**: If Claude API fails, provide a graceful error message to the user instead of crashing.
