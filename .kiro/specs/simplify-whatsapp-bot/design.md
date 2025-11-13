# Design Document

## Overview

This design document outlines the architecture and implementation approach for simplifying the Automation_Project into a focused WhatsApp AI Assistant connection platform. The system will be streamlined to handle only instance creation, QR code scanning, connection management, and instance deletion, removing all messaging, group management, and Facebook features.

## Architecture

### High-Level Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Browser   │ ◄─────► │   React App  │ ◄─────► │  Appwrite   │
│   (User)    │         │   (Frontend) │         │  (Database) │
└─────────────┘         └──────┬───────┘         └─────────────┘
                               │
                               ▼
                        ┌──────────────┐
                        │ EvolutionAPI │
                        │  (WhatsApp)  │
                        └──────┬───────┘
                               │
                               ▼
                        ┌──────────────┐
                        │  n8n + ACO   │
                        │ AI Assistant │
                        └──────────────┘
```

### Component Architecture

```
src/
├── App.tsx                          # Main app with simplified routing
├── authProvider.ts                  # Authentication (unchanged)
├── pages/
│   └── whatsapp/
│       ├── Dashboard.tsx            # NEW: Simplified dashboard
│       └── ScanInstance.tsx         # MODIFIED: Add success message
├── components/
│   ├── InstanceManager.tsx          # NEW: Instance list + creation modal
│   ├── ConnectionSuccess.tsx        # NEW: Post-connection info
│   └── header/                      # Keep existing header
└── utility/
    └── appwriteClient.ts            # Keep existing
```

## Components and Interfaces

### 1. InstanceManager Component

**Purpose**: Main component for displaying instances and handling creation.

**Props**: None (uses hooks for data fetching)

**State**:
```typescript
interface InstanceManagerState {
  instances: Instance[];
  loading: boolean;
  showCreateModal: boolean;
  newInstanceName: string;
  creating: boolean;
}

interface Instance {
  $id: string;
  instance_name: string;
  status: 'pending' | 'connected';
  user_id: string;
  created_at: string;
}
```

**Key Functions**:
- `fetchInstances()`: Load user's instances from Appwrite
- `openCreateModal()`: Show instance creation modal
- `handleCreateInstance()`: Validate name, generate 4-digit suffix, call EvolutionAPI
- `handleDeleteInstance(instanceId, instanceName)`: Delete from EvolutionAPI and Appwrite
- `generateInstanceName(baseName)`: Append 4-digit random number

**UI Elements**:
- Header with "Nueva Instancia" button
- List/Grid of instance cards showing:
  - Instance name
  - Status badge (green "Conectado" or yellow "Pendiente")
  - Creation date
  - Delete button
- Modal for instance creation:
  - Text input for name
  - Validation message
  - Create/Cancel buttons

### 2. ScanInstance Component (Modified)

**Purpose**: Display QR code and handle connection flow.

**Current Functionality to Keep**:
- Fetch QR code from EvolutionAPI
- Display QR image
- Poll connection status every 5 seconds
- Detect successful connection

**New Functionality to Add**:
- Show ConnectionSuccess component when connected
- Update instance status in Appwrite to "connected"
- Display ACO AI Assistant branding

**State**:
```typescript
interface ScanInstanceState {
  qrData: string | null;
  status: string;
  isConnected: boolean;
  showSuccessMessage: boolean;
}
```

### 3. ConnectionSuccess Component (New)

**Purpose**: Display post-connection information and instructions.

**Props**:
```typescript
interface ConnectionSuccessProps {
  instanceName: string;
  onContinue: () => void;
}
```

**UI Elements**:
- Success icon/animation
- Heading: "¡Conectado exitosamente al Asistente de IA de ACO!"
- Information text:
  - "Tu asistente de IA está activo y responderá automáticamente a tus clientes en WhatsApp"
  - "Para desactivar el bot, elimina la instancia desde el panel de control"
- "Ir al Panel de Control" button

### 4. Dashboard Component (New)

**Purpose**: Simplified landing page showing only instance management.

**Layout**:
```
┌─────────────────────────────────────────┐
│  Header (with user info + logout)       │
├─────────────────────────────────────────┤
│  Welcome Message                         │
│  "Gestiona tus Asistentes de WhatsApp"  │
├─────────────────────────────────────────┤
│  ┌────────────────────────────────────┐ │
│  │   InstanceManager Component        │ │
│  │   - List of instances              │ │
│  │   - Create button                  │ │
│  │   - Delete buttons                 │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## Data Models

### Instance Document (Appwrite)

**Collection**: `whatsapp_instances` (existing collection ID from env)

**Schema**:
```typescript
{
  $id: string;                    // Auto-generated by Appwrite
  user_id: string;                // Reference to authenticated user
  instance_name: string;          // Format: "UserName_1234"
  status: 'pending' | 'connected'; // Connection status
  api_key: string;                // EvolutionAPI key
  created_at: string;             // ISO timestamp
  $createdAt: string;             // Appwrite timestamp
  $updatedAt: string;             // Appwrite timestamp
}
```

