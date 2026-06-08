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

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  type: "delivery" | "match" | "system" | "message";
  relatedId?: string;
}

export interface Message {
  id: string;
  senderId: "me" | "other";
  text: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  parcelId?: string;
  otherName: string;
  otherInitials: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
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
  {
    id: "t5",
    travelerId: "u6",
    travelerName: "Marcus Lee",
    travelerInitials: "ML",
    travelerRating: 4.6,
    from: "Boston, MA",
    fromCity: "Boston",
    to: "Philadelphia, PA",
    toCity: "Philadelphia",
    date: "Dec 14",
    departureTime: "11:00 AM",
    maxWeight: 6,
    maxSize: "medium",
    pricePerKg: 10,
    status: "open",
    acceptedCount: 1,
    maxParcels: 3,
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
      { id: "ts1", title: "Package Accepted", description: "Alex M. accepted your package", timestamp: "Dec 9, 8:00 AM", completed: true },
      { id: "ts2", title: "Pickup Confirmed", description: "Package picked up in New York", timestamp: "Dec 10, 9:15 AM", completed: true },
      { id: "ts3", title: "In Transit", description: "Traveling to Los Angeles", timestamp: "Dec 10, 10:00 AM", completed: true },
      { id: "ts4", title: "Delivered", description: "Package delivered to recipient", timestamp: "Estimated Dec 11", completed: false },
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
      { id: "ts1", title: "Package Accepted", description: "Sarah K. accepted your package", timestamp: "Dec 3, 2:00 PM", completed: true },
      { id: "ts2", title: "Pickup Confirmed", description: "Package picked up in Chicago", timestamp: "Dec 4, 9:00 AM", completed: true },
      { id: "ts3", title: "In Transit", description: "On the way to Houston", timestamp: "Dec 4, 10:30 AM", completed: true },
      { id: "ts4", title: "Delivered", description: "Package successfully delivered", timestamp: "Dec 5, 3:45 PM", completed: true },
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
      { id: "ts1", title: "Request Posted", description: "Waiting for a traveler to accept", timestamp: "Today, 9:30 AM", completed: true },
      { id: "ts2", title: "Package Accepted", description: "Waiting for traveler match", timestamp: "Pending", completed: false },
    ],
  },
  {
    id: "p4",
    title: "Art Prints",
    from: "Miami, FL",
    fromCity: "Miami",
    to: "Atlanta, GA",
    toCity: "Atlanta",
    weight: 0.5,
    size: "small",
    description: "Rolled canvas prints, do not bend",
    reward: 30,
    status: "pending",
    createdAt: "1 hour ago",
    trackingSteps: [
      { id: "ts1", title: "Request Posted", description: "Waiting for a traveler to accept", timestamp: "Today, 11:00 AM", completed: true },
      { id: "ts2", title: "Package Accepted", description: "Waiting for traveler match", timestamp: "Pending", completed: false },
    ],
  },
  {
    id: "p5",
    title: "Medication Package",
    from: "Boston, MA",
    fromCity: "Boston",
    to: "Philadelphia, PA",
    toCity: "Philadelphia",
    weight: 0.3,
    size: "small",
    description: "Temperature-sensitive medication, keep cool",
    reward: 40,
    status: "pending",
    createdAt: "30 min ago",
    trackingSteps: [
      { id: "ts1", title: "Request Posted", description: "Waiting for a traveler to accept", timestamp: "Today, 12:30 PM", completed: true },
      { id: "ts2", title: "Package Accepted", description: "Waiting for traveler match", timestamp: "Pending", completed: false },
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

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  { id: "n1", title: "Package Accepted", body: "Alex M. accepted your Electronics Package request", timestamp: "2h ago", read: false, type: "match", relatedId: "p1" },
  { id: "n2", title: "Delivered!", body: 'Your "Birthday Gift" was successfully delivered to Houston', timestamp: "Yesterday", read: false, type: "delivery", relatedId: "p2" },
  { id: "n3", title: "New Message", body: 'Alex M.: "I\'ll pick it up at 9am tomorrow"', timestamp: "4h ago", read: false, type: "message", relatedId: "c1" },
  { id: "n4", title: "New Trip Available", body: "Emma W. posted a trip: Seattle → San Francisco", timestamp: "5h ago", read: true, type: "system", relatedId: "t4" },
  { id: "n5", title: "Price Drop", body: "James T. reduced his Miami → Atlanta rate to $8/kg", timestamp: "1d ago", read: true, type: "system", relatedId: "t3" },
];

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: "c1",
    parcelId: "p1",
    otherName: "Alex Martinez",
    otherInitials: "AM",
    lastMessage: "I'll pick it up at 9am tomorrow",
    lastMessageTime: "4h ago",
    unreadCount: 1,
    messages: [
      { id: "m1", senderId: "other", text: "Hi! I saw your Electronics Package going to LA. I can carry it!", timestamp: "Dec 9, 8:05 AM" },
      { id: "m2", senderId: "me", text: "Great! The package is 1.2kg, fits in a backpack easily.", timestamp: "Dec 9, 8:10 AM" },
      { id: "m3", senderId: "other", text: "Perfect. What time should I pick it up?", timestamp: "Dec 9, 8:12 AM" },
      { id: "m4", senderId: "me", text: "Anytime after 8am works for me. I'm at 42 West St.", timestamp: "Dec 9, 8:14 AM" },
      { id: "m5", senderId: "other", text: "I'll pick it up at 9am tomorrow", timestamp: "Dec 9, 8:15 AM" },
    ],
  },
  {
    id: "c2",
    parcelId: "p2",
    otherName: "Sarah Kim",
    otherInitials: "SK",
    lastMessage: "Package delivered! Thanks for using ParcelGo",
    lastMessageTime: "Dec 5",
    unreadCount: 0,
    messages: [
      { id: "m6", senderId: "other", text: "I just picked up the Birthday Gift from Chicago!", timestamp: "Dec 4, 9:05 AM" },
      { id: "m7", senderId: "me", text: "Awesome! Please handle with care, it's fragile.", timestamp: "Dec 4, 9:10 AM" },
      { id: "m8", senderId: "other", text: "Of course, will wrap it extra carefully!", timestamp: "Dec 4, 9:12 AM" },
      { id: "m9", senderId: "other", text: "Package delivered! Thanks for using ParcelGo", timestamp: "Dec 5, 3:50 PM" },
    ],
  },
];

