import { colors, spacing, typography, borderRadius } from '../../../packages/ui/tokens'
import { StyleSheet } from 'react-native'

export { colors, spacing, typography, borderRadius }

// React Native StyleSheet-ready shadows (elevation based)
export const shadows = StyleSheet.create({
  sm: { elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  md: { elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1,  shadowRadius: 4 },
  lg: { elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8 },
})

