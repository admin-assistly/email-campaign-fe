// Configuration for the application

export const config = {
  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    timeout: 10000, // 10 seconds
  },
  
  // App Configuration
  app: {
    name: 'CampaignMaster',
    description: 'Smart Email Campaigns Made Simple',
  },
  
  // Authentication Configuration
  auth: {
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    redirectAfterLogin: '/campaigns',
    redirectAfterLogout: '/login',
  },
}; 