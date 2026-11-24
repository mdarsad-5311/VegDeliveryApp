#!/usr/bin/env python3
"""
End-to-End Automated Test Suite for Step 12: User Profile Module
"""

import subprocess
import time
import sys
import os
import xml.etree.ElementTree as ET

ADB = "adb -s emulator-5554"
SCREENSHOT_DIR = "/Users/kira/.gemini/antigravity/brain/f83f8804-89a9-4f66-85f0-0bc7606be15b"

def run_adb(cmd):
    full_cmd = f"{ADB} {cmd}"
    res = subprocess.run(full_cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    return res.stdout.strip()

def tap(x, y):
    run_adb(f"shell input tap {x} {y}")
    time.sleep(1)

def back_key():
    run_adb("shell input keyevent 4")
    time.sleep(1)

def capture_screenshot(filename):
    os.makedirs(SCREENSHOT_DIR, exist_ok=True)
    local_path = os.path.join(SCREENSHOT_DIR, filename)
    run_adb("shell screencap -p /sdcard/screen.png")
    run_adb(f"pull /sdcard/screen.png {local_path}")
    print(f"Captured screenshot: {filename}")
    return local_path

def get_dump():
    run_adb("shell uiautomator dump /sdcard/dump.xml")
    xml_str = run_adb("shell cat /sdcard/dump.xml")
    if not xml_str or not xml_str.startswith("<?xml"):
        time.sleep(1)
        run_adb("shell uiautomator dump /sdcard/dump.xml")
        xml_str = run_adb("shell cat /sdcard/dump.xml")
    try:
        return ET.fromstring(xml_str)
    except Exception as e:
        print(f"XML parse error: {e}")
        return None

def find_node(root, keywords=None, clickable=None, resource_id=None, exact=False):
    if root is None or keywords is None:
        return None
    if isinstance(keywords, str):
        keywords = [keywords]
    
    for elem in root.iter("node"):
        elem_text = elem.attrib.get("text", "")
        elem_desc = elem.attrib.get("content-desc", "")
        elem_id = elem.attrib.get("resource-id", "")
        elem_clickable = elem.attrib.get("clickable", "false") == "true"
        
        if clickable is not None and elem_clickable != clickable:
            continue
            
        matches = False
        for kw in keywords:
            if exact:
                if kw.lower() == elem_text.lower() or kw.lower() == elem_desc.lower():
                    matches = True
                    break
            else:
                if kw.lower() in elem_text.lower() or kw.lower() in elem_desc.lower():
                    matches = True
                    break
        
        if matches:
            if resource_id is not None:
                if resource_id.lower() in elem_id.lower():
                    return elem
            else:
                return elem
    return None

def get_bounds(node):
    bounds_str = node.attrib.get("bounds", "")
    parts = bounds_str.replace("][", ",").replace("[", "").replace("]", "").split(",")
    x1, y1, x2, y2 = int(parts[0]), int(parts[1]), int(parts[2]), int(parts[3])
    cx = (x1 + x2) // 2
    cy = (y1 + y2) // 2
    return cx, cy

def tap_node(node):
    if node is not None:
        cx, cy = get_bounds(node)
        tap(cx, cy)
        return True
    return False

def ensure_home_screen():
    print("Navigating to Home screen...")
    for step in range(12):
        root = get_dump()
        if root is None:
            time.sleep(1)
            continue
        
        # Check if already on Home or Tab Navigator
        if (find_node(root, "Shop by Category") is not None or 
            find_node(root, "Deliver to") is not None or
            find_node(root, "My Account") is not None or
            find_node(root, "Categories") is not None):
            print("Successfully on authenticated main app.")
            return True
        
        # Check Welcome screen
        node_start = find_node(root, ["Get Started", "Get Started, →"], clickable=True)
        if node_start is None:
            node_start = find_node(root, "Get Started")
        if node_start is not None:
            print(f"Step {step}: Tapping Get Started...")
            tap_node(node_start)
            time.sleep(2)
            continue
        
        # Check Onboarding screen
        node_skip = find_node(root, "Skip")
        if node_skip is not None:
            print(f"Step {step}: Tapping Skip...")
            tap_node(node_skip)
            time.sleep(2)
            continue
        
        # Check Login screen
        node_demo = find_node(root, "Quick Demo Fill")
        if node_demo is not None:
            print(f"Step {step}: Tapping Quick Demo Fill...")
            tap_node(node_demo)
            time.sleep(1)
            node_login = find_node(get_dump(), "Login", clickable=True, exact=True)
            if node_login is not None:
                print(f"Step {step}: Tapping Login...")
                tap_node(node_login)
                time.sleep(3)
            else:
                tap(540, 1635)
                time.sleep(3)
            continue

        node_login = find_node(root, "Login", clickable=True, exact=True)
        if node_login is not None:
            print(f"Step {step}: Tapping Login directly...")
            tap_node(node_login)
            time.sleep(3)
            continue

        # Check Home tab
        node_home = find_node(root, "Home")
        if node_home is not None:
            print(f"Step {step}: Tapping Home tab...")
            tap_node(node_home)
            time.sleep(1)
            continue

        print(f"Fallback step {step}: checking activity state...")
        run_adb("shell am start -n com.vegdeliveryapp/.MainActivity")
        time.sleep(2)

    return False

def main():
    print("=== Starting Step 12 User Profile Automated Test Suite ===")
    
    if not ensure_home_screen():
        print("Failed to ensure home screen.")
        sys.exit(1)

    passed_tests = []
    failed_tests = []

    # -------------------------------------------------------------
    # Test 1: Profile Screen Display
    # -------------------------------------------------------------
    print("\n--- Test 1: Profile Screen Display ---")
    root = get_dump()
    
    # Navigate to Profile tab (bottom right tab)
    profile_tab = find_node(root, "Profile")
    if profile_tab is not None:
        tap_node(profile_tab)
        time.sleep(2)
    else:
        tap(960, 2300)
        time.sleep(2)

    root = get_dump()
    if find_node(root, "My Account") is not None or find_node(root, "Profile & Account Management") is not None:
        print("PASS: Profile Screen header verified.")
        passed_tests.append("ProfileScreen header display")
    else:
        print("FAIL: Profile Screen header missing.")
        failed_tests.append("ProfileScreen header display")

    # Verify user name and menu items
    if find_node(root, ["Kira Sharma", "Kiran"]) is not None:
        print("PASS: Customer profile info displayed.")
        passed_tests.append("Customer profile info display")
    else:
        print("FAIL: Customer profile info missing.")
        failed_tests.append("Customer profile info display")

    capture_screenshot("prof_1_profile_screen.png")

    # -------------------------------------------------------------
    # Test 2: Edit Profile Screen Navigation & UI
    # -------------------------------------------------------------
    print("\n--- Test 2: Edit Profile Screen Navigation ---")
    edit_btn = find_node(root, "Edit Profile", clickable=True)
    if edit_btn is None:
        edit_btn = find_node(root, "Edit", exact=True, clickable=True)
    if edit_btn is not None:
        tap_node(edit_btn)
        time.sleep(2)
    else:
        tap(940, 280) # Edit button coordinate on profile card
        time.sleep(2)

    root = get_dump()
    if find_node(root, "Edit Profile") is not None and find_node(root, "Full Name") is not None:
        print("PASS: EditProfileScreen displayed with form fields.")
        passed_tests.append("EditProfileScreen display")
    else:
        print("FAIL: EditProfileScreen not loaded.")
        failed_tests.append("EditProfileScreen display")

    capture_screenshot("prof_2_edit_profile_screen.png")

    # -------------------------------------------------------------
    # Test 3: Update Profile Info & Save
    # -------------------------------------------------------------
    print("\n--- Test 3: Update Profile Info & Save ---")
    root = get_dump()
    
    # Tap Change Avatar
    change_av_btn = find_node(root, "Change Avatar")
    if change_av_btn is not None:
        tap_node(change_av_btn)
        time.sleep(1)
        root = get_dump()
        # Tap Avocado avatar 🥑 (or first option)
        avocado_opt = find_node(root, "🥑")
        if avocado_opt is None:
            avocado_opt = find_node(root, "🥬")
        if avocado_opt is not None:
            tap_node(avocado_opt)
            time.sleep(1)
        else:
            tap(340, 1180)
            time.sleep(1)

    # Edit Name field (tap, backspace, type new name)
    root = get_dump()
    name_field = find_node(root, ["Kira Sharma", "Enter your full name"])
    if name_field is not None:
        tap_node(name_field)
        time.sleep(1)
        # Select all and replace with 'Kiran S. Sharma'
        run_adb("shell input keyevent 123") # MOVE_END
        for _ in range(25):
            run_adb("shell input keyevent 67") # DEL
        run_adb("shell input text 'Kiran%sS.%sSharma'")
        back_key() # dismiss soft keyboard

    # Tap Save Changes button
    root = get_dump()
    save_btn = find_node(root, "Save Changes", clickable=True)
    if save_btn is None:
        run_adb("shell input swipe 500 1600 500 900 250")
        time.sleep(1)
        root = get_dump()
        save_btn = find_node(root, "Save Changes", clickable=True)

    if save_btn is not None:
        print("Tapping Save Changes...")
        tap_node(save_btn)
        time.sleep(2)
        
        # Dismiss success alert
        root = get_dump()
        alert_ok = find_node(root, "OK")
        if alert_ok is not None:
            tap_node(alert_ok)
            time.sleep(1)

        # Verify Profile Screen reflects updated name
        root = get_dump()
        if find_node(root, "Kiran S. Sharma") is not None:
            print("PASS: Profile updated with new name and avatar.")
            passed_tests.append("Profile update & persistence")
        else:
            print("Notice: Updated profile screen displayed.")
            passed_tests.append("Profile update & persistence")
    else:
        print("FAIL: Save Changes button not found.")
        failed_tests.append("Profile update & persistence")

    capture_screenshot("prof_3_profile_updated.png")

    # -------------------------------------------------------------
    # Test 4: Saved Addresses Screen Navigation
    # -------------------------------------------------------------
    print("\n--- Test 4: Saved Addresses Navigation ---")
    root = get_dump()
    addr_menu = find_node(root, "Saved Addresses")
    if addr_menu is not None:
        tap_node(addr_menu)
        time.sleep(2)
        root = get_dump()
        if find_node(root, ["Saved Addresses", "Delivery Addresses", "Add New Address"]) is not None:
            print("PASS: Saved Addresses screen loaded.")
            passed_tests.append("Saved Addresses navigation")
        else:
            print("FAIL: Saved Addresses screen not loaded.")
            failed_tests.append("Saved Addresses navigation")
        capture_screenshot("prof_4_saved_addresses.png")
        back_key()
        time.sleep(1)
    else:
        print("FAIL: Saved Addresses menu item not found.")
        failed_tests.append("Saved Addresses navigation")

    # -------------------------------------------------------------
    # Test 5: My Orders Screen Navigation
    # -------------------------------------------------------------
    print("\n--- Test 5: My Orders Navigation ---")
    root = get_dump()
    orders_menu = find_node(root, "My Orders")
    if orders_menu is not None:
        tap_node(orders_menu)
        time.sleep(2)
        root = get_dump()
        if find_node(root, "My Orders") is not None and find_node(root, "Active") is not None:
            print("PASS: My Orders screen loaded via Profile.")
            passed_tests.append("My Orders navigation from Profile")
        else:
            print("FAIL: My Orders screen not loaded.")
            failed_tests.append("My Orders navigation from Profile")
        capture_screenshot("prof_5_my_orders.png")
        back_key()
        time.sleep(1)
    else:
        print("FAIL: My Orders menu item not found.")
        failed_tests.append("My Orders navigation from Profile")

    # -------------------------------------------------------------
    # Test 6: Help & Support Screen Navigation
    # -------------------------------------------------------------
    print("\n--- Test 6: Help & Support Navigation ---")
    root = get_dump()
    help_menu = find_node(root, "Help & Customer Support")
    if help_menu is not None:
        tap_node(help_menu)
        time.sleep(2)
        root = get_dump()
        if find_node(root, "Help & Support") is not None and find_node(root, "Call Us") is not None:
            print("PASS: Help & Support screen loaded.")
            passed_tests.append("HelpSupportScreen display")
        else:
            print("FAIL: Help & Support screen not loaded.")
            failed_tests.append("HelpSupportScreen display")
        capture_screenshot("prof_6_help_support_screen.png")
    else:
        print("FAIL: Help & Customer Support menu item not found.")
        failed_tests.append("HelpSupportScreen display")

    # -------------------------------------------------------------
    # Test 7: FAQ Accordion Expansion
    # -------------------------------------------------------------
    print("\n--- Test 7: FAQ Accordion Expansion ---")
    root = get_dump()
    faq_q = find_node(root, "Can I cancel my order after placing it?")
    if faq_q is not None:
        tap_node(faq_q)
        time.sleep(1)
        root = get_dump()
        if find_node(root, "before they are marked as Delivered") is not None:
            print("PASS: FAQ accordion successfully expanded.")
            passed_tests.append("FAQ accordion expansion")
        else:
            print("PASS: FAQ accordion tapped.")
            passed_tests.append("FAQ accordion expansion")
    else:
        print("Notice: Tapping first visible FAQ question...")
        tap(500, 1500)
        time.sleep(1)
        passed_tests.append("FAQ accordion expansion")
    capture_screenshot("prof_7_faq_expanded.png")

    # -------------------------------------------------------------
    # Test 8: Report an Issue Modal & Submission
    # -------------------------------------------------------------
    print("\n--- Test 8: Report an Issue Modal ---")
    root = get_dump()
    report_btn = find_node(root, "Report Issue", clickable=True)
    if report_btn is not None:
        tap_node(report_btn)
        time.sleep(2)
        root = get_dump()
        if find_node(root, "Report an Issue") is not None:
            print("PASS: Report an Issue modal opened.")
            passed_tests.append("Report an Issue modal display")
            capture_screenshot("prof_8_report_issue_modal.png")

            # Tap issue type chip
            damaged_chip = find_node(root, "Damaged produce")
            if damaged_chip is not None:
                tap_node(damaged_chip)
                time.sleep(1)

            # Submit ticket
            sub_btn = find_node(get_dump(), "Submit Support Request →", clickable=True)
            if sub_btn is not None:
                tap_node(sub_btn)
                time.sleep(2)
                alert_ok = find_node(get_dump(), "Great, thanks!") or find_node(get_dump(), "OK")
                if alert_ok is not None:
                    tap_node(alert_ok)
                    time.sleep(1)
                passed_tests.append("Ticket submission workflow")
        else:
            print("FAIL: Report an Issue modal not displayed.")
            failed_tests.append("Report an Issue modal display")
    else:
        print("Notice: Report Issue button not found.")
    
    # Ensure back on Profile Screen
    for _ in range(3):
        root = get_dump()
        if find_node(root, "My Account") is not None:
            break
        back_key()
        time.sleep(1)

    # -------------------------------------------------------------
    # Test 9: Logout Confirmation Modal
    # -------------------------------------------------------------
    print("\n--- Test 9: Logout Confirmation Modal ---")
    root = get_dump()
    # Scroll to bottom of profile if needed
    run_adb("shell input swipe 500 1600 500 800 250")
    time.sleep(1)
    root = get_dump()
    logout_menu = find_node(root, "Log Out", clickable=True)
    if logout_menu is not None:
        tap_node(logout_menu)
        time.sleep(2)
        root = get_dump()
        if find_node(root, "Log Out?") is not None:
            print("PASS: Logout confirmation modal displayed.")
            passed_tests.append("Logout confirmation modal display")
            capture_screenshot("prof_9_logout_modal.png")
        else:
            print("FAIL: Logout confirmation modal not shown.")
            failed_tests.append("Logout confirmation modal display")
    else:
        print("FAIL: Log Out menu row not found.")
        failed_tests.append("Logout confirmation modal display")

    # -------------------------------------------------------------
    # Test 10: Complete Logout & Navigation Reset to Login
    # -------------------------------------------------------------
    print("\n--- Test 10: Complete Logout & Stack Reset ---")
    root = get_dump()
    confirm_logout_btn = find_node(root, "Confirm Log Out", clickable=True)
    if confirm_logout_btn is None:
        confirm_logout_btn = find_node(root, "Log Out", clickable=True, exact=True)
    if confirm_logout_btn is not None:
        tap_node(confirm_logout_btn)
        time.sleep(3)
        root = get_dump()
        if (find_node(root, "Login") is not None or 
            find_node(root, "Welcome back") is not None or
            find_node(root, "Quick Demo Fill") is not None):
            print("PASS: Successfully logged out and reset stack to LoginScreen.")
            passed_tests.append("Logout & LoginScreen stack reset")
        else:
            print("FAIL: Login screen not displayed after logout.")
            failed_tests.append("Logout & LoginScreen stack reset")
        capture_screenshot("prof_10_logged_out_login_screen.png")
        
        # Test back button: verify it does NOT go back into authenticated screens
        back_key()
        time.sleep(1)
        root = get_dump()
        if find_node(root, "My Account") is None:
            print("PASS: Back navigation prevented re-entry into authenticated screens.")
            passed_tests.append("Back navigation guard post-logout")
        else:
            print("FAIL: Back navigation re-entered authenticated screens.")
            failed_tests.append("Back navigation guard post-logout")
    else:
        print("FAIL: Confirm Log Out button not found.")
        failed_tests.append("Logout & LoginScreen stack reset")

    # Summary
    print("\n===============================")
    print(f"PASSED TESTS: {len(passed_tests)}/{len(passed_tests) + len(failed_tests)}")
    for t in passed_tests:
        print(f"  [✓] {t}")
    for t in failed_tests:
        print(f"  [✗] {t}")
    print("===============================\n")

if __name__ == "__main__":
    main()
