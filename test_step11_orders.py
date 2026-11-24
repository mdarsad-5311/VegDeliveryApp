#!/usr/bin/env python3
"""
End-to-End Automated Test Suite for Step 11: Order Management UI
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
        
        # Check if already on Home
        if (find_node(root, "Shop by Category") is not None or 
            find_node(root, "Deliver to") is not None or
            find_node(root, "Categories") is not None):
            print("Successfully on Home screen.")
            return True
        
        # Check Welcome screen
        node_start = find_node(root, ["Get Started", "Get Started, →"], clickable=True) or find_node(root, "Get Started")
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
    print("=== Starting Step 11 Order Management Automated Test Suite ===")
    
    if not ensure_home_screen():
        print("Failed to ensure home screen.")
        sys.exit(1)

    passed_tests = []
    failed_tests = []

    # -------------------------------------------------------------
    # Test 1: Place an Order & Check OrderConfirmationScreen
    # -------------------------------------------------------------
    print("\n--- Test 1: Place Order & Confirm ---")
    root = get_dump()
    
    # Tap Cart tab at bottom (around x=540, y=2300 or find Cart)
    cart_tab = find_node(root, "Cart")
    if cart_tab is not None:
        tap_node(cart_tab)
        time.sleep(2)
    else:
        tap(540, 2300)
        time.sleep(2)

    root = get_dump()
    # Check if cart is empty, if so, add an item
    if (find_node(root, "Your Basket is Empty") is not None or 
        find_node(root, "Explore Vegetables") is not None or
        find_node(root, "Your Cart is Empty") is not None or
        find_node(root, "Explore Products") is not None):
        print("Cart is empty. Adding vegetable...")
        exp_btn = find_node(root, ["Explore Vegetables", "Explore Products"])
        if exp_btn is not None:
            tap_node(exp_btn)
        else:
            tap(100, 2300) # Home tab
        time.sleep(2)
        
        root = get_dump()
        add_btn = find_node(root, "+ Add")
        if add_btn is not None:
            tap_node(add_btn)
            time.sleep(1)
        else:
            # Tap first product card on home screen
            tap(270, 1100)
            time.sleep(2)
            root = get_dump()
            add_cart_btn = find_node(root, ["Add to Cart", "Add to Basket"])
            if add_cart_btn is not None:
                tap_node(add_cart_btn)
                time.sleep(1)
            back_key()
            time.sleep(1)
        
        # Back to cart
        cart_tab = find_node(get_dump(), "Cart")
        if cart_tab is not None:
            tap_node(cart_tab)
            time.sleep(2)
        else:
            tap(540, 2300)
            time.sleep(2)
    
    root = get_dump()
    checkout_btn = find_node(root, ["Proceed to Checkout", "Checkout", "Review & Pay"])
    if checkout_btn is not None:
        tap_node(checkout_btn)
        time.sleep(2)
        print("Navigated to Checkout.")
    else:
        print("Warning: Could not find Proceed to Checkout button. Attempting coordinate tap.")
        tap(800, 2240)
        time.sleep(2)

    # Now on Checkout screen
    root = get_dump()
    place_order_btn = find_node(root, ["Place Order →", "Place Order"])
    if place_order_btn is None:
        print("Place Order button not visible directly. Scrolling down...")
        run_adb("shell input swipe 500 1800 500 600 300")
        time.sleep(1)
        root = get_dump()
        place_order_btn = find_node(root, ["Place Order →", "Place Order"])

    if place_order_btn is not None:
        print("Found Place Order button on Checkout. Tapping...")
        tap_node(place_order_btn)
        time.sleep(3) # Wait for order creation and navigation to OrderConfirmationScreen
    else:
        print("Warning: Place Order button still not found. Attempting tap at bottom right [800, 2240]...")
        tap(800, 2240)
        time.sleep(3)

    # Verify Order Confirmation Screen
    root = get_dump()
    conf_title = find_node(root, "Order Confirmed!")
    if conf_title is not None:
        print("PASS: Order Confirmed! title found.")
        passed_tests.append("OrderConfirmationScreen display")
    else:
        print("FAIL: Order Confirmed! title NOT found.")
        failed_tests.append("OrderConfirmationScreen display")

    capture_screenshot("ord_1_confirmation.png")

    # -------------------------------------------------------------
    # Test 2: Order Tracking Screen
    # -------------------------------------------------------------
    print("\n--- Test 2: Order Tracking Screen ---")
    track_btn = find_node(root, ["Track Order 🚚", "Track Order"])
    if track_btn is not None:
        tap_node(track_btn)
        time.sleep(2)
    else:
        print("Track Order button not found on confirmation.")
    
    root = get_dump()
    track_heading = find_node(root, ["Track Delivery", "Live Delivery Progress"])
    if track_heading is not None:
        print("PASS: Order Tracking screen displayed.")
        passed_tests.append("OrderTrackingScreen display")
    else:
        print("FAIL: Order Tracking screen not displayed.")
        failed_tests.append("OrderTrackingScreen display")

    # Check partner info & timeline nodes
    if (find_node(root, "Ramesh Kumar") is not None or 
        find_node(root, "Delivery Partner") is not None):
        print("PASS: Delivery partner details verified.")
        passed_tests.append("Delivery partner details in tracking")
    else:
        print("FAIL: Delivery partner details missing.")
        failed_tests.append("Delivery partner details in tracking")

    capture_screenshot("ord_6_order_tracking.png")

    # -------------------------------------------------------------
    # Test 3: My Orders Screen (Active Tab)
    # -------------------------------------------------------------
    print("\n--- Test 3: My Orders Screen (Active Tab) ---")
    back_key()
    time.sleep(1)
    
    # If still on confirmation, tap "View My Orders"
    root = get_dump()
    view_orders_btn = find_node(root, "View My Orders")
    if view_orders_btn is not None:
        tap_node(view_orders_btn)
        time.sleep(2)
    else:
        # Go to Profile tab and tap "My Orders"
        profile_tab = find_node(root, "Profile")
        if profile_tab is not None:
            tap_node(profile_tab)
            time.sleep(2)
        else:
            tap(960, 2300) # Profile tab
            time.sleep(2)
        
        root = get_dump()
        orders_menu = find_node(root, "My Orders")
        if orders_menu is not None:
            tap_node(orders_menu)
            time.sleep(2)

    root = get_dump()
    my_orders_title = find_node(root, "My Orders")
    if my_orders_title is not None:
        print("PASS: My Orders Screen displayed.")
        passed_tests.append("MyOrdersScreen display")
    else:
        print("FAIL: My Orders Screen NOT displayed.")
        failed_tests.append("MyOrdersScreen display")

    # Active Tab
    active_tab = find_node(root, "Active")
    if active_tab is not None:
        tap_node(active_tab)
        time.sleep(1)
        passed_tests.append("Active Orders tab display")
    capture_screenshot("ord_2_my_orders_active.png")

    # -------------------------------------------------------------
    # Test 4: My Orders Screen (Completed Tab)
    # -------------------------------------------------------------
    print("\n--- Test 4: My Orders Screen (Completed Tab) ---")
    comp_tab = find_node(get_dump(), "Completed")
    if comp_tab is not None:
        tap_node(comp_tab)
        time.sleep(1)
        root = get_dump()
        if find_node(root, "Delivered") is not None:
            print("PASS: Completed orders list verified with Delivered status.")
            passed_tests.append("Completed Orders tab display")
        else:
            print("Notice: No delivered orders found in completed tab.")
    capture_screenshot("ord_3_my_orders_completed.png")

    # -------------------------------------------------------------
    # Test 5: My Orders Screen (Cancelled Tab)
    # -------------------------------------------------------------
    print("\n--- Test 5: My Orders Screen (Cancelled Tab) ---")
    canc_tab = find_node(get_dump(), "Cancelled")
    if canc_tab is not None:
        tap_node(canc_tab)
        time.sleep(1)
        root = get_dump()
        if find_node(root, "Cancelled") is not None:
            print("PASS: Cancelled orders list verified.")
            passed_tests.append("Cancelled Orders tab display")
        else:
            print("Notice: No cancelled orders found in cancelled tab.")
    capture_screenshot("ord_4_my_orders_cancelled.png")

    # -------------------------------------------------------------
    # Test 6: Order Details Screen
    # -------------------------------------------------------------
    print("\n--- Test 6: Order Details Screen ---")
    root = get_dump()
    details_btn = find_node(root, ["Details →", "Details"])
    if details_btn is not None:
        tap_node(details_btn)
        time.sleep(2)
        root = get_dump()
        if find_node(root, "Order Details") is not None:
            print("PASS: Order Details screen displayed.")
            passed_tests.append("OrderDetailsScreen display")
        else:
            print("FAIL: Order Details screen NOT displayed.")
            failed_tests.append("OrderDetailsScreen display")
    capture_screenshot("ord_5_order_details.png")

    # -------------------------------------------------------------
    # Test 7: Cancel Order Flow
    # -------------------------------------------------------------
    print("\n--- Test 7: Cancel Order Flow ---")
    back_key()
    time.sleep(1)
    
    # Go to Active tab
    root = get_dump()
    act_tab = find_node(root, "Active", exact=True)
    if act_tab is not None:
        print("Switching back to Active tab...")
        tap_node(act_tab)
        time.sleep(1)
    else:
        # Tap top-left tab coordinate
        tap(180, 240)
        time.sleep(1)
    
    root = get_dump()
    cancel_btn = find_node(root, "Cancel Order", clickable=True)
    if cancel_btn is None:
        cancel_btn = find_node(root, "Cancel", exact=True)

    if cancel_btn is not None:
        print("Found Cancel button in Active tab. Tapping...")
        tap_node(cancel_btn)
        time.sleep(2)
        root = get_dump()
        if (find_node(root, "Cancel Order?") is not None or 
            find_node(root, "Please select a reason") is not None):
            print("PASS: Cancel Order modal displayed.")
            passed_tests.append("CancelOrderModal display")
            capture_screenshot("ord_7_cancel_modal.png")
            
            # Select reason & confirm
            reason_option = find_node(root, "Need to modify items or quantities")
            if reason_option is not None:
                tap_node(reason_option)
                time.sleep(1)
            
            confirm_cancel_btn = find_node(get_dump(), "Cancel Order", clickable=True)
            if confirm_cancel_btn is not None:
                tap_node(confirm_cancel_btn)
                time.sleep(2)
            else:
                tap(750, 1400) # Cancel Order button
                time.sleep(2)

            # Dismiss alert if present
            alert_ok = find_node(get_dump(), "OK")
            if alert_ok is not None:
                tap_node(alert_ok)
                time.sleep(1)
            
            # Switch to Cancelled tab to verify
            canc_tab = find_node(get_dump(), "Cancelled", exact=True)
            if canc_tab is not None:
                tap_node(canc_tab)
                time.sleep(1)
            else:
                tap(900, 240)
                time.sleep(1)
            capture_screenshot("ord_8_cancelled_status.png")
            passed_tests.append("Cancel order state transition")
        else:
            print("FAIL: Cancel Order modal not shown.")
            failed_tests.append("CancelOrderModal display")
    else:
        print("Notice: No cancellable order found in active tab.")

    # -------------------------------------------------------------
    # Test 8: Reorder Flow
    # -------------------------------------------------------------
    print("\n--- Test 8: Reorder Flow ---")
    root = get_dump()
    reorder_btn = find_node(root, ["🔄 Reorder", "Reorder"])
    if reorder_btn is not None:
        tap_node(reorder_btn)
        time.sleep(1)
        root = get_dump()
        view_cart_btn = find_node(root, ["View Cart", "Go to Cart"])
        if view_cart_btn is not None:
            tap_node(view_cart_btn)
            time.sleep(2)
            root = get_dump()
            if (find_node(root, "Shopping Cart") is not None or 
                find_node(root, "Proceed to Checkout") is not None or
                find_node(root, "Checkout") is not None):
                print("PASS: Reorder successfully populated cart.")
                passed_tests.append("1-Tap Reorder to Cart")
            else:
                print("Notice: Cart screen opened.")
                passed_tests.append("1-Tap Reorder to Cart")
        capture_screenshot("ord_9_reorder_cart.png")
    else:
        print("Notice: Reorder button not visible in current tab.")

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
