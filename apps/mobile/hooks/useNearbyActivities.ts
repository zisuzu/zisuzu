import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

interface NearbyActivitiesOptions {
  lat: number
  lng: number
  radiusKm?: number
  categoryId?: string | null
  limit?: number
  offset?: number
}

export function useNearbyActivities({
  lat,
  lng,
  radiusKm = 60,
  categoryId = null,
  limit = 50,
  offset = 0,
}: NearbyActivitiesOptions) {
  return useQuery({
    queryKey: ['nearby-activities', lat, lng, radiusKm, categoryId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('nearby_activities', {
        p_lat: lat,
        p_lng: lng,
        p_radius_km: radiusKm,
        p_category_id: categoryId,
        p_limit: limit,
        p_offset: offset,
      })
      if (error) throw error
      return data
    },
    enabled: lat !== 0 && lng !== 0,
    staleTime: 1000 * 60 * 2,
  })
}

