const checkPin = require('./Utils/checkPin');
const Account = require('./Models/Accounts');
const mongoose = require('mongoose');

// Mock request object
const createMockRequest = (user, body) => ({
    user: user,
    body: body
});

// Test cases
async function testCheckPin() {
    console.log('=== TESTING CHECK PIN FUNCTION ===\n');

    try {
        // Test 1: User không cần PIN
        console.log('Test 1: User không cần PIN');
        const mockReq1 = createMockRequest(
            { role: 'Nhân Viên', _id: '507f1f77bcf86cd799439011' },
            { pin: '1234' }
        );

        try {
            await checkPin(mockReq1);
            console.log('✅ PASS: User không cần PIN - function return undefined');
        } catch (error) {
            console.log('❌ FAIL: User không cần PIN -', error.message);
        }

        // Test 2: Thiếu PIN
        console.log('\nTest 2: Thiếu PIN');
        const mockReq2 = createMockRequest(
            { role: 'Quản Lý Kho', _id: '507f1f77bcf86cd799439011' },
            {}
        );

        try {
            await checkPin(mockReq2);
            console.log('❌ FAIL: Thiếu PIN - không throw error');
        } catch (error) {
            console.log('✅ PASS: Thiếu PIN -', error.message);
        }

        // Test 3: ID không hợp lệ
        console.log('\nTest 3: ID không hợp lệ');
        const mockReq3 = createMockRequest(
            { role: 'Quản Lý Kho', _id: 'nonexistent' },
            { pin: '1234' }
        );

        try {
            await checkPin(mockReq3);
            console.log('❌ FAIL: ID không hợp lệ - không throw error');
        } catch (error) {
            console.log('✅ PASS: ID không hợp lệ -', error.message);
        }

        // Test 4: PIN không chính xác
        console.log('\nTest 4: PIN không chính xác');
        const mockReq4 = createMockRequest(
            { role: 'Quản Lý Kho', _id: '507f1f77bcf86cd799439011' },
            { pin: 'wrong' }
        );

        // Mock Account.findById để trả về PIN khác
        const originalFindById = Account.findById;
        Account.findById = function () {
            return {
                select: function () {
                    return Promise.resolve({
                        pin: '1234'
                    });
                }
            };
        };

        try {
            await checkPin(mockReq4);
            console.log('❌ FAIL: PIN không chính xác - không throw error');
        } catch (error) {
            console.log('✅ PASS: PIN không chính xác -', error.message);
        }

        // Test 5: PIN chính xác
        console.log('\nTest 5: PIN chính xác');
        const mockReq5 = createMockRequest(
            { role: 'Quản Lý Kho', _id: '507f1f77bcf86cd799439011' },
            { pin: '1234' }
        );

        try {
            await checkPin(mockReq5);
            console.log('✅ PASS: PIN chính xác - function return undefined');
        } catch (error) {
            console.log('❌ FAIL: PIN chính xác -', error.message);
        }

        // Test 6: PIN với khoảng trắng
        console.log('\nTest 6: PIN với khoảng trắng');
        const mockReq6 = createMockRequest(
            { role: 'Quản Lý Kho', _id: '507f1f77bcf86cd799439011' },
            { pin: ' 1234 ' }
        );

        try {
            await checkPin(mockReq6);
            console.log('✅ PASS: PIN với khoảng trắng - function return undefined');
        } catch (error) {
            console.log('❌ FAIL: PIN với khoảng trắng -', error.message);
        }

        // Test 7: Tài khoản không tồn tại
        console.log('\nTest 7: Tài khoản không tồn tại');
        const mockReq7 = createMockRequest(
            { role: 'Quản Lý Kho', _id: '507f1f77bcf86cd799439012' },
            { pin: '1234' }
        );

        // Mock Account.findById để trả về null
        Account.findById = function () {
            return {
                select: function () {
                    return Promise.resolve(null);
                }
            };
        };

        try {
            await checkPin(mockReq7);
            console.log('❌ FAIL: Tài khoản không tồn tại - không throw error');
        } catch (error) {
            console.log('✅ PASS: Tài khoản không tồn tại -', error.message);
        }

        // Restore original function
        Account.findById = originalFindById;

    } catch (error) {
        console.error('❌ Test failed with error:', error);
    }
}

// Run tests
testCheckPin(); 