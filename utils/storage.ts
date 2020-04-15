import Storage from "react-native-storage";
import AsyncStorage from '@react-native-community/async-storage';

const storage = new Storage({
  size: 1000,
  storageBackend: AsyncStorage,
  defaultExpires: null, // Never expire
  enableCache: true,
});

export default storage;
