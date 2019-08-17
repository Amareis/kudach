import firebase from 'firebase/app'
import 'firebase/firestore'

firebase.initializeApp({
  apiKey: 'AIzaSyDk6jUzU5scEb8eKAuS4ndwc1DOw_oda0k',
  authDomain: 'kusve-98f3c.firebaseapp.com',
  databaseURL: 'https://kusve-98f3c.firebaseio.com',
  projectId: 'kusve-98f3c',
  storageBucket: 'kusve-98f3c.appspot.com',
  messagingSenderId: '1047135312990',
})

const db = firebase.firestore()

export {firebase}
export default db

export interface IEvent {
  id: string
  uid?: string
  start: string
  createdAt: string
}
