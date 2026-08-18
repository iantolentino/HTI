import {defineConfig,devices} from '@playwright/test';
export default defineConfig({testDir:'./e2e',use:{...devices['iPhone 13'],baseURL:'http://127.0.0.1:3100'},webServer:{command:'next dev -p 3100',url:'http://127.0.0.1:3100',reuseExistingServer:false}});
