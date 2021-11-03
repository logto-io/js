import LogtoClient from '@logto/client';
import React from 'react';

const LogtoClientContext = React.createContext<LogtoClient | null>(null);

export default LogtoClientContext;
