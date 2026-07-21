// =====================================================
// DEPLOYMENT PROXY
// 
// Platforms like Render sometimes look for a 'server.js' 
// file right here in the root folder by default. 
// Since we moved our real server into the backend/ folder, 
// this tiny file simply acts as a bridge to start the real one!
// =====================================================

require('./backend/server.js');