### Instance Name Generation

**Format**: `{UserInput}_{RandomDigits}`

**Algorithm**:
```typescript
function generateInstanceName(baseName: string): string {
  // Sanitize input: remove special chars, keep alphanumeric and underscore
  const sanitized = baseName.replace(/[^a-zA-Z0-9_]/g, '');
  
  // Generate 4-digit random number
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  
  return `${sanitized}_${randomSuffix}`;
}
```

## API Integration

### EvolutionAPI Endpoints

**Base URL**: `http://45.61.157.201/evolution`

**Headers**: 
```typescript
{
  'apikey': API_KEY,
  'Content-Type': 'application/json'
}
```

**1. Create Instance**
```
POST /instance/create
Body: {
  instanceName: string,
  integration: "WHATSAPP-BAILEYS",
  qrcode: false,
  alwaysOnline: true
}
Response: {
  instance: {
    instanceName: string,
    status: string
  }
}
```

**2. Get QR Code**
```
GET /instance/connect/{instanceName}
Response: {
  code: string  // QR code data
}
```

**3. Check Connection Status**
```
GET /instance/connectionState/{instanceName}
Response: {
  instance: {
    state: string  // "open", "connected", "authenticated", "close"
  }
}
```

**4. Delete Instance**
```
DELETE /instance/delete/{instanceName}
Response: {
  success: boolean
}
```

### Appwrite Integration

**Database ID**: From `VITE_APPWRITE_DATABASE_ID`
**Collection ID**: From `VITE_APPWRITE_WHATSAPP_COLLECTION_ID`

**Operations**:
1. **List User Instances**: `databases.listDocuments()` with `Query.equal('user_id', userId)`
2. **Create Instance**: `databases.createDocument()` with instance data
3. **Update Status**: `databases.updateDocument()` to change status to "connected"
4. **Delete Instance**: `databases.deleteDocument()` by document ID

## User Flows

### Flow 1: Create New Instance

```
1. User clicks "Nueva Instancia" button
2. Modal appears with name input field
3. User enters name (e.g., "Tienda_Ropa")
4. User clicks "Crear"
5. System validates name (alphanumeric + underscore only)
6. System generates full name: "Tienda_Ropa_1234"
7. System calls EvolutionAPI to create instance
8. System saves instance to Appwrite with status "pending"
9. System redirects to /whatsapp/scan/Tienda_Ropa_1234
```

### Flow 2: Scan QR and Connect

```
1. User arrives at scan page
2. System fetches QR code from EvolutionAPI
3. QR code displays on screen
4. System polls connection status every 5 seconds
5. User scans QR with WhatsApp mobile app
6. EvolutionAPI detects connection (state: "open")
7. System updates instance status to "connected" in Appwrite
8. ConnectionSuccess component appears
9. User reads information about ACO AI Assistant
10. User clicks "Ir al Panel de Control"
11. System redirects to dashboard
```

### Flow 3: Delete Instance

```
1. User clicks delete button on instance card
2. Confirmation dialog appears
3. User confirms deletion
4. System calls EvolutionAPI DELETE endpoint
5. If successful, system deletes from Appwrite
6. System removes instance from UI list
7. Success notification appears
```

## Routing Structure

### Simplified Routes

```typescript
<Routes>
  {/* Public Routes */}
  <Route path="/login" element={<AuthPage type="login" />} />
  <Route path="/register" element={<AuthPage type="register" />} />
  
  {/* Protected Routes */}
  <Route element={<Authenticated><ThemedLayout /></Authenticated>}>
    <Route index element={<Dashboard />} />
    <Route path="/whatsapp/scan/:instanceName" element={<ScanInstance />} />
  </Route>
  
  {/* Catch All */}
  <Route path="*" element={<Navigate to="/" />} />
</Routes>
```

**Routes to Remove**:
- `/whatsapp` (old scanner page)
- `/whatsapp/groups/:instanceName`
- `/facebook/connect`
- All blog, categories, users routes

## UI/UX Design

### Color Scheme

