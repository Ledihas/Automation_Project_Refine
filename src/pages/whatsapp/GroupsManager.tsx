import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { account, appwriteClient } from "../../utility/appwriteClient";
import { Databases, ID } from "appwrite";

const API_KEY = import.meta.env.VITE_API_KEY || "BQYHJGJHJ"; 

interface GroupResult {
  link: string;
  groupName?: string;
  owner?: string;
  isMember?: string;
  canJoin?: string;
  success?: string;
  status?: string;
  error?: string;
}

interface RegisteredGroup {
  id: string;
  subject: string;
  size: number;
  owner: string;
  desc?: string;
  pictureUrl?: string;
  isSelected?: boolean;
  announce: boolean;
  isCommunity: boolean;
  isCommunityAnnounce: boolean;
  restrict: boolean;
}

export const GroupsManager = () => {
  const { instanceName } = useParams();
  const navigate = useNavigate();
  const [groupLinks, setGroupLinks] = useState<string[]>([]);
  const [results, setResults] = useState<GroupResult[]>([]);
  const [messages, setMessages] = useState<string[]>(['']);
  const [isSending, setIsSending] = useState(false);
  const [sendingStatus, setSendingStatus] = useState('');
  const [registeredGroups, setRegisteredGroups] = useState<RegisteredGroup[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [loadingError, setLoadingError] = useState('');
  const [messageInterval, setMessageInterval] = useState(5);
  const extractInviteCode = (link: string) => {
    const match = link.match(/chat\.whatsapp\.com\/([A-Za-z0-9]+)/);
    return match ? match[1] : null;
  };

  // ✅ Agregar enlace a la lista
  const addGroupLink = (link: string) => {
    if (!link.trim()) return;
    if (groupLinks.includes(link.trim())) return; // Evitar duplicados
    setGroupLinks((prev) => [...prev, link.trim()]);
  };
  
  // ✅ Entrar a todos los enlaces
  // ✅ Añadir mensaje a la lista
  const addMessage = () => {
    setMessages(prev => [...prev, '']);
  };

  // ✅ Actualizar mensaje específico
  const updateMessage = (index: number, value: string) => {
    const newMessages = [...messages];
    newMessages[index] = value;
    setMessages(newMessages);
  };

  // ✅ Eliminar mensaje específico
  const removeMessage = (index: number) => {
    if (messages.length > 1) {
      setMessages(messages.filter((_, i) => i !== index));
    }
  };

  // Guardar mensajes en Appwrite
  const saveMessagesToAppwrite = async (messagesToSave: string[]) => {
    if (!messagesToSave || !Array.isArray(messagesToSave) || messagesToSave.length === 0) {
      console.error('No hay mensajes válidos para guardar');
      return;
    }

    try {
      const thisuser = await account.get();
      console.log('Usuario obtenido:', thisuser);
      
      const databases = new Databases(appwriteClient);
      console.log('Intentando guardar mensajes en Appwrite...');

      const savePromises = messagesToSave.map(text => 
        databases.createDocument(
          '68e04a01000dcda6e6cb', 
          'old_messajes',
          ID.unique(),
          {
            text,
            instance_name: instanceName || '',
            user: thisuser.$id
          }
        )
      );

      const results = await Promise.all(savePromises.map(p => 
        p.catch(error => {
          console.error('Error al guardar mensaje:', error);
          return null;
        })
      ));

      const successfulSaves = results.filter(result => result !== null);
      console.log(`Guardados ${successfulSaves.length} de ${messagesToSave.length} mensajes`);
      
      if (successfulSaves.length === 0) {
        throw new Error('No se pudo guardar ningún mensaje');
      }
      
      console.log('Proceso de guardado completado');
    } catch (error) {
      console.error('Error en saveMessagesToAppwrite:', error);
      throw error;
    }
  };

  // ✅ Enviar mensajes a los grupos seleccionados

  const fetchRegisteredGroups = useCallback(async () => {
    setIsLoadingGroups(true);
    setLoadingError('');

    try {
      const response = await fetch(
        'http://45.61.157.201:5678/webhook/registered-groups',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': API_KEY
          },
          body: JSON.stringify({
            instanceName
          })
        }
      );

      if (!response.ok) {
        throw new Error('Error al obtener los grupos registrados');
      }

      const responseData = await response.json();
      
      if (!responseData.success || !Array.isArray(responseData.data)) {
        throw new Error('Formato de respuesta inválido');
      }

      setRegisteredGroups(responseData.data.map((group: RegisteredGroup) => ({
        ...group,
        isSelected: false
      })));
    } catch (error) {
      setLoadingError('❌ Error al cargar los grupos registrados');
      console.error('Error:', error);
    } finally {
      setIsLoadingGroups(false);
    }
  }, [instanceName]);

  // Cargar grupos al montar el componente
  useEffect(() => {
    fetchRegisteredGroups();
  }, [fetchRegisteredGroups]);

  // Función para manejar la selección de grupos
  const toggleGroupSelection = (groupId: string) => {
    setRegisteredGroups(prev => 
      prev.map(group => 
        group.id === groupId 
          ? { ...group, isSelected: !group.isSelected }
          : group
      )
    );
  };

  // Modificar la función sendToAllGroups para usar solo los grupos seleccionados
  const sendToSelectedGroups = async () => {
    if (messages.some(msg => !msg.trim())) {
      alert('Por favor, complete todos los mensajes antes de enviar');
      return;
    }

    const selectedGroups = registeredGroups.filter(group => group.isSelected);
    if (selectedGroups.length === 0) {
      alert('Por favor, seleccione al menos un grupo para enviar mensajes');
      return;
    }

    setIsSending(true);
    setSendingStatus('Enviando mensajes a grupos seleccionados...');

    try {
      const response = await fetch(
        'http://45.61.157.201:5678/webhook/whatsappsms',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': API_KEY
          },
          body: JSON.stringify({
            messages: messages.filter(msg => msg.trim()),
            recipients: selectedGroups.map(group => group.id),
            instanceName,
            sendToGroups: true,
            messageInterval
          })
        }
      );

      if (!response.ok) {
        throw new Error('Error al enviar los mensajes');
      }

      const data = await response.json();
      if (data.status === 'ok' || data.success) {
        await saveMessagesToAppwrite(messages.filter(msg => msg.trim()));
        setSendingStatus('✅ Mensajes enviados exitosamente a los grupos seleccionados');
      } else {
        setSendingStatus('❌ Error al enviar algunos mensajes');
      }
    } catch (error) {
      setSendingStatus('❌ ' + (error instanceof Error ? error.message : 'Error al enviar los mensajes'));
      console.error('Error:', error);
    } finally {
      setIsSending(false);
    }
  };

  const sendToAllGroups = async () => {
    if (messages.some(msg => !msg.trim())) {
      alert('Por favor, complete todos los mensajes antes de enviar');
      return;
    }

    setIsSending(true);
    setSendingStatus('Enviando mensajes a todos los grupos...');

    try {
      const response = await fetch(
        'http://45.61.157.201:5678/webhook/allgroups',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': API_KEY
          },
          body: JSON.stringify({
            messages: messages.filter(msg => msg.trim()),
            instanceName,
            messageInterval
          })
        }
      );

      if (!response.ok) {
        throw new Error('Error al enviar los mensajes');
      }

      const data = await response.json();
      if (data.status === 'ok' || data.success) {
        await saveMessagesToAppwrite(messages.filter(msg => msg.trim()));
        setSendingStatus('✅ Mensajes enviados exitosamente a todos los grupos');
      } else {
        setSendingStatus('❌ Error al enviar algunos mensajes');
      }
    } catch (error) {
      setSendingStatus('❌ ' + (error instanceof Error ? error.message : 'Error al enviar los mensajes'));
      console.error('Error:', error);
    } finally {
      setIsSending(false);
    }
  };

  const joinGroups = async () => {
    const responses = await Promise.all(
      groupLinks.map(async (link) => {
        const code = extractInviteCode(link);
        if (!code) return { link, status: "❌ Enlace inválido" };

        const requestBody = {
          inviteCode: code,
          instanceName: instanceName,
        };
        
        try {
          const res = await fetch(
            `http://45.61.157.201:5678/webhook/groups`,
            {
              method: "POST",
              headers: { 
                'apikey': API_KEY,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(requestBody),
            }
          );

          // Si EvolutionAPI responde con error (404, 500, etc.)
          if (!res.ok) {
            return { link, status: "❌ No fué posible unirse al grupo" };
          }

          const data = await res.json();

          return {
            link,
           // groupName: data?.groupName || "Desconocido",
           // owner: data?.ownerJid || "N/A",
          //  isMember: data?.isMember ? "✅ Sí" : "❌ No",
           // canJoin: !data?.isMember ? "✅ Sí" : "❌ No",
           success: data?.success ? "✅ Sí" : "❌ No",
          };
        } catch (err) {
          return { link, status: "⚠️ Error al verificar", err };
        }
      })
    );

    setResults(responses);
  };

  return (
    <div style={{ 
      padding: "20px", 
      backgroundColor: "#110a0aff", 
      color: "white",
      borderRadius: "8px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px"
      }}>
        <h2 style={{ 
          color: "#4CAF50",
          margin: 0
        }}>
          Gestión de Grupos - {instanceName}
        </h2>

        <button
          onClick={() => navigate('/whatsapp')}
          style={{
            backgroundColor: "#2c2c2c",
            padding: "8px 16px",
            borderRadius: "4px",
            border: "none",
            color: "white",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "background-color 0.3s"
          }}
        >
          <span style={{ fontSize: "18px" }}>←</span>
          Volver a WhatsApp
        </button>
      </div>

      <div style={{ 
        display: "flex", 
        gap: "10px", 
        marginBottom: "20px"
      }}>
        <input
          style={{
            padding: "8px 12px",
            borderRadius: "4px",
            border: "1px solid #2c2c2c",
            backgroundColor: "#1a1a1a",
            color: "white",
            flex: 1
          }}
          type="text"
          placeholder="Pega un enlace de grupo y Enter"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              addGroupLink(e.currentTarget.value);
              e.currentTarget.value = "";
            }
          }}
        />
        <button
          style={{ 
            backgroundColor: "rgba(2, 44, 15, 0.87)",
            padding: "8px 16px",
            borderRadius: "4px",
            border: "none",
            color: "white",
            cursor: "pointer",
            transition: "background-color 0.3s"
          }}
          onClick={() => {
            const value = prompt("Pegue el enlace del grupo:");
            if (value) addGroupLink(value);
          }}
        >
          Agregar
        </button>
      </div>

      {/* Mostrar links */}
      <ul style={{
        listStyle: "none",
        padding: "0",
        margin: "20px 0",
        backgroundColor: "#1a1a1a",
        borderRadius: "4px"
      }}>
        {groupLinks.map((g, i) => (
          <li key={i} style={{
            padding: "10px",
            borderBottom: i < groupLinks.length - 1 ? "1px solid #2c2c2c" : "none"
          }}>
            {g}
          </li>
        ))}
      </ul>
        {/* Entrar a Grupos */}
      <button
        style={{ 
          backgroundColor: "rgba(1, 26, 14, 0.87)",
          padding: "10px 20px",
          borderRadius: "4px",
          border: "none",
          color: "white",
          cursor: "pointer",
          marginBottom: "20px",
          transition: "background-color 0.3s",
          width: "100%",
          fontSize: "16px"
        }}
        onClick={joinGroups}
      >
        Entrar a Grupos
      </button>
        <p style={{ 
        color: "#9e9e9e", 
        marginBottom: "20px",
        fontSize: "14px",
        textAlign: "center"
      }}>
        Al presionar este botón, la instancia {instanceName} intentará unirse a todos los grupos 
        de la lista usando los enlaces proporcionados.
      </p>

       {results.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ 
            marginTop: "20px", 
            width: "100%", 
            borderCollapse: "collapse",
            backgroundColor: "#1a1a1a",
            borderRadius: "4px"
          }}>
            <thead>
              <tr style={{ backgroundColor: "rgba(2, 44, 15, 0.87)" }}>
                <th style={tableHeaderStyle}>Link</th>
                <th style={tableHeaderStyle}>Grupo</th>
                <th style={tableHeaderStyle}>Owner</th>
                <th style={tableHeaderStyle}>¿Es miembro?</th>
                <th style={tableHeaderStyle}>¿Puede unirse?</th>
                <th style={tableHeaderStyle}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, idx) => (
                <tr key={idx} style={{
                  borderBottom: idx < results.length - 1 ? "1px solid #2c2c2c" : "none"
                }}>
                  <td style={tableCellStyle}>{r.link}</td>
                  <td style={tableCellStyle}>{r.groupName || "-"}</td>
                  <td style={tableCellStyle}>{r.owner || "-"}</td>
                  <td style={tableCellStyle}>{r.isMember || "-"}</td>
                  <td style={tableCellStyle}>{r.canJoin || "-"}</td>
                  <td style={tableCellStyle}>{r.status || "✅ Verificado"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Sección de Grupos Registrados */}
      <div style={{
        backgroundColor: "#1a1a1a",
        padding: "20px",
        borderRadius: "4px",
        marginBottom: "20px"
      }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          marginBottom: "15px"
        }}>
          <h3 style={{ color: "#4CAF50", margin: 0 }}>Grupos Registrados</h3>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              style={{
                backgroundColor: "#2196F3",
                padding: "8px 16px",
                borderRadius: "4px",
                border: "none",
                color: "white",
                cursor: "pointer",
                fontSize: "14px"
              }}
              onClick={() => {
                setRegisteredGroups(prev => 
                  prev.map(group => ({ ...group, isSelected: true }))
                );
              }}
            >
              Seleccionar Todos
            </button>
            <button
              style={{
                backgroundColor: "#607D8B",
                padding: "8px 16px",
                borderRadius: "4px",
                border: "none",
                color: "white",
                cursor: "pointer",
                fontSize: "14px"
              }}
              onClick={() => {
                setRegisteredGroups(prev => 
                  prev.map(group => ({ ...group, isSelected: false }))
                );
              }}
            >
              Desmarcar Todos
            </button>
            <button
              style={{
                backgroundColor: "#4CAF50",
                padding: "8px 16px",
                borderRadius: "4px",
                border: "none",
                color: "white",
                cursor: "pointer"
              }}
              onClick={fetchRegisteredGroups}
              disabled={isLoadingGroups}
            >
              {isLoadingGroups ? "Cargando..." : "🔄 Actualizar Grupos"}
            </button>
          </div>
        </div>

        {(loadingError || isLoadingGroups) && (
          <div style={{
            padding: "15px",
            borderRadius: "4px",
            backgroundColor: loadingError ? "rgba(229, 57, 53, 0.1)" : "rgba(76, 175, 80, 0.1)",
            color: loadingError ? "#e53935" : "#4CAF50",
            marginBottom: "15px"
          }}>
            {loadingError || "Cargando grupos..."}
          </div>
        )}

        <div style={{
          maxHeight: "300px",
          overflowY: "auto",
          backgroundColor: "#110a0a",
          borderRadius: "4px",
          border: "1px solid #2c2c2c"
        }}>
          {registeredGroups.length === 0 ? (
            <p style={{ 
              padding: "20px", 
              textAlign: "center",
              color: "#9e9e9e"
            }}>
              {isLoadingGroups 
                ? "Cargando grupos..."
                : "No hay grupos registrados o aún no se han cargado. Haga clic en 'Actualizar Grupos'"}
            </p>
          ) : (
            registeredGroups.map(group => (
              <div
                key={group.id}
                style={{
                  padding: "12px",
                  borderBottom: "1px solid #2c2c2c",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  cursor: "pointer",
                  backgroundColor: group.isSelected ? "rgba(76, 175, 80, 0.1)" : "transparent",
                  transition: "background-color 0.2s"
                }}
                onClick={() => toggleGroupSelection(group.id)}
              >
                <input
                  type="checkbox"
                  checked={group.isSelected}
                  onChange={() => toggleGroupSelection(group.id)}
                  style={{ cursor: "pointer" }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "bold" }}>{group.subject}</div>
                  <div style={{ 
                    fontSize: "0.9em", 
                    color: "#9e9e9e",
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap"
                  }}>
                    <span>👥 {group.size} miembros</span>
                    {group.isCommunity && (
                      <span title="Es una comunidad">🏘️ Comunidad</span>
                    )}
                    {group.announce && (
                      <span title="Solo admins pueden enviar mensajes">🔒 Solo admins</span>
                    )}
                    {group.restrict && (
                      <span title="Grupo restringido">⚠️ Restringido</span>
                    )}
                    {group.isCommunityAnnounce && (
                      <span title="Anuncios de comunidad activados">📢 Anuncios</span>
                    )}
                    {group.desc && (
                      <span title={group.desc}>📝 Descripción</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Sección de Mensajes */}
      <div style={{
        backgroundColor: "#1a1a1a",
        padding: "20px",
        borderRadius: "4px",
        marginBottom: "20px"
      }}>
        <h3 style={{ color: "#4CAF50", marginBottom: "15px" }}>Mensajes a Enviar a Todos los Grupos</h3>
        <p style={{ 
          color: "#9e9e9e", 
          marginBottom: "15px",
          fontSize: "14px",
          lineHeight: "1.5"
        }}>
          Los mensajes que agregue aquí serán enviados a todos los grupos de WhatsApp 
          donde su instancia {instanceName} sea miembro. Puede agregar múltiples mensajes 
          que se enviarán en secuencia.
        </p>
        {messages.map((message, index) => (
          <div key={index} style={{ 
            display: "flex", 
            gap: "10px", 
            marginBottom: "10px" 
          }}>
            <textarea
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: "4px",
                border: "1px solid #2c2c2c",
                backgroundColor: "#110a0a",
                color: "white",
                minHeight: "60px",
                resize: "vertical"
              }}
              placeholder={`Mensaje ${index + 1}`}
              value={message}
              onChange={(e) => updateMessage(index, e.target.value)}
            />
            <button
              style={{
                padding: "8px",
                borderRadius: "4px",
                border: "none",
                backgroundColor: "#e53935",
                color: "white",
                cursor: "pointer"
              }}
              onClick={() => removeMessage(index)}
              disabled={messages.length === 1}
            >
              ❌
            </button>
          </div>
        ))}
        <button
          style={{
            backgroundColor: "#4CAF50",
            padding: "8px 16px",
            borderRadius: "4px",
            border: "none",
            color: "white",
            cursor: "pointer",
            marginTop: "10px"
          }}
          onClick={addMessage}
        >
          + Añadir Mensaje
        </button>
      </div>

      {/* Botones de Envío */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "10px",
        marginBottom: "20px"
      }}>
        <button
          style={{
            backgroundColor: "#2196F3",
            padding: "12px 24px",
            borderRadius: "4px",
            border: "none",
            color: "white",
            cursor: "pointer",
            fontSize: "16px",
            transition: "background-color 0.3s",
            opacity: isSending ? 0.7 : 1
          }}
          onClick={sendToAllGroups}
          disabled={isSending}
        >
          {isSending ? "Enviando..." : "Enviar a Todos los Grupos"}
        </button>
        
        <button
          style={{
            backgroundColor: "#4CAF50",
            padding: "12px 24px",
            borderRadius: "4px",
            border: "none",
            color: "white",
            cursor: "pointer",
            fontSize: "16px",
            transition: "background-color 0.3s",
            opacity: isSending ? 0.7 : 1
          }}
          onClick={sendToSelectedGroups}
          disabled={isSending}
        >
          {isSending ? "Enviando..." : "Enviar a Grupos Seleccionados"}
        </button>
      </div>

      {/* Configuración de Intervalo */}
      <div style={{
        backgroundColor: "#1a1a1a",
        padding: "15px",
        borderRadius: "4px",
        marginBottom: "20px"
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "10px"
        }}>
          <label style={{ color: "#4CAF50" }}>
            Intervalo entre mensajes:
          </label>
          <input
            type="number"
            min="1"
            max="60"
            value={messageInterval}
            onChange={(e) => setMessageInterval(Math.max(1, Math.min(60, parseInt(e.target.value) || 1)))}
            style={{
              width: "60px",
              padding: "4px 8px",
              backgroundColor: "#2c2c2c",
              border: "1px solid #4CAF50",
              borderRadius: "4px",
              color: "white"
            }}
          />
          <span style={{ color: "#9e9e9e" }}>segundos</span>
        </div>
      </div>

      {(sendingStatus || isSending) && (
        <div style={{
          padding: "15px",
          borderRadius: "4px",
          backgroundColor: sendingStatus.includes('✅') ? "rgba(76, 175, 80, 0.1)" : "rgba(229, 57, 53, 0.1)",
          color: sendingStatus.includes('✅') ? "#4CAF50" : "#e53935",
          marginBottom: "20px",
          textAlign: "center"
        }}>
          {sendingStatus || "Enviando mensajes..."}
        </div>
      )}

      
      

      {/* Resultados */}
     
    </div>
  );
};

// Estilos para la tabla
const tableHeaderStyle = {
  padding: "12px",
  textAlign: "left" as const,
  color: "white",
  fontWeight: "bold"
};

const tableCellStyle = {
  padding: "12px",
  color: "white"
};

export default GroupsManager;
