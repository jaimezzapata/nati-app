import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './firebase.config';
import { generateInvitationCode } from '../utils/formatters';

// ==================== NATILLERAS ====================

/**
 * Crea una nueva natillera
 * @param {string} adminId - ID del usuario administrador
 * @param {Object} natilleraData - Datos de la natillera
 * @returns {Promise<Object>} - Natillera creada con su ID y código
 */
export const createNatillera = async (adminId, natilleraData) => {
  try {
    const codigoInvitacion = generateInvitationCode();
    
    // Crear documento de la natillera
    const natilleraRef = await addDoc(collection(db, 'natilleras'), {
      nombre: natilleraData.nombre,
      adminId: adminId,
      montoCuota: Number(natilleraData.montoCuota),
      periodicidad: natilleraData.periodicidad,
      fechaInicio: Timestamp.fromDate(new Date(natilleraData.fechaInicio)),
      fechaFin: Timestamp.fromDate(new Date(natilleraData.fechaFin)),
      codigoInvitacion: codigoInvitacion,
      createdAt: Timestamp.now(),
    });

    // Registrar al admin como primer miembro
    await addDoc(collection(db, 'miembros'), {
      userId: adminId,
      natilleraId: natilleraRef.id,
      rol: 'admin',
      joinedAt: Timestamp.now(),
    });

    return {
      id: natilleraRef.id,
      codigoInvitacion,
      ...natilleraData,
    };
  } catch (error) {
    console.error('Error al crear natillera:', error);
    throw error;
  }
};

/**
 * Obtiene una natillera por su ID
 * @param {string} natilleraId - ID de la natillera
 * @returns {Promise<Object>}
 */
export const getNatillera = async (natilleraId) => {
  try {
    const natilleraDoc = await getDoc(doc(db, 'natilleras', natilleraId));
    
    if (!natilleraDoc.exists()) {
      return null;
    }
    
    const data = natilleraDoc.data();
    return {
      id: natilleraDoc.id,
      ...data,
      fechaInicio: data.fechaInicio?.toDate?.() || data.fechaInicio,
      fechaFin: data.fechaFin?.toDate?.() || data.fechaFin,
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
    };
  } catch (error) {
    console.error('Error al obtener natillera:', error);
    throw error;
  }
};

/**
 * Obtiene una natillera por su código de invitación
 * @param {string} codigoInvitacion - Código de invitación
 * @returns {Promise<Object|null>}
 */