interface AppContextType {
  trips: Trip[];
  parcels: Parcel[];
  user: UserProfile;
  notifications: AppNotification[];
  conversations: Conversation[];
  unreadNotifications: number;
  addParcel: (parcel: Omit<Parcel, "id" | "createdAt" | "trackingSteps" | "status">) => void;
  addTrip: (trip: Omit<Trip, "id" | "travelerId" | "travelerName" | "travelerInitials" | "travelerRating" | "status" | "acceptedCount" | "isOwn">) => void;
  requestDelivery: (parcelId: string, tripId: string) => void;
  acceptParcel: (parcelId: string, tripId: string) => void;
  markAllNotificationsRead: () => void;
  markNotificationRead: (id: string) => void;
  sendMessage: (conversationId: string, text: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [trips, setTrips] = useState<Trip[]>(INITIAL_TRIPS);
  const [parcels, setParcels] = useState<Parcel[]>(INITIAL_PARCELS);
  const [user] = useState<UserProfile>(INITIAL_USER);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [tripsData, parcelsData, notifData, convData] = await Promise.all([
        AsyncStorage.getItem("pg_trips"),
        AsyncStorage.getItem("pg_parcels"),
        AsyncStorage.getItem("pg_notifications"),
        AsyncStorage.getItem("pg_conversations"),
      ]);
      if (tripsData) setTrips(JSON.parse(tripsData));
      if (parcelsData) setParcels(JSON.parse(parcelsData));
      if (notifData) setNotifications(JSON.parse(notifData));
      if (convData) setConversations(JSON.parse(convData));
    } catch {}
  }

  async function saveTrips(next: Trip[]) {
    setTrips(next);
    try { await AsyncStorage.setItem("pg_trips", JSON.stringify(next)); } catch {}
  }

  async function saveParcels(next: Parcel[]) {
    setParcels(next);
    try { await AsyncStorage.setItem("pg_parcels", JSON.stringify(next)); } catch {}
  }

  async function saveNotifications(next: AppNotification[]) {
    setNotifications(next);
    try { await AsyncStorage.setItem("pg_notifications", JSON.stringify(next)); } catch {}
  }

  async function saveConversations(next: Conversation[]) {
    setConversations(next);
    try { await AsyncStorage.setItem("pg_conversations", JSON.stringify(next)); } catch {}
  }

  function addParcel(data: Omit<Parcel, "id" | "createdAt" | "trackingSteps" | "status">) {
    const newParcel: Parcel = {
      ...data,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      status: "pending",
      createdAt: "Just now",
      trackingSteps: [
        { id: "ts1", title: "Request Posted", description: "Waiting for a traveler to accept", timestamp: "Just now", completed: true },
        { id: "ts2", title: "Package Accepted", description: "Waiting for traveler match", timestamp: "Pending", completed: false },
      ],
    };
    saveParcels([newParcel, ...parcels]);
  }

  function addTrip(data: Omit<Trip, "id" | "travelerId" | "travelerName" | "travelerInitials" | "travelerRating" | "status" | "acceptedCount" | "isOwn">) {
    const initials = user.name.split(" ").map((n) => n[0]).join("");
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
    const newNotif: AppNotification = {
      id: Date.now().toString(),
      title: "Trip Posted",
      body: `Your trip ${data.fromCity} → ${data.toCity} is now live`,
      timestamp: "Just now",
      read: true,
      type: "system",
    };
    saveNotifications([newNotif, ...notifications]);
  }

  function _matchParcel(parcelId: string, tripId: string) {
    const updatedParcels = parcels.map((p) =>
      p.id === parcelId
        ? {
            ...p,
            status: "matched" as ParcelStatus,
            matchedTripId: tripId,
            trackingSteps: p.trackingSteps.map((s) =>
              s.id === "ts2" ? { ...s, completed: true, timestamp: "Just now" } : s
            ),
          }
        : p
    );
    saveParcels(updatedParcels);
    const updatedTrips = trips.map((t) =>
      t.id === tripId ? { ...t, acceptedCount: t.acceptedCount + 1 } : t
    );
    saveTrips(updatedTrips);
  }

  function requestDelivery(parcelId: string, tripId: string) {
    _matchParcel(parcelId, tripId);
    const parcel = parcels.find((p) => p.id === parcelId);
    const trip = trips.find((t) => t.id === tripId);
    if (parcel && trip) {
      const newNotif: AppNotification = {
        id: Date.now().toString(),
        title: "Delivery Requested",
        body: `You requested ${trip.travelerName} to carry "${parcel.title}"`,
        timestamp: "Just now",
        read: true,
        type: "match",
        relatedId: parcelId,
      };
      saveNotifications([newNotif, ...notifications]);
    }
  }

  function acceptParcel(parcelId: string, tripId: string) {
    _matchParcel(parcelId, tripId);
    const parcel = parcels.find((p) => p.id === parcelId);
    if (parcel) {
      const newNotif: AppNotification = {
        id: Date.now().toString(),
        title: "Parcel Accepted",
        body: `You agreed to carry "${parcel.title}"`,
        timestamp: "Just now",
        read: true,
        type: "match",
        relatedId: parcelId,
      };
      saveNotifications([newNotif, ...notifications]);
    }
  }

  function markAllNotificationsRead() {
    saveNotifications(notifications.map((n) => ({ ...n, read: true })));
  }

  function markNotificationRead(id: string) {
    saveNotifications(notifications.map((n) => n.id === id ? { ...n, read: true } : n));
  }

  function sendMessage(conversationId: string, text: string) {
    const newMsg: Message = {
      id: Date.now().toString(),
      senderId: "me",
      text,
      timestamp: "Just now",
    };
    const updated = conversations.map((c) =>
      c.id === conversationId
        ? { ...c, messages: [...c.messages, newMsg], lastMessage: text, lastMessageTime: "Just now" }
        : c
    );
    saveConversations(updated);
  }

  return (
    <AppContext.Provider value={{
      trips, parcels, user, notifications, conversations, unreadNotifications,
      addParcel, addTrip, requestDelivery, acceptParcel,
      markAllNotificationsRead, markNotificationRead, sendMessage,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
