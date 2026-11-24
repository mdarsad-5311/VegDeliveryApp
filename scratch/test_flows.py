import subprocess
import time
import xml.etree.ElementTree as ET

ADB = '/Users/kira/Library/Android/sdk/platform-tools/adb'

def sh(cmd):
    return subprocess.check_output(cmd, shell=True).decode('utf-8', errors='ignore')

def get_text_map():
    sh(f'{ADB} shell uiautomator dump /sdcard/w.xml')
    raw = sh(f'{ADB} shell cat /sdcard/w.xml')
    root = ET.fromstring(raw)
    items = []
    for n in root.iter('node'):
        t = n.attrib.get('text', '')
        d = n.attrib.get('content-desc', '')
        b = n.attrib.get('bounds', '')
        if (t or d) and b:
            coords = [int(x) for x in b.replace('][', ',').replace('[', '').replace(']', '').split(',') if x]
            if len(coords) == 4:
                cx = (coords[0] + coords[2]) // 2
                cy = (coords[1] + coords[3]) // 2
                items.append({'text': t, 'desc': d, 'cx': cx, 'cy': cy})
    return items

def tap_exact(target_text, delay=1.5):
    items = get_text_map()
    for item in items:
        if item['text'] == target_text or item['desc'] == target_text:
            print(f"Tapping exact match '{target_text}' at ({item['cx']}, {item['cy']})")
            sh(f"{ADB} shell input tap {item['cx']} {item['cy']}")
            time.sleep(delay)
            return True
    print(f"Could not find exact text '{target_text}'")
    return False

def assert_screen_has(keyword):
    items = get_text_map()
    for item in items:
        if keyword.lower() in item['text'].lower() or keyword.lower() in item['desc'].lower():
            print(f"✓ Confirmed screen contains '{keyword}'")
            return True
    raise AssertionError(f"Screen does not contain '{keyword}'")

def main():
    print('=== RUNNING AUTH & ONBOARDING REGRESSION SUITE ===')
    
    # 1. We are currently on Welcome Screen
    assert_screen_has('Fresh Vegetables at Your Doorstep')
    
    # 2. Tap Get Started -> Goes to Onboarding
    print('Testing Welcome -> Onboarding transition...')
    sh(f'{ADB} shell input tap 540 2137')
    time.sleep(1.5)
    assert_screen_has('Fresh & Organic')
    print('✓ Onboarding screen loaded successfully!')
    
    # 3. Test Onboarding 'Next' button
    print('Testing Onboarding slide navigation...')
    tap_exact('Next')
    time.sleep(1.0)
    assert_screen_has('Easy & Quick Ordering')
    print('✓ Slide 2 loaded!')
    
    # Tap Next again
    tap_exact('Next')
    time.sleep(1.0)
    assert_screen_has('Fast Home Delivery')
    print('✓ Slide 3 loaded!')
    
    # 4. Tap 'Get Started' on Slide 3 -> Goes to Login
    print('Testing Onboarding -> Login transition...')
    sh(f'{ADB} shell input tap 540 2269') # Get Started button on Slide 3
    time.sleep(1.5)
    assert_screen_has('Welcome Back!')
    print('✓ Login screen loaded successfully!')
    
    # 5. Tap 'Sign Up' -> Goes to Registration
    print('Testing Login -> Registration transition...')
    sh(f'{ADB} shell input tap 730 2270')
    time.sleep(1.5)
    assert_screen_has('Create Account')
    print('✓ Registration screen loaded successfully!')
    
    # 6. Tap 'Already have an account? Login' -> Returns to Login
    print('Testing Registration -> Back to Login...')
    sh(f'{ADB} shell input tap 730 2270')
    time.sleep(1.5)
    assert_screen_has('Welcome Back!')
    print('✓ Returned to Login screen successfully!')
    
    # 7. Tap 'Forgot Password?' -> Goes to Forgot Password
    print('Testing Login -> Forgot Password transition...')
    sh(f'{ADB} shell input tap 875 1455')
    time.sleep(1.5)
    assert_screen_has('registered mobile')
    print('✓ Forgot Password screen loaded successfully!')
    
    # 8. Tap 'Back to Login' -> Returns to Login
    print('Testing Forgot Password -> Back to Login...')
    sh(f'{ADB} shell input tap 540 2270')
    time.sleep(1.5)
    assert_screen_has('Welcome Back!')
    print('✓ Returned to Login screen successfully!')
    
    # 9. Log in with Quick Demo Fill
    print('Logging into Home via Demo Autofill...')
    sh(f'{ADB} shell input tap 540 1776')
    time.sleep(0.8)
    sh(f'{ADB} shell input tap 540 1634')
    time.sleep(2.5)
    assert_screen_has('Deliver to')
    print('✓ Home screen loaded successfully!')
    
    print('=== REGRESSION TEST COMPLETED 100% SUCCESSFULLY! ===')

if __name__ == '__main__':
    main()
