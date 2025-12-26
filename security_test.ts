#!/usr/bin/env -S deno run --allow-net

// ========================================
// SECURITY TESTING SCRIPT
// Comprehensive security tests for Wedding Invitation API
// ========================================

const BASE_URL = Deno.args[0] || 'http://localhost:8000';
const TENANTS = ['groom', 'bride'];

interface TestResult {
  name: string;
  category: string;
  passed: boolean;
  details: string;
}

const results: TestResult[] = [];

function log(emoji: string, message: string) {
  console.log(`${emoji} ${message}`);
}

async function test(name: string, category: string, fn: () => Promise<{ passed: boolean; details: string }>) {
  try {
    const result = await fn();
    results.push({ name, category, ...result });
    log(result.passed ? '✅' : '❌', `${category}: ${name} - ${result.details}`);
  } catch (error) {
    results.push({ name, category, passed: false, details: `Error: ${error.message}` });
    log('❌', `${category}: ${name} - Error: ${error.message}`);
  }
}

// ========================================
// 1. AUTHENTICATION TESTS
// ========================================
async function testAuthentication() {
  log('🔐', '=== AUTHENTICATION TESTS ===');

  // Test 1.1: Invalid password should be rejected
  await test('Invalid password rejected', 'Authentication', async () => {
    const res = await fetch(`${BASE_URL}/api/groom/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'wrongpassword123' })
    });
    const data = await res.json();
    return {
      passed: res.status === 401 && !data.token,
      details: res.status === 401 ? 'Invalid password correctly rejected' : `Unexpected status: ${res.status}`
    };
  });

  // Test 1.2: Empty password should be rejected
  await test('Empty password rejected', 'Authentication', async () => {
    const res = await fetch(`${BASE_URL}/api/groom/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: '' })
    });
    return {
      passed: res.status === 400 || res.status === 401,
      details: `Status ${res.status} for empty password`
    };
  });

  // Test 1.3: Missing password field should be rejected
  await test('Missing password field rejected', 'Authentication', async () => {
    const res = await fetch(`${BASE_URL}/api/groom/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    return {
      passed: res.status === 400 || res.status === 401,
      details: `Status ${res.status} for missing password`
    };
  });

  // Test 1.4: Valid default password should work (first time)
  await test('Valid default password works', 'Authentication', async () => {
    const res = await fetch(`${BASE_URL}/api/groom/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: '@KukuhAdmin2026' })
    });
    const data = await res.json();
    return {
      passed: res.status === 200 && data.token,
      details: res.status === 200 ? 'Default password accepted, token received' : `Status: ${res.status}`
    };
  });

  // Test 1.5: Bride admin should have different auth
  await test('Bride admin has separate auth', 'Authentication', async () => {
    const res = await fetch(`${BASE_URL}/api/bride/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: '@FitrianiAdmin2026' })
    });
    const data = await res.json();
    return {
      passed: res.status === 200 && data.token,
      details: res.status === 200 ? 'Bride default password accepted' : `Status: ${res.status}`
    };
  });
}

// ========================================
// 2. RATE LIMITING TESTS
// ========================================
async function testRateLimiting() {
  log('⏱️', '=== RATE LIMITING TESTS ===');

  // Test 2.1: Multiple rapid requests should be rate limited
  await test('Rate limiting works', 'Rate Limiting', async () => {
    const requests = [];
    for (let i = 0; i < 70; i++) {
      requests.push(fetch(`${BASE_URL}/api/groom/messages`));
    }
    const responses = await Promise.all(requests);
    const rateLimited = responses.some(r => r.status === 429);
    return {
      passed: rateLimited,
      details: rateLimited ? 'Rate limiting triggered after 60 requests' : 'Rate limiting not triggered (may need adjustment)'
    };
  });
}

// ========================================
// 3. INPUT VALIDATION / XSS TESTS
// ========================================
async function testInputValidation() {
  log('🛡️', '=== INPUT VALIDATION / XSS TESTS ===');

  // Test 3.1: XSS in message should be sanitized
  await test('XSS script tags sanitized', 'Input Validation', async () => {
    const xssPayload = '<script>alert("xss")</script>Test';
    const res = await fetch(`${BASE_URL}/api/groom/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: xssPayload,
        message: xssPayload,
        attendance: 'hadir',
        guestCount: 1
      })
    });
    const data = await res.json();
    const hasScript = JSON.stringify(data).includes('<script>');
    return {
      passed: !hasScript,
      details: hasScript ? 'Script tags NOT sanitized!' : 'XSS payload sanitized'
    };
  });

  // Test 3.2: HTML injection should be sanitized
  await test('HTML injection sanitized', 'Input Validation', async () => {
    const htmlPayload = '<img src=x onerror=alert(1)>';
    const res = await fetch(`${BASE_URL}/api/groom/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test',
        message: htmlPayload,
        attendance: 'hadir',
        guestCount: 1
      })
    });
    const data = await res.json();
    const hasImg = JSON.stringify(data).includes('onerror');
    return {
      passed: !hasImg,
      details: hasImg ? 'HTML event handlers NOT sanitized!' : 'HTML injection sanitized'
    };
  });

  // Test 3.3: SQL injection attempt (should not crash)
  await test('SQL injection safe', 'Input Validation', async () => {
    const sqlPayload = "'; DROP TABLE messages; --";
    const res = await fetch(`${BASE_URL}/api/groom/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: sqlPayload,
        message: 'Test',
        attendance: 'hadir',
        guestCount: 1
      })
    });
    return {
      passed: res.status !== 500,
      details: res.status === 500 ? 'Server error on SQL injection attempt!' : 'SQL injection handled safely'
    };
  });

  // Test 3.4: Very long input should be truncated
  await test('Long input truncated', 'Input Validation', async () => {
    const longInput = 'A'.repeat(5000);
    const res = await fetch(`${BASE_URL}/api/groom/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: longInput,
        message: 'Test',
        attendance: 'hadir',
        guestCount: 1
      })
    });
    const data = await res.json();
    const nameLength = data.data?.name?.length || 0;
    return {
      passed: nameLength <= 1000,
      details: `Name truncated to ${nameLength} characters`
    };
  });
}

// ========================================
// 4. AUTHORIZATION TESTS
// ========================================
async function testAuthorization() {
  log('🔒', '=== AUTHORIZATION TESTS ===');

  // Test 4.1: Unauthenticated delete should fail
  await test('Unauthenticated delete rejected', 'Authorization', async () => {
    const res = await fetch(`${BASE_URL}/api/groom/messages/test-id`, {
      method: 'DELETE'
    });
    return {
      passed: res.status === 401,
      details: res.status === 401 ? 'Correctly rejected unauthenticated delete' : `Unexpected status: ${res.status}`
    };
  });

  // Test 4.2: Groom token should not work for bride API
  await test('Cross-tenant auth rejected', 'Authorization', async () => {
    // First login as groom
    const loginRes = await fetch(`${BASE_URL}/api/groom/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: '@KukuhAdmin2026' })
    });
    const loginData = await loginRes.json();
    
    if (!loginData.token) {
      return { passed: false, details: 'Failed to get groom token' };
    }

    // Try to delete from bride's messages
    const res = await fetch(`${BASE_URL}/api/bride/messages/test-id`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${loginData.token}` }
    });
    return {
      passed: res.status === 401 || res.status === 403,
      details: res.status === 401 || res.status === 403 ? 'Cross-tenant auth correctly rejected' : `Unexpected status: ${res.status}`
    };
  });
}

// ========================================
// 5. TENANT ISOLATION TESTS
// ========================================
async function testTenantIsolation() {
  log('🏠', '=== TENANT ISOLATION TESTS ===');

  // Test 5.1: Invalid tenant should be rejected
  await test('Invalid tenant rejected', 'Tenant Isolation', async () => {
    const res = await fetch(`${BASE_URL}/api/hacker/messages`);
    return {
      passed: res.status === 400,
      details: res.status === 400 ? 'Invalid tenant correctly rejected' : `Unexpected status: ${res.status}`
    };
  });

  // Test 5.2: Messages are isolated by tenant
  await test('Messages isolated by tenant', 'Tenant Isolation', async () => {
    // Post to groom
    await fetch(`${BASE_URL}/api/groom/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'IsolationTest_Groom',
        message: 'This is for groom only',
        attendance: 'hadir',
        guestCount: 1
      })
    });

    // Check bride's messages
    const brideRes = await fetch(`${BASE_URL}/api/bride/messages`);
    const brideData = await brideRes.json();
    const hasGroomMessage = brideData.guests?.some((g: any) => g.name === 'IsolationTest_Groom');
    
    return {
      passed: !hasGroomMessage,
      details: hasGroomMessage ? 'CRITICAL: Groom message visible in bride tenant!' : 'Messages correctly isolated'
    };
  });
}

