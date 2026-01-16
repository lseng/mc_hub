# Patch: Deploy Supabase Edge Function to Production

## Metadata
adw_id: `f45c6e6a`
review_change_request: `Issue #1: The Supabase edge function changes have not been deployed to production. The deployed function at https://fhbzarxmiftlubqznpcl.supabase.co/functions/v1/make-server-e08b724b is still running the old Gemini-based code. Testing the live endpoint with query 'What forms are available?' returns the old broken response: 'Got it. Tell me the role or topic and I'll pull the right forms, trainings, or guides.' with zero resources, instead of using Claude API for intent detection and returning actual resources. Resolution: Deploy the updated edge function to Supabase production using: cd supabase/functions && supabase functions deploy make-server-e08b724b. The local code changes are correct and complete, they just need to be deployed. Severity: blocker`

## Issue Summary
**Original Spec:** Not provided
**Issue:** The Supabase edge function has been updated locally to use Claude API for intent detection (commit e8c3d5a), but the production deployment at https://fhbzarxmiftlubqznpcl.supabase.co/functions/v1/make-server-e08b724b is still running the old Gemini-based code. The live endpoint returns broken responses with zero resources instead of properly detecting intent and returning actual resources using the Claude API.
**Solution:** Deploy the updated edge function to Supabase production. The local code in `supabase/functions/make-server-e08b724b/index.ts` is correct and complete - it uses Claude API for intent detection in the `/intent` endpoint (lines 401-518) and the `/chat` endpoint (lines 68-212) properly calls the intent endpoint and executes searches. This is purely a deployment issue.

## Files to Modify
No files need to be modified. This is a deployment-only task.

## Implementation Steps
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Verify Supabase CLI authentication
- Run `supabase --version` to confirm Supabase CLI is installed
- Run `supabase projects list` to verify authentication and see project ID

### Step 2: Deploy the edge function to production
- Navigate to the functions directory: `cd supabase/functions`
- Deploy the function: `supabase functions deploy make-server-e08b724b`
- Wait for deployment to complete and note the deployment URL

### Step 3: Verify the deployment
- Test the live endpoint with: `curl -X POST https://fhbzarxmiftlubqznpcl.supabase.co/functions/v1/make-server-e08b724b/chat -H "Content-Type: application/json" -d '{"q":"What forms are available?","role":"member"}'`
- Verify the response includes actual resources and uses Claude API (not the old broken response)
- Check that the response contains a `resources` array with actual data

## Validation
Execute every command to validate the patch is complete with zero regressions.

1. **Test live endpoint with sample query:**
   ```bash
   curl -X POST https://fhbzarxmiftlubqznpcl.supabase.co/functions/v1/make-server-e08b724b/chat -H "Content-Type: application/json" -d '{"q":"What forms are available?","role":"member"}'
   ```
   Expected: Response should contain resources and not the old broken message "Got it. Tell me the role or topic..."

2. **Test intent endpoint directly:**
   ```bash
   curl -X POST https://fhbzarxmiftlubqznpcl.supabase.co/functions/v1/make-server-e08b724b/intent -H "Content-Type: application/json" -d '{"q":"What forms are available?"}'
   ```
   Expected: Response should be JSON with `action: "call"` and search parameters

3. **Run TypeScript check to ensure no regressions:**
   ```bash
   cd supabase/functions/make-server-e08b724b && deno check index.ts
   ```
   Expected: No errors

## Patch Scope
**Lines of code to change:** 0 (deployment only)
**Risk level:** low (code is already verified locally, just needs deployment)
**Testing required:** Live endpoint validation with real queries to confirm Claude API integration is working in production
