import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

// Report Types
export interface TrafficReport {
  id?: string;
  userId: string;
  userName: string;
  type: 'police' | 'traffic' | 'accident' | 'breakdown' | 'construction' | 'pothole' | 'tree' | 'weather';
  title: string;
  description: string;
  location: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  severity: 'low' | 'medium' | 'high';
  status: 'active' | 'resolved';
  confirmations: number;
  confirmedBy: string[];
  chatRoomId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ChatMessage {
  id?: string;
  chatRoomId: string;
  userId: string;
  userName: string;
  message: string;
  messageType: 'text' | 'traffic_update' | 'location' | 'system';
  trafficInfo?: {
    type: 'jam' | 'accident' | 'construction' | 'clear';
    severity: 'low' | 'medium' | 'high';
    estimatedDelay?: string;
  };
  location?: string;
  createdAt: Timestamp;
}

export interface ChatRoom {
  id?: string;
  name: string;
  location: string;
  reportId?: string;
  activeUsers: string[];
  lastActivity: Timestamp;
  trafficStatus: 'heavy' | 'moderate' | 'light' | 'clear';
  createdAt: Timestamp;
}

// Car Profile Types
export interface CarProfile {
  id?: string;
  userId: string;
  name: string;
  model: string;
  fuelType: 'petrol' | 'electric' | 'hybrid';
  fuelEfficiency: number; // km/l for petrol, km/kWh for electric
  fuelPrice: number; // price per liter or kWh
  isMain: boolean;
  batteryCapacity?: number; // kWh for electric cars
  chargingSpeed?: 'slow' | 'fast' | 'rapid' | 'ultra'; // for electric cars
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Reports Database Functions
export const createReport = async (report: Omit<TrafficReport, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'reports'), {
      ...report,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating report:', error);
    throw error;
  }
};

export const updateReport = async (reportId: string, updates: Partial<TrafficReport>) => {
  try {
    await updateDoc(doc(db, 'reports', reportId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating report:', error);
    throw error;
  }
};

export const deleteReport = async (reportId: string) => {
  try {
    await deleteDoc(doc(db, 'reports', reportId));
  } catch (error) {
    console.error('Error deleting report:', error);
    throw error;
  }
};

export const getReports = async (status?: 'active' | 'resolved') => {
  try {
    let q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
    
    if (status) {
      q = query(collection(db, 'reports'), where('status', '==', status), orderBy('createdAt', 'desc'));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as TrafficReport[];
  } catch (error) {
    console.error('Error getting reports:', error);
    throw error;
  }
};

export const confirmReport = async (reportId: string, userId: string) => {
  try {
    const reportRef = doc(db, 'reports', reportId);
    const reportDoc = await getDoc(reportRef);
    
    if (reportDoc.exists()) {
      const reportData = reportDoc.data() as TrafficReport;
      const confirmedBy = reportData.confirmedBy || [];
      
      if (!confirmedBy.includes(userId)) {
        await updateDoc(reportRef, {
          confirmations: reportData.confirmations + 1,
          confirmedBy: [...confirmedBy, userId],
          updatedAt: serverTimestamp(),
        });
      }
    }
  } catch (error) {
    console.error('Error confirming report:', error);
    throw error;
  }
};

// Chat Database Functions
export const createChatRoom = async (room: Omit<ChatRoom, 'id' | 'createdAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'chatRooms'), {
      ...room,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating chat room:', error);
    throw error;
  }
};

export const joinChatRoom = async (roomId: string, userId: string) => {
  try {
    const roomRef = doc(db, 'chatRooms', roomId);
    const roomDoc = await getDoc(roomRef);
    
    if (roomDoc.exists()) {
      const roomData = roomDoc.data() as ChatRoom;
      const activeUsers = roomData.activeUsers || [];
      
      if (!activeUsers.includes(userId)) {
        await updateDoc(roomRef, {
          activeUsers: [...activeUsers, userId],
          lastActivity: serverTimestamp(),
        });
      }
    }
  } catch (error) {
    console.error('Error joining chat room:', error);
    throw error;
  }
};

export const leaveChatRoom = async (roomId: string, userId: string) => {
  try {
    const roomRef = doc(db, 'chatRooms', roomId);
    const roomDoc = await getDoc(roomRef);
    
    if (roomDoc.exists()) {
      const roomData = roomDoc.data() as ChatRoom;
      const activeUsers = roomData.activeUsers || [];
      
      await updateDoc(roomRef, {
        activeUsers: activeUsers.filter(id => id !== userId),
        lastActivity: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error leaving chat room:', error);
    throw error;
  }
};

export const sendMessage = async (message: Omit<ChatMessage, 'id' | 'createdAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'messages'), {
      ...message,
      createdAt: serverTimestamp(),
    });
    
    // Update chat room last activity
    await updateDoc(doc(db, 'chatRooms', message.chatRoomId), {
      lastActivity: serverTimestamp(),
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const getChatMessages = async (chatRoomId: string, limitCount = 50) => {
  try {
    const q = query(
      collection(db, 'messages'),
      where('chatRoomId', '==', chatRoomId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })).reverse() as ChatMessage[];
  } catch (error) {
    console.error('Error getting chat messages:', error);
    throw error;
  }
};

export const getChatRooms = async () => {
  try {
    const q = query(collection(db, 'chatRooms'), orderBy('lastActivity', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ChatRoom[];
  } catch (error) {
    console.error('Error getting chat rooms:', error);
    throw error;
  }
};

// Car Profile Database Functions
export const createCarProfile = async (car: Omit<CarProfile, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'cars'), {
      ...car,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating car profile:', error);
    throw error;
  }
};

export const updateCarProfile = async (carId: string, updates: Partial<CarProfile>) => {
  try {
    await updateDoc(doc(db, 'cars', carId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating car profile:', error);
    throw error;
  }
};

export const deleteCarProfile = async (carId: string) => {
  try {
    await deleteDoc(doc(db, 'cars', carId));
  } catch (error) {
    console.error('Error deleting car profile:', error);
    throw error;
  }
};

export const getUserCars = async (userId: string) => {
  try {
    const q = query(
      collection(db, 'cars'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as CarProfile[];
  } catch (error) {
    console.error('Error getting user cars:', error);
    throw error;
  }
};

export const setMainCar = async (userId: string, carId: string) => {
  try {
    // First, unset all cars as main for this user
    const userCars = await getUserCars(userId);
    const updatePromises = userCars.map(car => 
      updateDoc(doc(db, 'cars', car.id!), { isMain: false, updatedAt: serverTimestamp() })
    );
    await Promise.all(updatePromises);
    
    // Then set the selected car as main
    await updateDoc(doc(db, 'cars', carId), {
      isMain: true,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error setting main car:', error);
    throw error;
  }
};

// Real-time listeners
export const subscribeToReports = (callback: (reports: TrafficReport[]) => void, status?: 'active' | 'resolved') => {
  let q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
  
  if (status) {
    q = query(collection(db, 'reports'), where('status', '==', status), orderBy('createdAt', 'desc'));
  }
  
  return onSnapshot(q, (querySnapshot) => {
    const reports = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as TrafficReport[];
    callback(reports);
  });
};

export const subscribeToChatMessages = (chatRoomId: string, callback: (messages: ChatMessage[]) => void) => {
  const q = query(
    collection(db, 'messages'),
    where('chatRoomId', '==', chatRoomId),
    orderBy('createdAt', 'asc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const messages = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ChatMessage[];
    callback(messages);
  });
};

export const subscribeToChatRooms = (callback: (rooms: ChatRoom[]) => void) => {
  const q = query(collection(db, 'chatRooms'), orderBy('lastActivity', 'desc'));
  
  return onSnapshot(q, (querySnapshot) => {
    const rooms = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ChatRoom[];
    callback(rooms);
  });
};

export const subscribeToUserCars = (userId: string, callback: (cars: CarProfile[]) => void) => {
  const q = query(
    collection(db, 'cars'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const cars = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as CarProfile[];
    callback(cars);
  });
};