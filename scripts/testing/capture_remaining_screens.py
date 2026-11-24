#!/usr/bin/env python3
"""
Capture remaining 2 screens:
1. ResetPasswordScreen (audit_07_reset_password.png)
2. OrderDetailsScreen (audit_21_order_details.png)
"""

import subprocess
import time
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
    time.sleep(1.2)

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
    if xml_str and xml_str.startswith("<?xml"):
        try:
            return ET.fromstring(xml_str)
        except Exception:
            pass
    return None

def find_node(root, keywords=None, exact=False):
    if root is None or keywords is None:
        return None
    if isinstance(keywords, str):
        keywords = [keywords]
    for elem in root.iter("node"):
        elem_text = elem.attrib.get("text", "").strip()
        elem_desc = elem.attrib.get("content-desc", "").strip()
        for kw in keywords:
            kw_clean = kw.strip().lower()
            if exact:
                if kw_clean == elem_text.lower() or kw_clean == elem_desc.lower():
                    return elem
            else:
                if kw_clean in elem_text.lower() or kw_clean in elem_desc.lower():
                    return elem
    return None

def get_bounds(node):
    bounds_str = node.attrib.get("bounds", "")
    parts = bounds_str.replace("][", ",").replace("[", "").replace("]", "").split(",")
    cx = (int(parts[0]) + int(parts[2])) // 2
    cy = (int(parts[1]) + int(parts[3])) // 2
    return cx, cy

def tap_node(node):
    if node is not None:
        cx, cy = get_bounds(node)
        tap(cx, cy)
        return True
    return False

def main():
    print("Capturing audit_21_order_details.png...")
    # App is currently on Home/Profile. Navigate to Orders via Profile -> My Orders or Bottom Tab
    tap(972, 2350) # Profile tab
    time.sleep(1.5)
    root = get_dump()
    orders_menu = find_node(root, "My Orders")
    if orders_menu is not None:
        tap_node(orders_menu)
        time.sleep(2)
        root = get_dump()
        details_btn = find_node(root, ["Details →", "Details", "View Details"])
        if details_btn is not None:
            tap_node(details_btn)
            time.sleep(2)
            capture_screenshot("audit_21_order_details.png")
            print("Successfully captured audit_21_order_details.png!")
            tap(80, 140) # back
            time.sleep(1)
        tap(80, 140) # back to profile
        time.sleep(1)

    print("\nCapturing audit_07_reset_password.png...")
    # Logout to entry
    run_adb("shell input swipe 500 1600 500 600 250")
    time.sleep(1)
    logout_menu = find_node(get_dump(), "Log Out")
    if logout_menu is not None:
        tap_node(logout_menu)
        time.sleep(1.5)
        confirm_btn = find_node(get_dump(), ["Confirm Log Out", "Log Out"])
        if confirm_btn is not None:
            tap_node(confirm_btn)
        else:
            tap(740, 1420)
        time.sleep(2.5)

    # From Login -> Forgot Password -> OTP -> Reset Password
    root = get_dump()
    forgot_btn = find_node(root, "Forgot Password?")
    if forgot_btn is not None:
        tap_node(forgot_btn)
        time.sleep(1.5)
        root = get_dump()
        phone_input = find_node(root, ["10-digit mobile number", "Registered Mobile Number"])
        if phone_input is not None:
            tap_node(phone_input)
            run_adb("shell input text 9876543210")
            time.sleep(0.8)
        continue_btn = find_node(get_dump(), "Continue", exact=True)
        if continue_btn is not None:
            tap_node(continue_btn)
            time.sleep(2)
            root = get_dump()
            demo_otp_btn = find_node(root, ["Quick Auto-Fill OTP", "123456"])
            if demo_otp_btn is not None:
                tap_node(demo_otp_btn)
                time.sleep(0.8)
            else:
                run_adb("shell input text 123456")
                time.sleep(0.8)
            verify_btn = find_node(get_dump(), ["Verify OTP", "Verify"])
            if verify_btn is not None:
                tap_node(verify_btn)
                time.sleep(2)
                capture_screenshot("audit_07_reset_password.png")
                print("Successfully captured audit_07_reset_password.png!")

if __name__ == "__main__":
    main()
