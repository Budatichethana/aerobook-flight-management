import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Flight = {
  id: string
  flight_no: string
  origin: string
  destination: string
  departs_at: string
  arrives_at: string
  aircraft_type: string
  status: string
  base_price: number
}

export type SelectedSeat = {
  seat_number: string
  class: string
  is_available: boolean
  extra_fee: number | string | null
}

type PassengerForm = {
  full_name: string
  passport_no: string
  nationality: string
  dob: string
}

type FlightState = {
  flights: Flight[]
  addFlight: (flight: Flight) => void
  selectedFlight: Flight | null
  selectedSeat: SelectedSeat | null
  setSelectedFlight: (flight: Flight | null) => void
  setSelectedSeat: (seat: SelectedSeat | null) => void
  // search and booking flow state
  searchQuery: string
  setSearchQuery: (q: string) => void
  bookingStep: number
  setBookingStep: (step: number) => void
  passengerForm: PassengerForm
  setPassengerForm: (patch: Partial<PassengerForm>) => void
  // reset store (used on logout / cancellation)
  reset: () => void
}

const initialPassengerForm: PassengerForm = {
  full_name: '',
  passport_no: '',
  nationality: '',
  dob: ''
}

export const useStore = create<FlightState>()(
  persist(
    (set, get) => ({
      flights: [],
      selectedFlight: null,
      selectedSeat: null,
      addFlight: (flight) => set((state) => ({ flights: [...state.flights, flight] })),
      setSelectedFlight: (flight) => set(() => ({ selectedFlight: flight })),
      setSelectedSeat: (seat) => set(() => ({ selectedSeat: seat })),
      searchQuery: '',
      setSearchQuery: (q) => set(() => ({ searchQuery: q })),
      bookingStep: 0,
      setBookingStep: (step) => set(() => ({ bookingStep: step })),
      passengerForm: initialPassengerForm,
      setPassengerForm: (patch) => set((state) => ({ passengerForm: { ...state.passengerForm, ...patch } })),
      reset: () =>
        set(() => ({
          flights: [],
          selectedFlight: null,
          selectedSeat: null,
          searchQuery: '',
          bookingStep: 0,
          passengerForm: initialPassengerForm
        }))
    }),
    {
      name: 'flight-store',
      // exclude passport_no from persisted snapshot
      partialize: (state) => {
        const { passengerForm, ...rest } = state as any
        const safePassenger = passengerForm
          ? {
              full_name: passengerForm.full_name,
              nationality: passengerForm.nationality,
              dob: passengerForm.dob
            }
          : undefined
        return { ...rest, passengerForm: safePassenger }
      }
    }
  )
)

// User store for auth session and cached bookings
type UserState = {
  session: any | null
  bookings: any[]
  setSession: (s: any | null) => void
  setBookings: (b: any[]) => void
  reset: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      session: null,
      bookings: [],
      setSession: (s) => set(() => ({ session: s })),
      setBookings: (b) => set(() => ({ bookings: b })),
      reset: () => set(() => ({ session: null, bookings: [] }))
    }),
    {
      name: 'user-store',
      partialize: (state) => {
        // persist only minimal info: userEmail and accessToken (if present)
        const session = state.session as any
        const userEmail = session?.user?.email ?? null
        const accessToken = session?.access_token ?? null
        const bookings = (state.bookings ?? []).map((b: any) => {
          // copy booking but strip passenger passport_no if present
          const cloned = { ...b }
          if (cloned?.passengers) {
            cloned.passengers = cloned.passengers.map((p: any) => ({
              ...p,
              passport_no: undefined
            }))
          }
          return cloned
        })

        return { session: { userEmail, accessToken }, bookings }
      }
    }
  )
)

