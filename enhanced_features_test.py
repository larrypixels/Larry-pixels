import requests
import sys
import json
from datetime import datetime

class EnhancedFeaturesTest:
    def __init__(self, base_url="https://retroimg-maker.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
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

    def run_test(self, name, method, endpoint, expected_status, data=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)

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

    def test_daily_limit_enforcement(self):
        """Test daily image limit (10 per day)"""
        print("\n🔒 TESTING DAILY LIMIT ENFORCEMENT")
        
        # Create a test user
        timestamp = datetime.now().strftime("%H%M%S")
        username = f"limituser_{timestamp}"
        
        # Signup user
        success, response = self.run_test(
            "Create Limit Test User", 
            "POST", 
            "auth/signup", 
            200,
            {"username": username, "discord_handle": f"{username}#0000"}
        )
        
        if not success:
            return False
            
        # Try to create 11 images (should fail on 11th)
        for i in range(11):
            success, response = self.run_test(
                f"Image Creation {i+1}/11", 
                "POST", 
                f"user/image-created?username={username}", 
                200 if i < 10 else 429  # Should fail on 11th attempt
            )
            
            if i < 10 and not success:
                print(f"❌ Failed at image {i+1} when should succeed")
                return False
            elif i == 10 and success:
                print(f"❌ Image 11 succeeded when should fail (daily limit)")
                return False
                
        return True

    def test_invitation_tracking(self):
        """Test invitation tracking and unlimited unlock"""
        print("\n👥 TESTING INVITATION TRACKING")
        
        timestamp = datetime.now().strftime("%H%M%S")
        inviter_username = f"inviter_{timestamp}"
        
        # Create inviter user
        success, response = self.run_test(
            "Create Inviter User", 
            "POST", 
            "auth/signup", 
            200,
            {"username": inviter_username, "discord_handle": f"{inviter_username}#0000"}
        )
        
        if not success:
            return False
            
        # Generate daily code for inviter
        success, response = self.run_test(
            "Generate Daily Code", 
            "POST", 
            f"user/daily-code?username={inviter_username}", 
            200
        )
        
        if not success:
            return False
            
        invite_code = response.get('code')
        if not invite_code:
            self.log_test("Get Invite Code", False, "No code returned")
            return False
            
        # Create invited user and use the code
        invited_username = f"invited_{timestamp}"
        success, response = self.run_test(
            "Create Invited User", 
            "POST", 
            "auth/signup", 
            200,
            {"username": invited_username, "discord_handle": f"{invited_username}#0000"}
        )
        
        if not success:
            return False
            
        # Use the invitation code
        success, response = self.run_test(
            "Use Invitation Code", 
            "POST", 
            f"auth/use-code?username={invited_username}", 
            200,
            {"code": invite_code}
        )
        
        if not success:
            return False
            
        # Check if inviter's count increased
        success, response = self.run_test(
            "Check Inviter Profile", 
            "GET", 
            f"user/profile?username={inviter_username}", 
            200
        )
        
        if success:
            invited_count = response.get('user', {}).get('invited_users_count', 0)
            if invited_count >= 1:
                self.log_test("Invitation Count Increment", True, f"Count: {invited_count}")
            else:
                self.log_test("Invitation Count Increment", False, f"Count still 0")
                return False
                
        return success

    def run_enhanced_tests(self):
        """Run all enhanced feature tests"""
        print("🚀 Starting Enhanced Features Tests...")
        print(f"📡 Testing against: {self.base_url}")
        print("=" * 60)

        # Test daily limits
        self.test_daily_limit_enforcement()
        
        # Test invitation tracking
        self.test_invitation_tracking()

        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 ENHANCED TESTS COMPLETED: {self.tests_passed}/{self.tests_run} passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 ALL ENHANCED TESTS PASSED!")
            return 0
        else:
            print("⚠️ SOME ENHANCED TESTS FAILED!")
            return 1

def main():
    tester = EnhancedFeaturesTest()
    return tester.run_enhanced_tests()

if __name__ == "__main__":
    sys.exit(main())