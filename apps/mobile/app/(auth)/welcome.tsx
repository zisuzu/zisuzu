import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert
} from 'react-native'
import { router } from 'expo-router'
import { supabase } from '../../lib/supabase'
import { colors, spacing, typography, borderRadius } from '../../constants/theme'

export default function WelcomeScreen() {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSendOTP = async () => {
    if (!phone || phone.length < 10) {
      Alert.alert('Invalid number', 'Please enter a valid phone number')
      return
    }
    const formatted = phone.startsWith('+') ? phone : `+91${phone.replace(/\D/g, '')}`
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({ phone: formatted })
    setLoading(false)

    if (error) {
      Alert.alert('Error', error.message)
      return
    }
    router.push({ pathname: '/(auth)/verify', params: { phone: formatted } })
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        <Text style={styles.logo}>Roame</Text>
        <Text style={styles.tagline}>Discover & join activities near you</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Enter your phone number</Text>
          <TextInput
            style={styles.input}
            placeholder="+91 9876543210"
            placeholderTextColor={colors.gray400}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            autoFocus
          />
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSendOTP}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Sending...' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.disclaimer}>
          By continuing, you agree to our Terms & Privacy Policy
        </Text>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: colors.white },
  inner:        { flex: 1, justifyContent: 'center', padding: spacing.lg },
  logo:         { fontSize: 40, fontWeight: '700', color: colors.primary, textAlign: 'center', marginBottom: spacing.xs },
  tagline:      { fontSize: typography.fontSizeMd, color: colors.gray500, textAlign: 'center', marginBottom: spacing['2xl'] },
  form:         { gap: spacing.sm },
  label:        { fontSize: typography.fontSizeSm, color: colors.gray700, fontWeight: '500' },
  input:        {
    borderWidth: 1, borderColor: colors.gray200, borderRadius: borderRadius.md,
    padding: spacing.md, fontSize: typography.fontSizeMd, color: colors.gray900,
    backgroundColor: colors.gray50,
  },
  button:       {
    backgroundColor: colors.primary, borderRadius: borderRadius.md,
    padding: spacing.md, alignItems: 'center', marginTop: spacing.xs,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText:   { color: colors.white, fontWeight: '600', fontSize: typography.fontSizeMd },
  disclaimer:   { fontSize: typography.fontSizeXs, color: colors.gray400, textAlign: 'center', marginTop: spacing.xl },
})

