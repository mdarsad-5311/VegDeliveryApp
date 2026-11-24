#!/usr/bin/env python3
import subprocess, time, os, xml.etree.ElementTree as ET

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
        try: return ET.fromstring(xml_str)
        except: pass
    return None

def find_node(root, keywords, exact=False):
    if root is None or not keywords: return None
    if isinstance(keywords, str): keywords = [keywords]
    for elem in root.iter("node"):
        t = elem.attrib.get("text", "").strip()
        d = elem.attrib.get("content-desc", "").strip()
        for kw in keywords:
            if exact:
                if kw.lower() == t.lower() or kw.lower() == d.lower(): return elem
            else:
                if kw.lower() in t.lower() or kw.lower() in d.lower(): return elem
    return None

def tap_node(node):
    if node is not None:
        bounds = node.attrib.get("bounds", "").replace("][", ",").replace("[", "").replace("]", "").split(",")
        tap((int(bounds[0]) + int(bounds[2])) // 2, (int(bounds[1]) + int(bounds[3])) // 2)
        return True
    return False

# Step 1: On WelcomeScreen, tap Get Started then Skip
root = get_dump()
if find_node(root, "Get Started"):
    tap_node(find_node(root, "Get Started"))
    time.sleep(1.5)
root = get_dump()
if find_node(root, "Skip"):
    tap_node(find_node(root, "Skip"))
    time.sleep(1.5)

# Step 2: On LoginScreen, tap Forgot Password?
root = get_dump()
tap_node(find_node(root, "Forgot Password?"))
time.sleep(1.5)

# Step 3: On ForgotPassword, input phone and tap Continue
root = get_dump()
tap_node(find_node(root, "10-digit mobile number"))
run_adb("shell input text 9876543210")
time.sleep(0.8)
tap_node(find_node(get_dump(), "Continue", exact=True))
time.sleep(2)

# Step 4: On OTP, tap Quick Auto-Fill OTP and Verify OTP
root = get_dump()
tap_node(find_node(root, ["Quick Auto-Fill", "123456"]))
time.sleep(0.8)
tap_node(find_node(get_dump(), "Verify OTP"))
time.sleep(2)

# Step 5: On ResetPasswordScreen, capture screenshot!
capture_screenshot("audit_07_reset_password.png")

# Step 6: Go back to Login, authenticate to MainTabs
tap(80, 140) # back
time.sleep(1)
tap(80, 140) # back
time.sleep(1)
tap(80, 140) # back to login
time.sleep(1.5)

root = get_dump()
tap_node(find_node(root, "Quick Demo Fill"))
time.sleep(1)
tap_node(find_node(get_dump(), "Login", exact=True))
time.sleep(3)

# Step 7: On MainTabs, tap Profile tab -> My Orders -> Details
tap(972, 2350) # Profile tab
time.sleep(2)
root = get_dump()
tap_node(find_node(root, "My Orders"))
time.sleep(2)
root = get_dump()
tap_node(find_node(root, "Details →"))
time.sleep(2)

# Step 8: Capture OrderDetailsScreen!
capture_screenshot("audit_21_order_details.png")
print("ALL DONE!")
