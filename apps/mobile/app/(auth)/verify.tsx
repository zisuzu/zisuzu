import { useState, useRef } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView, Platform
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { supabase } from '../../lib/supabase'
import { colors, spacing, typography, borderRadius } from '../../constants/theme'

export default function VerifyScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>()
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<TextInput>(null)

  const handleVerify = async () => {
    if (otp.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter the 6-digit code')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.verifyOtp({
      phone: phone as string,
      token: otp,
      type: 'sms',
    })
    setLoading(false)

    if (error) {
      Alert.alert('Invalid code', error.message)
      return
    }
    // Session is set automatically — _layout.tsx handles redirect
  }

  const handleResend = async () => {
    const { error } = await supabase.auth.signInWithOtp({ phone: phone as string })
    if (!error) Alert.alert('Sent!', 'A new code has been sent to your phone')
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Enter OTP</Text>
        <Text style={styles.subtitle}>
          Code sent to {phone}
        </Text>

        <TextInput
          ref={inputRef}
          style={styles.otpInput}
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          maxLength={6}
          autoFocus
          textAlign="center"
          letterSpacing={16}
          placeholder="------"
          placeholderTextColor={colors.gray300}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleVerify}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Verifying...' : 'Verify'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleResend} style={styles.resend}>
          <Text style={styles.resendText}>Resend code</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: colors.white },
  inner:         { flex: 1, justifyContent: 'center', padding: spacing.lg },
  back:          { position: 'absolute', top: spacing.xl, left: spacing.lg },
  backText:      { color: colors.primary, fontSize: typography.fontSizeMd },
  title:         { fontSize: typography.fontSize3Xl, fontWeight: '700', color: colors.gray900, marginBottom: spacing.xs },
  subtitle:      { fontSize: typography.fontSizeMd, color: colors.gray500, marginBottom: spacing.xl },
  otpInput:      {
    borderWidth: 2, borderColor: colors.primary, borderRadius: borderRadius.md,
    padding: spacing.md, fontSize: 28, color: colors.gray900,
    marginBottom: spacing.lg, backgroundColor: colors.gray50,
  },
  button:        {
    backgroundColor: colors.primary, borderRadius: borderRadius.md,
    padding: spacing.md, alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText:    { color: colors.white, fontWeight: '600', fontSize: typography.fontSizeMd },
  resend:        { alignItems: 'center', marginTop: spacing.md },
  resendText:    { color: colors.primary, fontSize: typography.fontSizeSm },
})

