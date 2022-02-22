import LogtoClient from '@logto/client';
import { Nullable } from '@silverhand/essentials';
import React from 'react';

const LogtoClientContext = React.createContext<Nullable<LogtoClient>>(null);

export default LogtoClientContext;
