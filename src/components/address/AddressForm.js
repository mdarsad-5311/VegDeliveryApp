import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import colors from '../../constants/colors';
import typography from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/theme';

export const AddressForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  submitLabel = 'Save Address',
}) => {
  const [fullName, setFullName] = useState(initialData?.fullName || '');
  const [mobile, setMobile] = useState(
    initialData?.mobile ||
      (initialData?.phone ? initialData.phone.replace(/[^0-9]/g, '').slice(-10) : ''),
  );
  const [houseNumber, setHouseNumber] = useState(
    initialData?.houseNumber || initialData?.line1 || '',
  );
  const [street, setStreet] = useState(
    initialData?.street || initialData?.shortAddress || '',
  );
  const [landmark, setLandmark] = useState(initialData?.landmark || '');
  const [city, setCity] = useState(initialData?.city || 'Pune');
  const [stateName, setStateName] = useState(
    initialData?.state || 'Maharashtra',
  );
  const [pincode, setPincode] = useState(initialData?.pincode || '');
  const [type, setType] = useState(initialData?.type || 'Home');
  const [isDefault, setIsDefault] = useState(!!initialData?.isDefault);

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
    }

    const cleanMobile = mobile.replace(/[^0-9]/g, '');
    if (!cleanMobile) {
      newErrors.mobile = 'Mobile Number is required';
    } else if (cleanMobile.length !== 10) {
      newErrors.mobile = 'Mobile Number must be 10 digits';
    }

    if (!houseNumber.trim()) {
      newErrors.houseNumber = 'House / Flat / Building is required';
    }

    if (!street.trim()) {
      newErrors.street = 'Street / Area is required';
    }

    if (!city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!stateName.trim()) {
      newErrors.state = 'State is required';
    }

    const cleanPincode = pincode.replace(/[^0-9]/g, '');
    if (!cleanPincode) {
      newErrors.pincode = 'PIN Code is required';
    } else if (cleanPincode.length !== 6) {
      newErrors.pincode = 'PIN Code must be 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const data = {
      fullName: fullName.trim(),
      mobile: mobile.replace(/[^0-9]/g, '').slice(-10),
      houseNumber: houseNumber.trim(),
      street: street.trim(),
      landmark: landmark.trim(),
      city: city.trim(),
      state: stateName.trim(),
      pincode: pincode.replace(/[^0-9]/g, '').slice(-6),
      type,
      isDefault,
    };

    onSubmit && onSubmit(data);
  };

  const addressTypes = [
    { id: 'Home', label: 'Home', icon: '🏠' },
    { id: 'Office', label: 'Office', icon: '🏢' },
    { id: 'Other', label: 'Other', icon: '📍' },
  ];

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}>
      {/* Recipient Information */}
      <Text style={styles.sectionHeader}>Contact Information</Text>

      {/* Full Name */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>
          Full Name <Text style={styles.requiredStar}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, errors.fullName && styles.inputError]}
          placeholder="e.g. Kiran Kumar"
          placeholderTextColor={colors.textMuted}
          value={fullName}
          onChangeText={val => {
            setFullName(val);
            if (errors.fullName) setErrors(e => ({ ...e, fullName: null }));
          }}
          accessibilityLabel="Full Name input"
        />
        {errors.fullName && (
          <Text style={styles.errorText}>{errors.fullName}</Text>
        )}
      </View>

      {/* Mobile Number */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>
          Mobile Number <Text style={styles.requiredStar}>*</Text>
        </Text>
        <View
          style={[styles.phoneInputRow, errors.mobile && styles.inputError]}>
          <View style={styles.countryCodeBox}>
            <Text style={styles.countryCodeText}>+91</Text>
          </View>
          <TextInput
            style={styles.phoneInput}
            placeholder="10-digit mobile number"
            placeholderTextColor={colors.textMuted}
            keyboardType="phone-pad"
            maxLength={10}
            value={mobile}
            onChangeText={val => {
              setMobile(val.replace(/[^0-9]/g, ''));
              if (errors.mobile) setErrors(e => ({ ...e, mobile: null }));
            }}
            accessibilityLabel="Mobile Number input"
          />
        </View>
        {errors.mobile && <Text style={styles.errorText}>{errors.mobile}</Text>}
      </View>

      {/* Address Details */}
      <Text style={[styles.sectionHeader, styles.addressHeaderSpacing]}>
        Address Details
      </Text>

      {/* House / Flat / Building */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>
          House / Flat / Building <Text style={styles.requiredStar}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, errors.houseNumber && styles.inputError]}
          placeholder="e.g. Flat 402, Green Meadows"
          placeholderTextColor={colors.textMuted}
          value={houseNumber}
          onChangeText={val => {
            setHouseNumber(val);
            if (errors.houseNumber)
              setErrors(e => ({ ...e, houseNumber: null }));
          }}
          accessibilityLabel="House or Flat number input"
        />
        {errors.houseNumber && (
          <Text style={styles.errorText}>{errors.houseNumber}</Text>
        )}
      </View>

      {/* Street / Area */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>
          Street / Area <Text style={styles.requiredStar}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, errors.street && styles.inputError]}
          placeholder="e.g. Baner Road, Near Highway"
          placeholderTextColor={colors.textMuted}
          value={street}
          onChangeText={val => {
            setStreet(val);
            if (errors.street) setErrors(e => ({ ...e, street: null }));
          }}
          accessibilityLabel="Street or Area input"
        />
        {errors.street && <Text style={styles.errorText}>{errors.street}</Text>}
      </View>

      {/* Landmark */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Landmark (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Near D-Mart / Metro Pillar 42"
          placeholderTextColor={colors.textMuted}
          value={landmark}
          onChangeText={setLandmark}
          accessibilityLabel="Landmark input"
        />
      </View>

      {/* City & State Row */}
      <View style={styles.twoColRow}>
        <View style={[styles.fieldGroup, styles.colLeft]}>
          <Text style={styles.label}>
            City <Text style={styles.requiredStar}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.city && styles.inputError]}
            placeholder="City"
            placeholderTextColor={colors.textMuted}
            value={city}
            onChangeText={val => {
              setCity(val);
              if (errors.city) setErrors(e => ({ ...e, city: null }));
            }}
            accessibilityLabel="City input"
          />
          {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
        </View>

        <View style={[styles.fieldGroup, styles.colRight]}>
          <Text style={styles.label}>
            State <Text style={styles.requiredStar}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.state && styles.inputError]}
            placeholder="State"
            placeholderTextColor={colors.textMuted}
            value={stateName}
            onChangeText={val => {
              setStateName(val);
              if (errors.state) setErrors(e => ({ ...e, state: null }));
            }}
            accessibilityLabel="State input"
          />
          {errors.state && <Text style={styles.errorText}>{errors.state}</Text>}
        </View>
      </View>

      {/* PIN Code */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>
          PIN Code <Text style={styles.requiredStar}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, errors.pincode && styles.inputError]}
          placeholder="6-digit PIN code"
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
          maxLength={6}
          value={pincode}
          onChangeText={val => {
            setPincode(val.replace(/[^0-9]/g, ''));
            if (errors.pincode) setErrors(e => ({ ...e, pincode: null }));
          }}
          accessibilityLabel="PIN Code input"
        />
        {errors.pincode && (
          <Text style={styles.errorText}>{errors.pincode}</Text>
        )}
      </View>

      {/* Address Type Selection */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Address Type</Text>
        <View style={styles.typeRow}>
          {addressTypes.map(t => {
            const isSelected = type === t.id;
            return (
              <TouchableOpacity
                key={t.id}
                style={[styles.typeChip, isSelected && styles.typeChipSelected]}
                activeOpacity={0.7}
                onPress={() => setType(t.id)}
                accessibilityLabel={`Address Type ${t.label}`}>
                <Text style={styles.chipIcon}>{t.icon}</Text>
                <Text
                  style={[
                    styles.chipLabel,
                    isSelected && styles.chipLabelSelected,
                  ]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Default Address Checkbox */}
      <TouchableOpacity
        style={styles.checkboxRow}
        activeOpacity={0.8}
        onPress={() => setIsDefault(!isDefault)}
        accessibilityLabel="Make this default delivery address">
        <View style={[styles.checkbox, isDefault && styles.checkboxActive]}>
          {isDefault && <Text style={styles.checkMark}>✓</Text>}
        </View>
        <View style={styles.checkboxLabelCol}>
          <Text style={styles.checkboxLabel}>Make this my default address</Text>
          <Text style={styles.checkboxSub}>
            Orders will be delivered here automatically
          </Text>
        </View>
      </TouchableOpacity>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.submitBtn}
          activeOpacity={0.8}
          onPress={handleSubmit}
          accessibilityLabel={submitLabel}>
          <Text style={styles.submitBtnText}>{submitLabel}</Text>
        </TouchableOpacity>

        {onCancel && (
          <TouchableOpacity
            style={styles.cancelBtn}
            activeOpacity={0.7}
            onPress={onCancel}
            accessibilityLabel="Cancel">
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    paddingBottom: 40,
  },
  sectionHeader: {
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  addressHeaderSpacing: {
    marginTop: spacing.sm,
  },
  fieldGroup: {
    marginBottom: spacing.sm + 4,
  },
  label: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.semiBold,
    color: colors.textPrimary,
    marginBottom: 5,
  },
  requiredStar: {
    color: colors.error,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.sm + 2,
    fontSize: typography.sizes.sm,
    color: colors.textPrimary,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    fontSize: 11,
    color: colors.error,
    fontWeight: typography.weights.medium,
    marginTop: 4,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  countryCodeBox: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.sm + 2,
    borderRightWidth: 1,
    borderRightColor: colors.borderLight,
  },
  countryCodeText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.sm + 2,
    fontSize: typography.sizes.sm,
    color: colors.textPrimary,
  },
  twoColRow: {
    flexDirection: 'row',
  },
  colLeft: {
    flex: 1,
    marginRight: spacing.xs + 2,
  },
  colRight: {
    flex: 1,
    marginLeft: spacing.xs + 2,
  },
  typeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  typeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm + 2,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.md,
    marginHorizontal: 3,
  },
  typeChipSelected: {
    borderColor: colors.primary,
    backgroundColor: '#F1F8E9',
  },
  chipIcon: {
    fontSize: 15,
    marginRight: 6,
  },
  chipLabel: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.semiBold,
    color: colors.textSecondary,
  },
  chipLabelSelected: {
    color: colors.primaryDark,
    fontWeight: typography.weights.bold,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.sm,
    backgroundColor: '#FAFAFA',
    padding: spacing.sm + 2,
    borderRadius: borderRadius.md,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
    backgroundColor: colors.surface,
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkMark: {
    color: colors.surface,
    fontSize: 13,
    fontWeight: typography.weights.bold,
  },
  checkboxLabelCol: {
    flex: 1,
  },
  checkboxLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  checkboxSub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  buttonContainer: {
    marginTop: spacing.md,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm + 4,
    alignItems: 'center',
    elevation: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  submitBtnText: {
    color: colors.surface,
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
  },
  cancelBtn: {
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  cancelBtnText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
  },
});

export default AddressForm;