- **Primary**: Green (#25D366) - WhatsApp brand color
- **Success**: Green (#4CAF50) - Connected status
- **Warning**: Yellow/Orange (#FFA726) - Pending status
- **Danger**: Red (#e53935) - Delete actions
- **Background**: Dark theme (#110a0a, #1a1a1a, #2c2c2c)
- **Text**: White (#ffffff), Gray (#9e9e9e)

### Instance Card Design

```
┌─────────────────────────────────────┐
│  📱 Tienda_Ropa_1234                │
│                                      │
│  ✅ Conectado al Asistente ACO      │
│  📅 Creado: 11/11/2025 14:30        │
│                                      │
│  [🗑️ Eliminar]                      │
└─────────────────────────────────────┘
```

### Create Instance Modal

```
┌─────────────────────────────────────┐
│  Nueva Instancia de WhatsApp        │
├─────────────────────────────────────┤
│                                      │
│  Nombre de la instancia:            │
│  ┌─────────────────────────────┐   │
│  │ Tienda_Ropa                 │   │
│  └─────────────────────────────┘   │
│                                      │
│  ℹ️ Se agregará un código único     │
│     al final (ej: Tienda_Ropa_1234) │
│                                      │
│  [Cancelar]  [Crear Instancia]      │
└─────────────────────────────────────┘
```

## Error Handling

### Error Scenarios

1. **Instance Creation Fails**
   - Display error notification
   - Keep modal open for retry
   - Log error to console

2. **QR Code Fetch Fails**
   - Display "Error al obtener QR" message
   - Provide retry button
   - Continue polling in background

3. **Connection Timeout**
   - After 5 minutes, show timeout message
   - Provide option to generate new QR
   - Keep instance in "pending" status

4. **Delete Fails**
   - Show error notification
   - Do not remove from UI
   - Allow retry

5. **Network Errors**
   - Display user-friendly error messages
   - Provide retry mechanisms
   - Maintain data consistency

### Error Messages

```typescript
const ERROR_MESSAGES = {
  CREATE_FAILED: 'No se pudo crear la instancia. Intenta nuevamente.',
  DELETE_FAILED: 'No se pudo eliminar la instancia. Verifica tu conexión.',
  QR_FETCH_FAILED: 'Error al obtener el código QR. Reintentando...',
  INVALID_NAME: 'El nombre solo puede contener letras, números y guiones bajos.',
  CONNECTION_TIMEOUT: 'Tiempo de espera agotado. Genera un nuevo código QR.',
  NETWORK_ERROR: 'Error de conexión. Verifica tu internet.'
};
```

## Testing Strategy

### Unit Tests

1. **Instance Name Generation**
   - Test sanitization of special characters
   - Verify 4-digit suffix is always added
   - Ensure randomness of suffix

2. **Component Rendering**
   - InstanceManager renders correctly
   - Modal opens/closes properly
   - Instance cards display correct data

3. **Form Validation**
   - Name input validation works
   - Empty name is rejected
   - Special characters are handled

### Integration Tests

1. **Instance Creation Flow**
   - Modal → API call → Appwrite save → Redirect
   - Error handling at each step

2. **QR Scanning Flow**
   - QR fetch → Display → Status polling → Success

3. **Instance Deletion Flow**
   - Confirmation → API call → Appwrite delete → UI update

### Manual Testing Checklist

- [ ] Create instance with valid name
- [ ] Create instance with special characters (should sanitize)
- [ ] Scan QR code successfully
- [ ] View connected instances in dashboard
- [ ] Delete instance successfully
- [ ] Handle network errors gracefully
- [ ] Test on mobile devices
- [ ] Verify ACO branding appears correctly

## Performance Considerations

1. **QR Code Polling**: Use 5-second intervals to balance responsiveness and API load
2. **Instance List**: Implement pagination if user has >20 instances
3. **Lazy Loading**: Load QR codes only when scan page is accessed
4. **Caching**: Cache instance list for 30 seconds to reduce Appwrite calls
5. **Debouncing**: Debounce name input validation to reduce re-renders

## Security Considerations

1. **Authentication**: All routes require valid Appwrite session
2. **Authorization**: Users can only access their own instances (filter by user_id)
3. **Input Sanitization**: Remove special characters from instance names
4. **API Key**: Store EvolutionAPI key in environment variables
5. **HTTPS**: Ensure all API calls use secure connections (note: current EvolutionAPI uses HTTP - consider upgrading)

## Migration Strategy

### Files to Remove

```
src/pages/
  ├── blog-posts/          # DELETE entire folder
  ├── categories/          # DELETE entire folder
  ├── facebook/            # DELETE entire folder
  └── users/               # DELETE entire folder

src/components/
  ├── FacebookAutomationForm/  # DELETE
  ├── infoFace/                # DELETE
  └── entrada/                 # DELETE (replace with Dashboard)
```

### Files to Modify

```
src/
  ├── App.tsx                  # Simplify routes
  ├── pages/whatsapp/
  │   ├── index.tsx            # DELETE (old scanner)
  │   ├── list.tsx             # DELETE
  │   ├── WhatsAppLayout.tsx   # DELETE
  │   ├── GroupsManager.tsx    # DELETE
  │   └── scanIstance.tsx      # MODIFY (add success message)
  └── components/
      └── scaner/index.tsx     # REPLACE with InstanceManager
```

### Files to Create

```
src/
  ├── pages/
  │   └── Dashboard.tsx        # NEW
  └── components/
      ├── InstanceManager.tsx  # NEW
      └── ConnectionSuccess.tsx # NEW
```

## Implementation Notes

1. **Preserve Authentication**: Keep existing authProvider.ts unchanged
2. **Reuse Utilities**: Keep appwriteClient.ts and utility functions
3. **Maintain Styling**: Use existing Ant Design theme and dark mode
4. **Environment Variables**: No changes needed to .env configuration
5. **Database Schema**: Use existing Appwrite collection, no schema changes required
