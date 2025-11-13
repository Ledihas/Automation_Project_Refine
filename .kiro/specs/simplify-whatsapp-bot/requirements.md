# Requirements Document

## Introduction

This document outlines the requirements for simplifying the Automation_Project into a streamlined WhatsApp AI Assistant connection system. The system will allow users to connect their WhatsApp numbers to ACO's AI chatbot for automated customer service. Users will be able to create named instances, connect them via QR code, and manage (view/delete) their active bot connections.

## Glossary

- **System**: The WhatsApp AI Assistant Connection Platform
- **User**: A person who wants to connect their WhatsApp number to the AI assistant
- **Instance**: A WhatsApp connection managed by EvolutionAPI
- **EvolutionAPI**: External service that manages WhatsApp connections
- **ACO AI Assistant**: Customer service chatbot configured via n8n
- **Appwrite**: Backend as a Service used for data persistence
- **Instance_Name**: User-defined name with 4-digit random suffix (e.g., "Tienda_Ropa_1234")

## Requirements

### Requirement 1: User Authentication

**User Story:** As a user, I want to securely log in to the system, so that I can manage my WhatsApp AI assistant connections.

#### Acceptance Criteria

1. WHEN a user accesses the login page, THE System SHALL display email and password input fields.
2. WHEN a user submits valid credentials, THE System SHALL authenticate the user via Appwrite and redirect to the dashboard.
3. WHEN a user submits invalid credentials, THE System SHALL display an error message indicating authentication failure.
4. WHEN a user clicks the register link, THE System SHALL navigate to the registration page.
5. THE System SHALL maintain user session state across page refreshes.

### Requirement 2: Instance Creation with Custom Naming

**User Story:** As a user, I want to create a new WhatsApp instance with a custom name, so that I can easily identify my different bot connections.

#### Acceptance Criteria

1. WHEN a user clicks the "Nueva Instancia" button, THE System SHALL display a modal with a name input field.
2. WHEN a user enters a name in the modal, THE System SHALL validate that the name contains only alphanumeric characters and underscores.
3. WHEN a user submits the instance creation form, THE System SHALL append a 4-digit random number to the user-provided name.
4. WHEN the instance name is generated, THE System SHALL send a creation request to EvolutionAPI with the formatted Instance_Name.
5. WHEN EvolutionAPI confirms instance creation, THE System SHALL save the instance details to Appwrite with user_id, instance_name, status, and created_at fields.
6. WHEN the instance is saved successfully, THE System SHALL redirect the user to the QR scanning page for that instance.

### Requirement 3: QR Code Scanning and Connection

**User Story:** As a user, I want to scan a QR code with my WhatsApp mobile app, so that I can connect my WhatsApp number to the AI assistant.

#### Acceptance Criteria

1. WHEN a user is redirected to the scan page, THE System SHALL fetch the QR code from EvolutionAPI using the Instance_Name.
2. WHEN the QR code is received, THE System SHALL display the QR code image to the user.
3. WHILE the user has not scanned the QR code, THE System SHALL refresh the QR code every 5 seconds.
4. WHEN the user scans the QR code, THE System SHALL detect the connection state change via EvolutionAPI status endpoint.
5. WHEN the connection state becomes "open", "connected", or "authenticated", THE System SHALL display a success message indicating connection to ACO AI Assistant.
6. WHEN connection is successful, THE System SHALL update the instance status to "connected" in Appwrite.
7. WHEN connection is successful, THE System SHALL redirect the user to the dashboard after 2 seconds.

### Requirement 4: Dashboard Instance Management

**User Story:** As a user, I want to view all my connected WhatsApp instances in a dashboard, so that I can monitor which numbers are connected to the AI assistant.

#### Acceptance Criteria

1. WHEN a user accesses the dashboard, THE System SHALL fetch all instances associated with the user_id from Appwrite.
2. WHEN instances are retrieved, THE System SHALL display each instance with its Instance_Name, connection status, and creation date.
3. WHEN an instance status is "connected", THE System SHALL display a green indicator with text "Conectado al Asistente ACO".
4. WHEN an instance status is "pending", THE System SHALL display a yellow indicator with text "Pendiente de Conexión".
5. THE System SHALL display a "Nueva Instancia" button to allow creating additional instances.
6. THE System SHALL display a delete button for each instance in the list.

### Requirement 5: Instance Deletion

**User Story:** As a user, I want to delete an instance, so that I can disconnect my WhatsApp number from the AI assistant.

#### Acceptance Criteria

1. WHEN a user clicks the delete button for an instance, THE System SHALL display a confirmation dialog.
2. WHEN the user confirms deletion, THE System SHALL send a delete request to EvolutionAPI with the Instance_Name.
3. WHEN EvolutionAPI confirms deletion, THE System SHALL remove the instance document from Appwrite.
4. WHEN the instance is deleted from Appwrite, THE System SHALL remove the instance from the displayed list.
5. WHEN deletion is successful, THE System SHALL display a success notification message.
6. IF deletion fails at EvolutionAPI, THE System SHALL display an error message and not remove from Appwrite.

### Requirement 6: Post-Connection Information Display

**User Story:** As a user, I want to see clear information after connecting my WhatsApp, so that I understand the AI assistant is active and how to disconnect it.

#### Acceptance Criteria

1. WHEN a user successfully connects an instance, THE System SHALL display a message "¡Conectado exitosamente al Asistente de IA de ACO!".
2. THE System SHALL display information text "Tu asistente de IA está activo y responderá automáticamente a tus clientes en WhatsApp".
3. THE System SHALL display instruction text "Para desactivar el bot, elimina la instancia desde el panel de control".
4. WHEN the information is displayed, THE System SHALL provide a button to return to the dashboard.

### Requirement 7: Remove Unused Features

**User Story:** As a system administrator, I want to remove all messaging and Facebook features, so that the application focuses solely on AI assistant connection management.

#### Acceptance Criteria

1. THE System SHALL remove all message sending functionality from the WhatsApp scanner component.
2. THE System SHALL remove all recipient management features.
3. THE System SHALL remove all group management features and routes.
4. THE System SHALL remove all Facebook-related pages, components, and routes.
5. THE System SHALL remove all message interval configuration features.
6. THE System SHALL remove the message history display from the dashboard.
7. THE System SHALL remove all statistics related to message sending.
8. THE System SHALL maintain only authentication, instance creation, QR scanning, and instance list display features.
