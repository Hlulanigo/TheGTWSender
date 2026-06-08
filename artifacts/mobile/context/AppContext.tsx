import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ParcelSize = "small" | "medium" | "large";
export type TripStatus = "open" | "full" | "completed";
export type ParcelStatus = "pending" | "matched" | "in_transit" | "delivered";

export interface Trip {
  id: string;
  travelerId: string;
  travelerName: string;
  travelerInitials: string;
  travelerRating: number;
  from: string;
  fromCity: string;
  to: string;
  toCity: string;
  date: string;
  departureTime: string;
  maxWeight: number;
  maxSize: ParcelSize;
  pricePerKg: number;
  status: TripStatus;
  acceptedCount: number;
  maxParcels: number;
  isOwn?: boolean;
}

export interface TrackingStep {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  completed: boolean;
}

export interface Parcel {
  id: string;
  title: string;
  from: string;
  fromCity: string;
  to: string;
  toCity: string;
  weight: number;
  size: ParcelSize;
  description: string;
  reward: number;
  status: ParcelStatus;
  matchedTripId?: string;
  trackingSteps: TrackingStep[];
  createdAt: string;
}

export interface UserProfile {
  name: string;
  email: string;
  rating: number;
  parcelsSent: number;
  tripsPosted: number;
  earnings: number;
  memberSince: string;
}

const INITIAL_TRIPS: Trip[] = [
  {
    id: "t1",
    travelerId: "u2",
    travelerName: "Alex Martinez",
    travelerInitials: "AM",
    travelerRating: 4.9,
    from: "New York, NY",
    fromCity: "New York",
    to: "Los Angeles, CA",
    toCity: "Los Angeles",
    date: "Tomorrow",
    departureTime: "8:30 AM",
    maxWeight: 5,
    maxSize: "medium",
    pricePerKg: 12,
    status: "open",
    acceptedCount: 1,
    maxParcels: 3,
  },
  {
    id: "t2",
    travelerId: "u3",
    travelerName: "Sarah Kim",
    travelerInitials: "SK",
    travelerRating: 4.8,
    from: "Chicago, IL",
    fromCity: "Chicago",
    to: "Houston, TX",
    toCity: "Houston",
    date: "Today",
    departureTime: "6:00 PM",
    maxWeight: 8,
    maxSize: "large",
    pricePerKg: 9,
    status: "open",
    acceptedCount: 0,
    maxParcels: 4,
  },
  {
    id: "t3",
    travelerId: "u4",
    travelerName: "James Thompson",
    travelerInitials: "JT",
    travelerRating: 5.0,
    from: "Miami, FL",
    fromCity: "Miami",
    to: "Atlanta, GA",
    toCity: "Atlanta",
    date: "Dec 12",
    departureTime: "10:00 AM",
    maxWeight: 10,
    maxSize: "large",
    pricePerKg: 8,
    status: "open",
    acceptedCount: 2,
    maxParcels: 5,
  },
  {
    id: "t4",
    travelerId: "u5",
    travelerName: "Emma Wilson",
    travelerInitials: "EW",
    travelerRating: 4.7,
    from: "Seattle, WA",
    fromCity: "Seattle",
    to: "San Francisco, CA",
    toCity: "San Francisco",
    date: "Dec 13",
    departureTime: "2:30 PM",
    maxWeight: 3,
    maxSize: "small",
    pricePerKg: 15,
    status: "open",
    acceptedCount: 0,
    maxParcels: 2,
  },
];

