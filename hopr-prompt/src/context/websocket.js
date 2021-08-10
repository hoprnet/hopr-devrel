import { createContext } from "react";
import * as websocket from 'websocket'

const { w3cwebsocket } = websocket;


export const WebSocketContext = createContext();