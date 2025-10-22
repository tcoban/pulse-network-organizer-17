# Production Checklist: Azure AD & Microsoft 365 Integration

## 🚨 Critical: Remove Mock Mode Before Production

**Current Status**: All M365 integrations are running in **MOCK MODE** with simulated data.

Before deploying to production, you **MUST** complete the following steps:

---

## 1. Azure AD Application Registration

### Required Actions:
1. **Register Application in Azure AD**
   - Go to [Azure Portal](https://portal.azure.com) → Azure Active Directory → App registrations
   - Click "New registration"
   - Name: `KOF Contact Management System`
   - Supported account types: `Accounts in this organizational directory only (ETH Zurich only)`
   - Redirect URI: `https://olrjeneqkojowyyhqzln.supabase.co/auth/v1/callback`

2. **Configure API Permissions**
   Required Microsoft Graph API permissions:
   - `User.Read` (Delegated) - Sign in and read user profile
   - `User.Read.All` (Application) - Read all users' full profiles
   - `Contacts.Read` (Delegated) - Read user contacts
   - `Contacts.ReadWrite` (Delegated) - Read and write user contacts
   - `Calendars.Read` (Delegated) - Read user calendars
   - `Mail.Read` (Delegated) - Read user mail metadata

   **⚠️ Admin Consent Required**: Request tenant admin to grant consent for application permissions

3. **Create Client Secret**
   - Go to "Certificates & secrets" → "New client secret"
   - Description: `KOF CMS Production Secret`
   - Expiry: Choose appropriate duration (recommended: 24 months)
   - **⚠️ CRITICAL**: Copy the secret value immediately - it won't be shown again

4. **Note the Following Values**:
   - **Application (client) ID**: `XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX`
   - **Directory (tenant) ID**: `YYYYYYYY-YYYY-YYYY-YYYY-YYYYYYYYYYYY`
   - **Client Secret Value**: `secret~value~here`

---

## 2. Supabase Configuration

### A. Add Secrets to Supabase

Navigate to: [Supabase Edge Functions Secrets](https://supabase.com/dashboard/project/olrjeneqkojowyyhqzln/settings/functions)

Add the following secrets:

| Secret Name | Type | Value Source | Example |
|------------|------|--------------|---------|
| `AZURE_AD_CLIENT_ID` | **Application ID** | Azure AD App Registration | `a1b2c3d4-e5f6-7890-abcd-ef1234567890` |
| `AZURE_AD_CLIENT_SECRET` | **Secret Value** | Azure AD Client Secret | `abc123~XYZ789~def456` |
| `AZURE_AD_TENANT_ID` | **Directory ID** | Azure AD Tenant | `ethz.onmicrosoft.com` or tenant GUID |
| `MICROSOFT_GRAPH_API_SCOPE` | **API Scope** | Fixed value | `https://graph.microsoft.com/.default` |

**Security Notes**:
- Client secrets should be rotated every 12-24 months
- Never commit secrets to version control
- Use separate secrets for dev/staging/production environments

---

### B. Configure Supabase Auth Provider

1. Go to: [Supabase Authentication Providers](https://supabase.com/dashboard/project/olrjeneqkojowyyhqzln/auth/providers)
2. Enable "Azure" provider
3. Configure with:
   - **Azure Tenant ID**: `YYYYYYYY-YYYY-YYYY-YYYY-YYYYYYYYYYYY`
   - **Azure Client ID**: `XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX`
   - **Azure Secret**: `secret~value~here`

4. Add redirect URL to Azure AD:
   - Copy the redirect URL from Supabase Auth settings
   - Add it to Azure AD App Registration → Authentication → Redirect URIs

---

## 3. Update Edge Functions (Remove Mock Mode)

### Files to Modify:

#### `supabase/functions/sync-outlook-contacts/index.ts`
**Replace mock data fetch with real Microsoft Graph API call:**

```typescript
// REMOVE THIS (lines 30-55):
const mockOutlookContacts = [ ... ];

// REPLACE WITH:
const accessToken = await getGraphAccessToken(user.id);
const response = await fetch('https://graph.microsoft.com/v1.0/me/contacts', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
});
const { value: outlookContacts } = await response.json();
```

#### `supabase/functions/sync-calendar-events/index.ts`
**Replace mock calendar events with real Graph API call:**

```typescript
// REPLACE mock data with:
const accessToken = await getGraphAccessToken(user.id);
const startDateTime = new Date().toISOString();
const endDateTime = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

const response = await fetch(
  `https://graph.microsoft.com/v1.0/me/calendarView?startDateTime=${startDateTime}&endDateTime=${endDateTime}`,
  {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Prefer': 'outlook.timezone="UTC"',
    },
  }
);
const { value: calendarEvents } = await response.json();
```

#### `supabase/functions/sync-email-interactions/index.ts`
**Replace mock email data with real Graph API call:**

```typescript
// REPLACE mock data with:
const accessToken = await getGraphAccessToken(user.id);
const response = await fetch(
  'https://graph.microsoft.com/v1.0/me/messages?$top=100&$select=id,subject,sentDateTime,from,toRecipients',
  {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  }
);
const { value: messages } = await response.json();
```

### Create Shared Helper Function:

**New file**: `supabase/functions/_shared/graphAuth.ts`

```typescript
export async function getGraphAccessToken(userId: string): Promise<string> {
  // Implement OAuth 2.0 On-Behalf-Of flow or store refresh tokens
  // This requires storing user's refresh token in database after initial consent
  
  const clientId = Deno.env.get('AZURE_AD_CLIENT_ID')!;
  const clientSecret = Deno.env.get('AZURE_AD_CLIENT_SECRET')!;
  const tenantId = Deno.env.get('AZURE_AD_TENANT_ID')!;
  
  // Fetch user's refresh token from secure storage
  const refreshToken = await getUserRefreshToken(userId);
  
  const tokenResponse = await fetch(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
        scope: 'https://graph.microsoft.com/.default',
      }),
    }
  );
  
  const { access_token } = await tokenResponse.json();
  return access_token;
}
```

---

## 4. Database Updates

### Remove Mock Flags:
```sql
-- Update existing sync status to production mode
UPDATE public.m365_sync_status
SET is_mock = false;

