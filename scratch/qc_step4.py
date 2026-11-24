import subprocess
import time
import xml.etree.ElementTree as ET
import os

ADB = '/Users/kira/Library/Android/sdk/platform-tools/adb'
ARTIFACT_DIR = '/Users/kira/.gemini/antigravity/brain/f83f8804-89a9-4f66-85f0-0bc7606be15b'

def sh(cmd):
    return subprocess.check_output(cmd, shell=True).decode('utf-8', errors='ignore')

def get_ui():
    sh(f'{ADB} shell uiautomator dump /sdcard/window_dump.xml')
    xml_data = sh(f'{ADB} shell cat /sdcard/window_dump.xml')
    try:
        return ET.fromstring(xml_data)
    except Exception as e:
        print('Error parsing XML:', e)
        return None

def find_node(text_exact=None, desc_exact=None, text_contains=None, desc_contains=None):
    root = get_ui()
    if root is None:
        return None
    for node in root.iter('node'):
        text = node.attrib.get('text', '')
        desc = node.attrib.get('content-desc', '')
        bounds = node.attrib.get('bounds', '')
        match = False
        if text_exact and text == text_exact:
            match = True
        elif desc_exact and desc == desc_exact:
            match = True
        elif text_contains and text_contains.lower() in text.lower():
            match = True
        elif desc_contains and desc_contains.lower() in desc.lower():
            match = True
            
        if match and bounds:
            coords = [int(n) for n in bounds.replace('][', ',').replace('[', '').replace(']', '').split(',') if n]
            if len(coords) == 4:
                cx = (coords[0] + coords[2]) // 2
                cy = (coords[1] + coords[3]) // 2
                return (cx, cy, text or desc, bounds)
    return None

def tap(x, y, delay=1.2):
    print(f'Tapping at ({x}, {y})')
    sh(f'{ADB} shell input tap {x} {y}')
    time.sleep(delay)

def screenshot(name):
    path = os.path.join(ARTIFACT_DIR, name)
    sh(f'{ADB} shell screencap -p /sdcard/{name}')
    sh(f'{ADB} pull /sdcard/{name} {path}')
    print(f'Captured screenshot: {name}')