// ========================================
// 6. SECURITY HEADERS TESTS
// ========================================
async function testSecurityHeaders() {
  log('📋', '=== SECURITY HEADERS TESTS ===');

  const res = await fetch(`${BASE_URL}/`);
  
  await test('X-Content-Type-Options header', 'Security Headers', async () => {
    return {
      passed: res.headers.get('X-Content-Type-Options') === 'nosniff',
      details: `Value: ${res.headers.get('X-Content-Type-Options')}`
    };
  });

  await test('X-Frame-Options header', 'Security Headers', async () => {
    return {
      passed: res.headers.get('X-Frame-Options') === 'DENY',
      details: `Value: ${res.headers.get('X-Frame-Options')}`
    };
  });

  await test('X-XSS-Protection header', 'Security Headers', async () => {
    const val = res.headers.get('X-XSS-Protection');
    return {
      passed: val?.includes('1'),
      details: `Value: ${val}`
    };
  });

  await test('CSP header present', 'Security Headers', async () => {
    const csp = res.headers.get('Content-Security-Policy');
    return {
      passed: !!csp,
      details: csp ? 'CSP header present' : 'CSP header missing!'
    };
  });
}

// ========================================
// 7. ANTI-SPAM TESTS
// ========================================
async function testAntiSpam() {
  log('🚫', '=== ANTI-SPAM TESTS ===');

  const testName = `AntiSpamTest_${Date.now()}`;
  
  // First message
  await fetch(`${BASE_URL}/api/groom/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: testName,
      message: 'First message',
      attendance: 'hadir',
      guestCount: 1
    })
  });

  // Immediate duplicate
  await test('Duplicate message blocked', 'Anti-Spam', async () => {
    const res = await fetch(`${BASE_URL}/api/groom/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: testName,
        message: 'Second message (spam)',
        attendance: 'hadir',
        guestCount: 1
      })
    });
    return {
      passed: res.status === 429,
      details: res.status === 429 ? 'Duplicate message correctly blocked' : `Status: ${res.status}`
    };
  });
}

// ========================================
// RUN ALL TESTS
// ========================================
async function runAllTests() {
  console.log('\n🔒 SECURITY TESTING SUITE 🔒');
  console.log(`Testing: ${BASE_URL}`);
  console.log('='.repeat(50) + '\n');

  await testAuthentication();
  await testRateLimiting();
  await testInputValidation();
  await testAuthorization();
  await testTenantIsolation();
  await testSecurityHeaders();
  await testAntiSpam();

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 SUMMARY');
  console.log('='.repeat(50));
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Score: ${Math.round((passed / results.length) * 100)}%`);
  
  if (failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  - [${r.category}] ${r.name}: ${r.details}`);
    });
  }
}

runAllTests();
