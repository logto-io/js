import LogtoClient from '@logto/browser';
import React from 'react';

const LogtoClientContext = React.createContext<LogtoClient | null>(null);

export default LogtoClientContext;
