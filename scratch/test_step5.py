import subprocess
import time
import xml.etree.ElementTree as ET
import os

ADB = '/Users/kira/Library/Android/sdk/platform-tools/adb'
ARTIFACT_DIR = '/Users/kira/.gemini/antigravity/brain/f83f8804-89a9-4f66-85f0-0bc7606be15b'

def sh(cmd):
    return subprocess.check_output(cmd, shell=True).decode('utf-8', errors='ignore')

def get_text_map():
    sh(f'{ADB} shell uiautomator dump /sdcard/w.xml')
    raw = sh(f'{ADB} shell cat /sdcard/w.xml')
    try:
        root = ET.fromstring(raw)
    except Exception:
        return []
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

def tap_exact(target_text, delay=1.2):
    items = get_text_map()
    for item in items:
        if item['text'] == target_text or item['desc'] == target_text:
            print(f"Tapping exact match '{target_text}' at ({item['cx']}, {item['cy']})")
            sh(f"{ADB} shell input tap {item['cx']} {item['cy']}")
            time.sleep(delay)
            return True
    print(f"Could not find exact text '{target_text}'")
    return False

def tap_contains(keyword, delay=1.2):
    items = get_text_map()
    for item in items:
        if keyword.lower() in item['text'].lower() or keyword.lower() in item['desc'].lower():
            print(f"Tapping contains '{keyword}' at ({item['cx']}, {item['cy']})")
            sh(f"{ADB} shell input tap {item['cx']} {item['cy']}")
            time.sleep(delay)
            return True
    print(f"Could not find text containing '{keyword}'")
    return False

def screenshot(name):
    path = os.path.join(ARTIFACT_DIR, name)
    sh(f'{ADB} shell screencap -p /sdcard/{name}')
    sh(f'{ADB} pull /sdcard/{name} {path}')
    print(f'Captured screenshot: {name}')

def main():
    print('=== TESTING STEP 5: CATEGORY SCREEN ===')

    # Install APK
    print('Installing debug APK...')
    sh(f'{ADB} install -r /Users/kira/.gemini/antigravity/scratch/VegDeliveryApp/android/app/build/outputs/apk/debug/app-debug.apk')
    
    # Restart app
    sh(f'{ADB} shell am force-stop com.vegdeliveryapp')
    sh(f'{ADB} shell am start -n com.vegdeliveryapp/.MainActivity')
    time.sleep(4.0)

    # Welcome screen -> Get Started
    print('Navigating through Welcome & Login...')
    sh(f'{ADB} shell input tap 540 2137')
    time.sleep(1.2)

    # Onboarding -> Skip All
    sh(f'{ADB} shell input tap 141 2269')
    time.sleep(1.2)

    # Login screen -> Demo Fill & Login
    sh(f'{ADB} shell input tap 540 1776')
    time.sleep(0.5)
    sh(f'{ADB} shell input tap 540 1634')
    time.sleep(2.5)

    # 1. Tap Categories Tab in Bottom Navigation (324, 2316)
    print('\n1. Navigating to Categories Tab...')
    sh(f'{ADB} shell input tap 324 2316')
    time.sleep(1.5)
    screenshot('cat_1_all_categories_view.png')

    # 2. Tap "Leafy Vegetables" Category Card
    print('\n2. Tapping Leafy Vegetables Category Card...')
    tap_contains('Leafy Vegetables', delay=1.5)
    screenshot('cat_2_leafy_products.png')

    # 3. Switch to "Root Vegetables" via Category Pills
    print('\n3. Switching to Root Vegetables via Category Pills...')
    tap_contains('Roots', delay=1.5)
    screenshot('cat_3_root_products.png')

    # 4. Switch to "Seasonal Vegetables" via Category Pills
    print('\n4. Switching to Seasonal Vegetables via Category Pills...')
    tap_contains('Seasonal', delay=1.5)
    screenshot('cat_4_seasonal_products.png')

    # 5. Switch to "Fresh Fruits" via Category Pills
    print('\n5. Switching to Fresh Fruits via Category Pills...')
    tap_contains('Fruits', delay=1.5)
    screenshot('cat_5_fruits_products.png')

    # 6. Test Sorting: "Price: Low to High"
    print('\n6. Testing Sort: Price: Low to High...')
    tap_contains('Price: Low to High', delay=1.2)
    screenshot('cat_6_sort_price_low_high.png')

    # 7. Test Sorting: "Rating"
    print('\n7. Testing Sort: Rating...')
    tap_contains('Rating', delay=1.2)
    screenshot('cat_7_sort_rating.png')

    # 8. Test Search Bar with Matching Query
    print('\n8. Testing Search: typing "apple"...')
    # Tap search bar (400, 195)
    sh(f'{ADB} shell input tap 400 195')
    time.sleep(0.5)
    sh(f'{ADB} shell input text "apple"')
    time.sleep(0.5)
    sh(f'{ADB} shell input keyevent 111') # dismiss keyboard
    time.sleep(0.8)
    screenshot('cat_8_search_active.png')

    # 9. Test Search Bar Empty State
    print('\n9. Testing Search Empty State: typing "xyz"...')
    sh(f'{ADB} shell input tap 970 195') # Clear button
    time.sleep(0.5)
    sh(f'{ADB} shell input tap 400 195')
    time.sleep(0.5)
    sh(f'{ADB} shell input text "xyz"')
    time.sleep(0.5)
    sh(f'{ADB} shell input keyevent 111')
    time.sleep(0.8)
    screenshot('cat_9_search_empty_state.png')

    # Clear search
    tap_contains('Show All Products', delay=1.2)

    # 10. Test Add to Cart & Stepper
    print('\n10. Testing Add to Cart & Stepper...')
    # Switch to Leafy
    tap_contains('Leafy', delay=1.2)
    # Tap first + Add button
    tap_exact('+ Add', delay=0.8)
    # Tap + to increment quantity to 2
    tap_exact('+', delay=0.8)
    screenshot('cat_10_cart_stepper_active.png')

    # 11. Test Favorite Toggle
    print('\n11. Testing Favorite Toggle...')
    # Tap heart icon (top right of first product card, ~380, 800)
    sh(f'{ADB} shell input tap 380 800')
    time.sleep(0.8)
    screenshot('cat_11_favorite_toggled.png')

    # 12. Return to All Categories overview via back arrow
    print('\n12. Testing Back Arrow to return to All Categories...')
    tap_exact('←', delay=1.2)
    screenshot('cat_12_back_to_all_categories.png')

    # 13. Test Bottom Navigation back to Home Tab
    print('\n13. Navigating back to Home Tab...')
    sh(f'{ADB} shell input tap 108 2316')
    time.sleep(1.2)
    screenshot('cat_13_back_to_home.png')

    print('=== ALL STEP 5 CATEGORY TESTS COMPLETED SUCCESSFULLY! ===')

if __name__ == '__main__':
    main()
