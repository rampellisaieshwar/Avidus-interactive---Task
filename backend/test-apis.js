const mongoose = require('mongoose');
const User = require('./models/User');
const Task = require('./models/Task');
const ActivityLog = require('./models/ActivityLog');

const PORT = 5001;
const BASE_URL = `http://127.0.0.1:${PORT}`;

async function runTests() {
  console.log('Starting API integration tests...');
  
  // 1. Connect to MongoDB to set up roles
  await mongoose.connect('mongodb://127.0.0.1:27017/avidus_task');
  console.log('Connected to MongoDB directly for setup.');
  
  // Clear collections for clean test
  await User.deleteMany({});
  await Task.deleteMany({});
  await ActivityLog.deleteMany({});
  console.log('Cleared database test entries.');

  let userToken = '';
  let adminToken = '';
  let userId = '';
  let adminId = '';
  let taskId = '';

  try {
    // 2. Register normal user
    console.log('\n--- Test 1: Register User ---');
    const regUserRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'password123'
      })
    });
    const regUserData = await regUserRes.json();
    if (regUserRes.status !== 201) throw new Error(`Failed to register user: ${JSON.stringify(regUserData)}`);
    userId = regUserData._id;
    console.log(`Registered user: ${regUserData.username} (ID: ${userId})`);

    // 3. Register admin user
    console.log('\n--- Test 2: Register Admin ---');
    const regAdminRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'testadmin',
        email: 'testadmin@example.com',
        password: 'password123'
      })
    });
    const regAdminData = await regAdminRes.json();
    if (regAdminRes.status !== 201) throw new Error(`Failed to register admin: ${JSON.stringify(regAdminData)}`);
    adminId = regAdminData._id;
    
    // Promote user to admin in DB
    await User.findByIdAndUpdate(adminId, { role: 'Admin' });
    console.log(`Registered and promoted admin: ${regAdminData.username} (ID: ${adminId})`);

    // 4. Log in as user
    console.log('\n--- Test 3: User Login ---');
    const loginUserRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'testuser@example.com', password: 'password123' })
    });
    const loginUserData = await loginUserRes.json();
    if (loginUserRes.status !== 200) throw new Error(`User login failed: ${JSON.stringify(loginUserData)}`);
    userToken = loginUserData.token;
    console.log('User logged in successfully.');

    // 5. Log in as admin
    console.log('\n--- Test 4: Admin Login ---');
    const loginAdminRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'testadmin@example.com', password: 'password123' })
    });
    const loginAdminData = await loginAdminRes.json();
    if (loginAdminRes.status !== 200) throw new Error(`Admin login failed: ${JSON.stringify(loginAdminData)}`);
    adminToken = loginAdminData.token;
    console.log('Admin logged in successfully.');

    // 6. Test User restriction: User tries to access Admin route
    console.log('\n--- Test 5: Role Restriction ---');
    const accessDeniedRes = await fetch(`${BASE_URL}/api/admin/users`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const accessDeniedData = await accessDeniedRes.json();
    console.log(`User accessing admin endpoint response status: ${accessDeniedRes.status}`);
    if (accessDeniedRes.status !== 403) throw new Error('Expected 403 Forbidden for unauthorized admin access');
    console.log('Restriction test passed.');

    // 7. Test Admin access: Admin accesses Admin route
    console.log('\n--- Test 6: Admin Access ---');
    const adminAccessRes = await fetch(`${BASE_URL}/api/admin/users`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const adminAccessData = await adminAccessRes.json();
    if (adminAccessRes.status !== 200) throw new Error(`Admin access failed: ${JSON.stringify(adminAccessData)}`);
    console.log(`Admin accessed endpoint successfully. Found ${adminAccessData.length} users.`);

    // 8. User creates a task
    console.log('\n--- Test 7: Task Creation ---');
    const createTaskRes = await fetch(`${BASE_URL}/api/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        title: 'Task by User',
        description: 'Testing task creation'
      })
    });
    const createTaskData = await createTaskRes.json();
    if (createTaskRes.status !== 201) throw new Error(`Task creation failed: ${JSON.stringify(createTaskData)}`);
    taskId = createTaskData._id;
    console.log(`Task created successfully with ID: ${taskId}`);

    // 9. Admin views all tasks
    console.log('\n--- Test 8: Admin View All Tasks ---');
    const adminTasksRes = await fetch(`${BASE_URL}/api/admin/tasks`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const adminTasksData = await adminTasksRes.json();
    if (adminTasksRes.status !== 200) throw new Error(`Admin view tasks failed: ${JSON.stringify(adminTasksData)}`);
    console.log(`Admin fetched tasks. Total tasks count: ${adminTasksData.length}`);
    if (adminTasksData[0]._id !== taskId) throw new Error('Tasks list does not match created task ID');

    // 10. Admin deletes User's task
    console.log('\n--- Test 9: Admin Delete User Task ---');
    const adminDeleteRes = await fetch(`${BASE_URL}/api/tasks/${taskId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const adminDeleteData = await adminDeleteRes.json();
    if (adminDeleteRes.status !== 200) throw new Error(`Admin failed to delete task: ${JSON.stringify(adminDeleteData)}`);
    console.log('Admin successfully deleted user task.');

    // 11. User status toggle (Deactivation)
    console.log('\n--- Test 10: Deactivate User ---');
    const deactivateRes = await fetch(`${BASE_URL}/api/admin/users/${userId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'Inactive' })
    });
    const deactivateData = await deactivateRes.json();
    if (deactivateRes.status !== 200) throw new Error(`Deactivation failed: ${JSON.stringify(deactivateData)}`);
    console.log(`Deactivated user status successfully: ${deactivateData.user.status}`);

    // 12. Try logging in as deactivated user
    console.log('\n--- Test 11: Login Block for Inactive User ---');
    const loginInactiveRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'testuser@example.com', password: 'password123' })
    });
    const loginInactiveData = await loginInactiveRes.json();
    console.log(`Inactive user login response status: ${loginInactiveRes.status}`);
    if (loginInactiveRes.status !== 403) throw new Error('Expected 403 Forbidden for inactive user login');
    console.log('Login block test passed.');

    // 13. Reactivate user
    console.log('\n--- Test 12: Reactivate User ---');
    const activateRes = await fetch(`${BASE_URL}/api/admin/users/${userId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'Active' })
    });
    const activateData = await activateRes.json();
    if (activateRes.status !== 200) throw new Error(`Activation failed: ${JSON.stringify(activateData)}`);
    console.log(`Activated user status successfully: ${activateData.user.status}`);

    // 14. Check Activity logs
    console.log('\n--- Test 13: View Activity Logs ---');
    const logsRes = await fetch(`${BASE_URL}/api/admin/activity-logs`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const logsData = await logsRes.json();
    if (logsRes.status !== 200) throw new Error(`Failed to fetch activity logs: ${JSON.stringify(logsData)}`);
    console.log(`Fetched activity logs. Found ${logsData.length} records.`);
    console.log('Sample Log Actions recorded in DB:');
    logsData.forEach(log => {
      console.log(` - User: ${log.username} | Action: ${log.action} | Details: ${log.details}`);
    });

    console.log('\n=======================================');
    console.log('ALL INTEGRATION TESTS PASSED SUCCESSFULLY!');
    console.log('=======================================');

  } catch (error) {
    console.error('\n❌ TEST RUN FAILED:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('Closed direct database connection.');
    process.exit(0);
  }
}

// Introduce short delay before running to ensure server is listening
setTimeout(runTests, 1000);