-- Set default to false for new records
ALTER TABLE public.m365_sync_status
ALTER COLUMN is_mock SET DEFAULT false;
```

---

## 5. Frontend Updates

### Update `src/pages/Settings.tsx`

**Add Azure AD connection UI:**
- Add button "Connect Microsoft 365 Account"
- Implement OAuth flow redirect to Azure AD
- Store refresh token securely after successful auth
- Add "Disconnect" button to revoke access

### Update `src/components/SmartDashboard.tsx`

**Add upcoming meetings widget:**
- Query `calendar_events` table
- Filter events where `event_start > now()` and `event_start < now() + 7 days`
- Display with contact names, time, location
- Add "View Meeting Prep" button (Phase 2 feature)

---

## 6. Testing Checklist

### Pre-Production Testing:

- [ ] **Azure AD Login**: Test SSO with @ethz.ch email accounts
- [ ] **Contact Sync**: 
  - [ ] Create contact in Outlook → appears in app
  - [ ] Edit contact in app → updates in Outlook
  - [ ] Delete contact → handled gracefully
  - [ ] Conflict resolution (simultaneous edits)
- [ ] **Calendar Sync**:
  - [ ] Upcoming meetings display correctly
  - [ ] Contact detection works (matches email to contact)
  - [ ] Timezone handling is correct
- [ ] **Email Interactions**:
  - [ ] Email metadata syncs without content
  - [ ] Sentiment analysis runs
  - [ ] Privacy compliance (no email body stored)
- [ ] **Permissions**:
  - [ ] RLS policies prevent unauthorized access
  - [ ] Users only see their assigned contacts
  - [ ] Admin role can view all data
- [ ] **Performance**:
  - [ ] Sync completes within 30 seconds for 500 contacts
  - [ ] Dashboard loads in < 2 seconds
  - [ ] No rate limiting errors from Microsoft Graph API

---

## 7. Security & Compliance

### GDPR Requirements:
- [ ] Add consent form for M365 data processing
- [ ] Implement "Export my data" feature
- [ ] Add "Delete my M365 data" option
- [ ] Document data retention policy (suggest: 90 days for email metadata)
- [ ] Create privacy notice explaining what data is synced

### Data Security:
- [ ] All API calls use HTTPS
- [ ] Refresh tokens encrypted at rest
- [ ] Access tokens never logged
- [ ] RLS policies tested and verified
- [ ] Input validation on all user inputs
- [ ] SQL injection prevention verified

### Audit Logging:
- [ ] Log all sync operations (timestamp, user, records affected)
- [ ] Log authentication events
- [ ] Log admin actions
- [ ] Set up alerting for suspicious activity

---

## 8. Monitoring & Alerts

### Set Up Monitoring:
1. **Supabase Dashboard**: Monitor edge function errors
2. **Azure AD Logs**: Track authentication failures
3. **Application Insights** (optional): Detailed telemetry

### Alerts to Configure:
- [ ] Sync failures (> 5% error rate)
- [ ] Authentication failures (> 10 in 1 hour)
- [ ] API rate limiting (approaching Microsoft Graph limits)
- [ ] Database query performance degradation
- [ ] Disk space on Supabase project

---

## 9. Documentation

### Create User Documentation:
- [ ] How to connect Microsoft 365 account
- [ ] What data is synced and how often
- [ ] How to disconnect/revoke access
- [ ] Privacy and data handling explanation
- [ ] FAQ for common sync issues

### Create Admin Documentation:
- [ ] Azure AD app management
- [ ] How to rotate secrets
- [ ] Troubleshooting sync errors
- [ ] How to handle user permission requests
- [ ] Disaster recovery procedures

---

## 10. Deployment Plan

### Phased Rollout:
1. **Week 1**: Deploy to staging with 5 test users
2. **Week 2**: Fix issues, expand to 20 beta users
3. **Week 3**: Monitor performance, collect feedback
4. **Week 4**: Full production rollout with all users

### Rollback Plan:
- [ ] Keep mock mode code in separate branch
- [ ] Database migration rollback scripts prepared
- [ ] Feature flag to disable M365 sync without redeployment
- [ ] Communication plan for users if rollback needed

---

## Summary: What Needs to Change

| Component | Current State | Production State | Priority |
|-----------|--------------|------------------|----------|
| Azure AD App | ❌ Not created | ✅ Registered with permissions | **CRITICAL** |
| Supabase Secrets | ❌ Empty/missing | ✅ All 4 secrets configured | **CRITICAL** |
| Edge Functions | ⚠️ Mock data | ✅ Real Graph API calls | **CRITICAL** |
| Auth Provider | ❌ Email/password only | ✅ Azure AD SSO enabled | **HIGH** |
| Frontend OAuth | ❌ No M365 connection | ✅ Connect/disconnect UI | **HIGH** |
| Database Flags | ⚠️ is_mock=true | ✅ is_mock=false | **MEDIUM** |
| User Documentation | ❌ None | ✅ Complete docs | **MEDIUM** |
| Testing | ⚠️ Basic only | ✅ Full test suite | **MEDIUM** |
| Monitoring | ❌ None | ✅ Alerts configured | **LOW** |

---

## Key Differences: Application ID vs Client ID vs Secret vs API Key

### 🆔 Application ID (Client ID)
- **What**: Unique identifier for your Azure AD application
- **Format**: GUID (e.g., `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)
- **Public/Private**: **PUBLIC** - Safe to expose in frontend code
- **Used For**: Identifying your app in OAuth flows, API requests
- **Found In**: Azure AD → App registrations → Overview
- **Secret Name**: `AZURE_AD_CLIENT_ID`