export const getNatilleraByCodigo = async (codigoInvitacion) => {
  try {
    const q = query(
      collection(db, 'natilleras'),
      where('codigoInvitacion', '==', codigoInvitacion)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const natilleraDoc = querySnapshot.docs[0];
    return {
      id: natilleraDoc.id,
      ...natilleraDoc.data(),
    };
  } catch (error) {
    console.error('Error al buscar natillera por código:', error);
    throw error;
  }
};

/**
 * Obtiene todas las natilleras de un usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<Array>}
 */
export const getUserNatilleras = async (userId) => {
  try {
    // Obtener membresías del usuario
    const miembrosQuery = query(
      collection(db, 'miembros'),
      where('userId', '==', userId)
    );
    
    const miembrosSnapshot = await getDocs(miembrosQuery);
    
    if (miembrosSnapshot.empty) {
      return [];
    }
    
    // Obtener datos de cada natillera
    const natillerasPromises = miembrosSnapshot.docs.map(async (miembroDoc) => {
      const miembroData = miembroDoc.data();
      const natillera = await getNatillera(miembroData.natilleraId);
      
      if (!natillera) {
        return null;
      }
      
      // Contar miembros de la natillera
      const miembrosNatilleraQuery = query(
        collection(db, 'miembros'),
        where('natilleraId', '==', miembroData.natilleraId)
      );
      const miembrosNatilleraSnapshot = await getDocs(miembrosNatilleraQuery);
      
      return {
        ...natillera,
        miembroId: miembroDoc.id,
        rol: miembroData.rol,
        joinedAt: miembroData.joinedAt?.toDate?.() || miembroData.joinedAt,
        cantidadMiembros: miembrosNatilleraSnapshot.size,
      };
    });
    
    const results = await Promise.all(natillerasPromises);
    return results.filter(n => n !== null);
  } catch (error) {
    console.error('Error al obtener natilleras del usuario:', error);
    throw error;
  }
};

// ==================== MIEMBROS ====================

/**
 * Agrega un miembro a una natillera
 * @param {string} userId - ID del usuario
 * @param {string} natilleraId - ID de la natillera
 * @returns {Promise<Object>}
 */
export const addMiembro = async (natilleraId, userId) => {
  try {
    // Verificar si ya es miembro
    const isMember = await checkIfUserIsMember(natilleraId, userId);
    
    if (isMember) {
      throw new Error('Ya eres miembro de esta natillera');
    }
    
    const miembroRef = await addDoc(collection(db, 'miembros'), {
      userId: userId,
      natilleraId: natilleraId,
      rol: 'miembro',
      joinedAt: Timestamp.now(),
    });
    
    return {
      id: miembroRef.id,
      userId,
      natilleraId,
      rol: 'miembro',
    };
  } catch (error) {
    console.error('Error al agregar miembro:', error);
    throw error;
  }
};

/**
 * Verifica si un usuario es miembro de una natillera
 * @param {string} userId - ID del usuario
 * @param {string} natilleraId - ID de la natillera
 * @returns {Promise<boolean>}
 */
export const checkIfUserIsMember = async (natilleraId, userId) => {
  try {
    const q = query(
      collection(db, 'miembros'),
      where('natilleraId', '==', natilleraId),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error al verificar membresía:', error);
    throw error;
  }
};

/**
 * Obtiene el rol de un usuario en una natillera
 * @param {string} userId - ID del usuario
 * @param {string} natilleraId - ID de la natillera
 * @returns {Promise<string|null>} - 'admin', 'miembro' o null
 */
export const getUserRole = async (natilleraId, userId) => {
  try {
    const q = query(
      collection(db, 'miembros'),
      where('natilleraId', '==', natilleraId),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    return querySnapshot.docs[0].data().rol;
  } catch (error) {
    console.error('Error al obtener rol del usuario:', error);
    throw error;
  }
};

/**
 * Obtiene todos los miembros de una natillera con sus datos
 * @param {string} natilleraId - ID de la natillera
 * @returns {Promise<Array>}
 */
export const getNatilleraMembers = async (natilleraId) => {
  try {
    const q = query(
      collection(db, 'miembros'),
      where('natilleraId', '==', natilleraId)
    );
    
    const miembrosSnapshot = await getDocs(q);
    
    // Obtener datos de usuario de cada miembro
    const membersPromises = miembrosSnapshot.docs.map(async (miembroDoc) => {
      const miembroData = miembroDoc.data();
      const userDoc = await getDoc(doc(db, 'users', miembroData.userId));
      const userData = userDoc.exists() ? userDoc.data() : null;
      
      return {
        id: miembroDoc.id,
        userId: miembroData.userId,
        natilleraId: miembroData.natilleraId,
        rol: miembroData.rol,
        joinedAt: miembroData.joinedAt?.toDate?.() || miembroData.joinedAt,
        nombre: userData?.nombre || userData?.displayName || 'Usuario',
        email: userData?.email || 'Sin email',
        fotoURL: userData?.fotoURL || userData?.photoURL || null,
      };
    });
    
    return await Promise.all(membersPromises);
  } catch (error) {
    console.error('Error al obtener miembros:', error);
    throw error;
  }
};

// ==================== APORTES ====================

/**
 * Crea un nuevo aporte (pago reportado)
 * @param {Object} aporteData - Datos del aporte
 * @returns {Promise<Object>}
 */
export const createAporte = async (aporteData) => {
  try {
    // Extraer mes y año del campo mesCuota (formato: YYYY-MM)
    const [anio, mes] = aporteData.mesCuota.split('-').map(Number);
    
    const aporteRef = await addDoc(collection(db, 'aportes'), {
      natilleraId: aporteData.natilleraId,
      userId: aporteData.userId,
      monto: Number(aporteData.monto),
      mesCuota: aporteData.mesCuota, // Guardar formato YYYY-MM completo
      fechaReporte: Timestamp.now(),
      fechaConfirmacion: null,
      estado: 'pendiente',
      comprobanteURL: aporteData.comprobanteURL || null,
    });
    
    return {
      id: aporteRef.id,
      ...aporteData,
      estado: 'pendiente',
      fechaReporte: new Date(),
    };
  } catch (error) {
    console.error('Error al crear aporte:', error);
    throw error;
  }
};

/**
 * Actualiza el estado de un aporte (confirmar o rechazar pago)
 * @param {string} aporteId - ID del aporte
 * @param {string} estado - 'pendiente', 'confirmado' o 'rechazado'
 * @param {string} motivoRechazo - Motivo del rechazo (opcional, requerido si estado es 'rechazado')
 * @returns {Promise<void>}
 */
export const updateAporteEstado = async (aporteId, estado, motivoRechazo = null) => {
  try {
    const updateData = {
      estado: estado,
    };
    
    if (estado === 'confirmado') {
      updateData.fechaConfirmacion = Timestamp.now();
      updateData.motivoRechazo = null; // Limpiar motivo si existía
    }
    
    if (estado === 'rechazado') {
      updateData.fechaRechazo = Timestamp.now();
      updateData.motivoRechazo = motivoRechazo || 'No especificado';
      updateData.fechaConfirmacion = null; // Limpiar confirmación si existía
    }
    
    await updateDoc(doc(db, 'aportes', aporteId), updateData);
  } catch (error) {
    console.error('Error al actualizar aporte:', error);
    throw error;
  }
};

/**
 * Obtiene los aportes de una natillera
 * @param {string} natilleraId - ID de la natillera
 * @param {string} estado - Filtro por estado (opcional)
 * @returns {Promise<Array>}
 */
export const getNatilleraAportes = async (natilleraId, estado = null) => {
  try {
    let q;
    
    if (estado) {
      q = query(
        collection(db, 'aportes'),
        where('natilleraId', '==', natilleraId),
        where('estado', '==', estado)
      );
    } else {
      q = query(
        collection(db, 'aportes'),
        where('natilleraId', '==', natilleraId)
      );
    }
    
    const aportesSnapshot = await getDocs(q);
    
    const aportes = aportesSnapshot.docs.map((aporteDoc) => {
      const data = aporteDoc.data();
      return {
        id: aporteDoc.id,
        ...data,
        fechaReporte: data.fechaReporte?.toDate?.() || data.fechaReporte,
        fechaConfirmacion: data.fechaConfirmacion?.toDate?.() || data.fechaConfirmacion,
      };
    });
    
    // Ordenar en memoria por fecha de reporte descendente
    aportes.sort((a, b) => {
      const dateA = a.fechaReporte instanceof Date ? a.fechaReporte : new Date(a.fechaReporte);
      const dateB = b.fechaReporte instanceof Date ? b.fechaReporte : new Date(b.fechaReporte);
      return dateB - dateA;
    });
    
    return aportes;
  } catch (error) {
    console.error('Error al obtener aportes:', error);
    throw error;
  }
};

/**
 * Obtiene los aportes de un usuario en una natillera
 * @param {string} userId - ID del usuario
 * @param {string} natilleraId - ID de la natillera
 * @returns {Promise<Array>}
 */
export const getUserAportes = async (userId, natilleraId = null) => {
  try {
    let q;
    
    if (natilleraId) {
      q = query(
        collection(db, 'aportes'),
        where('userId', '==', userId),
        where('natilleraId', '==', natilleraId)
      );
    } else {
      q = query(
        collection(db, 'aportes'),
        where('userId', '==', userId)
      );
    }
    
    const aportesSnapshot = await getDocs(q);
    
    const aportes = aportesSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        fechaReporte: data.fechaReporte?.toDate?.() || data.fechaReporte,
        fechaConfirmacion: data.fechaConfirmacion?.toDate?.() || data.fechaConfirmacion,
      };
    });
    
    // Ordenar en memoria por fecha de reporte descendente
    aportes.sort((a, b) => {
      const dateA = a.fechaReporte instanceof Date ? a.fechaReporte : new Date(a.fechaReporte);
      const dateB = b.fechaReporte instanceof Date ? b.fechaReporte : new Date(b.fechaReporte);
      return dateB - dateA;
    });
    
    return aportes;
  } catch (error) {
    console.error('Error al obtener aportes del usuario:', error);
    throw error;
  }
};

