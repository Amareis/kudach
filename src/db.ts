import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'
import 'firebase/storage'

import DocumentReference = firebase.firestore.DocumentReference
import CollectionReference = firebase.firestore.CollectionReference
import DocumentSnapshot = firebase.firestore.DocumentSnapshot
import QuerySnapshot = firebase.firestore.QuerySnapshot

firebase.initializeApp({
  apiKey: 'AIzaSyDk6jUzU5scEb8eKAuS4ndwc1DOw_oda0k',
  authDomain: 'kusve-98f3c.firebaseapp.com',
  databaseURL: 'https://kusve-98f3c.firebaseio.com',
  projectId: 'kusve-98f3c',
  storageBucket: 'kusve-98f3c.appspot.com',
  messagingSenderId: '1047135312990',
})

const db = firebase.firestore()
const auth = firebase.auth()
const storage = firebase.storage()

export {firebase, auth, storage}
export default db

export interface IEvent {
  id: string
  uid?: string
  start: string
  createdAt: string
}

export interface ICheckin {
  id: string
  user: number
  accepted: boolean | null
  photos: string[]
  createdAt: string
}

export function live(
  r: DocumentReference,
  onChange: (s: DocumentSnapshot) => void,
): Promise<() => void>
export function live(
  r: CollectionReference,
  onChange: (s: QuerySnapshot) => void,
): Promise<() => void>
export function live(
  r: DocumentReference | CollectionReference,
  onChange: (a: any) => void,
): Promise<() => void> {
  const s = r.onSnapshot.bind(r) as any
  return new Promise(resolve => {
    let resolved = false
    let un = s((a: any) => {
      if (!resolved) {
        resolve(un)
        resolved = true
      }
      onChange(a)
    })
  })
}
