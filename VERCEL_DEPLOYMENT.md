# Vercel Deployment Environment Variables

When deploying to Vercel, you need to set these environment variables in the Vercel dashboard:

## Required Environment Variables:

### JWT Configuration
- `JWT_SECRET`: A strong secret key for JWT token signing (e.g., "your_super_secret_jwt_key_here_change_this_in_production")

### Google Sheets Configuration
- `GOOGLE_SHEET_ID`: The ID of your Google Sheet (e.g., "1Q9E894LFURKadLXYiW_pk_bvcKyTpd1xdb461vMG16s")

### Application Settings
- `NODE_ENV`: "production"

### Optional Settings
- `RFID_PORT`: Not used in serverless environment, but can be set for compatibility

## Setting Up Environment Variables in Vercel:

1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add each variable with its value
4. Select the appropriate environments (Production, Preview, Development)

## Google Sheets Setup:

1. Create a Google Sheet with the required structure
2. Share it with the service account email: `attendence@attendencd.iam.gserviceaccount.com`
3. Grant "Editor" permissions
4. Copy the Sheet ID from the URL
5. Use this ID for the GOOGLE_SHEET_ID environment variable

## Example Values:

```
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_2024
GOOGLE_SHEET_ID=1Q9E894LFURKadLXYiW_pk_bvcKyTpd1xdb461vMG16s
NODE_ENV=production
```