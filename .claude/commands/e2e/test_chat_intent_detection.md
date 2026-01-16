# E2E Test: Chat Intent Detection and Resource Discovery

Test comprehensive chat intent detection using Claude API and direct resource presentation in MC Hub.

## User Story

As a user
I want to find MC Hub resources through natural conversation
So that I can access forms, documents, and training materials without needing to know exact names or locations

## Test Category 1: Basic Resource Discovery

### Test 1.1: General Forms Query
1. Navigate to the `Application URL` (http://localhost:5173)
2. Take a screenshot of the initial state
3. **Verify** the MC Hub Assistant interface is loaded
4. Click on the chat input field
5. Enter the query: "What forms are available?"
6. Take a screenshot of the query input
7. Click Send or press Enter
8. **Verify** resources appear immediately without Yes/No prompts
9. **Verify** the response contains form-type resources
10. **Verify** an AI-generated message explains what was found
11. Take a screenshot of the results
12. **Verify** response time is < 3 seconds

### Test 1.2: Role-Filtered Resource Query
1. Clear the chat or continue from previous state
2. Enter: "Show me resources for leaders"
3. Take a screenshot of the query input
4. Click Send
5. **Verify** resources appear with leader-specific content
6. **Verify** no "Do you want me to search?" clarifying questions appear
7. Take a screenshot of the filtered results
8. **Verify** response time is < 3 seconds

### Test 1.3: Specific Form Query
1. Continue in the chat
2. Enter: "Find the coach application"
3. Take a screenshot of the query input
4. Click Send
5. **Verify** coach application form is returned
6. **Verify** results are directly displayed
7. Take a screenshot of the specific resource
8. **Verify** response time is < 3 seconds

### Test 1.4: Training Materials Query
1. Continue in the chat
2. Enter: "What training materials do you have?"
3. Take a screenshot of the query input
4. Click Send
5. **Verify** training-related documents and videos are returned
6. **Verify** resources are grouped or categorized clearly
7. Take a screenshot of the training resources
8. **Verify** response time is < 3 seconds

## Test Category 2: Role-Based Queries

### Test 2.1: Apprentice Resources
1. Continue in the chat or refresh page
2. Enter: "I'm a new apprentice, what do I need?"
3. Take a screenshot of the query input
4. Click Send
5. **Verify** apprentice-specific resources are returned (applications, training guides)
6. **Verify** the AI message contextualizes results for apprentices
7. Take a screenshot of apprentice resources
8. **Verify** no offer_resources mode prompt appears

### Test 2.2: Coach Resources
1. Continue in the chat
2. Enter: "Resources for coaches"
3. Take a screenshot of the query input
4. Click Send
5. **Verify** coach-specific forms and guides are returned
6. **Verify** results include coach-relevant materials
7. Take a screenshot of coach resources
8. **Verify** response is immediate without confirmation prompts

### Test 2.3: Leader Knowledge Query
1. Continue in the chat
2. Enter: "What does a leader need to know?"
3. Take a screenshot of the query input
4. Click Send
5. **Verify** leader training materials and guides are returned
6. **Verify** the response is helpful and contextual
7. Take a screenshot of leader resources
8. **Verify** response time is < 3 seconds

## Test Category 3: Specific Document Queries

### Test 3.1: Recent Document Query
1. Continue in the chat or refresh page
2. Enter: "Show me the MC Guide for this week"
3. Take a screenshot of the query input
4. Click Send
5. **Verify** the most recent MC Guide document is returned
6. **Verify** date information is visible if available
7. Take a screenshot of the document result
8. **Verify** response time is < 3 seconds

### Test 3.2: Document Summary Request
1. Continue in the chat
2. Enter: "What's in the coach check-in agenda?"
3. Take a screenshot of the query input
4. Click Send
5. **Verify** the Coach Check-In Agenda document is returned
6. **Verify** description or summary is provided
7. Take a screenshot of the document with summary
8. **Verify** no errors occur

### Test 3.3: Training Content Summary
1. Continue in the chat
2. Enter: "Summarize the winter 2026 training"
3. Take a screenshot of the query input
4. Click Send
5. **Verify** winter training content is returned
6. **Verify** the AI provides context about the training
7. Take a screenshot of the training summary
8. **Verify** response time is < 3 seconds

## Test Category 4: Conversational Flow

### Test 4.1: Greeting Followed by Query
1. Refresh the page to start fresh
2. Take a screenshot of the welcome state
3. Enter: "Hi"
4. Click Send
5. **Verify** the AI responds with a greeting (action: "talk")
6. Take a screenshot of the greeting response
7. Enter: "I need forms"
8. Click Send
9. **Verify** forms are immediately displayed
10. Take a screenshot of the forms list
11. **Verify** context is maintained between messages

### Test 4.2: General Question Then Specific Request
1. Continue in the chat or refresh
2. Enter: "What's MC Hub?"
3. Click Send
4. **Verify** the AI explains MC Hub (action: "talk")
5. Take a screenshot of the explanation
6. Enter: "Show me the leader application"
7. Click Send
8. **Verify** the leader application resource is returned
9. Take a screenshot of the specific resource
10. **Verify** no unnecessary clarifications are asked

### Test 4.3: Multi-Turn Context Maintenance
1. Continue in the chat
2. Enter: "I'm a coach"
3. Click Send (if it triggers a search, verify coach resources)
4. Take a screenshot
5. Enter: "What forms do I need?"
6. Click Send
7. **Verify** the system returns coach-specific forms
8. **Verify** the context of being a coach is maintained
9. Take a screenshot of contextual results
10. **Verify** response time is < 3 seconds

## Test Category 5: Edge Cases

### Test 5.1: Empty Query
1. Continue in the chat or refresh page
2. Click into the input field but don't type anything
3. Try to click Send (button should be disabled)
4. **Verify** the send button is disabled with empty input
5. Take a screenshot showing disabled state
6. **Verify** no error occurs

### Test 5.2: No Matching Resources
1. Continue in the chat
2. Enter: "Show me resources about underwater basket weaving"
3. Take a screenshot of the query
4. Click Send
5. **Verify** a helpful message appears suggesting alternatives
6. **Verify** no error or crash occurs
7. Take a screenshot of the "no results" message
8. **Verify** the message suggests what the user can search for

### Test 5.3: Very Long Query
1. Continue in the chat
2. Enter: "I'm looking for all the forms and documents and training materials that are available for leaders and coaches who are working with apprentices in the MC Hub system and need guidance on how to properly mentor and develop their teams"
3. Take a screenshot of the long query
4. Click Send
5. **Verify** the system handles the query gracefully
6. **Verify** key intent is extracted (forms, documents, training, leaders, coaches)
7. **Verify** relevant resources are returned
8. Take a screenshot of the results
9. **Verify** response time is < 5 seconds (allow extra time for long query)

### Test 5.4: Query with Typos
1. Continue in the chat
2. Enter: "leder froms"
3. Take a screenshot of the typo query
4. Click Send
5. **Verify** the system uses fuzzy matching
6. **Verify** leader forms are returned despite typos
7. Take a screenshot of the corrected results
8. **Verify** response time is < 3 seconds

## Test Category 6: Information Accuracy

### Test 6.1: Verify Resource URLs Work
1. Continue from any previous test with resources displayed
2. Click on a resource card
3. **Verify** the resource opens or displays correctly
4. Take a screenshot of the opened resource
5. Return to chat
6. Click on a different resource type
7. **Verify** it also opens correctly
8. Take a screenshot
9. **Verify** all returned resources have valid URLs

### Test 6.2: Verify Role Filtering Accuracy
1. Refresh the page
2. Enter: "Show me coach forms"
3. Click Send
4. Take a screenshot of the results
5. **Verify** all resources have "coach" in their roles array or are coach-relevant
6. **Verify** no unrelated resources appear
7. Enter: "Show me leader forms"
8. Click Send
9. Take a screenshot
10. **Verify** leader-specific filtering is accurate

### Test 6.3: Verify Document Descriptions Match Content
1. Continue in the chat
2. Enter: "What documents are available?"
3. Click Send
4. Take a screenshot of the document list
5. Select 2-3 documents and compare their descriptions
6. **Verify** descriptions accurately represent the document content
7. **Verify** no generic or placeholder descriptions
8. Take screenshots of selected documents

### Test 6.4: Verify No Hallucinated Resources
1. Continue in the chat
2. Enter: "Show me all available resources"
3. Click Send
4. Take a screenshot of all resources
5. **Verify** all resources exist in the database
6. **Verify** no made-up or hallucinated resources appear
7. **Verify** resource counts match database
8. Check console for any errors
9. Take a screenshot of the browser console

## Success Criteria

- Intent detection accuracy > 95% (at least 20 out of 21 test cases pass)
- Average response time < 3 seconds for simple queries
- No "offer_resources" mode prompts appear (resources shown directly)
- No "Do you want me to search?" clarifying questions for clear search intents
- Resources are displayed inline with AI-generated context
- All resource URLs are valid and functional
- Role filtering is accurate
- No hallucinated resources
- Graceful error handling for edge cases
- At least 35 screenshots captured covering all test categories
- No Gemini API calls detected in network tab (all using Claude API)
- Console shows successful Claude API intent detection calls

## Technical Validation

After completing all user-facing tests:

1. Open browser DevTools Network tab
2. Filter by "intent" to see intent detection calls
3. **Verify** all calls go to Claude API (anthropic.com)
4. **Verify** no calls to Gemini API (generativelanguage.googleapis.com) for intent or chat
5. Take a screenshot of network tab showing Claude API calls
6. Open Console tab
7. **Verify** no errors related to offer_resources mode
8. **Verify** intent detection logs show action: "call" for search queries
9. Take a screenshot of console logs
10. Check Response tab for a chat API call
11. **Verify** response includes both "text" and "resources" fields
12. **Verify** mode is "direct" or "talk", never "offer_resources"
13. Take a screenshot of response structure