/**
 * Calcula el total ahorrado en una natillera
 * @param {string} natilleraId - ID de la natillera
 * @returns {Promise<number>}
 */
export const getTotalAhorrado = async (natilleraId) => {
  try {
    const q = query(
      collection(db, 'aportes'),
      where('natilleraId', '==', natilleraId),
      where('estado', '==', 'confirmado')
    );
    
    const aportesSnapshot = await getDocs(q);
    
    const total = aportesSnapshot.docs.reduce((sum, doc) => {
      return sum + (doc.data().monto || 0);
    }, 0);
    
    return total;
  } catch (error) {
    console.error('Error al calcular total ahorrado:', error);
    throw error;
  }
};

// ==================== LISTENERS EN TIEMPO REAL ====================

/**
 * Listener para cambios en las natilleras de un usuario
 * @param {string} userId - ID del usuario
 * @param {Function} callback - Función a ejecutar con los cambios
 * @returns {Function} - Función para desuscribirse
 */
export const subscribeToUserNatilleras = (userId, callback) => {
  const q = query(
    collection(db, 'miembros'),
    where('userId', '==', userId)
  );
  
  return onSnapshot(q, async (snapshot) => {
    const natilleras = await Promise.all(
      snapshot.docs.map(async (miembroDoc) => {
        const miembroData = miembroDoc.data();
        const natillera = await getNatillera(miembroData.natilleraId);
        
        if (!natillera) {
          return null;
        }
        
        // Contar miembros de la natillera
        const miembrosNatilleraQuery = query(
          collection(db, 'miembros'),
          where('natilleraId', '==', miembroData.natilleraId)
        );
        const miembrosNatilleraSnapshot = await getDocs(miembrosNatilleraQuery);
        
        return {
          ...natillera,
          miembroId: miembroDoc.id,
          rol: miembroData.rol,
          cantidadMiembros: miembrosNatilleraSnapshot.size,
        };
      })
    );
    
    callback(natilleras.filter(n => n !== null));
  });
};

/**
 * Listener para cambios en los aportes de una natillera
 * @param {string} natilleraId - ID de la natillera
 * @param {Function} callback - Función a ejecutar con los cambios
 * @returns {Function} - Función para desuscribirse
 */
export const subscribeToNatilleraAportes = (natilleraId, callback) => {
  const q = query(
    collection(db, 'aportes'),
    where('natilleraId', '==', natilleraId)
  );
  
  return onSnapshot(q, (snapshot) => {
    const aportes = snapshot.docs.map((aporteDoc) => {
      const data = aporteDoc.data();
      return {
        id: aporteDoc.id,
        ...data,
        fechaReporte: data.fechaReporte?.toDate?.() || data.fechaReporte,
        fechaConfirmacion: data.fechaConfirmacion?.toDate?.() || data.fechaConfirmacion,
      };
    });
    
    // Ordenar en memoria por fecha de reporte descendente
    aportes.sort((a, b) => {
      const dateA = a.fechaReporte instanceof Date ? a.fechaReporte : new Date(a.fechaReporte);
      const dateB = b.fechaReporte instanceof Date ? b.fechaReporte : new Date(b.fechaReporte);
      return dateB - dateA;
    });
    
    callback(aportes);
  });
};
