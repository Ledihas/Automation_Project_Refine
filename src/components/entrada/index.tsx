import type { RefineThemedLayoutHeaderProps } from "@refinedev/antd";
import { useGetIdentity } from "@refinedev/core";
import {
  Card,
  Row,
  Col,
  Typography,
  theme,
  List,
  Statistic,
  Timeline,
  Tag,
  Tooltip,
} from "antd";
import React, { useEffect, useState } from "react";
import { account, appwriteClient } from "../../utility/appwriteClient";
import { Databases, Query } from "appwrite";

const { Title, Text, Paragraph } = Typography;
const { useToken } = theme;

interface Message {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  $collectionId: string;
  $databaseId: string;
  text: string;
  instance_name: string;
  user: string;
}

interface Stats {
  totalMessages: number;
  instanceStats: { [key: string]: number };
  weeklyActivity: { date: string; count: number }[];
}

export const Entrada: React.FC<RefineThemedLayoutHeaderProps> = () => {
    const { token } = useToken();
    const { data: user } = useGetIdentity();
    const [recentMessages, setRecentMessages] = useState<Message[]>([]);
    const [stats, setStats] = useState<Stats>({
      totalMessages: 0,
      instanceStats: {},
      weeklyActivity: []
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const fetchData = async () => {
        try {
          setIsLoading(true);
          const databases = new Databases(appwriteClient);
          const thisuser = await account.get();

          // Obtener los últimos 5 mensajes
          const messagesResponse = await databases.listDocuments(
            '68e04a01000dcda6e6cb',
            'old_messajes',
            [
              Query.equal('user', thisuser.$id),
              Query.orderDesc('$createdAt'),
              Query.limit(5)
            ]
          );

          // Obtener estadísticas
          const allMessagesResponse = await databases.listDocuments(
            '68e04a01000dcda6e6cb',
            'old_messajes',
            [Query.equal('user', thisuser.$id)]
          );

          // Procesar estadísticas
          const instanceCount: { [key: string]: number } = {};
          const weeklyData: { [key: string]: number } = {};
          
          allMessagesResponse.documents.forEach(doc => {
            // Contar por instancia
            instanceCount[doc.instance_name] = (instanceCount[doc.instance_name] || 0) + 1;
            
            // Agrupar por fecha
            const date = new Date(doc.$createdAt).toISOString().split('T')[0];
            weeklyData[date] = (weeklyData[date] || 0) + 1;
          });

          setRecentMessages(messagesResponse.documents as Message[]);
          setStats({
            totalMessages: allMessagesResponse.documents.length,
            instanceStats: instanceCount,
            weeklyActivity: Object.entries(weeklyData)
              .map(([date, count]) => ({ date, count }))
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 7)
          });

        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setIsLoading(false);
        }
      };

      if (user) {
        fetchData();
      }
    }, [user]);

    return (
        <section style={{
            padding: "24px",
            width: "100%",
            backgroundColor: token.colorBgContainer,
            minHeight: "calc(100vh - 64px)"
        }}>
            <Row gutter={[24, 24]}>
                <Col span={24}>
                    <Title level={2} style={{ marginBottom: 24 }}>
                        Bienvenido, {user?.name} 👋
                    </Title>
                </Col>

                {/* Tarjetas de estadísticas */}
                <Col xs={24} sm={12} md={6}>
                    <Card loading={isLoading}>
                        <Statistic
                            title="Total de Mensajes Enviados"
                            value={stats.totalMessages}
                            suffix="mensajes"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card loading={isLoading}>
                        <Statistic
                            title="Instancias Activas"
                            value={Object.keys(stats.instanceStats).length}
                            suffix="instancias"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card loading={isLoading}>
                        <Statistic
                            title="Mensajes esta Semana"
                            value={stats.weeklyActivity.reduce((acc, curr) => acc + curr.count, 0)}
                            suffix="mensajes"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card loading={isLoading}>
                        <Statistic
                            title="Promedio Diario"
                            value={stats.weeklyActivity.length > 0 
                              ? Math.round(stats.weeklyActivity.reduce((acc, curr) => acc + curr.count, 0) / stats.weeklyActivity.length) 
                              : 0}
                            suffix="msgs/día"
                        />
                    </Card>
                </Col>

                {/* Últimos mensajes enviados */}
                <Col span={24} md={16}>
                    <Card 
                        title="Últimos Mensajes Enviados" 
                        loading={isLoading}
                    >
                        <List
                            dataSource={recentMessages}
                            renderItem={(message) => (
                                <List.Item>
                                    <List.Item.Meta
                                        title={
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Text strong>{message.instance_name}</Text>
                                                <Text type="secondary">
                                                    {new Date(message.$createdAt).toLocaleString()}
                                                </Text>
                                            </div>
                                        }
                                        description={message.text}
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>

                {/* Actividad por Instancia */}
                <Col span={24} md={8}>
                    <Card 
                        title="Actividad por Instancia" 
                        loading={isLoading}
                    >
                        <Timeline
                            items={Object.entries(stats.instanceStats).map(([instance, count]) => ({
                                children: (
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Text>{instance}</Text>
                                        <Tag color="blue">{count} mensajes</Tag>
                                    </div>
                                )
                            }))}
                        />
                    </Card>
                </Col>

                {/* Actividad Semanal */}
                <Col span={24}>
                    <Card 
                        title="Actividad Semanal" 
                        loading={isLoading}
                    >
                        <Row gutter={[8, 8]} style={{ marginTop: 16 }}>
                            {stats.weeklyActivity.map(({ date, count }) => (
                                <Col key={date}>
                                    <Tooltip title={`${count} mensajes el ${new Date(date).toLocaleDateString()}`}>
                                        <Card size="small" style={{ textAlign: 'center' }}>
                                            <Statistic
                                                title={new Date(date).toLocaleDateString('es', { weekday: 'short' })}
                                                value={count}
                                                valueStyle={{ fontSize: '1.2em' }}
                                            />
                                        </Card>
                                    </Tooltip>
                                </Col>
                            ))}
                        </Row>
                    </Card>
                </Col>
            </Row>
        </section>
    );
}
