import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase.config';

// Proveedor de Google para autenticación
const googleProvider = new GoogleAuthProvider();

/**
 * Registrar un nuevo usuario con email y contraseña
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña del usuario
 * @param {string} nombre - Nombre completo del usuario
 * @returns {Promise<Object>} - Datos del usuario creado
 */
export const register = async (email, password, nombre) => {
  try {
    // Crear usuario en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Actualizar el perfil con el nombre
    await updateProfile(user, {
      displayName: nombre,
    });

    // Crear documento del usuario en Firestore
    await setDoc(doc(db, 'users', user.uid), {
      nombre: nombre,
      email: email,
      fotoURL: user.photoURL || null,
    });

    return {
      uid: user.uid,
      email: user.email,
      nombre: nombre,
    };
  } catch (error) {
    console.error('Error en registro:', error);
    throw error;
  }
};

/**
 * Iniciar sesión con email y contraseña
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña del usuario
 * @returns {Promise<Object>} - Datos del usuario autenticado
 */
export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error en login:', error);
    throw error;
  }
};

/**
 * Iniciar sesión con Google
 * @returns {Promise<Object>} - Datos del usuario autenticado
 */
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Verificar si el usuario ya existe en Firestore
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    // Si es un nuevo usuario, crear su documento en Firestore
    if (!userDoc.exists()) {
      await setDoc(userDocRef, {
        nombre: user.displayName || 'Usuario',
        email: user.email,
        fotoURL: user.photoURL || null,
      });
    }

    return user;
  } catch (error) {
    console.error('Error en login con Google:', error);
    throw error;
  }
};

/**
 * Cerrar sesión del usuario actual
 * @returns {Promise<void>}
 */
export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    throw error;
  }
};

/**
 * Obtener el usuario actualmente autenticado
 * @returns {Object|null} - Usuario actual o null
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * Obtener datos del usuario desde Firestore
 * @param {string} uid - ID del usuario
 * @returns {Promise<Object>} - Datos del usuario
 */
export const getUserData = async (uid) => {
  try {
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      return userDoc.data();
    } else {
      throw new Error('Usuario no encontrado');
    }
  } catch (error) {
    console.error('Error al obtener datos del usuario:', error);
    throw error;
  }
};

/**
 * Actualizar el nombre del usuario
 * @param {string} uid - ID del usuario
 * @param {string} nombre - Nuevo nombre del usuario
 * @returns {Promise<void>}
 */
export const updateUserName = async (uid, nombre) => {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    // Actualizar el perfil en Firebase Auth
    await updateProfile(user, {
      displayName: nombre,
    });

    // Actualizar el documento en Firestore
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, {
      nombre: nombre,
    });
  } catch (error) {
    console.error('Error al actualizar nombre:', error);
    throw error;
  }
};