### 🔑 Client Secret (Application Secret)
- **What**: Password for your application to authenticate with Azure AD
- **Format**: Random string (e.g., `abc123~XYZ789~def456`)
- **Public/Private**: **PRIVATE** - NEVER expose in frontend or version control
- **Used For**: Server-to-server authentication (edge functions)
- **Found In**: Azure AD → App registrations → Certificates & secrets
- **Expiry**: Must be rotated (typically 12-24 months)
- **Secret Name**: `AZURE_AD_CLIENT_SECRET`

### 🏢 Tenant ID (Directory ID)
- **What**: Unique identifier for ETH Zurich's Azure AD instance
- **Format**: GUID or domain (e.g., `ethz.onmicrosoft.com`)
- **Public/Private**: **SEMI-PUBLIC** - Not sensitive but organization-specific
- **Used For**: Specifying which Azure AD instance to authenticate against
- **Found In**: Azure AD → Overview → Tenant ID
- **Secret Name**: `AZURE_AD_TENANT_ID`

### 🔐 API Key (Not Used Here)
- **What**: Simple token for API authentication (not Azure AD concept)
- **Azure Equivalent**: Not applicable - Azure uses OAuth 2.0 tokens instead
- **Note**: Microsoft Graph doesn't use traditional "API keys"

---

## Quick Reference: Where Each Value Goes

```typescript
// Edge Function Example
const clientId = Deno.env.get('AZURE_AD_CLIENT_ID');        // ← Application ID (public)
const clientSecret = Deno.env.get('AZURE_AD_CLIENT_SECRET'); // ← Client Secret (PRIVATE!)
const tenantId = Deno.env.get('AZURE_AD_TENANT_ID');        // ← Tenant ID

// OAuth Token Request
const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
const body = {
  client_id: clientId,       // ← Application ID
  client_secret: clientSecret, // ← Client Secret (backend only!)
  grant_type: 'refresh_token',
  refresh_token: userRefreshToken,
  scope: 'https://graph.microsoft.com/.default',
};
```

---

## 🎯 Next Steps

1. ✅ **Immediate**: Complete Azure AD app registration
2. ✅ **This Week**: Add secrets to Supabase and test auth
3. ✅ **Next Week**: Update edge functions to use real Graph API
4. ✅ **Week 3**: Deploy to staging and test with real users
5. ✅ **Week 4**: Production rollout

---

**Last Updated**: 2025-01-10  
**Document Owner**: Development Team  
**Review Cycle**: Before each production deployment