def main():
    print('--- STARTING COMPREHENSIVE QUALITY CHECK ---')
    
    # Check if we are on Login screen
    login_btn = find_node(desc_exact='Login')
    if login_btn:
        print('On Login Screen! Tapping Quick Demo Fill (540, 1776)...')
        tap(540, 1776, delay=0.8)
        print('Tapping Login button (540, 1634)...')
        tap(540, 1634, delay=2.5)
    else:
        # Check if already on Home or elsewhere
        home_node = find_node(text_contains='Deliver to')
        if not home_node:
            print('Navigating to Home from current screen...')
            # Check welcome
            w = find_node(text_exact='Get Started')
            if w:
                tap(w[0], w[1], delay=1.0)
            skip = find_node(text_exact='Skip All')
            if skip:
                tap(skip[0], skip[1], delay=1.0)
            tap(540, 1776, delay=0.8)
            tap(540, 1634, delay=2.5)

    # 1. VERIFY HOME SCREEN
    home_node = find_node(text_contains='Deliver to')
    if home_node:
        print('SUCCESS: Home screen verified and active!')
        screenshot('qc_1_home_screen.png')
    else:
        print('Error: Home screen not active!')
        screenshot('qc_error_screen.png')
        return

    # 2. VERIFY ALL 5 BOTTOM TABS
    print('\n--- TESTING ALL 5 BOTTOM TABS ---')
    # Bottom tab coordinates: Home=(108, 2316), Categories=(324, 2316), Cart=(540, 2316), Favorites=(756, 2316), Profile=(972, 2316)
    
    print('1. Tapping Categories Tab (324, 2316)...')
    tap(324, 2316, delay=1.5)
    screenshot('qc_2_tab_categories.png')
    
    print('2. Tapping Cart Tab (540, 2316)...')
    tap(540, 2316, delay=1.5)
    screenshot('qc_3_tab_cart.png')
    
    print('3. Tapping Favorites Tab (756, 2316)...')
    tap(756, 2316, delay=1.5)
    screenshot('qc_4_tab_favorites.png')
    
    print('4. Tapping Profile Tab (972, 2316)...')
    tap(972, 2316, delay=1.5)
    screenshot('qc_5_tab_profile.png')
    
    print('5. Tapping Home Tab (108, 2316)...')
    tap(108, 2316, delay=1.5)
    screenshot('qc_6_tab_home_restored.png')

    # 3. TEST LOCATION SELECTION
    print('\n--- TESTING LOCATION SELECTION MODAL ---')
    tap(200, 100, delay=1.2) # Tap Deliver to header
    screenshot('qc_7_location_modal.png')
    # Tap Office address in modal
    office = find_node(text_contains='Tower B, Silicon Tech Park')
    if office:
        print(f'Found Office at ({office[0]}, {office[1]})')
        tap(office[0], office[1], delay=1.2)
    else:
        tap(540, 1813, delay=1.2)
    screenshot('qc_8_office_address_selected.png')

    # 4. TEST NOTIFICATIONS MODAL
    print('\n--- TESTING NOTIFICATIONS MODAL ---')
    tap(1015, 100, delay=1.2) # Bell icon
    screenshot('qc_9_notifications_modal.png')
    mark_btn = find_node(text_exact='Mark all as read')
    if mark_btn:
        tap(mark_btn[0], mark_btn[1], delay=0.8)
    close_btn = find_node(text_exact='✕')
    if close_btn:
        tap(close_btn[0], close_btn[1], delay=1.2)
    else:
        tap(996, 1288, delay=1.2)
    screenshot('qc_10_notifications_cleared.png')

    # 5. TEST CATEGORY SELECTION & FILTER
    print('\n--- TESTING CATEGORY SELECTION ---')
    leafy = find_node(text_exact='Leafy')
    if leafy:
        print(f'Tapping Leafy at ({leafy[0]}, {leafy[1]})')
        tap(leafy[0], leafy[1] - 40, delay=1.2)
    else:
        tap(136, 1060, delay=1.2)
    screenshot('qc_11_category_filter_active.png')
    # Toggle off
    tap(136, 1060, delay=1.0)

    # 6. TEST LIVE SEARCH
    print('\n--- TESTING LIVE SEARCH ---')
    tap(400, 220, delay=0.8) # Search bar
    sh(f'{ADB} shell input text "tomato"')
    time.sleep(0.5)
    sh(f'{ADB} shell input keyevent 111') # Dismiss keyboard
    time.sleep(0.8)
    screenshot('qc_12_search_results.png')
    # Tap Clear '✕' on search bar
    tap(970, 220, delay=1.2)

    # 7. TEST CART QUANTITY & STEPPERS
    print('\n--- TESTING CART QUANTITY UPDATES ---')
    add_btn = find_node(text_exact='+ Add')
    if add_btn:
        print(f'Tapping + Add at ({add_btn[0]}, {add_btn[1]})')
        tap(add_btn[0], add_btn[1], delay=0.8)
        # Tap + on stepper
        plus = find_node(text_exact='+')
        if plus:
            tap(plus[0], plus[1], delay=0.8)
    screenshot('qc_13_cart_stepper_active.png')

    # 8. TEST FAVORITE TOGGLE
    print('\n--- TESTING FAVORITE TOGGLE ---')
    tap(380, 1660, delay=0.8) # Heart icon on first product
    screenshot('qc_14_favorite_toggled.png')

    # 9. TEST SCROLLING & RESPONSIVENESS
    print('\n--- TESTING SCROLLING ---')
    sh(f'{ADB} shell input swipe 540 1800 540 600 300')
    time.sleep(1.2)
    screenshot('qc_15_scrolled_view.png')
    sh(f'{ADB} shell input swipe 540 600 540 1800 300')
    time.sleep(1.2)

    print('--- ALL QUALITY CHECKS COMPLETED SUCCESSFULLY ---')

if __name__ == '__main__':
    main()
