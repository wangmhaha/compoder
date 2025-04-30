export const APP_TSX_CONTENT = `
import { MiniCpn } from './MiniCpn';
    
const mockProps = {
  // Example mock data
  title: "Mini Component",
  value: 42,
  onChange: (newValue: number) => console.log('Value changed:', newValue)
};

export default function App() {
  return <MiniCpn {...mockProps} />;
}
`

export const MINI_CPN_TSX_CONTENT = `
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface MiniCpnProps {
  title: string;
  value: number;
  onChange: (value: number) => void;
}

export const MiniCpn = ({ title, value, onChange }: MiniCpnProps) => {
  const [count, setCount] = useState(value);

  const handleIncrement = () => {
    const newValue = count + 1;
    setCount(newValue);
    onChange(newValue);
  };

  const handleDecrement = () => {
    const newValue = count - 1;
    setCount(newValue);
    onChange(newValue);
  };

  return (
    <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
      <h2 className="text-lg font-medium mb-4 text-gray-900[next-auth][debug][adapter_getSessionAndUser] { args: [ '67181a6e-7beb-4d39-820d-c7c0b86dbe29' ] }
GET /api/auth/session 200 in 19ms
dark:text-gray-100">
        {title}
      </h2>
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={handleDecrement}>
          -
        </Button>
        <span className="text-xl font-medium text-gray-900 dark:text-gray-100">
          {count}
        </span>
        <Button variant="outline" size="sm" onClick={handleIncrement}>
          +
        </Button>
      </div>
    </div>
  );
};
`

export const INTERFACE_TS_CONTENT = `
export interface MiniCpnProps {
  title: string;
  value: number;
  onChange: (value: number) => void;
}
`

export const DATA_WITH_3_FILES = `
<ComponentArtifact name="MiniCpn">
  <ComponentFile fileName="App.tsx" isEntryFile="true">
    ${APP_TSX_CONTENT}
  </ComponentFile>
  
  <ComponentFile fileName="MiniCpn.tsx">
    ${MINI_CPN_TSX_CONTENT}
  </ComponentFile>

  <ComponentFile fileName="interface.ts">
    ${INTERFACE_TS_CONTENT}
  </ComponentFile>
</ComponentArtifact> 
`

export const DATA_WITH_2_FILES = `
<ComponentArtifact name="MiniCpn">
  <ComponentFile fileName="App.tsx" isEntryFile="true">    
    ${APP_TSX_CONTENT}
  </ComponentFile>

  <ComponentFile fileName="interface.ts">
    ${INTERFACE_TS_CONTENT}
  </ComponentFile>
</ComponentArtifact> 
`

export const DATA_WITH_1_FILE = `
<ComponentArtifact name="MiniCpn">
  <ComponentFile fileName="App.tsx" isEntryFile="true">    
    ${APP_TSX_CONTENT}
  </ComponentFile>

</ComponentArtifact> 
`
