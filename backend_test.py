import requests
import sys
import json
from datetime import datetime

class LarrypixelsAPITester:
    def __init__(self, base_url="https://retroimg-maker.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.admin_token = None
        self.test_user = None
        self.test_code = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            
            if not success:
                details += f" (Expected: {expected_status})"
                try:
                    error_data = response.json()
                    details += f" - {error_data.get('detail', 'Unknown error')}"
                except:
                    details += f" - {response.text[:100]}"

            self.log_test(name, success, details)
            return success, response.json() if success and response.content else {}

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root API", "GET", "", 200)

    def test_admin_login(self):
        """Test admin login with correct password"""
        success, response = self.run_test(
            "Admin Login", 
            "POST", 
            "admin/login", 
            200,
            {"password": "Salam03"}
        )
        if success:
            self.admin_token = response.get('token')
        return success

    def test_admin_login_wrong_password(self):
        """Test admin login with wrong password"""
        return self.run_test(
            "Admin Login (Wrong Password)", 
            "POST", 
            "admin/login", 
            401,
            {"password": "wrongpassword"}
        )

    def test_admin_generate_code(self):
        """Test admin code generation"""
        success, response = self.run_test(
            "Admin Generate Code", 
            "POST", 
            "admin/generate-code", 
            200
        )
        if success:
            self.test_code = response.get('code')
        return success

    def test_admin_stats(self):
        """Test admin stats endpoint"""
        return self.run_test("Admin Stats", "GET", "admin/stats", 200)

    def test_admin_users(self):
        """Test admin users endpoint"""
        return self.run_test("Admin Users", "GET", "admin/users", 200)

    def test_admin_codes(self):
        """Test admin codes endpoint"""
        return self.run_test("Admin Codes", "GET", "admin/codes", 200)

    def test_verify_code_valid(self):
        """Test code verification with valid code"""
        if not self.test_code:
            self.log_test("Verify Valid Code", False, "No test code available")
            return False
        
        return self.run_test(
            "Verify Valid Code", 
            "POST", 
            "auth/verify-code", 
            200,
            {"code": self.test_code}
        )

    def test_verify_code_invalid(self):
        """Test code verification with invalid code"""
        return self.run_test(
            "Verify Invalid Code", 
            "POST", 
            "auth/verify-code", 
            404,
            {"code": "INVALID"}
        )

    def test_user_signup(self):
        """Test user signup with password"""
        timestamp = datetime.now().strftime("%H%M%S")
        username = f"testuser_{timestamp}"
        discord = f"testuser_{timestamp}#0000"
        password = "TestPass123!"
        
        success, response = self.run_test(
            "User Signup with Password", 
            "POST", 
            "auth/signup", 
            200,
            {"username": username, "discord_handle": discord, "password": password}
        )
        
        if success:
            self.test_user = response.get('user', {})
            self.test_user['username'] = username
            self.test_user['password'] = password
        return success

    def test_user_signup_duplicate(self):
        """Test user signup with duplicate username"""
        if not self.test_user:
            self.log_test("User Signup Duplicate", False, "No test user available")
            return False
            
        return self.run_test(
            "User Signup Duplicate", 
            "POST", 
            "auth/signup", 
            400,
            {"username": self.test_user['username'], "discord_handle": "duplicate#0000", "password": "AnotherPass123!"}
        )

    def test_user_login(self):
        """Test user login"""
        if not self.test_user:
            self.log_test("User Login", False, "No test user available")
            return False
            
        return self.run_test(
            "User Login", 
            "POST", 
            "auth/login", 
            200,
            {"username": self.test_user['username']}
        )

    def test_user_login_nonexistent(self):
        """Test user login with non-existent user"""
        return self.run_test(
            "User Login Non-existent", 
            "POST", 
            "auth/login", 
            404,
            {"username": "nonexistentuser"}
        )

    def test_user_profile(self):
        """Test user profile retrieval"""
        if not self.test_user:
            self.log_test("User Profile", False, "No test user available")
            return False
            
        return self.run_test(
            "User Profile", 
            "GET", 
            f"user/profile?username={self.test_user['username']}", 
            200
        )

    def test_user_daily_code(self):
        """Test daily code generation"""
        if not self.test_user:
            self.log_test("User Daily Code", False, "No test user available")
            return False
            
        return self.run_test(
            "User Daily Code", 
            "POST", 
            f"user/daily-code?username={self.test_user['username']}", 
            200
        )

    def test_user_image_created(self):
        """Test image creation increment"""
        if not self.test_user:
            self.log_test("User Image Created", False, "No test user available")
            return False
            
        return self.run_test(
            "User Image Created", 
            "POST", 
            f"user/image-created?username={self.test_user['username']}", 
            200
        )

    def test_user_my_codes(self):
        """Test user codes retrieval"""
        if not self.test_user:
            self.log_test("User My Codes", False, "No test user available")
            return False
            
        return self.run_test(
            "User My Codes", 
            "GET", 
            f"user/my-codes?username={self.test_user['username']}", 
            200
        )

    def test_leaderboard(self):
        """Test leaderboard endpoint"""
        return self.run_test("Leaderboard", "GET", "leaderboard", 200)

    def test_use_code(self):
        """Test using a code"""
        if not self.test_code or not self.test_user:
            self.log_test("Use Code", False, "No test code or user available")
            return False
            
        return self.run_test(
            "Use Code", 
            "POST", 
            f"auth/use-code?username={self.test_user['username']}", 
            200,
            {"code": self.test_code}
        )

    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting Larrypixels API Tests...")
        print(f"📡 Testing against: {self.base_url}")
        print("=" * 60)

        # Basic connectivity
        self.test_root_endpoint()
        
        # Admin tests
        print("\n🔐 ADMIN TESTS")
        self.test_admin_login()
        self.test_admin_login_wrong_password()
        self.test_admin_generate_code()
        self.test_admin_stats()
        self.test_admin_users()
        self.test_admin_codes()
        
        # Gateway tests
        print("\n🚪 GATEWAY TESTS")
        self.test_verify_code_valid()
        self.test_verify_code_invalid()
        
        # User auth tests
        print("\n👤 USER AUTH TESTS")
        self.test_user_signup()
        self.test_user_signup_duplicate()
        self.test_user_login()
        self.test_user_login_nonexistent()
        
        # User functionality tests
        print("\n⚙️ USER FUNCTIONALITY TESTS")
        self.test_user_profile()
        self.test_user_daily_code()
        self.test_user_image_created()
        self.test_user_my_codes()
        
        # Leaderboard tests
        print("\n🏆 LEADERBOARD TESTS")
        self.test_leaderboard()
        
        # Code usage tests
        print("\n🎫 CODE USAGE TESTS")
        self.test_use_code()

        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 TESTS COMPLETED: {self.tests_passed}/{self.tests_run} passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 ALL TESTS PASSED!")
            return 0
        else:
            print("⚠️ SOME TESTS FAILED!")
            print("\nFailed tests:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  - {result['test']}: {result['details']}")
            return 1

def main():
    tester = LarrypixelsAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())