const INITIAL_PARCELS: Parcel[] = [
  {
    id: "p1",
    title: "Electronics Package",
    from: "New York, NY",
    fromCity: "New York",
    to: "Los Angeles, CA",
    toCity: "Los Angeles",
    weight: 1.2,
    size: "small",
    description: "Laptop accessories in padded box",
    reward: 35,
    status: "in_transit",
    matchedTripId: "t1",
    createdAt: "2 days ago",
    trackingSteps: [
      {
        id: "ts1",
        title: "Package Accepted",
        description: "Alex M. accepted your package",
        timestamp: "Dec 9, 8:00 AM",
        completed: true,
      },
      {
        id: "ts2",
        title: "Pickup Confirmed",
        description: "Package picked up in New York",
        timestamp: "Dec 10, 9:15 AM",
        completed: true,
      },
      {
        id: "ts3",
        title: "In Transit",
        description: "Traveling to Los Angeles",
        timestamp: "Dec 10, 10:00 AM",
        completed: true,
      },
      {
        id: "ts4",
        title: "Delivered",
        description: "Package delivered to recipient",
        timestamp: "Estimated Dec 11",
        completed: false,
      },
    ],
  },
  {
    id: "p2",
    title: "Birthday Gift",
    from: "Chicago, IL",
    fromCity: "Chicago",
    to: "Houston, TX",
    toCity: "Houston",
    weight: 0.8,
    size: "small",
    description: "Fragile gift box, handle with care",
    reward: 20,
    status: "delivered",
    matchedTripId: "t2",
    createdAt: "1 week ago",
    trackingSteps: [
      {
        id: "ts1",
        title: "Package Accepted",
        description: "Sarah K. accepted your package",
        timestamp: "Dec 3, 2:00 PM",
        completed: true,
      },
      {
        id: "ts2",
        title: "Pickup Confirmed",
        description: "Package picked up in Chicago",
        timestamp: "Dec 4, 9:00 AM",
        completed: true,
      },
      {
        id: "ts3",
        title: "In Transit",
        description: "On the way to Houston",
        timestamp: "Dec 4, 10:30 AM",
        completed: true,
      },
      {
        id: "ts4",
        title: "Delivered",
        description: "Package successfully delivered",
        timestamp: "Dec 5, 3:45 PM",
        completed: true,
      },
    ],
  },
  {
    id: "p3",
    title: "Legal Documents",
    from: "Seattle, WA",
    fromCity: "Seattle",
    to: "Portland, OR",
    toCity: "Portland",
    weight: 0.2,
    size: "small",
    description: "Urgent documents in envelope",
    reward: 25,
    status: "pending",
    createdAt: "3 hours ago",
    trackingSteps: [
      {
        id: "ts1",
        title: "Request Posted",
        description: "Waiting for a traveler to accept",
        timestamp: "Today, 9:30 AM",
        completed: true,
      },
      {
        id: "ts2",
        title: "Package Accepted",
        description: "Waiting for traveler match",
        timestamp: "Pending",
        completed: false,
      },
    ],
  },
];

const INITIAL_USER: UserProfile = {
  name: "Jordan Lee",
  email: "jordan.lee@email.com",
  rating: 4.9,
  parcelsSent: 12,
  tripsPosted: 8,
  earnings: 340,
  memberSince: "March 2024",
};

interface AppContextType {
  trips: Trip[];
  parcels: Parcel[];
  user: UserProfile;
  addParcel: (
    parcel: Omit<Parcel, "id" | "createdAt" | "trackingSteps" | "status">
  ) => void;
  addTrip: (
    trip: Omit<
      Trip,
      | "id"
      | "travelerId"
      | "travelerName"
      | "travelerInitials"
      | "travelerRating"
      | "status"
      | "acceptedCount"
      | "isOwn"
    >
  ) => void;
  requestDelivery: (parcelId: string, tripId: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [trips, setTrips] = useState<Trip[]>(INITIAL_TRIPS);
  const [parcels, setParcels] = useState<Parcel[]>(INITIAL_PARCELS);
  const [user] = useState<UserProfile>(INITIAL_USER);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [tripsData, parcelsData] = await Promise.all([
        AsyncStorage.getItem("pg_trips"),
        AsyncStorage.getItem("pg_parcels"),
      ]);
      if (tripsData) setTrips(JSON.parse(tripsData));
      if (parcelsData) setParcels(JSON.parse(parcelsData));
    } catch {}
  }

  async function saveTrips(next: Trip[]) {
    setTrips(next);
    try {
      await AsyncStorage.setItem("pg_trips", JSON.stringify(next));
    } catch {}
  }

  async function saveParcels(next: Parcel[]) {
    setParcels(next);
    try {
      await AsyncStorage.setItem("pg_parcels", JSON.stringify(next));
    } catch {}
  }

  function addParcel(
    data: Omit<Parcel, "id" | "createdAt" | "trackingSteps" | "status">
  ) {
    const newParcel: Parcel = {
      ...data,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      status: "pending",
      createdAt: "Just now",
      trackingSteps: [
        {
          id: "ts1",
          title: "Request Posted",
          description: "Waiting for a traveler to accept",
          timestamp: "Just now",
          completed: true,
        },
        {
          id: "ts2",
          title: "Package Accepted",
          description: "Waiting for traveler match",
          timestamp: "Pending",
          completed: false,
        },
      ],
    };
    saveParcels([newParcel, ...parcels]);
  }

  function addTrip(
    data: Omit<
      Trip,
      | "id"
      | "travelerId"
      | "travelerName"
      | "travelerInitials"
      | "travelerRating"
      | "status"
      | "acceptedCount"
      | "isOwn"
    >
  ) {
    const initials = user.name
      .split(" ")
      .map((n) => n[0])
      .join("");
    const newTrip: Trip = {
      ...data,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      travelerId: "u1",
      travelerName: user.name,
      travelerInitials: initials,
      travelerRating: user.rating,
      status: "open",
      acceptedCount: 0,
      isOwn: true,
    };
    saveTrips([newTrip, ...trips]);
  }

  function requestDelivery(parcelId: string, tripId: string) {
    const updated = parcels.map((p) =>
      p.id === parcelId
        ? { ...p, status: "matched" as ParcelStatus, matchedTripId: tripId }
        : p
    );
    saveParcels(updated);
  }

  return (
    <AppContext.Provider
      value={{ trips, parcels, user, addParcel, addTrip, requestDelivery }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
