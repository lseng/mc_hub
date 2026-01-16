# Patch: Fix SQL Query Filter Overwrite in Chat Endpoint

## Metadata
adw_id: `f45c6e6a`
review_change_request: `Issue #1: SQL query construction bug in /chat endpoint (supabase/functions/make-server-e08b724b/index.ts:117,131): The code sets URLSearchParams 'or' parameter twice. Line 117 sets is_published filter, but line 131 overwrites it with text search filter. Since .set() replaces the previous value, the is_published filter is lost when a text query is provided, potentially exposing unpublished/draft resources to users. Resolution: Combine both filters properly using PostgREST syntax. Use 'and' to require is_published AND match the text search. Example: url.searchParams.set('and', '(or.(is_published.eq.true,is_published.is.null),or.(title.ilike.*query*,description.ilike.*query*,tags.cs.{query}))'). Alternatively, remove the second 'or' set call and append conditions using PostgREST's logical operators. Severity: blocker`

## Issue Summary
**Original Spec:** `specs/issue-1-adw-f45c6e6a-sdlc_planner-fix-chat-intent-claude-migration.md`
**Issue:** The chat endpoint SQL query construction has a critical bug where line 131 overwrites the is_published filter set on line 117 because both use `.set('or', ...)` on the same parameter. This causes unpublished/draft resources to potentially be exposed when a text search query is provided.
**Solution:** Combine both filters using PostgREST's 'and' operator to require BOTH the is_published filter AND the text search filter to be applied simultaneously. This ensures unpublished resources are always filtered out regardless of whether a text query is provided.

## Files to Modify
Use these files to implement the patch:

- `supabase/functions/make-server-e08b724b/index.ts` (lines 117, 131)

## Implementation Steps
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Replace the dual 'or' parameter calls with a single 'and' parameter call
- Remove line 117: `url.searchParams.set("or", "(is_published.eq.true,is_published.is.null)");`
- Replace the conditional block at lines 130-132 to use 'and' instead of 'or'
- When searchPayload.query exists, combine both filters using PostgREST 'and' syntax:
  - `url.searchParams.set("and", "(or.(is_published.eq.true,is_published.is.null),or.(title.ilike.*${searchPayload.query}*,description.ilike.*${searchPayload.query}*,tags.cs.{${searchPayload.query}}))")`
- When searchPayload.query does not exist, set only the is_published filter:
  - `url.searchParams.set("or", "(is_published.eq.true,is_published.is.null)")`

### Step 2: Verify the fix with type checking
- Run `cd supabase/functions/make-server-e08b724b && deno check index.ts` to ensure no TypeScript errors
- Verify the PostgREST query syntax is correct and properly escapes special characters

## Validation
Execute every command to validate the patch is complete with zero regressions.

- `cd supabase/functions/make-server-e08b724b && deno check index.ts` - Type check the edge function to ensure no TypeScript errors
- `npm run build` - Validate the frontend build completes successfully with zero errors
- Manual testing: Test the chat endpoint with queries that include text search terms and verify only published resources are returned
- Manual testing: Test the chat endpoint with empty queries and verify only published resources are returned
- Review the SQL query parameters in browser dev tools or logs to confirm both filters are applied

## Patch Scope
**Lines of code to change:** 3-5 lines
**Risk level:** low
**Testing required:** Type checking validation, frontend build verification, manual testing of chat endpoint with and without text queries to ensure is_published filter is always applied
